import { createClient } from "npm:@supabase/supabase-js@2.76.1";

const cors = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Cache-Control": "no-store",
};
const reply = (status: number, body: object) =>
  new Response(JSON.stringify(body), { status, headers: { ...cors, "Content-Type": "application/json" } });

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") return new Response(null, { status: 204, headers: cors });
  if (req.method !== "POST") return reply(405, { error: "허용되지 않은 요청입니다." });
  try {
    const auth = req.headers.get("Authorization") ?? "";
    if (!auth.startsWith("Bearer ")) return reply(401, { error: "로그인이 필요합니다." });
    const url = Deno.env.get("SUPABASE_URL")!;
    const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const anonKey = Deno.env.get("SUPABASE_ANON_KEY")!;
    const opts = { auth: { persistSession: false, autoRefreshToken: false } };
    const admin = createClient(url, serviceKey, opts);
    const { data: caller, error: authError } = await admin.auth.getUser(auth.slice(7));
    if (authError || !caller.user) return reply(401, { error: "로그인을 다시 확인해 주세요." });
    const { data: profile, error: profileError } = await admin.from("kmove_profiles")
      .select("role").eq("id", caller.user.id).maybeSingle();
    if (profileError || profile?.role !== "instructor") return reply(403, { error: "강사만 학생을 초대할 수 있습니다." });

    const body = await req.json();
    const name = typeof body.name === "string" ? body.name.normalize("NFKC").trim() : "";
    const email = typeof body.email === "string" ? body.email.trim().toLowerCase() : "";
    const type = "private";
    if (name.length < 2 || name.length > 30 || ["강예지", "tomset", "홍길동", "홍길순"].includes(name)
      || email.length > 254 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
      || email.endsWith("@login.kmove.local") || (body.student_type !== undefined && !["guest", "private"].includes(body.student_type))) {
      return reply(400, { error: "이름과 실제 이메일을 확인해 주세요." });
    }
    // The redirect must be the same browser origin and also pass Supabase's Auth allow-list.
    const origin = req.headers.get("Origin");
    if (!origin || !origin.startsWith("https://")) return reply(400, { error: "HTTPS LMS에서 초대해 주세요." });
    const redirect = "https://k-move.vercel.app/login";
    // Use the caller's verified JWT for the instructor-only RPC. An existing
    // invite is completed idempotently, not duplicated. Never return a login
    // link for an account that has already confirmed or signed in.
    const instructor = createClient(url, anonKey, { ...opts, global: { headers: { Authorization: auth } } });
    const ensureEnrollment = () => instructor.rpc("kmove_ensure_private_invitation", { p_name: name, p_email: email });
    let { data: enrollment, error: enrollError } = await ensureEnrollment();
    if (enrollError) {
      if (enrollError.code === "23514" || enrollError.code === "42501") return reply(409, { error: "기존 계정과 초대 정보가 일치하지 않습니다. 이름과 이메일을 확인해 주세요." });
      return reply(500, { error: "수강 정보를 확인하지 못했습니다. 다시 시도해 주세요." });
    }
    if (!enrollment?.found) {
      const { data: existingName, error: nameError } = await admin.from("kmove_feedback_students")
        .select("id").eq("name", name).maybeSingle();
      if (nameError) return reply(500, { error: "기존 학생 명단 확인에 실패했습니다." });
      if (existingName) return reply(409, { error: "동일한 이름의 학생이 이미 있습니다. 구분 가능한 이름을 입력해 주세요." });
      const { data: created, error: createError } = await admin.auth.admin.createUser({
        email, email_confirm: false,
        user_metadata: { username: name },
        app_metadata: { kmove_external_type: type, kmove_invited_by: caller.user.id },
      });
      if (createError || !created.user) return reply(409, { error: "계정을 생성하지 못했습니다. 동일한 이름과 이메일로 다시 시도해 주세요." });
      // Auth may persist the admin metadata after the INSERT trigger. Check
      // and finish registration only after createUser has returned.
      ({ data: enrollment, error: enrollError } = await ensureEnrollment());
      if (enrollError || !enrollment?.found || enrollment.user_id !== created.user.id) {
        return reply(500, { error: "계정은 생성되었습니다. 동일한 이름과 이메일로 다시 초대하면 수강 등록을 이어서 처리합니다." });
      }
    }
    if (!enrollment.can_deliver_initial_link) {
      return reply(200, { created: true, already_registered: true, email_sent: false });
    }
    const mail = createClient(url, anonKey, opts);
    const { error: mailError } = await mail.auth.signInWithOtp({
      email, options: { shouldCreateUser: false, emailRedirectTo: redirect },
    });
    if (!mailError) return reply(200, { created: true, email_sent: true });
    // The built-in SMTP service may restrict external recipients. Only an
    // authenticated instructor may receive a replacement one-time access link.
    const { data: fallback, error: linkError } = await admin.auth.admin.generateLink({
      type: "magiclink", email, options: { redirectTo: redirect },
    });
    const inviteLink = fallback?.properties?.action_link;
    return reply(200, {
      created: true, email_sent: false,
      ...(linkError || typeof inviteLink !== "string" || !inviteLink.startsWith("https://")
        ? {} : { invite_link: inviteLink }),
    });
  } catch {
    return reply(500, { error: "초대 처리에 실패했습니다. 입력 내용과 서버 설정을 확인해 주세요." });
  }
});
