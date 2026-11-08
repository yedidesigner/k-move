import { useCallback, useEffect, useRef, useState, type FormEvent } from "react";
import { CheckCircle2, ChevronDown, CircleDot, Eye, EyeOff, LockKeyhole, Plus, RefreshCw, Trophy, Users, Vote, X } from "lucide-react";
import { useAuth } from "@/lib/auth";
import { SESSIONS, CLASS_END } from "@/data/schedule";
import {
  closePracticePoll, createPracticePoll, changePracticePollVote, getMyPracticePollVote,
  getPracticePollAdminResults, getPracticePollCandidates, getPracticePolls, getPracticePollWinnerList,
  getMyPracticePollCandidateIndex, isPracticePollComplete,
  publishPracticePollWinner, voteInPracticePoll, validateNewPoll,
  type PracticePoll, type PracticePollAdminResults,
} from "@/lib/practice-polls";
import "./practice-polls.css";

const koreanDateTime = new Intl.DateTimeFormat("ko-KR", {
  timeZone: "Asia/Seoul", month: "numeric", day: "numeric", hour: "2-digit", minute: "2-digit",
});
type MapOf<T> = Record<string,T>;
const SELF_VOTE_NOTICE = "자신을 사랑하는 당신! 칭찬합니다! 하지만 투표는 다른 친구에게 해주세요 ❤️";
const messageOf = (error: unknown) =>
  error instanceof Error ? error.message : "작업을 완료하지 못했습니다. 다시 시도해 주세요.";

export function PracticePolls({ sessionNumber }: { sessionNumber: number }) {
  const { user, status } = useAuth();
  const instructor = status === "instructor";
  const [polls, setPolls] = useState<PracticePoll[]>([]);
  const [myVotes, setMyVotes] = useState<MapOf<number | null>>({});
  const [myCandidateIndexes, setMyCandidateIndexes] = useState<MapOf<number | null>>({});
  const [pollCompleted, setPollCompleted] = useState<MapOf<boolean>>({});
  const [changingPollId, setChangingPollId] = useState<string | null>(null);
  const [nowMs, setNowMs] = useState(() => Date.now());
  const [selected, setSelected] = useState<MapOf<number>>({});
  const [admin, setAdmin] = useState<MapOf<PracticePollAdminResults>>({});
  const [winners, setWinners] = useState<MapOf<string[]>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [busy, setBusy] = useState("");
  const [creating, setCreating] = useState(false);
  const [question, setQuestion] = useState(`${sessionNumber}회차 실습에서 한 명을 선택해 주세요.`);
  const [candidateNames, setCandidateNames] = useState<string[]>([]);
  const sequence = useRef(0);
  const session = SESSIONS.find(item => item.number === sessionNumber);
  const endAtMs = session ? new Date(`${session.date}T${CLASS_END}:00+09:00`).getTime() : Number.NaN;
  const closingLabel = session ? `${session.date.replaceAll("-", ".")} ${CLASS_END}` : "회차 일정 미확인";

  const refresh = useCallback(async () => {
    const sequenceNumber = ++sequence.current;
    try {
      const nextPolls = await getPracticePolls(sessionNumber);
      const visible = await getPracticePollWinnerList(sessionNumber);
      const completed = await Promise.all(nextPolls.map(p => isPracticePollComplete(p.id)));
      let nextMyVotes: MapOf<number | null> = {};
      let nextMyIndexes: MapOf<number | null> = {};
      let nextAdmin: MapOf<PracticePollAdminResults> = {};
      let nextCandidateNames: string[] = [];
      if (instructor) {
        const [stats, roster] = await Promise.all([
          Promise.all(nextPolls.map(p => getPracticePollAdminResults(p.id))),
          getPracticePollCandidates(),
        ]);
        nextAdmin = Object.fromEntries(nextPolls.map((poll, index) => [poll.id, stats[index]!]));
        nextCandidateNames = roster;
      } else if (status === "student") {
        const [choices, indexes] = await Promise.all([
          Promise.all(nextPolls.map(p => getMyPracticePollVote(p.id))),
          Promise.all(nextPolls.map(p => getMyPracticePollCandidateIndex(p.id))),
        ]);
        nextMyVotes = Object.fromEntries(nextPolls.map((poll, index) => [poll.id, choices[index] ?? null]));
        nextMyIndexes = Object.fromEntries(nextPolls.map((poll, index) => [poll.id, indexes[index] ?? null]));
      }
      if (sequence.current !== sequenceNumber) return;
      setPolls(nextPolls);
      setMyVotes(nextMyVotes);
      setMyCandidateIndexes(nextMyIndexes);
      setPollCompleted(Object.fromEntries(nextPolls.map((poll, index) => [poll.id, completed[index] === true])));
      setNowMs(Date.now());
      setAdmin(nextAdmin);
      setCandidateNames(nextCandidateNames);
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

  useEffect(() => {
    if (!Number.isFinite(endAtMs)) return;
    const remaining = endAtMs - Date.now();
    if (remaining <= 0) {
      setNowMs(Date.now());
      return;
    }
    const timer = window.setTimeout(() => {
      setNowMs(Date.now());
      void refresh();
    }, Math.min(remaining + 30, 2_147_483_647));
    return () => window.clearTimeout(timer);
  }, [endAtMs, refresh]);

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
    if (!user || status !== "student" || poll.status !== "open" || nowMs >= endAtMs) return;
    if (myVotes[poll.id] !== null && myVotes[poll.id] !== undefined) {
      setError("이미 투표했습니다. 변경하려면 ‘투표 변경’을 눌러 주세요.");
      return;
    }
    const option = selected[poll.id];
    if (option === undefined) { setError("투표할 수강생 한 명을 선택해 주세요."); return; }
    const myIndex = myCandidateIndexes[poll.id];
    if (myIndex === null || myIndex === undefined) {
      setError("투표 후보 명단에 있는 실제 수강생만 투표할 수 있습니다.");
      return;
    }
    if (option === myIndex) { window.alert(SELF_VOTE_NOTICE); return; }
    await action(poll.id, async () => {
      const accepted = await voteInPracticePoll(poll.id, option);
      if (!accepted) throw new Error("이미 참여한 투표입니다. ‘투표 변경’을 이용해 주세요.");
      setSelected(current => {
        const next = { ...current };
        delete next[poll.id];
        return next;
      });
    }, "투표가 저장되었습니다. 참여자와 선택 항목은 다른 수강생에게 공개되지 않습니다.");
  }

  async function submitVoteChange(poll: PracticePoll) {
    if (!user || status !== "student" || poll.status !== "open" || nowMs >= endAtMs) return;
    const originalIndex = myVotes[poll.id];
    const nextIndex = selected[poll.id];
    if (originalIndex === null || originalIndex === undefined
        || nextIndex === undefined || nextIndex === originalIndex) {
      setError("기존과 다른 수강생 한 명을 선택해 주세요.");
      return;
    }
    if (nextIndex === myCandidateIndexes[poll.id]) {
      window.alert(SELF_VOTE_NOTICE);
      return;
    }
    const originalName = poll.options[originalIndex - 1] ?? "이전 수강생";
    const nextName = poll.options[nextIndex - 1] ?? "변경할 수강생";
    if (!window.confirm(
      "투표 1명을 변경하시겠습니까?\n\n" +
      "기존 선택: " + originalName + "\n변경 선택: " + nextName
    )) return;
    await action(poll.id, async () => {
      const changed = await changePracticePollVote(poll.id, nextIndex, originalIndex);
      if (!changed) throw new Error("투표가 변경되지 않았습니다. 다시 확인해 주세요.");
      setChangingPollId(null);
      setSelected(current => {
        const next = { ...current };
        delete next[poll.id];
        return next;
      });
    }, "투표가 변경되었습니다. 기존 1표가 새 수강생에게 옮겨졌습니다.");
  }

  async function submitCreate(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!instructor) return;
    let values: ReturnType<typeof validateNewPoll>;
    try {
      values = validateNewPoll(question);
      if (candidateNames.length < 2) throw new Error("수강생 명단을 먼저 불러와 주세요.");
    } catch (cause) { setError(messageOf(cause)); return; }
    await action("create", async () => {
      await createPracticePoll(sessionNumber, values.title);
      setCreating(false);
    }, "수강생 이름이 후보로 자동 등록되었습니다. 각 수강생은 한 명만 선택할 수 있습니다.");
  }

  return <section className="pr-polls" aria-label={sessionNumber + "회차 투표"}>
    <div className="pr-polls-header">
      <div>
        <p className="pr-polls-eyebrow"><Vote size={14} aria-hidden /> PRIVATE VOTING</p>
        <h3>수강생 투표</h3>
        <p className="pr-polls-description">등록된 수강생 한 명을 선택하고, 수업 종료 전까지 변경할 수 있어요.</p>
        <p className="pr-polls-deadline">자동 마감 · {closingLabel} (한국시간)</p>
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
          placeholder="예: 이번 회차에서 가장 인상적이었던 수강생은 누구인가요?"
          onChange={event=>setQuestion(event.target.value)} />
      </label>
      <p className="pr-polls-field-title">수강생 후보 명단 · {candidateNames.length}명 자동 등록</p>
      <div className="pr-polls-roster-preview" role="list" aria-label="투표에 등록할 수강생 이름">
        {candidateNames.map((name,index)=><div role="listitem" key={name}>
          <span>{String(index+1).padStart(2,"0")}</span><strong>{name}</strong>
        </div>)}
        {!candidateNames.length && <p>등록된 수강생 명단을 확인하는 중입니다.</p>}
      </div>
      <p className="pr-polls-roster-note">
        수강 등록 상태가 유효한 학생만 포함하며, 홍길동·홍길순은 제외합니다.
        투표를 게시하는 시점의 명단으로 확정됩니다.
      </p>
      <div className="pr-polls-create-footer">
        <p>위 후보 전체가 자동 등록됩니다. 한 명에게 투표하고, {CLASS_END} 전까지 선택을 변경할 수 있습니다.</p>
        <button type="submit" className="pr-polls-action pr-polls-primary" disabled={!!busy || candidateNames.length < 2}>
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
        <p>{instructor?"‘투표 만들기’를 누르면 등록된 수강생 이름이 자동으로 후보에 들어갑니다.":"강사가 투표를 게시하면 수강생 이름 중 한 명에게 투표할 수 있습니다."}</p>
      </div> :
      <div className="pr-polls-list">{polls.map(poll=>{
        const isClosed = poll.status === "closed" || (Number.isFinite(endAtMs) && nowMs >= endAtMs);
        const myChoice = myVotes[poll.id] ?? null;
        const ownCandidate = myCandidateIndexes[poll.id] ?? null;
        const canParticipate = ownCandidate !== null;
        const isVoted = myChoice !== null;
        const isChanging = !instructor && isVoted && !isClosed && changingPollId === poll.id;
        const canSelect = !instructor && canParticipate && !isClosed && (!isVoted || isChanging);
        const completed = pollCompleted[poll.id] === true;
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
          <div className="pr-poll-options" role="group" aria-label="수강생 한 명 선택">
            {poll.options.map((label,index)=>{
              const value = index+1;
              return <label key={value} className={"pr-poll-option"+(canSelect&&selected[poll.id]===value?" is-selected":"")}>
                {canSelect ? <input type="radio" name={"poll-"+poll.id}
                  checked={selected[poll.id]===value} onChange={() => {
                    if (value === ownCandidate) {
                      window.alert(SELF_VOTE_NOTICE);
                      return;
                    }
                    setSelected(current => ({ ...current, [poll.id]: value }));
                  }}
                  disabled={!!busy} /> : <span className="pr-poll-bullet" aria-hidden>{String(value).padStart(2,"0")}</span>}
                <span>{label}</span>
              </label>;
            })}
          </div>
          {completed && <p className="pr-polls-all-done" role="status">
            <CheckCircle2 size={17} aria-hidden />
            <strong>투표 완료</strong>
            <span>수강생 전원이 참여했습니다. {isClosed ? "마감된 투표입니다." : "수업 종료 전까지 선택을 변경할 수 있습니다."}</span>
          </p>}
          {!instructor && !canParticipate && <p className="pr-polls-hold">
            <LockKeyhole size={13} aria-hidden /> 투표 후보 명단에 포함된 실제 수강생만 참여할 수 있습니다.
          </p>}
          {!instructor && !isClosed && !isVoted && canParticipate && <div className="pr-polls-vote-footer">
            <p>수강생 이름 중 한 명만 선택하세요. 수업 종료 전까지 변경할 수 있어요.</p>
            <button type="button" className="pr-polls-action pr-polls-primary"
              disabled={!!busy || selected[poll.id]===undefined}
              onClick={()=>void submitVote(poll)}>{busy===poll.id?"저장 중…":"선택한 1명에게 투표"}</button>
          </div>}
          {!instructor && isVoted && <div className="pr-polls-my-vote">
            <p className="pr-polls-done">
              <CheckCircle2 size={15} aria-hidden />
              <span>현재 내 선택: <strong>{myChoice !== null ? poll.options[myChoice - 1] : ""}</strong>
                <small>본인에게만 표시됩니다.</small>
              </span>
            </p>
            {!isClosed && !isChanging && <button type="button"
              className="pr-polls-action pr-polls-secondary"
              disabled={!!busy}
              onClick={() => {
                setChangingPollId(poll.id);
                setSelected(current => ({ ...current, [poll.id]: myChoice! }));
                setError("");
              }}>투표 변경</button>}
            {isClosed && <span className="pr-polls-closed-note">수업 종료로 마감되어 변경할 수 없습니다.</span>}
          </div>}
          {!instructor && isChanging && <div className="pr-polls-change-footer">
            <p>변경할 수강생 한 명을 선택하세요. 확인한 후에만 변경됩니다.</p>
            <div className="pr-polls-change-actions">
              <button type="button" className="pr-polls-action pr-polls-secondary"
                disabled={!!busy} onClick={() => {
                  setChangingPollId(null);
                  setSelected(current => {
                    const next = { ...current };
                    delete next[poll.id];
                    return next;
                  });
                }}>변경 취소</button>
              <button type="button" className="pr-polls-action pr-polls-primary"
                disabled={!!busy || selected[poll.id]===undefined || selected[poll.id]===myChoice}
                onClick={() => void submitVoteChange(poll)}>
                {busy===poll.id?"변경 중…":"선택한 1명으로 변경"}
              </button>
            </div>
          </div>}
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
                  if(window.confirm("수업 종료 전 투표를 조기 마감하시겠습니까? 마감 후에는 다시 열거나 변경할 수 없습니다."))
                    void action(poll.id,()=>closePracticePoll(poll.id),"투표를 마감했습니다. 이제 1위 결과를 공개할 수 있습니다.");
                }}>조기 마감</button> : <button type="button"
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
