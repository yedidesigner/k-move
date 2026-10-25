-- Additive migration for the existing K-Move project.
-- Prerequisite: docs/supabase-setup.sql has been applied.
create schema if not exists private;
grant usage on schema private to authenticated;

create or replace function private.kmove_survey_answers_valid(a jsonb)
returns boolean language plpgsql immutable set search_path = '' as $fn$
declare
  spec constant jsonb := $schema${"id":"k-move-ot-2026","version":2,"title":"2026년 K-Move 미국 디자인 실무 취업 연수과정 | 사전 학습 설문","questions":[{"id":"name","number":1,"step":0,"type":"text","required":true,"title":"성함을 입력해 주세요.","maxLength":50},{"id":"aiExperience","number":2,"step":0,"type":"single","required":true,"title":"AI 활용 수준을 선택해 주세요.","help":"직접 해 본 경험 중 가장 높은 수준을 선택해 주세요.","options":[{"id":"none","title":"사용 경험 없음","description":"AI 서비스를 사용해 본 적이 없습니다."},{"id":"basic","title":"기본 기능 사용","description":"질문·번역·요약 등 간단한 요청을 해 본 적이 있습니다."},{"id":"iterate","title":"프롬프트 작성·수정","description":"원하는 결과를 얻기 위해 요청을 구체화하고 수정해 본 적이 있습니다."},{"id":"apply","title":"실제 작업에 활용","description":"AI 결과를 검토·수정하여 과제나 디자인 작업에 활용해 본 적이 있습니다."},{"id":"project","title":"프로젝트 전반에 활용","description":"기획·제작·수정 등 프로젝트의 여러 단계에 AI를 활용해 본 적이 있습니다."}]},{"id":"aiServices","number":3,"step":0,"type":"multi","required":true,"title":"AI 서비스별 무료·유료 이용 경험을 선택해 주세요.","help":"두 방식 모두 사용했다면 둘 다 선택해 주세요. 무료 체험·제공 이용권은 무료에 포함합니다.","options":[{"id":"chatgpt_free","title":"ChatGPT · 무료"},{"id":"chatgpt_paid","title":"ChatGPT · 유료"},{"id":"gemini_free","title":"Gemini · 무료"},{"id":"gemini_paid","title":"Gemini · 유료"},{"id":"claude_free","title":"Claude · 무료"},{"id":"claude_paid","title":"Claude · 유료"},{"id":"ai_studio_free","title":"Google AI Studio · 무료"},{"id":"ai_studio_paid","title":"Google AI Studio · 유료"},{"id":"firefly_free","title":"Adobe Firefly · 무료"},{"id":"firefly_paid","title":"Adobe Firefly · 유료"},{"id":"midjourney_free","title":"Midjourney · 무료"},{"id":"midjourney_paid","title":"Midjourney · 유료"},{"id":"other_free","title":"기타 서비스 · 무료"},{"id":"other_paid","title":"기타 서비스 · 유료"},{"id":"none","title":"사용해 본 적이 없습니다"}],"exclusive":"none","other":true,"layout":"servicePlans","otherOptionIds":["other_free","other_paid"],"services":[{"id":"chatgpt","title":"ChatGPT"},{"id":"gemini","title":"Gemini"},{"id":"claude","title":"Claude"},{"id":"ai_studio","title":"Google AI Studio"},{"id":"firefly","title":"Adobe Firefly"},{"id":"midjourney","title":"Midjourney"},{"id":"other","title":"기타 서비스"}]},{"id":"designSkills","number":4,"step":1,"type":"matrix","required":true,"title":"디자인 프로그램별 활용 수준을 선택해 주세요.","help":"각 프로그램에 대해 하나씩 선택해 주세요. 사용 경험이 없다면 ‘경험 없음’을 선택해 주세요.","rows":[{"id":"photoshop","title":"Photoshop"},{"id":"illustrator","title":"Illustrator"},{"id":"indesign","title":"InDesign"},{"id":"after_effects","title":"After Effects"},{"id":"premiere_pro","title":"Premiere Pro"},{"id":"figma","title":"Figma"},{"id":"canva","title":"Canva"}],"otherText":true,"otherMaxLength":300},{"id":"portfolio","number":5,"step":1,"type":"single","required":true,"title":"현재 포트폴리오 준비 상태를 선택해 주세요.","help":"PDF, 인쇄물, 웹사이트 등 형식과 관계없이 현재 상태를 기준으로 선택해 주세요.","options":[{"id":"starting","title":"포트폴리오에 넣을 작업물부터 준비해야 합니다."},{"id":"works","title":"작업물은 있지만 포트폴리오로 정리하지 않았습니다."},{"id":"partial","title":"일부 구성했지만 아직 완성하지 못했습니다."},{"id":"draft","title":"초안은 완성했지만 지원용으로 제출하기 전에 수정이 필요합니다."},{"id":"ready","title":"지원용으로 제출할 수 있는 포트폴리오가 준비되어 있습니다."}]},{"id":"interests","number":6,"step":2,"type":"multi","required":true,"title":"관심 있는 디자인 분야 또는 희망 직무는 무엇인가요?","help":"가장 관심 있는 분야를 최대 2개 선택해 주세요.","max":2,"options":[{"id":"graphic","title":"그래픽·시각 디자인"},{"id":"branding","title":"브랜딩·브랜드 아이덴티티"},{"id":"editorial","title":"편집·출판 디자인"},{"id":"packaging","title":"패키지 디자인"},{"id":"uiux","title":"웹·UI/UX 디자인"},{"id":"motion","title":"영상 편집·모션 그래픽"},{"id":"other","title":"기타 분야"},{"id":"undecided","title":"아직 정하지 못했습니다"}],"exclusive":"undecided","other":true},{"id":"goals","number":7,"step":2,"type":"multi","required":true,"title":"이번 수업에서 특히 배우고 싶은 내용을 선택해 주세요.","help":"우선 배우고 싶은 내용을 최대 2개 선택해 주세요.","max":2,"options":[{"id":"prompt","title":"AI에 원하는 결과를 구체적으로 요청하는 방법"},{"id":"research","title":"디자인 자료 조사와 아이디어 구체화"},{"id":"image","title":"AI 이미지 생성·수정 및 디자인 작업에 활용"},{"id":"curation","title":"포트폴리오의 작품 선정·순서·전체 구성"},{"id":"visual","title":"레이아웃·타이포그래피·시각적 완성도 개선"},{"id":"website","title":"포트폴리오 웹사이트 제작"},{"id":"other","title":"기타 학습 목표"}],"other":true},{"id":"message","number":8,"step":2,"type":"textarea","required":false,"title":"꼭 해결하고 싶은 어려움이나 강사에게 전하고 싶은 말이 있나요?","help":"어려운 점이나 추가로 사용하는 디자인 도구도 자유롭게 적어 주세요.","maxLength":1000}],"levels":[{"id":"none","short":"경험 없음","description":"사용해 본 적이 없어요"},{"id":"guided","short":"따라 하기","description":"설명·예제를 따라 작업해요"},{"id":"independent","short":"독립 작업","description":"기본 작업을 혼자 완성해요"},{"id":"advanced","short":"응용 가능","description":"목적에 맞게 기능을 응용해요"}]}$schema$::jsonb;
  q jsonb; v jsonb; row_spec jsonb; other_value jsonb; needs_other boolean;
begin
  if jsonb_typeof(a) is distinct from 'object' or octet_length(a::text) > 16000 then return false; end if;
  if exists (
    select 1 from jsonb_object_keys(a) k
    where not exists (select 1 from jsonb_array_elements(spec->'questions') x where k=x->>'id' or ((x->>'other'='true' or x->>'otherText'='true') and k=(x->>'id')||'Other'))
  ) then return false; end if;
  for q in select value from jsonb_array_elements(spec->'questions') loop
    v := a->(q->>'id');
    if q->>'type' in ('text','textarea') then
      if v is null and q->>'required'='false' then continue; end if;
      if jsonb_typeof(v) is distinct from 'string' then return false; end if;
      if q->>'required'='true' and length(btrim(v#>>'{}'))=0 then return false; end if;
      if length(v#>>'{}') > (q->>'maxLength')::integer then return false; end if;
    elsif q->>'type'='single' then
      if jsonb_typeof(v) is distinct from 'string' or not exists(select 1 from jsonb_array_elements(q->'options') o where o->>'id'=v#>>'{}') then return false; end if;
    elsif q->>'type'='multi' then
      if jsonb_typeof(v) is distinct from 'array' then return false; end if;
      if jsonb_array_length(v)=0 or jsonb_array_length(v)>coalesce((q->>'max')::integer, 20) then return false; end if;
      if exists(select 1 from jsonb_array_elements(v) x where jsonb_typeof(x) is distinct from 'string' or not exists(select 1 from jsonb_array_elements(q->'options') o where o->>'id'=x#>>'{}')) then return false; end if;
      if (select count(distinct x) from jsonb_array_elements(v) x) <> jsonb_array_length(v) then return false; end if;
      if q ? 'exclusive' and v ? (q->>'exclusive') and jsonb_array_length(v)>1 then return false; end if;
    elsif q->>'type'='matrix' then
      if jsonb_typeof(v) is distinct from 'object' then return false; end if;
      if (select count(*) from jsonb_object_keys(v)) <> jsonb_array_length(q->'rows') then return false; end if;
      for row_spec in select value from jsonb_array_elements(q->'rows') loop
        if not exists(select 1 from jsonb_array_elements(spec->'levels') l where l->>'id'=v->>(row_spec->>'id')) then return false; end if;
      end loop;
    end if;
    if q->>'other'='true' or q->>'otherText'='true' then
      other_value := a->((q->>'id')||'Other');
      needs_other := q->>'other'='true' and exists(select 1 from jsonb_array_elements_text(coalesce(q->'otherOptionIds','["other"]'::jsonb)) id where v ? id);
      if needs_other and (jsonb_typeof(other_value) is distinct from 'string' or length(btrim(other_value#>>'{}'))=0) then return false; end if;
      if other_value is not null and (jsonb_typeof(other_value) is distinct from 'string' or length(other_value#>>'{}')>coalesce((q->>'otherMaxLength')::integer,150)) then return false; end if;
    end if;
  end loop;
  return true;
end;
$fn$;
revoke all on function private.kmove_survey_answers_valid(jsonb) from public, anon;
grant execute on function private.kmove_survey_answers_valid(jsonb) to authenticated;

create table public.kmove_survey_responses (
  survey_id text not null default 'k-move-ot-2026' check(survey_id='k-move-ot-2026'),
  user_id uuid not null references public.kmove_profiles(id) on delete cascade,
  schema_version integer not null default 2 check(schema_version=2),
  answers jsonb not null check(private.kmove_survey_answers_valid(answers)),
  submitted_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  primary key(survey_id,user_id)
);
create index kmove_survey_responses_user_id_idx on public.kmove_survey_responses(user_id);
alter table public.kmove_survey_responses enable row level security;
revoke all on public.kmove_survey_responses from public, anon, authenticated;
grant select on public.kmove_survey_responses to authenticated;
grant insert(survey_id,user_id,schema_version,answers), update(survey_id,user_id,schema_version,answers) on public.kmove_survey_responses to authenticated;
grant all on public.kmove_survey_responses to service_role;

create policy "Read own response or instructor reads all" on public.kmove_survey_responses
for select to authenticated using ((select auth.uid())=user_id or (select private.is_kmove_instructor()));
create policy "Submit own response" on public.kmove_survey_responses
for insert to authenticated with check ((select auth.uid())=user_id);
create policy "Update own response" on public.kmove_survey_responses
for update to authenticated using ((select auth.uid())=user_id) with check ((select auth.uid())=user_id);

create or replace function private.kmove_survey_timestamps()
returns trigger language plpgsql set search_path='' as $$
begin
  if tg_op='UPDATE' then
    if new.user_id<>old.user_id or new.survey_id<>old.survey_id then raise exception 'Response owner cannot change' using errcode='42501'; end if;
    new.submitted_at := old.submitted_at;
  else
    new.submitted_at := now();
  end if;
  new.updated_at := now();
  return new;
end;
$$;
revoke all on function private.kmove_survey_timestamps() from public,anon,authenticated;
create trigger kmove_survey_set_timestamps before insert or update on public.kmove_survey_responses
for each row execute function private.kmove_survey_timestamps();
