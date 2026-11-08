(function(){
"use strict";
const byId=(id)=>document.getElementById(id);
const KEY="abu_alfaisal_operations_v1";
const SCHEMA="abu-alfaisal-operations-v1";
const COMPLETE=["مكتمل","ملغي"];
const VALID_SERVICES=["تذاكر الطيران","التأشيرات","العمرة","الفنادق","الموافقات الأمنية","المتابعات","خدمة أخرى"];
const VALID_STATUS=["جديد","قيد المراجعة","بانتظار العميل","بانتظار مزود الخدمة","مكتمل","ملغي"];
let records=[],selectedId=null,attachment=null,toastTimer=null,messageEdited=false;
const safe=(v)=>String(v??"").replace(/[&<>"']/g,(c)=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
const cut=(v,n=30000)=>String(v??"").slice(0,n);
const active=(r)=>!COMPLETE.includes(r.status);
function toast(message){const el=byId("toast");el.textContent=message;el.hidden=false;clearTimeout(toastTimer);toastTimer=setTimeout(()=>{el.hidden=true},3700);}
function nowLocalDate(){const d=new Date();return [d.getFullYear(),String(d.getMonth()+1).padStart(2,"0"),String(d.getDate()).padStart(2,"0")].join("-");}
function dueTime(r){const v=r.followUp||"";if(!v)return null;const d=new Date(v);return Number.isNaN(d.getTime())?null:d;}
function isLate(r){const d=dueTime(r);return Boolean(active(r)&&d&&d.getTime()<Date.now());}
function isToday(r){return active(r)&&Boolean(r.followUp)&&r.followUp.slice(0,10)===nowLocalDate();}
function showDate(v){if(!v)return "غير محدد";const d=new Date(v);return Number.isNaN(d.getTime())?"غير محدد":new Intl.DateTimeFormat("ar-YE",{day:"numeric",month:"short",year:"numeric",hour:"2-digit",minute:"2-digit"}).format(d);}
function newId(){return "AF-"+Date.now().toString(36).toUpperCase()+"-"+Math.random().toString(36).slice(2,7).toUpperCase();}
function validateRecord(x){
 if(!x||typeof x!=="object"||Array.isArray(x))return null;
 const o={
  id:cut(x.id||newId(),70),clientName:cut(x.clientName,120),clientPhone:cut(x.clientPhone,25),
  service:VALID_SERVICES.includes(x.service)?x.service:"خدمة أخرى",
  status:VALID_STATUS.includes(x.status)?x.status:"جديد",
  owner:cut(x.owner,90),followUp:cut(x.followUp,25),subject:cut(x.subject,160),
  travelDetails:cut(x.travelDetails,30000),notes:cut(x.notes,20000),
  createdAt:cut(x.createdAt||new Date().toISOString(),45),
  updatedAt:cut(x.updatedAt||new Date().toISOString(),45),attachment:null
 };
 if(x.attachment&&typeof x.attachment==="object"){
  const a=x.attachment;
  if(typeof a.data==="string"&&a.data.length<1100000&&/^data:(application\/pdf|image\/png|image\/jpeg|image\/webp);base64,/i.test(a.data)){
   o.attachment={name:cut(a.name,150),type:cut(a.type,80),size:Number(a.size)||0,data:a.data};
  }
 }
 return o;
}
function load(){
 try{const raw=JSON.parse(localStorage.getItem(KEY)||"[]");records=Array.isArray(raw)?raw.map(validateRecord).filter(Boolean):[];}
 catch(e){records=[];toast("تعذر قراءة البيانات المحلية؛ لم تُحذف أي بيانات محفوظة.");}
}
function saveAll(next){
 try{localStorage.setItem(KEY,JSON.stringify(next));records=next;return true;}
 catch(e){toast("فشل الحفظ: قد تكون مساحة المتصفح ممتلئة. صدّر نسخة JSON ثم قلّل المرفقات.");return false;}
}
function gather(){
 return {id:byId("recordId").value||newId(),clientName:byId("clientName").value.trim(),
 clientPhone:byId("clientPhone").value.trim(),service:byId("service").value,
 status:byId("status").value,owner:byId("owner").value.trim(),followUp:byId("followUp").value,
 subject:byId("subject").value.trim(),travelDetails:byId("travelDetails").value.trim(),
 notes:byId("notes").value.trim(),attachment:attachment?{...attachment}:null};
}
function renderAttachment(){
 const info=byId("attachmentInfo"),rem=byId("removeAttachment");
 if(!attachment){info.textContent="TXT وCSV وJSON لقراءة النص، أو PDF وصور كمرفقات محلية (حتى 700 كيلوبايت).";rem.hidden=true;return;}
 info.textContent="المرفق المحلي: "+attachment.name+" ("+Math.ceil(attachment.size/1024)+" كيلوبايت). يُضمّن في نسخة JSON.";
 rem.hidden=false;
}
function resetForm(){
 byId("requestForm").reset();byId("recordId").value="";byId("status").value="جديد";
 selectedId=null;attachment=null;renderAttachment();
 byId("formHeading").textContent="إضافة طلب جديد";
 byId("duplicateRequest").hidden=true;byId("deleteRequest").hidden=true;
 byId("saveRequest").textContent="حفظ الطلب محليًا";
 updateMessage(true);renderList();
}
function selectRecord(id,scroll=true){
 const r=records.find((v)=>v.id===id);if(!r){toast("لم يتم العثور على الطلب.");return;}
 selectedId=id;
 for(const key of ["recordId","clientName","clientPhone","service","status","owner","followUp","subject","travelDetails","notes"]){
  const dataKey=key==="recordId"?"id":key;byId(key).value=r[dataKey]||"";
 }
 attachment=r.attachment?{...r.attachment}:null;renderAttachment();
 byId("formHeading").textContent="تعديل طلب محفوظ";
 byId("duplicateRequest").hidden=false;byId("deleteRequest").hidden=false;
 byId("saveRequest").textContent="حفظ التعديلات";updateMessage(true);renderList();
 if(scroll&&window.matchMedia("(max-width:860px)").matches){byId("editorAnchor").scrollIntoView({behavior:"smooth",block:"start"});}
}
function renderStats(){
 const late=records.filter(isLate),today=records.filter(isToday);
 byId("statAll").textContent=String(records.length);
 byId("statActive").textContent=String(records.filter(active).length);
 byId("statLate").textContent=String(late.length);
 byId("statToday").textContent=String(today.length);
 const alerts=byId("lateAlerts");alerts.replaceChildren();alerts.hidden=late.length===0;
 if(late.length){
  const title=document.createElement("b");title.textContent="تنبيه: "+late.length+" طلب/طلبات تجاوزت موعد المتابعة";alerts.appendChild(title);
  late.slice(0,5).forEach((r)=>{
   const b=document.createElement("button");b.type="button";b.className="alert-item text-btn";
   b.textContent=r.clientName+" · "+showDate(r.followUp)+" · "+(r.owner||"بدون مسؤول");
   b.addEventListener("click",()=>selectRecord(r.id));alerts.appendChild(b);
  });
  if(late.length>5){const tip=document.createElement("span");tip.textContent=" — استخدم تصفية «المتأخرة» لعرض البقية.";alerts.appendChild(tip);}
 }
}
function matchesDue(r,filter){
 if(!filter)return true;
 if(filter==="late")return isLate(r);
 if(filter==="today")return isToday(r);
 if(filter==="none")return !r.followUp;
 if(filter==="upcoming"){const d=dueTime(r);return Boolean(active(r)&&d&&d.getTime()>=Date.now());}
 return true;
}
function renderList(){
 const search=byId("search").value.trim().toLowerCase(),svc=byId("serviceFilter").value,
 status=byId("statusFilter").value,owner=byId("ownerFilter").value.trim().toLowerCase(),due=byId("dueFilter").value;
 const list=records.filter((r)=>{
  if(svc&&r.service!==svc)return false;if(status&&r.status!==status)return false;
  if(owner&&!r.owner.toLowerCase().includes(owner))return false;if(!matchesDue(r,due))return false;
  if(search&&!([r.clientName,r.clientPhone,r.id,r.service,r.status,r.subject,r.owner,r.travelDetails,r.notes].join(" ").toLowerCase().includes(search)))return false;
  return true;
 }).sort((a,b)=>{const la=Number(isLate(a)),lb=Number(isLate(b));if(la!==lb)return lb-la;return (b.updatedAt||"").localeCompare(a.updatedAt||"");});
 byId("resultCount").textContent=list.length+" من "+records.length+" طلب";
 const el=byId("requestList");el.replaceChildren();
 if(!list.length){
  const box=document.createElement("div");box.className="empty";
  box.innerHTML=records.length?"<b>لا توجد طلبات مطابقة</b><p>غيّر معايير البحث أو ألغِ التصفية.</p>":"<b>لا توجد طلبات بعد</b><p>ابدأ بإضافة أول طلب للعميل، وستظهر هنا المتابعات والمواعيد.</p>";
  el.appendChild(box);return;
 }
 list.forEach((r)=>{
  const item=document.createElement("article");item.className="request-card"+(r.id===selectedId?" selected":"");
  const late=isLate(r);
  item.innerHTML='<div class="req-header"><div><h3 class="req-heading">'+safe(r.clientName)+'</h3><p class="req-subject">'+safe(r.subject||r.service)+'</p></div><span class="status" data-state="'+safe(r.status)+'">'+safe(r.status)+'</span></div>'+
  '<div class="badges"><span class="status">'+safe(r.service)+'</span>'+(late?'<span class="status late">متأخر</span>':"")+'</div>'+
  '<div class="req-meta"><span>المسؤول: '+safe(r.owner||"غير معيّن")+'</span><span>المتابعة: '+safe(showDate(r.followUp))+'</span></div>'+
  '<div class="req-bottom"><small class="req-code">'+safe(r.id)+'</small><button class="btn light small" type="button">فتح الطلب</button></div>';
  item.querySelector("button").addEventListener("click",()=>selectRecord(r.id));
  el.appendChild(item);
 });
}
function render(){renderStats();renderList();}
function addOrUpdate(evt){
 evt.preventDefault();const item=gather();
 if(!item.clientName||!item.service){toast("اسم العميل ونوع الخدمة مطلوبان.");return;}
 const prior=records.find((r)=>r.id===item.id);
 const stamp=new Date().toISOString();
 const next=validateRecord({...item,createdAt:prior?prior.createdAt:stamp,updatedAt:stamp});
 if(!next){toast("تعذر التحقق من بيانات الطلب.");return;}
 const draft=records.filter((r)=>r.id!==next.id);draft.unshift(next);
 if(!saveAll(draft))return;
 selectedId=next.id;byId("recordId").value=next.id;
 byId("formHeading").textContent="تعديل طلب محفوظ";
 byId("duplicateRequest").hidden=false;byId("deleteRequest").hidden=false;
 byId("saveRequest").textContent="حفظ التعديلات";
 render();toast(prior?"تم حفظ التعديلات محليًا.":"تم إنشاء الطلب وحفظه محليًا.");
}
function deleteCurrent(){
 if(!selectedId)return;const r=records.find((x)=>x.id===selectedId);
 if(!r||!confirm("هل تريد حذف طلب «"+r.clientName+"» من هذا الجهاز؟"))return;
 if(saveAll(records.filter((x)=>x.id!==selectedId))){resetForm();render();toast("تم حذف الطلب من هذا الجهاز.");}
}
function download(text,type,filename){
 const blob=new Blob([text],{type});const url=URL.createObjectURL(blob);
 const a=document.createElement("a");a.href=url;a.download=filename;document.body.appendChild(a);a.click();a.remove();
 setTimeout(()=>URL.revokeObjectURL(url),1200);
}
function exportData(kind){
 const day=nowLocalDate();
 if(kind==="json"){
  download(JSON.stringify({schema:SCHEMA,exportedAt:new Date().toISOString(),records},null,2),"application/json;charset=utf-8","abu-alfaisal-operations-"+day+".json");
  toast("تم تجهيز ملف JSON. يحتوي على بيانات العملاء والمرفقات فاحفظه في مكان آمن.");return;
 }
 const text=["لوحة تشغيل أبو الفيصل للسفريات والسياحة","تصدير محلي بتاريخ: "+new Date().toLocaleString("ar-YE"),"عدد الطلبات: "+records.length,""].concat(
 records.map((r,i)=>[
 "━━━━━━━━━━━━━━━━━━━━━━━━━━━━","طلب رقم "+(i+1)+" | "+r.id,
 "العميل: "+r.clientName,"الهاتف: "+(r.clientPhone||"غير مدخل"),"الخدمة: "+r.service,
 "الحالة: "+r.status,"المسؤول: "+(r.owner||"غير معيّن"),"موعد المتابعة: "+(r.followUp||"غير محدد"),
 "العنوان: "+(r.subject||"—"),"تفاصيل الرحلة:\n"+(r.travelDetails||"—"),
 "الملاحظات:\n"+(r.notes||"—"),
 "المرفق: "+(r.attachment?r.attachment.name+" (الملف نفسه متوفر في تصدير JSON فقط)":"لا يوجد"),""
 ].join("\n"))).join("\n");
 download(text,"text/plain;charset=utf-8","abu-alfaisal-operations-"+day+".txt");
 toast("تم تجهيز ملف TXT.");
}
async function readFile(file,method){
 return new Promise((resolve,reject)=>{
  const reader=new FileReader();reader.onerror=()=>reject(new Error("تعذر قراءة الملف"));reader.onload=()=>resolve(String(reader.result||""));
  if(method==="text")reader.readAsText(file,"UTF-8");else reader.readAsDataURL(file);
 });
}
async function handleTravelFile(evt){
 const file=evt.target.files&&evt.target.files[0];if(!file)return;
 try{
  const extension=(file.name.split(".").pop()||"").toLowerCase();
  if(["txt","csv","json"].includes(extension)){
   if(file.size>120000)throw new Error("الملف النصي كبير جدًا. الحد الأقصى 120 كيلوبايت.");
   const text=await readFile(file,"text");const old=byId("travelDetails").value;
   if(old.length+text.length>30000)throw new Error("نص الرحلة يتجاوز الحد المسموح. اختر الجزء المهم فقط.");
   byId("travelDetails").value=(old?old+"\n\n":"")+"ملف: "+file.name+"\n"+text;
   toast("تم إدراج النص في تفاصيل الرحلة. اضغط «حفظ الطلب» للاحتفاظ به.");updateMessage(true);
  }else if(["pdf","png","jpg","jpeg","webp"].includes(extension)){
   if(file.size>716800)throw new Error("المرفق أكبر من 700 كيلوبايت. قلّل حجمه أو الصق التفاصيل نصيًا.");
   const declared={pdf:"application/pdf",png:"image/png",jpg:"image/jpeg",jpeg:"image/jpeg",webp:"image/webp"}[extension];
   const data=await readFile(file,"data");
   if(!data.startsWith("data:"+declared+";base64,"))throw new Error("نوع الملف غير متوافق مع امتداده.");
   attachment={name:file.name.slice(0,150),type:declared,size:file.size,data};renderAttachment();
   toast("تم تجهيز المرفق المحلي. احفظ الطلب لتثبيته.");
  }else throw new Error("صيغة الملف غير مدعومة.");
 }catch(e){toast(e.message||"تعذر فتح الملف.");}finally{evt.target.value="";}
}
async function importData(evt){
 const file=evt.target.files&&evt.target.files[0];if(!file)return;
 try{
  if(file.size>8000000)throw new Error("ملف الاستيراد أكبر من الحد المسموح (8 ميغابايت).");
  const raw=JSON.parse(await readFile(file,"text"));
  if(!raw||raw.schema!==SCHEMA||!Array.isArray(raw.records))throw new Error("ملف JSON ليس نسخة صالحة من لوحة تشغيل أبو الفيصل.");
  if(raw.records.length>5000)throw new Error("عدد الطلبات في الملف كبير جدًا.");
  const incoming=raw.records.map(validateRecord).filter(Boolean);
  if(incoming.length!==raw.records.length)throw new Error("تحتوي النسخة على سجلات غير صالحة.");
  const conflicts=incoming.filter((v)=>records.some((r)=>r.id===v.id)).length;
  if(!confirm("استيراد "+incoming.length+" طلب؟ سيتم دمجها مع الطلبات الحالية"+(conflicts?" وتحديث "+conflicts+" طلبات لها المعرّف نفسه.":".")))return;
  const merged=new Map(records.map((r)=>[r.id,r]));incoming.forEach((r)=>merged.set(r.id,r));
  if(saveAll(Array.from(merged.values()))){resetForm();render();toast("تم استيراد "+incoming.length+" طلب وحفظها في هذا المتصفح.");}
 }catch(e){toast(e.message||"تعذر استيراد الملف.");}finally{evt.target.value="";}
}
function formatPhone(phone){
 let value=String(phone||"").replace(/[^\d]/g,"");if(value.startsWith("00"))value=value.slice(2);
 if(value.length===9&&value.startsWith("7"))value="967"+value;
 return /^[1-9]\d{9,14}$/.test(value)?value:"";
}
function makeTemplate(){
 const r=gather();const name=r.clientName||"عميلنا العزيز";const intro="مرحبًا "+name+"،\n";
 const end="\n\nأبو الفيصل للسفريات والسياحة";
 let msg="",valid=true,warning="";
 switch(byId("templateType").value){
  case "received":
   msg=intro+"تم استلام طلبكم"+(r.service?" بخصوص "+r.service:"")+"، وسيتم مراجعته وإفادتكم بالتفاصيل بعد التحقق."+end;break;
  case "details":
   msg=intro+"لاستكمال متابعة طلبكم"+(r.service?" الخاص بـ"+r.service:"")+"، نرجو تزويدنا بالتفاصيل المطلوبة والموعد المناسب للسفر، حتى نتمكن من مراجعة الخيارات."+end;break;
  case "processing":
   msg=intro+"طلبكم"+(r.subject?" («"+r.subject+"»)":"")+" قيد المتابعة، وسنوافيكم بما يتوفر من معلومات مؤكدة بعد المراجعة."+end;break;
  case "flight":
   if(!r.travelDetails){valid=false;warning="أدخل تفاصيل الرحلة الحقيقية أولًا لتكوين هذه الرسالة.";break;}
   msg=intro+"هذه تفاصيل الرحلة وفق المعلومات المدخلة للمراجعة:\n\n"+r.travelDetails+"\n\nيرجى مراجعة البيانات قبل أي إجراء، والتأكيد النهائي يعتمد على التحقق من نظام الحجز."+end;break;
  case "follow":
   msg=intro+"نتابع طلبكم"+(r.subject?" بخصوص «"+r.subject+"»":"")+(r.followUp?"، وموعد المتابعة المسجل لدينا: "+showDate(r.followUp):"")+". سنطلعكم على أي مستجدات مؤكدة عند توفرها."+end;break;
 }
 return {message:msg,valid,warning};
}
function updateMessage(force){
 if(!force&&messageEdited)return;
 const data=makeTemplate();byId("messagePreview").value=data.message;
 byId("copyMessage").disabled=!data.valid;byId("openWhatsapp").disabled=!data.valid;
 byId("messageHint").textContent=data.warning||"راجع النص قبل إرساله؛ لا يُرسل تلقائيًا.";
 messageEdited=false;
}
async function copyMessage(){
 const msg=byId("messagePreview").value.trim();if(!msg){toast("الرسالة فارغة.");return;}
 try{
  if(navigator.clipboard&&window.isSecureContext)await navigator.clipboard.writeText(msg);
  else{const el=byId("messagePreview");el.focus();el.select();if(!document.execCommand("copy"))throw new Error("نسخ غير متاح");}
  toast("تم نسخ الرسالة. يمكنك لصقها في واتساب.");
 }catch(e){toast("تعذر النسخ. حدّد النص وانسخه يدويًا.");}
}
function openWhatsapp(){
 const phone=formatPhone(byId("clientPhone").value),msg=byId("messagePreview").value.trim();
 if(!msg){toast("الرسالة فارغة.");return;}
 if(!phone){toast("أدخل رقم واتساب دوليًا صحيحًا لفتح المحادثة، أو انسخ الرسالة يدويًا.");return;}
 const url="https://wa.me/"+phone+"?text="+encodeURIComponent(msg);
 window.open(url,"_blank","noopener,noreferrer");
 toast("فُتحت مسودة واتساب. راجعها واضغط إرسال بنفسك.");
}
function init(){
 load();render();updateMessage(true);
 byId("requestForm").addEventListener("submit",addOrUpdate);
 byId("resetForm").addEventListener("click",()=>{resetForm();byId("clientName").focus();});
 byId("newTop").addEventListener("click",()=>{resetForm();byId("editorAnchor").scrollIntoView({behavior:"smooth",block:"start"});byId("clientName").focus({preventScroll:true});});
 byId("deleteRequest").addEventListener("click",deleteCurrent);
 byId("duplicateRequest").addEventListener("click",()=>{selectedId=null;byId("recordId").value="";byId("formHeading").textContent="نسخة كطلب جديد";byId("deleteRequest").hidden=true;byId("duplicateRequest").hidden=true;byId("saveRequest").textContent="حفظ نسخة جديدة";renderList();toast("عدّل البيانات واحفظها كطلب جديد مستقل.");});
 for(const id of ["search","serviceFilter","statusFilter","ownerFilter","dueFilter"]){byId(id).addEventListener("input",renderList);byId(id).addEventListener("change",renderList);}
 byId("clearFilters").addEventListener("click",()=>{for(const id of ["search","serviceFilter","statusFilter","ownerFilter","dueFilter"])byId(id).value="";renderList();});
 byId("travelFile").addEventListener("change",handleTravelFile);
 byId("removeAttachment").addEventListener("click",()=>{attachment=null;renderAttachment();toast("تمت إزالة المرفق من النموذج؛ احفظ التعديلات.");});
 byId("exportTxt").addEventListener("click",()=>exportData("txt"));
 byId("exportJson").addEventListener("click",()=>exportData("json"));
 byId("importTrigger").addEventListener("click",()=>byId("importJson").click());
 byId("importJson").addEventListener("change",importData);
 byId("templateType").addEventListener("change",()=>updateMessage(true));
 byId("generateTemplate").addEventListener("click",()=>updateMessage(true));
 byId("messagePreview").addEventListener("input",()=>{messageEdited=true;});
 byId("copyMessage").addEventListener("click",copyMessage);
 byId("openWhatsapp").addEventListener("click",openWhatsapp);
 for(const id of ["clientName","service","subject","travelDetails","followUp"]){
  byId(id).addEventListener("input",()=>updateMessage(false));
  byId(id).addEventListener("change",()=>updateMessage(false));
 }
 document.addEventListener("visibilitychange",()=>{if(!document.hidden)render();});
 setInterval(render,60000);
}
init();
})();