import { useEffect, useState } from "react";
import { ExternalLink } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { getSupabase } from "@/lib/supabase";
import { feedbackFileSize } from "@/lib/feedback-attachments";

type Props = {
  files: File[];
  eligibleCount: number;
  studentId: string;
  userId: string;
  instructor: boolean;
  onClose: () => void;
  onRegisterLink: () => void;
  onUploadEligible: () => void;
  onAfterClose: () => void;
};
type Folder = {
  user_id: string;
  name: string;
  assignment_folder_url: string;
  google_email: string;
  sharing_ready: boolean;
};
const button =
  "inline-flex min-h-11 items-center justify-center gap-2 border border-black px-3 text-sm font-medium disabled:opacity-50";

export function FeedbackLargeFileDialog({
  files,
  eligibleCount,
  studentId,
  userId,
  instructor,
  onClose,
  onRegisterLink,
  onUploadEligible,
  onAfterClose,
}: Props) {
  const [folder, setFolder] = useState<Folder | null>(null);
  const [loading, setLoading] = useState(true);
  const [failed, setFailed] = useState(false);
  const [attempt, setAttempt] = useState(0);
  useEffect(() => {
    let active = true;
    setLoading(true);
    setFailed(false);
    setFolder(null);
    void (async () => {
      try {
        const db = getSupabase();
        let ownerId = userId;
        if (instructor) {
          const student = await db
            .from("kmove_feedback_students")
            .select("user_id")
            .eq("id", studentId)
            .maybeSingle();
          if (student.error) throw student.error;
          ownerId = student.data?.user_id;
        }
        if (!ownerId) return;
        const result = await db
          .from("kmove_student_drive_folders")
          .select("user_id,name,assignment_folder_url,google_email,sharing_ready")
          .eq("user_id", ownerId)
          .maybeSingle();
        if (result.error) throw result.error;
        if (active && result.data?.user_id === ownerId) setFolder(result.data as Folder);
      } catch {
        if (active) setFailed(true);
      } finally {
        if (active) setLoading(false);
      }
    })();
    return () => {
      active = false;
    };
  }, [studentId, userId, instructor, attempt]);
  const safeFolderUrl =
    folder?.assignment_folder_url &&
    /^https:\/\/drive\.google\.com\/drive\/folders\/[A-Za-z0-9_-]+$/.test(
      folder.assignment_folder_url,
    )
      ? folder.assignment_folder_url
      : null;

  return (
    <Dialog
      open
      onOpenChange={(open) => {
        if (!open) onClose();
      }}
    >
      <DialogContent
        className="max-h-[90dvh] w-[calc(100%-2rem)] overflow-y-auto bg-white text-black sm:rounded-none"
        onCloseAutoFocus={(event) => {
          event.preventDefault();
          onAfterClose();
        }}
      >
        <DialogHeader>
          <DialogTitle className="pr-6 leading-7">
            10MB를 넘는 파일은 Google Drive로 제출해 주세요
          </DialogTitle>
          <DialogDescription className="leading-6 text-neutral-600">
            과제 폴더에 파일을 업로드한 뒤, 파일의 공유 링크를 복사해 이 피드백에 등록해 주세요.
            아직 선택한 파일은 업로드되지 않았습니다.
          </DialogDescription>
        </DialogHeader>
        <ul
          aria-label="10MB 초과 파일"
          className="max-h-40 space-y-2 overflow-y-auto border-y border-neutral-200 py-3 text-sm"
        >
          {files.map((file, i) => (
            <li key={`${file.name}-${i}`} className="flex justify-between gap-3">
              <span className="min-w-0 break-all">{file.name}</span>
              <span className="shrink-0 text-neutral-500">{feedbackFileSize(file.size)}</span>
            </li>
          ))}
        </ul>
        {loading ? (
          <p role="status" className="text-sm text-neutral-500">
            과제 폴더를 확인하는 중…
          </p>
        ) : failed ? (
          <div role="alert" className="text-sm">
            <p>
              과제 폴더를 불러오지 못했습니다. 다시 시도하거나 직접 Drive에 업로드한 파일 링크를
              등록해 주세요.
            </p>
            <button
              type="button"
              onClick={() => setAttempt((n) => n + 1)}
              className="min-h-10 underline"
            >
              다시 시도
            </button>
          </div>
        ) : !folder || !safeFolderUrl ? (
          <p className="text-sm text-neutral-600">
            연결된 과제 폴더가 없습니다. 강사에게 확인하거나, 직접 Drive에 업로드한 파일의 공유
            링크를 등록해 주세요.
          </p>
        ) : !folder.sharing_ready ? (
          <p className="text-sm text-neutral-600">
            {folder.name}님의 Google Drive 공유 권한을 확인 중입니다. 강사에게 Google 계정을 확인해
            주세요.
          </p>
        ) : (
          <a href={safeFolderUrl} target="_blank" rel="noopener noreferrer" className={button}>
            {instructor ? `${folder.name} 과제 폴더 열기` : "본인 과제 폴더 열기"}
            <ExternalLink className="size-4" aria-hidden="true" />
            <span className="sr-only">(새 탭)</span>
          </a>
        )}
        {folder && (
          <p className="break-all text-xs leading-5 text-neutral-500">
            등록된 Google 계정: {folder.google_email}
            <br />
            LMS 로그인과 Google 로그인은 별개입니다. 파일은 강사가 열 수 있는 공유 권한으로 설정해
            주세요.
          </p>
        )}
        {eligibleCount > 0 && (
          <div className="border-t border-neutral-200 pt-3">
            <p className="mb-2 text-sm text-neutral-600">
              함께 선택한 10MB 이하 파일 {eligibleCount}개는 LMS에 올릴 수 있습니다.
            </p>
            <button type="button" onClick={onUploadEligible} className={button}>
              10MB 이하 파일만 업로드
            </button>
          </div>
        )}
        <div className="flex flex-wrap justify-end gap-2">
          <button type="button" onClick={onClose} className={button}>
            닫기
          </button>
          <button
            type="button"
            onClick={onRegisterLink}
            className={`${button} bg-black text-white`}
          >
            링크 등록하기
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
