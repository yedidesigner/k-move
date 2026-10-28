import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { FeedbackWorkspace } from "@/components/FeedbackWorkspace";
import { getSupabase } from "@/lib/supabase";
import { useAuth } from "@/lib/auth";

export const Route = createFileRoute("/_app/feedback")({
  head: () => ({ meta: [
    { title: "피드백 | K-Move LMS" },
    { name: "description", content: "수강생 포트폴리오 스크린샷과 위치별 피드백" },
  ] }),
  component: FeedbackPage,
});

type Student = { id:string; name:string; major:string; user_id:string|null };
type Profile = { id:string; username:string; role:string };
const STUDENT_NAMES = [
  "강민주","강유민","김다혜","김선미","김재은","김화민","류영진","오한별",
  "이익제","이주희","이지원","임시윤","정여진","최지인","최형주"
];
const WEEKS = Array.from({length:24},(_,index)=>index+1);
const fallback = STUDENT_NAMES.map(name=>({id:"",name,major:"",user_id:null}));

function FeedbackPage() {
  const {status,user} = useAuth();
  const instructor = status==="instructor";
  const [students,setStudents] = useState<Student[]>([]);
  const [profiles,setProfiles] = useState<Profile[]>([]);
  const [studentName,setStudentName] = useState("강민주");
  const [week,setWeek] = useState(6);
  const [loading,setLoading] = useState(true);
  const [setupError,setSetupError] = useState("");
  const [mappingBusy,setMappingBusy] = useState(false);

  useEffect(()=>{
    if(!user || (status!=="instructor" && status!=="student")) return;
    let active=true;
    setLoading(true);setSetupError("");
    (async()=>{
      try {
        const db=getSupabase();
        const roster=await db.from("kmove_feedback_students")
          .select("id,name,major,user_id").order("name",{ascending:true});
        if(roster.error) throw roster.error;
        const rows=(roster.data||[]) as Student[];
        if(active) {
          setStudents(rows);
          setStudentName(previous=>rows.some(row=>row.name===previous)?previous:(rows[0]?.name||""));
        }
        if(instructor) {
          const profilesResult=await db.from("kmove_profiles")
            .select("id,username,role").eq("role","student").order("username");
          if(profilesResult.error) throw profilesResult.error;
          if(active) setProfiles((profilesResult.data||[]) as Profile[]);
        }
      } catch(e) {
        if(active) {
          setSetupError("피드백 데이터베이스 설정이 필요합니다. K-Move Supabase에서 docs/kmove-feedback-setup.sql을 적용해 주세요. ("+(e instanceof Error?e.message:String(e))+")");
          setStudents(instructor?fallback:[]);
        }
      } finally {if(active) setLoading(false);}
    })();
    return ()=>{active=false;};
  },[user?.id,status,instructor]);

  const selected = instructor
    ? students.find(row => row.name === studentName) || students[0]
    : students.find(row => row.user_id === user?.id) || students[0];

  async function linkAccount(accountId:string) {
    if(!instructor || !selected?.id || mappingBusy) return;
    setMappingBusy(true);setSetupError("");
    try {
      const result=await getSupabase().from("kmove_feedback_students")
        .update({user_id:accountId||null}).eq("id",selected.id).select("id").single();
      if(result.error) throw result.error;
      setStudents(previous=>previous.map(row=>row.id===selected.id?{...row,user_id:accountId||null}:row));
    } catch(e) {
      setSetupError("학생 계정 연결에 실패했습니다: "+(e instanceof Error?e.message:String(e)));
    } finally {setMappingBusy(false);}
  }

  return (
    <div className={`min-h-screen bg-[#101010] px-4 pb-20 pt-6 text-white sm:px-5 md:pb-12 ${instructor ? "md:pt-8" : "md:pt-4"}`}>
      {instructor ? (
        <nav aria-label="수강생 선택" className="flex items-center gap-3 overflow-x-auto pb-2 md:flex-wrap md:overflow-visible md:pb-0">
          {loading ? (
            <span className="text-xs text-neutral-400">수강생 불러오는 중…</span>
          ) : students.map(item => {
            const active = selected?.name === item.name;
            return (
              <button
                key={item.id || item.name}
                type="button"
                aria-pressed={active}
                onClick={() => setStudentName(item.name)}
                className={`flex h-11 min-w-[92px] shrink-0 items-center justify-center rounded-full border border-white px-5 text-xs font-medium transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white ${active ? "bg-white text-black" : "bg-transparent text-white hover:bg-white/10"}`}
              >
                {item.name}
              </button>
            );
          })}
        </nav>
      ) : (
        <h1 className="flex min-h-11 items-center text-[clamp(1.75rem,2.1vw,2.125rem)] font-normal leading-none tracking-[-0.035em] md:ml-5">
          FEEDBACK
        </h1>
      )}
      <section aria-label="주차별 피드백 문서" className="min-w-0">
          <div className={`relative isolate mr-9 ml-0 pt-8 sm:mr-11 md:mr-12 md:ml-6 ${instructor ? "mt-12" : "mt-12 md:mt-[88px]"}`}>
            <div aria-hidden="true" className="pointer-events-none absolute inset-x-6 bottom-3 top-0 border border-[#d9d9d5] bg-[#e0e0dc] sm:left-12 sm:right-6" />
            <div aria-hidden="true" className="pointer-events-none absolute inset-x-3 bottom-1 top-3 border border-[#dededb] bg-[#efefec] sm:left-6 sm:right-3" />
            <div className="relative min-h-[1190px] border border-[#dadad7] bg-white text-[#111] shadow-[0_12px_20px_rgba(0,0,0,0.13)]">
              <div role="group" aria-label="피드백 주차 선택" className="absolute left-full top-11 z-10 flex flex-col">
                {WEEKS.map(number=>(
                  <button key={number} type="button" aria-label={number+"주차 피드백 보기"} aria-pressed={number===week}
                    onClick={()=>setWeek(number)}
                    className={"relative flex h-[46px] w-9 items-center justify-center border-b-[3px] border-[#171717] text-[11px] font-semibold tabular-nums transition-colors sm:w-11 "+(number===week?"z-20 -ml-px bg-white text-black":"bg-[#d2d2d0] text-[#696969] hover:bg-[#ececea] hover:text-black")}>
                    {String(number).padStart(2,"0")}
                  </button>
                ))}
              </div>
              <div className="px-5 pt-9 sm:px-8 md:px-9 lg:px-[clamp(2rem,4vw,3.5rem)]">
                <div className={instructor ? "border-b-2 border-black pb-3" : "border-b border-neutral-500"}>
                  <h2 className={instructor
                    ? "text-[clamp(1.5rem,2.3vw,2rem)] font-light leading-tight tracking-[-0.05em]"
                    : "text-xl font-normal uppercase leading-7 tracking-[-0.035em]"}>
                    {instructor ? "Week" : "WEEK"} {String(week).padStart(2,"0")}
                  </h2>
                </div>
                <div className={instructor ? "border-b-2 border-black py-4" : "pt-1"}>
                  <h3 className={instructor
                    ? "text-[clamp(2.125rem,3.2vw,3.125rem)] font-semibold leading-tight tracking-[-0.055em]"
                    : "text-[clamp(1.75rem,2vw,2rem)] font-bold leading-tight tracking-[-0.055em]"}>
                    {selected?.name||"피드백"}
                  </h3>
                </div>
                {instructor && selected?.id && (
                  <div className="mt-5 flex flex-wrap items-center gap-3 border-b border-neutral-200 pb-5">
                    <label htmlFor="feedback-account" className="text-xs font-medium">수강생 계정 연결</label>
                    <select id="feedback-account" aria-label="수강생 계정 연결" disabled={mappingBusy}
                      value={selected.user_id||""} onChange={event=>void linkAccount(event.target.value)}
                      className="min-h-10 min-w-44 border border-neutral-300 bg-white px-2 text-sm">
                      <option value="">미연결</option>
                      {profiles.map(profile=>(
                        <option value={profile.id} key={profile.id}>{profile.username}</option>
                      ))}
                    </select>
                    <span className="text-xs text-neutral-500">학생은 연결 후 본인 자료만 열람·업로드합니다.</span>
                  </div>
                )}
                <div className={instructor ? "min-h-[900px]" : "min-h-[900px] mt-[100px]"} aria-live="polite">
                  {setupError && <p role="alert" className="mt-8 border border-neutral-400 p-4 text-sm leading-6">{setupError}</p>}
                  {loading && <p className="mt-8 text-sm text-neutral-400">수강생 정보를 불러오는 중…</p>}
                  {!loading && selected?.id && user && (
                    <FeedbackWorkspace key={selected.id+"-"+week} studentId={selected.id}
                      studentName={selected.name} week={week} userId={user.id} instructor={instructor}/>
                  )}
                  {!loading && !selected?.id && !setupError && (
                    <p className="mt-8 text-sm text-neutral-500">
                      {instructor?"수강생을 선택하세요.":"담당 강사의 계정 연결 후 본인 피드백을 확인할 수 있습니다."}
                    </p>
                  )}
                </div>
              </div>
            </div>
          </div>
      </section>
    </div>
  );
}
