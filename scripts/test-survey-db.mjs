import {readFile,readdir} from 'node:fs/promises';
import assert from 'node:assert/strict';
import {randomUUID} from 'node:crypto';
const {PGlite} = await import(process.env.PGLITE_MODULE_PATH || '@electric-sql/pglite');
const db=new PGlite();
const schema=JSON.parse(await readFile('src/data/survey-schema.json','utf8'));
const valid={name:'테스트 수강생',aiExperience:'basic',aiServices:['chatgpt_free'],designSkills:Object.fromEntries(schema.questions.find(q=>q.id==='designSkills').rows.map(r=>[r.id,'guided'])),portfolio:'works',interests:['graphic'],goals:['prompt','image'],message:''};
const student=randomUUID(), other=randomUUID(), teacher=randomUUID();
let checks=0;
const pass=()=>checks++;
async function denied(fn,pattern){await assert.rejects(fn,pattern);pass();}
async function as(id){await db.exec('reset role');await db.query("select set_config('request.jwt.claim.sub',$1,false)",[id]);await db.exec('set role authenticated');}
const insert=(id,answers=valid)=>db.query('insert into public.kmove_survey_responses(user_id,answers) values($1,$2)',[id,JSON.stringify(answers)]);
try {
 await db.exec(`create role anon; create role authenticated; create role service_role bypassrls;
 create schema auth;
 create table auth.users(id uuid primary key,email text,raw_user_meta_data jsonb);
 create function auth.uid() returns uuid language sql stable as $$select nullif(current_setting('request.jwt.claim.sub',true),'')::uuid$$;
 grant usage on schema auth to authenticated; grant execute on function auth.uid() to authenticated;`);
 await db.exec(await readFile('docs/supabase-setup.sql','utf8'));
 const migration=(await readdir('supabase/migrations')).find(p=>p.endsWith('_kmove_ot_survey.sql'));
 await db.exec(await readFile(`supabase/migrations/${migration}`,'utf8'));pass();
 for(const [id,name] of [[student,'테스트가'],[other,'테스트나'],[teacher,'테스트강사']])await db.query('insert into auth.users values($1,$2,$3)',[id,id+'@example.test',JSON.stringify({username:name,role:'instructor'})]);
 const p=await db.query('select role from kmove_profiles where id=$1',[student]);assert.equal(p.rows[0].role,'student');pass();
 await db.query("update kmove_profiles set role='instructor' where id=$1",[teacher]);
 await db.exec('set role anon');await denied(()=>db.query('select * from kmove_survey_responses'),/permission denied/);
 await as(student);await insert(student);pass();
 await denied(()=>insert(other),/row-level security/);
 await denied(()=>db.query("update kmove_profiles set role='instructor' where id=$1",[student]),/permission denied/);
 const first=(await db.query('select * from kmove_survey_responses')).rows;assert.equal(first.length,1);pass();
 await db.query('insert into kmove_survey_responses(survey_id,user_id,schema_version,answers) values($1,$2,2,$3) on conflict(survey_id,user_id) do update set answers=excluded.answers,schema_version=excluded.schema_version,user_id=excluded.user_id,survey_id=excluded.survey_id returning *',[schema.id,student,JSON.stringify({...valid,message:'수정 내용'})]);
 const updated=(await db.query('select * from kmove_survey_responses')).rows;assert.equal(updated.length,1);assert.equal(updated[0].submitted_at.getTime(),first[0].submitted_at.getTime());assert.equal(updated[0].answers.message,'수정 내용');pass();
 await denied(()=>db.query("update kmove_survey_responses set submitted_at='2000-01-01'"),/permission denied/);
 await denied(()=>db.query('update kmove_survey_responses set user_id=$1',[other]),/Response owner cannot change|row-level security/);
 for(const invalid of [{...valid,name:''},{...valid,goals:['prompt','image','visual']},{...valid,goals:['prompt','prompt']},{...valid,aiServices:['none','chatgpt_free']},{...valid,aiServices:['unknown']},{...valid,aiExperience:null},{...valid,designSkills:{figma:'guided'}},{...valid,goals:['other'],goalsOther:''},{...valid,message:'x'.repeat(1001)},{...valid,role:'instructor'}])await denied(()=>db.query('update kmove_survey_responses set answers=$1',[JSON.stringify(invalid)]),/check constraint/);
 await as(other);assert.equal((await db.query('select * from kmove_survey_responses')).rows.length,0);pass();
 assert.equal((await db.query('update kmove_survey_responses set answers=$1 where user_id=$2 returning *',[JSON.stringify(valid),student])).rows.length,0);pass();
 await insert(other);pass();
 await as(teacher);assert.equal((await db.query('select * from kmove_survey_responses')).rows.length,2);assert.equal((await db.query('select * from kmove_profiles')).rows.length,3);pass();
 assert.equal((await db.query('update kmove_survey_responses set answers=$1 where user_id=$2 returning *',[JSON.stringify(valid),student])).rows.length,0);pass();
 await denied(()=>db.query('delete from kmove_survey_responses'),/permission denied/);
 console.log(`${checks} database checks passed: migration, validation, upsert, timestamps, student isolation, instructor reads, role protection.`);
} finally {await db.close();}
