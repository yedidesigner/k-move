import { getSupabase } from "./supabase";

export type AssignmentStatus = "draft" | "published" | "archived";
export type ReviewDecision = "changes_requested" | "accepted";
export type ContentKind = "session" | "announcement" | "glossary" | "guide" | "path";
export type PortfolioStage = "planning" | "structure" | "visual" | "prototype" | "case-study" | "ready";
export interface Enrollment { user_id:string; student_id:string; name:string; status:"active"|"completed"; joined_at:string; updated_at:string }
export interface Assignment { id:string; session_number:number; title:string; description:string; requirements:string; opens_at:string|null; due_at:string|null; status:AssignmentStatus; allow_resubmit:boolean; version:number; created_at:string; updated_at:string }
export interface AssignmentTarget { assignment_id:string; user_id:string; exempt:boolean; due_at:string|null; created_at:string }
export interface SubmissionDraft { assignment_id:string; user_id:string; note:string; image_ids:string[]; attachment_ids:string[]; version:number; updated_at:string }
export interface Submission { id:string; assignment_id:string; user_id:string; student_id:string; version:number; note:string; submitted_at:string; late:boolean }
export interface SubmissionAsset { id:string; submission_id:string; image_id:string|null; attachment_id:string|null }
export interface ReviewPin { id:string; image_id:string; x:number; y:number; content:string }
export interface ReviewFields { strengths:string; improvements:string; next_steps:string; decision:ReviewDecision; pins:ReviewPin[]; asset_comments:Record<string,string>; private_note:string }
export interface ReviewDraft extends ReviewFields { submission_id:string; version:number; published_version:number; updated_at:string; updated_by:string }
export interface ReviewPublication extends Omit<ReviewFields,"private_note"> { id:string; submission_id:string; version:number; published_at:string; published_by:string }
export interface FeedbackRead { publication_id:string; user_id:string; read_at:string }
export interface ContentDraft { kind:ContentKind; content_key:string; document:Record<string,unknown>; hidden:boolean; version:number; published_version:number; updated_at:string; updated_by:string }
export interface ContentPublication { id:string; kind:ContentKind; content_key:string; document:Record<string,unknown>; hidden:boolean; version:number; published_at:string; created_at:string; created_by:string; cancelled_at:string|null }
export interface PortfolioVersion { id:string; user_id:string; project_key:string; title:string; target_role:string; next_goal:string; label:string; stage:PortfolioStage; url:string; notes:string; version:number; created_at:string; created_by:string }
export interface OperationLog { id:string; actor_id:string; action:string; target_id:string; details:Record<string,unknown>; created_at:string }
export interface StudentNote { user_id:string; content:string; version:number; updated_at:string; updated_by:string }
export interface AssignmentInput { id?:string; session_number:number; title:string; description:string; requirements:string; opens_at:string|null; due_at:string|null; status:AssignmentStatus; allow_resubmit:boolean; target_user_ids:string[] }
export interface SubmissionDraftInput { note:string; image_ids:string[]; attachment_ids:string[] }
export interface PortfolioInput { user_id:string; project_key:string; title:string; target_role:string; next_goal:string; label:string; stage:PortfolioStage; url:string; notes:string }

function fail(error: {message:string;code?:string}|null) { if(error) throw new Error(error.message); }
const READ_KEYS:Record<string,string[]>={kmove_enrollments:["user_id"],kmove_assignment_targets:["assignment_id","user_id"],kmove_submission_drafts:["assignment_id","user_id"],kmove_review_drafts:["submission_id"],kmove_feedback_reads:["publication_id","user_id"],kmove_content_drafts:["kind","content_key"],kmove_student_notes:["user_id"]};
async function rows<T>(table:string, order:string,filter?:{column:string;value:string}):Promise<T[]> {
  const collected:T[]=[];const pageSize=500;
  for(let offset=0;;offset+=pageSize){
    let query=getSupabase().from(table).select("*").order(order);
    for(const key of READ_KEYS[table]??["id"])if(key!==order)query=query.order(key);
    if(filter)query=query.eq(filter.column,filter.value);
    const {data,error}=await query.range(offset,offset+pageSize-1);fail(error);
    const page=(data??[]) as T[];collected.push(...page);if(page.length<pageSize)return collected;
  }
}
async function call<T>(name:string,params:Record<string,unknown>):Promise<T> { const {data,error}=await getSupabase().rpc(name,params);fail(error);return data as T; }
export const listEnrollments=()=>rows<Enrollment>("kmove_enrollments","name");
export const listAssignments=()=>rows<Assignment>("kmove_assignments","session_number");
export const listAssignmentTargets=()=>rows<AssignmentTarget>("kmove_assignment_targets","created_at");
export const listSubmissionDrafts=()=>rows<SubmissionDraft>("kmove_submission_drafts","updated_at");
export const listSubmissions=()=>rows<Submission>("kmove_submissions","submitted_at");
export const listSubmissionAssets=()=>rows<SubmissionAsset>("kmove_submission_assets","id");
export const listReviewDrafts=()=>rows<ReviewDraft>("kmove_review_drafts","updated_at");
export const listReviewPublications=()=>rows<ReviewPublication>("kmove_review_publications","published_at");
export const listFeedbackReads=()=>rows<FeedbackRead>("kmove_feedback_reads","read_at");
export const listContentDrafts=()=>rows<ContentDraft>("kmove_content_drafts","updated_at");
export const listContentPublications=(kind?:ContentKind)=>rows<ContentPublication>("kmove_content_publications","published_at",kind?{column:"kind",value:kind}:undefined);
export const listPortfolioVersions=()=>rows<PortfolioVersion>("kmove_portfolio_versions","created_at");
export const listStudentNotes=()=>rows<StudentNote>("kmove_student_notes","updated_at");
export function latestPublications(items:ContentPublication[],now:Date=new Date()):ContentPublication[] { const map=new Map<string,ContentPublication>();for(const item of items){if(item.cancelled_at||new Date(item.published_at)>now)continue;const key=`${item.kind}:${item.content_key}`;const previous=map.get(key);if(!previous||item.version>previous.version||(item.version===previous.version&&item.published_at>previous.published_at))map.set(key,item);}return [...map.values()]; }
export const saveAssignment=(input:AssignmentInput,expectedVersion=0)=>call<Assignment>("kmove_save_assignment",{p_payload:input,p_expected_version:expectedVersion});
export const saveAssignmentTarget=(assignmentId:string,userId:string,payload:{exempt:boolean;due_at:string|null})=>call<AssignmentTarget>("kmove_save_assignment_target",{p_assignment_id:assignmentId,p_user_id:userId,p_payload:payload});
export const saveSubmissionDraft=(assignmentId:string,payload:SubmissionDraftInput,expectedVersion:number)=>call<SubmissionDraft>("kmove_save_submission_draft",{p_assignment_id:assignmentId,p_payload:payload,p_expected_version:expectedVersion});
export const submitAssignment=(assignmentId:string,expectedDraftVersion:number)=>call<Submission>("kmove_submit_assignment",{p_assignment_id:assignmentId,p_expected_version:expectedDraftVersion});
export const saveReviewDraft=(submissionId:string,payload:ReviewFields,expectedVersion:number)=>call<ReviewDraft>("kmove_save_review_draft",{p_submission_id:submissionId,p_payload:payload,p_expected_version:expectedVersion});
export const publishReview=(submissionId:string,expectedVersion:number)=>call<ReviewPublication>("kmove_publish_review",{p_submission_id:submissionId,p_expected_version:expectedVersion});
export async function markFeedbackRead(publicationId:string):Promise<void>{await call("kmove_mark_feedback_read",{p_publication_id:publicationId});}
export const saveContentDraft=(kind:ContentKind,key:string,payload:{document:Record<string,unknown>;hidden:boolean},expectedVersion:number)=>call<ContentDraft>("kmove_save_content_draft",{p_kind:kind,p_key:key,p_payload:payload,p_expected_version:expectedVersion});
export const publishContent=(kind:ContentKind,key:string,expectedVersion:number,publishAt:string|null=null)=>call<ContentPublication>("kmove_publish_content",{p_kind:kind,p_key:key,p_expected_version:expectedVersion,p_publish_at:publishAt});
export const saveEnrollment=(userId:string,payload:{status:"active"|"completed"})=>call<Enrollment>("kmove_save_enrollment",{p_user_id:userId,p_status:payload.status});
export const enrollStudent=(userId:string)=>call<Enrollment>("kmove_enroll_student",{p_user_id:userId});
export const saveStudentNote=(userId:string,content:string,expectedVersion:number)=>call<StudentNote>("kmove_save_student_note",{p_user_id:userId,p_content:content,p_expected_version:expectedVersion});
export const appendPortfolioVersion=(payload:PortfolioInput)=>call<PortfolioVersion>("kmove_append_portfolio_version",{p_payload:payload});

export const listOperationLog=()=>rows<OperationLog>("kmove_operation_log","created_at");
export const relinkStudentAccount=(studentId:string,newUserId:string)=>call<Enrollment>("kmove_relink_student_account",{p_student_id:studentId,p_new_user_id:newUserId});

export async function cancelContentSchedule(publicationId:string):Promise<void>{await call("kmove_cancel_content_schedule",{p_publication_id:publicationId});}
