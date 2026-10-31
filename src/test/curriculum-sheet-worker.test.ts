import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import vm from "node:vm";
import { describe, expect, it, vi } from "vitest";

const source = readFileSync(resolve(process.cwd(), "public/integrations/kmove-curriculum-sync.gs"), "utf8");
const spreadsheetId = "1Hv7dvSg_R98DM8_VlCCg7ckYRoopmSFlAQ8z_g5Cds0";
const cells = (label: string) => Array.from({ length: 9 }, (_, index) => `${label}-${index}`);
const job = () => ({
  session_key: "S01", session_number: 1, source_version: 3,
  lease_id: "12345678-1234-1234-1234-123456789abc",
  lease_expires_at: new Date(Date.now() + 600_000).toISOString(),
  baseline_cells: cells("baseline"), desired_cells: cells("desired"),
});

function harness(options: { values?: unknown[]; formulas?: string[]; labels?: string[] } = {}) {
  let values = options.values ?? cells("baseline");
  let formulas = options.formulas ?? Array(9).fill("");
  let labels = options.labels ?? ["회차", "1회차", "2회차"];
  const writes: unknown[][] = [];
  const rpc = vi.fn<(name: string, body: Record<string, unknown>) => unknown>((name, body) => {
    if (name === "kmove_sheet_check_lease") return true;
    if (name === "kmove_sheet_ack") return { accepted: true, status: body["p_result"] };
    if (name === "kmove_sheet_pull") return { spreadsheet_id: spreadsheetId, sheet_id: 2001, jobs: [] };
    throw new Error("Unexpected RPC");
  });
  const range = {
    getValues: vi.fn(() => [values.slice()]), getFormulas: vi.fn(() => [formulas.slice()]),
    setRichTextValues: vi.fn((rows: Array<Array<{ text: string }>>) => {
      writes.push(rows[0]!); values = rows[0]!.map((value) => value.text); formulas = Array(9).fill("");
    }),
  };
  const sheet = {
    getLastRow: () => labels.length, getSheetId: () => 2001,
    getRange: vi.fn((_row: number, column: number) => column === 1 ? { getValues: () => labels.map((value) => [value, value === '회차' || value === '주차' ? '구분(사이클)' : '']) } : range),
  };
  const properties = new Map<string, string>();
  const propertyStore = {
    getProperty: (key: string) => properties.get(key) ?? null,
    setProperty: (key: string, value: string) => properties.set(key, value),
    setProperties: (entries: Record<string, string>) => Object.entries(entries).forEach(([key, value]) => properties.set(key, value)),
  };
  const context = vm.createContext({
    SpreadsheetApp: {
      getActiveSpreadsheet: () => ({ getId: () => spreadsheetId, getSheets: () => [sheet] }),
      newRichTextValue: () => ({ setText: (text: string) => ({ build: () => ({ text }) }) }),
      flush: vi.fn(),
    },
    PropertiesService: { getUserProperties: () => propertyStore },
    LockService: { getScriptLock: () => ({ tryLock: () => true, releaseLock: vi.fn() }) },
  });
  vm.runInContext(source, context);
  context["kmoveRpc_"] = rpc;
  const pure = vm.runInContext("KMoveSyncPure", context);
  return {
    context, pure, rpc, range, sheet, writes, properties,
    process: (task = job()) => context["kmoveProcessJob_"](sheet, task, "a".repeat(96)),
    changeValues: (next: unknown[]) => { values = next; },
    changeFormulas: (next: string[]) => { formulas = next; },
    changeLabels: (next: string[]) => { labels = next; },
  };
}

describe("Apps Script curriculum worker", () => {
  it("finds stable session labels after rows move and records duplicate labels", () => {
    const { pure } = harness();
    const result = pure.rows(["회차", "24주차", "메모", " 1회차 ", "01 주차", "25회차", "1회차 메모"]);
    expect(result.rows).toEqual({ S24: 2, S01: 4 });
    expect(result.duplicates).toEqual({ S01: true });
  });

  it("ignores overview labels above the unique curriculum header and keeps real Sheet row numbers", () => {
    const { pure } = harness();
    const overview = Array.from({ length: 11 }, () => ["", ""]);
    overview[6] = ["1회차", "OT 및 개별 상담"];
    const table = [...overview, ["회차", " 구분 (사이클) "], ...Array.from({ length: 24 }, (_, i) => [`${i + 1}회차`, "수업"] )];
    const result = pure.tableRows(table);
    expect(result.rows["S01"]).toBe(13);
    expect(result.rows["S24"]).toBe(36);
    expect(result.duplicates).toEqual({});
    const moved = pure.tableRows([["상단 메모", ""], ...table]);
    expect(moved.rows["S01"]).toBe(14);
    expect(() => pure.tableRows([...table, ["주차", "구분(사이클)"]])).toThrow("invalid_sheet");
    expect(() => pure.tableRows([["1회차", "헤더 없음"]])).toThrow("invalid_sheet");
  });

  it("rejects another spreadsheet, sheet, duplicate jobs, and malformed payloads before processing", () => {
    const { pure } = harness();
    const envelope = { spreadsheet_id: spreadsheetId, sheet_id: 2001, jobs: [job()] };
    expect(pure.envelope(envelope)).toHaveLength(1);
    expect(() => pure.envelope({ ...envelope, spreadsheet_id: "another" })).toThrow("invalid_schema");
    expect(() => pure.envelope({ ...envelope, sheet_id: 0 })).toThrow("invalid_schema");
    expect(() => pure.envelope({ ...envelope, jobs: [job(), job()] })).toThrow("invalid_schema");
    expect(() => pure.envelope({ ...envelope, jobs: [{ ...job(), desired_cells: ["short"] }] })).toThrow("invalid_schema");
    expect(() => pure.envelope({ ...envelope, jobs: [{ ...job(), source_version: -1 }] })).toThrow("invalid_schema");
  });

  it("writes only B:J as literal rich text and acknowledges read-back values", () => {
    const env = harness();
    const task = job(); task.desired_cells[0] = '=IMPORTXML("https://example.invalid")';
    expect(env.process(task)).toBe("synced");
    expect(env.range.setRichTextValues).toHaveBeenCalledOnce();
    expect(env.sheet.getRange).toHaveBeenCalledWith(2, 2, 1, 9);
    expect(env.rpc).toHaveBeenLastCalledWith("kmove_sheet_ack", expect.objectContaining({
      p_result: "synced", p_observed_cells: task.desired_cells, p_source_version: 3,
    }));
  });

  it("retries a lost acknowledgement without writing the already-applied version again", () => {
    const env = harness({ values: cells("desired") });
    expect(env.process()).toBe("synced");
    expect(env.writes).toHaveLength(0);
    expect(env.rpc).toHaveBeenLastCalledWith("kmove_sheet_ack", expect.objectContaining({ p_result: "synced" }));
  });

  it("preserves an external Sheet edit and reports a conflict with its observed cells", () => {
    const env = harness({ values: cells("external") });
    expect(env.process()).toBe("conflict");
    expect(env.writes).toHaveLength(0);
    expect(env.rpc).toHaveBeenCalledWith("kmove_sheet_ack", expect.objectContaining({
      p_result: "conflict", p_observed_cells: cells("external"),
    }));
  });

  it("rejects formulas even when their displayed result is a number", () => {
    const env = harness({ values: [42, ...cells("baseline").slice(1)], formulas: ["=SUM(40,2)", ...Array(8).fill("")] });
    expect(env.process()).toBe("formula_present");
    expect(env.writes).toHaveLength(0);
    expect(env.rpc).toHaveBeenLastCalledWith("kmove_sheet_ack", expect.objectContaining({ p_error_code: "formula_present" }));
  });

  it("detects a user edit made while checking the lease", () => {
    const env = harness();
    env.rpc.mockImplementation((name, body) => {
      if (name === "kmove_sheet_check_lease") { env.changeValues(cells("changed-during-check")); return true; }
      return { accepted: true, status: body["p_result"] };
    });
    expect(env.process()).toBe("conflict");
    expect(env.writes).toHaveLength(0);
  });

  it("does not write a relocated row or duplicate session", () => {
    const env = harness();
    env.rpc.mockImplementation((name, body) => {
      if (name === "kmove_sheet_check_lease") { env.changeLabels(["회차", "2회차", "1회차"]); return true; }
      return { accepted: true, status: body["p_result"] };
    });
    expect(env.process()).toBe("target_missing");
    expect(env.writes).toHaveLength(0);
    const duplicate = harness({ labels: ["회차", "1회차", "1주차"] });
    expect(duplicate.process()).toBe("duplicate_session");
    expect(duplicate.writes).toHaveLength(0);
  });

  it("does not write missing, expired, or revoked lease targets", () => {
    const missing = harness({ labels: ["회차", "2회차"] });
    expect(missing.process()).toBe("target_missing");
    const expired = harness();
    expect(expired.process({ ...job(), lease_expires_at: new Date(0).toISOString() })).toBe("lease_expired");
    expect(expired.rpc).not.toHaveBeenCalled();
    const revoked = harness(); revoked.rpc.mockReturnValue(false);
    expect(revoked.process()).toBe("lease_expired");
    expect(revoked.writes).toHaveLength(0);
  });

  it("never marks a mismatched read-back as synced", () => {
    const env = harness();
    env.range.setRichTextValues.mockImplementation(() => { env.changeValues(cells("different")); });
    expect(env.process()).toBe("write_verification_failed");
    expect(env.rpc).toHaveBeenLastCalledWith("kmove_sheet_ack", expect.objectContaining({
      p_result: "error", p_observed_cells: null, p_error_code: "write_verification_failed",
    }));
  });

  it("retains an unresolved lease when acknowledgement transport fails", () => {
    const env = harness();
    env.rpc.mockImplementation((name) => {
      if (name === "kmove_sheet_check_lease") return true;
      throw new Error("transport_error");
    });
    expect(() => env.process()).toThrow("transport_error");
    expect(env.writes).toHaveLength(1);
    // A later poll can see the desired values and only retry the acknowledgement.
    env.rpc.mockImplementation((name, body) => name === "kmove_sheet_check_lease" ? true : { accepted: true, status: body["p_result"] });
    expect(env.process()).toBe("synced");
    expect(env.writes).toHaveLength(1);
  });

  it("backs off transport failures without sleeping or leaking response contents", () => {
    const env = harness();
    env.properties.set("KMOVE_WORKER_KEY", "a".repeat(96));
    env.rpc.mockImplementation(() => { throw new Error("transport_error"); });
    env.context["kmoveRun_"](false);
    expect(env.properties.get("KMOVE_FAILURES")).toBe("1");
    expect(env.properties.get("KMOVE_STATUS")).toBe("transport_error");
    env.context["kmoveRun_"](false);
    expect(env.rpc).toHaveBeenCalledOnce();
    env.context["kmoveRun_"](true);
    expect(env.properties.get("KMOVE_FAILURES")).toBe("2");
    expect(Number(env.properties.get("KMOVE_NEXT_RUN"))).toBeGreaterThan(Date.now() + 110_000);
  });

  it("uses only the public gateway key and does not request Google tokens or broad scopes", () => {
    expect(source).not.toMatch(/getOAuthToken|openById|Logger\.|console\.|Bearer /);
    expect(source).toContain("followRedirects: false");
    const manifest = JSON.parse(readFileSync(resolve(process.cwd(), "public/integrations/appsscript.json"), "utf8"));
    expect(manifest.oauthScopes).toEqual([
      "https://www.googleapis.com/auth/spreadsheets.currentonly",
      "https://www.googleapis.com/auth/script.external_request",
      "https://www.googleapis.com/auth/script.scriptapp",
    ]);
  });
});
