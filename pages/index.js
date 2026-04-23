import { useEffect, useState, useCallback } from 'react'
import Head from 'next/head'

const SUPA_URL = process.env.NEXT_PUBLIC_SUPABASE_URL
const SUPA_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

async function sbFetch(path, opts = {}) {
  const res = await fetch(`${SUPA_URL}/rest/v1/${path}`, {
    ...opts,
    headers: {
      apikey: SUPA_KEY,
      Authorization: `Bearer ${SUPA_KEY}`,
      'Content-Type': 'application/json',
      Prefer: 'return=representation',
      ...opts.headers,
    },
  })
  if (!res.ok) throw new Error(await res.text())
  const text = await res.text()
  return text ? JSON.parse(text) : []
}

function rowToDeal(r) {
  return {
    id: r.id, name: r.name,
    b1First: r.b1_first, b1Last: r.b1_last, b1Name: r.b1_name,
    b1DOB: r.b1_dob, b1Cell: r.b1_cell, b1Email: r.b1_email,
    b1Employer: r.b1_employer, b1Occ: r.b1_occ,
    b1Street: r.b1_street, b1City: r.b1_city, b1Prov: r.b1_prov, b1Postal: r.b1_postal,
    b2First: r.b2_first, b2Last: r.b2_last, b2Name: r.b2_name || '',
    b2DOB: r.b2_dob, b2Cell: r.b2_cell, b2Email: r.b2_email,
    b2Employer: r.b2_employer, b2Occ: r.b2_occ,
    propStreet: r.prop_street, propCity: r.prop_city, propProv: r.prop_prov, propPostal: r.prop_postal,
    property: r.property, occupancy: r.occupancy, propValue: r.prop_value,
    amount: r.amount, lender: r.lender, mortType: r.mort_type,
    rate: r.rate, intType: r.int_type, term: r.term, amort: r.amort,
    closing: r.closing, firstPay: r.first_pay, renewal: r.renewal,
    appType: r.app_type, entryDate: r.entry_date, stage: r.stage || 'Lead',
    refName: r.ref_name, refCompany: r.ref_company, refType: r.ref_type,
    refEmail: r.ref_email, refPhone: r.ref_phone, initNotes: r.init_notes,
  }
}

function dealToRow(d) {
  return {
    id: d.id, name: d.name,
    b1_first: d.b1First, b1_last: d.b1Last, b1_name: d.b1Name,
    b1_dob: d.b1DOB, b1_cell: d.b1Cell, b1_email: d.b1Email,
    b1_employer: d.b1Employer, b1_occ: d.b1Occ,
    b1_street: d.b1Street, b1_city: d.b1City, b1_prov: d.b1Prov, b1_postal: d.b1Postal,
    b2_first: d.b2First, b2_last: d.b2Last, b2_name: d.b2Name,
    b2_dob: d.b2DOB, b2_cell: d.b2Cell, b2_email: d.b2Email,
    b2_employer: d.b2Employer, b2_occ: d.b2Occ,
    prop_street: d.propStreet, prop_city: d.propCity, prop_prov: d.propProv, prop_postal: d.propPostal,
    property: d.property, occupancy: d.occupancy, prop_value: d.propValue,
    amount: d.amount, lender: d.lender, mort_type: d.mortType,
    rate: d.rate, int_type: d.intType, term: d.term, amort: d.amort,
    closing: d.closing, first_pay: d.firstPay, renewal: d.renewal,
    app_type: d.appType, entry_date: d.entryDate, stage: d.stage,
    ref_name: d.refName, ref_company: d.refCompany, ref_type: d.refType,
    ref_email: d.refEmail, ref_phone: d.refPhone, init_notes: d.initNotes,
  }
}

const STAGES = ['Lead','Info Only / No Deal','Pre-Approval','Documents Received','Application Submitted','Approved','Conditions Cleared','Funded','Check In']
const TASK_STAGES = ['To Do','In Progress','Done','Cancelled']
const SDOT = ['#9ca3af','#f59e0b','#3b82f6','#8b5cf6','#10b981','#22c55e','#ec4899','#16a34a','#f59e0b']
const SBAR = ['#6b7280','#d97706','#2563eb','#7c3aed','#059669','#15803d','#be185d','#15803d','#d97706']
const SBG = ['#f9fafb','#fffbeb','#eff6ff','#f5f3ff','#f0fdf4','#f0fdf4','#fdf2f8','#f0fdf4','#fffbeb']
const SFG = ['#374151','#92400e','#1e40af','#5b21b6','#065f46','#14532d','#831843','#14532d','#78350f']
const PCOLORS = ['#2563eb','#059669','#d97706','#7c3aed','#be185d','#0891b2','#65a30d','#dc2626','#9333ea','#0d9488']
const AVP = [['#dbeafe','#1e40af'],['#dcfce7','#14532d'],['#fef3c7','#92400e'],['#fce7f3','#831843'],['#ede9fe','#5b21b6'],['#ecfdf5','#065f46']]
const PROVS = ['AB','BC','MB','NB','NL','NS','NT','NU','ON','PE','QC','SK','YT']
const REFTYPES = ['Realtor','Financial Advisor','Accountant','Lawyer / Notary','Insurance Broker','Builder / Developer','Past Client','Friend / Family','Other']
const OCCTYPES = ['Owner-Occupied','Rental','Owner-Occupied & Rental','Seasonal/Secondary']
const ITTYPES = ['Fixed','Variable','Adjustable']
const MTTYPES = ['First','Second','Third']
const ATTYPES = ['Approval','Pre-Approval']
const TRANSACTION_TYPES = ['Purchase','Refinance','Renewal','Pre-Approval','Follow-Up Call','Document Collection','Other']

function fmtAmt(v) { if (!v) return '—'; const n = parseFloat(String(v).replace(/[$,]/g, '')); if (isNaN(n) || n === 0) return '—'; return '$' + Math.round(n).toLocaleString('en-CA') }
function daysUntil(d) { if (!d) return null; const ms = new Date(d) - new Date(); if (isNaN(ms)) return null; return Math.round(ms / 86400000) }
function rpCls(d) { const n = daysUntil(d); if (n === null) return ''; return n < 0 ? 'purgnt' : n < 60 ? 'purgnt' : n < 180 ? 'psoon' : 'pokk' }
function ini(n) { return (n || '?').split(' ').filter(Boolean).slice(0, 2).map(w => w[0].toUpperCase()).join('') }
function avc(n) { let h = 0; for (let i = 0; i < (n || '').length; i++) h = (h * 31 + n.charCodeAt(i)) % AVP.length; return AVP[h] }
function esc(s) { return String(s || '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;') }
function stageIdx(s) { const i = STAGES.indexOf(s); return i >= 0 ? i : 0 }
function uid() { return 'D' + Date.now() + Math.random().toString(36).slice(2, 5) }
function tuid() { return 'T' + Date.now() + Math.random().toString(36).slice(2, 5) }

export default function App() {
  const [deals, setDeals] = useState([])
  const [tasks, setTasks] = useState([])
  const [settings, setSettings] = useState({})
  const [tab, setTab] = useState('dashboard')
  const [loading, setLoading] = useState(true)
  const [toast, setToast] = useState(null)
  const [modal, setModal] = useState(null) // {type, data}
  const [refFilter, setRefFilter] = useState(null)
  const [refSort, setRefSort] = useState('count')
  const [contactSearch, setContactSearch] = useState('')
  const [contactStage, setContactStage] = useState('')
  const [contactRen, setContactRen] = useState('')

  const showToast = useCallback((msg, isError = false) => {
    setToast({ msg, isError })
    setTimeout(() => setToast(null), 3500)
  }, [])

  const loadAll = useCallback(async () => {
    setLoading(true)
    try {
      const [dealRows, taskRows, settingsRows] = await Promise.all([
        sbFetch('deals?select=*&order=created_at.desc'),
        sbFetch('tasks?select=*&order=due_date.asc'),
        sbFetch('settings?select=*'),
      ])
      setDeals(dealRows.map(rowToDeal))
      setTasks(taskRows)
      const s = {}
      settingsRows.forEach(r => { s[r.key] = r.value })
      setSettings(s)
    } catch (e) {
      showToast('Database connection error: ' + e.message, true)
    } finally {
      setLoading(false)
    }
  }, [showToast])

  useEffect(() => { loadAll() }, [loadAll])

  const overdueTasks = tasks.filter(t => {
    if (t.status === 'Done' || t.status === 'Cancelled') return false
    const n = daysUntil(t.due_date)
    return n !== null && n < 0
  })
  const urgentRenewals = deals.filter(d => { const n = daysUntil(d.renewal); return n !== null && n < 90 })

  // ── DEAL CRUD ──
  async function saveDeal(d, eid) {
    try {
      if (eid) {
        await sbFetch(`deals?id=eq.${eid}`, { method: 'PATCH', body: JSON.stringify(dealToRow(d)) })
        setDeals(prev => prev.map(x => x.id === eid ? d : x))
        showToast('Deal updated')
      } else {
        await sbFetch('deals', { method: 'POST', body: JSON.stringify(dealToRow(d)) })
        setDeals(prev => [d, ...prev])
        showToast('Deal added')
      }
      setModal(null)
    } catch (e) { showToast('Error: ' + e.message, true) }
  }

  async function deleteDeal(id) {
    const d = deals.find(x => x.id === id)
    if (!confirm(`Delete deal for ${d?.name}?\nThis cannot be undone.`)) return
    try {
      await sbFetch(`deals?id=eq.${id}`, { method: 'DELETE' })
      setDeals(prev => prev.filter(x => x.id !== id))
      setModal(null)
      showToast('Deal deleted')
    } catch (e) { showToast('Error: ' + e.message, true) }
  }

  async function setStage(id, stage) {
    try {
      await sbFetch(`deals?id=eq.${id}`, { method: 'PATCH', body: JSON.stringify({ stage }) })
      setDeals(prev => prev.map(d => d.id === id ? { ...d, stage } : d))
      showToast('Stage updated to ' + stage)
    } catch (e) { showToast('Error: ' + e.message, true) }
  }

  async function addNote(dealId, noteDate, noteText) {
    await sbFetch('notes', { method: 'POST', body: JSON.stringify({ deal_id: dealId, note_date: noteDate, note_text: noteText }) })
  }

  // ── TASK CRUD ──
  async function saveTask(t, eid) {
    try {
      if (eid) {
        await sbFetch(`tasks?id=eq.${eid}`, { method: 'PATCH', body: JSON.stringify({ ...t, updated_at: new Date().toISOString() }) })
        setTasks(prev => prev.map(x => x.id === eid ? { ...x, ...t } : x))
        showToast('Task updated')
      } else {
        const row = { ...t, id: tuid() }
        await sbFetch('tasks', { method: 'POST', body: JSON.stringify(row) })
        setTasks(prev => [...prev, row])
        showToast('Task added')
      }
      setModal(null)
    } catch (e) { showToast('Error: ' + e.message, true) }
  }

  async function deleteTask(id) {
    if (!confirm('Delete this task? This cannot be undone.')) return
    try {
      await sbFetch(`tasks?id=eq.${id}`, { method: 'DELETE' })
      setTasks(prev => prev.filter(x => x.id !== id))
      setModal(null)
      showToast('Task deleted')
    } catch (e) { showToast('Error: ' + e.message, true) }
  }

  async function setTaskStatus(id, status) {
    try {
      await sbFetch(`tasks?id=eq.${id}`, { method: 'PATCH', body: JSON.stringify({ status, updated_at: new Date().toISOString() }) })
      setTasks(prev => prev.map(t => t.id === id ? { ...t, status } : t))
      showToast('Task updated')
    } catch (e) { showToast('Error: ' + e.message, true) }
  }

  // ── SAVE SETTINGS ──
  async function saveSettings(updates) {
    try {
      const upserts = Object.entries(updates).map(([key, value]) => ({ key, value, updated_at: new Date().toISOString() }))
      await sbFetch('settings', { method: 'POST', body: JSON.stringify(upserts), headers: { Prefer: 'resolution=merge-duplicates' } })
      setSettings(prev => ({ ...prev, ...updates }))
      showToast('Signature saved')
      setModal(null)
    } catch (e) { showToast('Error: ' + e.message, true) }
  }

  // ── SEND TEST EMAIL ──
  async function sendTestEmail() {
    const sig = {
      name: settings.sig_name || 'Vatsal Barot',
      title: settings.sig_title || 'Associate Mortgage Broker',
      email: settings.sig_email || 'vatsal@vatsalbarotmortgages.ca',
      phone: settings.sig_phone || '',
      brokerLicense: settings.sig_broker_license || '#30005730',
      brokerageLicense: settings.sig_brokerage_license || '#3000168',
      tagline: settings.sig_tagline || 'Personalized. Simplified. Trusted.',
    }
    const testDeal = {
      name: 'John & Jane Smith',
      b2_name: '',
      property: '42 Maple Street, Moncton, NB',
      stage: 'Approved',
      last_note: '2025-04-23: Approval received from First National at 4.89% fixed 5yr. Conditions sent to clients.',
    }
    try {
      const res = await fetch('/api/send-test-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'partner_status',
          to: 'vatsal.barot98@gmail.com',
          sig,
          data: { partnerName: 'Sarah Chen (Test)', deals: [testDeal] },
        }),
      })
      const data = await res.json()
      if (data.success) showToast('Test email sent to vatsal.barot98@gmail.com ✓')
      else showToast('Email error: ' + data.error, true)
    } catch (e) { showToast('Error: ' + e.message, true) }
  }

  // ── EXPORT CSV ──
  function doExport() {
    if (!deals.length) { showToast('Nothing to export', true); return }
    const headers = ['ID','Borrower','Email','Phone','Amount','Lender','Rate','Property','Stage','Renewal','Ref Partner','Ref Email']
    const rows = deals.map(d => [d.id,d.name,d.b1Email,d.b1Cell,d.amount,d.lender,d.rate,d.property,d.stage,d.renewal,d.refName,d.refEmail].map(v => `"${(v||'').replace(/"/g,'""')}"`).join(','))
    const csv = [headers.join(','), ...rows].join('\n')
    const a = document.createElement('a')
    a.href = URL.createObjectURL(new Blob([csv], { type: 'text/csv' }))
    a.download = `brokerdesk_${new Date().toISOString().slice(0,10)}.csv`
    a.click()
    showToast('CSV exported')
  }

  // ── IMPORT FILOGIX ──
  function onImport(e) {
    const file = e.target.files[0]; if (!file) return
    const reader = new FileReader()
    reader.onload = async (ev) => {
      const lines = ev.target.result.trim().split(/\r?\n/)
      if (lines.length < 2) return
      const hdrs = lines[0].split(',').map(h => h.replace(/^"|"$/g,'').trim())
      function gc(c,n){const i=hdrs.indexOf(n);return i>=0?(c[i]||'').trim():'';}
      const parsed = lines.slice(1).map(line => {
        const c = line.split(',').map(v=>v.replace(/^"|"$/g,'').trim())
        function g(n){return gc(c,n);}
        const b1f=g('B1_Borrower_First_Name'),b1l=g('B1_Borrower_Last_Name')
        const b2f=g('B2_Borrower_First_Name'),b2l=g('B2_Borrower_Last_Name')
        const pNum=g('P1_Property_Street_Number'),pUnit=g('P1_Property_Unit_Number')
        const street=[pUnit?pUnit+'-'+pNum:pNum,g('P1_Property_Street_Name'),g('P1_Property_Street_Type')].filter(Boolean).join(' ')
        const pCity=g('P1_Property_City'),pPost=g('P1_Property_Postal')
        const status=g('D1Deal_Status')||g('M1Status')||'Lead'
        const mapStage=s=>{s=(s||'').toLowerCase().trim();if(s==='in progress')return'Application Submitted';if(s==='accepted')return'Conditions Cleared';if(s==='approved')return'Approved';if(s==='funded')return'Funded';return'Lead';}
        return {
          id:g('M_1Application_Id')||g('M_1Loan_Code')||uid(),
          name:[b1f,b1l].filter(Boolean).join(' ')||'Unknown',
          b1First:b1f,b1Last:b1l,b1Name:[b1f,b1l].filter(Boolean).join(' '),
          b1DOB:g('B1_Borrower_Birth_Date'),b1Cell:g('B1_Borrower_Cell_Phone')||g('B1_Borrower_Home_Phone'),
          b1Email:g('B1_Borrower_Email_Address'),b1Employer:g('B1_Borrower_Employer'),b1Occ:g('B1_Borrower_Occupation'),
          b1Street:street,b1City:pCity,b1Prov:g('B1_Borrower_Province'),b1Postal:pPost,
          b2First:b2f,b2Last:b2l,b2Name:[b2f,b2l].filter(Boolean).join(' '),
          b2DOB:g('B2_Borrower_Birth_Date'),b2Cell:g('B2_Borrower_Cell_Phone'),b2Email:g('B2_Borrower_Email_Address'),
          b2Employer:g('B2_Borrower_Employer'),b2Occ:g('B2_Borrower_Occupation'),
          propStreet:street,propCity:pCity,propProv:g('P1_Property_Province'),propPostal:pPost,
          property:[street,pCity,pPost].filter(Boolean).join(', '),
          occupancy:g('P1_Property_Occupancy'),propValue:'',
          amount:g('M_1Mortgage_Amount'),lender:g('L1_Lender_Name_Mortgage1'),mortType:g('M_1Mortgage_Type'),
          rate:g('M_1Rate'),intType:g('M_1Interest_Type'),term:g('M_1Term'),amort:g('M_1Amortization'),
          closing:g('M_1Closing_Date'),firstPay:g('M_1First_Payment_Date'),renewal:g('M_1Maturity_Date'),
          appType:g('M_1Application_Type'),entryDate:g('M_1Entry_Date'),stage:mapStage(status),
          refName:'',refCompany:'',refType:'',refEmail:'',refPhone:'',initNotes:''
        }
      }).filter(d=>d.name!=='Unknown')
      setLoading(true)
      let added=0,updated=0
      for(const p of parsed){
        const existing=deals.find(x=>x.id===p.id)
        if(existing){
          await sbFetch(`deals?id=eq.${p.id}`,{method:'PATCH',body:JSON.stringify(dealToRow({...existing,...p,stage:existing.stage}))})
          updated++
        } else {
          await sbFetch('deals',{method:'POST',body:JSON.stringify(dealToRow(p))})
          added++
        }
      }
      await loadAll()
      showToast(`${added} added, ${updated} updated`)
    }
    reader.readAsText(file)
    e.target.value = ''
  }

  const sig = {
    name: settings.sig_name || 'Vatsal Barot',
    title: settings.sig_title || 'Associate Mortgage Broker',
    email: settings.sig_email || 'vatsal@vatsalbarotmortgages.ca',
    phone: settings.sig_phone || '',
    brokerLicense: settings.sig_broker_license || '#30005730',
    brokerageLicense: settings.sig_brokerage_license || '#3000168',
    tagline: settings.sig_tagline || 'Personalized. Simplified. Trusted.',
  }

  return (
    <>
      <Head><title>BrokerDesk — Mortgage CRM</title></Head>
      <style>{`
        *{box-sizing:border-box;margin:0;padding:0}
        :root{--bg:#fff;--bg2:#f8f8f6;--bg3:#f0efe9;--text:#0f0f0f;--text2:#6b7280;--text3:#9ca3af;--border:#e5e7eb;--border2:#d1d5db;--brand:#1e40af;--brand2:#3b82f6;--brand-light:#eff6ff;--rad:10px;--rad-lg:14px;--rad-xl:20px;--sh:0 1px 3px rgba(0,0,0,.08);--sh-md:0 4px 16px rgba(0,0,0,.10);--sh-lg:0 12px 40px rgba(0,0,0,.14)}
        body{font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;color:var(--text);background:var(--bg3);min-height:100vh;font-size:14px;-webkit-font-smoothing:antialiased}
        .layout{display:flex;min-height:100vh}
        .sidebar{width:220px;background:linear-gradient(180deg,#0f172a,#1e293b);display:flex;flex-direction:column;position:fixed;top:0;left:0;height:100vh;z-index:40;flex-shrink:0}
        .sb-logo{padding:22px 20px 16px;border-bottom:1px solid rgba(255,255,255,.08)}
        .sb-icon{width:36px;height:36px;background:linear-gradient(135deg,#3b82f6,#6366f1);border-radius:10px;display:flex;align-items:center;justify-content:center;font-size:18px;margin-bottom:10px}
        .sb-name{font-size:16px;font-weight:700;color:#fff;letter-spacing:-.02em}
        .sb-sub{font-size:10px;color:rgba(255,255,255,.4);margin-top:1px;letter-spacing:.04em;text-transform:uppercase}
        .sb-nav{padding:14px 10px;flex:1}
        .sb-sec{font-size:9px;font-weight:700;color:rgba(255,255,255,.3);letter-spacing:.08em;text-transform:uppercase;padding:0 10px;margin:16px 0 6px}
        .nav-item{display:flex;align-items:center;gap:10px;padding:9px 12px;border-radius:var(--rad);cursor:pointer;color:rgba(255,255,255,.6);font-size:13px;font-weight:500;transition:all .15s;margin-bottom:2px;border:none;background:transparent;width:100%;font-family:inherit;text-align:left}
        .nav-item:hover{background:rgba(255,255,255,.08);color:#fff}
        .nav-item.active{background:rgba(59,130,246,.25);color:#fff}
        .nav-icon{width:20px;height:20px;display:flex;align-items:center;justify-content:center;font-size:15px;flex-shrink:0}
        .nav-badge{margin-left:auto;background:rgba(239,68,68,.9);color:#fff;font-size:10px;font-weight:700;padding:1px 6px;border-radius:8px}
        .sb-bottom{padding:14px 10px;border-top:1px solid rgba(255,255,255,.08)}
        .sb-user{display:flex;align-items:center;gap:10px;padding:8px 10px}
        .sb-av{width:32px;height:32px;border-radius:50%;background:linear-gradient(135deg,#3b82f6,#6366f1);display:flex;align-items:center;justify-content:center;font-size:13px;font-weight:700;color:#fff;flex-shrink:0}
        .main{margin-left:220px;flex:1;display:flex;flex-direction:column;min-height:100vh}
        .topbar{display:flex;align-items:center;justify-content:space-between;padding:14px 24px;background:var(--bg);border-bottom:1px solid var(--border);position:sticky;top:0;z-index:30;flex-wrap:wrap;gap:10px}
        .btn{padding:8px 16px;border-radius:var(--rad);border:1px solid var(--border2);background:var(--bg);color:var(--text);cursor:pointer;font-size:13px;font-family:inherit;font-weight:500;display:inline-flex;align-items:center;gap:6px;transition:all .12s;white-space:nowrap}
        .btn:hover{background:var(--bg2)}
        .btn-p{background:linear-gradient(135deg,#1e40af,#3b82f6);color:#fff;border:none;box-shadow:0 2px 8px rgba(59,130,246,.35)}
        .btn-p:hover{opacity:.92}
        .btn-s{background:linear-gradient(135deg,#065f46,#059669);color:#fff;border:none;box-shadow:0 2px 8px rgba(5,150,105,.3)}
        .btn-s:hover{opacity:.92}
        .btn-d{background:#fef2f2;color:#dc2626;border-color:#fecaca}
        .btn-d:hover{background:#fee2e2}
        .btn-lg{padding:10px 22px;font-size:14px;border-radius:var(--rad-lg)}
        .content{padding:24px;flex:1}
        .stats{display:grid;grid-template-columns:repeat(4,1fr);gap:14px;margin-bottom:22px}
        .scard{background:var(--bg);border:1px solid var(--border);border-radius:var(--rad-lg);padding:18px 20px;box-shadow:var(--sh);position:relative;overflow:hidden}
        .scard::before{content:'';position:absolute;top:0;left:0;right:0;height:3px}
        .scard.c-blue::before{background:linear-gradient(90deg,#1e40af,#3b82f6)}
        .scard.c-green::before{background:linear-gradient(90deg,#065f46,#10b981)}
        .scard.c-amber::before{background:linear-gradient(90deg,#92400e,#f59e0b)}
        .scard.c-red::before{background:linear-gradient(90deg,#991b1b,#ef4444)}
        .scard.c-purple::before{background:linear-gradient(90deg,#5b21b6,#8b5cf6)}
        .sic{width:38px;height:38px;border-radius:var(--rad);display:flex;align-items:center;justify-content:center;font-size:18px;margin-bottom:10px}
        .sic.c-blue{background:#eff6ff}.sic.c-green{background:#f0fdf4}.sic.c-amber{background:#fffbeb}.sic.c-red{background:#fef2f2}.sic.c-purple{background:#f5f3ff}
        .slbl{font-size:11px;font-weight:600;color:var(--text2);text-transform:uppercase;letter-spacing:.05em;margin-bottom:4px}
        .sval{font-size:26px;font-weight:800;letter-spacing:-.03em;line-height:1}
        .ssub{font-size:11px;color:var(--text3);margin-top:5px}
        .kanban-wrap{overflow-x:auto;padding-bottom:16px}
        .kanban{display:flex;gap:12px;min-width:max-content;align-items:flex-start;padding:2px}
        .kcol{background:var(--bg2);border-radius:var(--rad-lg);padding:12px;width:190px;flex-shrink:0;border:1px solid var(--border);box-shadow:var(--sh)}
        .kcol-head{margin-bottom:10px}
        .kcol-tr{display:flex;justify-content:space-between;align-items:center;margin-bottom:2px}
        .kdot{width:8px;height:8px;border-radius:50%;flex-shrink:0;margin-right:5px}
        .ktitle{font-size:10px;font-weight:700;letter-spacing:.05em;text-transform:uppercase;display:flex;align-items:center}
        .kcnt{font-size:11px;font-weight:700;background:var(--bg);border:1px solid var(--border);border-radius:8px;padding:1px 8px;color:var(--text2)}
        .kval{font-size:10px;color:var(--text3);font-weight:600;margin-top:2px;padding-left:13px}
        .kcard{background:var(--bg);border:1px solid var(--border);border-radius:var(--rad);padding:12px;margin-bottom:8px;cursor:pointer;transition:all .12s;box-shadow:var(--sh)}
        .kcard:hover{border-color:var(--brand2);box-shadow:0 4px 16px rgba(59,130,246,.15);transform:translateY(-1px)}
        .kacc{height:3px;border-radius:2px;margin-bottom:10px}
        .kname{font-size:13px;font-weight:700;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;margin-bottom:1px}
        .kco{font-size:10px;color:var(--text2);margin-bottom:5px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
        .kamt{font-size:13px;font-weight:800;color:var(--brand);margin-bottom:6px}
        .kfoot{display:flex;gap:4px;flex-wrap:wrap;align-items:center}
        .klender{font-size:10px;color:var(--text2);max-width:100px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;background:var(--bg2);padding:2px 6px;border-radius:5px}
        .krate{font-size:10px;color:var(--text2);background:var(--bg2);padding:2px 6px;border-radius:5px}
        .kempty{font-size:11px;color:var(--text3);text-align:center;padding:24px 0;font-style:italic;border:1.5px dashed var(--border);border-radius:var(--rad);margin-top:4px}
        .rpill{font-size:10px;font-weight:700;padding:2px 7px;border-radius:6px;white-space:nowrap}
        .purgnt{background:#fef2f2;color:#991b1b}.psoon{background:#fffbeb;color:#92400e}.pokk{background:#f0fdf4;color:#065f46}
        .badge{display:inline-flex;align-items:center;padding:3px 9px;border-radius:20px;font-size:11px;font-weight:600}
        .sbar{display:flex;gap:10px;margin-bottom:16px;flex-wrap:wrap;align-items:center}
        .sbar input,.sbar select{padding:9px 13px;border-radius:var(--rad);border:1px solid var(--border2);background:var(--bg);color:var(--text);font-size:13px;font-family:inherit}
        .sbar input{flex:1;min-width:200px}
        .twrap{background:var(--bg);border:1px solid var(--border);border-radius:var(--rad-lg);overflow:hidden;box-shadow:var(--sh)}
        table{width:100%;border-collapse:collapse}
        th{text-align:left;font-size:10px;font-weight:700;color:var(--text2);padding:10px 14px;border-bottom:1px solid var(--border);letter-spacing:.05em;text-transform:uppercase;background:var(--bg2)}
        td{padding:11px 14px;border-bottom:1px solid var(--border);font-size:13px;vertical-align:middle}
        tr:last-child td{border-bottom:none}
        tr:hover td{background:var(--brand-light)}
        .rrow{display:flex;align-items:center;gap:14px;padding:12px 16px;border-radius:var(--rad-lg);margin-bottom:8px;cursor:pointer;border:1px solid transparent;box-shadow:var(--sh)}
        .rrow:hover{box-shadow:var(--sh-md);transform:translateY(-1px)}
        .r-urgnt{background:#fef2f2;border-color:#fecaca}.r-soon{background:#fffbeb;border-color:#fde68a}.r-ok{background:var(--bg);border-color:var(--border)}
        .sec-head{font-size:11px;font-weight:700;color:var(--text2);text-transform:uppercase;letter-spacing:.06em;margin:20px 0 10px;display:flex;align-items:center;gap:8px}
        .sec-head::after{content:'';flex:1;height:1px;background:var(--border)}
        .two-col{display:grid;grid-template-columns:1fr 1fr;gap:16px}
        .panel{background:var(--bg);border:1px solid var(--border);border-radius:var(--rad-lg);padding:18px;box-shadow:var(--sh)}
        .panel h3{font-size:13px;font-weight:700;margin-bottom:14px}
        .blbl{display:flex;justify-content:space-between;font-size:12px;margin-bottom:4px}
        .btrack{height:6px;background:var(--bg3);border-radius:4px;overflow:hidden}
        .bfill{height:6px;border-radius:4px}
        .av{border-radius:50%;display:flex;align-items:center;justify-content:center;font-weight:700;flex-shrink:0}
        .modal-wrap{position:fixed;inset:0;background:rgba(15,23,42,.6);display:flex;align-items:flex-start;justify-content:center;z-index:200;padding:24px 12px;overflow-y:auto;backdrop-filter:blur(4px)}
        .modal{background:var(--bg);border-radius:var(--rad-xl);width:700px;max-width:98vw;border:1px solid var(--border);box-shadow:var(--sh-lg);overflow:hidden}
        .mhdr{padding:20px 26px;border-bottom:1px solid var(--border);background:linear-gradient(135deg,#0f172a,#1e3a5f);display:flex;justify-content:space-between;align-items:flex-start}
        .mhdr-title{font-size:16px;font-weight:700;color:#fff}
        .mhdr-sub{font-size:12px;color:rgba(255,255,255,.5);margin-top:3px}
        .mbody{padding:0 26px 8px;max-height:70vh;overflow-y:auto}
        .fsec{margin-top:22px}
        .fsec-hdr{display:flex;align-items:center;gap:12px;margin-bottom:14px;padding-bottom:10px;border-bottom:2px solid var(--border)}
        .fsec-icon{width:34px;height:34px;border-radius:var(--rad);display:flex;align-items:center;justify-content:center;font-size:16px;flex-shrink:0;background:var(--bg3)}
        .fsec-title{font-size:14px;font-weight:700}
        .fsec-sub{font-size:11px;color:var(--text2);margin-top:1px}
        .fg{display:grid;gap:12px;margin-bottom:14px}
        .fg2{grid-template-columns:1fr 1fr}.fg3{grid-template-columns:1fr 1fr 1fr}.fg4{grid-template-columns:1fr 1fr 1fr 1fr}
        .field{display:flex;flex-direction:column;gap:5px}
        .field label{font-size:11px;font-weight:700;color:var(--text2);text-transform:uppercase;letter-spacing:.04em}
        .field input,.field select,.field textarea{padding:9px 12px;border-radius:var(--rad);border:1px solid var(--border2);background:var(--bg);color:var(--text);font-size:13px;font-family:inherit;width:100%}
        .field input:focus,.field select:focus,.field textarea:focus{outline:none;border-color:var(--brand2);box-shadow:0 0 0 3px rgba(59,130,246,.12)}
        .field textarea{resize:vertical;min-height:72px}
        .mfoot{display:flex;gap:10px;padding:16px 26px;border-top:1px solid var(--border);background:var(--bg2);flex-wrap:wrap}
        .sec-t{font-size:10px;font-weight:700;text-transform:uppercase;letter-spacing:.06em;color:var(--text2);margin:18px 0 10px;padding-bottom:6px;border-bottom:1px solid var(--border)}
        .igrid{display:grid;grid-template-columns:1fr 1fr}
        .icell{padding:9px 0;border-bottom:1px solid var(--border)}
        .ilbl{font-size:10px;color:var(--text2);text-transform:uppercase;letter-spacing:.04em;font-weight:600}
        .ival{font-size:13px;font-weight:500;margin-top:2px;word-break:break-word}
        .note-area{width:100%;border:1px solid var(--border2);border-radius:var(--rad);padding:10px 12px;font-size:13px;font-family:inherit;color:var(--text);background:var(--bg);resize:none}
        .nentry{font-size:12px;padding:8px 0;border-bottom:1px solid var(--border);color:var(--text2);line-height:1.6;display:flex;gap:8px}
        .ndot{width:6px;height:6px;border-radius:50%;background:var(--brand2);margin-top:5px;flex-shrink:0}
        .ref-row{margin-bottom:14px;cursor:pointer;padding:10px;border-radius:var(--rad);border:1px solid transparent;transition:all .12s}
        .ref-row:hover{background:var(--bg2);border-color:var(--border)}
        .ref-row.selected{background:var(--brand-light);border-color:var(--brand2)}
        .toast-wrap{position:fixed;bottom:24px;right:24px;z-index:999}
        .toast{background:#0f172a;color:#fff;padding:12px 20px;border-radius:var(--rad-lg);font-size:13px;font-weight:500;box-shadow:var(--sh-lg);display:flex;align-items:center;gap:8px;animation:slideUp .2s ease}
        .toast.error{background:#991b1b}
        @keyframes slideUp{from{opacity:0;transform:translateY(10px)}to{opacity:1;transform:translateY(0)}}
        .spinner{display:inline-block;width:16px;height:16px;border:2px solid rgba(255,255,255,.3);border-top-color:#fff;border-radius:50%;animation:spin .6s linear infinite}
        @keyframes spin{to{transform:rotate(360deg)}}
        .task-card{background:var(--bg);border:1px solid var(--border);border-radius:var(--rad);padding:12px;margin-bottom:8px;cursor:pointer;box-shadow:var(--sh);transition:all .12s}
        .task-card:hover{border-color:var(--brand2);box-shadow:0 4px 16px rgba(59,130,246,.15);transform:translateY(-1px)}
        .due-urgnt{background:#fef2f2;color:#991b1b}.due-soon{background:#fffbeb;color:#92400e}.due-ok{background:#f0fdf4;color:#065f46}.due-none{background:var(--bg2);color:var(--text2)}
        @media(max-width:900px){.sidebar{width:60px}.sb-name,.sb-sub,.nav-item span,.sb-uname,.sb-urole,.sb-sec{display:none}.main{margin-left:60px}.sb-logo{padding:14px 10px}.sb-icon{margin:0 auto}.nav-item{justify-content:center;padding:10px}}
        @media(max-width:680px){.stats{grid-template-columns:1fr 1fr}.two-col,.fg2,.fg3,.fg4{grid-template-columns:1fr}.igrid{grid-template-columns:1fr}.main{margin-left:0}.sidebar{display:none}}
      `}</style>

      <div className="layout">
        {/* SIDEBAR */}
        <aside className="sidebar">
          <div className="sb-logo">
            <div className="sb-icon">🏦</div>
            <div className="sb-name">BrokerDesk</div>
            <div className="sb-sub">Mortgage CRM</div>
          </div>
          <nav className="sb-nav">
            <div className="sb-sec">Main</div>
            {[['dashboard','📊','Dashboard'],['pipeline','🗂','Kanban Pipeline'],['contacts','👥','Contacts'],['tasks','✅','Tasks'],['referrals','🤝','Referral Partners']].map(([id,icon,label])=>(
              <button key={id} className={`nav-item${tab===id?' active':''}`} onClick={()=>setTab(id)}>
                <span className="nav-icon">{icon}</span><span>{label}</span>
                {id==='tasks'&&overdueTasks.length>0&&<span className="nav-badge">{overdueTasks.length}</span>}
              </button>
            ))}
            <div className="sb-sec">Alerts</div>
            <button className={`nav-item${tab==='renewals'?' active':''}`} onClick={()=>setTab('renewals')}>
              <span className="nav-icon">🔔</span><span>Renewals</span>
              {urgentRenewals.length>0&&<span className="nav-badge">{urgentRenewals.length}</span>}
            </button>
            <div className="sb-sec">Settings</div>
            <button className={`nav-item${tab==='signature'?' active':''}`} onClick={()=>setTab('signature')}>
              <span className="nav-icon">✍️</span><span>Email Signature</span>
            </button>
          </nav>
          <div className="sb-bottom">
            <div className="sb-user">
              <div className="sb-av">VB</div>
              <div><div style={{fontSize:12,fontWeight:600,color:'#fff'}}>{sig.name}</div><div style={{fontSize:10,color:'rgba(255,255,255,.4)'}}>{sig.title}</div></div>
            </div>
          </div>
        </aside>

        {/* MAIN */}
        <div className="main">
          <div className="topbar">
            <div>
              <div className="tb-title" style={{fontSize:17,fontWeight:700,letterSpacing:'-.02em'}}>
                {{dashboard:'Dashboard',pipeline:'Kanban Pipeline',contacts:'Contacts',tasks:'Tasks',referrals:'Referral Partners',renewals:'Renewals',signature:'Email Signature'}[tab]||tab}
              </div>
              <div style={{fontSize:12,color:'var(--text2)',marginTop:1}}>
                {{dashboard:'Welcome back, Vatsal',pipeline:'Track your deals across every stage',contacts:'All your mortgage clients',tasks:'Follow-up tasks and to-dos',referrals:'See who is sending you business',renewals:'Maturity dates and renewals',signature:'Customize your email signature'}[tab]||''}
              </div>
            </div>
            <div style={{display:'flex',gap:8,alignItems:'center',flexWrap:'wrap'}}>
              {tab==='tasks'
                ? <button className="btn btn-s btn-lg" onClick={()=>setModal({type:'task',data:null})}>+ Add Task</button>
                : <button className="btn btn-s btn-lg" onClick={()=>setModal({type:'deal',data:null})}>+ Add Deal</button>
              }
              <button className="btn" onClick={doExport}>↓ Export CSV</button>
              <button className="btn" onClick={sendTestEmail}>📧 Send Test Email</button>
              <label className="btn" style={{cursor:'pointer'}}>
                ↑ Import Filogix
                <input type="file" accept=".csv" style={{display:'none'}} onChange={onImport}/>
              </label>
            </div>
          </div>

          <div className="content">
            {loading ? (
              <div style={{textAlign:'center',padding:60,color:'var(--text2)'}}>
                <div className="spinner" style={{width:32,height:32,border:'3px solid #e5e7eb',borderTopColor:'var(--brand)',borderRadius:'50%',margin:'0 auto 12px'}}></div>
                <div>Loading your data...</div>
              </div>
            ) : (
              <>
                {tab==='dashboard' && <Dashboard deals={deals} tasks={tasks} setModal={setModal} setTab={setTab}/>}
                {tab==='pipeline' && <Pipeline deals={deals} setModal={setModal} setTab={setTab}/>}
                {tab==='contacts' && <Contacts deals={deals} search={contactSearch} setSearch={setContactSearch} stageFilter={contactStage} setStageFilter={setContactStage} renFilter={contactRen} setRenFilter={setContactRen} setModal={setModal}/>}
                {tab==='tasks' && <Tasks tasks={tasks} deals={deals} setModal={setModal} setTaskStatus={setTaskStatus}/>}
                {tab==='referrals' && <Referrals deals={deals} refFilter={refFilter} setRefFilter={setRefFilter} refSort={refSort} setRefSort={setRefSort} setModal={setModal}/>}
                {tab==='renewals' && <Renewals deals={deals} setModal={setModal}/>}
                {tab==='signature' && <Signature settings={settings} saveSettings={saveSettings} sendTestEmail={sendTestEmail}/>}
              </>
            )}
          </div>
        </div>
      </div>

      {/* MODALS */}
      {modal?.type==='deal' && <DealModal deal={modal.data} deals={deals} onSave={saveDeal} onDelete={deleteDeal} onClose={()=>setModal(null)} onStageChange={setStage} onAddNote={addNote} showToast={showToast} setModal={setModal}/>}
      {modal?.type==='task' && <TaskModal task={modal.data} deals={deals} onSave={saveTask} onDelete={deleteTask} onClose={()=>setModal(null)}/>}

      {/* TOAST */}
      {toast && (
        <div className="toast-wrap">
          <div className={`toast${toast.isError?' error':''}`}>{toast.isError?'❌':'✅'} {toast.msg}</div>
        </div>
      )}
    </>
  )
}

// ── DASHBOARD ──
function Dashboard({ deals, tasks, setModal, setTab }) {
  const total = deals.reduce((s,d)=>{const n=parseFloat(d.amount);return s+(isNaN(n)?0:n);},0)
  const funded = deals.filter(d=>d.stage==='Funded').length
  const overdue = tasks.filter(t=>t.status!=='Done'&&t.status!=='Cancelled'&&daysUntil(t.due_date)<0).length
  const active = deals.filter(d=>d.stage!=='Funded'&&d.stage!=='Info Only / No Deal').length
  return (
    <div>
      <div className="stats">
        {[['c-blue','📁','Total Files',deals.length,active+' active'],['c-green','💰','Pipeline Value','$'+Math.round(total/1000)+'K','all stages'],['c-amber','✅','Funded',funded,Math.round(deals.length?funded/deals.length*100:0)+'% rate'],['c-red','⚠️','Overdue Tasks',overdue,overdue?'action needed':'all clear']].map(([c,icon,lbl,val,sub])=>(
          <div key={lbl} className={`scard ${c}`}>
            <div className={`sic ${c}`}>{icon}</div>
            <div className="slbl">{lbl}</div>
            <div className="sval" style={c==='c-red'&&overdue>0?{color:'#dc2626'}:{}}>{val}</div>
            <div className="ssub">{sub}</div>
          </div>
        ))}
      </div>
      <div className="two-col">
        <div className="panel">
          <h3>📊 Stage breakdown</h3>
          {STAGES.map((s,i)=>{
            const cnt=deals.filter(d=>d.stage===s).length
            const val=deals.filter(d=>d.stage===s).reduce((sum,d)=>{const n=parseFloat(d.amount);return sum+(isNaN(n)?0:n);},0)
            const pct=deals.length?Math.round(cnt/deals.length*100):0
            const sh=s.length>22?s.slice(0,21)+'…':s
            return <div key={s} style={{marginBottom:10}}><div className="blbl"><span style={{fontWeight:500}}>{sh}</span><span style={{color:'var(--text2)'}}>{cnt}{val>0?` · $${Math.round(val/1000)}K`:''}</span></div><div className="btrack"><div className="bfill" style={{background:SBAR[i],width:pct+'%'}}></div></div></div>
          })}
        </div>
        <div className="panel">
          <h3>🔔 Upcoming maturities</h3>
          {deals.filter(d=>d.renewal).sort((a,b)=>new Date(a.renewal)-new Date(b.renewal)).slice(0,7).map(d=>{
            const n=daysUntil(d.renewal);const ac=avc(d.name)
            return <div key={d.id} style={{display:'flex',justifyContent:'space-between',alignItems:'center',padding:'9px 0',borderBottom:'1px solid var(--border)',cursor:'pointer'}} onClick={()=>setModal({type:'deal',data:d})}>
              <div style={{display:'flex',alignItems:'center',gap:9}}>
                <div className="av" style={{width:28,height:28,fontSize:10,background:ac[0],color:ac[1]}}>{ini(d.name)}</div>
                <div><div style={{fontSize:13,fontWeight:600}}>{d.name}</div><div style={{fontSize:11,color:'var(--text2)'}}>{d.lender||'—'}</div></div>
              </div>
              <span className={`rpill ${rpCls(d.renewal)}`}>{n!==null?n+'d':d.renewal}</span>
            </div>
          })}
          {!deals.filter(d=>d.renewal).length&&<div style={{fontSize:13,color:'var(--text2)'}}>No maturity dates yet.</div>}
        </div>
      </div>
    </div>
  )
}

// ── PIPELINE ──
function Pipeline({ deals, setModal }) {
  if (!deals.length) return <EmptyState setModal={setModal}/>
  return (
    <div className="kanban-wrap">
      <div className="kanban">
        {STAGES.map((s,i)=>{
          const col=deals.filter(d=>d.stage===s)
          const val=col.reduce((sum,d)=>{const n=parseFloat(d.amount);return sum+(isNaN(n)?0:n);},0)
          return (
            <div key={s} className="kcol">
              <div className="kcol-head">
                <div className="kcol-tr">
                  <div className="ktitle"><span className="kdot" style={{background:SDOT[i]}}></span>{s}</div>
                  <span className="kcnt">{col.length}</span>
                </div>
                {val>0&&<div className="kval">${Math.round(val/1000)}K</div>}
              </div>
              {!col.length&&<div className="kempty">No files</div>}
              {col.map(d=>{
                const n=daysUntil(d.renewal)
                return (
                  <div key={d.id} className="kcard" onClick={()=>setModal({type:'deal',data:d})}>
                    <div className="kacc" style={{background:SDOT[i]}}></div>
                    <div className="kname">{d.name}</div>
                    {d.b2Name&&<div className="kco">+ {d.b2Name}</div>}
                    {parseFloat(d.amount)>0&&<div className="kamt">{fmtAmt(d.amount)}</div>}
                    <div className="kfoot">
                      {d.lender&&<span className="klender">{d.lender}</span>}
                      {d.rate&&<span className="krate">{d.rate}%</span>}
                      {n!==null&&<span className={`rpill ${rpCls(d.renewal)}`}>{n}d</span>}
                    </div>
                  </div>
                )
              })}
            </div>
          )
        })}
      </div>
    </div>
  )
}

// ── CONTACTS ──
function Contacts({ deals, search, setSearch, stageFilter, setStageFilter, renFilter, setRenFilter, setModal }) {
  const filtered = deals.filter(d=>{
    if(stageFilter&&d.stage!==stageFilter)return false
    if(renFilter==='u'){const n=daysUntil(d.renewal);if(n===null||n>=60)return false}
    if(renFilter==='s'){const n=daysUntil(d.renewal);if(n===null||n>=180)return false}
    if(search){const q=search.toLowerCase();if(![d.name,d.b2Name,d.b1Email,d.b1Cell,d.lender,d.property,d.refName].join(' ').toLowerCase().includes(q))return false}
    return true
  })
  return (
    <div>
      <div className="sbar">
        <input type="text" placeholder="🔍  Search name, email, phone, lender..." value={search} onChange={e=>setSearch(e.target.value)}/>
        <select value={stageFilter} onChange={e=>setStageFilter(e.target.value)} style={{minWidth:160}}>
          <option value="">All stages</option>
          {STAGES.map(s=><option key={s}>{s}</option>)}
        </select>
        <select value={renFilter} onChange={e=>setRenFilter(e.target.value)} style={{minWidth:150}}>
          <option value="">All renewals</option>
          <option value="u">Under 60 days</option>
          <option value="s">Within 6 months</option>
        </select>
        <button className="btn btn-s" onClick={()=>setModal({type:'deal',data:null})}>+ Add Deal</button>
      </div>
      <div className="twrap">
        {!filtered.length ? (
          <div style={{textAlign:'center',padding:48,color:'var(--text2)',fontSize:13}}>No contacts found.</div>
        ) : (
          <table>
            <thead><tr><th>Borrower</th><th>Phone</th><th>Email</th><th>Mortgage</th><th>Lender</th><th>Stage</th><th>Maturity</th></tr></thead>
            <tbody>
              {filtered.map(d=>{
                const n=daysUntil(d.renewal);const ac=avc(d.name);const si=stageIdx(d.stage)
                const sh=d.stage.replace('Application ','App. ').replace('Conditions ','Cond. ').replace('Documents ','Docs ').replace('Info Only / No Deal','No Deal')
                return (
                  <tr key={d.id} style={{cursor:'pointer'}} onClick={()=>setModal({type:'deal',data:d})}>
                    <td><div style={{display:'flex',alignItems:'center',gap:10}}>
                      <div className="av" style={{width:34,height:34,fontSize:12,background:ac[0],color:ac[1]}}>{ini(d.name)}</div>
                      <div><div style={{fontWeight:700}}>{d.name}</div>{d.b2Name&&<div style={{fontSize:11,color:'var(--text2)'}}>+ {d.b2Name}</div>}{d.property&&<div style={{fontSize:10,color:'var(--text3)'}}>{d.property}</div>}</div>
                    </div></td>
                    <td style={{fontSize:12,color:'var(--text2)'}}>{d.b1Cell||'—'}</td>
                    <td style={{fontSize:12}}>{d.b1Email?<a href={`mailto:${d.b1Email}`}>{d.b1Email}</a>:'—'}</td>
                    <td><strong>{fmtAmt(d.amount)}</strong>{d.rate&&<div style={{fontSize:10,color:'var(--text2)'}}>{d.rate}% · {d.term}mo</div>}</td>
                    <td style={{fontSize:12}}>{d.lender||'—'}</td>
                    <td><span className="badge" style={{background:SBG[si],color:SFG[si],fontSize:10}}>{sh}</span></td>
                    <td>{d.renewal?<><div style={{fontSize:12,fontWeight:700,color:n!==null&&n<90?'#dc2626':''}}>{d.renewal}</div>{n!==null&&<div style={{fontSize:10,color:'var(--text3)'}}>{n}d</div>}</>:<span style={{color:'var(--text3)'}}>—</span>}</td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        )}
      </div>
    </div>
  )
}

// ── TASKS ──
function Tasks({ tasks, deals, setModal, setTaskStatus }) {
  const TCOLS = [
    {id:'To Do',color:'#3b82f6',dot:'#3b82f6'},
    {id:'In Progress',color:'#f59e0b',dot:'#f59e0b'},
    {id:'Done',color:'#22c55e',dot:'#22c55e'},
    {id:'Cancelled',color:'#9ca3af',dot:'#9ca3af'},
  ]
  function dueCls(due,status){
    if(status==='Done'||status==='Cancelled')return 'due-none'
    const n=daysUntil(due)
    if(n===null)return 'due-none'
    if(n<0)return 'due-urgnt'
    if(n<=3)return 'due-soon'
    return 'due-ok'
  }
  function dueLabel(due,status){
    if(status==='Done'||status==='Cancelled')return due||'—'
    const n=daysUntil(due)
    if(n===null)return due||'No date'
    if(n<0)return `Overdue ${Math.abs(n)}d`
    if(n===0)return 'Due today'
    if(n===1)return 'Due tomorrow'
    return `Due in ${n}d`
  }
  const linkedDeal = (task) => deals.find(d=>d.id===task.deal_id)
  return (
    <div className="kanban-wrap">
      <div className="kanban">
        {TCOLS.map(col=>{
          const colTasks=tasks.filter(t=>t.status===col.id)
          return (
            <div key={col.id} className="kcol" style={{width:240}}>
              <div className="kcol-head">
                <div className="kcol-tr">
                  <div className="ktitle"><span className="kdot" style={{background:col.dot}}></span>{col.id}</div>
                  <span className="kcnt">{colTasks.length}</span>
                </div>
              </div>
              {!colTasks.length&&<div className="kempty">No tasks</div>}
              {colTasks.map(t=>{
                const deal=linkedDeal(t)
                return (
                  <div key={t.id} className="task-card" onClick={()=>setModal({type:'task',data:t})}>
                    <div style={{display:'flex',justifyContent:'space-between',alignItems:'flex-start',marginBottom:6}}>
                      <div style={{fontSize:13,fontWeight:700,flex:1,paddingRight:8}}>{t.client_name||'No name'}</div>
                      <span className={`rpill ${dueCls(t.due_date,t.status)}`} style={{fontSize:10,fontWeight:700}}>{dueLabel(t.due_date,t.status)}</span>
                    </div>
                    {t.transaction_type&&<div style={{fontSize:10,background:'var(--bg2)',color:'var(--text2)',padding:'2px 7px',borderRadius:5,display:'inline-block',marginBottom:5}}>{t.transaction_type}</div>}
                    {t.client_phone&&<div style={{fontSize:11,color:'var(--text2)',marginBottom:2}}>📞 {t.client_phone}</div>}
                    {t.client_email&&<div style={{fontSize:11,color:'var(--text2)',marginBottom:2}}>✉️ {t.client_email}</div>}
                    {deal&&<div style={{fontSize:10,color:'var(--brand)',marginTop:5,padding:'3px 7px',background:'var(--brand-light)',borderRadius:5}}>🔗 {deal.name}</div>}
                    {t.notes&&<div style={{fontSize:11,color:'var(--text2)',marginTop:5,borderTop:'1px solid var(--border)',paddingTop:5,lineHeight:1.5}}>{t.notes.slice(0,80)}{t.notes.length>80?'…':''}</div>}
                    <div style={{display:'flex',gap:4,marginTop:8,flexWrap:'wrap'}}>
                      {TASK_STAGES.filter(s=>s!==t.status).map(s=>(
                        <button key={s} className="btn" style={{fontSize:10,padding:'3px 8px'}} onClick={e=>{e.stopPropagation();setTaskStatus(t.id,s)}}>→ {s}</button>
                      ))}
                    </div>
                  </div>
                )
              })}
            </div>
          )
        })}
      </div>
    </div>
  )
}

// ── RENEWALS ──
function Renewals({ deals, setModal }) {
  const withR=deals.filter(d=>d.renewal).sort((a,b)=>new Date(a.renewal)-new Date(b.renewal))
  const noR=deals.filter(d=>!d.renewal)
  if(!withR.length)return <div style={{textAlign:'center',padding:60,color:'var(--text2)',fontSize:13}}>No maturity dates yet.</div>
  const urgent=withR.filter(d=>{const n=daysUntil(d.renewal);return n!==null&&n<60})
  const soon=withR.filter(d=>{const n=daysUntil(d.renewal);return n!==null&&n>=60&&n<180})
  const later=withR.filter(d=>{const n=daysUntil(d.renewal);return n!==null&&n>=180})
  function rsec(title,items,cls){
    if(!items.length)return null
    return <div key={title}>
      <div className="sec-head">{title} ({items.length})</div>
      {items.map(d=>{
        const n=daysUntil(d.renewal);const si=stageIdx(d.stage);const ac=avc(d.name)
        return <div key={d.id} className={`rrow ${cls}`} onClick={()=>setModal({type:'deal',data:d})}>
          <div className="av" style={{width:36,height:36,fontSize:13,background:ac[0],color:ac[1]}}>{ini(d.name)}</div>
          <div style={{flex:1,minWidth:0}}>
            <div style={{fontSize:13,fontWeight:700}}>{d.name}{d.b2Name?<span style={{fontSize:11,fontWeight:400,color:'var(--text2)'}}> + {d.b2Name}</span>:null}</div>
            <div style={{fontSize:11,color:'var(--text2)',marginTop:2}}>{[d.lender,d.rate?d.rate+'%':'',d.term?d.term+'mo':''].filter(Boolean).join(' · ')}</div>
          </div>
          <div style={{textAlign:'right',flexShrink:0,minWidth:90}}>
            <div style={{fontSize:13,fontWeight:700}}>{d.renewal}</div>
            <div style={{fontSize:11,color:'var(--text2)'}}>{n!==null?n+' days':''}</div>
          </div>
          <span className="badge" style={{background:SBG[si],color:SFG[si],flexShrink:0,fontSize:10,marginLeft:8}}>{d.stage}</span>
        </div>
      })}
    </div>
  }
  return <div>{rsec('⚠️ Action needed — under 60 days',urgent,'r-urgnt')}{rsec('📅 Coming up — within 6 months',soon,'r-soon')}{rsec('✅ On track — beyond 6 months',later,'r-ok')}{noR.length>0&&<div style={{fontSize:12,color:'var(--text3)',marginTop:16,padding:12,background:'var(--bg2)',borderRadius:'var(--rad)'}}>{noR.length} file(s) have no maturity date.</div>}</div>
}

// ── REFERRALS ──
function Referrals({ deals, refFilter, setRefFilter, refSort, setRefSort, setModal }) {
  const refDeals=deals.filter(d=>d.refName&&d.refName.trim())
  if(!refDeals.length)return <div style={{textAlign:'center',padding:60,color:'var(--text2)'}}><div style={{fontSize:40,marginBottom:14}}>🤝</div><div style={{fontSize:16,fontWeight:700,marginBottom:8,color:'var(--text)'}}>No referral partners yet</div><div style={{marginBottom:20}}>Fill in the Referral Partner section when adding a deal.</div><button className="btn btn-s" onClick={()=>setModal({type:'deal',data:null})}>+ Add a Deal with Referral</button></div>
  const map={}
  refDeals.forEach(d=>{
    const key=(d.refName||'').trim()
    if(!map[key])map[key]={name:key,company:d.refCompany||'',type:d.refType||'',email:d.refEmail||'',deals:[],totalAmt:0,funded:0}
    map[key].deals.push(d)
    const amt=parseFloat(d.amount);if(!isNaN(amt)&&amt>0)map[key].totalAmt+=amt
    if(d.stage==='Funded')map[key].funded++
  })
  const partners=Object.values(map).sort((a,b)=>refSort==='amount'?b.totalAmt-a.totalAmt:b.deals.length-a.deals.length)
  const maxDeals=partners[0].deals.length
  const totalAmt=refDeals.reduce((s,d)=>{const n=parseFloat(d.amount);return s+(isNaN(n)?0:n);},0)
  const allPartners=Object.keys(map)
  const filteredDeals=refFilter?refDeals.filter(d=>(d.refName||'').trim()===refFilter):refDeals
  return (
    <div>
      <div className="stats" style={{gridTemplateColumns:'repeat(3,1fr)'}}>
        {[['c-blue','🤝','Referred Deals',refDeals.length,'of '+deals.length+' total'],['c-green','💰','Referred Value','$'+Math.round(totalAmt/1000)+'K','from partners'],['c-purple','⭐','Top Partner',partners[0].name.split(' ')[0],partners[0].deals.length+' deals']].map(([c,icon,lbl,val,sub])=>(
          <div key={lbl} className={`scard ${c}`}><div className={`sic ${c}`}>{icon}</div><div className="slbl">{lbl}</div><div className="sval">{val}</div><div className="ssub">{sub}</div></div>
        ))}
      </div>
      <div className="panel" style={{marginBottom:20}}>
        <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:18}}>
          <h3 style={{margin:0}}>📊 Deals by referral partner</h3>
          <div style={{display:'flex',gap:8}}>
            {[['count','# Deals'],['amount','$ Value']].map(([v,lbl])=>(
              <button key={v} className="btn" onClick={()=>setRefSort(v)} style={{fontSize:11,padding:'5px 10px',background:refSort===v?'var(--brand-light)':'',borderColor:refSort===v?'var(--brand2)':'',color:refSort===v?'var(--brand)':''}}>{lbl}</button>
            ))}
          </div>
        </div>
        {partners.map((p,i)=>{
          const pct=maxDeals>0?Math.round(p.deals.length/maxDeals*100):0
          const color=PCOLORS[i%PCOLORS.length]
          const isSelected=refFilter===p.name
          return (
            <div key={p.name} className={`ref-row${isSelected?' selected':''}`} onClick={()=>setRefFilter(isSelected?null:p.name)}>
              <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:6}}>
                <div style={{display:'flex',alignItems:'center',gap:10}}>
                  <div style={{width:32,height:32,borderRadius:'50%',background:color+'22',color,fontSize:12,fontWeight:700,display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0}}>{ini(p.name)}</div>
                  <div>
                    <div style={{fontSize:13,fontWeight:700}}>{p.name}</div>
                    {(p.company||p.type)&&<div style={{fontSize:10,color:'var(--text2)'}}>{p.company}{p.company&&p.type?' · ':''}{p.type}</div>}
                  </div>
                </div>
                <div style={{textAlign:'right'}}>
                  <span style={{fontSize:15,fontWeight:800,color}}>{p.deals.length}</span>
                  <span style={{fontSize:11,color:'var(--text2)',marginLeft:4}}>deal{p.deals.length!==1?'s':''}</span>
                  {p.totalAmt>0&&<div style={{fontSize:11,color:'var(--text2)'}}>${Math.round(p.totalAmt/1000)}K · {p.funded} funded</div>}
                </div>
              </div>
              <div style={{height:10,background:'var(--bg3)',borderRadius:6,overflow:'hidden'}}>
                <div style={{height:10,width:pct+'%',borderRadius:6,display:'flex',overflow:'hidden'}}>
                  {p.funded>0&&<div style={{flex:p.funded,background:color}}></div>}
                  {(p.deals.length-p.funded)>0&&<div style={{flex:p.deals.length-p.funded,background:color+'66'}}></div>}
                </div>
              </div>
              {isSelected&&<div style={{fontSize:10,color:'var(--brand)',marginTop:6,textAlign:'right'}}>Showing deals below ↓ — click to clear</div>}
            </div>
          )
        })}
        <div style={{display:'flex',alignItems:'center',gap:16,marginTop:14,fontSize:11,color:'var(--text2)'}}>
          <span><span style={{display:'inline-block',width:12,height:8,background:'#2563eb',borderRadius:3,marginRight:4}}></span>Funded</span>
          <span><span style={{display:'inline-block',width:12,height:8,background:'#2563eb66',borderRadius:3,marginRight:4}}></span>In progress</span>
        </div>
      </div>
      <div className="panel">
        <h3 style={{marginBottom:14}}>{refFilter?`Deals from ${refFilter}`:'All referred deals'}</h3>
        <div className="twrap">
          {!filteredDeals.length?<div style={{padding:24,textAlign:'center',color:'var(--text2)',fontSize:13}}>No deals found.</div>:(
            <table>
              <thead><tr><th>Borrower</th><th>Partner</th><th>Type</th><th>Mortgage</th><th>Lender</th><th>Stage</th><th>Entered</th></tr></thead>
              <tbody>
                {filteredDeals.map(d=>{
                  const ac=avc(d.name);const si=stageIdx(d.stage)
                  const pi=allPartners.indexOf((d.refName||'').trim());const pc=PCOLORS[pi%PCOLORS.length]
                  const sh=d.stage.replace('Application ','App. ').replace('Conditions ','Cond. ').replace('Documents ','Docs ').replace('Info Only / No Deal','No Deal')
                  return <tr key={d.id} style={{cursor:'pointer'}} onClick={()=>setModal({type:'deal',data:d})}>
                    <td><div style={{display:'flex',alignItems:'center',gap:9}}><div className="av" style={{width:30,height:30,fontSize:11,background:ac[0],color:ac[1]}}>{ini(d.name)}</div><div style={{fontWeight:600}}>{d.name}</div></div></td>
                    <td><div style={{display:'flex',alignItems:'center',gap:7}}><div style={{width:8,height:8,borderRadius:'50%',background:pc,flexShrink:0}}></div><div><div style={{fontWeight:600,fontSize:13}}>{d.refName}</div>{d.refCompany&&<div style={{fontSize:10,color:'var(--text2)'}}>{d.refCompany}</div>}</div></div></td>
                    <td style={{fontSize:12,color:'var(--text2)'}}>{d.refType||'—'}</td>
                    <td><strong>{fmtAmt(d.amount)}</strong>{d.rate&&<div style={{fontSize:10,color:'var(--text2)'}}>{d.rate}%</div>}</td>
                    <td style={{fontSize:12}}>{d.lender||'—'}</td>
                    <td><span className="badge" style={{background:SBG[si],color:SFG[si],fontSize:10}}>{sh}</span></td>
                    <td style={{fontSize:12,color:'var(--text2)'}}>{d.entryDate||'—'}</td>
                  </tr>
                })}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  )
}

// ── SIGNATURE SETTINGS ──
function Signature({ settings, saveSettings, sendTestEmail }) {
  const [form, setForm] = useState({
    sig_name: settings.sig_name||'Vatsal Barot',
    sig_title: settings.sig_title||'Associate Mortgage Broker',
    sig_email: settings.sig_email||'vatsal@vatsalbarotmortgages.ca',
    sig_phone: settings.sig_phone||'',
    sig_broker_license: settings.sig_broker_license||'#30005730',
    sig_brokerage_license: settings.sig_brokerage_license||'#3000168',
    sig_tagline: settings.sig_tagline||'Personalized. Simplified. Trusted.',
  })
  useEffect(()=>{
    setForm({
      sig_name: settings.sig_name||'Vatsal Barot',
      sig_title: settings.sig_title||'Associate Mortgage Broker',
      sig_email: settings.sig_email||'vatsal@vatsalbarotmortgages.ca',
      sig_phone: settings.sig_phone||'',
      sig_broker_license: settings.sig_broker_license||'#30005730',
      sig_brokerage_license: settings.sig_brokerage_license||'#3000168',
      sig_tagline: settings.sig_tagline||'Personalized. Simplified. Trusted.',
    })
  },[settings])
  const F = (key,label,placeholder) => (
    <div className="field">
      <label>{label}</label>
      <input type="text" value={form[key]||''} onChange={e=>setForm(p=>({...p,[key]:e.target.value}))} placeholder={placeholder}/>
    </div>
  )
  return (
    <div style={{maxWidth:640}}>
      <div className="panel" style={{marginBottom:20}}>
        <h3 style={{marginBottom:4}}>✍️ Email Signature</h3>
        <p style={{fontSize:13,color:'var(--text2)',marginBottom:20}}>This signature appears at the bottom of all automated emails sent to clients and referral partners.</p>
        <div className="fg fg2" style={{marginBottom:12}}>
          {F('sig_name','Full Name','e.g. Vatsal Barot')}
          {F('sig_title','Title','e.g. Associate Mortgage Broker')}
        </div>
        <div className="fg fg2" style={{marginBottom:12}}>
          {F('sig_email','Email Address','vatsal@vatsalbarotmortgages.ca')}
          {F('sig_phone','Phone Number','e.g. 506-555-0100')}
        </div>
        <div className="fg fg2" style={{marginBottom:12}}>
          {F('sig_broker_license','Broker License','e.g. #30005730')}
          {F('sig_brokerage_license','Brokerage License','e.g. #3000168')}
        </div>
        {F('sig_tagline','Tagline (optional)','e.g. Personalized. Simplified. Trusted.')}
        <div style={{display:'flex',gap:10,marginTop:20,flexWrap:'wrap'}}>
          <button className="btn btn-s btn-lg" onClick={()=>saveSettings(form)}>💾 Save Signature</button>
          <button className="btn btn-lg" onClick={sendTestEmail}>📧 Send Test Email to vatsal.barot98@gmail.com</button>
        </div>
      </div>
      <div className="panel">
        <h3 style={{marginBottom:12}}>👁 Preview</h3>
        <div style={{borderTop:'2px solid #1e40af',paddingTop:16,fontFamily:'Arial,sans-serif'}}>
          <div style={{fontSize:15,fontWeight:700,color:'#0f172a'}}>{form.sig_name}</div>
          <div style={{fontSize:13,color:'#6b7280'}}>{form.sig_title}</div>
          <div style={{fontSize:13,color:'#6b7280'}}>Mortgage Intelligence</div>
          <div style={{fontSize:12,color:'#9ca3af',marginTop:4}}>Broker License: {form.sig_broker_license} | Brokerage License: {form.sig_brokerage_license}</div>
          <div style={{fontSize:13,color:'#1e40af',marginTop:4}}>📧 {form.sig_email}{form.sig_phone?` | 📞 ${form.sig_phone}`:''}</div>
          {form.sig_tagline&&<div style={{fontSize:12,color:'#9ca3af',fontStyle:'italic',marginTop:4}}>{form.sig_tagline}</div>}
        </div>
      </div>
    </div>
  )
}

// ── DEAL MODAL ──
function DealModal({ deal: initialDeal, deals, onSave, onDelete, onClose, onStageChange, onAddNote, showToast, setModal }) {
  const [view, setView] = useState(initialDeal ? 'detail' : 'form') // 'detail' | 'form'
  const [deal, setDeal] = useState(initialDeal)
  const [notes, setNotes] = useState([])
  const [noteText, setNoteText] = useState('')
  const [saving, setSaving] = useState(false)
  const [form, setForm] = useState(initialDeal || {stage:'Lead'})

  useEffect(()=>{
    if(initialDeal?.id){
      sbFetch(`notes?deal_id=eq.${initialDeal.id}&order=created_at.asc`).then(setNotes).catch(()=>{})
    }
  },[initialDeal?.id])

  const ac = deal ? avc(deal.name) : ['#dbeafe','#1e40af']
  const si = deal ? stageIdx(deal.stage) : 0
  const n = deal ? daysUntil(deal.renewal) : null

  function F(key,label,type,opts){
    const val = form[key]||''
    if(type==='select')return <div className="field"><label>{label}</label><select value={val} onChange={e=>setForm(p=>({...p,[key]:e.target.value}))}>{opts}</select></div>
    if(type==='textarea')return <div className="field"><label>{label}</label><textarea value={val} onChange={e=>setForm(p=>({...p,[key]:e.target.value}))} rows={3}/></div>
    return <div className="field"><label>{label}</label><input type={type||'text'} value={val} onChange={e=>setForm(p=>({...p,[key]:e.target.value}))}/></div>
  }

  async function handleSave(){
    const b1Name=[form.b1First,form.b1Last].filter(Boolean).join(' ')
    if(!b1Name){alert('Please enter borrower name');return}
    setSaving(true)
    const b2Name=[form.b2First,form.b2Last].filter(Boolean).join(' ')
    const property=[form.propStreet,form.propCity,form.propPostal].filter(Boolean).join(', ')
    const d={...form,id:initialDeal?.id||uid(),name:b1Name,b1Name,b2Name,property}
    await onSave(d,initialDeal?.id)
    setSaving(false)
  }

  async function handleAddNote(){
    if(!noteText.trim())return
    const nd=new Date().toLocaleDateString('en-CA')
    try{
      await onAddNote(deal.id,nd,noteText.trim())
      setNotes(prev=>[...prev,{note_date:nd,note_text:noteText.trim()}])
      setNoteText('')
      showToast('Note saved')
    }catch(e){showToast('Error: '+e.message,true)}
  }

  function sel(arr,key){return arr.map(v=>`<option value="${v}"${form[key]===v?' selected':''}>${v}</option>`).join('')}

  if(view==='form'){
    return (
      <div className="modal-wrap" onClick={e=>e.target===e.currentTarget&&onClose()}>
        <div className="modal">
          <div className="mhdr">
            <div><div className="mhdr-title">{initialDeal?'✏️ Edit Deal — '+initialDeal.name:'🏠 New Mortgage Application'}</div><div className="mhdr-sub">Borrower name is the only required field</div></div>
            <button className="btn" style={{background:'rgba(255,255,255,.15)',color:'#fff',borderColor:'rgba(255,255,255,.2)',flexShrink:0}} onClick={onClose}>✕ Close</button>
          </div>
          <div className="mbody">
            <div className="fsec"><div className="fsec-hdr"><div className="fsec-icon">📋</div><div><div className="fsec-title">Deal Information</div><div className="fsec-sub">Stage, type, and date</div></div></div>
              <div className="fg fg3">
                <div className="field"><label>Stage</label><select value={form.stage||'Lead'} onChange={e=>setForm(p=>({...p,stage:e.target.value}))}>{STAGES.map(s=><option key={s}>{s}</option>)}</select></div>
                <div className="field"><label>Application Type</label><select value={form.appType||''} onChange={e=>setForm(p=>({...p,appType:e.target.value}))}><option value="">Select…</option>{ATTYPES.map(s=><option key={s}>{s}</option>)}</select></div>
                {F('entryDate','File Date','date')}
              </div>
            </div>
            <div className="fsec"><div className="fsec-hdr"><div className="fsec-icon">👤</div><div><div className="fsec-title">Primary Borrower</div><div className="fsec-sub">Main applicant information</div></div></div>
              <div className="fg fg2">{F('b1First','First Name')}{F('b1Last','Last Name')}</div>
              <div className="fg fg3">{F('b1DOB','Date of Birth','date')}{F('b1Cell','Cell Phone','tel')}{F('b1Email','Email Address','email')}</div>
              <div className="fg fg2">{F('b1Employer','Employer')}{F('b1Occ','Occupation')}</div>
              <div className="fg fg4">{F('b1Street','Street Address')}{F('b1City','City')}<div className="field"><label>Province</label><select value={form.b1Prov||''} onChange={e=>setForm(p=>({...p,b1Prov:e.target.value}))}><option value="">—</option>{PROVS.map(p=><option key={p}>{p}</option>)}</select></div>{F('b1Postal','Postal Code')}</div>
            </div>
            <div className="fsec"><div className="fsec-hdr"><div className="fsec-icon">👥</div><div><div className="fsec-title">Co-Borrower</div><div className="fsec-sub">Leave blank if none</div></div></div>
              <div className="fg fg2">{F('b2First','First Name')}{F('b2Last','Last Name')}</div>
              <div className="fg fg3">{F('b2DOB','Date of Birth','date')}{F('b2Cell','Cell Phone','tel')}{F('b2Email','Email Address','email')}</div>
              <div className="fg fg2">{F('b2Employer','Employer')}{F('b2Occ','Occupation')}</div>
            </div>
            <div className="fsec"><div className="fsec-hdr"><div className="fsec-icon">🏠</div><div><div className="fsec-title">Subject Property</div><div className="fsec-sub">Property being purchased or refinanced</div></div></div>
              <div className="fg fg4">{F('propStreet','Street Address')}{F('propCity','City')}<div className="field"><label>Province</label><select value={form.propProv||''} onChange={e=>setForm(p=>({...p,propProv:e.target.value}))}><option value="">—</option>{PROVS.map(p=><option key={p}>{p}</option>)}</select></div>{F('propPostal','Postal Code')}</div>
              <div className="fg fg2"><div className="field"><label>Property Use</label><select value={form.occupancy||''} onChange={e=>setForm(p=>({...p,occupancy:e.target.value}))}><option value="">Select…</option>{OCCTYPES.map(s=><option key={s}>{s}</option>)}</select></div>{F('propValue','Estimated Value ($)')}</div>
            </div>
            <div className="fsec"><div className="fsec-hdr"><div className="fsec-icon">💰</div><div><div className="fsec-title">Mortgage Details</div><div className="fsec-sub">Loan, rate, term, and lender</div></div></div>
              <div className="fg fg3">{F('amount','Mortgage Amount ($)')}{F('lender','Lender Name')}<div className="field"><label>Mortgage Position</label><select value={form.mortType||''} onChange={e=>setForm(p=>({...p,mortType:e.target.value}))}><option value="">Select…</option>{MTTYPES.map(s=><option key={s}>{s}</option>)}</select></div></div>
              <div className="fg fg4">{F('rate','Interest Rate (%)')}<div className="field"><label>Rate Type</label><select value={form.intType||''} onChange={e=>setForm(p=>({...p,intType:e.target.value}))}><option value="">Select…</option>{ITTYPES.map(s=><option key={s}>{s}</option>)}</select></div>{F('term','Term (months)')}{F('amort','Amortization (mo)')}</div>
              <div className="fg fg3">{F('closing','Closing Date','date')}{F('firstPay','First Payment Date','date')}{F('renewal','Maturity / Renewal Date','date')}</div>
            </div>
            <div className="fsec"><div className="fsec-hdr"><div className="fsec-icon">🤝</div><div><div className="fsec-title">Referral Partner</div><div className="fsec-sub">Who referred this client</div></div></div>
              <div className="fg fg3">{F('refName','Partner Name')}{F('refCompany','Company / Brokerage')}<div className="field"><label>Partner Type</label><select value={form.refType||''} onChange={e=>setForm(p=>({...p,refType:e.target.value}))}><option value="">Select…</option>{REFTYPES.map(s=><option key={s}>{s}</option>)}</select></div></div>
              <div className="fg fg2">{F('refEmail','Partner Email','email')}{F('refPhone','Partner Phone','tel')}</div>
            </div>
            <div className="fsec"><div className="fsec-hdr"><div className="fsec-icon">📝</div><div><div className="fsec-title">Notes</div></div></div>
              {F('initNotes','Internal Notes','textarea')}
            </div>
          </div>
          <div className="mfoot">
            <button className="btn btn-s btn-lg" disabled={saving} onClick={handleSave}>{saving?<><span className="spinner"></span> Saving…</>:(initialDeal?'💾 Save Changes':'✅ Add Deal')}</button>
            {initialDeal&&<button className="btn btn-d" onClick={()=>onDelete(initialDeal.id)}>🗑 Delete Deal</button>}
            {initialDeal&&<button className="btn" onClick={()=>setView('detail')}>← Back to Detail</button>}
            <button className="btn" onClick={onClose}>Cancel</button>
          </div>
        </div>
      </div>
    )
  }

  // Detail view
  return (
    <div className="modal-wrap" onClick={e=>e.target===e.currentTarget&&onClose()}>
      <div className="modal" style={{width:620}}>
        <div className="mhdr" style={{background:`linear-gradient(135deg,${SBG[si]}ee,${SBG[si]})`,padding:'18px 22px'}}>
          <div style={{display:'flex',alignItems:'center',gap:14}}>
            <div className="av" style={{width:52,height:52,fontSize:18,background:ac[0],color:ac[1],border:'3px solid rgba(255,255,255,.8)'}}>{ini(deal.name)}</div>
            <div>
              <div style={{fontSize:18,fontWeight:800,color:SFG[si],letterSpacing:'-.02em'}}>{deal.name}</div>
              {deal.b2Name&&<div style={{fontSize:12,color:SFG[si],opacity:.7}}>Co-borrower: {deal.b2Name}</div>}
              <div style={{fontSize:11,color:SFG[si],opacity:.5,marginTop:2}}>{deal.id}{deal.entryDate?' · '+deal.entryDate:''}</div>
            </div>
          </div>
          <div style={{display:'flex',gap:8,flexShrink:0}}>
            <button className="btn" style={{background:'rgba(255,255,255,.85)',borderColor:'rgba(0,0,0,.1)',fontSize:12}} onClick={()=>setView('form')}>✏️ Edit</button>
            <button className="btn btn-d" style={{fontSize:12}} onClick={()=>onDelete(deal.id)}>🗑 Delete</button>
            <button className="btn" style={{background:'rgba(255,255,255,.85)',borderColor:'rgba(0,0,0,.1)',fontSize:12}} onClick={onClose}>✕</button>
          </div>
        </div>
        <div style={{padding:'12px 24px',borderBottom:'1px solid var(--border)',display:'flex',alignItems:'center',gap:10,flexWrap:'wrap',background:'var(--bg)'}}>
          <span style={{fontSize:11,fontWeight:700,color:'var(--text2)',textTransform:'uppercase',letterSpacing:'.05em'}}>Stage:</span>
          <select style={{padding:'7px 12px',borderRadius:'var(--rad)',border:'1px solid var(--border2)',fontSize:13,background:'var(--bg2)',fontFamily:'inherit',fontWeight:500}} value={deal.stage} onChange={e=>{onStageChange(deal.id,e.target.value);setDeal(p=>({...p,stage:e.target.value}))}}>
            {STAGES.map(s=><option key={s}>{s}</option>)}
          </select>
          <span className="badge" style={{background:SBG[si],color:SFG[si]}}>{deal.stage}</span>
          <button className="btn btn-s" style={{fontSize:11,padding:'5px 10px',marginLeft:'auto'}} onClick={()=>setModal({type:'task',data:{client_name:deal.name,client_email:deal.b1Email,client_phone:deal.b1Cell,deal_id:deal.id,status:'To Do'}})}>+ Add Task</button>
        </div>
        <div style={{padding:'0 24px 24px',overflowY:'auto',maxHeight:'60vh'}}>
          <div className="sec-t">👤 Primary Borrower</div>
          <div className="igrid">
            {[['Email',deal.b1Email?<a href={`mailto:${deal.b1Email}`}>{deal.b1Email}</a>:'—'],['Cell / Phone',deal.b1Cell||'—'],['Date of Birth',deal.b1DOB||'—'],['Employer',deal.b1Employer||'—'],['Occupation',deal.b1Occ||'—'],['Address',[deal.b1Street,deal.b1City,deal.b1Prov,deal.b1Postal].filter(Boolean).join(', ')||'—']].map(([l,v])=>(
              <div key={l} className="icell"><div className="ilbl">{l}</div><div className="ival">{v}</div></div>
            ))}
          </div>
          {deal.b2Name&&<><div className="sec-t">👥 Co-Borrower — {deal.b2Name}</div><div className="igrid">{[['Email',deal.b2Email?<a href={`mailto:${deal.b2Email}`}>{deal.b2Email}</a>:'—'],['Cell / Phone',deal.b2Cell||'—'],['Date of Birth',deal.b2DOB||'—'],['Employer',deal.b2Employer||'—']].map(([l,v])=><div key={l} className="icell"><div className="ilbl">{l}</div><div className="ival">{v}</div></div>)}</div></>}
          <div className="sec-t">🏠 Subject Property</div>
          <div className="igrid">{[['Address',deal.property||'—'],['Province',deal.propProv||'—'],['Occupancy',deal.occupancy||'—'],['Property Value',fmtAmt(deal.propValue)]].map(([l,v])=><div key={l} className="icell"><div className="ilbl">{l}</div><div className="ival">{v}</div></div>)}</div>
          <div className="sec-t">💰 Mortgage Details</div>
          <div className="igrid">{[['Amount',fmtAmt(deal.amount)],['Lender',deal.lender||'—'],['Rate',deal.rate?deal.rate+'%':'—'],['Rate Type',deal.intType||'—'],['Term',deal.term?deal.term+' months':'—'],['Amortization',deal.amort?deal.amort+' months':'—'],['Mortgage Type',deal.mortType||'—'],['App Type',deal.appType||'—'],['Closing Date',deal.closing||'—'],['First Payment',deal.firstPay||'—'],['Maturity Date',deal.renewal?<>{deal.renewal}{n!==null&&<span className={`rpill ${rpCls(deal.renewal)}`} style={{fontSize:10,marginLeft:6}}>{n}d</span>}</>:'—']].map(([l,v])=><div key={l} className="icell"><div className="ilbl">{l}</div><div className="ival">{v}</div></div>)}</div>
          {deal.refName&&<><div className="sec-t">🤝 Referral Partner</div><div className="igrid">{[['Partner Name',deal.refName],['Company',deal.refCompany||'—'],['Partner Type',deal.refType||'—'],['Email',deal.refEmail?<a href={`mailto:${deal.refEmail}`}>{deal.refEmail}</a>:'—'],['Phone',deal.refPhone||'—']].map(([l,v])=><div key={l} className="icell"><div className="ilbl">{l}</div><div className="ival">{v}</div></div>)}</div></>}
          <div className="sec-t">📝 Notes & Activity Log</div>
          <div style={{marginBottom:12}}>
            {!notes.length?<div style={{fontSize:13,color:'var(--text2)',padding:12,background:'var(--bg2)',borderRadius:'var(--rad)'}}>No notes yet — log a call, email, or update below.</div>
              :notes.map((nn,i)=><div key={i} className="nentry"><div className="ndot"></div><div><strong style={{color:'var(--text)'}}>{nn.note_date}</strong> — {nn.note_text}</div></div>)}
          </div>
          <textarea className="note-area" rows={2} placeholder="Log a call, email sent, condition cleared..." value={noteText} onChange={e=>setNoteText(e.target.value)}/>
          <div style={{display:'flex',gap:8,marginTop:10}}>
            <button className="btn btn-p" onClick={handleAddNote}>💾 Save Note</button>
            <button className="btn" onClick={onClose}>Close</button>
            <button className="btn btn-d" style={{marginLeft:'auto'}} onClick={()=>onDelete(deal.id)}>🗑 Delete Deal</button>
          </div>
        </div>
      </div>
    </div>
  )
}

// ── TASK MODAL ──
function TaskModal({ task, deals, onSave, onDelete, onClose }) {
  const [form, setForm] = useState(task || {status:'To Do'})
  const [saving, setSaving] = useState(false)
  function F(key,label,type){
    const val=form[key]||''
    if(type==='select-stage')return <div className="field"><label>{label}</label><select value={val} onChange={e=>setForm(p=>({...p,[key]:e.target.value}))}>{TASK_STAGES.map(s=><option key={s}>{s}</option>)}</select></div>
    if(type==='select-type')return <div className="field"><label>{label}</label><select value={val} onChange={e=>setForm(p=>({...p,[key]:e.target.value}))}><option value="">Select…</option>{TRANSACTION_TYPES.map(s=><option key={s}>{s}</option>)}</select></div>
    if(type==='select-deal')return <div className="field"><label>{label}</label><select value={val} onChange={e=>setForm(p=>({...p,[key]:e.target.value}))}><option value="">No linked deal</option>{deals.map(d=><option key={d.id} value={d.id}>{d.name}</option>)}</select></div>
    if(type==='textarea')return <div className="field"><label>{label}</label><textarea value={val} onChange={e=>setForm(p=>({...p,[key]:e.target.value}))} rows={3}/></div>
    return <div className="field"><label>{label}</label><input type={type||'text'} value={val} onChange={e=>setForm(p=>({...p,[key]:e.target.value}))}/></div>
  }
  async function handleSave(){
    if(!form.client_name?.trim()){alert('Please enter a client name');return}
    setSaving(true)
    await onSave(form, task?.id)
    setSaving(false)
  }
  return (
    <div className="modal-wrap" onClick={e=>e.target===e.currentTarget&&onClose()}>
      <div className="modal" style={{width:520}}>
        <div className="mhdr">
          <div><div className="mhdr-title">{task?.id?'✏️ Edit Task':'✅ New Task'}</div><div className="mhdr-sub">Create a follow-up task manually or linked to a deal</div></div>
          <button className="btn" style={{background:'rgba(255,255,255,.15)',color:'#fff',borderColor:'rgba(255,255,255,.2)',flexShrink:0}} onClick={onClose}>✕</button>
        </div>
        <div className="mbody">
          <div className="fsec"><div className="fsec-hdr"><div className="fsec-icon">✅</div><div><div className="fsec-title">Task Details</div></div></div>
            <div className="fg fg2">{F('status','Status','select-stage')}{F('due_date','Due Date','date')}</div>
            {F('transaction_type','Transaction Type','select-type')}
            {F('deal_id','Linked Deal (optional)','select-deal')}
          </div>
          <div className="fsec"><div className="fsec-hdr"><div className="fsec-icon">👤</div><div><div className="fsec-title">Client Information</div></div></div>
            <div className="fg fg2">{F('client_name','Client Name')}{F('client_phone','Phone Number','tel')}</div>
            {F('client_email','Email Address','email')}
          </div>
          <div className="fsec"><div className="fsec-hdr"><div className="fsec-icon">📝</div><div><div className="fsec-title">Notes</div></div></div>
            {F('notes','Notes / Details','textarea')}
          </div>
        </div>
        <div className="mfoot">
          <button className="btn btn-s btn-lg" disabled={saving} onClick={handleSave}>{saving?<><span className="spinner"></span> Saving…</>:(task?.id?'💾 Save Changes':'✅ Add Task')}</button>
          {task?.id&&<button className="btn btn-d" onClick={()=>onDelete(task.id)}>🗑 Delete Task</button>}
          <button className="btn" onClick={onClose}>Cancel</button>
        </div>
      </div>
    </div>
  )
}

function EmptyState({ setModal }) {
  return <div className="empty-s"><div style={{fontSize:52,marginBottom:18}}>🏠</div><div style={{fontSize:20,fontWeight:800,marginBottom:8}}>No deals yet</div><div style={{fontSize:14,color:'var(--text2)',marginBottom:28}}>Add your first mortgage file to get started.</div><button className="btn btn-s btn-lg" onClick={()=>setModal({type:'deal',data:null})}>+ Add Your First Deal</button></div>
}
