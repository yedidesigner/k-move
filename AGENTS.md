<!-- LOVABLE:BEGIN -->
> [!IMPORTANT]
> This project is connected to [Lovable](https://lovable.dev). Avoid rewriting
> published git history — force pushing, or rebasing/amending/squashing commits
> that are already pushed — as it rewrites history on Lovable's side and the
> user will likely lose their project history.
>
> Commits you push to the connected branch sync back to Lovable and show up in
> the editor, so keep the branch in a working state.
<!-- LOVABLE:END -->

## Project rules
- Backend is the owner's Supabase project via `@supabase/supabase-js`; do not reintroduce Firebase or Lovable Cloud.
- Supabase is initialized in the browser only from `VITE_SUPABASE_URL` and `VITE_SUPABASE_PUBLISHABLE_KEY`; never expose a secret/service-role key.
- Access control is enforced with RLS on `kmove_profiles` and `kmove_portfolios`; UI hiding is not security.
- Protected pages live under the pathless `_app` layout with ssr:false — auth state exists only client-side.
- Schedule is static in src/data/schedule.ts; weekdays are computed in Asia/Seoul. External Sheets/Drive synchronization can be added through Supabase Edge Functions later.
