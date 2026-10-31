-- Final draft-pin and public-content validation; preserves existing function permissions.
begin;

create or replace function private.kmove_save_review_draft(p_submission_id uuid,p_payload jsonb,p_expected_version integer) returns jsonb language plpgsql security definer set search_path='' as $$
declare d public.kmove_review_drafts;pin jsonb;k text;v jsonb;pins jsonb:=coalesce(p_payload->'pins','[]');comments jsonb:=coalesce(p_payload->'asset_comments','{}');
begin
 perform private.kmove_assert_instructor();
 perform pg_advisory_xact_lock(hashtextextended(p_submission_id::text,1));
 if not exists(select 1 from public.kmove_submissions where id=p_submission_id) then raise exception '제출물을 찾을 수 없습니다.';end if;
 select * into d from public.kmove_review_drafts where submission_id=p_submission_id for update;
 if coalesce(d.version,0) is distinct from p_expected_version then raise exception '다른 창에서 피드백이 변경되었습니다. 최신 내용을 다시 불러오세요.' using errcode='40001';end if;
 if jsonb_typeof(pins)<>'array' or jsonb_array_length(pins)>200 or octet_length(pins::text)>150000 or jsonb_typeof(comments)<>'object' or octet_length(comments::text)>150000 then raise exception '피드백 자료 형식 또는 크기를 확인해 주세요.';end if;
 for pin in select value from jsonb_array_elements(pins) loop
  if not exists(select 1 from public.kmove_submission_assets x where x.submission_id=p_submission_id and x.image_id=(pin->>'image_id')::uuid) or (pin->>'x')::numeric not between 0 and 1 or (pin->>'y')::numeric not between 0 and 1 or jsonb_typeof(pin->'content') is distinct from 'string' or length(pin->>'content')>5000 or pin->>'x' is null or pin->>'y' is null then raise exception '핀 위치와 제출 이미지를 확인해 주세요.';end if;
 end loop;
 for k,v in select * from jsonb_each(comments) loop
  if jsonb_typeof(v)<>'string' or length(v#>>'{}')>5000 or not exists(select 1 from public.kmove_submission_assets x where x.submission_id=p_submission_id and (x.image_id=k::uuid or x.attachment_id=k::uuid)) then raise exception '첨부물 피드백 대상을 확인해 주세요.';end if;
 end loop;
 insert into public.kmove_review_drafts(submission_id,strengths,improvements,next_steps,decision,pins,asset_comments,private_note,updated_by)
 values(p_submission_id,coalesce(p_payload->>'strengths',''),coalesce(p_payload->>'improvements',''),coalesce(p_payload->>'next_steps',''),coalesce(p_payload->>'decision','changes_requested'),pins,comments,coalesce(p_payload->>'private_note',''),auth.uid())
 on conflict(submission_id) do update set strengths=excluded.strengths,improvements=excluded.improvements,next_steps=excluded.next_steps,decision=excluded.decision,pins=excluded.pins,asset_comments=excluded.asset_comments,private_note=excluded.private_note,version=public.kmove_review_drafts.version+1,updated_at=now(),updated_by=auth.uid() returning * into d;
 return to_jsonb(d);
end $$;

create or replace function private.kmove_publish_review(p_submission_id uuid,p_expected_version integer) returns jsonb language plpgsql security definer set search_path='' as $$
declare d public.kmove_review_drafts;p public.kmove_review_publications;
begin
 perform private.kmove_assert_instructor();
 select * into d from public.kmove_review_drafts where submission_id=p_submission_id for update;
 if d.submission_id is null or d.version is distinct from p_expected_version then raise exception '최신 피드백을 저장한 뒤 공개해 주세요.' using errcode='40001';end if;
 if d.version=d.published_version then select * into p from public.kmove_review_publications where submission_id=p_submission_id and version=d.version;return to_jsonb(p);end if;
 if exists(select 1 from jsonb_array_elements(d.pins) pin where length(regexp_replace(coalesce(pin->>'content',''),'[[:space:]]','','g'))=0) then raise exception '내용이 비어 있는 위치 메모를 작성하거나 삭제해 주세요.';end if;
 if length(regexp_replace(d.strengths||d.improvements||d.next_steps,'[[:space:]]','','g'))=0 and jsonb_array_length(d.pins)=0 and not exists(select 1 from jsonb_each_text(d.asset_comments) c where length(regexp_replace(c.value,'[[:space:]]','','g'))>0) then raise exception '학생에게 전달할 피드백을 작성해 주세요.';end if;
 insert into public.kmove_review_publications(submission_id,strengths,improvements,next_steps,decision,pins,asset_comments,version,published_by)
 values(d.submission_id,d.strengths,d.improvements,d.next_steps,d.decision,d.pins,d.asset_comments,d.version,auth.uid()) returning * into p;
 update public.kmove_review_drafts set published_version=version where submission_id=p_submission_id;
 insert into public.kmove_operation_log(actor_id,action,target_id,details) values(auth.uid(),'feedback.published',p.id::text,jsonb_build_object('submission_id',p_submission_id,'version',d.version));
 return to_jsonb(p);
end $$;

commit;
