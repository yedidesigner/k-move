import { getSupabase } from "./supabase";
import {
  cleanAnswers,
  survey,
  validateQuestion,
  type Answers,
  type Profile,
  type SurveyResponse,
} from "./survey";

export function surveyError(error: { code?: string; message?: string }): string {
  if (error.code === "42P01" || error.code === "PGRST205")
    return "설문 저장 기능을 준비 중입니다. 강사에게 알려 주세요.";
  if (error.code === "42501" || error.code === "PGRST301")
    return "저장 권한을 확인하지 못했습니다. 다시 로그인해 주세요.";
  if (error.code === "23514") return "응답 형식이 올바르지 않습니다. 필수 항목을 확인해 주세요.";
  return "서버에 연결하지 못했습니다. 인터넷 연결을 확인한 뒤 다시 시도해 주세요.";
}

export async function loadOwnResponse(userId: string): Promise<SurveyResponse | null> {
  const { data, error } = await getSupabase()
    .from("kmove_survey_responses")
    .select("user_id,survey_id,schema_version,answers,submitted_at,updated_at")
    .eq("survey_id", survey.id)
    .eq("user_id", userId)
    .maybeSingle();
  if (error) throw new Error(surveyError(error));
  return data as SurveyResponse | null;
}

export async function submitResponse(userId: string, answers: Answers): Promise<SurveyResponse> {
  const cleaned = cleanAnswers(answers);
  if (survey.questions.some((q) => validateQuestion(q, cleaned)))
    throw new Error("필수 항목과 선택 개수를 확인해 주세요.");
  const { data, error } = await getSupabase()
    .from("kmove_survey_responses")
    .upsert(
      { user_id: userId, survey_id: survey.id, schema_version: survey.version, answers: cleaned },
      { onConflict: "survey_id,user_id" },
    )
    .select("user_id,survey_id,schema_version,answers,submitted_at,updated_at")
    .single();
  if (error || !data) throw new Error(surveyError(error ?? {}));
  return data as SurveyResponse;
}

// Fetch every page so instructor counts and exports never silently stop at the API's row limit.
export async function loadDashboard(): Promise<{
  profiles: Profile[];
  responses: SurveyResponse[];
}> {
  const client = getSupabase();
  async function profiles() {
    const result: Profile[] = [];
    for (let from = 0; ; from += 500) {
      const { data, error } = await client
        .from("kmove_profiles")
        .select("id,username,role,created_at")
        .order("id")
        .range(from, from + 499);
      if (error) throw new Error(surveyError(error));
      result.push(...(data as Profile[]));
      if (data.length < 500) return result;
    }
  }
  async function responses() {
    const result: SurveyResponse[] = [];
    for (let from = 0; ; from += 500) {
      const { data, error } = await client
        .from("kmove_survey_responses")
        .select("user_id,survey_id,schema_version,answers,submitted_at,updated_at")
        .eq("survey_id", survey.id)
        .order("user_id")
        .range(from, from + 499);
      if (error) throw new Error(surveyError(error));
      result.push(...(data as SurveyResponse[]));
      if (data.length < 500) return result;
    }
  }
  const [p, r] = await Promise.all([profiles(), responses()]);
  return { profiles: p, responses: r };
}
