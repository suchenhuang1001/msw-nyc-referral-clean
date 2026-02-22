import { useState, useEffect } from "react";

// ============================================================
// CONFIG
// ============================================================
const SHEET_ID = "1BzcRNS88oV1leLiMIcKxSmI3gkqtJtPu9_EYft3mKmY";
const SHEET_NAME = "Sheet1";
const CSV_URL = `https://docs.google.com/spreadsheets/d/${SHEET_ID}/gviz/tq?tqx=out:csv&sheet=${encodeURIComponent(SHEET_NAME)}`;
const APPS_SCRIPT_URL = "YOUR_APPS_SCRIPT_URL_HERE";

// ============================================================
// i18n — all UI strings in EN and ZH
// ============================================================
const STRINGS = {
  en: {
    siteTitle:       "NYC Referral Directory",
    community:       "MSW@NYC Chinese Community",
    browse:          "Browse",
    addAgency:       "+ Add Agency",
    heroTitle1:      "Chinese-Speaking Social Work Community",
    heroTitle2:      "Referral Directory",
    heroDesc:        "A shared resource built by NYC social workers, for social workers. Find agencies, understand eligibility, and make warm referrals — all in one place.",
    previewMode:     "Preview mode — showing sample data",
    justUpdated:     "Just updated",
    updatedMin:      (n) => `Updated ${n}m ago`,
    updatedHr:       (n) => `Updated ${n}h ago`,
    refresh:         "Refresh",
    searchPlaceholder: "Try: 'elderly patient who speaks Cantonese' or 'uninsured immigrant family'...",
    aiSearching:     "Finding the best matches...",
    aiResultsFor:    (q) => `AI results for "${q}"`,
    clearSearch:     "Clear",
    referralLinks:   "Refer now:",
    callLabel:       "Call",
    emailLabel:      "Email",
    filterLabel:     "Service Type",
    allFilter:       "All",
    agencyCount:     (n) => `${n} ${n === 1 ? "agency" : "agencies"}`,
    loading:         "Loading from Google Sheets...",
    clearFilters:    "Clear filters",
    tryAgain:        "Try again",
    noResults:       "No results found",
    noResultsSub:    "Try different keywords or remove a filter.",
    emptyTitle:      "The directory is empty",
    emptySub:        "Be the first to add your agency to the shared list.",
    addMyAgency:     "Add my agency",
    nudgeTitle:      "My agency is not listed...",
    nudgeSub:        "",
    addAgencyBtn:    "Add my agency",
    // Form
    formTitle:       "Add your agency",
    formDesc:        "Help your colleagues find and make referrals to your services.",
    fieldAgency:     "Agency Name *",
    fieldAddress:    "Address",
    fieldServices:   "Services & Specialization *",
    fieldLanguages:  "Languages",
    fieldEligibility:"Eligibility & Insurance *",
    fieldReferral:   "How to Refer *",
    fieldNotes:      "Additional Notes",
    phAgency:        "e.g. Maimonides Medical Center – Psychiatry Dept",
    phAddress:       "e.g. 920 48th Street, Brooklyn, NY 11219",
    phServices:      "Describe services offered, specializations, populations served...",
    phLanguages:     "e.g. Mandarin, Cantonese, Spanish, Bengali",
    phEligibility:   "e.g. Any age. Medicaid and most commercial insurance accepted.",
    phReferral:      "e.g. Call 718-283-7800, ask for Rapid Access Clinic.",
    phNotes:         "Anything else colleagues should know?",
    submitBtn:       "Submit to directory",
    submitting:      "Submitting...",
    cancelBtn:       "Cancel",
    submitError:     "Submission failed — please check the Apps Script URL.",
    submitAlert:     "Please fill in: Agency, Services, Eligibility, and How to Refer.",
    successTitle:    "Submission received",
    successDesc:     "Your agency has been added to the shared directory.",
    backToDir:       "Back to Directory",
    backToForm:      "Back to form",
    // Backend setup
    setupTitle:      "Apps Script setup required",
    setupStep1:      "Open your Google Sheet — Extensions → Apps Script",
    setupStep2:      "Replace all code with the script below, then deploy as a Web App (Anyone can access)",
    setupStep3:      "Copy the Web App URL and replace YOUR_APPS_SCRIPT_URL_HERE in the config",
    // Card detail labels
    services:        "Services",
    eligibility:     "Eligibility & Insurance",
    howToRefer:      "How to Refer",
    notes:           "Notes",
    editBtn:         "Edit",
    editTitle:       "Update agency info",
    editDesc:        "Changes will be saved directly to the shared Google Sheet.",
    saveBtn:         "Save changes",
    saving:          "Saving...",
    saveSuccess:     "Updated successfully",
    saveSuccessDesc: "Your changes are live in the directory.",
    sheetsLink:      "Or edit directly in Google Sheets",
  },
  zh: {
    siteTitle:       "NYC 转介资源目录",
    community:       "MSW@NYC 中文社工社区",
    browse:          "浏览资源",
    addAgency:       "+ 添加机构",
    heroTitle1:      "中文社工社区",
    heroTitle2:      "转介资源目录",
    heroDesc:        "由纽约市社工共同维护的转介资源库。查找机构、了解申请资格，方便为客户转介资源。",
    previewMode:     "预览模式 — 显示示例数据",
    justUpdated:     "刚刚更新",
    updatedMin:      (n) => `${n} 分钟前更新`,
    updatedHr:       (n) => `${n} 小时前更新`,
    refresh:         "刷新",
    searchPlaceholder: "试试：「不会说英文的老人」或「无证件的家庭」……",
    aiSearching:     "正在为你匹配最合适的机构……",
    aiResultsFor:    (q) => `"${q}" 的智能搜索结果`,
    clearSearch:     "清除",
    referralLinks:   "立即转介：",
    callLabel:       "致电",
    emailLabel:      "发邮件",
    filterLabel:     "服务类型",
    allFilter:       "全部",
    agencyCount:     (n) => `${n} 个机构`,
    loading:         "正在从 Google Sheets 加载数据……",
    clearFilters:    "清除筛选",
    tryAgain:        "重试",
    noResults:       "未找到相关结果",
    noResultsSub:    "请尝试其他关键词或取消筛选条件。",
    emptyTitle:      "目录暂无内容",
    emptySub:        "成为第一个添加机构信息的社工吧。",
    addMyAgency:     "添加我的机构",
    nudgeTitle:      "我的机构尚未收录……",
    nudgeSub:        "",
    addAgencyBtn:    "添加我的机构",
    // Form
    formTitle:       "添加机构信息",
    formDesc:        "帮助同行找到你所在机构并向你转介客户。",
    fieldAgency:     "机构名称 *",
    fieldAddress:    "地址",
    fieldServices:   "服务内容与专长 *",
    fieldLanguages:  "服务语言",
    fieldEligibility:"申请资格与保险 *",
    fieldReferral:   "如何转介 *",
    fieldNotes:      "补充说明",
    phAgency:        "例：Maimonides Medical Center – 精神科",
    phAddress:       "例：920 48th Street, Brooklyn, NY 11219",
    phServices:      "描述服务内容、专科方向、服务人群……",
    phLanguages:     "例：普通话、广东话、西班牙语、孟加拉语",
    phEligibility:   "例：不限年龄，接受 Medicaid 及大多数商业保险。",
    phReferral:      "例：致电 718-283-7800，询问 Rapid Access Clinic。",
    phNotes:         "其他同行需要知道的信息？",
    submitBtn:       "提交至目录",
    submitting:      "提交中……",
    cancelBtn:       "取消",
    submitError:     "提交失败，请检查 Apps Script 链接。",
    submitAlert:     "请填写：机构名称、服务内容、申请资格及转介方式。",
    successTitle:    "提交成功",
    successDesc:     "你的机构已添加至共享目录，刷新后即可显示。",
    backToDir:       "返回目录",
    backToForm:      "返回表单",
    // Backend setup
    setupTitle:      "需要设置 Apps Script",
    setupStep1:      "打开 Google Sheet — 扩展程序 → Apps Script",
    setupStep2:      "将所有代码替换为下方脚本，然后以 Web App 形式部署（任何人均可访问）",
    setupStep3:      "复制 Web App URL，替换配置中的 YOUR_APPS_SCRIPT_URL_HERE",
    // Card detail labels
    services:        "服务内容",
    eligibility:     "申请资格与保险",
    howToRefer:      "转介方式",
    notes:           "备注",
    editBtn:         "编辑",
    editTitle:       "更新机构信息",
    editDesc:        "修改内容将直接保存至共享 Google Sheet。",
    saveBtn:         "保存修改",
    saving:          "保存中……",
    saveSuccess:     "更新成功",
    saveSuccessDesc: "你的修改已生效。",
    sheetsLink:      "或直接在 Google Sheets 中编辑",
  },
};

const SERVICE_FILTERS_EN = ["All","Mental Health","Psychiatry","Substance Use","Housing","Legal","Immigration","Family Services","Youth","Elder Care","LGBTQ+"];
const SERVICE_FILTERS_ZH = ["全部","心理健康","精神科","药物滥用","住房","法律援助","移民服务","家庭服务","青少年","老年护理","LGBTQ+"];
const SERVICE_FILTER_MAP  = { "全部":"All","心理健康":"Mental Health","精神科":"Psychiatry","药物滥用":"Substance Use","住房":"Housing","法律援助":"Legal","移民服务":"Immigration","家庭服务":"Family Services","青少年":"Youth","老年护理":"Elder Care","LGBTQ+":"LGBTQ+" };

// ============================================================
// Design tokens
// ============================================================
const C = {
  bg:          "#F7F5F0",
  surface:     "#FFFFFF",
  border:      "#E8E3DA",
  borderHover: "#C8BFB0",
  text:        "#1A1A18",
  textMid:     "#5C5850",
  textLight:   "#9C9588",
  green:       "#2D5016",
  greenMid:    "#4A7C2F",
  greenLight:  "#EBF2E4",
  sage:        "#7BAF5E",
  teal:        "#2B6E6E",
  tealLight:   "#E4F0F0",
  coral:       "#C4624A",
  coralLight:  "#FAEEE9",
  gold:        "#A07830",
  goldLight:   "#F7F0E4",
};

const FONTS = `@import url('https://fonts.googleapis.com/css2?family=DM+Serif+Display:ital@0;1&family=DM+Sans:wght@300;400;500;600&display=swap');`;

const TAG_STYLE = {
  "Mental Health":        { bg: C.greenLight, text: C.green },
  "Therapy":              { bg: C.greenLight, text: C.green },
  "Psychiatry":           { bg: C.tealLight,  text: C.teal },
  "Substance Use":        { bg: C.goldLight,  text: C.gold },
  "Food":                 { bg: "#EDF4E8",    text: "#3D6B28" },
  "Housing":              { bg: C.goldLight,  text: C.gold },
  "Legal":                { bg: "#EDE8F4",    text: "#5C3F8A" },
  "Immigration":          { bg: C.coralLight, text: C.coral },
  "Family Services":      { bg: C.tealLight,  text: C.teal },
  "Domestic Violence":    { bg: C.coralLight, text: C.coral },
  "Case Management":      { bg: C.greenLight, text: C.greenMid },
  "Youth":                { bg: C.goldLight,  text: "#8A6020" },
  "Elder Care":           { bg: C.tealLight,  text: C.teal },
  "Disability":           { bg: "#EDE8F4",    text: "#5C3F8A" },
  "Financial Assistance": { bg: C.goldLight,  text: C.gold },
  "LGBTQ+":              { bg: C.coralLight, text: C.coral },
  "General Services":     { bg: "#EDEBE6",    text: C.textMid },
};

const SERVICE_TYPES = [
  "Mental Health","Therapy","Psychiatry","Substance Use","Food","Housing",
  "Legal","Immigration","Family Services","Domestic Violence","Case Management",
  "Youth","Elder Care","Disability","Financial Assistance","LGBTQ+"
];

// ============================================================
// CSV parser — tracks sheetRow so we can update the right row
// ============================================================
function parseCSV(text) {
  const lines = text.trim().split("\n");
  return lines.slice(1).map((line, lineIndex) => {
    const cols = [];
    let cur = "", inQ = false;
    for (let i = 0; i < line.length; i++) {
      const c = line[i];
      if (c === '"') { inQ = !inQ; }
      else if (c === "," && !inQ) { cols.push(cur.trim()); cur = ""; }
      else { cur += c; }
    }
    cols.push(cur.trim());
    const serviceText = cols[2] || "";
    const matched = SERVICE_TYPES.filter(s => serviceText.toLowerCase().includes(s.toLowerCase()));
    return {
      id: Math.random().toString(36).slice(2),
      sheetRow: lineIndex + 2, // row 1 = header, data starts at row 2
      orgName:     cols[0] || "",
      address:     cols[1] || "",
      serviceText,
      serviceTags: matched.length > 0 ? matched : ["General Services"],
      languages:   (cols[3] || "").split(/[\n,\/;]+/).map(l => l.trim()).filter(Boolean),
      eligibility: cols[4] || "",
      referral:    cols[5] || "",
      notes:       cols[6] || "",
    };
  }).filter(r => r.orgName && r.orgName !== "Agency");
}

const FALLBACK = [
  {
    id: "f1", sheetRow: 2,
    orgName:     "Maimonides Medical Center – Psychiatry Dept (OMH Article 31)",
    address:     "920 48th Street, Brooklyn, NY 11219",
    serviceText: "Individual therapy for adults and children. Psychiatric service/medication management for adults and children. LGBTQ+ clinic specializing in working with LGBTQ population.",
    serviceTags: ["Mental Health", "Psychiatry", "LGBTQ+"],
    languages:   ["Mandarin", "Cantonese", "Spanish", "Bengali", "Russian", "Arabic", "Aramaic"],
    eligibility: "Any age. Medicaid. Most commercial insurance.",
    referral:    "Call 718-283-7800 — ask for Rapid Access Clinic / intake team. Intake arranged ASAP. Clinician assigned after one intake session.",
    notes:       "https://maimo.org/treatments-care/mental-and-behavioral-health/",
  },
  {
    id: "f2", sheetRow: 3,
    orgName:     "Private Practice – Xiaofeng W. Koswatta",
    address:     "329 E 62nd Street, New York, NY 10065",
    serviceText: "Individual Psychodynamic Psychotherapy / Psychoanalysis. Works with adults, young adults, and teenagers.",
    serviceTags: ["Therapy", "Mental Health"],
    languages:   ["Mandarin", "English"],
    eligibility: "Out-of-network provider for all insurances. Provides statements for OON reimbursement.",
    referral:    "Email: Xiaofengk100@gmail.com · Phone: (917) 475-6638. Accepting new clients.",
    notes:       "",
  },
  {
    id: "f3", sheetRow: 4,
    orgName:     "CARES / Hand In Hand (OPWDD, OMH, CFTSS)",
    address:     "465 Grand Street, New York, NY 10002",
    serviceText: "Case management under CFTSS (specializing in autism). Psychological testing for autism/OPWDD applications. Therapy for people with autism and intellectual disability (individual therapy, parenting training). Therapy for mental health issues (depression, anxiety, etc.).",
    serviceTags: ["Case Management", "Mental Health", "Therapy", "Disability"],
    languages:   ["Mandarin", "Cantonese", "Spanish"],
    eligibility: "Any age. OPWDD eligibility or Medicaid (excluding Health First and Fidelis). Commercial insurance with copay case-by-case.",
    referral:    "Case management: Wayne (See Wai To), 212-420-1970 ext.176 / 646-254-2680. Psych testing: rivkad@caresnys.org. Therapy: therapyintake@caresnys.org",
    notes:       "https://caresnys.org/",
  },
  {
    id: "f4", sheetRow: 5,
    orgName:     "Phronetic Psychotherapy 行知心理咨询",
    address:     "Online (NY & NJ)",
    serviceText: "Individual, group, couples & family therapy. EMDR.",
    serviceTags: ["Therapy", "Mental Health"],
    languages:   ["Mandarin", "English"],
    eligibility: "Most commercial insurance.",
    referral:    "phronetic-psychotherapy.org",
    notes:       "",
  },
  {
    id: "f5", sheetRow: 6,
    orgName:     "Greater Philadelphia Health Action – Chinatown Medical Services",
    address:     "432 N. 6th St, Philadelphia, PA 19123",
    serviceText: "Behavioral Health Consultant embedded in primary care. Brief (15–30 min) immediate behavioral health support. Assessment, evaluation, and treatment for walk-in and scheduled patients. Serves infancy through adulthood. Refers to specialty mental health when appropriate.",
    serviceTags: ["Mental Health", "Case Management"],
    languages:   ["Mandarin", "Cantonese"],
    eligibility: "Medicaid, Medicare, and commercial insurance.",
    referral:    "Contact Snow Jiang, LCSW: njiang@gphainc.org",
    notes:       "On-site position in Philadelphia. No sponsorship as of January 2026.",
  },
  {
    id: "f6", sheetRow: 7,
    orgName:     "Private Practice – Yunshan Gao, LCSW",
    address:     "Online (NY & NJ)",
    serviceText: "Individual and couples therapy for adults.",
    serviceTags: ["Therapy", "Mental Health"],
    languages:   ["Mandarin", "English"],
    eligibility: "Out-of-network. Sliding scale available.",
    referral:    "",
    notes:       "",
  },
  {
    id: "f7", sheetRow: 8,
    orgName:     "Point Psychotherapy LCSW",
    address:     "Online (NY, PA, WI, Rhode Island)",
    serviceText: "CBT; individual and couples therapy. Specializes in college students and professionals.",
    serviceTags: ["Therapy", "Mental Health"],
    languages:   ["Mandarin", "English"],
    eligibility: "Major commercial insurance: Aetna, BCBS, Cigna.",
    referral:    "www.pointpsychotherapy.com",
    notes:       "",
  },
];

// ============================================================
// Extract clickable links from referral text
// ============================================================
function extractLinks(text) {
  const phones = [...(text.matchAll(/(\(?\d{3}\)?[\s\-.]?\d{3}[\s\-.]?\d{4})/g))].map(m => m[1]);
  const emails = [...(text.matchAll(/([a-zA-Z0-9._%+\-]+@[a-zA-Z0-9.\-]+\.[a-zA-Z]{2,})/g))].map(m => m[1]);
  const urls   = [...(text.matchAll(/https?:\/\/[^\s,)]+/g))].map(m => m[0]);
  return { phones: [...new Set(phones)], emails: [...new Set(emails)], urls: [...new Set(urls)] };
}

// ============================================================
// AI natural language search
// ============================================================
async function aiSearch(query, resources, lang) {
  const catalog = resources.map((r, i) =>
    `[${i}] ${r.orgName} | Services: ${r.serviceText} | Languages: ${r.languages.join(", ")} | Eligibility: ${r.eligibility}`
  ).join("\n");

  const prompt = `You are helping a social worker find the right referral agency.

The social worker typed: "${query}"

Here is the list of available agencies (index | name | services | languages | eligibility):
${catalog}

Return ONLY a JSON array of index numbers (e.g. [0, 2, 3]) of the agencies that best match the social worker's query. Consider language needs, service type, eligibility, and any implied client needs. Return at most 5 results, ordered by relevance. If nothing matches well, return [].`;

  const response = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      model: "claude-sonnet-4-20250514",
      max_tokens: 1000,
      messages: [{ role: "user", content: prompt }],
    }),
  });
  const data = await response.json();
  const raw = data.content?.[0]?.text || "[]";
  try {
    return JSON.parse(raw.replace(/```json|```/g, "").trim());
  } catch { return null; }
}


function Tag({ label }) {
  const s = TAG_STYLE[label] || TAG_STYLE["General Services"];
  return (
    <span style={{
      background: s.bg, color: s.text, borderRadius: 4,
      padding: "3px 10px", fontSize: 11, fontWeight: 600,
      letterSpacing: 0.4, display: "inline-block", margin: "2px 3px 2px 0",
      fontFamily: "'DM Sans', sans-serif", textTransform: "uppercase",
    }}>{label}</span>
  );
}

function DetailRow({ label, value }) {
  return (
    <div style={{ marginBottom: 14 }}>
      <div style={{ fontSize: 10, fontWeight: 600, letterSpacing: 1.2, textTransform: "uppercase", color: C.textLight, marginBottom: 3, fontFamily: "'DM Sans', sans-serif" }}>
        {label}
      </div>
      <div style={{ fontSize: 14, color: C.text, lineHeight: 1.6, fontFamily: "'DM Sans', sans-serif", whiteSpace: "pre-line" }}>
        {value}
      </div>
    </div>
  );
}

function FilterPill({ label, active, onClick }) {
  return (
    <button onClick={onClick} style={{
      border: `1px solid ${active ? C.green : C.border}`,
      background: active ? C.green : C.surface,
      color: active ? "#fff" : C.textMid,
      borderRadius: 100, padding: "6px 16px", fontSize: 12,
      fontWeight: 500, cursor: "pointer", fontFamily: "'DM Sans', sans-serif",
      transition: "all 0.15s", marginBottom: 6, letterSpacing: 0.2,
    }}>{label}</button>
  );
}

// ============================================================
// FormField — must be top-level so React doesn't remount on every render
// ============================================================
function FormField({ label, value, onChange, placeholder, rows = 1 }) {
  return (
    <div style={{ marginBottom: 18 }}>
      <label style={{ display: "block", fontFamily: "'DM Sans', sans-serif", fontSize: 11, fontWeight: 600, letterSpacing: 1, textTransform: "uppercase", color: C.textLight, marginBottom: 6 }}>{label}</label>
      <textarea
        rows={rows}
        placeholder={placeholder || ""}
        value={value}
        onChange={e => onChange(e.target.value)}
        style={{ width: "100%", boxSizing: "border-box", border: `1px solid ${C.border}`, borderRadius: 8, padding: "11px 14px", fontSize: 14, color: C.text, outline: "none", fontFamily: "'DM Sans', sans-serif", background: C.surface, resize: rows > 1 ? "vertical" : "none", lineHeight: 1.5 }}
        onFocus={e => e.target.style.borderColor = C.green}
        onBlur={e => e.target.style.borderColor = C.border}
      />
    </div>
  );
}

// ============================================================
// Edit Form — inline, pre-filled
// ============================================================
function EditForm({ r, t, onSave, onCancel }) {
  const [form, setForm] = useState({
    agency:      r.orgName,
    address:     r.address,
    services:    r.serviceText,
    languages:   r.languages.join(", "),
    eligibility: r.eligibility,
    referral:    r.referral,
    notes:       r.notes,
  });
  const [status, setStatus] = useState("idle");
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const handleSave = async () => {
    if (!form.agency || !form.services) { alert("Agency name and services are required."); return; }
    if (APPS_SCRIPT_URL === "YOUR_APPS_SCRIPT_URL_HERE") {
      alert("Apps Script URL not configured — please set APPS_SCRIPT_URL in the config."); return;
    }
    setStatus("saving");
    try {
      await fetch(APPS_SCRIPT_URL, {
        method: "POST", mode: "no-cors",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "update",
          rowIndex: r.sheetRow,
          data: [form.agency, form.address, form.services, form.languages, form.eligibility, form.referral, form.notes],
        }),
      });
      setStatus("success");
      setTimeout(() => onSave(form), 1200);
    } catch { setStatus("error"); }
  };

  const sBtn = { background: C.green, color: "#fff", border: "none", borderRadius: 7, padding: "9px 20px", fontSize: 13, fontWeight: 500, cursor: "pointer", fontFamily: "'DM Sans', sans-serif" };

  if (status === "success") return (
    <div style={{ padding: "20px 0", display: "flex", alignItems: "center", gap: 10 }}>
      <div style={{ width: 28, height: 28, borderRadius: "50%", background: C.greenLight, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none"><path d="M5 13l4 4L19 7" stroke={C.green} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
      </div>
      <span style={{ fontSize: 13, color: C.green, fontWeight: 500, fontFamily: "'DM Sans', sans-serif" }}>{t.saveSuccess} — {t.saveSuccessDesc}</span>
    </div>
  );

  return (
    <div style={{ marginTop: 20, paddingTop: 20, borderTop: `1px solid ${C.border}` }} onClick={e => e.stopPropagation()}>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0 20px" }}>
        <div style={{ gridColumn: "1/-1" }}><FormField label={t.fieldAgency}      value={form.agency}      onChange={v => set("agency", v)} /></div>
        <FormField label={t.fieldAddress}     value={form.address}     onChange={v => set("address", v)} />
        <FormField label={t.fieldLanguages}   value={form.languages}   onChange={v => set("languages", v)} />
        <div style={{ gridColumn: "1/-1" }}><FormField label={t.fieldServices}    value={form.services}    onChange={v => set("services", v)}    rows={3} /></div>
        <FormField label={t.fieldEligibility} value={form.eligibility} onChange={v => set("eligibility", v)} rows={2} />
        <FormField label={t.fieldReferral}    value={form.referral}    onChange={v => set("referral", v)}    rows={2} />
        <div style={{ gridColumn: "1/-1" }}><FormField label={t.fieldNotes}       value={form.notes}       onChange={v => set("notes", v)} /></div>
      </div>
      <div style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" }}>
        <button onClick={handleSave} disabled={status === "saving"} style={sBtn}>
          {status === "saving" ? t.saving : t.saveBtn}
        </button>
        <button onClick={onCancel} style={{ ...sBtn, background: C.surface, color: C.textMid, border: `1px solid ${C.border}` }}>
          {t.cancelBtn}
        </button>
        <a href={`https://docs.google.com/spreadsheets/d/${SHEET_ID}`} target="_blank" rel="noreferrer"
          style={{ fontSize: 12, color: C.textLight, fontFamily: "'DM Sans', sans-serif", marginLeft: 6 }}>
          {t.sheetsLink} →
        </a>
      </div>
      {status === "error" && <div style={{ marginTop: 10, fontSize: 12, color: C.coral, fontFamily: "'DM Sans', sans-serif" }}>{t.submitError}</div>}
    </div>
  );
}

// ============================================================
// Resource Card
// ============================================================
function ResourceCard({ r, t, highlight }) {
  const [open, setOpen]       = useState(false);
  const [editing, setEditing] = useState(false);
  const [localR, setLocalR]   = useState(r); // optimistic local update
  const links = extractLinks(localR.referral || "");
  const hasLinks = links.phones.length > 0 || links.emails.length > 0 || links.urls.length > 0;

  const handleSave = (form) => {
    // Optimistically update card without requiring a full reload
    const matched = SERVICE_TYPES.filter(s => form.services.toLowerCase().includes(s.toLowerCase()));
    setLocalR(prev => ({
      ...prev,
      orgName:     form.agency,
      address:     form.address,
      serviceText: form.services,
      serviceTags: matched.length > 0 ? matched : ["General Services"],
      languages:   form.languages.split(/[,;]+/).map(l => l.trim()).filter(Boolean),
      eligibility: form.eligibility,
      referral:    form.referral,
      notes:       form.notes,
    }));
    setEditing(false);
  };

  return (
    <div style={{
      background: C.surface,
      border: `1px solid ${highlight ? C.green : open || editing ? C.borderHover : C.border}`,
      borderRadius: 12, padding: "24px 28px", marginBottom: 12,
      transition: "border-color 0.2s, box-shadow 0.2s",
      boxShadow: highlight ? `0 0 0 3px ${C.greenLight}` : open ? "0 4px 20px rgba(0,0,0,0.07)" : "0 1px 4px rgba(0,0,0,0.04)",
    }}
      onMouseEnter={e => { if (!highlight) e.currentTarget.style.boxShadow = "0 2px 12px rgba(0,0,0,0.06)"; }}
      onMouseLeave={e => { if (!highlight) e.currentTarget.style.boxShadow = open ? "0 4px 20px rgba(0,0,0,0.07)" : "0 1px 4px rgba(0,0,0,0.04)"; }}
    >
      {/* Top row */}
      <div onClick={() => { if (!editing) setOpen(o => !o); }} style={{ cursor: editing ? "default" : "pointer", display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 16 }}>
        <div style={{ flex: 1 }}>
          <div style={{ fontFamily: "'DM Serif Display', Georgia, serif", fontSize: 18, color: C.text, marginBottom: 4, lineHeight: 1.3 }}>
            {localR.orgName}
          </div>
          {localR.address && (
            <div style={{ fontSize: 12, color: C.textLight, marginBottom: 12, fontFamily: "'DM Sans', sans-serif" }}>
              {localR.address}
            </div>
          )}
          <div style={{ marginBottom: localR.languages.length > 0 ? 8 : 0 }}>
            {localR.serviceTags.map(s => <Tag key={s} label={s} />)}
          </div>
          {localR.languages.length > 0 && (
            <div style={{ marginTop: 8, fontSize: 12, color: C.textLight, fontFamily: "'DM Sans', sans-serif" }}>
              {localR.languages.join(" · ")}
            </div>
          )}
        </div>
        <div style={{ display: "flex", gap: 8, alignItems: "center", flexShrink: 0 }}>
          {/* Edit button */}
          <button
            onClick={e => { e.stopPropagation(); setEditing(ed => !ed); setOpen(false); }}
            style={{
              background: editing ? C.greenLight : "transparent",
              color: editing ? C.green : C.textLight,
              border: `1px solid ${editing ? C.green : C.border}`,
              borderRadius: 6, padding: "5px 12px", fontSize: 11,
              fontWeight: 600, cursor: "pointer", fontFamily: "'DM Sans', sans-serif",
              letterSpacing: 0.3,
            }}
          >{t.editBtn}</button>
          {/* Expand chevron */}
          {!editing && (
            <div style={{ width: 28, height: 28, borderRadius: "50%", border: `1px solid ${C.border}`, display: "flex", alignItems: "center", justifyContent: "center", color: C.textLight, fontSize: 12, transition: "transform 0.2s", transform: open ? "rotate(180deg)" : "rotate(0deg)" }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none"><path d="M6 9l6 6 6-6" stroke={C.textLight} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
            </div>
          )}
        </div>
      </div>

      {/* Referral quick-links — always visible */}
      {hasLinks && !editing && (
        <div style={{ marginTop: 14, paddingTop: 14, borderTop: `1px solid ${C.border}`, display: "flex", alignItems: "center", flexWrap: "wrap", gap: 8 }}>
          <span style={{ fontSize: 11, fontWeight: 600, color: C.textLight, letterSpacing: 0.8, textTransform: "uppercase", fontFamily: "'DM Sans', sans-serif", marginRight: 2 }}>{t.referralLinks}</span>
          {links.phones.map(p => (
            <a key={p} href={`tel:${p.replace(/\D/g,"")}`} onClick={e => e.stopPropagation()}
              style={{ display: "inline-flex", alignItems: "center", gap: 5, background: C.greenLight, color: C.green, borderRadius: 6, padding: "5px 12px", fontSize: 12, fontWeight: 600, textDecoration: "none", fontFamily: "'DM Sans', sans-serif" }}>
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none"><path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07A19.5 19.5 0 013.07 9.8 19.79 19.79 0 01.42 1.18 2 2 0 012.4 0h3a2 2 0 012 1.72c.127.96.361 1.903.7 2.81a2 2 0 01-.45 2.11L6.91 7.91a16 16 0 006.13 6.13l1.27-1.27a2 2 0 012.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0122 16.92z" stroke={C.green} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
              {t.callLabel} {p}
            </a>
          ))}
          {links.emails.map(e => (
            <a key={e} href={`mailto:${e}`} onClick={ev => ev.stopPropagation()}
              style={{ display: "inline-flex", alignItems: "center", gap: 5, background: C.tealLight, color: C.teal, borderRadius: 6, padding: "5px 12px", fontSize: 12, fontWeight: 600, textDecoration: "none", fontFamily: "'DM Sans', sans-serif" }}>
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" stroke={C.teal} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/><polyline points="22,6 12,13 2,6" stroke={C.teal} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
              {t.emailLabel}
            </a>
          ))}
          {links.urls.map(u => (
            <a key={u} href={u} target="_blank" rel="noreferrer" onClick={e => e.stopPropagation()}
              style={{ display: "inline-flex", alignItems: "center", gap: 5, background: "#EDEBE6", color: C.textMid, borderRadius: 6, padding: "5px 12px", fontSize: 12, fontWeight: 600, textDecoration: "none", fontFamily: "'DM Sans', sans-serif" }}>
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none"><path d="M18 13v6a2 2 0 01-2 2H5a2 2 0 01-2-2V8a2 2 0 012-2h6" stroke={C.textMid} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/><polyline points="15,3 21,3 21,9" stroke={C.textMid} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/><line x1="10" y1="14" x2="21" y2="3" stroke={C.textMid} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
              Website
            </a>
          ))}
        </div>
      )}

      {/* Edit form */}
      {editing && <EditForm r={localR} t={t} onSave={handleSave} onCancel={() => setEditing(false)} />}

      {/* Expanded detail */}
      {open && !editing && (
        <div style={{ marginTop: 16, paddingTop: 16, borderTop: `1px solid ${C.border}`, display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0 32px" }}>
          {localR.serviceText  && <div style={{ gridColumn: "1/-1" }}><DetailRow label={t.services}    value={localR.serviceText} /></div>}
          {localR.eligibility  && <DetailRow label={t.eligibility} value={localR.eligibility} />}
          {localR.referral     && <DetailRow label={t.howToRefer}  value={localR.referral} />}
          {localR.notes        && <div style={{ gridColumn: "1/-1" }}><DetailRow label={t.notes} value={localR.notes} /></div>}
        </div>
      )}
    </div>
  );
}

// ============================================================
// Submit Form
// ============================================================
function SubmitForm({ onBack, t }) {
  const [form, setForm] = useState({ agency: "", address: "", services: "", languages: "", eligibility: "", referral: "", notes: "" });
  const [status, setStatus] = useState("idle");
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const handleSubmit = async () => {
    if (!form.agency || !form.services || !form.eligibility || !form.referral) { alert(t.submitAlert); return; }
    if (APPS_SCRIPT_URL === "YOUR_APPS_SCRIPT_URL_HERE") { setStatus("no-backend"); return; }
    setStatus("submitting");
    try {
      await fetch(APPS_SCRIPT_URL, { method: "POST", mode: "no-cors", headers: { "Content-Type": "application/json" }, body: JSON.stringify([form.agency, form.address, form.services, form.languages, form.eligibility, form.referral, form.notes]) });
      setStatus("success");
    } catch { setStatus("error"); }
  };

  const sBtn = { background: C.green, color: "#fff", border: "none", borderRadius: 8, padding: "12px 28px", fontSize: 14, fontWeight: 500, cursor: "pointer", fontFamily: "'DM Sans', sans-serif", letterSpacing: 0.2 };

  if (status === "success") return (
    <div style={{ textAlign: "center", padding: "80px 20px" }}>
      <div style={{ width: 56, height: 56, borderRadius: "50%", background: C.greenLight, margin: "0 auto 20px", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none"><path d="M5 13l4 4L19 7" stroke={C.green} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
      </div>
      <div style={{ fontFamily: "'DM Serif Display', Georgia, serif", fontSize: 26, color: C.text, marginBottom: 8 }}>{t.successTitle}</div>
      <div style={{ color: C.textMid, marginBottom: 32, fontFamily: "'DM Sans', sans-serif", fontSize: 15 }}>{t.successDesc}</div>
      <button onClick={onBack} style={sBtn}>{t.backToDir}</button>
    </div>
  );

  if (status === "no-backend") return (
    <div style={{ maxWidth: 600, margin: "0 auto" }}>
      <div style={{ background: C.goldLight, border: `1px solid #D4B880`, borderRadius: 12, padding: "24px 28px", color: C.gold, fontFamily: "'DM Sans', sans-serif", fontSize: 13, lineHeight: 1.9 }}>
        <strong style={{ fontSize: 14 }}>{t.setupTitle}</strong><br /><br />
        1. {t.setupStep1}<br />
        2. {t.setupStep2}<br />
        3. {t.setupStep3}
        <pre style={{ background: "#1A1A18", color: "#7BAF5E", borderRadius: 8, padding: 16, fontSize: 12, marginTop: 16, overflowX: "auto" }}>{`function doPost(e) {\n  var sheet = SpreadsheetApp.openById(\n    "${SHEET_ID}"\n  ).getSheetByName("${SHEET_NAME}");\n  sheet.appendRow(JSON.parse(e.postData.contents));\n  return ContentService.createTextOutput("ok");\n}`}</pre>
      </div>
      <button onClick={() => setStatus("idle")} style={{ ...sBtn, marginTop: 20, background: C.surface, color: C.text, border: `1px solid ${C.border}` }}>{t.backToForm}</button>
    </div>
  );

  return (
    <div style={{ maxWidth: 600, margin: "0 auto", paddingBottom: 60 }}>
      <div style={{ marginBottom: 32 }}>
        <div style={{ fontFamily: "'DM Serif Display', Georgia, serif", fontSize: 28, color: C.text, marginBottom: 8 }}>{t.formTitle}</div>
        <div style={{ color: C.textMid, fontFamily: "'DM Sans', sans-serif", fontSize: 15 }}>{t.formDesc}</div>
      </div>
      <FormField label={t.fieldAgency}      value={form.agency}      onChange={v => set("agency", v)}      placeholder={t.phAgency} />
      <FormField label={t.fieldAddress}     value={form.address}     onChange={v => set("address", v)}     placeholder={t.phAddress} />
      <FormField label={t.fieldServices}    value={form.services}    onChange={v => set("services", v)}    placeholder={t.phServices}    rows={3} />
      <FormField label={t.fieldLanguages}   value={form.languages}   onChange={v => set("languages", v)}   placeholder={t.phLanguages} />
      <FormField label={t.fieldEligibility} value={form.eligibility} onChange={v => set("eligibility", v)} placeholder={t.phEligibility} rows={2} />
      <FormField label={t.fieldReferral}    value={form.referral}    onChange={v => set("referral", v)}    placeholder={t.phReferral}    rows={2} />
      <FormField label={t.fieldNotes}       value={form.notes}       onChange={v => set("notes", v)}       placeholder={t.phNotes}       rows={2} />
      <div style={{ display: "flex", gap: 12, marginTop: 8 }}>
        <button onClick={handleSubmit} disabled={status === "submitting"} style={sBtn}>
          {status === "submitting" ? t.submitting : t.submitBtn}
        </button>
        <button onClick={onBack} style={{ ...sBtn, background: C.surface, color: C.textMid, border: `1px solid ${C.border}` }}>{t.cancelBtn}</button>
      </div>
      {status === "error" && <div style={{ marginTop: 12, color: C.coral, fontSize: 13, fontFamily: "'DM Sans', sans-serif" }}>{t.submitError}</div>}
    </div>
  );
}

// ============================================================
// Main App
// ============================================================
export default function App() {
  const [lang, setLang]               = useState("en");
  const [view, setView]               = useState("directory");
  const [resources, setResources]     = useState([]);
  const [loading, setLoading]         = useState(true);
  const [isPreview, setIsPreview]     = useState(false);
  const [error, setError]             = useState(null);
  const [search, setSearch]           = useState("");
  const [serviceFilter, setServiceFilter] = useState("All");
  const [lastUpdated, setLastUpdated] = useState(null);
  const [aiResults, setAiResults]     = useState(null);  // null = no AI search, [] = no match, [i,j] = indices
  const [aiLoading, setAiLoading]     = useState(false);
  const [aiQuery, setAiQuery]         = useState("");

  const t = STRINGS[lang];
  const filters = lang === "en" ? SERVICE_FILTERS_EN : SERVICE_FILTERS_ZH;

  // When switching language, map the active filter across
  const switchLang = (newLang) => {
    if (newLang === lang) return;
    if (serviceFilter !== "All" && serviceFilter !== "全部") {
      if (newLang === "zh") {
        const zhKey = Object.entries(SERVICE_FILTER_MAP).find(([zh, en]) => en === serviceFilter)?.[0];
        setServiceFilter(zhKey || "全部");
      } else {
        setServiceFilter(SERVICE_FILTER_MAP[serviceFilter] || "All");
      }
    } else {
      setServiceFilter(newLang === "zh" ? "全部" : "All");
    }
    setLang(newLang);
  };

  const getEnFilter = (f) => lang === "zh" ? (SERVICE_FILTER_MAP[f] || "All") : f;

  const loadData = async () => {
    setLoading(true); setError(null); setIsPreview(false);
    try {
      const res = await fetch(CSV_URL);
      if (!res.ok) throw new Error();
      setResources(parseCSV(await res.text()));
      setLastUpdated(new Date());
    } catch {
      setResources(FALLBACK);
      setIsPreview(true);
      setLastUpdated(new Date());
    }
    setLoading(false);
  };

  useEffect(() => { loadData(); }, []);

  // AI search — fires 800ms after user stops typing (if query is meaningful)
  useEffect(() => {
    if (!search.trim() || search.trim().length < 4) {
      setAiResults(null); setAiQuery(""); return;
    }
    const timer = setTimeout(async () => {
      setAiLoading(true);
      const indices = await aiSearch(search, resources, lang);
      setAiResults(indices);
      setAiQuery(search);
      setAiLoading(false);
    }, 800);
    return () => clearTimeout(timer);
  }, [search, resources]);

  const enFilter = getEnFilter(serviceFilter);

  // If AI has returned results, use those (in order); otherwise keyword filter
  const filtered = aiResults !== null
    ? aiResults.map(i => resources[i]).filter(Boolean).filter(r =>
        enFilter === "All" || r.serviceTags.some(t => t.toLowerCase().includes(enFilter.toLowerCase()))
      )
    : resources.filter(r => {
        if (enFilter !== "All" && !r.serviceTags.some(tag => tag.toLowerCase().includes(enFilter.toLowerCase()))) return false;
        if (search) {
          const q = search.toLowerCase();
          if (![r.orgName, r.serviceText, r.eligibility, r.referral, r.address, r.notes].join(" ").toLowerCase().includes(q)) return false;
        }
        return true;
      });

  const timeAgo = lastUpdated ? (() => {
    const s = Math.floor((new Date() - lastUpdated) / 1000);
    if (s < 60) return t.justUpdated;
    if (s < 3600) return t.updatedMin(Math.floor(s / 60));
    return t.updatedHr(Math.floor(s / 3600));
  })() : "";

  const isAllFilter = serviceFilter === "All" || serviceFilter === "全部";

  return (
    <div style={{ minHeight: "100vh", background: C.bg, fontFamily: "'DM Sans', sans-serif" }}>
      <style>{FONTS}</style>
      <style>{`* { box-sizing: border-box; } input::placeholder, textarea::placeholder { color: ${C.textLight}; } @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>

      {/* ── Nav ── */}
      <nav style={{ background: C.surface, borderBottom: `1px solid ${C.border}`, padding: "0 32px", display: "flex", alignItems: "center", justifyContent: "space-between", height: 60 }}>
        <div style={{ fontFamily: "'DM Serif Display', Georgia, serif", fontSize: 18, color: C.text, letterSpacing: -0.3 }}>
          {t.siteTitle}
        </div>
        <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
          <div style={{ display: "flex", border: `1px solid ${C.border}`, borderRadius: 8, overflow: "hidden" }}>
            {["en", "zh"].map(l => (
              <button key={l} onClick={() => switchLang(l)} style={{
                background: lang === l ? C.green : C.surface,
                color: lang === l ? "#fff" : C.textMid,
                border: "none", padding: "6px 14px",
                fontSize: 12, fontWeight: 600, cursor: "pointer",
                fontFamily: "'DM Sans', sans-serif", letterSpacing: 0.5,
                transition: "all 0.15s",
              }}>
                {l === "en" ? "EN" : "中文"}
              </button>
            ))}
          </div>
        </div>
      </nav>

      {/* ── Hero ── */}
      {view === "directory" && (
        <div style={{ background: C.surface, borderBottom: `1px solid ${C.border}`, padding: "48px 32px 40px" }}>
          <div style={{ maxWidth: 720, margin: "0 auto" }}>
            <div style={{ fontSize: 11, fontWeight: 600, letterSpacing: 2, textTransform: "uppercase", color: C.sage, marginBottom: 12 }}>
              {t.community}
            </div>
            <h1 style={{ fontFamily: "'DM Serif Display', Georgia, serif", fontSize: 38, color: C.text, margin: "0 0 14px", lineHeight: 1.15, fontWeight: 400 }}>
              {t.heroTitle1}<br />
              <span style={{ color: C.greenMid }}>{t.heroTitle2}</span>
            </h1>
            <p style={{ fontSize: 15, color: C.textMid, lineHeight: 1.7, margin: "0 0 24px", maxWidth: 520 }}>
              {t.heroDesc}
            </p>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <span style={{ width: 7, height: 7, borderRadius: "50%", background: C.sage, display: "inline-block" }} />
              <span style={{ fontSize: 12, color: C.textLight }}>
                {isPreview ? t.previewMode : timeAgo}
              </span>
              <button onClick={loadData} style={{ background: "none", border: "none", color: C.green, fontSize: 12, fontWeight: 500, cursor: "pointer", padding: "0 4px", fontFamily: "'DM Sans', sans-serif" }}>
                {t.refresh}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Main content ── */}
      <div style={{ maxWidth: 752, margin: "0 auto", padding: "32px 16px" }}>
        {view === "submit" ? (
          <div>
            <button onClick={() => setView("directory")} style={{ background: "none", border: "none", color: C.textMid, fontSize: 13, cursor: "pointer", fontFamily: "'DM Sans', sans-serif", padding: "0 0 24px", display: "flex", alignItems: "center", gap: 6 }}>
              ← {t.browse}
            </button>
            <SubmitForm t={t} onBack={() => { setView("directory"); loadData(); }} />
          </div>
        ) : (
          <>
            {/* Search + filters */}
            <div style={{ marginBottom: 24 }}>
              <div style={{ position: "relative", marginBottom: 14 }}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" style={{ position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)", pointerEvents: "none" }}>
                  <circle cx="11" cy="11" r="8" stroke={C.textLight} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M21 21l-4.35-4.35" stroke={C.textLight} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
                <input
                  value={search}
                  onChange={e => { e.stopPropagation(); setSearch(e.target.value); setAiResults(null); }}
                  onClick={e => e.stopPropagation()}
                  onMouseDown={e => e.stopPropagation()}
                  onKeyDown={e => e.stopPropagation()}
                  onKeyUp={e => e.stopPropagation()}
                  placeholder={t.searchPlaceholder}
                  style={{ width: "100%", border: `1px solid ${aiResults !== null ? C.green : C.border}`, borderRadius: 8, padding: "13px 44px", fontSize: 14, color: C.text, background: C.surface, outline: "none", fontFamily: "'DM Sans', sans-serif", boxShadow: "0 1px 3px rgba(0,0,0,0.04)", boxSizing: "border-box" }}
                  onFocus={e => e.target.style.borderColor = C.green}
                  onBlur={e => e.target.style.borderColor = aiResults !== null ? C.green : C.border}
                />
                {/* Loading spinner / clear */}
                {aiLoading && (
                  <div style={{ position: "absolute", right: 14, top: "50%", transform: "translateY(-50%)" }}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" style={{ animation: "spin 1s linear infinite" }}>
                      <circle cx="12" cy="12" r="10" stroke={C.border} strokeWidth="3"/>
                      <path d="M22 12a10 10 0 0 0-10-10" stroke={C.green} strokeWidth="3" strokeLinecap="round"/>
                    </svg>
                  </div>
                )}
                {search && !aiLoading && (
                  <button onClick={() => { setSearch(""); setAiResults(null); setAiQuery(""); }}
                    style={{ position: "absolute", right: 12, top: "50%", transform: "translateY(-50%)", background: "none", border: "none", color: C.textLight, cursor: "pointer", fontSize: 18, lineHeight: 1, padding: 2 }}>×</button>
                )}
              </div>
              {/* AI status label */}
              {aiLoading && (
                <div style={{ fontSize: 12, color: C.sage, fontFamily: "'DM Sans', sans-serif", marginBottom: 10, display: "flex", alignItems: "center", gap: 6 }}>
                  <span style={{ width: 6, height: 6, borderRadius: "50%", background: C.sage, display: "inline-block" }} />
                  {t.aiSearching}
                </div>
              )}
              {aiResults !== null && !aiLoading && (
                <div style={{ fontSize: 12, color: C.green, fontFamily: "'DM Sans', sans-serif", fontWeight: 500, marginBottom: 10 }}>
                  {t.aiResultsFor(aiQuery)}
                </div>
              )}
              <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                {filters.map(f => (
                  <FilterPill key={f} label={f} active={serviceFilter === f} onClick={() => setServiceFilter(f)} />
                ))}
              </div>
            </div>

            {/* Results count + action buttons */}
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
              <span style={{ fontSize: 13, color: C.textLight }}>
                {loading ? t.loading : t.agencyCount(filtered.length)}
              </span>
              <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                {(search || !isAllFilter) && (
                  <button onClick={() => { setSearch(""); setServiceFilter(lang === "zh" ? "全部" : "All"); setAiResults(null); setAiQuery(""); }} style={{ background: "none", border: "none", color: C.green, fontSize: 12, fontWeight: 500, cursor: "pointer", fontFamily: "'DM Sans', sans-serif" }}>
                    {t.clearFilters}
                  </button>
                )}
                <button onClick={() => setView("directory")} style={{
                  background: view === "directory" ? C.greenLight : "transparent",
                  color: view === "directory" ? C.green : C.textMid,
                  border: `1px solid ${view === "directory" ? C.green : C.border}`,
                  borderRadius: 6, padding: "7px 16px",
                  fontSize: 13, fontWeight: 500, cursor: "pointer", fontFamily: "'DM Sans', sans-serif",
                }}>{t.browse}</button>
                <button onClick={() => setView("submit")} style={{
                  background: C.green, color: "#fff", border: "none", borderRadius: 6,
                  padding: "7px 16px", fontSize: 13, fontWeight: 500,
                  cursor: "pointer", fontFamily: "'DM Sans', sans-serif",
                }}>{t.addAgency}</button>
              </div>
            </div>



            {/* Error */}
            {error && (
              <div style={{ background: C.coralLight, border: `1px solid #E0A090`, borderRadius: 10, padding: "14px 18px", color: C.coral, fontSize: 13, marginBottom: 16 }}>
                {error}
                <button onClick={loadData} style={{ marginLeft: 12, background: "none", border: "none", color: C.coral, fontWeight: 600, cursor: "pointer", fontFamily: "'DM Sans', sans-serif", textDecoration: "underline" }}>{t.tryAgain}</button>
              </div>
            )}

            {/* Loading */}
            {loading && (
              <div style={{ textAlign: "center", padding: "80px 20px", color: C.textLight }}>
                <div style={{ fontSize: 13, fontFamily: "'DM Sans', sans-serif" }}>{t.loading}</div>
              </div>
            )}

            {/* Cards */}
            {!loading && filtered.map((r, i) => <ResourceCard key={r.id} r={r} t={t} highlight={aiResults !== null && i === 0} />)}

            {/* No results */}
            {!loading && filtered.length === 0 && resources.length > 0 && (
              <div style={{ textAlign: "center", padding: "80px 20px" }}>
                <div style={{ fontFamily: "'DM Serif Display', Georgia, serif", fontSize: 20, color: C.textMid, marginBottom: 8 }}>{t.noResults}</div>
                <div style={{ fontSize: 14, color: C.textLight }}>{t.noResultsSub}</div>
              </div>
            )}

            {/* Empty sheet */}
            {!loading && resources.length === 0 && (
              <div style={{ background: C.goldLight, border: `1px solid #D4B880`, borderRadius: 12, padding: "24px 28px" }}>
                <div style={{ fontFamily: "'DM Serif Display', Georgia, serif", fontSize: 18, color: C.text, marginBottom: 6 }}>{t.emptyTitle}</div>
                <div style={{ fontSize: 14, color: C.textMid, marginBottom: 16 }}>{t.emptySub}</div>
                <button onClick={() => setView("submit")} style={{ background: C.green, color: "#fff", border: "none", borderRadius: 8, padding: "12px 28px", fontSize: 14, fontWeight: 500, cursor: "pointer", fontFamily: "'DM Sans', sans-serif" }}>{t.addMyAgency}</button>
              </div>
            )}

          </>
        )}
      </div>
    </div>
  );
}
