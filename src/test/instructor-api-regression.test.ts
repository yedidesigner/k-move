import { beforeEach, describe, expect, it, vi } from "vitest";
import { latestPublications, listContentPublications, listSubmissionAssets, listAssignmentTargets, type ContentPublication } from "@/lib/instructor-api";

const queryState = vi.hoisted(() => ({
  pages: [] as Array<{ data: unknown[] | null; error: { message: string } | null }>,
  calls: [] as Array<{ table: string; order: string[]; filters: Array<[string,string]>; range?: [number,number] }>,
}));
vi.mock("@/lib/supabase", () => ({
  getSupabase: () => ({
    from(table:string) {
      const call: (typeof queryState.calls)[number] = {table, order:[], filters:[]};
      queryState.calls.push(call);
      const chain = {
        select: () => chain,
        order: (column:string) => {call.order.push(column);return chain;},
        eq: (column:string,value:string) => {call.filters.push([column,value]);return chain;},
        range: (start:number,end:number) => {call.range=[start,end];return Promise.resolve(queryState.pages.shift() ?? {data:[],error:null});},
      };
      return chain;
    },
  }),
}));

function publication(version:number, at:string, overrides:Partial<ContentPublication>={}):ContentPublication {
  return {id:`publication-${version}`,kind:"glossary",content_key:"cta",document:{definition:`v${version}`},hidden:false,version,published_at:at,created_at:"2026-11-01T00:00:00Z",created_by:"instructor",cancelled_at:null,...overrides};
}

beforeEach(()=>{queryState.pages=[];queryState.calls=[];});

describe("Published content revisions",()=>{
  it("keeps an immediate correction after an older scheduled revision becomes effective",()=>{
    const oldScheduled=publication(2,"2026-11-03T00:00:00Z");
    const corrected=publication(3,"2026-11-02T00:00:00Z");
    expect(latestPublications([corrected,oldScheduled],new Date("2026-11-04T00:00:00Z"))).toEqual([corrected]);
  });
  it("does not release a newer scheduled version before its effective time",()=>{
    const current=publication(3,"2026-11-02T00:00:00Z");
    const next=publication(4,"2026-11-05T00:00:00Z");
    expect(latestPublications([current,next],new Date("2026-11-04T00:00:00Z"))).toEqual([current]);
    expect(latestPublications([current,next],new Date("2026-11-05T00:00:00Z"))).toEqual([next]);
  });
  it("preserves a hidden tombstone instead of falling back to older visible content",()=>{
    const visible=publication(1,"2026-11-01T00:00:00Z");
    const hidden=publication(2,"2026-11-02T00:00:00Z",{hidden:true});
    expect(latestPublications([visible,hidden],new Date("2026-11-03T00:00:00Z"))).toEqual([hidden]);
  });
  it("excludes cancelled scheduled versions and keeps distinct content kinds",()=>{
    const current=publication(1,"2026-11-01T00:00:00Z");
    const cancelled=publication(2,"2026-11-02T00:00:00Z",{cancelled_at:"2026-11-01T12:00:00Z"});
    const guide=publication(1,"2026-11-01T00:00:00Z",{id:"guide-1",kind:"guide"});
    expect(latestPublications([current,cancelled,guide],new Date("2026-11-03T00:00:00Z"))).toEqual([current,guide]);
  });
});

describe("Complete instructor data reads",()=>{
  it("reads submission assets past the provider's single-response limit",async()=>{
    const assets=Array.from({length:1205},(_,i)=>({id:`asset-${i}`}));
    queryState.pages=[{data:assets.slice(0,500),error:null},{data:assets.slice(500,1000),error:null},{data:assets.slice(1000),error:null}];
    expect(await listSubmissionAssets()).toEqual(assets);
    expect(queryState.calls.map(call=>call.range)).toEqual([[0,499],[500,999],[1000,1499]]);
    expect(queryState.calls.every(call=>call.order.join(",")==="id")).toBe(true);
  });
  it("uses deterministic composite keys and repeats content filters on each page",async()=>{
    queryState.pages=[{data:[],error:null}];
    await listAssignmentTargets();
    expect(queryState.calls[0]?.order).toEqual(["created_at","assignment_id","user_id"]);
    queryState.pages=[{data:Array.from({length:500},(_,i)=>({id:`p-${i}`})),error:null},{data:[],error:null}];
    await listContentPublications("glossary");
    for(const call of queryState.calls.slice(1)){
      expect(call.order).toEqual(["published_at","id"]);
      expect(call.filters).toEqual([["kind","glossary"]]);
    }
  });
  it("rejects a later-page failure instead of displaying incomplete counts",async()=>{
    queryState.pages=[{data:Array.from({length:500},(_,i)=>({id:`asset-${i}`})),error:null},{data:null,error:{message:"connection interrupted"}}];
    await expect(listSubmissionAssets()).rejects.toThrow("connection interrupted");
  });
});
