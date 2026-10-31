import { useEffect, useState, type MouseEvent } from "react";
import { ImagePlus, Trash2 } from "lucide-react";
import { getSupabase } from "@/lib/supabase";
import { FeedbackAttachments } from "@/components/FeedbackAttachments";
import { FEEDBACK_IMAGE_BUCKET as BUCKET } from "@/lib/feedback-attachments";

type ImageRow = { id:string; student_id:string; week:number; object_path:string; created_by:string; created_at:string };
type Pin = { id:string; image_id:string; x:number; y:number; content:string; created_at:string };
type Draft = { imageId:string; x:number; y:number } | null;
type Props = { studentId:string; studentName:string; week:number; userId:string; instructor:boolean };

const errText = (e:unknown) => e instanceof Error ? e.message : String(e);

export function FeedbackWorkspace(props:Props) {
  return <FeedbackWorkspaceContent key={`${props.studentId}:${props.week}:${props.userId}:${props.instructor}`} {...props} />;
}

function FeedbackWorkspaceContent({studentId,studentName,week,userId,instructor}:Props) {
  const [images,setImages] = useState<ImageRow[]>([]);
  const [pins,setPins] = useState<Pin[]>([]);
  const [urls,setUrls] = useState<Record<string,string>>({});
  const [draft,setDraft] = useState<Draft>(null);
  const [note,setNote] = useState("");
  const [editing,setEditing] = useState<string | null>(null);
  const [editingText,setEditingText] = useState("");
  const [revision,setRevision] = useState(0);
  const [loading,setLoading] = useState(true);
  const [busy,setBusy] = useState(false);
  const [uploading,setUploading] = useState(false);
  const [error,setError] = useState("");
  const isBusy = busy || uploading;
  const reload = () => setRevision(n => n+1);

  useEffect(() => {
    let active = true;
    setLoading(true); setDraft(null); setNote(""); setError("");
    setImages([]); setPins([]); setUrls({});
    (async () => {
      try {
        const db = getSupabase();
        const im = await db.from("kmove_feedback_images")
          .select("id,student_id,week,object_path,created_by,created_at")
          .eq("student_id",studentId).eq("week",week)
          .order("created_at",{ascending:true});
        if(im.error) throw im.error;
        const rows = (im.data || []) as ImageRow[];
        const pinResult = rows.length
          ? await db.from("kmove_feedback_pins").select("id,image_id,x,y,content,created_at")
            .in("image_id",rows.map(row=>row.id)).order("created_at",{ascending:true})
          : {data:[],error:null};
        if(pinResult.error) throw pinResult.error;
        const signed = await Promise.all(rows.map(async row => {
          const result = await db.storage.from(BUCKET).createSignedUrl(row.object_path,3600);
          if(result.error) throw result.error;
          return [row.id,result.data.signedUrl] as const;
        }));
        if(active) {
          setImages(rows); setPins((pinResult.data||[]) as Pin[]);
          setUrls(Object.fromEntries(signed));
        }
      } catch(e) { if(active) setError("자료를 불러오지 못했습니다: "+errText(e)); }
      finally { if(active) setLoading(false); }
    })();
    return () => { active=false; };
  },[studentId,week,revision]);

  function place(e:MouseEvent<HTMLImageElement>,imageId:string) {
    if(!instructor || isBusy) return;
    const rect=e.currentTarget.getBoundingClientRect();
    const x=Math.max(0,Math.min(100,(e.clientX-rect.left)/rect.width*100));
    const y=Math.max(0,Math.min(100,(e.clientY-rect.top)/rect.height*100));
    setDraft({imageId,x:Number(x.toFixed(3)),y:Number(y.toFixed(3))});setNote("");
  }

  async function insertPin() {
    if(!instructor || !draft || !note.trim() || isBusy) return;
    setBusy(true);setError("");
    try {
      const result=await getSupabase().from("kmove_feedback_pins").insert({
        image_id:draft.imageId,x:draft.x,y:draft.y,
        content:note.trim(),created_by:userId
      });
      if(result.error) throw result.error;
      setDraft(null);setNote("");reload();
    } catch(e) {setError("저장 실패: "+errText(e));}
    finally {setBusy(false);}
  }

  async function saveEdit(id:string) {
    if(!instructor || !editingText.trim() || isBusy) return;
    setBusy(true);setError("");
    try {
      const result=await getSupabase().from("kmove_feedback_pins")
        .update({content:editingText.trim()}).eq("id",id);
      if(result.error) throw result.error;
      setEditing(null);reload();
    } catch(e) {setError("수정 실패: "+errText(e));}
    finally {setBusy(false);}
  }

  async function removePin(id:string) {
    if(!instructor || isBusy || !window.confirm("피드백을 삭제할까요?")) return;
    setBusy(true);setError("");
    try {
      const result=await getSupabase().from("kmove_feedback_pins").delete().eq("id",id);
      if(result.error) throw result.error;
      reload();
    } catch(e) {setError("삭제 실패: "+errText(e));}
    finally {setBusy(false);}
  }

  async function removeImage(image:ImageRow) {
    if((!instructor && image.created_by!==userId) || isBusy) return;
    if(!window.confirm("이 이미지를 삭제하면 연결된 피드백도 함께 삭제됩니다. 삭제할까요?")) return;
    setBusy(true);setError("");
    try {
      const db=getSupabase();
      const deleted=await db.from("kmove_feedback_images")
        .delete().eq("id",image.id).select("id");
      if(deleted.error) throw deleted.error;
      if(deleted.data?.length!==1) throw new Error("이미지가 이미 삭제되었거나 삭제 권한이 없습니다.");

      const removed=await db.storage.from(BUCKET).remove([image.object_path]);
      setImages(previous=>previous.filter(item=>item.id!==image.id));
      setPins(previous=>previous.filter(pin=>pin.image_id!==image.id));
      setUrls(previous=>{
        const updated={...previous};
        delete updated[image.id];
        return updated;
      });
      setDraft(previous=>previous?.imageId===image.id?null:previous);
      if(removed.error) {
        setError("이미지 목록은 삭제됐지만 저장소 파일 정리에 실패했습니다. 관리자에게 문의해 주세요: "+removed.error.message);
      }
    } catch(e) {setError("이미지 삭제 실패: "+errText(e));}
    finally {setBusy(false);}
  }

  return (
    <div className="space-y-8 pb-14">
      <FeedbackAttachments studentId={studentId} week={week} userId={userId} instructor={instructor}
        onImagesUploaded={reload} uploadDisabled={busy} onUploadBusyChange={setUploading}
      />
      <div>
        <h4 className="text-sm font-semibold">이미지 피드백</h4>
        <p className="mt-1 text-xs text-neutral-500">{instructor?"이미지의 원하는 위치를 클릭해 피드백을 작성하세요.":"업로드한 이미지에서 강사의 위치별 피드백을 확인하세요."}</p>
      </div>
      {error && <p role="alert" className="border border-red-400 p-3 text-sm text-red-700">{error}</p>}
      {loading && <p className="text-sm text-neutral-500">불러오는 중…</p>}
      {!loading && images.length===0 && !error && (
        <div className="flex min-h-24 flex-col items-center justify-center border border-dashed border-neutral-300 py-5">
          <ImagePlus className="mb-2 size-5 text-neutral-400" aria-hidden="true"/>
          <p className="text-sm text-neutral-500">업로드한 이미지가 없습니다.</p>
          <p className="mt-1 text-xs text-neutral-400">위의 ‘과제 업로드’에서 이미지를 선택해 주세요.</p>
        </div>
      )}
      {images.map((image,index)=>{
        const notes=pins.filter(pin=>pin.image_id===image.id);
        const current=draft?.imageId===image.id?draft:null;
        return (
          <section key={image.id} className="border-b border-neutral-200 pb-10">
            <div className="mb-4 flex items-center justify-start gap-3">
              <h4 className="shrink-0 text-xs font-bold tracking-widest">IMAGE {String(index+1).padStart(2,"0")}</h4>
              {(instructor || image.created_by===userId) && (
                <button type="button" disabled={isBusy} onClick={()=>void removeImage(image)}
                  aria-label={studentName+" "+week+"주차 "+(index+1)+"번째 이미지 삭제"}
                  className="flex min-h-10 items-center gap-1 text-xs text-neutral-500 hover:text-red-700 disabled:opacity-50">
                  <Trash2 className="size-3.5" aria-hidden="true"/> 이미지 삭제
                </button>
              )}
            </div>
            <div className="grid items-start gap-5 lg:grid-cols-[minmax(0,1.3fr)_minmax(185px,1fr)]">
              <div className="min-w-0">
                <div className="relative border border-neutral-200 bg-neutral-100">
                  {urls[image.id] ? (
                    <>
                      <img src={urls[image.id]}
                        alt={studentName+" "+week+"주차 이미지 "+(index+1)}
                        onClick={e=>place(e,image.id)}
                        className={"block h-auto w-full "+(instructor?"cursor-crosshair":"")}/>
                      {notes.map((pin,n)=>(
                        <span key={pin.id} aria-label={"피드백 위치 "+(n+1)}
                          style={{left:pin.x+"%",top:pin.y+"%"}}
                          className="pointer-events-none absolute grid size-6 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full border-2 border-white bg-black text-xs font-bold text-white shadow">{n+1}</span>
                      ))}
                      {current && <span style={{left:current.x+"%",top:current.y+"%"}}
                        className="pointer-events-none absolute grid size-6 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full border-2 border-black bg-yellow-300 text-xs font-bold">+</span>}
                    </>
                  ) : <p className="p-3 text-xs text-neutral-500">이미지 URL을 가져올 수 없습니다.</p>}
                </div>
              </div>
              <div className="min-w-0 space-y-4">
                {notes.map((pin,n)=>(
                  <article key={pin.id} className="border-b border-neutral-200 pb-4">
                    <div className="mb-2 flex items-center gap-2">
                      <span className="grid size-6 place-items-center rounded-full bg-black text-xs text-white">{n+1}</span>
                      <strong className="flex-1 text-xs">피드백 {String(n+1).padStart(2,"0")}</strong>
                      {instructor && <button type="button" className="text-xs underline" onClick={()=>{setEditing(pin.id);setEditingText(pin.content);}}>수정</button>}
                      {instructor && <button type="button" className="text-xs underline" onClick={()=>void removePin(pin.id)}>삭제</button>}
                    </div>
                    {editing===pin.id ? (
                      <div className="space-y-2">
                        <textarea value={editingText} maxLength={3000} rows={3}
                          aria-label="피드백 수정" onChange={e=>setEditingText(e.target.value)}
                          className="w-full border border-neutral-400 p-2 text-sm"/>
                        <div className="flex gap-3 text-xs">
                          <button type="button" disabled={isBusy||!editingText.trim()} onClick={()=>void saveEdit(pin.id)}>저장</button>
                          <button type="button" onClick={()=>setEditing(null)}>취소</button>
                        </div>
                      </div>
                    ) : <p className="whitespace-pre-wrap break-words text-sm leading-6">{pin.content}</p>}
                  </article>
                ))}
                {current && instructor && (
                  <div className="space-y-3 border-2 border-black p-3">
                    <p className="text-xs font-semibold">선택한 위치에 피드백 작성</p>
                    <textarea rows={4} maxLength={3000} value={note} onChange={e=>setNote(e.target.value)}
                      aria-label="새 피드백" placeholder="수정할 부분과 개선 방향을 작성하세요."
                      className="w-full border border-neutral-300 p-2 text-sm"/>
                    <div className="flex gap-2 text-xs">
                      <button type="button" disabled={isBusy||!note.trim()} onClick={()=>void insertPin()}
                        className="min-h-9 bg-black px-3 text-white disabled:opacity-40">저장</button>
                      <button type="button" onClick={()=>setDraft(null)} className="min-h-9 border px-3">취소</button>
                    </div>
                  </div>
                )}
                {notes.length===0 && !current && <p className="text-xs text-neutral-400">등록된 위치별 피드백이 없습니다.</p>}
              </div>
            </div>
          </section>
        );
      })}
    </div>
  );
}
