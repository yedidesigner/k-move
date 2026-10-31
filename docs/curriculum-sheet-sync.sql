-- Additive K-Move curriculum-only Sheet outbox. Apply after instructor-lms.sql.
-- No Google credentials, student information, or private instructor notes enter this outbox.
-- Browser saves retain the existing authenticated CAS RPC and enqueue atomically.
-- Public RPCs are INVOKER wrappers; every elevated entry point checks either the
-- existing authoritative instructor profile or a narrowly scoped worker key.
begin;

create table private.kmove_sheet_connector (
 id boolean primary key default true check(id),
 worker_hash bytea check(worker_hash is null or octet_length(worker_hash)=32),
 pairing_hash bytea check(pairing_hash is null or octet_length(pairing_hash)=32),
 pairing_expires_at timestamptz,
 paired_at timestamptz, last_seen_at timestamptz,
 issued_by uuid references auth.users(id), updated_at timestamptz not null default now()
);
insert into private.kmove_sheet_connector(id) values(true);
create table private.kmove_sheet_outbox (
 session_key text primary key check(session_key ~ '^S(0[1-9]|1[0-9]|2[0-4])$'),
 session_number smallint generated always as (substring(session_key from 2)::smallint) stored,
 source_version integer not null default 0 check(source_version>=0),
 desired_cells jsonb not null, baseline_cells jsonb, payload_valid boolean not null default true,
 last_synced_version integer not null default 0 check(last_synced_version>=0),
 status text not null default 'needs_baseline' check(status in ('synced','pending','conflict','error','needs_baseline')),
 error_code text, observed_cells jsonb,
 claimed_version integer, claimed_cells jsonb,
 lease_id uuid, lease_expires_at timestamptz,
 attempts integer not null default 0, retry_at timestamptz,
 updated_at timestamptz not null default now(), last_synced_at timestamptz,
 check(jsonb_typeof(desired_cells)='array' and jsonb_array_length(desired_cells)=9),
 check(baseline_cells is null or (jsonb_typeof(baseline_cells)='array' and jsonb_array_length(baseline_cells)=9)),
 check(observed_cells is null or (jsonb_typeof(observed_cells)='array' and jsonb_array_length(observed_cells)=9)),
 check((claimed_version is null)=(claimed_cells is null)),
 check(claimed_version is null or claimed_version<=source_version)
);
alter table private.kmove_sheet_connector enable row level security;
alter table private.kmove_sheet_outbox enable row level security;
revoke all on private.kmove_sheet_connector,private.kmove_sheet_outbox from public,anon,authenticated;
create policy "Instructor connector read" on private.kmove_sheet_connector for select to authenticated using((select private.is_kmove_instructor()));
create policy "Instructor outbox read" on private.kmove_sheet_outbox for select to authenticated using((select private.is_kmove_instructor()));

-- Fixed-length comparison executes all 32 byte comparisons, without an early exit.
create function private.kmove_sheet_hash_equal(a bytea,b bytea) returns boolean
language plpgsql immutable security invoker set search_path='' as $$
declare difference integer:=0; i integer;
begin
 if a is null or b is null or octet_length(a)<>32 or octet_length(b)<>32 then return false;end if;
 for i in 0..31 loop difference:=difference | (get_byte(a,i) # get_byte(b,i));end loop;
 return difference=0;
end $$;
create function private.kmove_sheet_assert_worker(p_worker_key text) returns void
language plpgsql security invoker set search_path='' as $$
declare stored bytea;
begin
 select worker_hash into stored from private.kmove_sheet_connector where id for update;
 if p_worker_key is null or p_worker_key !~ '^[0-9a-f]{96}$' or not private.kmove_sheet_hash_equal(stored,extensions.digest(p_worker_key,'sha256')) then
  raise exception 'Sheet 연결 인증에 실패했습니다.' using errcode='42501';
 end if;
end $$;
create function private.kmove_sheet_valid_cells(p_cells jsonb) returns boolean
language plpgsql immutable security invoker set search_path='' as $$
begin
 if p_cells is null or jsonb_typeof(p_cells)<>'array' then return false;end if;
 if jsonb_array_length(p_cells)<>9 then return false;end if;
 return not exists(select 1 from jsonb_array_elements(p_cells) v where jsonb_typeof(v)<>'string' or length(v#>>'{}')>40000 or position(chr(13) in (v#>>'{}'))>0);
end $$;
create function private.kmove_sheet_cells(p_document jsonb) returns jsonb
language plpgsql immutable security invoker set search_path='' as $$
declare c jsonb:=p_document->'curriculum'; cells jsonb; topics text; terms text; tools text;
begin
 if jsonb_typeof(c) is distinct from 'object' or jsonb_typeof(c->'topics') is distinct from 'array' or jsonb_typeof(c->'terms') is distinct from 'array' or jsonb_typeof(c->'tools') is distinct from 'array' then raise exception 'invalid_curriculum';end if;
 if exists(select 1 from jsonb_array_elements(c->'topics') v where jsonb_typeof(v)<>'string') or exists(select 1 from jsonb_array_elements(c->'tools') v where jsonb_typeof(v)<>'string') or exists(select 1 from jsonb_array_elements(c->'terms') v where jsonb_typeof(v)<>'object' or jsonb_typeof(v->'name') is distinct from 'string' or jsonb_typeof(v->'description') is distinct from 'string') then raise exception 'invalid_curriculum';end if;
 if coalesce(p_document->>'title','')='' or coalesce(p_document->>'date','') !~ '^\d{4}-\d{2}-\d{2}$' or coalesce(p_document->>'startTime','') !~ '^([01][0-9]|2[0-3]):[0-5][0-9]$' or coalesce(p_document->>'endTime','') !~ '^([01][0-9]|2[0-3]):[0-5][0-9]$' then raise exception 'invalid_curriculum';end if;
 select string_agg('• '||(v#>>'{}'),E'\n' order by n) into topics from jsonb_array_elements(c->'topics') with ordinality as x(v,n);
 select string_agg('• '||(v->>'name')||': '||(v->>'description'),E'\n' order by n) into terms from jsonb_array_elements(c->'terms') with ordinality as x(v,n);
 select string_agg(v#>>'{}',', ' order by n) into tools from jsonb_array_elements(c->'tools') with ordinality as x(v,n);
 cells:=jsonb_build_array(coalesce(c->>'cycle',''),(p_document->>'title')||E'\n\n'||coalesce(c->>'goalOutput',''),coalesce(topics,''),coalesce(terms,''),coalesce(tools,''),coalesce(c->>'homework',''),p_document->>'date',p_document->>'startTime',p_document->>'endTime');
 -- Normalize Windows input to the worker's LF-only exact-text contract.
 select jsonb_agg(replace(replace(v#>>'{}',E'\r\n',E'\n'),E'\r',E'\n') order by n) into cells from jsonb_array_elements(cells) with ordinality as x(v,n);
 if not private.kmove_sheet_valid_cells(cells) then raise exception 'invalid_curriculum';end if;
 return cells;
end $$;

create function private.kmove_sheet_enqueue() returns trigger
language plpgsql security definer set search_path='' as $$
declare cells jsonb; invalid boolean:=false;
begin
 if new.kind<>'session' or new.content_key !~ '^S(0[1-9]|1[0-9]|2[0-4])$' then return new;end if;
 -- Legacy lessons without a structured curriculum are not silently sent as blanks.
 if not(new.document ? 'curriculum') and not exists(select 1 from private.kmove_sheet_outbox where session_key=new.content_key) then return new;end if;
 begin cells:=private.kmove_sheet_cells(new.document);exception when others then invalid:=true;cells:='["","","","","","","","",""]'::jsonb;end;
 insert into private.kmove_sheet_outbox(session_key,source_version,desired_cells,payload_valid,status,error_code)
 values(new.content_key,new.version,cells,not invalid,case when invalid then 'error' else 'needs_baseline' end,case when invalid then 'invalid_curriculum' else 'baseline_required' end)
 on conflict(session_key) do update set source_version=excluded.source_version,payload_valid=excluded.payload_valid,
 desired_cells=case when invalid then private.kmove_sheet_outbox.desired_cells else excluded.desired_cells end,
 status=case when invalid then 'error' when private.kmove_sheet_outbox.baseline_cells is null then 'needs_baseline' when private.kmove_sheet_outbox.observed_cells is not null then 'conflict' when private.kmove_sheet_outbox.claimed_version is not null then 'pending' when excluded.desired_cells=private.kmove_sheet_outbox.baseline_cells then 'synced' else 'pending' end,
 error_code=case when invalid then 'invalid_curriculum' when private.kmove_sheet_outbox.baseline_cells is null then 'baseline_required' when private.kmove_sheet_outbox.observed_cells is not null then 'sheet_changed' else null end,
 last_synced_version=case when not invalid and private.kmove_sheet_outbox.claimed_version is null and excluded.desired_cells=private.kmove_sheet_outbox.baseline_cells then new.version else private.kmove_sheet_outbox.last_synced_version end,
 retry_at=null,updated_at=now();
 return new;
end $$;
create trigger kmove_sheet_curriculum_draft after insert or update of document,version on public.kmove_content_drafts for each row execute function private.kmove_sheet_enqueue();

create function private.kmove_sheet_status() returns jsonb
language plpgsql security definer set search_path='' as $$
declare c private.kmove_sheet_connector; status_rows jsonb;
begin
 perform private.kmove_assert_instructor();select * into c from private.kmove_sheet_connector where id;
 select coalesce(jsonb_agg(jsonb_build_object('session_key',o.session_key,'session_number',o.session_number,'source_version',o.source_version,'last_synced_version',o.last_synced_version,'status',o.status,'error_code',o.error_code,'updated_at',o.updated_at,'last_synced_at',o.last_synced_at,'lease_expires_at',o.lease_expires_at,'attempts',o.attempts,'conflict',case when o.observed_cells is not null then jsonb_build_object('baseline_cells',o.baseline_cells,'observed_cells',o.observed_cells,'desired_cells',o.desired_cells) else null end) order by o.session_number),'[]'::jsonb) into status_rows from private.kmove_sheet_outbox o;
 return jsonb_build_object('spreadsheet_id','1Hv7dvSg_R98DM8_VlCCg7ckYRoopmSFlAQ8z_g5Cds0','sheet_id',2001,'configured',c.worker_hash is not null,'connected',c.worker_hash is not null and coalesce(c.last_seen_at>now()-interval '5 minutes',false),'paired_at',c.paired_at,'last_seen_at',c.last_seen_at,'pairing_expires_at',case when c.pairing_expires_at>now() then c.pairing_expires_at else null end,'rows',status_rows);
end $$;
create function private.kmove_sheet_setup() returns jsonb
language plpgsql security definer set search_path='' as $$
declare code text; expiry timestamptz:=now()+interval '15 minutes';
begin
 perform private.kmove_assert_instructor();code:=encode(extensions.gen_random_bytes(32),'hex');
 update private.kmove_sheet_connector set pairing_hash=extensions.digest(code,'sha256'),pairing_expires_at=expiry,issued_by=auth.uid(),updated_at=now() where id;
 insert into public.kmove_operation_log(actor_id,action,target_id) values(auth.uid(),'curriculum.sheet_pairing_issued','curriculum');
 return jsonb_build_object('pairing_code',code,'expires_at',expiry,'spreadsheet_id','1Hv7dvSg_R98DM8_VlCCg7ckYRoopmSFlAQ8z_g5Cds0','sheet_id',2001);
end $$;
create function private.kmove_sheet_pair(p_pairing_code text,p_worker_key text,p_spreadsheet_id text,p_sheet_id integer) returns jsonb
language plpgsql security definer set search_path='' as $$
declare c private.kmove_sheet_connector;
begin
 select * into c from private.kmove_sheet_connector where id for update;
 if p_spreadsheet_id is distinct from '1Hv7dvSg_R98DM8_VlCCg7ckYRoopmSFlAQ8z_g5Cds0' or p_sheet_id is distinct from 2001 or p_pairing_code is null or p_pairing_code !~ '^[0-9a-f]{64}$' or p_worker_key is null or p_worker_key !~ '^[0-9a-f]{96}$' or c.pairing_expires_at is null or c.pairing_expires_at<=now() or not private.kmove_sheet_hash_equal(c.pairing_hash,extensions.digest(p_pairing_code,'sha256')) then raise exception '연결 코드가 만료되었거나 올바르지 않습니다.' using errcode='42501';end if;
 update private.kmove_sheet_connector set worker_hash=extensions.digest(p_worker_key,'sha256'),pairing_hash=null,pairing_expires_at=null,paired_at=now(),last_seen_at=null,updated_at=now() where id;
 -- Keep claimed snapshots after key rotation: a lost ACK may have already written one.
 update private.kmove_sheet_outbox set lease_id=null,lease_expires_at=null where lease_id is not null;
 insert into public.kmove_operation_log(actor_id,action,target_id) values(c.issued_by,'curriculum.sheet_paired','curriculum');
 return jsonb_build_object('paired',true,'spreadsheet_id','1Hv7dvSg_R98DM8_VlCCg7ckYRoopmSFlAQ8z_g5Cds0','sheet_id',2001);
end $$;
create function private.kmove_sheet_revoke() returns jsonb
language plpgsql security definer set search_path='' as $$
begin
 perform private.kmove_assert_instructor();
 update private.kmove_sheet_connector set worker_hash=null,pairing_hash=null,pairing_expires_at=null,last_seen_at=null,updated_at=now() where id;
 update private.kmove_sheet_outbox set lease_id=null,lease_expires_at=null where lease_id is not null;
 insert into public.kmove_operation_log(actor_id,action,target_id) values(auth.uid(),'curriculum.sheet_revoked','curriculum');return '{}'::jsonb;
end $$;

-- Initial manual Sheet update supplies exact values. It can initialize a baseline,
-- never replace an existing baseline or resolve a conflict silently.
create function private.kmove_sheet_seed(p_rows jsonb) returns jsonb
language plpgsql security definer set search_path='' as $$
declare seed_row jsonb; count_rows integer:=0;
begin
 perform private.kmove_assert_instructor();
 if p_rows is null or jsonb_typeof(p_rows)<>'array' or jsonb_array_length(p_rows)>24 then raise exception '초기 회차 자료를 확인해 주세요.';end if;
 if (select count(*)<>count(distinct x->>'session_key') from jsonb_array_elements(p_rows) x) then raise exception '회차가 중복되었습니다.';end if;
 for seed_row in select value from jsonb_array_elements(p_rows) loop
  if coalesce(seed_row->>'session_key','') !~ '^S(0[1-9]|1[0-9]|2[0-4])$' or not private.kmove_sheet_valid_cells(seed_row->'cells') then raise exception '초기 회차 자료를 확인해 주세요.';end if;
  insert into private.kmove_sheet_outbox(session_key,desired_cells,baseline_cells,status)
  values(seed_row->>'session_key',seed_row->'cells',seed_row->'cells','synced')
  on conflict(session_key) do update set baseline_cells=excluded.baseline_cells,
   status=case when private.kmove_sheet_outbox.error_code='invalid_curriculum' then 'error' when private.kmove_sheet_outbox.desired_cells=excluded.baseline_cells then 'synced' else 'pending' end,
   last_synced_version=case when private.kmove_sheet_outbox.desired_cells=excluded.baseline_cells then private.kmove_sheet_outbox.source_version else private.kmove_sheet_outbox.last_synced_version end,
   error_code=case when private.kmove_sheet_outbox.error_code='invalid_curriculum' then 'invalid_curriculum' else null end,updated_at=now()
  where private.kmove_sheet_outbox.baseline_cells is null;
  count_rows:=count_rows+1;
 end loop;
 return jsonb_build_object('rows_checked',count_rows);
end $$;
create function private.kmove_sheet_retry(p_session_key text,p_overwrite_conflict boolean default false,p_expected_source_version integer default null,p_expected_observed_cells jsonb default null) returns jsonb
language plpgsql security definer set search_path='' as $$
declare o private.kmove_sheet_outbox;
begin
 perform private.kmove_assert_instructor();select * into o from private.kmove_sheet_outbox where session_key=p_session_key for update;
 if o.session_key is null then raise exception '회차를 찾을 수 없습니다.';end if;
 if o.status='needs_baseline' or o.error_code='invalid_curriculum' then raise exception '회차 내용 또는 초기 연결 자료를 먼저 확인해 주세요.';end if;
 if o.status='conflict' then
  if p_overwrite_conflict is distinct from true or o.observed_cells is null then raise exception '시트 변경 내용을 확인하고 덮어쓰기를 선택해 주세요.';end if;
  if p_expected_source_version is distinct from o.source_version or p_expected_observed_cells is distinct from o.observed_cells then raise exception '확인한 충돌 내용이 변경되었습니다. 최신 내용을 다시 비교해 주세요.' using errcode='40001';end if;
  update private.kmove_sheet_outbox set baseline_cells=observed_cells,observed_cells=null,claimed_version=null,claimed_cells=null,lease_id=null,lease_expires_at=null where session_key=p_session_key;
 end if;
 update private.kmove_sheet_outbox set status=case when desired_cells=baseline_cells and claimed_version is null then 'synced' else 'pending' end,error_code=null,retry_at=null,attempts=0,updated_at=now() where session_key=p_session_key;
 insert into public.kmove_operation_log(actor_id,action,target_id,details) values(auth.uid(),'curriculum.sheet_retry',p_session_key,jsonb_build_object('conflict_overwrite',o.status='conflict' and p_overwrite_conflict));return '{}'::jsonb;
end $$;

create function private.kmove_sheet_pull(p_worker_key text) returns jsonb
language plpgsql security definer set search_path='' as $$
declare o private.kmove_sheet_outbox; jobs jsonb:='[]';
begin
 perform private.kmove_sheet_assert_worker(p_worker_key);
 update private.kmove_sheet_connector set last_seen_at=now() where id;
 for o in select * from private.kmove_sheet_outbox where status in ('pending','error') and payload_valid and baseline_cells is not null and (retry_at is null or retry_at<=now()) and (lease_expires_at is null or lease_expires_at<=now()) order by session_number limit 4 for update skip locked loop
  -- Reclaim the identical snapshot after a timeout. Its write may have succeeded
  -- before a lost ACK; newer drafts must not invalidate idempotent reconciliation.
  update private.kmove_sheet_outbox set claimed_version=coalesce(claimed_version,source_version),claimed_cells=coalesce(claimed_cells,desired_cells),lease_id=gen_random_uuid(),lease_expires_at=now()+interval '10 minutes',attempts=attempts+1 where session_key=o.session_key returning * into o;
  jobs:=jobs||jsonb_build_array(jsonb_build_object('session_key',o.session_key,'session_number',o.session_number,'source_version',o.claimed_version,'lease_id',o.lease_id,'lease_expires_at',o.lease_expires_at,'baseline_cells',o.baseline_cells,'desired_cells',o.claimed_cells));
 end loop;
 return jsonb_build_object('spreadsheet_id','1Hv7dvSg_R98DM8_VlCCg7ckYRoopmSFlAQ8z_g5Cds0','sheet_id',2001,'jobs',jobs);
end $$;
create function private.kmove_sheet_check_lease(p_worker_key text,p_session_key text,p_lease_id uuid,p_source_version integer) returns boolean
language plpgsql security definer set search_path='' as $$
begin
 perform private.kmove_sheet_assert_worker(p_worker_key);
 return exists(select 1 from private.kmove_sheet_outbox where session_key=p_session_key and lease_id=p_lease_id and claimed_version=p_source_version and lease_expires_at>now() and payload_valid and status in ('pending','error'));
end $$;
create function private.kmove_sheet_ack(p_worker_key text,p_session_key text,p_lease_id uuid,p_source_version integer,p_result text,p_observed_cells jsonb default null,p_error_code text default null) returns jsonb
language plpgsql security definer set search_path='' as $$
declare o private.kmove_sheet_outbox; code text;
begin
 perform private.kmove_sheet_assert_worker(p_worker_key);
 select * into o from private.kmove_sheet_outbox where session_key=p_session_key for update;
 if o.session_key is null or o.lease_id is distinct from p_lease_id or p_lease_id is null or o.claimed_version is distinct from p_source_version or o.lease_expires_at<=now() then return jsonb_build_object('accepted',false);end if;
 if p_result='synced' then
  if not private.kmove_sheet_valid_cells(p_observed_cells) or p_observed_cells is distinct from o.claimed_cells then raise exception '시트 저장 결과가 요청 내용과 다릅니다.';end if;
  update private.kmove_sheet_outbox set baseline_cells=o.claimed_cells,last_synced_version=case when payload_valid and desired_cells=o.claimed_cells then source_version else o.claimed_version end,last_synced_at=now(),status=case when not payload_valid then 'error' when desired_cells=o.claimed_cells then 'synced' else 'pending' end,error_code=case when not payload_valid then 'invalid_curriculum' else null end,observed_cells=null,claimed_version=null,claimed_cells=null,lease_id=null,lease_expires_at=null,retry_at=null,attempts=0,updated_at=now() where session_key=p_session_key;
 elsif p_result='conflict' then
  if not private.kmove_sheet_valid_cells(p_observed_cells) then raise exception '시트 확인 결과를 확인해 주세요.';end if;
  update private.kmove_sheet_outbox set status=case when payload_valid then 'conflict' else 'error' end,error_code=case when payload_valid then 'sheet_changed' else 'invalid_curriculum' end,observed_cells=p_observed_cells,lease_id=null,lease_expires_at=null,retry_at=null,updated_at=now() where session_key=p_session_key;
 elsif p_result='error' then
  code:=case when p_error_code in ('target_missing','duplicate_session','formula_present','permission_denied','transport_error','write_verification_failed','invalid_sheet') then p_error_code else 'transport_error' end;
  update private.kmove_sheet_outbox set status='error',error_code=case when payload_valid then code else 'invalid_curriculum' end,lease_id=null,lease_expires_at=null,retry_at=now()+least(300,30*greatest(1,attempts))*interval '1 second',updated_at=now() where session_key=p_session_key;
 else raise exception '지원하지 않는 동기화 결과입니다.';end if;
 update private.kmove_sheet_connector set last_seen_at=now() where id;
 select * into o from private.kmove_sheet_outbox where session_key=p_session_key;
 return jsonb_build_object('accepted',true,'status',o.status,'source_version',o.source_version,'last_synced_version',o.last_synced_version);
end $$;

-- Explicit grants cover only the named, guarded RPCs. Helpers and trigger are private.
grant usage on schema private to anon,authenticated;
do $rpc$
declare r record; args text; workers boolean;
begin
 for r in select p.oid,p.proname,pg_get_function_identity_arguments(p.oid) identity_args,pg_get_function_arguments(p.oid) all_args,pg_get_function_result(p.oid) result_type,p.proargnames
 from pg_proc p join pg_namespace n on n.oid=p.pronamespace where n.nspname='private' and p.proname like 'kmove_sheet_%' loop
  execute format('revoke all on function private.%I(%s) from public,anon,authenticated',r.proname,r.identity_args);
  if r.proname in ('kmove_sheet_status','kmove_sheet_setup','kmove_sheet_pair','kmove_sheet_revoke','kmove_sheet_seed','kmove_sheet_retry','kmove_sheet_pull','kmove_sheet_check_lease','kmove_sheet_ack') then
   select string_agg(quote_ident(x),',' order by ord) into args from unnest(r.proargnames) with ordinality as names(x,ord);
   workers:=r.proname in ('kmove_sheet_pair','kmove_sheet_pull','kmove_sheet_check_lease','kmove_sheet_ack');
   execute format('create function public.%I(%s) returns %s language sql security invoker set search_path='''' as %L',r.proname,r.all_args,r.result_type,'select private.'||quote_ident(r.proname)||'('||coalesce(args,'')||');');
   execute format('revoke all on function public.%I(%s) from public,anon,authenticated',r.proname,r.identity_args);
   execute format('grant execute on function private.%I(%s) to authenticated%s',r.proname,r.identity_args,case when workers then ',anon' else '' end);
   execute format('grant execute on function public.%I(%s) to authenticated%s',r.proname,r.identity_args,case when workers then ',anon' else '' end);
  end if;
 end loop;
end $rpc$;
notify pgrst,'reload schema';
commit;
