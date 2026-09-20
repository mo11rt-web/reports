/* =========================================================
   نظام متابعة المشاريع — المنطق
   ملاحظة التخزين: يستخدم localStorage (تخزين المتصفح المحلي)
   حتى يعمل الحفظ بشكل صحيح سواء فتحت الملف مباشرة أو
   شغّلته كتطبيق ويندوز (Electron). البيانات تبقى محفوظة
   على نفس الجهاز/نفس نسخة التطبيق بين مرات التشغيل.
   ========================================================= */
(function(){

/* ================= زخرفة التقرير (خلفية إسلامية خفيفة) ================= */
const WM_TILE_SVG = `<svg xmlns="http://www.w3.org/2000/svg" width="96" height="96" viewBox="0 0 96 96" fill="none" stroke="#7A5C3E" stroke-width="1" stroke-opacity=".17">
<g transform="translate(48 48)"><rect x="-22" y="-22" width="44" height="44"/><rect x="-22" y="-22" width="44" height="44" transform="rotate(45)"/><circle r="9"/><rect x="-4" y="-4" width="8" height="8" transform="rotate(45)"/></g>
<path d="M79.1 48H96M0 48H16.9M48 79.1V96M48 0V16.9M26 26L7 7M70 26L89 7M26 70L7 89M70 70L89 89"/>
<path d="M0 -4L4 0L0 4L-4 0Z" transform="translate(0 48)"/><path d="M0 -4L4 0L0 4L-4 0Z" transform="translate(96 48)"/><path d="M0 -4L4 0L0 4L-4 0Z" transform="translate(48 0)"/><path d="M0 -4L4 0L0 4L-4 0Z" transform="translate(48 96)"/>
<g><path d="M0 -9L2.6 -2.6L9 0L2.6 2.6L0 9L-2.6 2.6L-9 0L-2.6 -2.6Z" transform="translate(0 0)"/><path d="M0 -9L2.6 -2.6L9 0L2.6 2.6L0 9L-2.6 2.6L-9 0L-2.6 -2.6Z" transform="translate(96 0)"/><path d="M0 -9L2.6 -2.6L9 0L2.6 2.6L0 9L-2.6 2.6L-9 0L-2.6 -2.6Z" transform="translate(0 96)"/><path d="M0 -9L2.6 -2.6L9 0L2.6 2.6L0 9L-2.6 2.6L-9 0L-2.6 -2.6Z" transform="translate(96 96)"/></g>
</svg>`;
const WM_FRAME_SVG = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 210 297" preserveAspectRatio="none" fill="none" stroke="#7A5C3E">
<style>*{vector-effect:non-scaling-stroke}</style>
<rect x="6" y="6" width="198" height="285" stroke-width="1" stroke-opacity=".38"/>
<rect x="8.2" y="8.2" width="193.6" height="280.6" stroke-width=".6" stroke-opacity=".28"/>
<g stroke-opacity=".4" stroke-width=".9">
<g transform="translate(6 6)"><path d="M0 12A12 12 0 0 0 12 0"/><path d="M0 7A7 7 0 0 0 7 0"/><path d="M0 -3.4L1.1 -1.1L3.4 0L1.1 1.1L0 3.4L-1.1 1.1L-3.4 0L-1.1 -1.1Z" fill="#7A5C3E" fill-opacity=".3"/></g>
<g transform="translate(204 6) scale(-1 1)"><path d="M0 12A12 12 0 0 0 12 0"/><path d="M0 7A7 7 0 0 0 7 0"/><path d="M0 -3.4L1.1 -1.1L3.4 0L1.1 1.1L0 3.4L-1.1 1.1L-3.4 0L-1.1 -1.1Z" fill="#7A5C3E" fill-opacity=".3"/></g>
<g transform="translate(6 291) scale(1 -1)"><path d="M0 12A12 12 0 0 0 12 0"/><path d="M0 7A7 7 0 0 0 7 0"/><path d="M0 -3.4L1.1 -1.1L3.4 0L1.1 1.1L0 3.4L-1.1 1.1L-3.4 0L-1.1 -1.1Z" fill="#7A5C3E" fill-opacity=".3"/></g>
<g transform="translate(204 291) scale(-1 -1)"><path d="M0 12A12 12 0 0 0 12 0"/><path d="M0 7A7 7 0 0 0 7 0"/><path d="M0 -3.4L1.1 -1.1L3.4 0L1.1 1.1L0 3.4L-1.1 1.1L-3.4 0L-1.1 -1.1Z" fill="#7A5C3E" fill-opacity=".3"/></g>
</g></svg>`;
const REPORT_ORN_SVG = `<svg class="rp-orn" viewBox="0 0 220 20" width="220" height="20" xmlns="http://www.w3.org/2000/svg" fill="none" stroke="#7A5C3E"><path d="M6 10H88M132 10H214" stroke-width="1"/><path d="M92 10L96 6M92 10L96 14M128 10L124 6M128 10L124 14" stroke-width=".9"/><g transform="translate(110 10)" stroke-width="1.2"><rect x="-6.5" y="-6.5" width="13" height="13"/><rect x="-6.5" y="-6.5" width="13" height="13" transform="rotate(45)"/><circle r="2" fill="#7A5C3E" stroke="none"/></g><circle cx="5" cy="10" r="1.7" fill="#7A5C3E" stroke="none"/><circle cx="215" cy="10" r="1.7" fill="#7A5C3E" stroke="none"/></svg>`;
(function initReportArt(){
  const uri = svg => 'url("data:image/svg+xml,' + encodeURIComponent(svg) + '")';
  const root = document.documentElement.style;
  root.setProperty('--wm-pattern', uri(WM_TILE_SVG));
  root.setProperty('--wm-frame', uri(WM_FRAME_SVG));
})();
window.addEventListener('afterprint', ()=>{ const pa=document.getElementById('printArea'); if(pa) pa.innerHTML=''; });

/* ================= PIN LOCK ================= */
const LOCK_KEY = 'pt_pin_hash_v1';
function pinHash(pin){
  let h = 0;
  for(let i=0;i<pin.length;i++){ h = (h*31 + pin.charCodeAt(i)) >>> 0; }
  return h.toString(36);
}
function showLock(mode){
  const title = document.getElementById('lockTitle');
  const sub = document.getElementById('lockSub');
  const confirmInput = document.getElementById('lockPinConfirm');
  const pinInput = document.getElementById('lockPinInput');
  document.getElementById('lockError').textContent = '';
  pinInput.value = '';
  confirmInput.value = '';
  if(mode==='set'){
    title.textContent = 'إنشاء رمز دخول (PIN)';
    sub.textContent = 'هذا أول تشغيل للتطبيق — اختر رمز دخول من 4 إلى 8 أرقام، وستحتاجه بكل مرة تفتح فيها التطبيق.';
    confirmInput.style.display = 'block';
  } else {
    title.textContent = 'أدخل رمز الدخول';
    sub.textContent = 'أدخل رمز الـ PIN الخاص بك للمتابعة.';
    confirmInput.style.display = 'none';
  }
  pinInput.focus();
}
function handleLockSubmit(){
  const pin = document.getElementById('lockPinInput').value.trim();
  const err = document.getElementById('lockError');
  const stored = localStorage.getItem(LOCK_KEY);
  if(!/^\d{4,8}$/.test(pin)){ err.textContent = 'الرمز لازم يكون أرقام فقط، بين 4 و 8 خانات.'; return; }
  if(!stored){
    const confirmPin = document.getElementById('lockPinConfirm').value.trim();
    if(pin !== confirmPin){ err.textContent = 'الرمزان غير متطابقين، حاول من جديد.'; return; }
    localStorage.setItem(LOCK_KEY, pinHash(pin));
    unlockApp();
  } else {
    if(pinHash(pin) === stored){
      unlockApp();
    } else {
      err.textContent = 'رمز غير صحيح، حاول مرة أخرى.';
      document.getElementById('lockPinInput').value = '';
      document.getElementById('lockPinInput').focus();
    }
  }
}
function unlockApp(){
  document.getElementById('lockScreen').style.display = 'none';
  document.getElementById('shell').classList.add('unlocked');
  startApp();
}
document.getElementById('lockSubmitBtn').addEventListener('click', handleLockSubmit);
document.getElementById('lockPinInput').addEventListener('keydown', e=>{
  if(e.key==='Enter'){
    const c = document.getElementById('lockPinConfirm');
    if(c.style.display!=='none'){ c.focus(); } else { handleLockSubmit(); }
  }
});
document.getElementById('lockPinConfirm').addEventListener('keydown', e=>{ if(e.key==='Enter') handleLockSubmit(); });
document.getElementById('lockResetBtn').addEventListener('click', ()=>{
  if(confirm('إعادة تعيين رمز الدخول تمسح الرمز الحالي فقط — بياناتك بالمشاريع ما راح تتأثر إطلاقاً. متابعة؟')){
    localStorage.removeItem(LOCK_KEY);
    showLock('set');
  }
});
(function initLock(){
  showLock(localStorage.getItem(LOCK_KEY) ? 'enter' : 'set');
})();

/* ================= CATEGORY / FAB META ================= */
const CAT_PALETTE = ['#4C6E8A','#8A5A3D','#6B5B95','#4C7A5D','#A6763A','#3D7A8A','#8A4C6E','#5B6B3D'];
const CAT_DEFAULT_SUGGESTIONS = ['الإشراف','المقاولة','الإدارة','التخطيط'];
const NO_CAT_LABEL = 'بدون تصنيف';
function categoryColor(catText){
  const s = (catText||'').trim();
  if(!s) return '#9C9689';
  let hash = 0;
  for(let i=0;i<s.length;i++){ hash = (hash*31 + s.charCodeAt(i)) >>> 0; }
  return CAT_PALETTE[hash % CAT_PALETTE.length];
}
function catOf(p){ return (p.category && p.category.trim()) ? p.category.trim() : NO_CAT_LABEL; }
function getDistinctCategories(){
  const set = new Set();
  PROJECTS.forEach(p=>{ if(p.category && p.category.trim()) set.add(p.category.trim()); });
  return Array.from(set).sort((a,b)=>a.localeCompare(b,'ar'));
}
function getSuggestedCategories(){
  return Array.from(new Set([...CAT_DEFAULT_SUGGESTIONS, ...getDistinctCategories()]));
}
function refreshCategoryDatalist(){
  const dl = document.getElementById('categoryOptions');
  if(!dl) return;
  dl.innerHTML = getSuggestedCategories().map(c=>`<option value="${esc(c)}"></option>`).join('');
}
const FAB_META = {
  none:{label:'لم يتم التقديم', cls:'fab-none'},
  pending:{label:'بانتظار التقديم', cls:'fab-pending'},
  submitted:{label:'تم التقديم', cls:'fab-submitted'},
  custom:{label:'حالة أخرى', cls:'fab-custom'}
};
function isFabApplicable(p){ return p.fab.applicable !== false; }
function fabDisplayLabel(fab){
  if(fab.status==='custom'){ return (fab.customText && fab.customText.trim()) ? fab.customText.trim() : FAB_META.custom.label; }
  return (FAB_META[fab.status] || FAB_META.none).label;
}
const MONTHS_AR = ['يناير','فبراير','مارس','أبريل','مايو','يونيو','يوليو','أغسطس','سبتمبر','أكتوبر','نوفمبر','ديسمبر'];

/* ================= DEFAULT SEED DATA ================= */
function seedProjects(){
  const raw = [
  // owner, projNo, projId, category, location
  ['امل الرميثي','AUH-004','B1N-2021-003658','sup','Plot No.233b, Sector Z34, MBZ City'],
  ['عامر العليوي','AUH-008','B1N-2019-011566','sup','Plot No.4, Sector RD23, Madinat Al Riyad'],
  ['منصور الدرمكي','AUH-011','B1N-2021-006419','sup','Plot No. 52, Sector Rahbah_V, Al Samhah'],
  ['حميد الدرمكي','AUH-013','B1N-2022-008816','sup','Plot No. 134, Sector Z21, MBZ City'],
  ['محمد الحمداني','AUH-014','B1N-2021-007962','sup','Plot No.443, Sector Al Bahyah Old, Al Bahyah'],
  ['فيصل المعيني','AUH-019','B1N-2023-003224','sup','Plot No. 433, Sector SH35, Al Shamkhah'],
  ['احمد المنصوري','AUH-035','B1N-2020-008653','sup','Plot No.25, Sector MSH 26, Shakhbout City'],
  ['سعيد السويدي','AUH-036','B1N-2023-006397','sup','Plot No. 56, Sector Z2, MBZ City'],
  ['جابر الهاجري','AUH-038','B1N-2020-010749','sup','Plot No.177, Sector MZ6, Zayed City'],
  ['فاطمة السويدي','AUH-043','B1N-2024-007090','con','Plot No.167, Sector RD125, Madinat Al Riyad'],
  ['خالد سيف الزعابي','AUH-046','BIN-2024-007812','con','Plot No.36, Sector MZ36, Zayed City'],
  ['محمد العطاس','AUH-015','B1N-2023-004075','mgmt','Plot 353, Sector SHM5, Al Shawamekh'],
  ['علي الحجري','AUH-023','B1N-2023-006926','mgmt','Plot No.281, Sector SH35, AL Shamkhah'],
  ['فيحاء الكندي','AUH-024','B1N-2023-006543','mgmt','Plot No.282, Sector SH35, AL Shamkhah'],
  ['احمد الخوري','AUH-025','B1N-2023-005773','mgmt','Plot No.225, Sector Z35, MBZ City'],
  ['راشد المعمري','AUH-027','B1N-2023-000430','mgmt','Plot No/207, Sector SH31, Al Shamkhah'],
  ['محمد الزعابي','AUH-028','B1N-2019-009402','mgmt','Plot No.127, Sector RD18, Madinat Al Riyad'],
  ['جاسم الحوسني','AUH-034','B1N-2022-008475','mgmt','Plot No.454, Sector Al Bahyah New, Al Bahyah'],
  ['احمد المصعبي','AUH-039','B1N-2024-002620','mgmt','Plot No.61, Sector RD71, Madinat Al Riyad'],
  ['عبد الرحيم الهرمودي','AUH-044','B1N-2024-004139','mgmt','Plot No.36, Sector Rahba-K, Rahba'],
  ['خالد المنصوري','AUH-042','B1N-2023-002778','mgmt','Plot No. 201, Sector Z36, MBZ City'],
  ['عايشة العتيقي','AUH-021','B1N-2022-002713','plan','Plot No.210, Sector E25, Al Nahyan'],
  ['عبدالله الكندي','AUH-045','B1N-2024-004992','plan','Plot No. 107, Sector RD148, Madinat Al Riyad'],
  ['فري المزروعي','AUH-049','B1N-2017-001374','plan','Plot No.12, Sector SE 41, Khalifa City'],
  ['احمد الخزرجي','AUH-050','B1N-2024-008464','plan','Plot No. 136, Sector RD144, Madinat Al Riyad'],
  ['سيف العدوي','AUH-051','B1N-2024-010970','plan','Plot No.4, Sector RD145, Madinat Al Riyad'],
  ['محمد الجابري','AUH-054','B1N-2024-003004','plan','Plot No.89, Sector SH31, Al Shamkha'],
  ['سلطان هلال الكندي','AUH-055','','plan',''],
  ['محمد صقر الفلاحي','AUH-056','B1N-2024-011776','plan','Plot No.74, Sector MZ 9, Zayed City'],
  ['سلطان صقر الفلاحي','AUH-057','B1N-2024-011656','plan','Plot No.73, Sector MZ 9, Zayed City'],
  ['عبدالله سيف','AUH-063','B1N-2024-014137','plan','Plot No.32, Sector RD139, Madinat Al Riyad'],
  ['احمد خليفه القمرزي / شمسه','AUH-064','B2SD-2025-00651','plan','Plot No.35, Sector RB27, Rabdan'],
  ['العامر كرامه العامري','AUH-065','B1N-2024-015936','plan','Plot No.5A, Sector MSH21, Shakhbout City'],
  ['حنان المصعبي / احمد الجعيدي','AUH-071','','plan','Plot No.421, Sector SH35, Al Shamkhah'],
  ];
  const SEED_CAT_LABELS = {sup:'الإشراف', con:'المقاولة', mgmt:'الإدارة', plan:'التخطيط'};
  return raw.map((r,i)=>({
    id:'p'+(i+1)+'_'+Date.now().toString(36)+Math.random().toString(36).slice(2,6),
    owner:r[0], projNo:r[1], projId:r[2], category: SEED_CAT_LABELS[r[3]] || r[3], location:r[4],
    contractor:'',
    customFields:[],
    entries:[], // {date:'YYYY-MM-DD', points:[{text,color}]}
    fab:{status:'none', date:'', note:'', applicable:true}
  }));
}
function seedExtras(){ return []; }

/* ================= STATE & STORAGE (localStorage) ================= */
let PROJECTS = [];
let REPORTS = [];
let EXTRAS = [];
let currentProjectId = null;
let infoEditMode = false;
let activeCat = 'all';
let activeFab = 'all';
let followUpOnly = false;
let visibleProjectIds = [];
let projectSaveTimer = null;
/* لا نكتب أي شي بالتخزين قبل ما تنقرأ البيانات فعلياً (بعد إدخال الـ PIN).
   قبل هذا الإصلاح: لو أغلقت التطبيق وهو على شاشة القفل كان يكتب قائمة مشاريع فاضية فوق بياناتك! */
let DATA_LOADED = false;
function scheduleProjectSave(){
  clearTimeout(projectSaveTimer);
  projectSaveTimer = setTimeout(()=>{ saveProjects(); projectSaveTimer=null; }, 220);
}
function flushProjectSave(){
  if(projectSaveTimer){ clearTimeout(projectSaveTimer); projectSaveTimer=null; }
  if(DATA_LOADED) saveProjects();
}
window.addEventListener('beforeunload', flushProjectSave);

/* قراءة قائمة من التخزين. لو كانت تالفة نحتفظ بنسخة منها قبل ما نكتب فوقها. */
function readStoredList(key, label, corruptLabels){
  const raw = localStorage.getItem(key);
  if(raw === null) return null;
  try{
    const v = JSON.parse(raw);
    if(!Array.isArray(v)) throw new Error('not an array');
    return v;
  }catch(e){
    console.error('stored data is corrupted: '+key, e);
    try{
      const stash = key+'_corrupt_'+Date.now();
      localStorage.setItem(stash, raw);
      Object.keys(localStorage).filter(k=>k.startsWith(key+'_corrupt_') && k!==stash).forEach(k=>localStorage.removeItem(k));
    }catch(_){}
    corruptLabels.push(label);
    return null;
  }
}

function loadAll(){
  const corrupt = [];
  const p = readStoredList('pt_projects_v2', 'المشاريع', corrupt);
  const r = readStoredList('pt_reports_v2', 'سجل التقارير', corrupt);
  const x = readStoredList('pt_extras_v1', 'البنود الإضافية', corrupt);
  PROJECTS = p || seedProjects();
  REPORTS = r || [];
  EXTRAS = x || seedExtras();
  // ترحيل تلقائي: تحويل أكواد التصنيف القديمة (sup/con/mgmt/plan) لنص عربي مقروء
  const LEGACY_CAT_MAP = {sup:'الإشراف', con:'المقاولة', mgmt:'الإدارة', plan:'التخطيط'};
  let migrated = false;
  PROJECTS.forEach(pr=>{
    if(LEGACY_CAT_MAP[pr.category]){ pr.category = LEGACY_CAT_MAP[pr.category]; migrated = true; }
  });
  DATA_LOADED = true;
  if(p===null || migrated) saveProjects();
  if(r===null) saveReports();
  if(x===null) saveExtras();
  if(corrupt.length){
    setTimeout(()=>alert('تنبيه: بيانات ('+corrupt.join('، ')+') كانت تالفة وتعذّرت قراءتها.\nتم الاحتفاظ بنسخة منها داخل تخزين التطبيق ولم تُمسح، ويمكنك استرجاع نسخة احتياطية من الزر «⬆️ استرجاع من ملف».'), 50);
  }
}
const STORAGE_FULL_MSG = 'تعذّر الحفظ: مساحة التخزين المحلية ممتلئة أو غير متاحة.\nصدّر نسخة احتياطية الآن (⬇️ تصدير نسخة احتياطية) ثم احذف التقارير القديمة من «سجل التقارير» لتفريغ مساحة.';
function saveProjects(){
  if(!DATA_LOADED) return false;
  try{ localStorage.setItem('pt_projects_v2', JSON.stringify(PROJECTS)); return true; }
  catch(e){ console.error('save projects failed', e); alert(STORAGE_FULL_MSG); return false; }
}
function saveReports(){
  if(!DATA_LOADED) return false;
  try{ localStorage.setItem('pt_reports_v2', JSON.stringify(REPORTS)); return true; }
  catch(e){ console.error('save reports failed', e); alert(STORAGE_FULL_MSG); return false; }
}
function saveExtras(){
  if(!DATA_LOADED) return false;
  try{ localStorage.setItem('pt_extras_v1', JSON.stringify(EXTRAS)); return true; }
  catch(e){ console.error('save extras failed', e); alert(STORAGE_FULL_MSG); return false; }
}

/* ================= HELPERS ================= */
/* التاريخ المحلي (مو UTC): قبل كان بعد منتصف الليل وحتى ٤ الفجر (توقيت +4) يطلع تاريخ أمس */
function localISO(d){
  d = d || new Date();
  return d.getFullYear()+'-'+String(d.getMonth()+1).padStart(2,'0')+'-'+String(d.getDate()).padStart(2,'0');
}
function todayISO(){ return localISO(); }
function fmtDateAr(iso){
  if(!iso) return '—';
  const d = new Date(iso+'T00:00:00');
  return `${d.getDate()} ${MONTHS_AR[d.getMonth()]} ${d.getFullYear()}`;
}
function esc(s){ return (s||'').toString().replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c])); }
function getProject(id){ return PROJECTS.find(p=>p.id===id); }
function normalizeAr(s){
  return (s||'').toString().trim().toLowerCase()
    .replace(/\*/g,'').replace(/[:：]/g,'')
    .replace(/[إأآا]/g,'ا').replace(/ى/g,'ي').replace(/ة/g,'ه').replace(/\s+/g,' ');
}

/* ================= SIDEBAR ================= */
function renderSidebarFilters(){
  const catBox = document.getElementById('catFilter');
  const counts = {};
  PROJECTS.forEach(p=>{ const c=catOf(p); counts[c]=(counts[c]||0)+1; });
  const catList = Object.keys(counts).sort((a,b)=>a.localeCompare(b,'ar'));
  let html = `<div class="cat-item ${activeCat==='all'?'active':''}" data-cat="all"><span class="dot" style="background:var(--ink-soft)"></span> الكل <span style="margin-inline-start:auto;font-size:11px;">${PROJECTS.length}</span></div>`;
  catList.forEach(c=>{
    html += `<div class="cat-item ${activeCat===c?'active':''}" data-cat="${esc(c)}"><span class="dot" style="background:${categoryColor(c)}"></span> ${esc(c)} <span style="margin-inline-start:auto;font-size:11px;">${counts[c]||0}</span></div>`;
  });
  catBox.innerHTML = html;
  catBox.querySelectorAll('.cat-item').forEach(el=>el.addEventListener('click',()=>{ activeCat = el.dataset.cat; renderDashboard(); renderSidebarFilters(); }));

  const fabBox = document.getElementById('fabFilter');
  const fcounts = {none:0,pending:0,submitted:0,custom:0,na:0};
  PROJECTS.forEach(p=>{ if(isFabApplicable(p)) fcounts[p.fab.status]++; else fcounts.na++; });
  let fhtml = `<div class="cat-item ${activeFab==='all'?'active':''}" data-fab="all">الكل <span style="margin-inline-start:auto;font-size:11px;">${PROJECTS.length}</span></div>`;
  Object.keys(FAB_META).forEach(k=>{
    fhtml += `<div class="cat-item ${activeFab===k?'active':''}" data-fab="${k}">${FAB_META[k].label} <span style="margin-inline-start:auto;font-size:11px;">${fcounts[k]||0}</span></div>`;
  });
  fhtml += `<div class="cat-item ${activeFab==='na'?'active':''}" data-fab="na">بدون بنك / FAB <span style="margin-inline-start:auto;font-size:11px;">${fcounts.na||0}</span></div>`;
  fabBox.innerHTML = fhtml;
  fabBox.querySelectorAll('.cat-item').forEach(el=>el.addEventListener('click',()=>{ activeFab = el.dataset.fab; renderDashboard(); renderSidebarFilters(); }));
}

/* ================= FOLLOW-UP CHECK ================= */
const FOLLOWUP_DAYS_THRESHOLD = 7;
function getLastUpdateDate(p){
  let lastDate = null;
  p.entries.forEach(e=>{ if(!lastDate || e.date>lastDate) lastDate = e.date; });
  return lastDate;
}
function hasRedFlag(p){
  return p.entries.some(e=> e.points.some(pt=>pt.color==='red'));
}
function needsFollowUp(p){
  const lastDate = getLastUpdateDate(p);
  let daysSince = null;
  if(lastDate){
    daysSince = Math.floor((new Date(todayISO()+'T00:00:00') - new Date(lastDate+'T00:00:00')) / 86400000);
  }
  const stale = lastDate===null || daysSince>=FOLLOWUP_DAYS_THRESHOLD;
  const red = hasRedFlag(p);
  return { flag: stale || red, stale, red, daysSince };
}

/* ================= DASHBOARD ================= */
function renderDashboard(){
  const q = (document.getElementById('searchBox').value||'').trim().toLowerCase();
  followUpOnly = document.getElementById('followUpFilter').checked;
  let list = PROJECTS.filter(p=>{
    if(activeCat!=='all' && catOf(p)!==activeCat) return false;
    if(activeFab!=='all'){
      if(activeFab==='na'){ if(isFabApplicable(p)) return false; }
      else { if(!isFabApplicable(p) || p.fab.status!==activeFab) return false; }
    }
    if(followUpOnly && !needsFollowUp(p).flag) return false;
    if(q){
      const hay = (p.owner+' '+p.location+' '+p.contractor+' '+p.projId).toLowerCase();
      if(!hay.includes(q)) return false;
    }
    return true;
  });
  visibleProjectIds = list.map(p=>p.id);
  document.getElementById('dashSub').textContent = `${list.length} من أصل ${PROJECTS.length} مشروع`;
  const wrap = document.getElementById('projList');
  if(list.length===0){ wrap.innerHTML = '<div class="empty-note">لا توجد نتائج مطابقة.</div>'; return; }
  wrap.innerHTML = list.map(p=>{
    const lastEntry = p.entries[p.entries.length-1];
    const lastPoint = lastEntry ? (lastEntry.points[lastEntry.points.length-1]?.text||'') : '';
    const fabBadge = isFabApplicable(p)
      ? `<span class="badge ${FAB_META[p.fab.status]?.cls || 'fab-none'}">${esc(fabDisplayLabel(p.fab))}</span>`
      : `<span class="badge fab-na">بدون بنك</span>`;
    const fu = needsFollowUp(p);
    const followUpTitle = fu.stale && fu.red ? 'لا يوجد تحديث منذ فترة، ويحتوي على نقطة مهمة حمراء'
      : fu.stale ? (fu.daysSince===null ? 'لا يوجد أي تحديث بعد' : `لا يوجد تحديث منذ ${fu.daysSince} يوم`)
      : 'يحتوي على نقطة مهمة حمراء تحتاج متابعة';
    const followUpBadge = fu.flag ? `<span class="badge follow-up-badge" title="${esc(followUpTitle)}">⚠️ يحتاج متابعة</span>` : '';
    return `
    <div class="proj-row" style="border-right-color:${categoryColor(p.category)}" data-id="${p.id}">
      <div class="proj-main">
        <div class="proj-owner">${esc(p.owner)}</div>
        <div class="proj-meta">
          <span>${esc(p.location||'بدون موقع مسجّل')}</span>
          ${p.contractor?`<span>مقاول: ${esc(p.contractor)}</span>`:''}
        </div>
        ${lastPoint?`<div style="font-size:12px;color:var(--ink-soft);margin-top:5px;">آخر تحديث: ${esc(lastPoint)}</div>`:''}
      </div>
      ${followUpBadge}
      ${fabBadge}
      <div class="proj-actions"><button class="btn small open-btn">فتح</button></div>
    </div>`;
  }).join('');
  wrap.onclick = (e)=>{
    const row = e.target.closest('.proj-row');
    if(row && getProject(row.dataset.id)) openProject(row.dataset.id);
  };
}
document.getElementById('followUpFilter').addEventListener('change', renderDashboard);

/* ================= MODAL: PROJECT DETAIL ================= */
function openProject(id){
  currentProjectId = id;
  infoEditMode = false;
  const p = getProject(id);
  refreshCategoryDatalist();
  document.getElementById('mTitle').textContent = p.owner;
  document.getElementById('mSub').textContent = `${p.projId||'بدون رقم رخصة'} · ${catOf(p)}`;
  updateModalNav();
  switchMTab('info');
  renderInfoTab(p);
  renderLogTab(p);
  renderFieldsTab(p);
  renderFabTab(p);
  document.getElementById('overlay').classList.add('show');
}
function updateModalNav(){
  const idx = visibleProjectIds.indexOf(currentProjectId);
  const total = visibleProjectIds.length;
  document.getElementById('modalNavPos').textContent = (idx>=0 && total>0) ? `${idx+1} / ${total}` : '';
  document.getElementById('prevProjectBtn').disabled = !(total>1);
  document.getElementById('nextProjectBtn').disabled = !(total>1);
}
function navigateProject(direction){
  if(visibleProjectIds.length===0) return;
  let idx = visibleProjectIds.indexOf(currentProjectId);
  if(idx===-1) idx = 0;
  const newIdx = (idx + direction + visibleProjectIds.length) % visibleProjectIds.length;
  openProject(visibleProjectIds[newIdx]);
}
document.getElementById('prevProjectBtn').addEventListener('click', ()=>navigateProject(-1));
document.getElementById('nextProjectBtn').addEventListener('click', ()=>navigateProject(1));
function closeModal(){
  document.getElementById('overlay').classList.remove('show');
  currentProjectId = null;
  requestAnimationFrame(()=>{ renderDashboard(); renderSidebarFilters(); });
}
function switchMTab(name){
  document.querySelectorAll('.mtab').forEach(b=>b.classList.toggle('active', b.dataset.mtab===name));
  document.querySelectorAll('.mpane').forEach(el=>{ el.style.display = (el.id==='mpane-'+name)?'block':'none'; });
}

function renderInfoTab(p){
  const disabled = infoEditMode ? '' : 'disabled';
  document.getElementById('infoEditStatus').textContent = infoEditMode ? 'وضع التعديل — عدّل ثم اضغط حفظ' : 'وضع العرض';
  document.getElementById('editInfoBtn').style.display = infoEditMode ? 'none' : 'inline-block';
  document.getElementById('saveInfoBtn').style.display = infoEditMode ? 'inline-block' : 'none';
  document.getElementById('infoFields').innerHTML = `
    <div class="field"><label>اسم المالك</label><input id="f_owner" value="${esc(p.owner)}" ${disabled}></div>
    <div class="field"><label>اسم المقاول</label><input id="f_contractor" value="${esc(p.contractor)}" placeholder="اكتب اسم المقاول" ${disabled}></div>
    <div class="field"><label>رقم الرخصة</label><input id="f_projId" value="${esc(p.projId)}" ${disabled}></div>
    <div class="field"><label>نوع الخدمة</label><input id="f_category" list="categoryOptions" placeholder="مثال: الإشراف" value="${esc(p.category||'')}" ${disabled}></div>
    <div class="field full"><label>الموقع</label><input id="f_location" value="${esc(p.location)}" ${disabled}></div>
    <div class="field"><label>رقم المشروع الداخلي (اختياري)</label><input id="f_projNo" value="${esc(p.projNo)}" ${disabled}></div>
  `;
  if(infoEditMode){
    ['f_owner','f_contractor','f_projId','f_category','f_location','f_projNo'].forEach(fid=>{
      document.getElementById(fid).addEventListener('input', ()=>{
        const key = fid.slice(2);
        p[key] = document.getElementById(fid).value;
        document.getElementById('mTitle').textContent = p.owner || 'مشروع';
        document.getElementById('mSub').textContent = `${p.projId||'بدون رقم رخصة'} · ${catOf(p)}`;
      });
    });
  }
  document.getElementById('deleteProjectBtn').onclick = ()=>{
    if(confirm('هل أنت متأكد من حذف هذا المشروع نهائياً؟')){
      PROJECTS = PROJECTS.filter(x=>x.id!==p.id);
      saveProjects();
      closeModal();
    }
  };
}
function beginInfoEdit(){
  if(!getProject(currentProjectId)) return;
  infoEditMode = true;
  renderInfoTab(getProject(currentProjectId));
  const first = document.getElementById('f_owner'); if(first) first.focus();
}
function saveInfoChanges(){
  const p = getProject(currentProjectId); if(!p) return;
  ['owner','contractor','projId','category','location','projNo'].forEach(key=>{
    const el = document.getElementById('f_'+key); if(el) p[key]=el.value.trim();
  });
  flushProjectSave();
  renderDashboard(); renderSidebarFilters(); refreshCategoryDatalist();
  infoEditMode = false;
  renderInfoTab(p);
  document.getElementById('mTitle').textContent = p.owner || 'مشروع';
  document.getElementById('mSub').textContent = `${p.projId||'بدون رقم رخصة'} · ${catOf(p)}`;
}
document.getElementById('editInfoBtn').addEventListener('click', beginInfoEdit);
document.getElementById('saveInfoBtn').addEventListener('click', saveInfoChanges);

let selectedColor = 'default';
function renderLogTab(p){
  const wrap = document.getElementById('entriesWrap');
  if(p.entries.length===0){
    wrap.innerHTML = '<div class="empty-note">لا يوجد أي تحديثات بعد. أضف أول نقطة أدناه.</div>';
  }else{
    const sorted = [...p.entries].sort((a,b)=> a.date < b.date ? 1 : -1);
    wrap.innerHTML = sorted.map(entry=>`
      <div class="entry-group" data-date="${entry.date}">
        <div class="entry-date">${fmtDateAr(entry.date)}</div>
        <ul class="point-list">
          ${entry.points.map((pt,idx)=>`
            <li class="point-item ${pt.color==='green'?'pt-green':pt.color==='red'?'pt-red':''}">
              <input class="point-text point-edit-input" value="${esc(pt.text)}" data-date="${entry.date}" data-idx="${idx}" aria-label="تعديل نقطة التحديث">
              <button class="point-del" data-date="${entry.date}" data-idx="${idx}" title="حذف">✕</button>
            </li>`).join('')}
        </ul>
      </div>
    `).join('');
    wrap.querySelectorAll('.point-edit-input').forEach(input=>{
      input.addEventListener('input', ()=>{
        const entry = p.entries.find(e=>e.date===input.dataset.date);
        if(entry && entry.points[parseInt(input.dataset.idx)]){ entry.points[parseInt(input.dataset.idx)].text = input.value; saveProjects(); }
      });
    });
    wrap.querySelectorAll('.point-del').forEach(btn=>{
      btn.addEventListener('click', ()=>{
        const entry = p.entries.find(e=>e.date===btn.dataset.date);
        entry.points.splice(parseInt(btn.dataset.idx),1);
        if(entry.points.length===0) p.entries = p.entries.filter(e=>e!==entry);
        saveProjects();
        renderLogTab(p);
      });
    });
  }
  selectedColor='default';
  document.querySelectorAll('.color-opt').forEach(b=>b.classList.toggle('sel', b.dataset.c==='default'));
}
document.getElementById('colorSelect').addEventListener('click', (e)=>{
  const btn = e.target.closest('.color-opt');
  if(!btn) return;
  selectedColor = btn.dataset.c;
  document.querySelectorAll('.color-opt').forEach(b=>b.classList.toggle('sel', b===btn));
});
document.getElementById('addPointBtn').addEventListener('click', ()=>{
  const p = getProject(currentProjectId);
  const ta = document.getElementById('newPointText');
  const text = ta.value.trim();
  if(!text) return;
  const date = todayISO();
  let entry = p.entries.find(e=>e.date===date);
  if(!entry){ entry = {date, points:[]}; p.entries.push(entry); }
  entry.points.push({text, color:selectedColor});
  ta.value='';
  saveProjects();
  renderLogTab(p);
});

function renderFieldsTab(p){
  const wrap = document.getElementById('customFieldsWrap');
  if(p.customFields.length===0){
    wrap.innerHTML = '<div class="empty-note">لا توجد حقول إضافية. أضف حقلاً جديداً لتسجيل أي معلومة خاصة بهذا المشروع.</div>';
  }else{
    wrap.innerHTML = p.customFields.map((f,idx)=>`
      <div class="cf-row" data-idx="${idx}">
        <input class="cf-label" value="${esc(f.label)}" placeholder="اسم الحقل">
        <input class="cf-value" value="${esc(f.value)}" placeholder="القيمة">
        <button class="point-del cf-del" title="حذف">✕</button>
      </div>`).join('');
    wrap.querySelectorAll('.cf-row').forEach(row=>{
      const idx = parseInt(row.dataset.idx);
      row.querySelector('.cf-label').addEventListener('input', e=>{ p.customFields[idx].label = e.target.value; scheduleProjectSave(); });
      row.querySelector('.cf-value').addEventListener('input', e=>{ p.customFields[idx].value = e.target.value; scheduleProjectSave(); });
      row.querySelector('.cf-del').addEventListener('click', ()=>{ p.customFields.splice(idx,1); saveProjects(); renderFieldsTab(p); });
    });
  }
}
document.getElementById('addFieldBtn').addEventListener('click', ()=>{
  const p = getProject(currentProjectId);
  p.customFields.push({label:'حقل جديد', value:''});
  saveProjects();
  renderFieldsTab(p);
});

function renderFabTab(p){
  const applicable = isFabApplicable(p);
  document.getElementById('fabApplicable').checked = applicable;
  document.getElementById('fabDetailsWrap').style.display = applicable ? 'block' : 'none';
  document.getElementById('fabStatus').value = p.fab.status;
  document.getElementById('fabDate').value = p.fab.date || todayISO();
  document.getElementById('fabNote').value = p.fab.note || '';
  document.getElementById('fabCustomText').value = p.fab.customText || '';
  document.getElementById('fabCustomTextWrap').style.display = (p.fab.status==='custom') ? 'flex' : 'none';
}
document.getElementById('fabStatus').addEventListener('change', (e)=>{
  document.getElementById('fabCustomTextWrap').style.display = (e.target.value==='custom') ? 'flex' : 'none';
});
document.getElementById('fabApplicable').addEventListener('change', (e)=>{
  document.getElementById('fabDetailsWrap').style.display = e.target.checked ? 'block' : 'none';
});
function syncFabFields(showMessage=false){
  const p = getProject(currentProjectId); if(!p) return;
  p.fab.applicable = document.getElementById('fabApplicable').checked;
  p.fab.status = document.getElementById('fabStatus').value;
  p.fab.date = document.getElementById('fabDate').value || todayISO();
  p.fab.note = document.getElementById('fabNote').value;
  p.fab.customText = document.getElementById('fabCustomText').value;
  flushProjectSave();
  renderDashboard(); renderSidebarFilters();
  if(showMessage) alert('تم حفظ حالة الدفعات.');
}
document.getElementById('saveFabBtn').addEventListener('click', ()=>syncFabFields(true));

document.querySelectorAll('.mtab').forEach(b=>b.addEventListener('click',()=>switchMTab(b.dataset.mtab)));
document.getElementById('closeModal').addEventListener('click', closeModal);
document.getElementById('overlay').addEventListener('click', (e)=>{ if(e.target.id==='overlay') closeModal(); });

/* ================= ADD PROJECT ================= */
function resetAddProjectForm(){
  ['newOwner','newContractor','newProjId','newLocation','newProjNo'].forEach(id=>document.getElementById(id).value='');
  document.getElementById('newCategory').value='الإشراف';
  document.getElementById('addProjectError').textContent='';
}
function openAddProject(){ resetAddProjectForm(); document.getElementById('addOverlay').classList.add('show'); setTimeout(()=>document.getElementById('newOwner').focus(),50); }
function closeAddProject(){ document.getElementById('addOverlay').classList.remove('show'); }
document.getElementById('closeAddModal').addEventListener('click', closeAddProject);
document.getElementById('cancelAddProject').addEventListener('click', closeAddProject);
document.getElementById('addOverlay').addEventListener('click', e=>{ if(e.target.id==='addOverlay') closeAddProject(); });
document.getElementById('saveNewProject').addEventListener('click', ()=>{
  const owner=document.getElementById('newOwner').value.trim();
  if(!owner){ document.getElementById('addProjectError').textContent='اكتب اسم المالك أولاً.'; document.getElementById('newOwner').focus(); return; }
  const np={id:'p_'+Date.now().toString(36)+Math.random().toString(36).slice(2,6), owner, projNo:document.getElementById('newProjNo').value.trim(), projId:document.getElementById('newProjId').value.trim(), category:document.getElementById('newCategory').value.trim(), location:document.getElementById('newLocation').value.trim(), contractor:document.getElementById('newContractor').value.trim(), customFields:[], entries:[], fab:{status:'none',date:'',note:'',applicable:true}};
  PROJECTS.push(np); saveProjects(); renderDashboard(); renderSidebarFilters(); closeAddProject(); openProject(np.id);
});
document.getElementById('newOwner').addEventListener('keydown', e=>{ if(e.key==='Enter') document.getElementById('saveNewProject').click(); });
document.addEventListener('click', e=>{
  if(e.target.closest('#addProjectBtn')){ e.preventDefault(); openAddProject(); return; }
});

/* ================= TABS (dashboard/report/history) ================= */
document.querySelectorAll('.tab-btn').forEach(btn=>{
  btn.addEventListener('click', ()=>{
    document.querySelectorAll('.tab-btn').forEach(b=>b.classList.toggle('active', b===btn));
    ['dashboard','report','history'].forEach(name=>{
      document.getElementById('page-'+name).style.display = (name===btn.dataset.tab)?'block':'none';
    });
    if(btn.dataset.tab==='history') renderHistory();
    if(btn.dataset.tab==='report' && !document.getElementById('rFrom').value) setDefaultReportRange();
  });
});

document.getElementById('searchBox').addEventListener('input', renderDashboard);

/* ================= IMPORT (bulk paste) ================= */
let importParsed = [];
document.getElementById('toggleImportBtn').addEventListener('click', ()=>{
  const panel = document.getElementById('importPanel');
  panel.classList.toggle('show');
  if(!document.getElementById('importDate').value) document.getElementById('importDate').value = todayISO();
});
function findProjectMatch(identifier){
  const norm = normalizeAr(identifier);
  if(!norm) return null;
  // 1) مطابقة مباشرة (احتواء نصي)
  let matches = PROJECTS.filter(p=> normalizeAr(p.owner).includes(norm) || norm.includes(normalizeAr(p.owner)));
  if(matches.length>=1) return matches[0];
  // 2) مطابقة تقريبية بالكلمات (تتحمل اسم أب إضافي أو ترتيب مختلف)
  const identTokens = norm.split(' ').filter(Boolean);
  let best=null, bestRatio=0;
  PROJECTS.forEach(p=>{
    const ownerTokens = normalizeAr(p.owner).split(' ').filter(Boolean);
    const shorter = identTokens.length<=ownerTokens.length?identTokens:ownerTokens;
    const longer = identTokens.length<=ownerTokens.length?ownerTokens:identTokens;
    if(shorter.length<2) return; // نتجنب مطابقة كلمة واحدة شائعة
    const matchedCount = shorter.filter(w=>longer.includes(w)).length;
    const ratio = matchedCount/shorter.length;
    if(ratio>bestRatio){ bestRatio=ratio; best=p; }
  });
  if(best && bestRatio>=0.6) return best;
  return null;
}
function parseImportText(rawText){
  // إزالة رموز اتجاه النص المخفية (شائعة بالنصوص المنسوخة من وورد)
  const text = (rawText||'').replace(/[\u200B-\u200F\u202A-\u202E\u2066-\u2069\uFEFF]/g, '');
  const lines = text.split('\n');
  const blocks = [];
  let current = null;
  let boundary = true;
  const leadingNumRe = /^\s*\d+\s*[.\-\)]\s*(.+?)\s*$/;
  const trailingNumRe = /^(.+?)\s*\d+\s*[.\-\)]\s*$/;
  const bulletCharRe = /^\s*(•|-|!|\+|\*(?!\*))\s*(.*)$/;
  const inlineRe = /^\*{0,2}([^:：*]{2,45}?)\*{0,2}\s*[:：]\s*(.+)$/;

  function startBlock(name, firstPoint){
    current = {identifier: name.replace(/\*/g,'').trim(), points: firstPoint?[firstPoint]:[]};
    blocks.push(current);
    boundary = false;
  }

  for(const raw0 of lines){
    const line = raw0.trim();
    if(line===''){ boundary = true; continue; }

    // 1) سطر نقطة (تعداد نقطي) — لكن لو محتواه بصيغة "اسم: نص" نعامله كمشروع جديد بحد ذاته
    const bulletMatch = line.match(bulletCharRe);
    if(bulletMatch){
      const marker = bulletMatch[1];
      const content = bulletMatch[2].trim();
      const inlineInBullet = content.match(inlineRe);
      if(inlineInBullet){
        startBlock(inlineInBullet[1], {text: inlineInBullet[2].replace(/\*/g,'').trim(), color:'default'});
      } else if(current){
        let color = 'default';
        if(marker==='!') color='red';
        else if(marker==='+') color='green';
        const txt = content.replace(/\*/g,'').trim();
        if(txt) current.points.push({text:txt, color});
        boundary = false;
      }
      continue;
    }

    // 2) رأس مرقّم بالبداية: "1. الاسم"
    const leadMatch = line.match(leadingNumRe);
    if(leadMatch){
      startBlock(leadMatch[1]);
      continue;
    }

    // 3) رأس مرقّم بالنهاية: "الاسم 1." (شائع بالنصوص المنسوخة من RTL)
    const trailMatch = line.match(trailingNumRe);
    if(trailMatch && !line.includes(':') && !line.includes('：')){
      startBlock(trailMatch[1]);
      continue;
    }

    // 4) سطر بصيغة "الاسم: نص" مستقل
    const inlineMatch = line.match(inlineRe);
    if(inlineMatch){
      startBlock(inlineMatch[1], {text: inlineMatch[2].replace(/\*/g,'').trim(), color:'default'});
      continue;
    }

    // 5) سطر نص عادي بعد فاصل -> اسم مشروع جديد (الصيغة البسيطة)
    if(boundary || !current){
      startBlock(line.replace(/[:：]\s*$/,''));
    } else {
      // خلاف ذلك: استكمال للنقطة السابقة (سطر ملتف)
      if(current.points.length){
        current.points[current.points.length-1].text += ' ' + line.replace(/\*/g,'').trim();
      } else {
        current.points.push({text: line.replace(/\*/g,'').trim(), color:'default'});
      }
    }
  }
  return blocks.filter(b=>b.identifier && b.points.length>0);
}
document.getElementById('analyzeImportBtn').addEventListener('click', ()=>{
  const text = document.getElementById('importText').value;
  importParsed = parseImportText(text).map(block=>{
    const match = findProjectMatch(block.identifier);
    return {...block, matchedId: match ? match.id : ''};
  });
  const wrap = document.getElementById('importPreview');
  if(importParsed.length===0){
    wrap.innerHTML = '<div class="empty-note">لم يتم العثور على أي مشروع في النص. تأكد من الصيغة.</div>';
    document.getElementById('importApplyWrap').style.display = 'none';
    return;
  }
  const options = PROJECTS.map(p=>`<option value="${p.id}">${esc(p.owner)}</option>`).join('');
  wrap.innerHTML = importParsed.map((b,idx)=>`
    <div class="import-row" data-idx="${idx}">
      <div class="txt"><b>${esc(b.identifier)}</b> <span class="pcount">(${b.points.length} نقطة)</span></div>
      <select data-idx="${idx}">
        <option value="">— تجاهل هذا المشروع —</option>
        <option value="__new__">＋ إنشاء مشروع جديد باسم "${esc(b.identifier)}"</option>
        ${options}
      </select>
    </div>
  `).join('');
  wrap.querySelectorAll('select').forEach((sel,idx)=>{
    sel.value = importParsed[idx].matchedId || '';
    sel.addEventListener('change', e=>{ importParsed[idx].matchedId = e.target.value; });
  });
  document.getElementById('importApplyWrap').style.display = 'block';
});
document.getElementById('applyImportBtn').addEventListener('click', ()=>{
  const date = document.getElementById('importDate').value || todayISO();
  let applied = 0;
  let created = 0;
  importParsed.forEach(b=>{
    if(!b.matchedId || b.points.length===0) return;
    let p;
    if(b.matchedId === '__new__'){
      p = {
        id:'p_'+Date.now().toString(36)+Math.random().toString(36).slice(2,6),
        owner: b.identifier, projNo:'', projId:'', category:'', location:'', contractor:'',
        customFields:[], entries:[], fab:{status:'none', date:'', note:'', applicable:true}
      };
      PROJECTS.push(p);
      created++;
    } else {
      p = getProject(b.matchedId);
    }
    if(!p) return;
    let entry = p.entries.find(e=>e.date===date);
    if(!entry){ entry = {date, points:[]}; p.entries.push(entry); }
    entry.points.push(...b.points);
    applied++;
  });
  saveProjects();
  renderDashboard(); renderSidebarFilters();
  if(applied>0){
    const fromISO=date, toISO=date;
    const groups=buildReportData(fromISO,toISO,false);
    currentReportModel={fromISO,toISO,groups};
    const finalHTML=renderReportHTML(fromISO,toISO,groups,todayISO(),EXTRAS,{editable:false});
    REPORTS.push({id:'r_'+Date.now().toString(36),createdAt:todayISO(),from:fromISO,to:toISO,snapshotHTML:finalHTML,source:'import'});
    saveReports();
    document.getElementById('rFrom').value=fromISO; document.getElementById('rTo').value=toISO;
    showReportPreview(fromISO,toISO,groups);
  }
  document.getElementById('importPanel').classList.remove('show');
  document.getElementById('importText').value = '';
  document.getElementById('importPreview').innerHTML = '';
  document.getElementById('importApplyWrap').style.display = 'none';
  importParsed = [];
  alert(`تم تطبيق التحديثات على ${applied} مشروع${created?` (منها ${created} مشروع جديد تمت إضافته تلقائياً)`:''}.`);
});

/* ================= REPORT EXTRAS (بنود إضافية) ================= */
function renderExtras(){
  const wrap = document.getElementById('extrasList');
  if(EXTRAS.length===0){
    wrap.innerHTML = '<div class="empty-note">لا توجد بنود إضافية. أضف بنداً لتظهر بآخر التقرير (مثل ملاحظات عامة).</div>';
    return;
  }
  wrap.innerHTML = EXTRAS.map((x,idx)=>`
    <div class="extra-row" data-idx="${idx}">
      <div class="extra-top">
        <input class="extra-title" placeholder="عنوان البند (مثال: ملاحظات عامة)" value="${esc(x.title)}">
        <button class="point-del extra-del" title="حذف">✕</button>
      </div>
      <textarea class="extra-text" placeholder="النص...">${esc(x.text)}</textarea>
    </div>
  `).join('');
  wrap.querySelectorAll('.extra-row').forEach(row=>{
    const idx = parseInt(row.dataset.idx);
    row.querySelector('.extra-title').addEventListener('input', e=>{ EXTRAS[idx].title = e.target.value; saveExtras(); });
    row.querySelector('.extra-text').addEventListener('input', e=>{ EXTRAS[idx].text = e.target.value; saveExtras(); });
    row.querySelector('.extra-del').addEventListener('click', ()=>{ EXTRAS.splice(idx,1); saveExtras(); renderExtras(); });
  });
}
document.getElementById('addExtraBtn').addEventListener('click', ()=>{
  EXTRAS.push({id:'x_'+Date.now().toString(36), title:'', text:''});
  saveExtras();
  renderExtras();
});

/* ================= REPORT GENERATION (Excel-style grid) ================= */
function setDefaultReportRange(){
  const to = new Date();
  const from = new Date(); from.setDate(from.getDate()-6);
  document.getElementById('rFrom').value = localISO(from);
  document.getElementById('rTo').value = localISO(to);
}

function buildReportData(fromISO, toISO, onlyUpdated){
  const groups = {};
  PROJECTS.forEach(p=>{
    const cat = catOf(p);
    if(!groups[cat]) groups[cat]=[];
    const pointsInRange = [];
    p.entries.forEach(entry=>{
      if(entry.date>=fromISO && entry.date<=toISO){
        entry.points.forEach(pt=>pointsInRange.push(pt));
      }
    });
    if(onlyUpdated && pointsInRange.length===0) return;
    groups[cat].push({
      id:p.id, owner:p.owner, location:p.location, projId:p.projId, contractor:p.contractor,
      fab: p.fab.status, fabCustomText: p.fab.customText||'', fabApplicable: isFabApplicable(p), points: pointsInRange
    });
  });
  return groups;
}

function renderPointsHTML(points){
  return points.length
    ? `<ul class="rp-points">${points.map(pt=>`<li class="${pt.color==='green'?'g':pt.color==='red'?'r':''}">${esc(pt.text)}</li>`).join('')}</ul>`
    : `<div class="rp-empty-note">لا يوجد تحديث ضمن الفترة المحددة.</div>`;
}

function renderReportHTML(fromISO, toISO, groups, generatedAtISO, extras, opts){
  opts = opts || {};
  const editable = !!opts.editable;
  let body = '';
  let any = false;
  Object.keys(groups).sort((a,b)=>a.localeCompare(b,'ar')).forEach(catName=>{
    const items = groups[catName];
    if(!items || items.length===0) return;
    any = true;
    body += `<div class="rp-cat-title">${esc(catName)} (${items.length})</div>`;
    items.forEach((it,idx)=>{
      const fabCls = it.fab==='submitted'?'submitted':it.fab==='pending'?'pending':it.fab==='custom'?'custom':'none';
      const fabLabel = it.fab==='custom' ? (it.fabCustomText && it.fabCustomText.trim() ? it.fabCustomText.trim() : FAB_META.custom.label) : FAB_META[it.fab].label;
      const fabTagHTML = it.fabApplicable
        ? `<span class="rp-fab-tag ${fabCls}">FAB: ${esc(fabLabel)}</span>`
        : '';
      const notesHTML = renderPointsHTML(it.points);
      const editBtnHTML = editable
        ? `<div class="rp-proj-edit">
             <button type="button" class="rp-edit-btn" data-proj-id="${it.id}" title="تحرير">✏️</button>
             <button type="button" class="rp-remove-btn" data-proj-id="${it.id}" title="حذف هذا المشروع من التقرير الحالي">🗑</button>
           </div>`
        : '';
      body += `
        <div class="rp-proj" ${editable?`data-proj-id="${it.id}"`:''}>
          <div class="rp-proj-side">
            <div class="rp-proj-name">${idx+1}. ${esc(it.owner)}</div>
            <div class="rp-proj-loc">
              ${esc(it.location||'—')}
              ${it.projId?`<span class="lic">${esc(it.projId)}</span>`:''}
              ${it.contractor?`<span class="lic">مقاول: ${esc(it.contractor)}</span>`:''}
            </div>
            ${fabTagHTML}
          </div>
          <div class="rp-proj-notes">${notesHTML}</div>
          ${editBtnHTML}
        </div>`;
    });
  });
  if(!any) body = `<div class="empty-note" style="padding:20px 0;">لا توجد بيانات لعرضها ضمن هذه الفترة والفلاتر.</div>`;

  const validExtras = (extras||[]).filter(x=> (x.title&&x.title.trim()) || (x.text&&x.text.trim()) );
  let extrasHTML = '';
  if(validExtras.length>0){
    extrasHTML += `<div class="rp-cat-title">بنود إضافية</div>`;
    validExtras.forEach(x=>{
      extrasHTML += `<div class="rp-extra">
        ${x.title?`<div class="rp-extra-title">${esc(x.title)}</div>`:''}
        ${x.text?`<div class="rp-extra-text">${esc(x.text)}</div>`:''}
      </div>`;
    });
  }

  return `
    <div class="rp-page">
      <div class="rp-header">
        ${REPORT_ORN_SVG}
        <h1>التقرير الأسبوعي لحالة المشاريع</h1>
        <div class="rp-meta">
          <span class="rp-chip"><b>الفترة</b>من ${fmtDateAr(fromISO)} إلى ${fmtDateAr(toISO)}</span>
          <span class="rp-chip"><b>تاريخ الإصدار</b>${fmtDateAr(generatedAtISO)}</span>
        </div>
      </div>
      ${body}
      ${extrasHTML}
    </div>`;
}

let currentReportModel = null; // {fromISO, toISO, groups}

function findItemInModel(projId){
  if(!currentReportModel) return null;
  for(const k of Object.keys(currentReportModel.groups)){
    const found = currentReportModel.groups[k].find(it=>it.id===projId);
    if(found) return found;
  }
  return null;
}
function removeProjFromReportModel(projId){
  if(!currentReportModel) return;
  Object.keys(currentReportModel.groups).forEach(k=>{
    currentReportModel.groups[k] = currentReportModel.groups[k].filter(it=>it.id!==projId);
  });
}

function renderPointsEditHTML(points){
  const rows = points.map((pt,idx)=>`
    <div class="edit-point-row" data-idx="${idx}">
      <input class="ep-text" value="${esc(pt.text)}">
      <div class="color-select mini">
        <button type="button" class="color-opt ${pt.color==='default'?'sel':''}" data-c="default" title="عادي"><span></span></button>
        <button type="button" class="color-opt ${pt.color==='green'?'sel':''}" data-c="green" title="مهم - أخضر"><span></span></button>
        <button type="button" class="color-opt ${pt.color==='red'?'sel':''}" data-c="red" title="مهم - أحمر"><span></span></button>
      </div>
      <button class="point-del ep-del" title="حذف">✕</button>
    </div>`).join('');
  return `<div class="edit-points-wrap">${rows}</div><button type="button" class="btn small ep-add" style="margin-top:8px;">+ إضافة نقطة</button>`;
}

function attachPointsEditHandlers(notesDiv, item){
  notesDiv.querySelectorAll('.edit-point-row').forEach(row=>{
    const idx = parseInt(row.dataset.idx);
    row.querySelector('.ep-text').addEventListener('input', e=>{ item.points[idx].text = e.target.value; });
    row.querySelectorAll('.color-opt').forEach(btn=>{
      btn.addEventListener('click', ()=>{
        item.points[idx].color = btn.dataset.c;
        row.querySelectorAll('.color-opt').forEach(b=>b.classList.toggle('sel', b===btn));
      });
    });
    row.querySelector('.ep-del').addEventListener('click', ()=>{
      item.points.splice(idx,1);
      notesDiv.innerHTML = renderPointsEditHTML(item.points);
      attachPointsEditHandlers(notesDiv, item);
    });
  });
  notesDiv.querySelector('.ep-add').addEventListener('click', ()=>{
    item.points.push({text:'', color:'default'});
    notesDiv.innerHTML = renderPointsEditHTML(item.points);
    attachPointsEditHandlers(notesDiv, item);
  });
}

function toggleEditProj(projId, btnEl){
  const block = document.querySelector(`.rp-proj[data-proj-id="${projId}"]`);
  if(!block) return;
  const notesDiv = block.querySelector('.rp-proj-notes');
  const item = findItemInModel(projId);
  if(!item) return;
  const editing = block.dataset.editing === '1';
  if(editing){
    // حفظ التغييرات مؤقتاً بالذاكرة وإرجاع العرض الطبيعي
    item.points = item.points.filter(pt=>pt.text && pt.text.trim());
    notesDiv.innerHTML = renderPointsHTML(item.points);
    block.dataset.editing = '0';
    btnEl.textContent = '✏️';
    btnEl.classList.remove('editing');
    btnEl.title = 'تحرير';
  } else {
    notesDiv.innerHTML = renderPointsEditHTML(item.points);
    attachPointsEditHandlers(notesDiv, item);
    block.dataset.editing = '1';
    btnEl.textContent = '✓';
    btnEl.classList.add('editing');
    btnEl.title = 'إنهاء التحرير';
  }
}

function showReportPreview(fromISO, toISO, groups){
  const html = renderReportHTML(fromISO, toISO, groups, todayISO(), EXTRAS, {editable:true});
  document.getElementById('reportPreviewWrap').innerHTML = `
    <div class="report-toolbar">
      <button class="btn primary" id="saveReportBtn">💾 حفظ التعديلات</button>
      <button class="btn" id="printReportBtn">🖨 طباعة</button>
    </div>
    <div class="rp-preview-box">${html}</div>`;
}
function renderPreview(){
  const from = document.getElementById('rFrom').value;
  const to = document.getElementById('rTo').value;
  if(!from || !to){ alert('حدد الفترة أولاً.'); return; }
  const onlyUpdated = document.getElementById('rOnlyUpdated').checked;
  const groups = buildReportData(from, to, onlyUpdated);
  currentReportModel = { fromISO: from, toISO: to, groups };
  showReportPreview(from, to, groups);
}
function buildBlankReportData(){
  const groups = {};
  PROJECTS.forEach(p=>{
    const cat = catOf(p);
    if(!groups[cat]) groups[cat]=[];
    groups[cat].push({
      id:p.id, owner:p.owner, location:p.location, projId:p.projId, contractor:p.contractor,
      fab: p.fab.status, fabCustomText: p.fab.customText||'', fabApplicable: isFabApplicable(p), points: []
    });
  });
  return groups;
}
document.getElementById('newReportBtn').addEventListener('click', ()=>{
  const from = document.getElementById('rFrom').value;
  const to = document.getElementById('rTo').value;
  if(!from || !to){ alert('حدد الفترة أولاً.'); return; }
  if(!confirm('سيتم فتح تقرير جديد فارغ لكل المشاريع (بأسمائها فقط، بدون أي ملاحظات سابقة). عند الحفظ، سيتم استبدال أي ملاحظات كانت موجودة ضمن هذه الفترة بما تكتبه أنت الآن. متابعة؟')) return;
  const groups = buildBlankReportData();
  currentReportModel = { fromISO: from, toISO: to, groups };
  showReportPreview(from, to, groups);
});
document.getElementById('previewBtn').addEventListener('click', renderPreview);

/* ---------- نافذة تحديد تاريخ التقرير ---------- */
let pendingPrint = false;
function updateReportDateSummary(){
  const f=document.getElementById('rdFrom').value, t=document.getElementById('rdTo').value, i=document.getElementById('rdIssue').value;
  document.getElementById('rdSummary').innerHTML =
    `الفترة: من <b>${esc(fmtDateAr(f))}</b> إلى <b>${esc(fmtDateAr(t))}</b><br>تاريخ الإصدار: <b>${esc(fmtDateAr(i))}</b>`;
  const warn=document.getElementById('rdWarn');
  const changed = currentReportModel && (f!==currentReportModel.fromISO || t!==currentReportModel.toISO);
  warn.style.display = changed ? 'block' : 'none';
  warn.textContent = changed ? 'ملاحظة: غيّرت الفترة عن اللي كانت معروضة، فالنقاط الحالية بتنسجّل بالسجل تحت تاريخ «إلى» الجديد.' : '';
}
function openReportDateDialog(shouldPrint){
  if(!currentReportModel){ renderPreview(); if(!currentReportModel) return; }
  pendingPrint = !!shouldPrint;
  document.getElementById('rdFrom').value = currentReportModel.fromISO;
  document.getElementById('rdTo').value = currentReportModel.toISO;
  document.getElementById('rdIssue').value = todayISO();
  document.getElementById('rdError').textContent = '';
  document.getElementById('rdTitle').textContent = shouldPrint ? 'تاريخ التقرير قبل الطباعة' : 'تاريخ التقرير قبل الحفظ';
  document.getElementById('reportDateConfirm').textContent = shouldPrint ? '🖨 متابعة للطباعة' : '💾 حفظ';
  updateReportDateSummary();
  document.getElementById('reportDateOverlay').classList.add('show');
  setTimeout(()=>document.getElementById('rdFrom').focus(), 30);
}
function closeReportDateDialog(){ document.getElementById('reportDateOverlay').classList.remove('show'); }
function confirmReportDateDialog(){
  const from=document.getElementById('rdFrom').value, to=document.getElementById('rdTo').value, issue=document.getElementById('rdIssue').value;
  const err=document.getElementById('rdError');
  if(!from || !to || !issue){ err.textContent='عبّي التواريخ الثلاثة (من، إلى، الإصدار).'; return; }
  if(from > to){ err.textContent='تاريخ «من» لازم يكون قبل تاريخ «إلى» أو مثله.'; return; }
  closeReportDateDialog();
  commitAndLog(pendingPrint, {from, to, issue});
}
['rdFrom','rdTo','rdIssue'].forEach(id=>document.getElementById(id).addEventListener('input', updateReportDateSummary));
document.getElementById('reportDateConfirm').addEventListener('click', confirmReportDateDialog);
document.getElementById('rdCancel').addEventListener('click', closeReportDateDialog);
document.getElementById('rdClose').addEventListener('click', closeReportDateDialog);
document.getElementById('reportDateOverlay').addEventListener('keydown', e=>{
  if(e.key==='Enter'){ e.preventDefault(); confirmReportDateDialog(); }
  else if(e.key==='Escape'){ closeReportDateDialog(); }
});

function fillPrintArea(html){
  const sp = '<tr><td><div class="pa-sp"></div></td></tr>';
  document.getElementById('printArea').innerHTML =
    '<table class="pa-table"><thead>'+sp+'</thead><tbody><tr><td class="pa-body">'+html+'</td></tr></tbody><tfoot>'+sp+'</tfoot></table>';
}

function commitAndLog(shouldPrint, dates){
  if(!currentReportModel){ renderPreview(); if(!currentReportModel) return; }
  const origFrom = currentReportModel.fromISO, origTo = currentReportModel.toISO;
  const fromISO = (dates && dates.from) || origFrom;
  const toISO = (dates && dates.to) || origTo;
  const genDate = (dates && dates.issue) || todayISO();
  const groups = currentReportModel.groups;
  Object.keys(groups).forEach(k=>{
    groups[k].forEach(item=>{
      const p = getProject(item.id);
      if(!p) return;
      // نستبدل السجلات ضمن الفترة اللي كانت معروضة فعلاً، ونسجّل النقاط تحت تاريخ «إلى» المختار
      p.entries = p.entries.filter(e=> !(e.date>=origFrom && e.date<=origTo));
      const cleanPoints = item.points.filter(pt=>pt.text && pt.text.trim())
        .map(pt=>({text:pt.text.trim(), color:pt.color||'default'}));
      if(cleanPoints.length>0){
        p.entries.push({date: toISO, points: cleanPoints});
      }
      item.points = cleanPoints;
    });
  });
  currentReportModel.fromISO = fromISO;
  currentReportModel.toISO = toISO;
  document.getElementById('rFrom').value = fromISO;
  document.getElementById('rTo').value = toISO;
  saveProjects();
  renderDashboard(); renderSidebarFilters();

  const finalHTML = renderReportHTML(fromISO, toISO, groups, genDate, EXTRAS, {editable:false});
  const rec = { id:'r_'+Date.now().toString(36), createdAt: genDate, from:fromISO, to:toISO, snapshotHTML: finalHTML };
  REPORTS.push(rec);
  const saved = saveReports();
  if(!saved){ REPORTS = REPORTS.filter(r=>r!==rec); }

  if(shouldPrint){
    fillPrintArea(finalHTML);
    setTimeout(()=>window.print(), 150);
  }else if(saved){
    alert('تم حفظ التعديلات وتسجيل نسخة في السجل.');
  }
}

document.getElementById('reportPreviewWrap').addEventListener('click', (e)=>{
  const editBtn = e.target.closest('.rp-edit-btn');
  if(editBtn){ toggleEditProj(editBtn.dataset.projId, editBtn); return; }
  const removeBtn = e.target.closest('.rp-remove-btn');
  if(removeBtn){
    if(!confirm('حذف هذا المشروع من هذا التقرير فقط؟ (المشروع نفسه يبقى موجود بالنظام، وبياناته السابقة ما تنحذف — فقط ما يظهر بهذا التقرير)')) return;
    removeProjFromReportModel(removeBtn.dataset.projId);
    const block = removeBtn.closest('.rp-proj');
    if(block) block.remove();
    return;
  }
  if(e.target.id==='saveReportBtn'){ openReportDateDialog(false); return; }
  if(e.target.id==='printReportBtn'){ openReportDateDialog(true); return; }
});

/* ================= HISTORY PAGE ================= */
function renderHistory(){
  const wrap = document.getElementById('historyList');
  if(REPORTS.length===0){ wrap.innerHTML = '<div class="empty-note">لم يتم إنشاء أي تقارير بعد.</div>'; return; }
  const sorted = [...REPORTS].sort((a,b)=> a.createdAt < b.createdAt ? 1 : -1);
  wrap.innerHTML = sorted.map(r=>`
    <div class="hist-row" data-id="${r.id}">
      <div class="hist-main">
        <div class="d1">تقرير بتاريخ ${fmtDateAr(r.createdAt)}</div>
        <div class="d2">الفترة: ${fmtDateAr(r.from)} → ${fmtDateAr(r.to)}</div>
      </div>
      <div style="display:flex;gap:6px;">
        <button class="btn small view-hist">عرض</button>
        <button class="btn small print-hist">طباعة</button>
        <button class="btn small danger-o del-hist">حذف</button>
      </div>
    </div>
  `).join('');
  wrap.querySelectorAll('.view-hist').forEach(btn=>{
    btn.addEventListener('click', (e)=>{
      const id = e.target.closest('.hist-row').dataset.id;
      const r = REPORTS.find(x=>x.id===id);
      if(!r) return;
      document.getElementById('vrTitle').textContent = 'تقرير بتاريخ ' + fmtDateAr(r.createdAt);
      document.getElementById('vrSub').textContent = 'الفترة: ' + fmtDateAr(r.from) + ' → ' + fmtDateAr(r.to);
      document.getElementById('vrBody').innerHTML = r.snapshotHTML;
      document.getElementById('vrPrint').onclick = ()=>{
        fillPrintArea(r.snapshotHTML);
        setTimeout(()=>window.print(), 100);
      };
      document.getElementById('viewReportOverlay').classList.add('show');
    });
  });
  wrap.querySelectorAll('.print-hist').forEach(btn=>{
    btn.addEventListener('click', (e)=>{
      const id = e.target.closest('.hist-row').dataset.id;
      const r = REPORTS.find(x=>x.id===id);
      fillPrintArea(r.snapshotHTML);
      setTimeout(()=>window.print(), 100);
    });
  });
  wrap.querySelectorAll('.del-hist').forEach(btn=>{
    btn.addEventListener('click', (e)=>{
      const id = e.target.closest('.hist-row').dataset.id;
      if(confirm('حذف هذا التقرير من السجل؟')){
        REPORTS = REPORTS.filter(x=>x.id!==id);
        saveReports();
        renderHistory();
      }
    });
  });
}

/* ================= BACKUP / RESTORE ================= */
function downloadJSON(filename, dataObj){
  const blob = new Blob([JSON.stringify(dataObj, null, 2)], {type:'application/json'});
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  setTimeout(()=>URL.revokeObjectURL(url), 1000);
}
document.getElementById('exportBackupBtn').addEventListener('click', ()=>{
  const payload = {
    appBackupVersion: 1,
    exportedAt: todayISO(),
    projects: PROJECTS,
    reports: REPORTS,
    extras: EXTRAS
  };
  downloadJSON(`نسخة-احتياطية-متابعة-المشاريع-${todayISO()}.json`, payload);
});
document.getElementById('importBackupBtn').addEventListener('click', ()=>{
  document.getElementById('importBackupFile').click();
});
document.getElementById('importBackupFile').addEventListener('change', (e)=>{
  const file = e.target.files[0];
  if(!file) return;
  const reader = new FileReader();
  reader.onload = ()=>{
    try{
      const data = JSON.parse(reader.result);
      if(!data || !Array.isArray(data.projects)) throw new Error('صيغة الملف غير صحيحة أو غير مطابقة لنسخة احتياطية معروفة.');
      const count = data.projects.length;
      const ok = confirm(`سيتم استبدال كل البيانات الحالية (كل المشاريع والتقارير والبنود الإضافية) بمحتوى هذا الملف (${count} مشروع). هذا الإجراء لا يمكن التراجع عنه. هل أنت متأكد؟`);
      if(!ok) return;
      PROJECTS = data.projects || [];
      REPORTS = Array.isArray(data.reports) ? data.reports : [];
      EXTRAS = Array.isArray(data.extras) ? data.extras : [];
      saveProjects(); saveReports(); saveExtras();
      renderDashboard(); renderSidebarFilters(); renderExtras();
      alert('تم استرجاع النسخة الاحتياطية بنجاح.');
    }catch(err){
      alert('تعذّر قراءة الملف: '+err.message);
    }
    e.target.value = '';
  };
  reader.readAsText(file, 'utf-8');
});

document.getElementById('vrClose').addEventListener('click', ()=>document.getElementById('viewReportOverlay').classList.remove('show'));
document.getElementById('viewReportOverlay').addEventListener('keydown', e=>{ if(e.key==='Escape') document.getElementById('viewReportOverlay').classList.remove('show'); });

/* ================= INIT ================= */
function startApp(){
  loadAll();
  renderSidebarFilters();
  renderDashboard();
  renderExtras();
  setDefaultReportRange();
}

})();
