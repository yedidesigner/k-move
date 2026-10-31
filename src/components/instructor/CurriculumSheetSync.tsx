import { useCallback, useEffect, useRef, useState } from "react";
import { Link } from "@tanstack/react-router";
import { Check, Copy, ExternalLink, RefreshCw } from "lucide-react";
import { useAuth } from "@/lib/auth";
import {
  getCurriculumSyncStatus,
  issueCurriculumPairingCode,
  revokeCurriculumSync,
  retryCurriculumSync,
  type CurriculumSyncRow,
  type CurriculumSyncStatus,
} from "@/lib/curriculum-sync";
import { koreanRecordDate } from "@/lib/student-operations";

const SHEET_URL =
  "https://docs.google.com/spreadsheets/d/1Hv7dvSg_R98DM8_VlCCg7ckYRoopmSFlAQ8z_g5Cds0/edit";
const SCRIPT_URL = "/integrations/kmove-curriculum-sync.gs";
const MANIFEST_URL = "/integrations/appsscript.json";
const SCRIPT_EDITOR_URL =
  "https://script.google.com/u/0/home/projects/18mIIMLdimS1m3ApX-pHNMtVpgU4V0Z0KuayLLp9IufGtpg8St4_pgCXA/edit";
const CELL_LABELS = [
  "사이클",
  "수업 제목·목표·산출물",
  "핵심 학습 내용",
  "주요 용어",
  "사용 도구",
  "과제",
  "수업 날짜",
  "시작 시간",
  "종료 시간",
];
const buttonClass =
  "inline-flex min-h-10 items-center justify-center gap-2 border border-neutral-300 px-3 text-xs font-medium hover:bg-neutral-100 disabled:opacity-50";
const ERROR_MESSAGES: Record<string, string> = {
  target_missing: "시트에서 해당 회차를 찾지 못했습니다.",
  duplicate_session: "시트에 같은 회차가 두 번 이상 있습니다.",
  formula_present: "대상 셀에 수식이 있어 덮어쓰지 않았습니다.",
  permission_denied: "Google 시트 편집 권한을 확인해 주세요.",
  transport_error: "연결 중 오류가 발생했습니다.",
  write_verification_failed: "시트에 기록한 내용의 확인이 필요합니다.",
  invalid_sheet: "연결된 원본 파일과 시트2를 확인해 주세요.",
  invalid_curriculum: "수업 내용 또는 셀 길이를 확인해 주세요.",
  sheet_changed: "시트에서 직접 수정한 내용과 충돌했습니다.",
  baseline_required: "최초 반영 기준을 확인해야 합니다.",
};

export function curriculumSyncRowLabel(row: CurriculumSyncRow, now = Date.now()) {
  if (row.status === "conflict") return "충돌 · 확인 필요";
  if (row.status === "error") return "반영 실패";
  if (row.status === "needs_baseline") return "초기 확인 필요";
  if (row.lease_expires_at && new Date(row.lease_expires_at).getTime() > now) return "반영 중";
  if (row.status === "synced" && row.last_synced_version >= row.source_version) return "반영 완료";
  return "반영 대기";
}

function hasReviewableConflict(row: CurriculumSyncRow): boolean {
  return (
    row.status === "conflict" &&
    !!row.conflict &&
    [row.conflict.baseline_cells, row.conflict.observed_cells, row.conflict.desired_cells].every(
      (cells) =>
        Array.isArray(cells) &&
        cells.length === 9 &&
        cells.every((cell) => typeof cell === "string" && cell.length <= 40000),
    )
  );
}

function useSyncStatus(revision?: number) {
  const [data, setData] = useState<CurriculumSyncStatus | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const mounted = useRef(false);
  const request = useRef(0);
  const refresh = useCallback(async () => {
    const current = ++request.current;
    setLoading(true);
    try {
      const next = await getCurriculumSyncStatus();
      if (!mounted.current || current !== request.current) return;
      setData(next);
      setError("");
    } catch {
      if (mounted.current && current === request.current)
        setError(
          "Google Sheet 반영 상태를 확인하지 못했습니다. LMS 저장 상태는 별도로 유지됩니다.",
        );
    } finally {
      if (mounted.current && current === request.current) setLoading(false);
    }
  }, []);
  useEffect(() => {
    mounted.current = true;
    void refresh();
    const poll = () => {
      if (document.visibilityState !== "hidden") void refresh();
    };
    const timer = window.setInterval(poll, 20_000);
    window.addEventListener("focus", poll);
    return () => {
      mounted.current = false;
      request.current++;
      window.clearInterval(timer);
      window.removeEventListener("focus", poll);
    };
  }, [refresh, revision]);
  return { data, error, loading, refresh };
}

/** The outer auth boundary unmounts state, including a pairing code, when accounts change. */
export function CurriculumSheetSyncPanel() {
  const { user, status } = useAuth();
  if (status !== "instructor" || !user) return null;
  return <SyncPanel key={user.id} />;
}

function SyncPanel() {
  const { data, error, loading, refresh } = useSyncStatus();
  const [pair, setPair] = useState<{
    pairing_code: string;
    expires_at: string;
    previousPairedAt: string | null;
  } | null>(null);
  const [busy, setBusy] = useState("");
  const [message, setMessage] = useState("");
  const [actionError, setActionError] = useState("");
  const [review, setReview] = useState<CurriculumSyncRow | null>(null);
  const reviewRef = useRef<HTMLDivElement>(null);
  const active = useRef(true);
  useEffect(() => {
    active.current = true;
    return () => {
      active.current = false;
    };
  }, []);
  useEffect(() => {
    if (review) reviewRef.current?.focus();
  }, [review]);
  useEffect(() => {
    if (!pair) return;
    const remaining = new Date(pair.expires_at).getTime() - Date.now();
    const timer = window.setTimeout(
      () => {
        setPair(null);
        setMessage("연결 코드가 만료되었습니다. 필요하면 새 코드를 발급해 주세요.");
      },
      Math.max(0, remaining),
    );
    return () => window.clearTimeout(timer);
  }, [pair]);
  useEffect(() => {
    if (
      pair &&
      data?.paired_at &&
      data.paired_at !== pair.previousPairedAt &&
      !data.pairing_expires_at
    ) {
      setPair(null);
      setMessage("Google 시트 연결을 확인했습니다. 반영 결과는 아래 회차별 상태에서 확인하세요.");
    }
  }, [data?.paired_at, data?.pairing_expires_at, pair]);
  async function action(
    id: string,
    work: () => Promise<void>,
    failureMessage = "요청을 처리하지 못했습니다. 기존 수업 내용은 유지됩니다. 다시 시도해 주세요.",
  ) {
    if (busy) return;
    setBusy(id);
    setActionError("");
    setMessage("");
    try {
      await work();
      if (active.current) await refresh();
    } catch {
      if (active.current) setActionError(failureMessage);
    } finally {
      if (active.current) setBusy("");
    }
  }
  function issueCode() {
    void action("pair", async () => {
      setPair(null);
      const next = await issueCurriculumPairingCode();
      if (active.current)
        setPair({
          pairing_code: next.pairing_code,
          expires_at: next.expires_at,
          previousPairedAt: data?.paired_at ?? null,
        });
    });
  }
  async function copyCode() {
    if (!pair) return;
    try {
      await navigator.clipboard.writeText(pair.pairing_code);
      if (active.current)
        setMessage("연결 코드를 복사했습니다. 원본 시트의 설치 창에 붙여 넣으세요.");
    } catch {
      if (active.current)
        setActionError("자동 복사를 사용할 수 없습니다. 코드 입력칸을 선택해 직접 복사해 주세요.");
    }
  }
  async function copyScript() {
    void action("script", async () => {
      const response = await fetch(SCRIPT_URL);
      if (!response.ok) throw new Error("script-unavailable");
      const script = await response.text();
      if (!script.includes("@OnlyCurrentDoc")) throw new Error("invalid-script");
      await navigator.clipboard.writeText(script);
      if (active.current)
        setMessage(
          "설치 코드를 복사했습니다. 원본 시트에서 연 Apps Script의 Code.gs에 붙여 넣으세요.",
        );
    });
  }
  async function copyManifest() {
    void action("manifest", async () => {
      const response = await fetch(MANIFEST_URL);
      if (!response.ok) throw new Error("manifest-unavailable");
      const manifest = await response.text();
      const parsed = JSON.parse(manifest) as { oauthScopes?: string[] };
      if (!parsed.oauthScopes?.includes("https://www.googleapis.com/auth/spreadsheets.currentonly"))
        throw new Error("invalid-manifest");
      await navigator.clipboard.writeText(manifest);
      if (active.current)
        setMessage(
          "권한 설정을 복사했습니다. Apps Script의 appsscript.json에 적용해 주세요. 기존 프로젝트의 다른 설정은 보존하세요.",
        );
    });
  }
  function retry(row: CurriculumSyncRow, overwrite = false) {
    if (overwrite && !hasReviewableConflict(row)) return;
    if (
      overwrite &&
      !window.confirm(
        `${row.session_number}회차의 시트 직접 수정 내용을 현재 LMS 저장본으로 바꿀까요? 해당 회차의 커리큘럼과 수업 날짜·시간 셀이 변경됩니다.`,
      )
    )
      return;
    void action(
      row.session_key,
      async () => {
        try {
          await retryCurriculumSync(
            row.session_key,
            overwrite,
            overwrite && row.conflict
              ? {
                  source_version: row.source_version,
                  observed_cells: row.conflict.observed_cells,
                }
              : undefined,
          );
        } catch (error) {
          if (active.current && overwrite) {
            setReview(null);
            await refresh();
          }
          throw error;
        }
        if (active.current) {
          setReview(null);
          setMessage(
            `${row.session_number}회차를 반영 대기열에 넣었습니다. 실제 완료 상태를 확인해 주세요.`,
          );
        }
      },
      overwrite
        ? "반영하지 못했습니다. 충돌 내용 비교를 다시 열어 최신 내용을 확인한 뒤 시도해 주세요."
        : undefined,
    );
  }
  const rows = data?.rows ?? [];
  const pending = rows.filter((row) => row.status === "pending").length;
  const needsAttention = rows.filter((row) =>
    ["error", "conflict", "needs_baseline"].includes(row.status),
  ).length;
  const connectionLabel = !data
    ? "연결 확인 중"
    : !data.configured
      ? "자동 반영 연결 필요"
      : data.connected
        ? "자동 반영 연결됨"
        : data.last_seen_at
          ? "최근 응답 확인 필요"
          : "연결됨 · 첫 실행 대기";
  return (
    <section
      aria-labelledby="curriculum-sheet-heading"
      className="border border-neutral-300 bg-white p-5 md:p-6"
    >
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 id="curriculum-sheet-heading" className="text-lg font-semibold">
            Google Sheet 자동 반영
          </h2>
          <p className="mt-2 text-sm leading-7 text-neutral-600">
            LMS에서 저장한 수업 커리큘럼과 날짜·시간을 원본의 시트2에 반영합니다.
          </p>
        </div>
        <a href={SHEET_URL} target="_blank" rel="noopener noreferrer" className={buttonClass}>
          원본 시트 열기
          <ExternalLink size={13} aria-hidden />
        </a>
      </div>
      <div className="mt-4 flex flex-wrap items-center justify-between gap-3 border-y border-neutral-200 py-3">
        <div className="flex flex-wrap items-center gap-3 text-xs">
          <span className="font-semibold" role="status">
            {error ? "반영 상태 확인 불가" : connectionLabel}
          </span>
          {data && !error && (
            <span className="text-neutral-500">
              대기 {pending}회차 · 확인 필요 {needsAttention}회차
            </span>
          )}
        </div>
        <button
          type="button"
          onClick={() => void refresh()}
          disabled={loading || !!busy}
          className={buttonClass}
        >
          <RefreshCw size={13} aria-hidden />
          상태 새로고침
        </button>
      </div>
      {error && (
        <p role="alert" className="mt-3 text-sm leading-6">
          {error}
        </p>
      )}
      {data?.configured && !data.connected && (
        <p className="mt-3 text-xs leading-6 text-neutral-600">
          Google Apps Script에서 설치가 완료됐는지 확인해 주세요. 시간 트리거는 약 1분 간격으로
          실행되며 Google 서비스 상황에 따라 지연될 수 있습니다.
        </p>
      )}
      <p className="mt-4 text-xs leading-6 text-neutral-600">
        초안 저장도 시트에 반영됩니다. 학생에게 보이는 내용은 ‘학생에게 공개’로 따로 관리합니다.
        비공개 강사 메모와 학생 자료는 보내지 않습니다.
      </p>
      <details
        className="mt-4 border-t border-neutral-200 pt-4"
        open={data ? !data.configured : false}
      >
        <summary className="cursor-pointer text-sm font-semibold">최초 연결 방법</summary>
        <p className="mt-3 text-sm leading-7 text-neutral-600">
          설치 코드와 권한 설정은 원본 Apps Script 프로젝트에 준비되어 있습니다. Google 권한 승인과
          일회용 코드 입력으로 연결을 마무리하세요.
        </p>
        <ol className="mt-4 list-decimal space-y-3 pl-5 text-sm leading-7">
          <li>
            아래에서 <strong>연결 코드 발급</strong>을 누르고 일회용 코드를 복사합니다.
          </li>
          <li>
            <strong>준비된 Apps Script 열기</strong>로 원본 프로젝트를 엽니다.
          </li>
          <li>
            <strong>kmoveInstall</strong> 함수를 실행하고 Google 권한을 확인·승인합니다. 승인 후
            실행이 멈췄다면 같은 함수를 다시 실행하세요.
          </li>
          <li>
            <strong>원본 시트</strong>로 돌아와 연결 창에 일회용 코드를 붙여 넣습니다. 이후 이
            화면에서 연결 상태와 회차별 ‘반영 완료’를 확인하세요.
          </li>
        </ol>
        <div className="mt-4 flex flex-wrap gap-2">
          <button
            type="button"
            onClick={issueCode}
            disabled={!!busy || !data}
            className={`${buttonClass} bg-neutral-900 text-white hover:bg-neutral-700`}
          >
            {pair ? "새 연결 코드 발급" : "연결 코드 발급"}
          </button>
          <a
            href={SCRIPT_EDITOR_URL}
            target="_blank"
            rel="noopener noreferrer"
            className={buttonClass}
          >
            준비된 Apps Script 열기
            <ExternalLink size={13} aria-hidden />
          </a>
        </div>
        {pair && (
          <div className="mt-4 space-y-3 border border-neutral-300 bg-neutral-50 p-4">
            <p className="text-xs leading-6">
              15분 동안 한 번 사용할 수 있는 코드입니다. 원본 시트의 설치 창에만 입력해 주세요.
            </p>
            <label className="block text-xs font-semibold">
              일회용 연결 코드
              <input
                aria-label="일회용 연결 코드"
                readOnly
                autoComplete="off"
                value={pair.pairing_code}
                onFocus={(event) => event.currentTarget.select()}
                className="mt-2 min-h-11 w-full border border-neutral-300 bg-white p-3 font-mono text-xs"
              />
            </label>
            <div className="flex flex-wrap items-center justify-between gap-2">
              <span className="text-xs text-neutral-500">
                만료 {koreanRecordDate(pair.expires_at)}
              </span>
              <button type="button" className={buttonClass} onClick={() => void copyCode()}>
                <Copy size={13} aria-hidden />
                연결 코드 복사
              </button>
            </div>
            <button
              type="button"
              className="text-xs underline underline-offset-4"
              onClick={() => setPair(null)}
            >
              이 화면에서 코드 숨기기
            </button>
          </div>
        )}
        <details className="mt-5 border-t border-neutral-200 pt-4">
          <summary className="cursor-pointer text-xs font-semibold">다시 설치하는 경우</summary>
          <ol className="mt-3 list-decimal space-y-3 pl-5 text-xs leading-6 text-neutral-600">
            <li>
              원본 시트에서 <strong>확장 프로그램 → Apps Script</strong>를 엽니다. 아래 설치 코드를
              Code.gs에 붙여 넣고 저장합니다. 기존 스크립트가 있다면 새 파일에 추가하여 기존 코드를
              보존하세요.
            </li>
            <li>
              프로젝트 설정에서 <strong>appsscript.json 표시</strong>를 켜고 아래 권한 설정을
              적용합니다. 기존 프로젝트의 다른 설정은 보존하세요.
            </li>
            <li>
              연결을 해제한 뒤 다시 설치한다면 <strong>kmoveUninstall</strong>을 먼저 실행합니다. 새
              연결 코드를 발급하고 위의 최초 연결 절차를 진행하세요.
            </li>
          </ol>
          <div className="mt-3 flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => void copyScript()}
              disabled={!!busy}
              className={buttonClass}
            >
              <Copy size={13} aria-hidden />
              설치 코드 복사
            </button>
            <a href={SCRIPT_URL} download="kmove-curriculum-sync.gs" className={buttonClass}>
              설치 파일 받기
            </a>
            <button
              type="button"
              onClick={() => void copyManifest()}
              disabled={!!busy}
              className={buttonClass}
            >
              <Copy size={13} aria-hidden />
              권한 설정 복사
            </button>
            <a href={MANIFEST_URL} download="appsscript.json" className={buttonClass}>
              권한 설정 파일 받기
            </a>
          </div>
        </details>
      </details>
      {message && (
        <p role="status" className="mt-4 flex items-start gap-2 text-sm leading-6">
          <Check size={15} className="mt-1 shrink-0" aria-hidden />
          {message}
        </p>
      )}
      {actionError && (
        <p role="alert" className="mt-4 border-l-2 border-neutral-800 pl-3 text-sm leading-6">
          {actionError}
        </p>
      )}
      {data && (
        <details className="mt-5 border-t border-neutral-200 pt-4" open={needsAttention > 0}>
          <summary className="cursor-pointer text-sm font-semibold">
            회차별 반영 상태 · {rows.length}회차
          </summary>
          <p className="mt-3 text-xs leading-6 text-neutral-500">
            시트에서 직접 수정한 내용이 발견되면 자동으로 덮어쓰지 않습니다. 충돌 행을 검토한 뒤
            현재 LMS 내용으로 반영할지 선택하세요.
          </p>
          <div className="mt-3 overflow-x-auto">
            <table className="w-full min-w-[620px] text-left text-xs">
              <thead className="border-y border-neutral-200 bg-neutral-50">
                <tr>
                  {["회차", "반영 상태", "LMS / Sheet 버전", "마지막 반영", "처리"].map((label) => (
                    <th key={label} className="px-3 py-3 font-semibold">
                      {label}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {rows.map((row) => (
                  <tr key={row.session_key} className="border-b border-neutral-200">
                    <th scope="row" className="px-3 py-3 font-medium">
                      {String(row.session_number).padStart(2, "0")}회차
                    </th>
                    <td className="px-3 py-3">
                      <p className="font-medium">{curriculumSyncRowLabel(row)}</p>
                      {row.error_code && (
                        <p className="mt-1 max-w-52 leading-5 text-neutral-600">
                          {ERROR_MESSAGES[row.error_code] ??
                            "반영 상태를 확인한 후 다시 시도해 주세요."}
                        </p>
                      )}
                    </td>
                    <td className="px-3 py-3 tabular-nums">
                      {row.source_version} / {row.last_synced_version}
                    </td>
                    <td className="px-3 py-3 text-neutral-500">
                      {row.last_synced_at ? koreanRecordDate(row.last_synced_at) : "아직 없음"}
                    </td>
                    <td className="px-3 py-3">
                      {row.status === "conflict" && hasReviewableConflict(row) ? (
                        <button
                          type="button"
                          disabled={!!busy || !data.configured}
                          className={buttonClass}
                          onClick={() => setReview(row)}
                        >
                          충돌 내용 비교
                        </button>
                      ) : row.status === "error" || row.status === "pending" ? (
                        <button
                          type="button"
                          disabled={!!busy || !data.configured}
                          className={buttonClass}
                          onClick={() => retry(row)}
                        >
                          다시 시도
                        </button>
                      ) : row.status === "conflict" ? (
                        <span className="text-neutral-500">원본 시트 확인 필요</span>
                      ) : row.status === "needs_baseline" ? (
                        <span className="text-neutral-500">초기 연결 확인 필요</span>
                      ) : (
                        <span className="text-neutral-400">—</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </details>
      )}
      {review?.conflict && hasReviewableConflict(review) && (
        <div
          ref={reviewRef}
          tabIndex={-1}
          aria-labelledby="conflict-review-heading"
          className="mt-5 border-2 border-neutral-800 p-4 outline-offset-4 md:p-5"
        >
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h3 id="conflict-review-heading" className="font-semibold">
              충돌 내용 비교 · {review.session_number}회차
            </h3>
            <button type="button" onClick={() => setReview(null)} className={buttonClass}>
              비교 닫기
            </button>
          </div>
          <p className="mt-3 text-sm leading-7 text-neutral-600">
            마지막으로 확인한 시트 내용과 LMS 저장본의 차이입니다. 아래 내용을 검토한 뒤 반영하면
            해당 회차의 B–J열이 LMS 저장본으로 바뀝니다. 검토 중 내용이 달라지면 다시 확인해야
            합니다.
          </p>
          <div className="mt-4 space-y-4">
            {CELL_LABELS.map((label, index) =>
              review.conflict!.observed_cells[index] ===
              review.conflict!.desired_cells[index] ? null : (
                <section key={label} className="border border-neutral-300">
                  <h4 className="border-b border-neutral-300 bg-neutral-50 px-3 py-2 text-xs font-semibold">
                    {label}
                  </h4>
                  <div className="grid md:grid-cols-2">
                    <div className="p-3">
                      <p className="mb-2 text-xs font-semibold">시트에서 확인한 내용</p>
                      <p className="max-h-64 overflow-auto whitespace-pre-wrap break-words text-sm leading-7">
                        {review.conflict!.observed_cells[index] || "(빈 값)"}
                      </p>
                    </div>
                    <div className="border-t border-neutral-200 p-3 md:border-l md:border-t-0">
                      <p className="mb-2 text-xs font-semibold">
                        반영할 LMS 저장본 · 버전 {review.source_version}
                      </p>
                      <p className="max-h-64 overflow-auto whitespace-pre-wrap break-words text-sm leading-7">
                        {review.conflict!.desired_cells[index] || "(빈 값)"}
                      </p>
                    </div>
                  </div>
                </section>
              ),
            )}
          </div>
          <div className="mt-4 flex flex-wrap items-center gap-3">
            <button
              type="button"
              disabled={!!busy || !data?.configured}
              className={`${buttonClass} bg-neutral-900 text-white hover:bg-neutral-700`}
              onClick={() => retry(review, true)}
            >
              검토한 LMS 내용으로 반영…
            </button>
            <a
              href={SHEET_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs underline underline-offset-4"
            >
              원본 시트 확인
            </a>
          </div>
        </div>
      )}
      {data?.configured && (
        <div className="mt-5 border-t border-neutral-200 pt-4">
          <button
            type="button"
            disabled={!!busy}
            className="min-h-10 text-xs text-neutral-600 underline underline-offset-4"
            onClick={() => {
              if (
                !window.confirm(
                  "Google Sheet 자동 반영 연결을 해제할까요? LMS와 시트에 저장된 내용은 유지되며, 다시 연결하기 전까지 자동 반영이 중단됩니다.",
                )
              )
                return;
              void action("revoke", async () => {
                await revokeCurriculumSync();
                if (active.current) {
                  setPair(null);
                  setMessage(
                    "자동 반영 연결을 해제했습니다. Google Apps Script에서 kmoveUninstall을 실행해 시간 트리거를 정리하세요. 다시 연결할 때는 새 코드를 발급하고 kmoveInstall을 실행합니다.",
                  );
                }
              });
            }}
          >
            자동 반영 연결 해제
          </button>
        </div>
      )}
    </section>
  );
}

export function CurriculumSheetSyncStatus({
  sessionKey,
  revision = 0,
}: {
  sessionKey: string;
  revision?: number;
}) {
  const { status, user } = useAuth();
  if (status !== "instructor" || !user) return null;
  return (
    <SessionStatus key={`${user.id}:${sessionKey}`} sessionKey={sessionKey} revision={revision} />
  );
}

function SessionStatus({ sessionKey, revision }: { sessionKey: string; revision: number }) {
  const { data, error } = useSyncStatus(revision);
  const row = data?.rows.find((item) => item.session_key === sessionKey);
  const label = error
    ? "반영 상태 확인 불가"
    : !data
      ? "반영 상태 확인 중"
      : !data.configured
        ? "자동 반영 연결 필요"
        : !row || row.source_version < revision
          ? "반영 상태 갱신 대기"
          : curriculumSyncRowLabel(row);
  return (
    <aside
      aria-label="Google Sheet 반영 상태"
      className="mb-3 flex flex-wrap items-center justify-between gap-2 border border-neutral-200 bg-neutral-50 px-4 py-3 text-xs"
    >
      <div>
        <p className="font-semibold" role="status">
          Google Sheet · {label}
        </p>
        <p className="mt-1 leading-5 text-neutral-600">
          초안을 저장하면 시트 반영을 준비합니다. 학생 공개는 별도입니다.
        </p>
      </div>
      <Link
        to="/admin"
        search={{ tab: "settings" }}
        className="inline-flex min-h-9 items-center gap-2 underline underline-offset-4"
      >
        연결·상태 확인
        <ExternalLink size={12} aria-hidden />
      </Link>
    </aside>
  );
}
