import type { ReviewFields, ReviewPin } from "@/lib/instructor-api";
import { getSupabase } from "@/lib/supabase";
import {
  normalizeFeedbackUrl,
  FEEDBACK_FILE_BUCKET,
  FEEDBACK_IMAGE_BUCKET,
} from "@/lib/feedback-attachments";

export type WorkspaceAsset = {
  id: string;
  kind: "image" | "file" | "link";
  title: string;
  object_path: string | null;
  url: string | null;
  mime_type?: string | null;
  file_size?: number | null;
  created_at: string;
};
export type ReviewContent = ReviewFields;
export const EMPTY_REVIEW: ReviewContent = {
  strengths: "",
  improvements: "",
  next_steps: "",
  decision: "accepted",
  pins: [],
  asset_comments: {},
  private_note: "",
};
export const errorMessage = (e: unknown) =>
  e instanceof Error
    ? e.message
    : typeof e === "object" && e !== null && "message" in e
      ? String(e.message)
      : "요청을 처리하지 못했습니다. 다시 시도해 주세요.";
export function formatWorkspaceDate(value: string | null | undefined) {
  if (!value) return "설정 없음";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return "날짜 확인 필요";
  return new Intl.DateTimeFormat("ko-KR", {
    timeZone: "Asia/Seoul",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).format(d);
}
export function toSeoulInput(value: string | null | undefined) {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  return new Date(date.getTime() + 9 * 60 * 60 * 1000).toISOString().slice(0, 16);
}
export function fromSeoulInput(value: string) {
  if (!value) return null;
  const date = new Date(value + ":00+09:00");
  if (Number.isNaN(date.getTime())) throw new Error("날짜와 시간을 확인해 주세요.");
  return date.toISOString();
}
export function safeAssetUrl(url: string | null | undefined) {
  if (!url) return null;
  try {
    return normalizeFeedbackUrl(url);
  } catch {
    return null;
  }
}
export function hasReviewContent(content: ReviewContent) {
  return Boolean(
    content.strengths.trim() ||
    content.improvements.trim() ||
    content.next_steps.trim() ||
    content.pins.some((p) => p.content.trim()) ||
    Object.values(content.asset_comments).some((s) => s.trim()),
  );
}
export function normalizeReviewContent(raw: unknown): ReviewContent {
  const v = (raw && typeof raw === "object" ? raw : {}) as Partial<ReviewContent>;
  return {
    strengths: typeof v.strengths === "string" ? v.strengths : "",
    improvements: typeof v.improvements === "string" ? v.improvements : "",
    next_steps: typeof v.next_steps === "string" ? v.next_steps : "",
    decision: v.decision === "changes_requested" ? "changes_requested" : "accepted",
    pins: Array.isArray(v.pins)
      ? v.pins.filter(
          (p: ReviewPin) =>
            p &&
            typeof p.id === "string" &&
            typeof p.image_id === "string" &&
            Number.isFinite(p.x) &&
            Number.isFinite(p.y) &&
            p.x >= 0 &&
            p.x <= 1 &&
            p.y >= 0 &&
            p.y <= 1 &&
            typeof p.content === "string",
        )
      : [],
    asset_comments:
      v.asset_comments && typeof v.asset_comments === "object"
        ? Object.fromEntries(
            Object.entries(v.asset_comments).filter(([, c]) => typeof c === "string"),
          )
        : {},
    private_note: typeof v.private_note === "string" ? v.private_note : "",
  };
}

export async function loadWorkspaceAssets(
  studentId: string,
  week: number,
): Promise<WorkspaceAsset[]> {
  const db = getSupabase();
  const [images, attachments] = await Promise.all([
    db
      .from("kmove_feedback_images")
      .select("id,object_path,created_at")
      .eq("student_id", studentId)
      .eq("week", week)
      .order("created_at"),
    db
      .from("kmove_feedback_attachments")
      .select("id,kind,title,object_path,url,mime_type,file_size,created_at")
      .eq("student_id", studentId)
      .eq("week", week)
      .order("created_at"),
  ]);
  if (images.error) throw images.error;
  if (attachments.error) throw attachments.error;
  return [
    ...(images.data ?? []).map((r, i) => ({
      ...r,
      kind: "image" as const,
      title: `이미지 ${String(i + 1).padStart(2, "0")}`,
      url: null,
    })),
    ...((attachments.data ?? []) as WorkspaceAsset[]),
  ];
}
export async function workspaceAssetUrl(asset: WorkspaceAsset, download = false) {
  if (asset.kind === "link") return safeAssetUrl(asset.url);
  if (!asset.object_path) return null;
  const r = await getSupabase()
    .storage.from(asset.kind === "image" ? FEEDBACK_IMAGE_BUCKET : FEEDBACK_FILE_BUCKET)
    .createSignedUrl(
      asset.object_path,
      download ? 60 : 600,
      download ? { download: asset.title } : undefined,
    );
  if (r.error) throw r.error;
  return r.data.signedUrl;
}
