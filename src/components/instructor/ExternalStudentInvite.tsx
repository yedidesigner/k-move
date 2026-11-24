import { useState, type FormEvent } from "react";
import { getSupabase } from "@/lib/supabase";
import { useAuth } from "@/lib/auth";

export type StudentGroup = "regular" | "private";
// Legacy guest records are displayed as private students even during rollout.
export const studentGroup = (type?: string): StudentGroup =>
  type === "guest" || type === "private" ? "private" : "regular";
export const studentTypeLabel = (type?: string) =>
  studentGroup(type) === "private" ? "개인 과외생" : "K-MOVE 학생";

const input = "min-h-11 w-full border border-neutral-300 bg-white px-3 py-2 text-sm";
const action = "min-h-11 border border-neutral-950 bg-neutral-950 px-4 py-2 text-sm font-medium text-white disabled:opacity-50";

export function ExternalStudentInvite({ onCreated }: { onCreated: () => void }) {
  const { status } = useAuth();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [busy, setBusy] = useState(false);
  const [notice, setNotice] = useState("");
  const [error, setError] = useState("");
  const [inviteLink, setInviteLink] = useState("");
  const [copied, setCopied] = useState(false);
  if (status !== "instructor") return null;

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (busy) return;
    setBusy(true); setNotice(""); setError(""); setInviteLink(""); setCopied(false);
    try {
      const { data, error: failure } = await getSupabase().functions.invoke("kmove-invite-student", {
        body: { name, email, student_type: "private" },
      });
      if (failure) {
        let message = "초대하지 못했습니다. 이름과 이메일 및 서버 설정을 확인해 주세요.";
        try {
          const detail = await failure.context?.json();
          if (typeof detail?.error === "string") message = detail.error;
        } catch { /* use generic message */ }
        throw new Error(message);
      }
      if (!data?.created) throw new Error("수강 등록을 확인하지 못했습니다.");
      if (typeof data.invite_link === "string") setInviteLink(data.invite_link);
      setNotice(data.email_sent
        ? "수강 등록 완료 · 이메일 로그인 링크 발송을 요청했습니다."
        : "수강 등록 완료 · 이메일 발송 실패. 아래 일회용 링크가 표시되면 학생에게 개별 전달해 주세요. 링크가 없으면 이메일 발송 설정을 확인해야 합니다.");
      setName(""); setEmail(""); onCreated();
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "초대에 실패했습니다.");
    } finally { setBusy(false); }
  }
  return <section className="border border-neutral-200 bg-white p-4 sm:p-5" aria-labelledby="external-invite-title">
    <h2 id="external-invite-title" className="text-base font-semibold">개인 과외생 초대</h2>
    <p className="mt-1 text-xs leading-5 text-neutral-600">초대한 학생은 개인 과외생으로 자동 등록됩니다. 수업·자료·실습·과제·피드백을 이용할 수 있으며 투표에는 참여할 수 없습니다.</p>
    <form className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)_auto] lg:items-end" onSubmit={submit}>
      <label className="block text-xs font-medium">학생 이름
        <input className={input + " mt-1"} value={name} onChange={e => setName(e.target.value)} required minLength={2} maxLength={30} disabled={busy} placeholder="본명" />
      </label>
      <label className="block text-xs font-medium">이메일
        <input className={input + " mt-1"} type="email" value={email} onChange={e => setEmail(e.target.value)} required maxLength={254} disabled={busy} placeholder="student@example.com" />
      </label>
      <button type="submit" className={action + " lg:min-w-44"} disabled={busy || !name.trim() || !email.trim()}>{busy ? "등록 중…" : "개인 과외생 초대"}</button>
    </form>
    <p className="mt-3 text-xs text-neutral-500">투표 권한 없음 · 공식 정원 제외 · 개인 Google Drive 폴더는 별도로 연결해야 합니다.</p>
    {notice && <p className="mt-3 border border-neutral-200 p-3 text-sm" role="status">{notice}</p>}
    {inviteLink && <div className="mt-3 space-y-3 border border-neutral-300 p-3">
      <p className="text-xs leading-5 text-neutral-600">일회용 로그인 링크입니다. 해당 학생에게만 개인 메시지로 보내세요. 링크가 만료되거나 사용된 뒤에는 다시 사용할 수 없습니다. 학생은 로그인 후 비밀번호 메뉴에서 숫자 4자리 비밀번호를 설정할 수 있습니다.</p>
      <button type="button" className={action} onClick={async () => {
        try { await navigator.clipboard.writeText(inviteLink); setCopied(true); }
        catch { setError("클립보드 복사에 실패했습니다."); }
      }}>{copied ? "복사 완료" : "일회용 로그인 링크 복사"}</button>
      <button type="button" className="ml-2 min-h-11 border border-neutral-300 px-3 text-sm"
        onClick={() => { setInviteLink(""); setCopied(false); }}>링크 닫기</button>
    </div>}
    {error && <p className="mt-3 border border-neutral-400 p-3 text-sm" role="alert">{error}</p>}
  </section>;
}

