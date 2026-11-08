import { Fragment, useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { Link, useBlocker } from "@tanstack/react-router";
import { ArrowDown, ArrowUpRight, Check, ChevronDown, Download, ExternalLink, FileText, ImageIcon, Link2, LoaderCircle, MessageCircle, MoreHorizontal, Paperclip, Pencil, Pin, Plus, RefreshCw, Send, Smile, Trash2, Users, WifiOff, X } from "lucide-react";
import { useAuth } from "@/lib/auth";
import { usePublishedContent } from "@/lib/published-content";
import { usePracticeRoom } from "@/hooks/use-practice-room";
import { useEditorExitGuard } from "@/lib/editor-exit-guard";
import { FEEDBACK_UPLOAD_ACCEPT, feedbackFileSize, normalizeFeedbackUrl, validateFeedbackUpload } from "@/lib/feedback-attachments";
import { PRACTICE_BODY_LIMIT, PRACTICE_FILE_COUNT, PRACTICE_LINK_COUNT, extractPracticeLinks, getPracticeFileUrl, practiceDisplayBody, type PracticeAttachment, type PracticeInput, type PracticeLink, type PracticeMessage } from "@/lib/practice";
import "./practice-room.css";

type RoomApi = ReturnType<typeof usePracticeRoom>;
type Material = { key: string; message: PracticeMessage } & ({ kind: "link"; link: PracticeLink } | { kind: "image" | "file"; attachment: PracticeAttachment });
type MaterialFilter = "all" | "link" | "image" | "file" | "mine";
const materialFilters: { value: MaterialFilter; label: string }[] = [{ value: "all", label: "전체" }, { value: "link", label: "링크" }, { value: "image", label: "이미지" }, { value: "file", label: "파일" }, { value: "mine", label: "내 자료" }];

const EMOJI_GROUPS = [
  { label: "표정", items: ["😀", "😄", "😊", "😍", "🥳", "🤔", "😅", "😂", "😎", "🥹", "😭", "😮"] },
  { label: "손짓", items: ["👍", "👏", "🙌", "🙏", "👌", "💪", "👀", "👋", "🤝", "✍️"] },
  { label: "수업·디자인", items: ["🎨", "🖌️", "📝", "💻", "📎", "🔗", "📷", "💡", "✨", "🚀", "✅", "🔥", "⭐", "❤️", "📌", "❓"] },
] as const;
const dateFormat = new Intl.DateTimeFormat("ko-KR", { timeZone: "Asia/Seoul", month: "long", day: "numeric", weekday: "short" });
const timeFormat = new Intl.DateTimeFormat("ko-KR", { timeZone: "Asia/Seoul", hour: "2-digit", minute: "2-digit" });
const detailFormat = new Intl.DateTimeFormat("ko-KR", { timeZone: "Asia/Seoul", month: "numeric", day: "numeric", hour: "2-digit", minute: "2-digit" });
const errorText = (error: unknown) => error instanceof Error ? error.message : "저장하지 못했어요. 잠시 후 다시 시도해 주세요.";
const roomMessageId = (session: number, id: string) => `practice-message-${session}-${id}`;
const shortBody = (message: PracticeMessage) => practiceDisplayBody(message.body, message.links) || message.links[0]?.title || (message.links.length ? "공유 링크" : message.attachments[0]?.name) || "공유한 자료";
function linkHost(url: string) { try { return new URL(url).hostname.replace(/^www\./, ""); } catch { return "공유 링크"; } }

export function PracticeRoom({ sessionNumber, embedded = false }: { sessionNumber: number; embedded?: boolean }) {
  const api = usePracticeRoom(sessionNumber);
  const { user, status } = useAuth();
  const { sessions } = usePublishedContent();
  const session = sessions.find(item => item.number === sessionNumber);
  const [tab, setTab] = useState<"chat" | "materials">("chat");
  const [filter, setFilter] = useState<MaterialFilter>("all");
  const [openThreads, setOpenThreads] = useState<Set<string>>(new Set());
  const [replyTo, setReplyTo] = useState<PracticeMessage | null>(null);
  const [highlight, setHighlight] = useState<string | null>(null);
  const [newCount, setNewCount] = useState(0);
  const [online, setOnline] = useState(() => typeof navigator === "undefined" || navigator.onLine);
  const scrollRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const nearBottom = useRef(true);
  const seen = useRef<Set<string> | null>(null);
  const roots = useMemo(() => api.messages.filter(message => !message.parent_id), [api.messages]);
  const replies = useMemo(() => {
    const grouped = new Map<string, PracticeMessage[]>();
    for (const message of api.messages) if (message.parent_id) grouped.set(message.parent_id, [...(grouped.get(message.parent_id) ?? []), message]);
    return grouped;
  }, [api.messages]);
  const materials = useMemo(() => api.messages.filter(message => !message.deleted_at).flatMap(message => [
    ...message.links.map((link, index): Material => ({ key: `${message.id}-link-${index}`, kind: "link", link, message })),
    ...message.attachments.map((attachment): Material => ({ key: `${message.id}-${attachment.id}`, kind: attachment.kind, attachment, message })),
  ]).reverse(), [api.messages]);
  const visibleMaterials = materials.filter(material => filter === "all" || (filter === "mine" ? material.message.author_id === user?.id : material.kind === filter));
  const pinned = api.messages.filter(message => message.is_pinned && !message.deleted_at);
  const count = api.messages.filter(message => !message.deleted_at).length;

  useEffect(() => {
    const update = () => setOnline(navigator.onLine);
    window.addEventListener("online", update); window.addEventListener("offline", update);
    return () => { window.removeEventListener("online", update); window.removeEventListener("offline", update); };
  }, []);
  function scrollToLatest() {
    const element = scrollRef.current;
    if (element) element.scrollTop = element.scrollHeight;
    nearBottom.current = true; setNewCount(0);
  }
  useEffect(() => {
    if (api.loading) return;
    const ids = new Set(api.messages.map(message => message.id));
    if (!seen.current) {
      seen.current = ids;
      if (tab === "chat") requestAnimationFrame(scrollToLatest);
      return;
    }
    const added = api.messages.filter(message => !seen.current?.has(message.id) && !message.deleted_at);
    seen.current = ids;
    if (!added.length) return;
    if (nearBottom.current && tab === "chat") requestAnimationFrame(scrollToLatest);
    else setNewCount(current => current + added.length);
  }, [api.messages, api.loading, tab]);
  useEffect(() => {
    if (!highlight || tab !== "chat") return;
    const frame = requestAnimationFrame(() => {
      const element = document.getElementById(roomMessageId(sessionNumber, highlight));
      element?.scrollIntoView?.({ behavior: "smooth", block: "nearest" });
      element?.focus({ preventScroll: true });
    });
    const timer = window.setTimeout(() => setHighlight(null), 2800);
    return () => { cancelAnimationFrame(frame); window.clearTimeout(timer); };
  }, [highlight, tab, openThreads, sessionNumber]);
  function showOriginal(message: PracticeMessage) {
    setTab("chat");
    if (message.parent_id) setOpenThreads(current => new Set(current).add(message.parent_id!));
    setHighlight(message.id);
  }
  function startReply(message: PracticeMessage) {
    if (message.deleted_at) return;
    setReplyTo(message); setTab("chat");
    setOpenThreads(current => new Set(current).add(message.id));
    requestAnimationFrame(() => { textareaRef.current?.focus(); textareaRef.current?.scrollIntoView?.({ behavior: "smooth", block: "nearest" }); });
  }
  function toggleThread(id: string) {
    setOpenThreads(current => { const next = new Set(current); if (next.has(id)) next.delete(id); else next.add(id); return next; });
  }
  function triggerQuickShare(kind: "link" | "image" | "file") {
    const id = kind === "link"
      ? `practice-link-toggle-${sessionNumber}`
      : `practice-${kind}-picker-${sessionNumber}`;
    const control = document.getElementById(id) as HTMLButtonElement | HTMLInputElement | null;
    control?.click();
  }
  function focusComposer() {
    setTab("chat"); requestAnimationFrame(() => textareaRef.current?.focus());
  }
  const tabId = `practice-${sessionNumber}`;
  const instructor = status === "instructor";

  return <section className={`pr-room${embedded ? " pr-room--embedded" : ""}`} aria-label={`${sessionNumber}회차 실습 공유방`}>
    <header className="pr-header">
      <div className="pr-heading"><p className="pr-eyebrow">PRACTICE ROOM <span>/ {String(sessionNumber).padStart(2, "0")}</span></p><h2>실습 공유방</h2><p className="pr-subtitle">{session?.title ?? `${sessionNumber}회차`}<span className="pr-scope"><Users size={12} aria-hidden /> 이 수업의 수강생과 강사가 함께 봐요</span></p></div>
      <div className="pr-header-side"><span className={`pr-connection${api.connected && online ? " is-connected" : ""}`}><span />{!online ? "오프라인" : api.connected ? "실시간 연결" : "연결 확인 중"}</span>{embedded && <Link className="pr-expand" to="/practice" search={{ session: sessionNumber }}>크게 보기 <ArrowUpRight size={14} aria-hidden /></Link>}</div>
    </header>
    <div className="pr-tabs" role="tablist" aria-label="실습 공유 보기 방식">
      {([{ value: "chat", label: "대화", count }, { value: "materials", label: "자료 모아보기", count: materials.length }] as const).map(item => <button key={item.value} type="button" role="tab" id={`${tabId}-${item.value}-tab`} aria-controls={`${tabId}-${item.value}`} aria-selected={tab === item.value} tabIndex={tab === item.value ? 0 : -1} className={`pr-tab${tab === item.value ? " is-active" : ""}`} onClick={() => setTab(item.value)} onKeyDown={event => { if (["ArrowLeft", "ArrowRight", "Home", "End"].includes(event.key)) { event.preventDefault(); const next = event.key === "Home" ? "chat" : event.key === "End" ? "materials" : tab === "chat" ? "materials" : "chat"; setTab(next); document.getElementById(`${tabId}-${next}-tab`)?.focus(); } }}>{item.value === "chat" ? <MessageCircle size={15} aria-hidden /> : <Paperclip size={15} aria-hidden />}{item.label}<span className="pr-count">{item.count}</span></button>)}
      <span className="pr-save-note"><Check size={12} aria-hidden /> 공유한 내용은 자동 저장</span>
    </div>
    {!online && <div className="pr-notice" role="status"><WifiOff size={16} aria-hidden /><span>인터넷 연결이 끊겼어요. 작성 중인 내용은 유지되며, 연결 후 공유할 수 있어요.</span></div>}
    {api.error && <div className="pr-notice pr-notice--error" role="alert"><span>{api.error}</span><button type="button" className="pr-text-button" onClick={() => void api.reload()}><RefreshCw size={13} aria-hidden /> 다시 불러오기</button></div>}
    <div id={`${tabId}-chat`} role="tabpanel" aria-labelledby={`${tabId}-chat-tab`} hidden={tab !== "chat"}>
      {!!pinned.length && <div className="pr-pinned"><span className="pr-pinned-label"><Pin size={13} aria-hidden /> 고정된 글</span><div>{pinned.map(message => <button type="button" key={message.id} onClick={() => showOriginal(message)}><strong>{message.author_name}</strong><span>{shortBody(message)}</span><ArrowUpRight size={13} aria-hidden /></button>)}</div></div>}
      <div className="pr-conversation-wrap">
        <div className="pr-conversation" ref={scrollRef} aria-label="회차 대화" tabIndex={0} onScroll={() => { const element = scrollRef.current; if (element) { nearBottom.current = element.scrollHeight - element.scrollTop - element.clientHeight < 100; if (nearBottom.current) setNewCount(0); } }}>
          {api.loading ? <div className="pr-loading" role="status"><LoaderCircle className="pr-spin" size={20} aria-hidden /><p>저장된 대화를 불러오고 있어요.</p></div> : !roots.length && !api.error ? <div className="pr-empty"><div className="pr-empty-icon"><MessageCircle size={26} strokeWidth={1.4} aria-hidden /><Plus size={12} aria-hidden /></div><p className="pr-eyebrow">LET’S SHARE</p><h3>첫 실습을 함께 나눠볼까요?</h3><p>실습 결과물, 참고 링크, 막힌 부분의 질문까지.<br />이 회차에 남기면 수업이 끝난 뒤에도 다시 볼 수 있어요.</p><div className="pr-empty-tags"><button type="button" disabled={!user || !online} onClick={() => triggerQuickShare("link")}><Link2 size={13} aria-hidden /> 링크</button><button type="button" disabled={!user || !online} onClick={() => triggerQuickShare("image")}><ImageIcon size={13} aria-hidden /> 이미지</button><button type="button" disabled={!user || !online} onClick={() => triggerQuickShare("file")}><FileText size={13} aria-hidden /> 파일</button></div></div> : roots.map((message, index) => {
            const thread = replies.get(message.id) ?? [];
            const previous = roots[index - 1];
            const showDate = !previous || dateFormat.format(new Date(previous.created_at)) !== dateFormat.format(new Date(message.created_at));
            return <Fragment key={message.id}>{showDate && <div className="pr-date-divider"><span>{dateFormat.format(new Date(message.created_at))}</span></div>}<MessageCard message={message} api={api} own={message.author_id === user?.id} instructor={instructor} highlighted={highlight === message.id}>
              <div className="pr-thread-actions">{(!message.deleted_at || thread.length > 0) && <button type="button" className="pr-text-button" aria-expanded={openThreads.has(message.id)} onClick={() => thread.length ? toggleThread(message.id) : startReply(message)}><MessageCircle size={13} aria-hidden />{thread.length ? `답글 ${thread.length}개` : "답글"}{!!thread.length && <ChevronDown size={12} className={openThreads.has(message.id) ? "pr-rotate" : ""} aria-hidden />}</button>}{!message.deleted_at && openThreads.has(message.id) && !!thread.length && <button type="button" className="pr-text-button" onClick={() => startReply(message)}>답글 쓰기</button>}</div>
              {openThreads.has(message.id) && !!thread.length && <div className="pr-thread" aria-label={`${message.author_name}님의 글에 달린 답글`}>{thread.map(reply => <MessageCard key={reply.id} message={reply} api={api} own={reply.author_id === user?.id} instructor={instructor} highlighted={highlight === reply.id} reply />)}</div>}
            </MessageCard></Fragment>;
          })}
        </div>
        {newCount > 0 && <button type="button" className="pr-new-messages" onClick={scrollToLatest}><ArrowDown size={14} aria-hidden /> 새 대화 {newCount}개 <span>최신으로</span></button>}
      </div>
    </div>
    <div id={`${tabId}-materials`} role="tabpanel" aria-labelledby={`${tabId}-materials-tab`} hidden={tab !== "materials"}>
      <div className="pr-material-toolbar"><div className="pr-filters" aria-label="자료 종류 필터">{materialFilters.map(item => <button key={item.value} type="button" aria-pressed={filter === item.value} onClick={() => setFilter(item.value)} className={filter === item.value ? "is-active" : ""}>{item.label}</button>)}</div><button type="button" className="pr-text-button" onClick={focusComposer}><Plus size={14} aria-hidden /> 자료 공유</button></div>
      <div className="pr-material-area">{tab === "materials" && (api.loading ? <div className="pr-loading" role="status"><LoaderCircle className="pr-spin" size={20} aria-hidden />자료를 불러오고 있어요.</div> : !visibleMaterials.length ? <div className="pr-empty pr-empty--materials"><Paperclip size={28} strokeWidth={1.3} aria-hidden /><h3>{filter === "mine" ? "아직 공유한 자료가 없어요" : filter === "all" ? "대화 속 자료가 이곳에 모여요" : "아직 이 종류의 자료가 없어요"}</h3><p>대화에 링크나 파일을 올리면 자동으로 정리돼요.<br />자료를 누르거나 원문으로 돌아가 대화를 이어가세요.</p><button type="button" className="pr-outline-button" onClick={focusComposer}>첫 자료 공유하기 <ArrowUpRight size={14} aria-hidden /></button></div> : <div className="pr-material-grid">{visibleMaterials.map(material => <article className="pr-material-card" key={material.key}>
        <div className="pr-material-type">{material.kind === "link" ? <Link2 size={13} aria-hidden /> : material.kind === "image" ? <ImageIcon size={13} aria-hidden /> : <FileText size={13} aria-hidden />}{material.kind === "link" ? "링크" : material.kind === "image" ? "이미지" : "파일"}{material.message.is_pinned && <Pin size={12} aria-label="고정된 글의 자료" />}</div>
        {material.kind === "link" ? <a className="pr-material-link" href={material.link.url} target="_blank" rel="noopener noreferrer"><span>{linkHost(material.link.url)}</span><strong>{material.link.title || material.link.url}</strong><ExternalLink size={15} aria-label="새 탭에서 열기" /></a> : <AttachmentCard attachment={material.attachment} large />}
        <footer><div><strong>{material.message.author_name}</strong>{material.message.author_role === "instructor" && <span className="pr-role">강사</span>}<time dateTime={material.message.created_at}>{detailFormat.format(new Date(material.message.created_at))}</time></div><button type="button" className="pr-text-button" onClick={() => showOriginal(material.message)}>원문 보기 <ArrowUpRight size={13} aria-hidden /></button></footer>
      </article>)}</div>)}</div>
    </div>
    <Composer sessionNumber={sessionNumber} send={api.send} replyTo={replyTo ? api.messages.find(message => message.id === replyTo.id) ?? replyTo : null} clearReply={() => setReplyTo(null)} hidden={tab !== "chat"} textareaRef={textareaRef} disabled={!user || !online} onSent={() => { setReplyTo(null); requestAnimationFrame(scrollToLatest); }} />
  </section>;
}

function MessageCard({ message, api, own, instructor, highlighted, reply = false, children }: { message: PracticeMessage; api: RoomApi; own: boolean; instructor: boolean; highlighted: boolean; reply?: boolean; children?: ReactNode }) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(message.body);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const editRef = useRef<HTMLTextAreaElement>(null);
  const dirty = editing && draft !== message.body;
  function allowExit() {
    if (busy) { setError("저장이 끝난 뒤 이동해 주세요."); return false; }
    return !dirty || window.confirm("수정 중인 내용이 있어요. 저장하지 않고 나갈까요?");
  }
  useEditorExitGuard(allowExit);
  useBlocker({ shouldBlockFn: () => !allowExit(), disabled: !dirty && !busy, enableBeforeUnload: dirty || busy });
  async function act(action: () => Promise<void>, done?: () => void) {
    if (busy) return;
    setBusy(true); setError(null);
    try { await action(); done?.(); } catch (cause) { setError(errorText(cause)); } finally { setBusy(false); }
  }
  function beginEdit() { setDraft(message.body); setEditing(true); setError(null); requestAnimationFrame(() => editRef.current?.focus()); }
  const visibleBody = practiceDisplayBody(message.body, message.links);
  return <article id={roomMessageId(message.session_number, message.id)} tabIndex={-1} className={`pr-message${reply ? " pr-message--reply" : ""}${highlighted ? " is-highlighted" : ""}${message.deleted_at ? " is-deleted" : ""}`}>
    <div className={`pr-avatar${message.author_role === "instructor" ? " pr-avatar--instructor" : ""}`} aria-hidden>{message.author_name.slice(0, 1) || "·"}</div>
    <div className="pr-message-main"><div className="pr-message-meta"><strong>{message.author_name}</strong><span className={`pr-role${message.author_role === "instructor" ? " pr-role--instructor" : ""}`}>{message.author_role === "instructor" ? "강사" : "수강생"}</span>{own && <span className="pr-own">나</span>}<time dateTime={message.created_at} title={detailFormat.format(new Date(message.created_at))}>{timeFormat.format(new Date(message.created_at))}</time>{message.is_pinned && !message.deleted_at && <Pin size={12} className="pr-message-pin" aria-label="고정된 글" />}
      {!message.deleted_at && (own || instructor) && <details className="pr-menu"><summary aria-label={`${message.author_name}님의 글 메뉴`}><MoreHorizontal size={18} aria-hidden /></summary><div>{own && <button type="button" disabled={busy} onClick={event => { event.currentTarget.closest("details")?.removeAttribute("open"); beginEdit(); }}><Pencil size={13} aria-hidden /> 내용 수정</button>}{instructor && <button type="button" disabled={busy} onClick={event => { event.currentTarget.closest("details")?.removeAttribute("open"); void act(() => api.togglePin(message.id, !message.is_pinned)); }}><Pin size={13} aria-hidden /> {message.is_pinned ? "고정 해제" : "상단에 고정"}</button>}<button type="button" disabled={busy} onClick={event => { event.currentTarget.closest("details")?.removeAttribute("open"); if (window.confirm("이 글을 삭제할까요? 첨부한 자료도 모아보기에서 사라집니다. 답글은 남아 있어요.")) void act(() => api.remove(message.id), () => setEditing(false)); }}><Trash2 size={13} aria-hidden /> 삭제</button></div></details>}
    </div>
    {message.deleted_at ? <p className="pr-deleted-text">삭제된 글입니다.</p> : editing ? <form className="pr-editor" onSubmit={event => { event.preventDefault(); void act(() => api.edit(message.id, draft), () => setEditing(false)); }}><label className="pr-sr-only" htmlFor={`edit-${message.id}`}>내용 수정</label><textarea id={`edit-${message.id}`} ref={editRef} value={draft} onChange={event => setDraft(event.target.value)} maxLength={PRACTICE_BODY_LIMIT} disabled={busy} rows={3} onKeyDown={event => { if ((event.ctrlKey || event.metaKey) && event.key === "Enter" && !event.nativeEvent.isComposing && event.nativeEvent.keyCode !== 229) { event.preventDefault(); void act(() => api.edit(message.id, draft), () => setEditing(false)); } }} /><div><span>첨부파일은 유지돼요. 링크는 본문에서 수정할 수 있어요.</span><button type="button" className="pr-text-button" disabled={busy} onClick={() => { setEditing(false); setError(null); }}>취소</button><button type="submit" className="pr-solid-button" disabled={busy || (!draft.trim() && !message.attachments.length)}>{busy ? "저장 중…" : "저장"}</button></div></form> : <>
      {!!visibleBody && <p className="pr-message-body">{visibleBody}</p>}
      {!!message.links.length && <div className="pr-message-links">{message.links.map(link => <a href={link.url} key={link.url} target="_blank" rel="noopener noreferrer"><span className="pr-link-icon"><Link2 size={15} aria-hidden /></span><span><strong>{link.title || linkHost(link.url)}</strong><span>{link.url}</span></span><ArrowUpRight size={15} aria-label="새 탭에서 열기" /></a>)}</div>}
      {!!message.attachments.length && <div className="pr-message-attachments">{message.attachments.map(attachment => <AttachmentCard key={attachment.id} attachment={attachment} />)}</div>}
    </>}
    {error && <p className="pr-inline-error" role="alert">{error}</p>}{busy && !editing && <span className="pr-action-progress" role="status"><LoaderCircle size={12} className="pr-spin" aria-hidden /> 저장 중…</span>}{children}</div>
  </article>;
}

function AttachmentCard({ attachment, large = false }: { attachment: PracticeAttachment; large?: boolean }) {
  const [url, setUrl] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [preview, setPreview] = useState(false);
  async function openFile() {
    if (busy) return;
    setBusy(true); setError(null);
    try {
      const signedUrl = await getPracticeFileUrl(attachment);
      setUrl(signedUrl);
      if (attachment.kind === "image") setPreview(true);
      else { const link = document.createElement("a"); link.href = signedUrl; link.download = attachment.name; link.rel = "noopener noreferrer"; document.body.appendChild(link); link.click(); link.remove(); }
    } catch { setError("파일을 열지 못했어요. 다시 눌러 주세요."); } finally { setBusy(false); }
  }
  return <div className={`pr-attachment${large ? " pr-attachment--large" : ""}`}>
    {preview && url && <a href={url} target="_blank" rel="noopener noreferrer" className="pr-image-preview"><img src={url} alt={attachment.name} loading="lazy" onError={() => { setPreview(false); setUrl(null); setError("이미지를 다시 불러와 주세요."); }} /></a>}
    <button type="button" className="pr-attachment-open" disabled={busy} onClick={() => void openFile()}><span className="pr-file-icon">{busy ? <LoaderCircle size={18} className="pr-spin" aria-hidden /> : attachment.kind === "image" ? <ImageIcon size={18} aria-hidden /> : <FileText size={18} aria-hidden />}</span><span className="pr-file-info"><strong>{attachment.name}</strong><span>{feedbackFileSize(attachment.size)} <span aria-hidden>·</span> {busy ? "불러오는 중…" : attachment.kind === "image" ? "이미지 보기" : "다운로드"}</span></span>{attachment.kind === "image" ? <ArrowUpRight size={14} aria-hidden /> : <Download size={14} aria-hidden />}</button>
    {error && <p className="pr-inline-error" role="alert">{error}</p>}
  </div>;
}

function Composer({ sessionNumber, send, replyTo, clearReply, hidden, textareaRef, disabled, onSent }: { sessionNumber: number; send: RoomApi["send"]; replyTo: PracticeMessage | null; clearReply: () => void; hidden: boolean; textareaRef: React.RefObject<HTMLTextAreaElement | null>; disabled: boolean; onSent: () => void }) {
  const [body, setBody] = useState("");
  const [files, setFiles] = useState<File[]>([]);
  const [links, setLinks] = useState<PracticeLink[]>([]);
  const [linkOpen, setLinkOpen] = useState(false);
  const [emojiOpen, setEmojiOpen] = useState(false);
  const [linkDraft, setLinkDraft] = useState("");
  const [pending, setPending] = useState(false);
  const [progress, setProgress] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);
  const [dragging, setDragging] = useState(false);
  const pickerRef = useRef<HTMLInputElement>(null);
  const emojiRootRef = useRef<HTMLDivElement>(null);
  const sending = useRef(false);
  useEffect(() => {
    if (!emojiOpen) return;
    const onPointerDown = (event: PointerEvent) => {
      if (!emojiRootRef.current?.contains(event.target as Node)) setEmojiOpen(false);
    };
    document.addEventListener("pointerdown", onPointerDown);
    return () => document.removeEventListener("pointerdown", onPointerDown);
  }, [emojiOpen]);

  function insertEmoji(emoji: string) {
    if (pending) return;
    const target = textareaRef.current;
    const start = target?.selectionStart ?? body.length;
    const end = target?.selectionEnd ?? body.length;
    const next = body.slice(0, start) + emoji + body.slice(end);
    if (next.length > PRACTICE_BODY_LIMIT) {
      setError("내용은 20,000자 이내로 입력해 주세요.");
      return;
    }
    setBody(next);
    setSaved(false);
    setError(null);
    setEmojiOpen(false);
    requestAnimationFrame(() => {
      textareaRef.current?.focus();
      textareaRef.current?.setSelectionRange(start + emoji.length, start + emoji.length);
    });
  }

  const dirty = !!(body.trim() || files.length || links.length || linkDraft.trim());
  const detectedLinks = extractPracticeLinks(body);
  const linkCount = new Set([...detectedLinks, ...links].map(link => link.url)).size;
  function allowExit() {
    if (sending.current) { setError("공유가 끝난 뒤 이동해 주세요. 파일을 저장하고 있어요."); return false; }
    return !dirty || window.confirm("아직 공유하지 않은 내용이 있어요. 작성한 내용을 지우고 나갈까요?");
  }
  useEditorExitGuard(allowExit);
  useBlocker({ shouldBlockFn: () => !allowExit(), disabled: !dirty && !pending, enableBeforeUnload: dirty || pending });
  function addFiles(incoming: File[]) {
    if (pending || disabled) return;
    setError(null); setSaved(false);
    const additions = incoming.filter(file => !files.some(existing => existing.name === file.name && existing.size === file.size && existing.lastModified === file.lastModified));
    if (files.length + additions.length > PRACTICE_FILE_COUNT) { setError("파일은 한 번에 최대 5개까지 첨부할 수 있어요."); return; }
    try { additions.forEach(validateFeedbackUpload); setFiles(current => [...current, ...additions]); }
    catch (cause) { setError(errorText(cause)); }
  }
  function addLink() {
    if (!linkDraft.trim()) return;
    try {
      const url = normalizeFeedbackUrl(linkDraft.trim());
      if (new Set([...detectedLinks, ...links, { url }].map(link => link.url)).size > PRACTICE_LINK_COUNT) throw new Error("링크는 한 글에 최대 10개까지 공유할 수 있어요.");
      if (![...detectedLinks, ...links].some(link => link.url === url)) setLinks(current => [...current, { url }]);
      setLinkDraft(""); setError(null); setSaved(false);
    } catch (cause) { setError(errorText(cause)); }
  }
  async function submit() {
    if (sending.current || disabled || !dirty || replyTo?.deleted_at) return;
    let extraLinks = links;
    if (linkDraft.trim()) {
      try { extraLinks = [...links, { url: normalizeFeedbackUrl(linkDraft.trim()) }]; }
      catch (cause) { setError(errorText(cause)); return; }
    }
    sending.current = true; setPending(true); setError(null); setSaved(false); setProgress("공유를 준비하는 중…");
    const input: PracticeInput = { body, files, links: extraLinks, parentId: replyTo?.id ?? null };
    try { await send(input, setProgress); setBody(""); setFiles([]); setLinks([]); setLinkDraft(""); setLinkOpen(false); setSaved(true); onSent(); }
    catch (cause) { setError(errorText(cause)); }
    finally { sending.current = false; setPending(false); setProgress(""); }
  }
  return <form className={`pr-composer${dragging ? " is-dragging" : ""}`} hidden={hidden} onSubmit={event => { event.preventDefault(); void submit(); }} onDragOver={event => { if (event.dataTransfer.types.includes("Files")) { event.preventDefault(); if (!pending && !disabled) setDragging(true); } }} onDragLeave={event => { if (!event.currentTarget.contains(event.relatedTarget as Node | null)) setDragging(false); }} onDrop={event => { event.preventDefault(); setDragging(false); addFiles(Array.from(event.dataTransfer.files)); }}>
    {replyTo && <div className="pr-reply-banner"><MessageCircle size={14} aria-hidden /><div><strong>{replyTo.author_name}님에게 답글</strong><span>{replyTo.deleted_at ? "원글이 삭제되어 답글을 남길 수 없어요. 답글을 취소하면 새 글로 공유할 수 있어요." : shortBody(replyTo)}</span></div><button type="button" className="pr-icon-button" disabled={pending} aria-label="답글 취소" onClick={clearReply}><X size={15} aria-hidden /></button></div>}
    <div className="pr-composer-heading"><label htmlFor={`practice-draft-${sessionNumber}`}>{replyTo ? "답글 쓰기" : "실습 공유하기"}</label><span>{files.length ? `첨부 ${files.length}/5` : "링크 · 이미지 · 파일"}</span></div>
    <div className="pr-input-box"><textarea id={`practice-draft-${sessionNumber}`} ref={textareaRef} value={body} maxLength={PRACTICE_BODY_LIMIT} rows={3} disabled={pending} placeholder={replyTo ? "함께 생각해 볼 내용이나 자료를 남겨 주세요" : "오늘의 실습 결과나 질문을 공유해 보세요. 링크를 붙여 넣어도 좋아요."} aria-describedby={`practice-hint-${sessionNumber}`} onChange={event => { setBody(event.target.value); setSaved(false); }} onPaste={event => { const pasted = Array.from(event.clipboardData.files); if (pasted.length) { event.preventDefault(); addFiles(pasted); } }} onKeyDown={event => { if ((event.ctrlKey || event.metaKey) && event.key === "Enter" && !event.nativeEvent.isComposing && event.nativeEvent.keyCode !== 229) { event.preventDefault(); void submit(); } }} />
      {!!files.length && <ul className="pr-draft-files">{files.map((file, index) => <li key={`${file.name}-${file.lastModified}-${index}`}>{file.type.startsWith("image/") ? <ImageIcon size={14} aria-hidden /> : <FileText size={14} aria-hidden />}<span><strong>{file.name}</strong><small>{feedbackFileSize(file.size)}</small></span><button type="button" className="pr-icon-button" disabled={pending} aria-label={`${file.name} 첨부 취소`} onClick={() => setFiles(current => current.filter((_, i) => i !== index))}><X size={14} aria-hidden /></button></li>)}</ul>}
      {!!links.length && <div className="pr-draft-links">{links.map(link => <div key={link.url}><Link2 size={12} aria-hidden /><span>{link.url}</span><button type="button" className="pr-icon-button" disabled={pending} aria-label={`${link.url} 링크 삭제`} onClick={() => setLinks(current => current.filter(item => item.url !== link.url))}><X size={13} aria-hidden /></button></div>)}</div>}
      {linkOpen && <div className="pr-link-input"><label className="pr-sr-only" htmlFor={`practice-link-${sessionNumber}`}>공유할 링크 주소</label><Link2 size={14} aria-hidden /><input id={`practice-link-${sessionNumber}`} type="url" placeholder="https://example.com" value={linkDraft} disabled={pending} onChange={event => setLinkDraft(event.target.value)} onKeyDown={event => { if (event.key === "Enter" && !event.nativeEvent.isComposing) { event.preventDefault(); addLink(); } }} /><button type="button" className="pr-text-button" disabled={pending || !linkDraft.trim()} onClick={addLink}>추가</button><button type="button" className="pr-icon-button" disabled={pending} aria-label="링크 입력 닫기" onClick={() => { setLinkOpen(false); setLinkDraft(""); }}><X size={14} aria-hidden /></button></div>}
      <div className="pr-composer-tools"><div><input id={`practice-image-picker-${sessionNumber}`} type="file" multiple accept="image/jpeg,image/png,image/webp" className="pr-sr-only" tabIndex={-1} aria-label="실습 이미지 선택" onChange={event => { addFiles(Array.from(event.target.files ?? [])); event.target.value = ""; }} /><input id={`practice-file-picker-${sessionNumber}`} ref={pickerRef} type="file" multiple accept={FEEDBACK_UPLOAD_ACCEPT} className="pr-sr-only" tabIndex={-1} aria-label="실습 파일 선택" onChange={event => { addFiles(Array.from(event.target.files ?? [])); event.target.value = ""; }} /><div className="pr-emoji-control" ref={emojiRootRef}>
        <button type="button" className="pr-tool-button"
          aria-label="이모지 선택" aria-expanded={emojiOpen}
          aria-controls={"practice-emoji-panel-" + sessionNumber}
          disabled={pending} onClick={() => setEmojiOpen(open => !open)}>
          <Smile size={15} aria-hidden /> 이모지
        </button>
        {emojiOpen && <div className="pr-emoji-panel"
          id={"practice-emoji-panel-" + sessionNumber} role="group"
          aria-label="채팅 이모지 선택"
          onKeyDown={event => {
            if (event.key === "Escape") {
              event.preventDefault();
              setEmojiOpen(false);
              textareaRef.current?.focus();
            }
          }}>
          <p className="pr-emoji-heading">이모지 선택</p>
          {EMOJI_GROUPS.map(group => <div className="pr-emoji-section" key={group.label}>
            <p>{group.label}</p>
            <div className="pr-emoji-grid">
              {group.items.map(emoji => <button
                key={emoji} type="button" title={emoji}
                aria-label={emoji + " 입력"} onClick={() => insertEmoji(emoji)}>
                {emoji}
              </button>)}
            </div>
          </div>)}
        </div>}
      </div><button type="button" className="pr-tool-button" disabled={pending || disabled} onClick={() => pickerRef.current?.click()}><Paperclip size={15} aria-hidden /> 파일 첨부</button><button id={`practice-link-toggle-${sessionNumber}`} type="button" className="pr-tool-button" aria-expanded={linkOpen} disabled={pending || disabled} onClick={() => { setLinkOpen(current => !current); if (!linkOpen) requestAnimationFrame(() => document.getElementById(`practice-link-${sessionNumber}`)?.focus()); }}><Link2 size={15} aria-hidden /> 링크</button>{linkCount > 0 && <span className="pr-link-count">링크 {linkCount}개 인식</span>}</div><button type="submit" className="pr-solid-button pr-send" disabled={pending || disabled || !dirty || !!replyTo?.deleted_at}>{pending ? <LoaderCircle size={14} className="pr-spin" aria-hidden /> : <Send size={14} aria-hidden />}{pending ? "공유 중…" : replyTo ? "답글 공유" : "공유하기"}</button></div>
    </div>
    <div className="pr-composer-foot"><p id={`practice-hint-${sessionNumber}`}>파일당 10MB · 최대 5개 <span className="pr-desktop-hint">· 끌어 놓기 / 이미지 붙여넣기</span></p><span className="pr-shortcut">Ctrl / ⌘ + Enter로 공유</span></div>
    {pending && <p className="pr-save-status" role="status"><LoaderCircle className="pr-spin" size={13} aria-hidden />{progress}</p>}{saved && !dirty && <p className="pr-save-status" role="status"><Check size={13} aria-hidden />이 회차에 저장했어요. 수강생 모두 볼 수 있어요.</p>}{error && <p className="pr-inline-error" role="alert">{error}<span> 작성한 내용과 첨부파일은 그대로 있어요.</span></p>}{dragging && <div className="pr-drop-overlay"><Paperclip size={22} aria-hidden /> 여기에 놓아 파일 첨부</div>}
  </form>;
}
