import { useCallback, useEffect, useRef, useState, type FormEvent } from "react";
import { CheckCircle2, ChevronDown, CircleDot, Eye, EyeOff, LockKeyhole, Plus, RefreshCw, Trophy, Users, Vote, X } from "lucide-react";
import { useAuth } from "@/lib/auth";
import {
  closePracticePoll, createPracticePoll, didVoteInPracticePoll,
  getPracticePollAdminResults, getPracticePolls, getPracticePollWinnerList,
  publishPracticePollWinner, voteInPracticePoll, validateNewPoll,
  type PracticePoll, type PracticePollAdminResults,
} from "@/lib/practice-polls";
import "./practice-polls.css";

const koreanDateTime = new Intl.DateTimeFormat("ko-KR", {
  timeZone: "Asia/Seoul", month: "numeric", day: "numeric", hour: "2-digit", minute: "2-digit",
});
type MapOf<T> = Record<string,T>;
const messageOf = (error: unknown) =>
  error instanceof Error ? error.message : "작업을 완료하지 못했습니다. 다시 시도해 주세요.";

export function PracticePolls({ sessionNumber }: { sessionNumber: number }) {
  const { user, status } = useAuth();
  const instructor = status === "instructor";
  const [polls, setPolls] = useState<PracticePoll[]>([]);
  const [checked, setChecked] = useState<MapOf<boolean>>({});
  const [selected, setSelected] = useState<MapOf<number>>({});
  const [admin, setAdmin] = useState<MapOf<PracticePollAdminResults>>({});
  const [winners, setWinners] = useState<MapOf<string[]>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [busy, setBusy] = useState("");
  const [creating, setCreating] = useState(false);
  const [question, setQuestion] = useState("");
  const [options, setOptions] = useState(["", ""]);
  const sequence = useRef(0);

  const refresh = useCallback(async () => {
    const sequenceNumber = ++sequence.current;
    try {
      const nextPolls = await getPracticePolls(sessionNumber);
      const visible = await getPracticePollWinnerList(sessionNumber);
      let nextVoted: MapOf<boolean> = {};
      let nextAdmin: MapOf<PracticePollAdminResults> = {};
      if (instructor) {
        const stats = await Promise.all(nextPolls.map(p => getPracticePollAdminResults(p.id)));
        nextAdmin = Object.fromEntries(nextPolls.map((poll, index) => [poll.id, stats[index]!]));
      } else if (status === "student") {
        const state = await Promise.all(nextPolls.map(p => didVoteInPracticePoll(p.id)));
        nextVoted = Object.fromEntries(nextPolls.map((poll, index) => [poll.id, state[index]!]));
      }
      if (sequence.current !== sequenceNumber) return;
      setPolls(nextPolls);
      setChecked(nextVoted);
      setAdmin(nextAdmin);
      setWinners(Object.fromEntries(visible.map(row => [row.poll_id,row.winners])));
      setError("");
    } catch (cause) {
      if (sequence.current === sequenceNumber) setError(messageOf(cause));
    } finally {
      if (sequence.current === sequenceNumber) setLoading(false);
    }
  }, [sessionNumber, status, instructor]);

  useEffect(() => {
    void refresh();
    const timer = window.setInterval(() => {
      if (document.visibilityState === "visible") void refresh();
    }, 25000);
    const onFocus = () => { if (document.visibilityState === "visible") void refresh(); };
    document.addEventListener("visibilitychange", onFocus);
    return () => {
      sequence.current++;
      window.clearInterval(timer);
      document.removeEventListener("visibilitychange", onFocus);
    };
  }, [refresh]);

  async function action(key: string, task: () => Promise<void>, success: string) {
    if (busy) return;
    setBusy(key); setError(""); setNotice("");
    try {
      await task();
      setNotice(success);
      await refresh();
    } catch (cause) {
      setError(messageOf(cause));
    } finally {
      setBusy("");
    }
  }

  async function submitVote(poll: PracticePoll) {
    if (!user || status !== "student" || poll.status !== "open") return;
    const option = selected[poll.id];
    if (option === undefined) { setError("먼저 항목 하나를 선택해 주세요."); return; }
    await action(poll.id, async () => {
      const accepted = await voteInPracticePoll(poll.id, option);
      if (!accepted) throw new Error("이미 참여한 투표입니다. 다시 투표할 수 없습니다.");
      setSelected(current => {
        const next = { ...current };
        delete next[poll.id];
        return next;
      });
    }, "투표가 저장되었습니다. 참여자와 선택 항목은 다른 수강생에게 공개되지 않습니다.");
  }

  async function submitCreate(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!instructor) return;
    let values: ReturnType<typeof validateNewPoll>;
    try { values=validateNewPoll(question,options); }
    catch (cause) { setError(messageOf(cause)); return; }
    await action("create", async () => {
      await createPracticePoll(sessionNumber,values.title,values.choices);
      setCreating(false); setQuestion(""); setOptions(["",""]);
    }, "새 투표를 만들었습니다. 이 회차의 수강생에게 표시됩니다.");
  }

  return <section className="pr-polls" aria-label={sessionNumber + "회차 투표"}>
    <div className="pr-polls-header">
      <div>
        <p className="pr-polls-eyebrow"><Vote size={14} aria-hidden /> PRIVATE VOTING</p>
        <h3>실습 투표</h3>
        <p className="pr-polls-description">회차별로 의견을 모으고, 마감한 투표는 1위만 공개할 수 있어요.</p>
        <p className="pr-polls-privacy"><LockKeyhole size={14} aria-hidden /> 수강생에게 투표자·항목별 득표수·개별 선택 내역은 공개되지 않습니다.</p>
      </div>
      <div className="pr-polls-header-actions">
        <button type="button" className="pr-polls-action pr-polls-secondary"
          disabled={!!busy} onClick={() => void refresh()}>
          <RefreshCw size={14} aria-hidden /> 새로고침
        </button>
        {instructor && <button type="button" className="pr-polls-action pr-polls-primary"
          aria-expanded={creating} onClick={() => setCreating(value=>!value)}>
          {creating ? <X size={14} aria-hidden /> : <Plus size={14} aria-hidden />}
          {creating ? "작성 닫기" : "투표 만들기"}
        </button>}
      </div>
    </div>

    {instructor && creating && <form className="pr-polls-create" onSubmit={event => void submitCreate(event)}>
      <p className="pr-polls-label">새 투표 · {String(sessionNumber).padStart(2,"0")}회차</p>
      <label className="pr-polls-field">질문
        <input required minLength={4} maxLength={180} value={question} disabled={!!busy}
          placeholder="예: 가장 완성도가 높은 브랜드 시안은?"
          onChange={event=>setQuestion(event.target.value)} />
      </label>
      <p className="pr-polls-field-title">투표 항목 (2~8개)</p>
      <div className="pr-polls-option-inputs">
        {options.map((option,index)=><div key={index} className="pr-polls-option-input">
          <span>{String(index+1).padStart(2,"0")}</span>
          <input required maxLength={120} value={option} disabled={!!busy}
            aria-label={(index+1)+"번 항목"}
            placeholder={(index+1)+"번 항목"}
            onChange={event=>setOptions(current=>current.map((item,i)=>i===index?event.target.value:item))} />
          {options.length>2 && <button type="button" disabled={!!busy} aria-label={(index+1)+"번 항목 삭제"}
            onClick={()=>setOptions(current=>current.filter((_,i)=>i!==index))}><X size={14} aria-hidden /></button>}
        </div>)}
      </div>
      {options.length<8 && <button type="button" className="pr-polls-add" disabled={!!busy}
        onClick={()=>setOptions(items=>[...items,""])}><Plus size={14} aria-hidden /> 항목 추가</button>}
      <div className="pr-polls-create-footer">
        <p>생성 후에는 항목을 수정할 수 없어요. 수강생은 투표당 한 번만 참여할 수 있습니다.</p>
        <button type="submit" className="pr-polls-action pr-polls-primary" disabled={!!busy}>
          {busy==="create"?"만드는 중…":"이 회차에 투표 게시"}
        </button>
      </div>
    </form>}

    {!!notice && <p className="pr-polls-notice" role="status"><CheckCircle2 size={15} aria-hidden />{notice}</p>}
    {!!error && <p className="pr-polls-error" role="alert">{error}</p>}

    {loading ? <div className="pr-polls-empty" role="status">투표를 불러오는 중입니다.</div> :
      !polls.length ? <div className="pr-polls-empty">
        <CircleDot size={30} aria-hidden />
        <strong>이 회차에는 아직 투표가 없습니다.</strong>
        <p>{instructor?"‘투표 만들기’를 눌러 질문과 항목을 등록해 주세요.":"강사가 투표를 게시하면 이곳에서 참여할 수 있습니다."}</p>
      </div> :
      <div className="pr-polls-list">{polls.map(poll=>{
        const isClosed = poll.status === "closed";
        const isVoted = checked[poll.id] === true;
        const statistics = admin[poll.id];
        const published = winners[poll.id] ?? [];
        return <article className="pr-poll-card" key={poll.id}>
          <header className="pr-poll-card-header">
            <div>
              <span className="pr-polls-state">{isClosed?"마감":"진행 중"}</span>
              <time dateTime={poll.created_at}>{koreanDateTime.format(new Date(poll.created_at))}</time>
              <h4>{poll.question}</h4>
            </div>
            {instructor && <span className="pr-polls-admin-mark"><LockKeyhole size={12} aria-hidden /> 강사 관리</span>}
          </header>
          <div className="pr-poll-options">
            {poll.options.map((label,index)=>{
              const value = index+1;
              return <label key={value} className={"pr-poll-option"+(!instructor&&!isVoted&&!isClosed&&selected[poll.id]===value?" is-selected":"")}>
                {!instructor&&!isVoted&&!isClosed ? <input type="radio" name={"poll-"+poll.id}
                  checked={selected[poll.id]===value} onChange={()=>setSelected(current=>({...current,[poll.id]:value}))}
                  disabled={!!busy} /> : <span className="pr-poll-bullet" aria-hidden>{String(value).padStart(2,"0")}</span>}
                <span>{label}</span>
              </label>;
            })}
          </div>
          {!instructor && !isClosed && !isVoted && <div className="pr-polls-vote-footer">
            <p>투표는 한 번만 가능합니다. 선택 후 변경할 수 없어요.</p>
            <button type="button" className="pr-polls-action pr-polls-primary"
              disabled={!!busy || selected[poll.id]===undefined}
              onClick={()=>void submitVote(poll)}>{busy===poll.id?"저장 중…":"익명으로 투표하기"}</button>
          </div>}
          {!instructor && isVoted && <p className="pr-polls-done"><CheckCircle2 size={15} aria-hidden /> 참여 완료 · 내 선택은 공개되지 않습니다.</p>}
          {!instructor && isClosed && !isVoted && <p className="pr-polls-done">투표가 마감되었습니다.</p>}
          {isClosed && poll.winner_published && published.length>0 && <div className="pr-polls-winner">
            <Trophy size={18} aria-hidden />
            <div><span>{published.length>1?"공동 1위":"1위"}</span><strong>{published.join(" · ")}</strong></div>
            <span className="pr-polls-hidden-count"><EyeOff size={12} aria-hidden /> 득표수 비공개</span>
          </div>}
          {isClosed && !poll.winner_published && !instructor && <p className="pr-polls-hold"><LockKeyhole size={13} aria-hidden /> 강사가 결과를 공개하면 1위만 표시됩니다.</p>}
          {instructor && <div className="pr-polls-admin">
            <div className="pr-polls-admin-title"><strong>강사 전용 집계</strong><span>학생 화면에는 보이지 않습니다.</span></div>
            {statistics && <div className="pr-polls-stats">
              <p>참여자 <strong>{statistics.totalVotes}명</strong></p>
              {isClosed && <div className="pr-polls-tally">
                {statistics.options.map(item=><div key={item.index}>
                  <span>{item.label}</span><strong>{item.votes}표</strong>
                </div>)}
              </div>}
              {!isClosed && <p className="pr-polls-admin-note">진행 중에는 선택 항목별 득표수를 숨깁니다. 마감 후 확인할 수 있습니다.</p>}
              <details className="pr-polls-participants">
                <summary>참여자 목록 · {statistics.participants.length}명 <ChevronDown size={13} aria-hidden /></summary>
                {statistics.participants.length ? <ul>{statistics.participants.map(participant=>
                  <li key={participant.id}><span>{participant.name}</span><time dateTime={participant.votedAt}>{koreanDateTime.format(new Date(participant.votedAt))}</time></li>
                )}</ul> : <p>아직 참여자가 없습니다.</p>}
                <p>선택 항목은 참여자 이름과 연결해 표시하지 않습니다.</p>
              </details>
            </div>}
            <div className="pr-polls-controls">
              {!isClosed ? <button type="button" className="pr-polls-action pr-polls-secondary" disabled={!!busy}
                onClick={()=>{
                  if(window.confirm("이 투표를 마감할까요? 마감 후에는 다시 열거나 투표할 수 없습니다."))
                    void action(poll.id,()=>closePracticePoll(poll.id),"투표를 마감했습니다. 이제 1위 결과를 공개할 수 있습니다.");
                }}>투표 마감</button> : <button type="button"
                className={"pr-polls-action "+(poll.winner_published?"pr-polls-secondary":"pr-polls-primary")}
                disabled={!!busy || (!poll.winner_published && (statistics?.totalVotes ?? 0)===0)}
                onClick={()=>void action(poll.id,
                  ()=>publishPracticePollWinner(poll.id,!poll.winner_published),
                  poll.winner_published?"1위 결과 공개를 중지했습니다.":"1위 결과를 공개했습니다. (득표수 비공개)")}>
                {poll.winner_published?<><EyeOff size={13} aria-hidden /> 1위 공개 중지</>:<><Eye size={13} aria-hidden /> 1위만 공개</>}
              </button>}
            </div>
          </div>}
        </article>;
      })}</div>}
    <p className="pr-polls-footer"><LockKeyhole size={13} aria-hidden /> 실습 공유방 투표는 해당 과정의 등록 수강생만 참여할 수 있습니다. 투표는 비공개로 저장되며, 강사는 참여자·집계만 확인합니다.</p>
  </section>;
}
