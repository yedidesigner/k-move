import { useEffect, useRef, useState } from "react";
import { useBlocker } from "@tanstack/react-router";
import { ArrowUpRight, Check, ChevronRight, Link2, Search, Users } from "lucide-react";
import { useAuth } from "@/lib/auth";
import { useEditorExitGuard } from "@/lib/editor-exit-guard";
import {
  enrollStudent,
  listAssignments,
  listEnrollments,
  listOperationLog,
  listReviewPublications,
  listStudentNotes,
  listSubmissions,
  relinkStudentAccount,
  saveEnrollment,
  saveStudentNote,
  type Assignment,
  type Enrollment,
  type ReviewPublication,
  type StudentNote,
  type Submission,
} from "@/lib/instructor-api";
import {
  loadStudentFolders,
  loadStudentProfiles,
  studentOperationError,
  type StudentFolder,
  type StudentProfile,
} from "@/lib/student-directory";
import { koreanRecordDate, matchesStudentSearch, safeExternalUrl } from "@/lib/student-operations";
import { PageHeader, Spinner } from "@/components/lms";

const inputClass =
  "min-h-11 w-full border border-neutral-300 bg-white px-3 py-2 text-sm text-neutral-950 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-black";
const actionClass =
  "inline-flex min-h-11 items-center justify-center gap-2 border border-neutral-300 px-4 text-sm font-medium hover:bg-neutral-100 disabled:cursor-not-allowed disabled:opacity-50";
const primaryClass = `${actionClass} border-black bg-black text-white hover:bg-neutral-800`;
type OperationLog = Awaited<ReturnType<typeof listOperationLog>>[number];
type Directory = {
  enrollments: Enrollment[];
  folders: StudentFolder[];
  profiles: StudentProfile[];
  submissions: Submission[];
  publications: ReviewPublication[];
  notes: StudentNote[];
  assignments: Assignment[];
  operations: OperationLog[];
};

export function StudentManager() {
  const { user, status } = useAuth();
  if (status !== "instructor" || !user) return <p role="alert">강사 계정으로 접근해 주세요.</p>;
  return <InstructorStudents key={user.id} />;
}

function InstructorStudents() {
  const [data, setData] = useState<Directory | null>(null);
  const [error, setError] = useState("");
  const [reload, setReload] = useState(0);
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("active");
  const [selectedId, setSelectedId] = useState("");
  const [noteDirty, setNoteDirty] = useState(false);
  const [newUserId, setNewUserId] = useState("");
  const [adding, setAdding] = useState(false);
  useEditorExitGuard(() => !adding);

  useEffect(() => {
    let active = true;
    setError("");
    void Promise.all([
      listEnrollments(),
      loadStudentFolders(),
      loadStudentProfiles(),
      listSubmissions(),
      listReviewPublications(),
      listStudentNotes(),
      listAssignments(),
      listOperationLog(),
    ])
      .then(
        ([
          enrollments,
          folders,
          profiles,
          submissions,
          publications,
          notes,
          assignments,
          operations,
        ]) => {
          if (!active) return;
          setData({
            enrollments,
            folders,
            profiles,
            submissions,
            publications,
            notes,
            assignments,
            operations,
          });
          setSelectedId((previous) =>
            enrollments.some((row) => row.user_id === previous)
              ? previous
              : ((enrollments.find((row) => row.status === "active") ?? enrollments[0])?.user_id ??
                ""),
          );
        },
      )
      .catch((reason) => {
        if (active)
          setError(
            studentOperationError(reason, "학생 정보를 불러오지 못했습니다. 다시 시도해 주세요."),
          );
      });
    return () => {
      active = false;
    };
  }, [reload]);

  useBlocker({
    disabled: !noteDirty,
    enableBeforeUnload: noteDirty,
    shouldBlockFn: () =>
      noteDirty && !window.confirm("저장하지 않은 강사 메모가 있습니다. 내용을 버리고 이동할까요?"),
  });

  function selectStudent(userId: string) {
    if (userId === selectedId) return;
    if (
      noteDirty &&
      !window.confirm("저장하지 않은 강사 메모가 있습니다. 내용을 버리고 학생을 변경할까요?")
    )
      return;
    setNoteDirty(false);
    setSelectedId(userId);
  }

  async function addStudent() {
    if (!newUserId || adding) return;
    setAdding(true);
    setError("");
    try {
      await enrollStudent(newUserId);
      setNewUserId("");
      setReload((value) => value + 1);
    } catch (reason) {
      setError(
        studentOperationError(
          reason,
          "수강생을 추가하지 못했습니다. 계정과 폴더 연결을 확인해 주세요.",
        ),
      );
    } finally {
      setAdding(false);
    }
  }

  if (!data)
    return (
      <>
        <PageHeader title="학생 관리" description="수강생별 제출 이력과 계정 연결을 확인합니다." />
        {error ? (
          <div role="alert" className="border p-5">
            <p>{error}</p>
            <button
              className={`${actionClass} mt-4`}
              onClick={() => setReload((value) => value + 1)}
            >
              다시 시도
            </button>
          </div>
        ) : (
          <Spinner label="수강생 정보 확인 중" />
        )}
      </>
    );
  const visible = data.enrollments.filter(
    (row) =>
      matchesStudentSearch(row, query) && (statusFilter === "all" || row.status === statusFilter),
  );
  const selected = data.enrollments.find((row) => row.user_id === selectedId);
  const candidates = data.profiles.filter(
    (profile) =>
      !data.enrollments.some((row) => row.user_id === profile.id) &&
      data.folders.some(
        (folder) => folder.user_id === profile.id && folder.name === profile.username,
      ) &&
      !["강예지", "tomset", "홍길동", "홍길순"].includes(profile.username),
  );
  return (
    <div className="space-y-6 text-neutral-950">
      <PageHeader
        title="학생 관리"
        description="현재 과정의 수강생과 학생별 제출 기록을 관리합니다."
      />
      <div className="flex flex-wrap items-center gap-x-6 gap-y-2 border-y border-neutral-200 py-4 text-sm">
        <span className="inline-flex items-center gap-2">
          <Users className="size-4" aria-hidden />
          수강 중{" "}
          <strong>{data.enrollments.filter((row) => row.status === "active").length}명</strong>
        </span>
        <span className="text-neutral-600">
          수강 종료 {data.enrollments.filter((row) => row.status === "completed").length}명
        </span>
        <span className="text-neutral-600">
          Drive 확인 필요{" "}
          {
            data.enrollments.filter(
              (row) =>
                row.status === "active" &&
                !data.folders.find((folder) => folder.user_id === row.user_id)?.sharing_ready,
            ).length
          }
          명
        </span>
      </div>
      {error && (
        <p role="alert" className="border border-neutral-400 p-4 text-sm">
          {error}
        </p>
      )}
      <div className="grid gap-6 xl:grid-cols-[250px_minmax(0,1fr)]">
        <section aria-label="수강생 목록" className="min-w-0">
          <div className="relative mb-3">
            <Search
              className="pointer-events-none absolute left-3 top-3.5 size-4 text-neutral-500"
              aria-hidden
            />
            <input
              aria-label="학생 이름 검색"
              placeholder="학생 이름 검색"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              className={`${inputClass} pl-9`}
            />
          </div>
          <label className="mb-3 block">
            <span className="sr-only">수강 상태 필터</span>
            <select
              value={statusFilter}
              onChange={(event) => setStatusFilter(event.target.value)}
              className={inputClass}
            >
              <option value="active">수강 중</option>
              <option value="completed">수강 종료</option>
              <option value="all">전체</option>
            </select>
          </label>
          <div className="max-h-[28rem] overflow-y-auto border-y border-neutral-200">
            {visible.map((student) => {
              const submissions = data.submissions.filter(
                (item) => item.user_id === student.user_id,
              );
              const folderReady = data.folders.find(
                (folder) => folder.user_id === student.user_id,
              )?.sharing_ready;
              return (
                <button
                  type="button"
                  key={student.user_id}
                  onClick={() => selectStudent(student.user_id)}
                  aria-pressed={selectedId === student.user_id}
                  className={`flex min-h-16 w-full items-center justify-between gap-3 border-b border-neutral-200 px-3 py-3 text-left ${selectedId === student.user_id ? "bg-neutral-950 text-white" : "bg-white hover:bg-neutral-50"}`}
                >
                  <span>
                    <span className="block text-sm font-semibold">{student.name}</span>
                    <span
                      className={`mt-1 block text-xs ${selectedId === student.user_id ? "text-neutral-300" : "text-neutral-500"}`}
                    >
                      {submissions.length ? `제출 기록 ${submissions.length}건` : "제출 기록 없음"}
                      {!folderReady ? " · Drive 확인" : ""}
                    </span>
                  </span>
                  <ChevronRight className="size-4 shrink-0" aria-hidden />
                </button>
              );
            })}
            {!visible.length && (
              <p className="px-3 py-6 text-sm text-neutral-500">조건에 맞는 수강생이 없습니다.</p>
            )}
          </div>
          <details className="mt-5 border border-neutral-200 p-3 text-sm">
            <summary className="min-h-9 cursor-pointer font-medium">
              기존 계정에서 수강생 추가
            </summary>
            <p className="my-3 text-xs leading-5 text-neutral-600">
              학생 계정과 개인 Drive 폴더가 연결된 계정을 현재 과정에 등록합니다.
            </p>
            <label className="block">
              <span className="sr-only">추가할 학생 계정</span>
              <select
                value={newUserId}
                onChange={(event) => setNewUserId(event.target.value)}
                className={inputClass}
                disabled={adding}
              >
                <option value="">계정 선택</option>
                {candidates.map((profile) => (
                  <option key={profile.id} value={profile.id}>
                    {profile.username}
                  </option>
                ))}
              </select>
            </label>
            {!candidates.length && (
              <p className="mt-2 text-xs leading-5 text-neutral-500">
                추가 가능한 연결 계정이 없습니다.
              </p>
            )}
            <button
              type="button"
              onClick={() => void addStudent()}
              disabled={!newUserId || adding}
              className={`${primaryClass} mt-3 w-full`}
            >
              {adding ? "추가 중…" : "수강생 추가"}
            </button>
          </details>
        </section>
        {selected ? (
          <StudentDetail
            key={selected.user_id}
            student={selected}
            data={data}
            onReload={() => setReload((value) => value + 1)}
            onDirtyChange={setNoteDirty}
          />
        ) : (
          <p className="border border-neutral-200 p-6 text-sm text-neutral-500">
            수강생을 선택해 주세요.
          </p>
        )}
      </div>
    </div>
  );
}

function StudentDetail({
  student,
  data,
  onReload,
  onDirtyChange,
}: {
  student: Enrollment;
  data: Directory;
  onReload: () => void;
  onDirtyChange: (dirty: boolean) => void;
}) {
  const alive = useRef(true);
  useEffect(() => {
    alive.current = true;
    return () => {
      alive.current = false;
    };
  }, []);
  const originalNote = data.notes.find((row) => row.user_id === student.user_id);
  const [note, setNote] = useState(originalNote?.content ?? "");
  const [noteVersion, setNoteVersion] = useState(originalNote?.version ?? 0);
  const [savedNote, setSavedNote] = useState(originalNote?.content ?? "");
  const [notice, setNotice] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [nextAccount, setNextAccount] = useState(student.user_id);
  const [mappingConfirm, setMappingConfirm] = useState(false);
  useEditorExitGuard(
    () =>
      !busy &&
      (note === savedNote ||
        window.confirm("저장하지 않은 강사 메모가 있습니다. 내용을 버리고 로그아웃할까요?")),
  );
  const folder = data.folders.find((row) => row.user_id === student.user_id);
  const profile = data.profiles.find((row) => row.id === student.user_id);
  const submissions = data.submissions
    .filter((row) => row.user_id === student.user_id)
    .sort((a, b) => b.submitted_at.localeCompare(a.submitted_at));
  const relatedLog = data.operations
    .filter((row) => row.target_id === student.user_id || row.target_id === student.student_id)
    .slice()
    .reverse()
    .slice(0, 10);
  const matchingAccounts = data.profiles.filter(
    (row) =>
      row.username === student.name &&
      (row.id === student.user_id ||
        !data.enrollments.some((enrollment) => enrollment.user_id === row.id)),
  );
  const safeAssignmentFolder = folder?.sharing_ready
    ? safeExternalUrl(folder.assignment_folder_url)
    : null;
  const safePortfolioFolder = folder?.sharing_ready
    ? safeExternalUrl(folder.portfolio_folder_url)
    : null;

  async function saveNote() {
    if (busy) return;
    setBusy(true);
    setError("");
    setNotice("");
    try {
      const saved = await saveStudentNote(student.user_id, note, noteVersion);
      if (!alive.current) return;
      setNoteVersion(saved.version);
      setSavedNote(saved.content);
      setNote(saved.content);
      onDirtyChange(false);
      setNotice("강사 메모를 저장했습니다.");
    } catch (reason) {
      if (alive.current)
        setError(
          studentOperationError(reason, "메모를 저장하지 못했습니다. 입력한 내용은 유지됩니다."),
        );
    } finally {
      if (alive.current) setBusy(false);
    }
  }

  async function refreshNote() {
    if (
      busy ||
      (note !== savedNote &&
        !window.confirm("작성 중인 메모를 버리고 서버에 저장된 최신 메모를 불러올까요?"))
    )
      return;
    setBusy(true);
    setError("");
    try {
      const notes = await listStudentNotes();
      if (!alive.current) return;
      const latest = notes.find((row) => row.user_id === student.user_id);
      setNote(latest?.content ?? "");
      setSavedNote(latest?.content ?? "");
      setNoteVersion(latest?.version ?? 0);
      onDirtyChange(false);
      setNotice("최신 강사 메모를 불러왔습니다.");
    } catch (reason) {
      if (alive.current)
        setError(studentOperationError(reason, "최신 메모를 불러오지 못했습니다."));
    } finally {
      if (alive.current) setBusy(false);
    }
  }

  async function changeStatus() {
    const nextStatus = student.status === "active" ? "completed" : "active";
    if (
      !window.confirm(
        `${student.name} 학생을 ${nextStatus === "completed" ? "수강 종료" : "수강 중"} 상태로 변경할까요? 기존 제출 기록은 유지됩니다.`,
      )
    )
      return;
    setBusy(true);
    setError("");
    setNotice("");
    try {
      await saveEnrollment(student.user_id, { status: nextStatus });
      if (alive.current) {
        onReload();
        setNotice("수강 상태를 변경했습니다.");
      }
    } catch (reason) {
      if (alive.current)
        setError(studentOperationError(reason, "수강 상태를 변경하지 못했습니다."));
    } finally {
      if (alive.current) setBusy(false);
    }
  }

  async function relink() {
    if (!mappingConfirm || nextAccount === student.user_id || busy) return;
    setBusy(true);
    setError("");
    try {
      await relinkStudentAccount(student.student_id, nextAccount);
      if (!alive.current) return;
      setMappingConfirm(false);
      onReload();
      setNotice("계정 연결을 변경했습니다.");
    } catch (reason) {
      if (alive.current)
        setError(
          studentOperationError(
            reason,
            "기존 자료가 있는 계정은 연결을 변경할 수 없습니다. 학생 이름과 폴더 연결도 확인해 주세요.",
          ),
        );
    } finally {
      if (alive.current) setBusy(false);
    }
  }

  return (
    <section
      aria-labelledby="student-detail-title"
      className="min-w-0 border border-neutral-200 bg-white p-5 sm:p-6"
    >
      <div className="flex flex-wrap items-start justify-between gap-3 border-b border-neutral-200 pb-5">
        <div>
          <p className="text-xs text-neutral-500">
            학생 상세 · {student.status === "active" ? "수강 중" : "수강 종료"}
          </p>
          <h2 id="student-detail-title" className="mt-2 text-2xl font-semibold tracking-tight">
            {student.name}
          </h2>
        </div>
        <a
          href={`/portfolio?student=${encodeURIComponent(student.user_id)}`}
          className={actionClass}
        >
          포트폴리오 <ArrowUpRight className="size-4" aria-hidden />
        </a>
      </div>
      {notice && (
        <p role="status" className="mt-4 flex items-center gap-2 text-sm">
          <Check className="size-4" aria-hidden />
          {notice}
        </p>
      )}
      {error && (
        <p role="alert" className="mt-4 border border-neutral-400 p-3 text-sm">
          {error}
        </p>
      )}
      <section className="mt-6" aria-labelledby="student-history-title">
        <h3 id="student-history-title" className="text-base font-semibold">
          제출·피드백 이력
        </h3>
        <p className="mt-1 text-xs leading-5 text-neutral-500">
          실제로 확정한 제출 버전과 공개한 피드백을 보여줍니다.
        </p>
        {submissions.length ? (
          <ul className="mt-4 divide-y divide-neutral-200 border-y border-neutral-200">
            {submissions.map((submission) => {
              const assignment = data.assignments.find(
                (row) => row.id === submission.assignment_id,
              );
              const publication = data.publications
                .filter((row) => row.submission_id === submission.id)
                .sort((a, b) => b.version - a.version)[0];
              return (
                <li key={submission.id}>
                  <a
                    href={`/feedback?submission=${encodeURIComponent(submission.id)}`}
                    className="flex min-h-20 items-center justify-between gap-4 py-4 hover:bg-neutral-50"
                  >
                    <div>
                      <p className="text-sm font-medium">
                        {assignment
                          ? `${String(assignment.session_number).padStart(2, "0")}회차 · ${assignment.title}`
                          : "과제 제출"}
                        <span className="ml-2 text-xs text-neutral-500">v{submission.version}</span>
                      </p>
                      <p className="mt-1 text-xs text-neutral-500">
                        {koreanRecordDate(submission.submitted_at)}
                        {submission.late ? " · 지각 제출" : ""}
                      </p>
                      <p className="mt-2 text-xs">
                        {publication
                          ? `피드백 공개 · ${koreanRecordDate(publication.published_at)}`
                          : "공개 피드백 없음"}
                      </p>
                    </div>
                    <ChevronRight className="size-4 shrink-0" aria-hidden />
                  </a>
                </li>
              );
            })}
          </ul>
        ) : (
          <p className="mt-4 border-y border-neutral-200 py-6 text-sm text-neutral-500">
            확정한 제출 기록이 없습니다.
          </p>
        )}
      </section>
      <section className="mt-7" aria-labelledby="student-note-title">
        <div className="flex items-baseline justify-between gap-2">
          <h3 id="student-note-title" className="text-base font-semibold">
            강사 메모
          </h3>
          <span className="text-xs text-neutral-500">학생에게 비공개</span>
        </div>
        <label className="mt-3 block">
          <span className="sr-only">{student.name} 강사 메모</span>
          <textarea
            value={note}
            onChange={(event) => {
              setNote(event.target.value);
              onDirtyChange(event.target.value !== savedNote);
            }}
            rows={4}
            maxLength={20000}
            className={`${inputClass} resize-y leading-6`}
            placeholder="다음 상담이나 검토에 참고할 내용을 기록해 주세요."
          />
        </label>
        <div className="mt-3 flex flex-wrap items-center justify-between gap-2">
          <span className="text-xs text-neutral-500">
            {note !== savedNote ? "저장하지 않은 변경 사항" : "저장된 내용"}
          </span>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => void refreshNote()}
              disabled={busy}
              className={actionClass}
            >
              최신 메모 불러오기
            </button>
            <button
              onClick={() => void saveNote()}
              disabled={busy || note === savedNote}
              className={primaryClass}
            >
              {busy ? "처리 중…" : "메모 저장"}
            </button>
          </div>
        </div>
      </section>
      <details className="mt-7 border-t border-neutral-200 pt-4">
        <summary className="min-h-10 cursor-pointer text-sm font-semibold">
          계정·Drive 연결 정보
        </summary>
        <dl className="mt-3 grid grid-cols-[110px_minmax(0,1fr)] gap-x-3 gap-y-3 text-sm">
          <dt className="text-neutral-500">LMS 계정</dt>
          <dd>{profile?.username ?? student.name}</dd>
          <dt className="text-neutral-500">Google 이메일</dt>
          <dd className="break-all">{folder?.google_email || "연결 정보 없음"}</dd>
          <dt className="text-neutral-500">공유 상태</dt>
          <dd>{folder?.sharing_ready ? "공유 준비 완료" : "공유 권한 확인 필요"}</dd>
          <dt className="text-neutral-500">과정 등록</dt>
          <dd>{koreanRecordDate(student.joined_at)}</dd>
        </dl>
        <div className="mt-4 flex flex-wrap gap-2">
          {safeAssignmentFolder && (
            <a
              href={safeAssignmentFolder}
              target="_blank"
              rel="noopener noreferrer"
              className={actionClass}
            >
              과제 폴더 <ArrowUpRight className="size-4" aria-hidden />
            </a>
          )}
          {safePortfolioFolder && (
            <a
              href={safePortfolioFolder}
              target="_blank"
              rel="noopener noreferrer"
              className={actionClass}
            >
              포트폴리오 폴더 <ArrowUpRight className="size-4" aria-hidden />
            </a>
          )}
        </div>
        {!folder?.sharing_ready && (
          <p className="mt-3 text-xs leading-5 text-neutral-600">
            Google 계정의 공유 권한을 확인한 뒤 폴더를 사용해 주세요. 다른 학생의 폴더로 연결하지
            않습니다.
          </p>
        )}
        <p className="mt-3 text-xs leading-5 text-neutral-500">
          LMS 로그인과 Google 로그인은 별개입니다. 폴더 파일 수나 방문 기록을 제출·진도로 계산하지
          않습니다.
        </p>
        <div className="mt-5 border-t border-neutral-200 pt-4">
          <label className="block text-sm font-medium">
            LMS 계정 연결 변경
            <select
              value={nextAccount}
              onChange={(event) => {
                setNextAccount(event.target.value);
                setMappingConfirm(false);
              }}
              disabled={busy}
              className={`${inputClass} mt-2`}
            >
              {matchingAccounts.map((account) => (
                <option value={account.id} key={account.id}>
                  {account.username}
                  {account.id === student.user_id ? " · 현재 연결" : " · 다른 계정"}
                </option>
              ))}
            </select>
          </label>
          <p className="mt-2 text-xs leading-5 text-neutral-500">
            동일한 본명과 개인 폴더가 확인된 계정만 연결할 수 있습니다. 이미 제출·피드백·포트폴리오
            자료가 있으면 연결 변경이 제한됩니다.
          </p>
          {nextAccount !== student.user_id && (
            <label className="mt-3 flex items-start gap-2 text-sm">
              <input
                type="checkbox"
                checked={mappingConfirm}
                onChange={(event) => setMappingConfirm(event.target.checked)}
                className="mt-1"
              />
              이 학생의 연결 계정이 바뀌는 것을 확인했습니다.
            </label>
          )}
          <button
            type="button"
            className={`${actionClass} mt-3`}
            disabled={busy || !mappingConfirm || nextAccount === student.user_id}
            onClick={() => void relink()}
          >
            <Link2 className="size-4" aria-hidden />
            연결 변경
          </button>
        </div>
        <div className="mt-5 border-t border-neutral-200 pt-4">
          <p className="text-sm font-medium">수강 상태</p>
          <p className="mt-1 text-xs leading-5 text-neutral-500">
            수강 종료 시 기존 제출과 피드백 이력은 보존됩니다.
          </p>
          <button
            type="button"
            disabled={busy}
            onClick={() => void changeStatus()}
            className={`${actionClass} mt-3`}
          >
            {student.status === "active" ? "수강 종료로 변경" : "수강 중으로 변경"}
          </button>
        </div>
      </details>
      {relatedLog.length > 0 && (
        <details className="mt-4 border-t border-neutral-200 pt-4">
          <summary className="min-h-10 cursor-pointer text-sm font-medium">
            최근 운영 변경 기록
          </summary>
          <ul className="space-y-3 py-3">
            {relatedLog.map((entry) => (
              <li key={entry.id} className="text-xs">
                <span className="font-medium">
                  {entry.action === "student.note"
                    ? "강사 메모 변경"
                    : entry.action === "enrollment.status"
                      ? "수강 상태 변경"
                      : entry.action === "student.relinked"
                        ? "계정 연결 변경"
                        : entry.action === "enrollment.added"
                          ? "수강생 등록"
                          : "학생 운영 정보 변경"}
                </span>
                <span className="ml-3 text-neutral-500">{koreanRecordDate(entry.created_at)}</span>
              </li>
            ))}
          </ul>
        </details>
      )}
    </section>
  );
}
