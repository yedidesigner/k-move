import { createClient } from "npm:@supabase/supabase-js@2.76.1";

const headers = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Content-Type": "application/json",
  "Cache-Control": "no-store",
};
const reply = (status: number, data: object) => new Response(JSON.stringify(data), { status, headers });
const invalid = () => reply(401, { error: "invalid_credentials" });

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") return new Response(null, { status: 204, headers });
  if (req.method !== "POST") return reply(405, { error: "method_not_allowed" });
  try {
    const body = await req.json();
    const name = typeof body?.name === "string" ? body.name.trim().normalize("NFKC").toLocaleLowerCase("ko-KR") : "";
    const pin = typeof body?.pin === "string" ? body.pin : "";
    if (name.length < 2 || name.length > 30 || pin.length !== 4 || !/^[0-9]{4}$/.test(pin)) return invalid();

    const url = Deno.env.get("SUPABASE_URL")!;
    const opts = { auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false } };
    const service = createClient(url, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!, opts);
    const { data: target, error: lookupError } = await service.rpc("kmove_tutoring_login_target", { p_name: name });
    if (lookupError) return reply(503, { error: "login_unavailable" });
    if (target?.status === "limited") return reply(429, { error: "over_request_rate_limit" });
    if (target?.status !== "ok") return invalid();

    // Do not use service credentials to authenticate a student. Supabase Auth
    // verifies the PIN and issues the original student's ordinary session.
    const publicClient = createClient(url, Deno.env.get("SUPABASE_ANON_KEY")!, opts);
    const { data, error } = await publicClient.auth.signInWithPassword({ email: target.email, password: "Kmove:" + pin });
    if (error?.status === 429) return reply(429, { error: "over_request_rate_limit" });
    if (error || !data.session || data.user?.id !== target.user_id) return invalid();
    return reply(200, { access_token: data.session.access_token, refresh_token: data.session.refresh_token });
  } catch {
    return reply(503, { error: "login_unavailable" });
  }
});
