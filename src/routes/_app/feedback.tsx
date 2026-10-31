import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { Check, ChevronDown } from "lucide-react";
import { FeedbackWorkspace } from "@/components/FeedbackWorkspace";
import { getSupabase } from "@/lib/supabase";
import { useAuth } from "@/lib/auth";
import { STUDENT_NAMES } from "@/data/student-roster";

export const Route = createFileRoute("/_app/feedback")({
  head: () => ({ meta: [
    { title: "피드백 | K-Move LMS" },
    { name: "description", content: "수강생 포트폴리오 이미지와 위치별 피드백" },
  ] }),
  component: FeedbackPage,
});

type Student = { id:string; name:string; major:string; user_id:string|null };
type Profile = { id:string; username:string; role:string };
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
  const [studentPickerOpen,setStudentPickerOpen] = useState(false);
  const studentPickerRef = useRef<HTMLDivElement>(null);
  const studentPickerButtonRef = useRef<HTMLButtonElement>(null);

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
          if(active) setProfiles(((profilesResult.data||[]) as Profile[])
            .filter(profile=>STUDENT_NAMES.some(name=>name===profile.username)));
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

  useEffect(() => {
    if (!studentPickerOpen) return;
    const handlePointerDown = (event: PointerEvent) => {
      if (studentPickerRef.current && !studentPickerRef.current.contains(event.target as Node)) {
        setStudentPickerOpen(false);
      }
    };
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setStudentPickerOpen(false);
        studentPickerButtonRef.current?.focus();
      }
    };
    document.addEventListener("pointerdown", handlePointerDown);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("pointerdown", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [studentPickerOpen]);

  // The instructor's active course list follows the shared roster. Legacy
  // students retain their own records; database RLS still enforces access.
  const cohortStudents = STUDENT_NAMES.flatMap(name =>
    students.filter(student => student.name === name));
  const selected = instructor
    ? cohortStudents.find(row => row.name === studentName) || cohortStudents[0]
    : students.find(row => row.user_id === user?.id);

  async function linkAccount(accountId:string) {
    if(!instructor || !selected?.id || mappingBusy) return;
    if(accountId && !profiles.some(profile=>profile.id===accountId)) return;
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
    <div className="min-h-screen bg-[#101010] px-4 pb-20 pt-6 text-white sm:px-5 md:pb-12 md:pt-4">
      <h1 className="flex min-h-11 w-full items-center justify-center text-center text-[clamp(1.75rem,2.1vw,2.125rem)] font-normal leading-none tracking-[-0.035em]">
        FEEDBACK
      </h1>
      <section aria-label="주차별 피드백 문서" className="min-w-0">
          <div className="relative isolate mr-9 ml-0 mt-6 pt-8 sm:mr-11 md:mr-12 md:ml-6 md:mt-[44px]">
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
                <div className="border-b border-neutral-500 pb-1">
                  <h2 className="text-xl font-normal uppercase leading-7 tracking-[-0.035em]">
                    WEEK {String(week).padStart(2,"0")}
                  </h2>
                </div>
                <div className="relative z-30 flex items-center gap-2 pt-[14px]">
                  <h3 className="text-[clamp(1.75rem,2vw,2rem)] font-bold leading-tight tracking-[-0.055em]">
                    {selected?.name||"피드백"}
                  </h3>
                  {instructor && (
                    <div ref={studentPickerRef} className="relative">
                      <button
                        ref={studentPickerButtonRef}
                        type="button"
                        aria-label="수강생 변경"
                        aria-haspopup="menu"
                        aria-controls="feedback-student-options"
                        aria-expanded={studentPickerOpen}
                        disabled={loading || cohortStudents.length === 0}
                        onClick={() => setStudentPickerOpen(open => !open)}
                        className="flex size-[18px] shrink-0 items-center justify-center rounded-sm border border-neutral-300 bg-white text-black transition-colors hover:bg-neutral-100 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-black disabled:opacity-50"
                      >
                        <ChevronDown className={`size-2 transition-transform ${studentPickerOpen ? "rotate-180" : ""}`} aria-hidden="true" />
                      </button>
                      {studentPickerOpen && (
                        <div
                          id="feedback-student-options"
                          role="menu"
                          aria-label="학생 이름 목록"
                          className="absolute left-0 top-full z-50 mt-1 max-h-72 min-w-44 overflow-y-auto border border-neutral-300 bg-white py-1 text-black shadow-lg"
                        >
                          {cohortStudents.map(item => {
                            const active = selected?.name === item.name;
                            return (
                              <button
                                key={item.id || item.name}
                                type="button"
                                role="menuitemradio"
                                aria-checked={active}
                                onClick={() => {
                                  setStudentName(item.name);
                                  setStudentPickerOpen(false);
                                  studentPickerButtonRef.current?.focus();
                                }}
                                className={`flex min-h-10 w-full items-center justify-between gap-3 px-3 text-left text-sm hover:bg-neutral-100 focus:bg-neutral-100 focus:outline-none ${active ? "bg-neutral-100 font-semibold" : ""}`}
                              >
                                <span>{item.name}</span>
                                {active && <Check className="size-4 shrink-0" aria-hidden="true" />}
                              </button>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  )}
                  {instructor && !loading && !setupError && (
                    <span className="ml-1 text-xs text-neutral-500">수강생 {cohortStudents.length}명</span>
                  )}
                </div>

                <div className="min-h-[900px] mt-[12.5px]" aria-live="polite">
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
                {instructor && selected?.id && (
                  <div className="mt-10 flex flex-wrap items-center gap-3 border-t border-neutral-200 py-5">
                    <label htmlFor="feedback-account" className="text-xs font-medium">강사용 수강생 계정 연결</label>
                    <select
                      id="feedback-account"
                      aria-label="수강생 계정 연결"
                      disabled={mappingBusy}
                      value={selected.user_id||""}
                      onChange={event=>void linkAccount(event.target.value)}
                      className="min-h-10 min-w-44 border border-neutral-300 bg-white px-2 text-sm"
                    >
                      <option value="">미연결</option>
                      {profiles.map(profile=>(
                        <option value={profile.id} key={profile.id}>{profile.username}</option>
                      ))}
                    </select>
                    <span className="text-xs text-neutral-500">연결된 학생은 본인 자료만 열람·업로드할 수 있습니다.</span>
                  </div>
                )}
              </div>
            </div>
          </div>
      </section>
    </div>
  );
}
