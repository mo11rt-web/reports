/* =========================================================
   نظام متابعة المشاريع — المنطق
   ملاحظة التخزين: يستخدم localStorage (تخزين المتصفح المحلي)
   حتى يعمل الحفظ بشكل صحيح سواء فتحت الملف مباشرة أو
   شغّلته كتطبيق ويندوز (Electron). البيانات تبقى محفوظة
   على نفس الجهاز/نفس نسخة التطبيق بين مرات التشغيل.
   ========================================================= */
(function(){

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
  submitted:{label:'تم التقديم', cls:'fab-submitted'}
};
function isFabApplicable(p){ return p.fab.applicable !== false; }
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
let activeCat = 'all';
let activeFab = 'all';

function loadAll(){
  try{
    const raw = localStorage.getItem('pt_projects_v2');
    if(raw){ PROJECTS = JSON.parse(raw); }
    else { PROJECTS = seedProjects(); saveProjects(); }
  }catch(e){
    console.error('load projects failed, reseeding', e);
    PROJECTS = seedProjects(); saveProjects();
  }
  // ترحيل تلقائي: تحويل أكواد التصنيف القديمة (sup/con/mgmt/plan) لنص عربي مقروء
  const LEGACY_CAT_MAP = {sup:'الإشراف', con:'المقاولة', mgmt:'الإدارة', plan:'التخطيط'};
  let migrated = false;
  PROJECTS.forEach(p=>{
    if(LEGACY_CAT_MAP[p.category]){ p.category = LEGACY_CAT_MAP[p.category]; migrated = true; }
  });
  if(migrated) saveProjects();
  try{
    const raw2 = localStorage.getItem('pt_reports_v2');
    if(raw2){ REPORTS = JSON.parse(raw2); }
    else { REPORTS = []; saveReports(); }
  }catch(e){
    REPORTS = []; saveReports();
  }
  try{
    const raw3 = localStorage.getItem('pt_extras_v1');
    if(raw3){ EXTRAS = JSON.parse(raw3); }
    else { EXTRAS = seedExtras(); saveExtras(); }
  }catch(e){
    EXTRAS = seedExtras(); saveExtras();
  }
}
function saveProjects(){
  try{ localStorage.setItem('pt_projects_v2', JSON.stringify(PROJECTS)); }
  catch(e){ console.error('save projects failed', e); alert('تعذّر حفظ البيانات محلياً. تأكد أن المتصفح يسمح بالتخزين المحلي.'); }
}
function saveReports(){
  try{ localStorage.setItem('pt_reports_v2', JSON.stringify(REPORTS)); }
  catch(e){ console.error('save reports failed', e); }
}
function saveExtras(){
  try{ localStorage.setItem('pt_extras_v1', JSON.stringify(EXTRAS)); }
  catch(e){ console.error('save extras failed', e); }
}

/* ================= HELPERS ================= */
function todayISO(){ return new Date().toISOString().slice(0,10); }
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
  const fcounts = {none:0,pending:0,submitted:0,na:0};
  PROJECTS.forEach(p=>{ if(isFabApplicable(p)) fcounts[p.fab.status]++; else fcounts.na++; });
  let fhtml = `<div class="cat-item ${activeFab==='all'?'active':''}" data-fab="all">الكل <span style="margin-inline-start:auto;font-size:11px;">${PROJECTS.length}</span></div>`;
  Object.keys(FAB_META).forEach(k=>{
    fhtml += `<div class="cat-item ${activeFab===k?'active':''}" data-fab="${k}">${FAB_META[k].label} <span style="margin-inline-start:auto;font-size:11px;">${fcounts[k]||0}</span></div>`;
  });
  fhtml += `<div class="cat-item ${activeFab==='na'?'active':''}" data-fab="na">بدون بنك / FAB <span style="margin-inline-start:auto;font-size:11px;">${fcounts.na||0}</span></div>`;
  fabBox.innerHTML = fhtml;
  fabBox.querySelectorAll('.cat-item').forEach(el=>el.addEventListener('click',()=>{ activeFab = el.dataset.fab; renderDashboard(); renderSidebarFilters(); }));
}

/* ================= DASHBOARD ================= */
function renderDashboard(){
  const q = (document.getElementById('searchBox').value||'').trim().toLowerCase();
  let list = PROJECTS.filter(p=>{
    if(activeCat!=='all' && catOf(p)!==activeCat) return false;
    if(activeFab!=='all'){
      if(activeFab==='na'){ if(isFabApplicable(p)) return false; }
      else { if(!isFabApplicable(p) || p.fab.status!==activeFab) return false; }
    }
    if(q){
      const hay = (p.owner+' '+p.location+' '+p.contractor+' '+p.projId).toLowerCase();
      if(!hay.includes(q)) return false;
    }
    return true;
  });
  document.getElementById('dashSub').textContent = `${list.length} من أصل ${PROJECTS.length} مشروع`;
  const wrap = document.getElementById('projList');
  if(list.length===0){ wrap.innerHTML = '<div class="empty-note">لا توجد نتائج مطابقة.</div>'; return; }
  wrap.innerHTML = list.map(p=>{
    const lastEntry = p.entries[p.entries.length-1];
    const lastPoint = lastEntry ? (lastEntry.points[lastEntry.points.length-1]?.text||'') : '';
    const fabBadge = isFabApplicable(p)
      ? `<span class="badge ${FAB_META[p.fab.status].cls}">${FAB_META[p.fab.status].label}</span>`
      : `<span class="badge fab-na">بدون بنك</span>`;
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
      ${fabBadge}
      <div class="proj-actions"><button class="btn small open-btn">فتح</button></div>
    </div>`;
  }).join('');
  wrap.querySelectorAll('.proj-row').forEach(el=>{
    el.addEventListener('click',()=>openProject(el.dataset.id));
  });
}

/* ================= MODAL: PROJECT DETAIL ================= */
function openProject(id){
  currentProjectId = id;
  const p = getProject(id);
  refreshCategoryDatalist();
  document.getElementById('mTitle').textContent = p.owner;
  document.getElementById('mSub').textContent = `${p.projId||'بدون رقم رخصة'} · ${catOf(p)}`;
  switchMTab('info');
  renderInfoTab(p);
  renderLogTab(p);
  renderFieldsTab(p);
  renderFabTab(p);
  document.getElementById('overlay').classList.add('show');
}
function closeModal(){
  document.getElementById('overlay').classList.remove('show');
  currentProjectId = null;
  renderDashboard();
  renderSidebarFilters();
}
function switchMTab(name){
  document.querySelectorAll('.mtab').forEach(b=>b.classList.toggle('active', b.dataset.mtab===name));
  document.querySelectorAll('.mpane').forEach(el=>{ el.style.display = (el.id==='mpane-'+name)?'block':'none'; });
}

function renderInfoTab(p){
  document.getElementById('infoFields').innerHTML = `
    <div class="field"><label>اسم المالك</label><input id="f_owner" value="${esc(p.owner)}"></div>
    <div class="field"><label>اسم المقاول</label><input id="f_contractor" value="${esc(p.contractor)}" placeholder="اكتب اسم المقاول"></div>
    <div class="field"><label>رقم الرخصة</label><input id="f_projId" value="${esc(p.projId)}"></div>
    <div class="field"><label>نوع الخدمة</label><input id="f_category" list="categoryOptions" placeholder="مثال: الإشراف" value="${esc(p.category||'')}"></div>
    <div class="field full"><label>الموقع</label><input id="f_location" value="${esc(p.location)}"></div>
    <div class="field"><label>رقم المشروع الداخلي (اختياري)</label><input id="f_projNo" value="${esc(p.projNo)}"></div>
  `;
  ['f_owner','f_contractor','f_projId','f_category','f_location','f_projNo'].forEach(fid=>{
    document.getElementById(fid).addEventListener('input', ()=>{
      const key = fid.slice(2);
      p[key] = document.getElementById(fid).value;
      saveProjects();
      document.getElementById('mTitle').textContent = p.owner;
      document.getElementById('mSub').textContent = `${p.projId||'بدون رقم رخصة'} · ${catOf(p)}`;
    });
  });
  document.getElementById('deleteProjectBtn').onclick = ()=>{
    if(confirm('هل أنت متأكد من حذف هذا المشروع نهائياً؟')){
      PROJECTS = PROJECTS.filter(x=>x.id!==p.id);
      saveProjects();
      closeModal();
    }
  };
}

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
              <span class="point-text">${esc(pt.text)}</span>
              <button class="point-del" data-date="${entry.date}" data-idx="${idx}" title="حذف">✕</button>
            </li>`).join('')}
        </ul>
      </div>
    `).join('');
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
      row.querySelector('.cf-label').addEventListener('input', e=>{ p.customFields[idx].label = e.target.value; saveProjects(); });
      row.querySelector('.cf-value').addEventListener('input', e=>{ p.customFields[idx].value = e.target.value; saveProjects(); });
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
}
document.getElementById('fabApplicable').addEventListener('change', (e)=>{
  document.getElementById('fabDetailsWrap').style.display = e.target.checked ? 'block' : 'none';
});
document.getElementById('saveFabBtn').addEventListener('click', ()=>{
  const p = getProject(currentProjectId);
  p.fab.applicable = document.getElementById('fabApplicable').checked;
  p.fab.status = document.getElementById('fabStatus').value;
  p.fab.date = document.getElementById('fabDate').value || todayISO();
  p.fab.note = document.getElementById('fabNote').value;
  saveProjects();
  renderDashboard();
  renderSidebarFilters();
  alert('تم حفظ حالة الدفعات.');
});

document.querySelectorAll('.mtab').forEach(b=>b.addEventListener('click',()=>switchMTab(b.dataset.mtab)));
document.getElementById('closeModal').addEventListener('click', closeModal);
document.getElementById('overlay').addEventListener('click', (e)=>{ if(e.target.id==='overlay') closeModal(); });

/* ================= ADD PROJECT ================= */
document.getElementById('addProjectBtn').addEventListener('click', ()=>{
  const owner = prompt('اسم المالك؟');
  if(!owner) return;
  const np = {
    id:'p_'+Date.now().toString(36),
    owner, projNo:'', projId:'', category:'الإشراف', location:'', contractor:'',
    customFields:[], entries:[], fab:{status:'none', date:'', note:''}
  };
  PROJECTS.push(np);
  saveProjects();
  renderDashboard(); renderSidebarFilters();
  openProject(np.id);
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
  document.getElementById('rFrom').value = from.toISOString().slice(0,10);
  document.getElementById('rTo').value = to.toISOString().slice(0,10);
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
      fab: p.fab.status, fabApplicable: isFabApplicable(p), points: pointsInRange
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
      const fabCls = it.fab==='submitted'?'submitted':it.fab==='pending'?'pending':'none';
      const fabTagHTML = it.fabApplicable
        ? `<span class="rp-fab-tag ${fabCls}">FAB: ${esc(FAB_META[it.fab].label)}</span>`
        : '';
      const notesHTML = renderPointsHTML(it.points);
      const editBtnHTML = editable
        ? `<div class="rp-proj-edit"><button type="button" class="rp-edit-btn" data-proj-id="${it.id}" title="تحرير">✏️</button></div>`
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
        <div>
          <h1>التقرير الأسبوعي لحالة المشاريع</h1>
          <div class="range">الفترة: من ${fmtDateAr(fromISO)} إلى ${fmtDateAr(toISO)}</div>
        </div>
        <div class="issued">تاريخ الإصدار: ${fmtDateAr(generatedAtISO)}</div>
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

function renderPreview(){
  const from = document.getElementById('rFrom').value;
  const to = document.getElementById('rTo').value;
  if(!from || !to){ alert('حدد الفترة أولاً.'); return; }
  const onlyUpdated = document.getElementById('rOnlyUpdated').checked;
  const groups = buildReportData(from, to, onlyUpdated);
  currentReportModel = { fromISO: from, toISO: to, groups };
  const html = renderReportHTML(from, to, groups, todayISO(), EXTRAS, {editable:true});
  document.getElementById('reportPreviewWrap').innerHTML = `
    <div class="report-toolbar">
      <button class="btn primary" id="saveReportBtn">💾 حفظ التعديلات</button>
      <button class="btn" id="printReportBtn">🖨 طباعة</button>
    </div>
    <div class="rp-preview-box">${html}</div>`;
}
document.getElementById('previewBtn').addEventListener('click', renderPreview);

function commitAndLog(shouldPrint){
  if(!currentReportModel){ renderPreview(); if(!currentReportModel) return; }
  const {fromISO, toISO, groups} = currentReportModel;
  Object.keys(groups).forEach(k=>{
    groups[k].forEach(item=>{
      const p = getProject(item.id);
      if(!p) return;
      p.entries = p.entries.filter(e=> !(e.date>=fromISO && e.date<=toISO));
      const cleanPoints = item.points.filter(pt=>pt.text && pt.text.trim())
        .map(pt=>({text:pt.text.trim(), color:pt.color||'default'}));
      if(cleanPoints.length>0){
        p.entries.push({date: toISO, points: cleanPoints});
      }
      item.points = cleanPoints;
    });
  });
  saveProjects();
  renderDashboard(); renderSidebarFilters();

  const genDate = todayISO();
  const finalHTML = renderReportHTML(fromISO, toISO, groups, genDate, EXTRAS, {editable:false});
  REPORTS.push({ id:'r_'+Date.now().toString(36), createdAt: genDate, from:fromISO, to:toISO, snapshotHTML: finalHTML });
  saveReports();

  if(shouldPrint){
    document.getElementById('printArea').innerHTML = finalHTML;
    setTimeout(()=>window.print(), 150);
  }else{
    alert('تم حفظ التعديلات وتسجيل نسخة في السجل.');
  }
}

document.getElementById('reportPreviewWrap').addEventListener('click', (e)=>{
  const editBtn = e.target.closest('.rp-edit-btn');
  if(editBtn){ toggleEditProj(editBtn.dataset.projId, editBtn); return; }
  if(e.target.id==='saveReportBtn'){ commitAndLog(false); return; }
  if(e.target.id==='printReportBtn'){ commitAndLog(true); return; }
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
      const w = window.open('', '_blank');
      w.document.write(`<html dir="rtl" lang="ar"><head><meta charset="utf-8"><title>تقرير ${r.createdAt}</title>
        <style>
          body{font-family:Tahoma,Arial,sans-serif;padding:20px;color:#1c1a17;}
          .rp-header{display:flex;justify-content:space-between;align-items:flex-end;border-bottom:2px solid #000;padding-bottom:6px;margin-bottom:8px;}
          .rp-cat-title{font-size:13px;font-weight:700;background:#EFE6D8;padding:5px 10px;margin:14px 0 8px;border-radius:2px;}
          .rp-proj{display:flex;gap:18px;padding:8px 2px 10px;border-bottom:1px solid #e2ddd2;}
          .rp-proj-side{flex:0 0 160px;}
          .rp-proj-name{font-size:13px;font-weight:700;margin-bottom:3px;}
          .rp-proj-loc{font-size:10px;color:#666;line-height:1.5;}
          .rp-proj-loc .lic{display:block;}
          .rp-fab-tag{display:inline-block;margin-top:5px;font-size:9.5px;font-weight:700;padding:2px 8px;border-radius:10px;}
          .rp-fab-tag.none{background:#F5E2DF;color:#A63A31;}
          .rp-fab-tag.pending{background:#F5EBDA;color:#B4802E;}
          .rp-fab-tag.submitted{background:#E4EFE8;color:#2E6B4F;}
          .rp-proj-notes{flex:1;min-width:0;}
          .rp-points{margin:0;padding-inline-start:16px;font-size:13px;line-height:1.65;}
          .g{color:#2E6B4F;font-weight:700;} .r{color:#A63A31;font-weight:700;}
          .rp-empty-note{font-size:11px;color:#999;}
        </style>
        </head><body>${r.snapshotHTML}</body></html>`);
      w.document.close();
    });
  });
  wrap.querySelectorAll('.print-hist').forEach(btn=>{
    btn.addEventListener('click', (e)=>{
      const id = e.target.closest('.hist-row').dataset.id;
      const r = REPORTS.find(x=>x.id===id);
      document.getElementById('printArea').innerHTML = r.snapshotHTML;
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

/* ================= INIT ================= */
(function init(){
  loadAll();
  renderSidebarFilters();
  renderDashboard();
  renderExtras();
  setDefaultReportRange();
})();

})();
