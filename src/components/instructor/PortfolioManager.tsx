import { useEffect, useRef, useState, type FormEvent } from "react";
import { useBlocker } from "@tanstack/react-router";
import { ArrowUpRight, ChevronRight, FolderOpen, Plus, Search, X } from "lucide-react";
import { useAuth } from "@/lib/auth";
import { useEditorExitGuard } from "@/lib/editor-exit-guard";
import {
  appendPortfolioVersion,
  listEnrollments,
  listPortfolioVersions,
  type Enrollment,
  type PortfolioStage,
  type PortfolioVersion,
} from "@/lib/instructor-api";
import {
  loadStudentFolders,
  studentOperationError,
  type StudentFolder,
} from "@/lib/student-directory";
import {
  koreanRecordDate,
  matchesStudentSearch,
  normalizedProjectValues,
  normalizedVersionValues,
  PORTFOLIO_STAGES,
  portfolioStageLabel,
  safeExternalUrl,
} from "@/lib/student-operations";
import { PageHeader, Spinner } from "@/components/lms";
import { StudentDriveFolders } from "@/components/StudentDriveFolders";

const inputClass =
  "min-h-11 w-full border border-neutral-300 bg-white px-3 py-2 text-sm focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-black";
const actionClass =
  "inline-flex min-h-11 items-center justify-center gap-2 border border-neutral-300 px-4 text-sm font-medium hover:bg-neutral-100 disabled:cursor-not-allowed disabled:opacity-50";
const primaryClass = `${actionClass} border-black bg-black text-white hover:bg-neutral-800`;

export function PortfolioManager() {
  const { user, status } = useAuth();
  if (!user || (status !== "student" && status !== "instructor"))
    return <Spinner label="로그인 상태 확인 중" />;
  return (
    <PortfolioWorkspace
      key={`${user.id}:${status}`}
      userId={user.id}
      instructor={status === "instructor"}
    />
  );
}

function PortfolioWorkspace({ userId, instructor }: { userId: string; instructor: boolean }) {
  const [enrollments, setEnrollments] = useState<Enrollment[]>([]);
  const [versions, setVersions] = useState<PortfolioVersion[]>([]);
  const [folders, setFolders] = useState<StudentFolder[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [reload, setReload] = useState(0);
  const [selectedUser, setSelectedUser] = useState(instructor ? "" : userId);
  const [projectKey, setProjectKey] = useState("");
  const [query, setQuery] = useState("");
  const [editorOpen, setEditorOpen] = useState(false);
  const [newProject, setNewProject] = useState(false);
  const [dirty, setDirty] = useState(false);
  const [notice, setNotice] = useState("");

  useEffect(() => {
    let active = true;
    setError("");
    void Promise.all([
      listEnrollments(),
      listPortfolioVersions(),
      loadStudentFolders(instructor ? undefined : userId),
    ])
      .then(([students, savedVersions, folderRows]) => {
        if (!active) return;
        const permittedStudents = instructor
          ? students
          : students.filter((student) => student.user_id === userId);
        const permittedVersions = instructor
          ? savedVersions
          : savedVersions.filter((version) => version.user_id === userId);
        setEnrollments(permittedStudents);
        setVersions(permittedVersions);
        setFolders(folderRows);
        setSelectedUser((previous) => {
          if (!instructor) return userId;
          const requested = new URLSearchParams(window.location.search).get("student");
          if (permittedStudents.some((student) => student.user_id === previous)) return previous;
          if (requested && permittedStudents.some((student) => student.user_id === requested))
            return requested;
          return (
            (
              permittedStudents.find((student) => student.status === "active") ??
              permittedStudents[0]
            )?.user_id ?? ""
          );
        });
      })
      .catch((reason) => {
        if (active)
          setError(studentOperationError(reason, "포트폴리오 정보를 불러오지 못했습니다."));
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [instructor, userId, reload]);

  useBlocker({
    disabled: !dirty,
    enableBeforeUnload: dirty,
    shouldBlockFn: () =>
      dirty && !window.confirm("저장하지 않은 버전 정보가 있습니다. 내용을 버리고 이동할까요?"),
  });

  function canLeaveEditor() {
    return (
      !dirty || window.confirm("저장하지 않은 버전 정보가 있습니다. 내용을 버리고 이동할까요?")
    );
  }
  function selectStudent(id: string) {
    if (id === selectedUser || !canLeaveEditor()) return;
    setSelectedUser(id);
    setProjectKey("");
    setEditorOpen(false);
    setDirty(false);
    setNotice("");
  }
  function selectProject(key: string) {
    if (key === projectKey || !canLeaveEditor()) return;
    setProjectKey(key);
    setEditorOpen(false);
    setDirty(false);
    setNotice("");
  }
  function openEditor(createProject: boolean) {
    if (!canLeaveEditor()) return;
    setNewProject(createProject);
    setEditorOpen(true);
    setDirty(false);
    setNotice("");
  }

  const selectedStudent = enrollments.find((student) => student.user_id === selectedUser);
  const studentVersions = versions
    .filter((version) => version.user_id === selectedUser)
    .sort((a, b) => b.version - a.version || b.created_at.localeCompare(a.created_at));
  const projects = [
    ...new Map(
      studentVersions
        .slice()
        .reverse()
        .map((version) => [version.project_key, version]),
    ).values(),
  ].sort((a, b) => b.created_at.localeCompare(a.created_at));
  const selectedProject =
    projects.find((project) => project.project_key === projectKey) ?? projects[0];
  const history = selectedProject
    ? studentVersions.filter((version) => version.project_key === selectedProject.project_key)
    : [];
  const folder = folders.find((item) => item.user_id === selectedUser);
  const folderUrl = folder?.sharing_ready ? safeExternalUrl(folder.portfolio_folder_url) : null;
  const canAppend = selectedStudent?.status === "active";

  return (
    <div className="space-y-6 text-neutral-950">
      <PageHeader
        title={instructor ? "학생 포트폴리오" : "내 포트폴리오"}
        description="프로젝트별 작업과 수정본을 기록하고 이전 버전과 비교합니다."
      />
      {error && (
        <div
          role="alert"
          className="flex flex-wrap items-center justify-between gap-3 border border-neutral-400 p-4 text-sm"
        >
          <p>{error}</p>
          <button onClick={() => setReload((value) => value + 1)} className={actionClass}>
            다시 불러오기
          </button>
        </div>
      )}
      {loading ? (
        <Spinner label="포트폴리오 불러오는 중" />
      ) : (
        <>
          {!instructor && !selectedStudent ? (
            <div className="space-y-5">
              <p className="border-y py-5 text-sm text-neutral-600">
                현재 과정의 수강생 연결 후 프로젝트 버전을 기록할 수 있습니다.
              </p>
              <StudentDriveFolders kind="portfolio" />
            </div>
          ) : (
            <>
              {instructor && (
                <div className="grid gap-3 border-y border-neutral-200 py-4 sm:grid-cols-[minmax(0,1fr)_minmax(200px,1fr)]">
                  <div className="relative">
                    <Search
                      className="pointer-events-none absolute left-3 top-3.5 size-4 text-neutral-500"
                      aria-hidden
                    />
                    <input
                      aria-label="포트폴리오 학생 검색"
                      value={query}
                      onChange={(event) => setQuery(event.target.value)}
                      placeholder="학생 이름 검색"
                      className={`${inputClass} pl-9`}
                    />
                  </div>
                  <label>
                    <span className="sr-only">포트폴리오 학생 선택</span>
                    <select
                      className={inputClass}
                      value={selectedUser}
                      onChange={(event) => selectStudent(event.target.value)}
                    >
                      {enrollments
                        .filter(
                          (student) =>
                            matchesStudentSearch(student, query) ||
                            student.user_id === selectedUser,
                        )
                        .map((student) => (
                          <option key={student.user_id} value={student.user_id}>
                            {student.name}
                            {student.status === "completed" ? " · 수강 종료" : ""}
                          </option>
                        ))}
                    </select>
                  </label>
                </div>
              )}
              {selectedStudent ? (
                <>
                  <div className="flex flex-wrap items-start justify-between gap-4">
                    <div>
                      <p className="text-xs text-neutral-500">
                        {instructor ? "선택한 학생" : "나의 작업 기록"}
                      </p>
                      <h2 className="mt-1 text-xl font-semibold">
                        {selectedStudent.name}
                        <span className="ml-3 text-sm font-normal text-neutral-500">
                          프로젝트 {projects.length}개
                        </span>
                      </h2>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {folderUrl && (
                        <a
                          href={folderUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className={actionClass}
                        >
                          <FolderOpen className="size-4" aria-hidden />
                          개인 Drive 폴더
                          <ArrowUpRight className="size-4" aria-hidden />
                        </a>
                      )}
                      <button
                        type="button"
                        className={primaryClass}
                        disabled={!canAppend}
                        onClick={() => openEditor(true)}
                      >
                        <Plus className="size-4" aria-hidden />
                        프로젝트 추가
                      </button>
                    </div>
                  </div>
                  {!folder?.sharing_ready && (
                    <p className="border-l-2 border-neutral-400 pl-3 text-sm leading-6 text-neutral-600">
                      개인 Drive 공유 권한 확인이 필요합니다. 접근 가능한 Figma·웹사이트 링크로도
                      작업 버전을 기록할 수 있습니다.
                    </p>
                  )}
                  {folderUrl && (
                    <p className="text-xs leading-5 text-neutral-500">
                      Google 계정: {folder?.google_email} · Drive 파일은 자동 동기화되지 않습니다.
                      검토할 버전의 링크를 아래에 등록해 주세요.
                    </p>
                  )}
                  {!canAppend && (
                    <p className="border border-neutral-200 p-4 text-sm text-neutral-600">
                      수강 종료된 학생의 기록입니다. 저장된 버전은 계속 확인할 수 있습니다.
                    </p>
                  )}
                  {notice && (
                    <p role="status" className="border-l-2 border-black pl-3 text-sm">
                      {notice}
                    </p>
                  )}
                  {editorOpen && (
                    <PortfolioEditor
                      key={`${selectedUser}:${newProject ? "new" : (selectedProject?.id ?? "empty")}`}
                      userId={selectedUser}
                      latest={newProject ? undefined : selectedProject}
                      onDirtyChange={setDirty}
                      onClose={() => {
                        if (canLeaveEditor()) {
                          setEditorOpen(false);
                          setDirty(false);
                        }
                      }}
                      onSaved={(saved) => {
                        setVersions((previous) => [...previous, saved]);
                        setProjectKey(saved.project_key);
                        setEditorOpen(false);
                        setDirty(false);
                        setNotice(
                          `v${saved.version} 버전을 저장했습니다. 이전 버전은 그대로 유지됩니다.`,
                        );
                      }}
                    />
                  )}
                  {projects.length ? (
                    <div className="grid gap-5 lg:grid-cols-[220px_minmax(0,1fr)]">
                      <section aria-label="프로젝트 목록" className="min-w-0">
                        <ul className="divide-y divide-neutral-200 border-y border-neutral-200">
                          {projects.map((project) => (
                            <li key={project.project_key}>
                              <button
                                type="button"
                                onClick={() => selectProject(project.project_key)}
                                aria-pressed={selectedProject?.project_key === project.project_key}
                                className={`flex min-h-20 w-full items-center justify-between gap-3 px-3 py-4 text-left ${selectedProject?.project_key === project.project_key ? "bg-neutral-950 text-white" : "hover:bg-neutral-50"}`}
                              >
                                <span className="min-w-0">
                                  <span className="block break-words text-sm font-semibold">
                                    {project.title}
                                  </span>
                                  <span
                                    className={`mt-2 block text-xs ${selectedProject?.project_key === project.project_key ? "text-neutral-300" : "text-neutral-500"}`}
                                  >
                                    {portfolioStageLabel(project.stage)} · v{project.version}
                                  </span>
                                </span>
                                <ChevronRight className="size-4 shrink-0" aria-hidden />
                              </button>
                            </li>
                          ))}
                        </ul>
                      </section>
                      {selectedProject && (
                        <ProjectHistory
                          key={`${selectedUser}:${selectedProject.project_key}:${selectedProject.id}`}
                          history={history}
                          canAppend={canAppend}
                          onAppend={() => openEditor(false)}
                        />
                      )}
                    </div>
                  ) : (
                    !editorOpen && (
                      <div className="border border-neutral-200 px-6 py-12">
                        <h3 className="text-lg font-semibold">등록된 프로젝트가 없습니다.</h3>
                        <p className="mt-2 max-w-xl text-sm leading-6 text-neutral-600">
                          프로젝트명과 현재 작업 링크를 등록하면, 다음 수정본을 같은 프로젝트의 새
                          버전으로 보관할 수 있습니다.
                        </p>
                        {canAppend && (
                          <button
                            type="button"
                            onClick={() => openEditor(true)}
                            className={`${actionClass} mt-5`}
                          >
                            첫 프로젝트 등록
                          </button>
                        )}
                      </div>
                    )
                  )}
                </>
              ) : (
                <p className="border-y border-neutral-200 py-8 text-sm text-neutral-500">
                  등록된 수강생이 없습니다.
                </p>
              )}
            </>
          )}
        </>
      )}
    </div>
  );
}

function PortfolioEditor({
  userId,
  latest,
  onDirtyChange,
  onClose,
  onSaved,
}: {
  userId: string;
  latest: PortfolioVersion | undefined;
  onDirtyChange: (dirty: boolean) => void;
  onClose: () => void;
  onSaved: (saved: PortfolioVersion) => void;
}) {
  const alive = useRef(true);
  useEffect(() => {
    alive.current = true;
    return () => {
      alive.current = false;
    };
  }, []);
  const [values, setValues] = useState({
    title: latest?.title ?? "",
    target_role: latest?.target_role ?? "",
    next_goal: latest?.next_goal ?? "",
    stage: latest?.stage ?? "planning",
    label: "",
    url: latest?.url ?? "",
    notes: "",
  });
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [projectKey] = useState(() => latest?.project_key ?? crypto.randomUUID());
  const initialValues = useRef(JSON.stringify(values));
  useEditorExitGuard(
    () =>
      !busy &&
      (JSON.stringify(values) === initialValues.current ||
        window.confirm("저장하지 않은 버전 정보가 있습니다. 내용을 버리고 로그아웃할까요?")),
  );
  function change(field: keyof typeof values, value: string) {
    const next = { ...values, [field]: value };
    setValues(next);
    onDirtyChange(JSON.stringify(next) !== initialValues.current);
  }

  async function save(event: FormEvent) {
    event.preventDefault();
    if (busy) return;
    setError("");
    try {
      const project = normalizedProjectValues(values);
      const version = normalizedVersionValues(values);
      setBusy(true);
      const saved = await appendPortfolioVersion({
        user_id: userId,
        project_key: projectKey,
        ...project,
        ...version,
        stage: project.stage as PortfolioStage,
      });
      if (alive.current) onSaved(saved);
    } catch (reason) {
      if (alive.current)
        setError(
          studentOperationError(reason, "버전을 저장하지 못했습니다. 입력한 내용은 유지됩니다."),
        );
    } finally {
      if (alive.current) setBusy(false);
    }
  }

  return (
    <section
      aria-labelledby="portfolio-editor-title"
      className="border-2 border-neutral-950 bg-white p-5 sm:p-6"
    >
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="text-xs text-neutral-500">
            {latest ? `기존 v${latest.version} 보존` : "새 프로젝트"}
          </p>
          <h3 id="portfolio-editor-title" className="mt-1 text-lg font-semibold">
            {latest ? "수정본을 새 버전으로 기록" : "첫 작업 버전 등록"}
          </h3>
        </div>
        <button
          type="button"
          onClick={onClose}
          disabled={busy}
          aria-label="버전 편집 닫기"
          className="flex size-11 items-center justify-center border border-neutral-300 disabled:opacity-50"
        >
          <X className="size-4" aria-hidden />
        </button>
      </div>
      <form onSubmit={(event) => void save(event)} className="mt-5 space-y-4">
        <fieldset disabled={busy} className="grid gap-4 sm:grid-cols-2">
          <label className="text-sm font-medium">
            프로젝트명
            <input
              required
              maxLength={200}
              value={values.title}
              onChange={(event) => change("title", event.target.value)}
              className={`${inputClass} mt-2`}
            />
          </label>
          <label className="text-sm font-medium">
            지원 직무·분야
            <input
              maxLength={200}
              placeholder="예: UX/UI 디자이너"
              value={values.target_role}
              onChange={(event) => change("target_role", event.target.value)}
              className={`${inputClass} mt-2`}
            />
          </label>
          <label className="text-sm font-medium">
            진행 단계
            <select
              value={values.stage}
              onChange={(event) => change("stage", event.target.value)}
              className={`${inputClass} mt-2`}
            >
              {PORTFOLIO_STAGES.map((stage) => (
                <option key={stage.value} value={stage.value}>
                  {stage.label}
                </option>
              ))}
            </select>
          </label>
          <label className="text-sm font-medium">
            버전 이름
            <input
              required
              maxLength={200}
              placeholder="예: 정보 구조 수정본"
              value={values.label}
              onChange={(event) => change("label", event.target.value)}
              className={`${inputClass} mt-2`}
            />
          </label>
          <label className="text-sm font-medium sm:col-span-2">
            작업 링크
            <input
              required
              type="url"
              placeholder="https://"
              maxLength={4000}
              value={values.url}
              onChange={(event) => change("url", event.target.value)}
              className={`${inputClass} mt-2`}
            />
            <span className="mt-2 block text-xs font-normal leading-5 text-neutral-500">
              Figma·웹사이트·Drive 링크를 입력해 주세요. 외부 링크의 내용은 바뀔 수 있으므로
              가능하면 해당 버전의 고정 링크나 별도 내보낸 파일을 사용하세요.
            </span>
          </label>
          <label className="text-sm font-medium sm:col-span-2">
            이번 버전에서 달라진 점
            <textarea
              rows={3}
              maxLength={20000}
              value={values.notes}
              onChange={(event) => change("notes", event.target.value)}
              className={`${inputClass} mt-2 resize-y leading-6`}
            />
          </label>
          <label className="text-sm font-medium sm:col-span-2">
            다음 작업 목표
            <textarea
              rows={2}
              maxLength={4000}
              value={values.next_goal}
              onChange={(event) => change("next_goal", event.target.value)}
              className={`${inputClass} mt-2 resize-y leading-6`}
            />
          </label>
        </fieldset>
        {error && (
          <p role="alert" className="border border-neutral-400 p-3 text-sm">
            {error}
          </p>
        )}
        <div className="flex flex-wrap items-center justify-between gap-3 border-t border-neutral-200 pt-4">
          <p className="text-xs leading-5 text-neutral-500">
            저장된 버전은 수정하거나 덮어쓰지 않고 이력으로 남습니다.
          </p>
          <button type="submit" disabled={busy} className={primaryClass}>
            {busy ? "저장 중…" : "새 버전 저장"}
          </button>
        </div>
      </form>
    </section>
  );
}

function ProjectHistory({
  history,
  canAppend,
  onAppend,
}: {
  history: PortfolioVersion[];
  canAppend: boolean;
  onAppend: () => void;
}) {
  const latest = history[0]!;
  const [selectedId, setSelectedId] = useState(latest.id);
  const [compareId, setCompareId] = useState(history[1]?.id ?? "");
  const selected = history.find((version) => version.id === selectedId) ?? latest;
  const compared = history.find((version) => version.id === compareId);
  return (
    <section
      aria-labelledby="portfolio-project-title"
      className="min-w-0 border border-neutral-200 p-5 sm:p-6"
    >
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h3 id="portfolio-project-title" className="text-xl font-semibold">
            {latest.title}
          </h3>
          <p className="mt-1 text-sm text-neutral-500">
            {latest.target_role || "지원 분야 미입력"}
          </p>
        </div>
        <button type="button" onClick={onAppend} disabled={!canAppend} className={primaryClass}>
          <Plus className="size-4" aria-hidden />
          수정본 기록
        </button>
      </div>
      {latest.next_goal && (
        <div className="mt-5 border-l-2 border-neutral-950 bg-neutral-50 p-4">
          <p className="text-xs font-semibold">다음 작업 목표</p>
          <p className="mt-2 whitespace-pre-wrap text-sm leading-6">{latest.next_goal}</p>
        </div>
      )}
      <div className="mt-6 grid gap-4 sm:grid-cols-2">
        <label className="text-sm font-medium">
          확인할 버전
          <select
            value={selected.id}
            onChange={(event) => setSelectedId(event.target.value)}
            className={`${inputClass} mt-2`}
          >
            {history.map((version) => (
              <option key={version.id} value={version.id}>
                v{version.version} · {version.label}
                {version.id === latest.id ? " · 최신" : ""}
              </option>
            ))}
          </select>
        </label>
        <label className="text-sm font-medium">
          비교할 버전
          <select
            value={compareId}
            onChange={(event) => setCompareId(event.target.value)}
            className={`${inputClass} mt-2`}
          >
            <option value="">비교하지 않음</option>
            {history
              .filter((version) => version.id !== selected.id)
              .map((version) => (
                <option key={version.id} value={version.id}>
                  v{version.version} · {version.label}
                </option>
              ))}
          </select>
        </label>
      </div>
      <div
        className={`mt-4 grid gap-4 ${compared && compared.id !== selected.id ? "2xl:grid-cols-2" : ""}`}
      >
        <VersionSnapshot version={selected} label="선택한 버전" />
        {compared && compared.id !== selected.id && (
          <VersionSnapshot version={compared} label="비교 버전" />
        )}
      </div>
      <p className="mt-4 text-xs leading-5 text-neutral-500">
        기록 시각과 버전 설명을 비교할 수 있습니다. 외부 사이트의 원본 내용은 변경될 수 있습니다.
      </p>
    </section>
  );
}

function VersionSnapshot({ version, label }: { version: PortfolioVersion; label: string }) {
  const url = safeExternalUrl(version.url);
  return (
    <article
      aria-label={`${label} v${version.version}`}
      className="min-w-0 border border-neutral-200 p-4"
    >
      <p className="text-xs text-neutral-500">
        {label} · v{version.version}
      </p>
      <h4 className="mt-2 break-words text-base font-semibold">{version.label}</h4>
      <p className="mt-2 text-xs text-neutral-500">{koreanRecordDate(version.created_at)}</p>
      <dl className="mt-4 space-y-3 text-sm">
        <div>
          <dt className="text-xs text-neutral-500">진행 단계</dt>
          <dd className="mt-1">{portfolioStageLabel(version.stage)}</dd>
        </div>
        <div>
          <dt className="text-xs text-neutral-500">변경 내용</dt>
          <dd className="mt-1 whitespace-pre-wrap leading-6">
            {version.notes || "등록한 변경 설명이 없습니다."}
          </dd>
        </div>
        {version.next_goal && (
          <div>
            <dt className="text-xs text-neutral-500">당시의 다음 작업 목표</dt>
            <dd className="mt-1 whitespace-pre-wrap leading-6">{version.next_goal}</dd>
          </div>
        )}
      </dl>
      {url ? (
        <a
          href={url}
          target="_blank"
          rel="noopener noreferrer"
          className={`${actionClass} mt-5 w-full`}
        >
          작업 링크 열기
          <ArrowUpRight className="size-4" aria-hidden />
        </a>
      ) : (
        <p className="mt-4 text-sm text-neutral-500">유효한 작업 링크가 없습니다.</p>
      )}
    </article>
  );
}
