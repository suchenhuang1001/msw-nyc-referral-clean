import { useState, useEffect, useRef } from "react";

const SHEET_ID        = "1BzcRNS88oV1leLiMIcKxSmI3gkqtJtPu9_EYft3mKmY";
const APPS_SCRIPT_URL = "https://script.google.com/macros/s/AKfycbxAwea1k2rKGhIkEW6iRVLXohnFmfJFbMR2Vy83olkGKDkWWHwuXkOybfNh4jcy-BavjQ/exec";
const CSV_URL         = APPS_SCRIPT_URL;
const JOTFORM_URL     = "https://form.jotform.com/260501019250038";
const PER_PAGE        = 6;

const C = {
  bg:"#F7F5F0", surface:"#FFFFFF", border:"#E8E3DA", borderHover:"#C8BFB0",
  text:"#1A1A18", textMid:"#5C5850", textLight:"#9C9588",
  green:"#2D5016", greenMid:"#4A7C2F", greenLight:"#EBF2E4",
  sage:"#7BAF5E", teal:"#2B6E6E", tealLight:"#E4F0F0",
  coral:"#C4624A", coralLight:"#FAEEE9", gold:"#A07830", goldLight:"#F7F0E4",
  purple:"#5C3F8A", purpleLight:"#EDE8F4",
};

// Filter options
const SVC_EN  = ["Individual Therapy","Family Therapy","Couples Counseling","Psychiatry","Group Therapy","Case Management","Crisis Intervention","School-based","Home-based","Victim Assistance","Parent Coaching"];
const SVC_ZH  = ["个体治疗","家庭治疗","伴侣咨询","精神科","团体治疗","个案管理","危机干预","学校服务","居家服务","受害者援助","家长辅导"];
const SVC_MAP = {"个体治疗":"Individual Therapy","家庭治疗":"Family Therapy","伴侣咨询":"Couples Counseling","精神科":"Psychiatry","团体治疗":"Group Therapy","个案管理":"Case Management","危机干预":"Crisis Intervention","学校服务":"School-based","居家服务":"Home-based","受害者援助":"Victim Assistance","家长辅导":"Parent Coaching"};

const LANG_EN  = ["Mandarin","Cantonese","English","Fuzhounese","Spanish"];
const LANG_ZH  = ["普通话","广东话","英文","福州话","西班牙语"];
const LANG_MAP = {"普通话":"Mandarin","广东话":"Cantonese","英文":"English","福州话":"Fuzhounese","西班牙语":"Spanish"};

const INS_EN  = ["Medicaid","Medicare","Commercial","OON/Sliding Scale"];
const INS_ZH  = ["Medicaid","Medicare","商业保险","自费/滑动收费"];
const INS_MAP = {"商业保险":"Commercial","自费/滑动收费":"OON/Sliding Scale","Medicaid":"Medicaid","Medicare":"Medicare"};

const WAIT_STYLE = {
  "Available now":     {bg:"#EBF2E4",text:"#2D5016",label:"Available now"},
  "Less than 1 month": {bg:"#F7F0E4",text:"#A07830",label:"< 1 month wait"},
  "1 to 3 months":     {bg:"#FAEEE9",text:"#C4624A",label:"1–3 month wait"},
  "More than 3 months":{bg:"#F2EDFA",text:"#5C3F8A",label:"> 3 month wait"},
};

const TAG_STYLE = {
  "Individual Therapy":{bg:C.greenLight,text:C.green},
  "Family Therapy":{bg:C.tealLight,text:C.teal},
  "Couples Counseling":{bg:C.tealLight,text:C.teal},
  "Psychiatry":{bg:C.tealLight,text:C.teal},
  "Group Therapy":{bg:C.greenLight,text:C.greenMid},
  "Case Management":{bg:C.goldLight,text:C.gold},
  "Crisis Intervention":{bg:C.coralLight,text:C.coral},
  "School-based":{bg:C.purpleLight,text:C.purple},
  "Home-based":{bg:C.purpleLight,text:C.purple},
  "Victim Assistance":{bg:C.coralLight,text:C.coral},
  "Parent Coaching":{bg:C.goldLight,text:C.gold},
  "Care Coordination":{bg:C.tealLight,text:C.teal},
  "General Services":{bg:"#EDEBE6",text:C.textMid},
};

function parseCSV(text) {
  // Robust parser that handles newlines inside quoted fields
  const rows = [];
  let cur = "", inQ = false, row = [];
  for (let i = 0; i < text.length; i++) {
    const ch = text[i];
    if (ch === '"') {
      if (inQ && text[i+1] === '"') { cur += '"'; i++; } // escaped quote
      else inQ = !inQ;
    } else if (ch === ',' && !inQ) {
      row.push(cur.trim()); cur = "";
    } else if ((ch === '\n') && !inQ) {
      row.push(cur.trim()); cur = "";
      rows.push(row); row = [];
    } else if (ch === '\r') {
      // skip carriage return
    } else {
      cur += ch;
    }
  }
  if (cur || row.length) { row.push(cur.trim()); rows.push(row); }

  const out = [];
  // rows[0] = first header row (Agency Types, Agency, Address...)
  for (let li = 1; li < rows.length; li++) {
    const cols = rows[li];
    const name = cols[1]||"";
    if (!name || name==="Agency" || name==="Agency & Department Name") continue;
    const svcText = cols[3]||"";
    const tags = Object.keys(TAG_STYLE).filter(s=>s!=="General Services"&&svcText.toLowerCase().includes(s.toLowerCase()));
    // Strip URLs out of agency name
    const urlInName = (name.match(/https?:\/\/[^\s]+/) || [])[0] || "";
    const cleanName = name.replace(/https?:\/\/[^\s]+/g, "").replace(/\n+/g," ").trim();
    out.push({
      id: Math.random().toString(36).slice(2),
      sheetRow: li+1,
      orgName: cleanName,
      nameUrl: urlInName,
      address: cols[2]||"",
      serviceText: svcText,
      serviceTags: tags.length>0?tags:["General Services"],
      languages: (cols[4]||"").split(/[\n,\/;·]+/).map(l=>l.trim()).filter(Boolean),
      insurance: cols[5]||"",
      contact:   cols[6]||"",
      referral:  cols[7]||"",
      waitlist:  cols[8]||"",
      notes:     cols[9]||"",
    });
  }
  return out;
}

const FALLBACK = [
  {id:"f1",sheetRow:2,orgName:"Maimonides Medical Center – Psychiatry Dept",address:"920 48th Street, Brooklyn, NY 11219",serviceText:"Individual Therapy, Psychiatry, Family Therapy. LGBTQ+ clinic.",serviceTags:["Individual Therapy","Psychiatry","Family Therapy"],languages:["Mandarin","Cantonese","Spanish","Bengali","Russian","Arabic"],insurance:"Medicaid, Most commercial insurance",referral:"Call 718-283-7800 — ask for Rapid Access Clinic.",contact:"718-283-7800",waitlist:"Less than 1 month",notes:"https://maimo.org/treatments-care/mental-and-behavioral-health/"},
  {id:"f2",sheetRow:3,orgName:"Private Practice – Xiaofeng W. Koswatta",address:"329 E 62nd Street, New York, NY 10065",serviceText:"Individual Therapy (Psychodynamic). Adults, young adults, teenagers.",serviceTags:["Individual Therapy"],languages:["Mandarin","English"],insurance:"OON/Sliding Scale",referral:"Email or call to schedule.",contact:"Xiaofengk100@gmail.com · (917) 475-6638",waitlist:"Available now",notes:""},
  {id:"f3",sheetRow:4,orgName:"CARES / Hand In Hand",address:"465 Grand Street, New York, NY 10002",serviceText:"Case Management, Individual Therapy, Parent Coaching. Autism & intellectual disability.",serviceTags:["Case Management","Individual Therapy","Parent Coaching"],languages:["Mandarin","Cantonese","Spanish"],insurance:"Medicaid (excl. Health First/Fidelis), OPWDD",referral:"Case mgmt: 212-420-1970 x176. Therapy: therapyintake@caresnys.org",contact:"212-420-1970",waitlist:"Less than 1 month",notes:"https://caresnys.org/"},
  {id:"f4",sheetRow:5,orgName:"Phronetic Psychotherapy 行知心理咨询",address:"Online (NY & NJ)",serviceText:"Individual Therapy, Group Therapy, Couples Counseling, Family Therapy. EMDR.",serviceTags:["Individual Therapy","Group Therapy","Couples Counseling","Family Therapy"],languages:["Mandarin","English"],insurance:"Major Commercial (Aetna/BCBS/Cigna)",referral:"Book via website.",contact:"phronetic-psychotherapy.org",waitlist:"Available now",notes:""},
  {id:"f5",sheetRow:6,orgName:"Greater Philadelphia Health Action – Chinatown",address:"432 N. 6th St, Philadelphia, PA 19123",serviceText:"Individual Therapy, Case Management. Integrated primary care behavioral health.",serviceTags:["Individual Therapy","Case Management"],languages:["Mandarin","Cantonese"],insurance:"Medicaid, Medicare, Commercial",referral:"Contact Snow Jiang, LCSW.",contact:"njiang@gphainc.org",waitlist:"Less than 1 month",notes:""},
  {id:"f6",sheetRow:7,orgName:"Private Practice – Yunshan Gao, LCSW",address:"Online (NY & NJ)",serviceText:"Individual Therapy, Couples Counseling.",serviceTags:["Individual Therapy","Couples Counseling"],languages:["Mandarin","English"],insurance:"OON/Sliding Scale",referral:"",contact:"",waitlist:"Available now",notes:""},
  {id:"f7",sheetRow:8,orgName:"Point Psychotherapy LCSW",address:"Online (NY, PA, WI, RI)",serviceText:"Individual Therapy, Couples Counseling. CBT. College students & professionals.",serviceTags:["Individual Therapy","Couples Counseling"],languages:["Mandarin","English"],insurance:"Major Commercial (Aetna, BCBS, Cigna)",referral:"Visit website.",contact:"www.pointpsychotherapy.com",waitlist:"Available now",notes:""},
];

function extractLinks(text) {
  if (!text) return {phones:[],emails:[],urls:[]};
  const phones=[...new Set([...(text.matchAll(/(\(?\d{3}\)?[\s\-.]?\d{3}[\s\-.]?\d{4})/g))].map(m=>m[1]))];
  const emails=[...new Set([...(text.matchAll(/([a-zA-Z0-9._%+\-]+@[a-zA-Z0-9.\-]+\.[a-zA-Z]{2,})/g))].map(m=>m[1]))];
  const urls=[...new Set([...(text.matchAll(/https?:\/\/[^\s,)]+/g))].map(m=>m[0]))];
  const domains=[...new Set([...(text.matchAll(/(?<![/@])\b([\w\-]+\.(?:org|com|net|edu)(?:\/\S*)?)\b/g))].map(m=>m[1]))].filter(d=>!emails.some(e=>e.includes(d))&&!urls.some(u=>u.includes(d)));
  return {phones,emails,urls:[...urls,...domains.map(d=>`https://${d}`)]};
}

async function aiSearch(query, resources) {
  const catalog = resources.map((r,i)=>`[${i}] ${r.orgName} | ${r.serviceText} | Languages: ${r.languages.join(",")} | Insurance: ${r.insurance} | Waitlist: ${r.waitlist}`).join("\n");
  const prompt = `You help NYC Chinese-speaking social workers find referral agencies.\nClient need: "${query}"\n\nAgencies:\n${catalog}\n\nReturn ONLY a JSON array of index numbers (best matches first, max 6). Consider language, service, insurance, waitlist. Return [] if nothing fits.`;
  try {
    const res = await fetch("https://api.anthropic.com/v1/messages",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({model:"claude-sonnet-4-20250514",max_tokens:200,messages:[{role:"user",content:prompt}]})});
    const data = await res.json();
    return JSON.parse((data.content?.[0]?.text||"[]").replace(/```json|```/g,"").trim());
  } catch { return null; }
}

// ── Components ──────────────────────────────

function Tag({label}) {
  const s=TAG_STYLE[label]||TAG_STYLE["General Services"];
  return <span style={{background:s.bg,color:s.text,borderRadius:4,padding:"3px 9px",fontSize:10,fontWeight:600,letterSpacing:0.5,display:"inline-block",margin:"2px 3px 2px 0",fontFamily:"'DM Sans',sans-serif",textTransform:"uppercase"}}>{label}</span>;
}

function WaitBadge({w}) {
  const s=WAIT_STYLE[w]; if(!s) return null;
  return <span style={{background:s.bg,color:s.text,borderRadius:20,padding:"3px 10px",fontSize:10,fontWeight:700,fontFamily:"'DM Sans',sans-serif",display:"inline-flex",alignItems:"center",gap:4,letterSpacing:0.3}}>
    <span style={{width:5,height:5,borderRadius:"50%",background:s.text,display:"inline-block"}}/>
    {s.label}
  </span>;
}

// 3 distinct pill styles for each filter type
function SvcPill({label,active,onClick}) {
  return <button onClick={onClick} style={{
    border:`1.5px solid ${active?C.green:C.border}`,
    background:active?C.green:C.surface,
    color:active?"#fff":C.textMid,
    borderRadius:6, padding:"5px 13px", fontSize:12, fontWeight:500,
    cursor:"pointer", fontFamily:"'DM Sans',sans-serif", transition:"all 0.15s",
    marginBottom:6, whiteSpace:"nowrap",
    boxShadow: active?"0 1px 4px rgba(45,80,22,0.25)":"none",
  }}>{active && <span style={{marginRight:5,fontSize:10}}>✓</span>}{label}</button>;
}

function LangPill({label,active,onClick}) {
  return <button onClick={onClick} style={{
    border:`1.5px solid ${active?C.teal:C.border}`,
    background:active?C.teal:C.surface,
    color:active?"#fff":C.textMid,
    borderRadius:100, padding:"5px 14px", fontSize:12, fontWeight:active?600:400,
    cursor:"pointer", fontFamily:"'DM Sans',sans-serif", transition:"all 0.15s",
    marginBottom:6, whiteSpace:"nowrap",
  }}>{active && <span style={{marginRight:5,fontSize:10}}>✓</span>}{label}</button>;
}

function InsPill({label,active,onClick}) {
  return <button onClick={onClick} style={{
    border:`1.5px solid ${active?C.gold:"#DDD"}`,
    background:active?C.gold:C.surface,
    color:active?"#fff":C.textMid,
    borderRadius:4, padding:"5px 13px", fontSize:12, fontWeight:active?600:400,
    cursor:"pointer", fontFamily:"'DM Sans',sans-serif", transition:"all 0.15s",
    marginBottom:6, whiteSpace:"nowrap", letterSpacing:0.2,
  }}>{active && <span style={{marginRight:5,fontSize:10}}>✓</span>}{label}</button>;
}

function DetailRow({label,value}) {
  if(!value) return null;
  return <div style={{marginBottom:14}}>
    <div style={{fontSize:10,fontWeight:600,letterSpacing:1.2,textTransform:"uppercase",color:C.textLight,marginBottom:3,fontFamily:"'DM Sans',sans-serif"}}>{label}</div>
    <div style={{fontSize:13,color:C.text,lineHeight:1.65,fontFamily:"'DM Sans',sans-serif",whiteSpace:"pre-line",wordBreak:"break-word",overflowWrap:"anywhere"}}>{value}</div>
  </div>;
}

function LinkChip({href,bg,color,icon,label}) {
  return <a href={href} target={href.startsWith("mailto")||href.startsWith("tel")?"_self":"_blank"} rel="noreferrer" onClick={e=>e.stopPropagation()}
    style={{display:"inline-flex",alignItems:"center",gap:5,background:bg,color,borderRadius:6,padding:"4px 11px",fontSize:12,fontWeight:600,textDecoration:"none",fontFamily:"'DM Sans',sans-serif"}}>
    {icon}{label}
  </a>;
}

function ResourceCard({r,highlight}) {
  const [open,setOpen]=useState(false);
  const links=extractLinks(r.contact||r.referral||"");
  const hasLinks=links.phones.length>0||links.emails.length>0||links.urls.length>0;

  return <div style={{background:C.surface,borderRadius:12,padding:"20px 24px",marginBottom:10,border:`1px solid ${highlight?C.green:open?C.borderHover:C.border}`,boxShadow:highlight?`0 0 0 3px ${C.greenLight}`:open?"0 4px 20px rgba(0,0,0,0.07)":"0 1px 4px rgba(0,0,0,0.03)",transition:"border-color 0.2s,box-shadow 0.2s"}}>

    {/* Header */}
    <div onClick={()=>setOpen(o=>!o)} style={{cursor:"pointer",display:"flex",justifyContent:"space-between",alignItems:"flex-start",gap:14}}>
      <div style={{flex:1,minWidth:0}}>
        <div style={{display:"flex",alignItems:"center",gap:8,flexWrap:"wrap",marginBottom:4}}>
          <span style={{fontFamily:"'DM Serif Display',Georgia,serif",fontSize:17,color:C.text,lineHeight:1.3,wordBreak:"break-word",overflowWrap:"anywhere"}}>{r.orgName}</span>
          {r.waitlist&&<WaitBadge w={r.waitlist}/>}
        </div>
        {r.address&&<div style={{fontSize:12,color:C.textLight,marginBottom:9,fontFamily:"'DM Sans',sans-serif"}}>📍 {r.address}</div>}
        <div style={{marginBottom:5}}>{r.serviceTags.map(s=><Tag key={s} label={s}/>)}</div>
        {r.languages.length>0&&<div style={{fontSize:12,color:C.textLight,fontFamily:"'DM Sans',sans-serif",marginTop:3}}>{r.languages.join(" · ")}</div>}
      </div>
      <div style={{width:26,height:26,borderRadius:"50%",border:`1px solid ${C.border}`,display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0,transition:"transform 0.2s",transform:open?"rotate(180deg)":"rotate(0deg)"}}>
        <svg width="13" height="13" viewBox="0 0 24 24" fill="none"><path d="M6 9l6 6 6-6" stroke={C.textLight} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
      </div>
    </div>

    {/* Quick links */}
    {(()=>{const allUrls=[...new Set([...(r.nameUrl?[r.nameUrl]:[]),...links.urls])];const hasAny=links.phones.length>0||links.emails.length>0||allUrls.length>0;if(!hasAny)return null;return(
    <div style={{marginTop:11,paddingTop:11,borderTop:`1px solid ${C.border}`,display:"flex",alignItems:"center",flexWrap:"wrap",gap:6}}>
      <span style={{fontSize:10,fontWeight:600,color:C.textLight,letterSpacing:0.8,textTransform:"uppercase",fontFamily:"'DM Sans',sans-serif"}}>Refer now:</span>
      {links.phones.map(p=><LinkChip key={p} href={`tel:${p.replace(/\D/g,"")}`} bg={C.greenLight} color={C.green} label={`Call ${p}`} icon={<svg width="11" height="11" viewBox="0 0 24 24" fill="none"><path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07A19.5 19.5 0 013.07 9.8 19.79 19.79 0 01.42 1.18 2 2 0 012.4 0h3a2 2 0 012 1.72c.127.96.361 1.903.7 2.81a2 2 0 01-.45 2.11L6.91 7.91a16 16 0 006.13 6.13l1.27-1.27a2 2 0 012.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0122 16.92z" stroke={C.green} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>}/>)}
      {links.emails.map(e=><LinkChip key={e} href={`mailto:${e}`} bg={C.tealLight} color={C.teal} label="Email" icon={<svg width="11" height="11" viewBox="0 0 24 24" fill="none"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" stroke={C.teal} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/><polyline points="22,6 12,13 2,6" stroke={C.teal} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>}/>)}
      {allUrls.map(u=><LinkChip key={u} href={u.startsWith("http")?u:`https://${u}`} bg="#EDEBE6" color={C.textMid} label="Website" icon={<svg width="11" height="11" viewBox="0 0 24 24" fill="none"><path d="M18 13v6a2 2 0 01-2 2H5a2 2 0 01-2-2V8a2 2 0 012-2h6" stroke={C.textMid} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/><polyline points="15,3 21,3 21,9" stroke={C.textMid} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/><line x1="10" y1="14" x2="21" y2="3" stroke={C.textMid} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>}/>)}
    </div>);})()}

    {/* Expanded details */}
    {open&&<div style={{marginTop:14,paddingTop:14,borderTop:`1px solid ${C.border}`,display:"grid",gridTemplateColumns:"1fr 1fr",gap:"0 24px"}}>
      <div style={{gridColumn:"1/-1"}}><DetailRow label="Services & Specialization" value={r.serviceText}/></div>
      <DetailRow label="Insurance & Eligibility" value={r.insurance}/>
      <DetailRow label="Referral Contact" value={r.contact}/>
      <div style={{gridColumn:"1/-1"}}><DetailRow label="How to Refer" value={r.referral}/></div>
      {r.notes&&<div style={{gridColumn:"1/-1"}}><DetailRow label="Notes" value={r.notes}/></div>}
      {r.nameUrl&&<div style={{gridColumn:"1/-1"}}><DetailRow label="Website" value={r.nameUrl}/></div>}
      <div style={{gridColumn:"1/-1",marginTop:6,paddingTop:10,borderTop:`1px solid ${C.border}`}}>
        <a href={`https://docs.google.com/spreadsheets/d/${SHEET_ID}`} target="_blank" rel="noreferrer"
          style={{fontSize:12,color:C.textLight,fontFamily:"'DM Sans',sans-serif",textDecoration:"underline"}}>
          Request to edit in Google Sheets →
        </a>
      </div>
    </div>}
  </div>;
}

// ── Main App ────────────────────────────────

export default function App() {
  const [lang,setLang]         = useState("en");
  const [resources,setResources] = useState([]);
  const [loading,setLoading]   = useState(true);
  const [isPreview,setIsPreview] = useState(false);
  const [lastUpdated,setLastUpdated] = useState(null);
  const [search,setSearch]     = useState("");
  const [svcFilters,setSvcFilters]   = useState(new Set());
  const [lgFilters,setLgFilters]     = useState(new Set());
  const [insFilters,setInsFilters]   = useState(new Set());
  const [aiResults,setAiResults] = useState(null);
  const [aiLoading,setAiLoading] = useState(false);
  const [aiQuery,setAiQuery]   = useState("");
  const [page,setPage]         = useState(1);
  const timer = useRef(null);

  const t = lang==="en" ? {
    community:"MSW@NYC Chinese Community",
    heroTitle1:"Chinese-Speaking Social Work Community", heroTitle2:"Referral Directory",
    heroDesc:"A shared resource built by NYC social workers. Find agencies, check eligibility, and make warm referrals — all in one place.",
    addAgency:"+ Add Agency",
    searchPlaceholder:"Try: 'elderly Cantonese speaker with Medicaid' or 'uninsured family needs therapy'…",
    aiSearching:"Finding best matches…", aiResultsFor:q=>`AI results for "${q}"`,
    loading:"Loading from Google Sheets…", refresh:"Refresh",
    previewMode:"Preview mode — Google Sheet is private",
    clearFilters:"Clear all", noResults:"No agencies match", noResultsSub:"Try different keywords or clear a filter.",
    agencyCount:n=>`${n} ${n===1?"agency":"agencies"}`,
    svLabel:"Service Type", lgLabel:"Language", insLabel:"Insurance",
    prev:"← Previous", next:"Next →", pageOf:(p,t)=>`Page ${p} of ${t}`,
    missingTitle:"Is your agency missing?",
    missingDesc:"Submit via JotForm — it syncs directly to the directory.",
    jotformFull:"Submit on JotForm ↗",
  } : {
    community:"MSW@NYC 中文社工社区",
    heroTitle1:"中文社工社区", heroTitle2:"转介资源目录",
    heroDesc:"由纽约市社工共同维护的转介资源库。查找机构、了解申请资格，方便为客户转介。",
    addAgency:"+ 添加机构",
    searchPlaceholder:"试试：「不会英文的老人有Medicaid」或「无证家庭需要治疗」……",
    aiSearching:"正在匹配最合适的机构……", aiResultsFor:q=>`"${q}" 的智能搜索结果`,
    loading:"正在加载数据……", refresh:"刷新",
    previewMode:"预览模式 — Google Sheet 为私有",
    clearFilters:"清除筛选", noResults:"暂无匹配机构", noResultsSub:"请尝试其他关键词或清除筛选。",
    agencyCount:n=>`${n} 个机构`,
    svLabel:"服务类型", lgLabel:"语言", insLabel:"保险",
    prev:"← 上一页", next:"下一页 →", pageOf:(p,t)=>`第 ${p} / ${t} 页`,
    missingTitle:"你的机构未收录？",
    missingDesc:"通过 JotForm 提交，自动同步到目录。",
    jotformFull:"在 JotForm 上提交 ↗",
  };

  const svOpts  = lang==="en"?SVC_EN:SVC_ZH;
  const lgOpts  = lang==="en"?LANG_EN:LANG_ZH;
  const insOpts = lang==="en"?INS_EN:INS_ZH;

  const toEnSvc  = v => lang==="en"?v:(SVC_MAP[v]||v);
  const toEnLang = v => lang==="en"?v:(LANG_MAP[v]||v);
  const toEnIns  = v => lang==="en"?v:(INS_MAP[v]||v);

  const toggleSet = (setter, val) => {
    setter(prev => {
      const next = new Set(prev);
      next.has(val) ? next.delete(val) : next.add(val);
      return next;
    });
    setPage(1);
  };

  const loadData = async () => {
    setLoading(true);
    try {
      const res=await fetch(CSV_URL); if(!res.ok) throw new Error();
      const text=await res.text(); const rows=parseCSV(text);
      if(rows.length===0) throw new Error();
      setResources(rows); setIsPreview(false); setLastUpdated(new Date());
    } catch { setResources(FALLBACK); setIsPreview(true); }
    finally { setLoading(false); }
  };
  useEffect(()=>{loadData();},[]);

  // Reset page when filters change
  useEffect(()=>{ setPage(1); },[search,svcFilters,lgFilters,insFilters]);

  // AI search debounce
  useEffect(()=>{
    if(timer.current) clearTimeout(timer.current);
    if(!search.trim()||search.trim().length<5){setAiResults(null);setAiQuery("");return;}
    timer.current=setTimeout(async()=>{
      setAiLoading(true);
      const idxs=await aiSearch(search,resources);
      setAiResults(idxs); setAiQuery(search); setAiLoading(false);
    },900);
    return()=>clearTimeout(timer.current);
  },[search,resources]);

  const filtered = (() => {
    if (aiResults!==null) return aiResults.map(i=>resources[i]).filter(Boolean);
    return resources.filter(r=>{
      if(svcFilters.size>0 && ![...svcFilters].some(f=>r.serviceTags.some(t=>t.toLowerCase().includes(toEnSvc(f).toLowerCase())))) return false;
      if(lgFilters.size>0  && ![...lgFilters].some(f=>r.languages.some(l=>l.toLowerCase().includes(toEnLang(f).toLowerCase())))) return false;
      if(insFilters.size>0 && ![...insFilters].some(f=>r.insurance.toLowerCase().includes(toEnIns(f).toLowerCase()))) return false;
      if(search&&!aiResults){const q=search.toLowerCase();if(![r.orgName,r.serviceText,r.insurance,r.referral,r.notes,r.languages.join(" ")].join(" ").toLowerCase().includes(q)) return false;}
      return true;
    });
  })();

  const totalPages = Math.max(1, Math.ceil(filtered.length / PER_PAGE));
  const paginated  = filtered.slice((page-1)*PER_PAGE, page*PER_PAGE);
  const anyFilter  = svcFilters.size>0||lgFilters.size>0||insFilters.size>0||search;

  const clearAll = () => {
    setSearch(""); setAiResults(null); setAiQuery("");
    setSvcFilters(new Set()); setLgFilters(new Set()); setInsFilters(new Set());
    setPage(1);
  };

  const timeAgo = lastUpdated ? (
    (new Date()-lastUpdated)<60000?"Just updated":
    (new Date()-lastUpdated)<3600000?`Updated ${Math.floor((new Date()-lastUpdated)/60000)}m ago`:
    `Updated ${Math.floor((new Date()-lastUpdated)/3600000)}h ago`
  ) : "";

  return <div style={{minHeight:"100vh",background:C.bg}}>
    <style>{`@import url('https://fonts.googleapis.com/css2?family=DM+Serif+Display&family=DM+Sans:wght@300;400;500;600&display=swap');*{box-sizing:border-box;}input::placeholder{color:${C.textLight};}@keyframes spin{from{transform:rotate(0deg)}to{transform:rotate(360deg)}}`}</style>

    {/* NAV */}
    <nav style={{background:C.surface,borderBottom:`1px solid ${C.border}`,padding:"0 24px",display:"flex",alignItems:"center",justifyContent:"space-between",height:54,position:"sticky",top:0,zIndex:100}}>
      <div style={{fontFamily:"'DM Serif Display',Georgia,serif",fontSize:16,color:C.text}}>{t.community}</div>
      <div style={{display:"flex",gap:7,alignItems:"center"}}>
        {["en","zh"].map(l=><button key={l} onClick={()=>setLang(l)} style={{background:lang===l?C.green:"transparent",color:lang===l?"#fff":C.textMid,border:`1px solid ${lang===l?C.green:C.border}`,borderRadius:6,padding:"5px 11px",fontSize:12,fontWeight:600,cursor:"pointer",fontFamily:"'DM Sans',sans-serif"}}>{l==="en"?"EN":"中文"}</button>)}
      </div>
    </nav>

    {/* HERO */}
    <div style={{background:C.surface,borderBottom:`1px solid ${C.border}`,padding:"38px 24px 32px"}}>
      <div style={{maxWidth:720,margin:"0 auto"}}>
        <div style={{fontSize:10,fontWeight:600,letterSpacing:2,textTransform:"uppercase",color:C.sage,marginBottom:10}}>{t.community}</div>
        <h1 style={{fontFamily:"'DM Serif Display',Georgia,serif",fontSize:34,color:C.text,margin:"0 0 10px",lineHeight:1.15,fontWeight:400}}>
          {t.heroTitle1}<br/><span style={{color:C.greenMid}}>{t.heroTitle2}</span>
        </h1>
        <p style={{fontSize:14,color:C.textMid,lineHeight:1.7,margin:"0 0 18px",maxWidth:500}}>{t.heroDesc}</p>
        <div style={{display:"flex",alignItems:"center",gap:8}}>
          <span style={{width:6,height:6,borderRadius:"50%",background:C.sage,display:"inline-block"}}/>
          <span style={{fontSize:12,color:C.textLight}}>{isPreview?t.previewMode:timeAgo}</span>
          <button onClick={loadData} style={{background:"none",border:"none",color:C.green,fontSize:12,fontWeight:500,cursor:"pointer",padding:"0 4px",fontFamily:"'DM Sans',sans-serif"}}>{t.refresh}</button>
        </div>
      </div>
    </div>

    {/* MAIN */}
    <div style={{maxWidth:780,margin:"0 auto",padding:"26px 16px 60px"}}>

      {/* Search + Filters — card */}
      <div style={{background:C.surface,border:`1px solid ${C.border}`,borderRadius:14,padding:"20px 20px 14px",marginBottom:20,boxShadow:"0 2px 8px rgba(0,0,0,0.04)"}}>
        <div style={{display:"flex",gap:10,marginBottom:12,alignItems:"center"}}>
          <div style={{position:"relative",flex:1}}>
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" style={{position:"absolute",left:13,top:"50%",transform:"translateY(-50%)",pointerEvents:"none"}}><circle cx="11" cy="11" r="8" stroke={C.textLight} strokeWidth="2"/><path d="M21 21l-4.35-4.35" stroke={C.textLight} strokeWidth="2" strokeLinecap="round"/></svg>
            <input value={search} onChange={e=>{setSearch(e.target.value);setAiResults(null);}} placeholder={t.searchPlaceholder}
              style={{width:"100%",border:`1px solid ${aiResults!==null?C.green:C.border}`,borderRadius:8,padding:"12px 40px",fontSize:14,color:C.text,background:C.surface,outline:"none",fontFamily:"'DM Sans',sans-serif",boxShadow:"0 1px 3px rgba(0,0,0,0.04)"}}
              onFocus={e=>e.target.style.borderColor=C.green} onBlur={e=>e.target.style.borderColor=aiResults!==null?C.green:C.border}
            />
            {aiLoading&&<div style={{position:"absolute",right:12,top:"50%",transform:"translateY(-50%)"}}><svg width="15" height="15" viewBox="0 0 24 24" fill="none" style={{animation:"spin 1s linear infinite"}}><circle cx="12" cy="12" r="10" stroke={C.border} strokeWidth="3"/><path d="M22 12a10 10 0 0 0-10-10" stroke={C.green} strokeWidth="3" strokeLinecap="round"/></svg></div>}
            {search&&!aiLoading&&<button onClick={()=>{setSearch("");setAiResults(null);setAiQuery("");}} style={{position:"absolute",right:10,top:"50%",transform:"translateY(-50%)",background:"none",border:"none",color:C.textLight,cursor:"pointer",fontSize:18,lineHeight:1,padding:2}}>×</button>}
          </div>
          <a href={JOTFORM_URL} target="_blank" rel="noreferrer" style={{background:C.green,color:"#fff",borderRadius:8,padding:"12px 18px",fontSize:13,fontWeight:600,cursor:"pointer",fontFamily:"'DM Sans',sans-serif",textDecoration:"none",whiteSpace:"nowrap",flexShrink:0}}>{t.addAgency}</a>
        </div>
        {aiLoading&&<div style={{fontSize:12,color:C.sage,marginBottom:8,display:"flex",alignItems:"center",gap:5}}><span style={{width:5,height:5,borderRadius:"50%",background:C.sage,display:"inline-block"}}/>{t.aiSearching}</div>}
        {aiResults!==null&&!aiLoading&&<div style={{fontSize:12,color:C.green,fontWeight:500,marginBottom:8}}>✦ {t.aiResultsFor(aiQuery)}</div>}

        {/* Service Type pills */}
        <div style={{marginBottom:10}}>
          <div style={{fontSize:10,fontWeight:600,letterSpacing:1,textTransform:"uppercase",color:C.textLight,marginBottom:6,fontFamily:"'DM Sans',sans-serif"}}>{t.svLabel}</div>
          <div style={{display:"flex",gap:6,flexWrap:"wrap"}}>
            {svOpts.map(f=><SvcPill key={f} label={f} active={svcFilters.has(f)} onClick={()=>toggleSet(setSvcFilters,f)}/>)}
          </div>
        </div>

        {/* Language pills */}
        <div style={{marginBottom:10}}>
          <div style={{fontSize:10,fontWeight:600,letterSpacing:1,textTransform:"uppercase",color:C.textLight,marginBottom:6,fontFamily:"'DM Sans',sans-serif"}}>{t.lgLabel}</div>
          <div style={{display:"flex",gap:6,flexWrap:"wrap"}}>
            {lgOpts.map(f=><LangPill key={f} label={f} active={lgFilters.has(f)} onClick={()=>toggleSet(setLgFilters,f)}/>)}
          </div>
        </div>

        {/* Insurance pills */}
        <div style={{marginBottom:4}}>
          <div style={{fontSize:10,fontWeight:600,letterSpacing:1,textTransform:"uppercase",color:C.textLight,marginBottom:6,fontFamily:"'DM Sans',sans-serif"}}>{t.insLabel}</div>
          <div style={{display:"flex",gap:6,flexWrap:"wrap"}}>
            {insOpts.map(f=><InsPill key={f} label={f} active={insFilters.has(f)} onClick={()=>toggleSet(setInsFilters,f)}/>)}
          </div>
        </div>
      </div>
      </div>

      {/* Results bar */}
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:12}}>
        <span style={{fontSize:13,color:C.textLight}}>
          {loading?t.loading:t.agencyCount(filtered.length)}
          {anyFilter&&!loading&&<button onClick={clearAll} style={{background:"none",border:"none",color:C.green,fontSize:12,fontWeight:500,cursor:"pointer",marginLeft:10,fontFamily:"'DM Sans',sans-serif"}}>{t.clearFilters}</button>}
        </span>
        {!loading&&totalPages>1&&<span style={{fontSize:12,color:C.textLight,fontFamily:"'DM Sans',sans-serif"}}>{t.pageOf(page,totalPages)}</span>}
      </div>

      {loading&&<div style={{textAlign:"center",padding:"70px 20px",color:C.textLight,fontSize:13}}>{t.loading}</div>}
      {!loading&&paginated.map((r,i)=><ResourceCard key={r.id} r={r} highlight={aiResults!==null&&page===1&&i===0}/>)}
      {!loading&&filtered.length===0&&<div style={{textAlign:"center",padding:"60px 20px"}}>
        <div style={{fontFamily:"'DM Serif Display',Georgia,serif",fontSize:20,color:C.textMid,marginBottom:8}}>{t.noResults}</div>
        <div style={{fontSize:13,color:C.textLight,marginBottom:20}}>{t.noResultsSub}</div>
        <button onClick={clearAll} style={{background:C.green,color:"#fff",border:"none",borderRadius:8,padding:"9px 22px",fontSize:13,cursor:"pointer",fontFamily:"'DM Sans',sans-serif"}}>{t.clearFilters}</button>
      </div>}

      {/* Pagination */}
      {!loading&&totalPages>1&&<div style={{display:"flex",justifyContent:"center",alignItems:"center",gap:12,marginTop:24}}>
        <button onClick={()=>setPage(p=>Math.max(1,p-1))} disabled={page===1}
          style={{background:page===1?C.bg:C.surface,border:`1px solid ${C.border}`,borderRadius:7,padding:"7px 16px",fontSize:13,color:page===1?C.textLight:C.text,cursor:page===1?"default":"pointer",fontFamily:"'DM Sans',sans-serif"}}>
          {t.prev}
        </button>
        <span style={{fontSize:13,color:C.textMid,fontFamily:"'DM Sans',sans-serif"}}>{t.pageOf(page,totalPages)}</span>
        <button onClick={()=>setPage(p=>Math.min(totalPages,p+1))} disabled={page===totalPages}
          style={{background:page===totalPages?C.bg:C.surface,border:`1px solid ${C.border}`,borderRadius:7,padding:"7px 16px",fontSize:13,color:page===totalPages?C.textLight:C.text,cursor:page===totalPages?"default":"pointer",fontFamily:"'DM Sans',sans-serif"}}>
          {t.next}
        </button>
      </div>}

      {/* Bottom CTA */}
      {!loading&&<div style={{marginTop:28,background:C.surface,border:`1px solid ${C.border}`,borderRadius:12,padding:"18px 22px",display:"flex",alignItems:"center",justifyContent:"space-between",flexWrap:"wrap",gap:12}}>
        <div>
          <div style={{fontFamily:"'DM Serif Display',Georgia,serif",fontSize:15,color:C.text,marginBottom:3}}>{t.missingTitle}</div>
          <div style={{fontSize:13,color:C.textMid}}>{t.missingDesc}</div>
        </div>
        <a href={JOTFORM_URL} target="_blank" rel="noreferrer" style={{background:C.green,color:"#fff",border:"none",borderRadius:7,padding:"9px 18px",fontSize:13,fontWeight:500,textDecoration:"none",fontFamily:"'DM Sans',sans-serif"}}>{t.jotformFull}</a>
      </div>}
    </div>
  </div>;
}
