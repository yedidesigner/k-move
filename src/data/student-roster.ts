/** Public course names only. Private folder mappings are fetched through Supabase RLS. */
export const ASSIGNMENT_ROOT_FOLDER_URL =
  "https://drive.google.com/drive/folders/18XvFZNIwIua9fNcXyOYiRIkI2SD3eDV3";
export const PORTFOLIO_ROOT_FOLDER_URL =
  "https://drive.google.com/drive/folders/1ylEME231wJeG9okmvJaPjKtGO_kccfAo";

export const STUDENT_ROSTER = [
  { name: "강민주" },
  { name: "강유민" },
  { name: "김다혜" },
  { name: "김선미" },
  { name: "김재은" },
  { name: "김화민" },
  { name: "류영진" },
  { name: "오한별" },
  { name: "이익제" },
  { name: "이주희" },
  { name: "이지원" },
  { name: "임시윤" },
  { name: "정여진" },
  { name: "최지인" },
  { name: "최형주" },
] as const;

export const STUDENT_NAMES = STUDENT_ROSTER.map(({ name }) => name);
