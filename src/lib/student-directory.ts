import { getSupabase } from "./supabase";

export interface StudentFolder {
  user_id: string;
  name: string;
  google_email: string;
  assignment_folder_url: string;
  portfolio_folder_url: string;
  sharing_ready: boolean;
}
export interface StudentProfile {
  id: string;
  username: string;
  role: string;
}

export async function loadStudentFolders(userId?: string): Promise<StudentFolder[]> {
  let query = getSupabase()
    .from("kmove_student_drive_folders")
    .select("user_id,name,google_email,assignment_folder_url,portfolio_folder_url,sharing_ready");
  if (userId) query = query.eq("user_id", userId);
  const { data, error } = await query.order("sort_order");
  if (error) throw new Error("Google Drive 연결 정보를 불러오지 못했습니다.");
  const rows = (data ?? []) as StudentFolder[];
  return userId ? rows.filter((row) => row.user_id === userId) : rows;
}

export async function loadStudentProfiles(): Promise<StudentProfile[]> {
  const { data, error } = await getSupabase()
    .from("kmove_profiles")
    .select("id,username,role")
    .eq("role", "student")
    .order("username");
  if (error) throw new Error("등록된 학생 계정을 불러오지 못했습니다.");
  return (data ?? []) as StudentProfile[];
}

export function studentOperationError(error: unknown, fallback: string): string {
  const message = error instanceof Error ? error.message : "";
  if (/conflict|version|revision|충돌|최신|다른 창/i.test(message)) {
    return "다른 창에서 변경된 내용이 있습니다. 다시 불러온 뒤 변경 내용을 확인해 주세요.";
  }
  return /[가-힣]/.test(message) ? message : fallback;
}
