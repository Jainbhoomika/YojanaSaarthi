import { useEffect, useMemo, useRef, useState } from 'react'
import { ArrowRight, BadgeCheck, BookOpen, Bot, CheckCircle2, ChevronDown, CircleHelp, FileText, Filter, HeartHandshake, Home, Landmark, Menu, MessageCircle, Search, ShieldCheck, Sparkles, UserRound, X } from 'lucide-react'
import type { CitizenProfile, Scheme } from './types'
import { demoSchemes } from './data/schemes'
import { askAssistant, getRecommendations } from './services/api'

type Page = 'overview' | 'profile' | 'schemes' | 'eligibility' | 'documents' | 'tracker' | 'assistant'
type ApplicationEntry = { id: string; schemeId: string; status: string; date: string; reference: string; notes: string }
type ChatMessage = { id: number; role: 'user' | 'assistant'; text: string }
const emptyProfile: CitizenProfile = {
  name: '',
  age: 0,
  state: '',
  annualIncome: 0,
  occupation: '',
  education: '',
  gender: '',
  category: '',
  interests: [],
}
export default function App() {
  const [page, setPage] = useState<Page>('overview')
  const [profile, setProfile] = useState<CitizenProfile>(emptyProfile)
  const [schemes, setSchemes] = useState<Scheme[]>(demoSchemes)
  const [selected, setSelected] = useState<Scheme | null>(null)
  const [eligibilitySchemeId, setEligibilitySchemeId] = useState(demoSchemes[0]?.id ?? '')
  const [eligibilityChecks, setEligibilityChecks] = useState<Record<string, boolean>>({})
  const [applications, setApplications] = useState<ApplicationEntry[]>(() => {
    try { return JSON.parse(localStorage.getItem('yojanasaarthi-applications') || '[]') }
    catch { return [] }
  })
  useEffect(() => { localStorage.setItem('yojanasaarthi-applications', JSON.stringify(applications)) }, [applications])
  const [trackerSchemeId, setTrackerSchemeId] = useState(demoSchemes[0]?.id ?? '')
  const [trackerStatus, setTrackerStatus] = useState('Not started')
  const [trackerDate, setTrackerDate] = useState(new Date().toISOString().slice(0, 10))
  const [trackerReference, setTrackerReference] = useState('')
  const [trackerNotes, setTrackerNotes] = useState('')
  const [documentChecks, setDocumentChecks] = useState<Record<string, boolean>>(() => {
    try { return JSON.parse(localStorage.getItem('yojanasaarthi-document-checks') || '{}') }
    catch { return {} }
  })

  useEffect(() => {
    localStorage.setItem('yojanasaarthi-document-checks', JSON.stringify(documentChecks))
  }, [documentChecks])
  const [search, setSearch] = useState('')
  const [category, setCategory] = useState('All')
  const [loading, setLoading] = useState(false)
  const [notice, setNotice] = useState('Demo mode is active. Scheme information is illustrative; confirm details on official government portals.')
  const [question, setQuestion] = useState('')
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [asking, setAsking] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  const chatEndRef = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' })
  }, [messages, asking])

  const filtered = useMemo(() => schemes.filter(s =>
    (category === 'All' || s.category === category) &&
    `${s.name} ${s.description} ${s.category}`.toLowerCase().includes(search.toLowerCase())
  ), [schemes, category, search])

  const navigate = (next: Page) => { setPage(next); setSelected(null); setMobileOpen(false) }
  const update = (key: keyof CitizenProfile, value: string | number) => setProfile(p => ({ ...p, [key]: value }))

  async function submitProfile(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    try {
      const result = await getRecommendations(profile)
      setSchemes(result)
      setNotice('Profile processed. These are indicative recommendations, not an official eligibility decision.')
      setPage('schemes')
    } catch {
      setNotice('Could not reach the backend. Showing demo recommendations instead.')
      setSchemes(demoSchemes)
      setPage('schemes')
    } finally { setLoading(false) }
  }

  async function sendQuestion(questionText: string) {
    const currentQuestion = questionText.trim()
    if (!currentQuestion || asking) return

    setMessages(previous => [
      ...previous,
      { id: Date.now(), role: 'user', text: currentQuestion },
    ])
    setQuestion('')
    setAsking(true)

    try {
      const response = await askAssistant(
        currentQuestion,
        selected?.name || 'government schemes'
      )
      setMessages(previous => [
        ...previous,
        { id: Date.now() + 1, role: 'assistant', text: response },
      ])
    } catch {
      setMessages(previous => [
        ...previous,
        { id: Date.now() + 1, role: 'assistant', text: 'The assistant service is not connected yet. Please check the backend API configuration.' },
      ])
    } finally {
      setAsking(false)
    }
  }

  async function submitQuestion(e: React.FormEvent) {
    e.preventDefault()
    await sendQuestion(question)
  }

  const navItems: { id: Page; label: string; icon: typeof Home }[] = [
    { id: 'overview', label: 'Overview', icon: Home },
    { id: 'profile', label: 'My profile', icon: UserRound },
    { id: 'schemes', label: 'Find schemes', icon: Landmark },
    { id: 'eligibility', label: 'Eligibility checker', icon: BadgeCheck },
    { id: 'documents', label: 'Document checklist', icon: FileText },
    { id: 'tracker', label: 'Application tracker', icon: CheckCircle2 },
    { id: 'assistant', label: 'AI assistant', icon: Bot },
  ]

  return <div className="app-shell">
    <aside className={`sidebar ${mobileOpen ? 'sidebar-open' : ''}`}>
      <div className="brand"><div className="brand-mark"><HeartHandshake size={23}/></div><div><b>YojanaSaarthi</b><small>PUBLIC BENEFIT COMPANION</small></div><button className="mobile-close" onClick={() => setMobileOpen(false)}><X size={19}/></button></div>
      <div className="side-label">WORKSPACE</div>
      <nav>{navItems.map(item => <button key={item.id} className={`nav-link ${page === item.id ? 'active' : ''}`} onClick={() => navigate(item.id)}><item.icon size={18}/>{item.label}{item.id === 'schemes' && <span className="nav-count">{schemes.length}</span>}</button>)}</nav>
      <div className="sidebar-bottom"><div className="help-card"><div className="help-icon"><CircleHelp size={18}/></div><b>Need a little help?</b><p>Ask the assistant to explain scheme details in simple language.</p><button onClick={() => navigate('assistant')}>Ask a question <ArrowRight size={14}/></button></div><div className="secure-note"><ShieldCheck size={15}/> Your information stays in this demo session.</div></div>
    </aside>

    <main className="main-area">
      <header className="topbar"><button className="mobile-menu" onClick={() => setMobileOpen(true)}><Menu/></button><div className="breadcrumb">Workspace <span>/</span> <b>{navItems.find(n => n.id === page)?.label || 'Overview'}</b></div><div className="top-actions"><span className="demo-pill"><span/> DEMO ENVIRONMENT</span><div className="avatar"></div></div></header>
      <div className="content">
        {page === 'overview' && <section>
          <div className="hero"><div className="hero-copy"><div className="eyebrow"><Sparkles size={14}/> GOVERNMENT BENEFITS, MADE SIMPLER</div><h1>Find the support<br/>you <em>deserve.</em></h1><p>Discover government schemes that may fit your needs. Understand eligibility, prepare documents and take the next step with confidence.</p><div className="hero-buttons"><button className="btn-primary" onClick={() => navigate('profile')}>Build my profile <ArrowRight size={17}/></button><button className="btn-quiet" onClick={() => navigate('schemes')}>Explore schemes</button></div></div><div className="hero-art"><div className="art-circle circle-one"/><div className="art-circle circle-two"/><div className="art-card"><div className="art-icon"><Landmark size={28}/></div><span>YOUR BENEFITS,</span><b>Within reach.</b><div className="art-lines"><i/><i/><i/></div><div className="art-check"><CheckCircle2 size={17}/> Guided, step by step</div></div><div className="floating-chip chip-top"><BadgeCheck size={16}/> Personalized matches</div><div className="floating-chip chip-bottom"><FileText size={16}/> Document checklist</div></div></div>
          <div className="section-heading"><div><div className="eyebrow muted">GET STARTED</div><h2>Your journey, made simple</h2><p>Three clear steps from discovery to application assistance.</p></div></div>
          <div className="steps-grid"><button className="step-card" onClick={() => navigate('profile')}><div className="step-icon mint"><UserRound/></div><span className="step-number">01 / YOUR PROFILE</span><h3>Tell us about you</h3><p>Share a few details so we can understand which benefits may be relevant.</p><span className="step-link">Create profile <ArrowRight size={15}/></span></button><button className="step-card" onClick={() => navigate('schemes')}><div className="step-icon peach"><Search/></div><span className="step-number">02 / DISCOVER</span><h3>Explore your matches</h3><p>Browse schemes with easy-to-understand summaries and eligibility pointers.</p><span className="step-link">Browse schemes <ArrowRight size={15}/></span></button><button className="step-card" onClick={() => navigate('assistant')}><div className="step-icon lavender"><MessageCircle/></div><span className="step-number">03 / GET GUIDANCE</span><h3>Get application help</h3><p>Understand common form fields and prepare the information you may need.</p><span className="step-link">Ask assistant <ArrowRight size={15}/></span></button></div>
          <div className="trust-strip"><div><ShieldCheck size={20}/><span><b>Information-first guidance</b><small>Understand before you apply</small></span></div><div><BookOpen size={20}/><span><b>Simple explanations</b><small>Less jargon, more clarity</small></span></div><div><HeartHandshake size={20}/><span><b>Citizen-focused design</b><small>Built around your needs</small></span></div></div>
        </section>}

        {page === 'profile' && <section className="page-section"><div className="page-intro"><div className="eyebrow muted">PERSONALIZED DISCOVERY</div><h1>Let's get to know you.</h1><p>A few basic details help us find schemes that may be relevant to your situation.</p></div><form className="form-card" onSubmit={submitProfile}><div className="form-title"><div className="step-icon mint"><UserRound/></div><div><h2>Your citizen profile</h2><p>Fields marked * are required.</p></div></div><div className="form-grid">
          <label>Full name *<input required value={profile.name} onChange={e => update('name', e.target.value)} placeholder="Enter your name"/></label>
          <label>Age *<input required type="number" min="1" max="120" value={profile.age} onChange={e => update('age', Number(e.target.value))}/></label>
          <label>State / UT *<select value={profile.state} onChange={e => update('state', e.target.value)}>{['Rajasthan','Delhi','Uttar Pradesh','Madhya Pradesh','Gujarat','Maharashtra','Haryana','Other'].map(x => <option key={x}>{x}</option>)}</select></label>
          <label>Annual family income (₹) *<input required type="number" min="0" value={profile.annualIncome} onChange={e => update('annualIncome', Number(e.target.value))}/></label>
          <label>Occupation<select value={profile.occupation} onChange={e => update('occupation', e.target.value)}>{['Student','Farmer','Self-employed','Salaried','Homemaker','Unemployed','Other'].map(x => <option key={x}>{x}</option>)}</select></label>
          <label>Education level<select value={profile.education} onChange={e => update('education', e.target.value)}>{['Undergraduate','School student','Graduate','Postgraduate','No formal education','Other'].map(x => <option key={x}>{x}</option>)}</select></label>
          <label>Category<select value={profile.category} onChange={e => update('category', e.target.value)}>{['General','OBC','SC','ST','EWS','Prefer not to say'].map(x => <option key={x}>{x}</option>)}</select></label>
        </div><div className="privacy-note"><ShieldCheck size={17}/><span><b>Your details are used for this demo only.</b> Avoid entering sensitive identity numbers or bank details.</span></div><div className="form-footer"><span>Usually takes less than 2 minutes</span><button className="btn-primary" disabled={loading}>{loading ? 'Finding schemes…' : 'Find my schemes'} <ArrowRight size={16}/></button></div></form></section>}

        {page === 'schemes' && <section className="page-section"><div className="page-intro"><div className="eyebrow muted">SCHEME DISCOVERY</div><h1>Explore opportunities.</h1><p>Browse government support programmes and learn what to check before applying.</p></div><div className="notice"><CircleHelp size={17}/>{notice}</div><div className="filter-row"><div className="search-box"><Search size={18}/><input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search schemes or benefits…"/></div><div className="select-filter"><Filter size={16}/><select value={category} onChange={e => setCategory(e.target.value)}>{['All','Agriculture','Housing','Education','Business'].map(x => <option key={x}>{x}</option>)}</select><ChevronDown size={14}/></div></div><div className="results-label">{filtered.length} SCHEMES TO EXPLORE <span>•</span> BASED ON DEMO DATA</div><div className="scheme-grid">{filtered.map(s => <article className="scheme-card" key={s.id}><div className="scheme-card-top"><span className="scheme-category">{s.category}</span><span className="match-score">{s.match}% match*</span></div><h3>{s.name}</h3><p className="ministry">{s.ministry}</p><p className="scheme-desc">{s.description}</p><div className="benefit"><b>Potential benefit</b><span>{s.benefit}</span></div><button className="text-button" onClick={() => setSelected(s)}>View scheme details <ArrowRight size={15}/></button></article>)}</div>{filtered.length === 0 && <div className="empty-state">No schemes match that search. Try another keyword or category.</div>}<p className="footnote">*Match percentages are illustrative demo values, not calculated eligibility scores. Scheme terms can change; always verify with the official scheme portal or authorized department.</p>
          {selected && <div className="modal-backdrop" onClick={() => setSelected(null)}><div className="detail-modal" onClick={e => e.stopPropagation()}><button className="modal-close" onClick={() => setSelected(null)}><X/></button><span className="scheme-category">{selected.category}</span><h2>{selected.name}</h2><p className="ministry">{selected.ministry}</p><p>{selected.description}</p><h3>Potential benefit</h3><p>{selected.benefit}</p><h3>Eligibility pointers</h3><ul>{selected.eligibility.map(x => <li key={x}>{x}</li>)}</ul><h3>Documents to check</h3><ul>{selected.documents.map(x => <li key={x}>{x}</li>)}</ul><h3>How to proceed</h3><ol>{selected.howToApply.map(x => <li key={x}>{x}</li>)}</ol><button className="btn-primary full-button" onClick={() => navigate('assistant')}>Ask assistant about this scheme <ArrowRight size={16}/></button></div></div>}
        </section>}


        {page === 'eligibility' && <section className="page-section">
          <div className="page-intro"><div className="eyebrow muted">PERSONALIZED SCHEME REVIEW</div><h1>Check your eligibility.</h1><p>Use your saved profile and review the scheme’s listed requirements. This is a self-check, not an official eligibility decision.</p></div>
          <div className="notice"><ShieldCheck size={17}/> Your profile details are reused below. Please verify every requirement against the official scheme portal.</div>
          <div className="form-card" style={{ maxWidth: 900 }}>
            <div className="form-title"><div className="step-icon mint"><BadgeCheck/></div><div><h2>Select a scheme</h2><p>Choose a scheme to review its eligibility criteria.</p></div></div>
            <label style={{ display: 'block', marginBottom: 20 }}>Government scheme
              <select value={eligibilitySchemeId} onChange={e => { setEligibilitySchemeId(e.target.value); setEligibilityChecks({}) }} style={{ width: '100%', marginTop: 8 }}>
                {schemes.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
              </select>
            </label>
            {(() => {
              const scheme = schemes.find(s => s.id === eligibilitySchemeId) || schemes[0]
              if (!scheme) return <p>No schemes available. Explore schemes first.</p>
              const criteria = scheme.eligibility.length ? scheme.eligibility : ['Review the official eligibility rules for this scheme.']
              const checkedCount = criteria.filter((_, i) => eligibilityChecks[`${scheme.id}-${i}`]).length
              return <>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(180px,1fr))', gap: 12, marginBottom: 22 }}>
                  <div className="benefit"><b>Age</b><span>{profile.age} years</span></div>
                  <div className="benefit"><b>State / UT</b><span>{profile.state || 'Not provided'}</span></div>
                  <div className="benefit"><b>Annual family income</b><span>₹{Number(profile.annualIncome || 0).toLocaleString('en-IN')}</span></div>
                  <div className="benefit"><b>Occupation / category</b><span>{profile.occupation || 'Not provided'} · {profile.category || 'Not provided'}</span></div>
                </div>
                <h3 style={{ marginBottom: 8 }}>Eligibility requirements</h3>
                <p style={{ color: '#64748B', marginTop: 0 }}>Read each requirement and tick it only if it applies to you.</p>
                <div style={{ display: 'grid', gap: 10 }}>
                  {criteria.map((criterion, i) => <label key={`${scheme.id}-${i}`} style={{ display: 'flex', alignItems: 'flex-start', gap: 12, border: '1px solid #E2E8F0', borderRadius: 12, padding: 14, cursor: 'pointer' }}>
                    <input type="checkbox" checked={Boolean(eligibilityChecks[`${scheme.id}-${i}`])} onChange={e => setEligibilityChecks(prev => ({ ...prev, [`${scheme.id}-${i}`]: e.target.checked }))} style={{ marginTop: 4 }}/>
                    <span>{criterion}</span>
                  </label>)}
                </div>
                <div style={{ marginTop: 20, padding: 16, borderRadius: 12, background: checkedCount === criteria.length ? '#EAF3ED' : '#F8FAFC', border: '1px solid #E2E8F0' }}>
                  <b>{checkedCount === criteria.length ? 'Self-review completed' : `${checkedCount} of ${criteria.length} requirements reviewed`}</b>
                  <p style={{ marginBottom: 0 }}>{checkedCount === criteria.length ? 'You marked all listed criteria as applicable. This does not confirm eligibility; verify the official rules and documents.' : 'Continue reviewing the listed criteria. Unchecked items are not automatically considered unmet.'}</p>
                </div>
                <div className="form-footer" style={{ marginTop: 20 }}><button className="btn-quiet" onClick={() => { setEligibilityChecks({}); }}>Reset checklist</button><button className="btn-primary" onClick={() => navigate('assistant')}>Ask assistant about this scheme <ArrowRight size={16}/></button></div>
              </>
            })()}
          </div>
        </section>}

        {page === 'documents' && <section className="page-section">
          <div className="page-intro"><div className="eyebrow muted">APPLICATION PREPARATION</div><h1>Prepare your documents.</h1><p>Keep track of documents you may need before applying. Requirements can vary by scheme and applicant.</p></div>
          <div className="notice"><ShieldCheck size={17}/> This is a personal checklist, not an official document requirement list. Verify the latest requirements on the scheme’s official portal.</div>
          <div className="form-card" style={{ maxWidth: 900 }}>
            <div className="form-title"><div className="step-icon peach"><FileText/></div><div><h2>Choose a scheme</h2><p>Your checklist progress is saved in this browser.</p></div></div>
            <label style={{ display: 'block', marginBottom: 20 }}>Government scheme
              <select value={eligibilitySchemeId} onChange={e => setEligibilitySchemeId(e.target.value)} style={{ width: '100%', marginTop: 8 }}>
                {schemes.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
              </select>
            </label>
            {(() => {
              const scheme = schemes.find(s => s.id === eligibilitySchemeId) || schemes[0]
              if (!scheme) return <p>No schemes available. Explore schemes first.</p>
              const docs = scheme.documents.length ? scheme.documents : ['Identity proof (as required)', 'Address / residence proof (as required)', 'Income certificate (if applicable)', 'Bank account details / passbook (if applicable)', 'Recent photograph (if applicable)']
              const checked = docs.filter((_, i) => documentChecks[`${scheme.id}-${i}`]).length
              const progress = Math.round(checked / docs.length * 100)
              return <>
                <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12, alignItems: 'center', marginBottom: 8 }}><b>{checked} of {docs.length} prepared</b><span>{progress}%</span></div>
                <div style={{ height: 9, background: '#E2E8F0', borderRadius: 999, overflow: 'hidden', marginBottom: 20 }}><div style={{ height: '100%', width: `${progress}%`, background: '#19365D', borderRadius: 999, transition: 'width .2s' }}/></div>
                <div style={{ display: 'grid', gap: 10 }}>
                  {docs.map((doc, i) => {
                    const key = `${scheme.id}-${i}`
                    const done = Boolean(documentChecks[key])
                    return <label key={key} style={{ display: 'flex', alignItems: 'flex-start', gap: 12, border: '1px solid #E2E8F0', borderRadius: 12, padding: 14, cursor: 'pointer', background: done ? '#EAF3ED' : '#FFFFFF' }}>
                      <input type="checkbox" checked={done} onChange={e => setDocumentChecks(prev => ({ ...prev, [key]: e.target.checked }))} style={{ marginTop: 4 }}/>
                      <span style={{ flex: 1, textDecoration: done ? 'line-through' : 'none' }}>{doc}</span>
                      {done && <CheckCircle2 size={17} color="#218565"/>}
                    </label>
                  })}
                </div>
                <div className="form-footer" style={{ marginTop: 20 }}>
                  <button className="btn-quiet" onClick={() => setDocumentChecks(prev => Object.fromEntries(Object.entries(prev).filter(([key]) => !key.startsWith(`${scheme.id}-`))))}>Reset this scheme</button>
                  <button className="btn-primary" onClick={() => navigate('assistant')}>Ask assistant about documents <ArrowRight size={16}/></button>
                </div>
              </>
            })()}
          </div>
        </section>}

        {page === 'tracker' && <section className="page-section">
          <div className="page-intro"><div className="eyebrow muted">APPLICATION ORGANIZER</div><h1>Track your applications.</h1><p>Keep a personal record of scheme applications and their progress.</p></div>
          <div className="notice"><ShieldCheck size={17}/> This tracker is manual and saved in this browser. It does not retrieve official application status.</div>
          <div className="form-card" style={{ maxWidth: 900 }}>
            <div className="form-title"><div className="step-icon mint"><CheckCircle2/></div><div><h2>Add an application</h2><p>Record a scheme and update its status as you progress.</p></div></div>
            <form onSubmit={e => { e.preventDefault(); const scheme = schemes.find(x => x.id === trackerSchemeId); if (!scheme) return; setApplications(prev => [{ id: `${Date.now()}`, schemeId: scheme.id, status: trackerStatus, date: trackerDate, reference: trackerReference.trim(), notes: trackerNotes.trim() }, ...prev]); setTrackerReference(''); setTrackerNotes(''); setTrackerStatus('Not started') }}>
              <div className="form-grid">
                <label>Scheme<select required value={trackerSchemeId} onChange={e => setTrackerSchemeId(e.target.value)}>{schemes.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}</select></label>
                <label>Status<select value={trackerStatus} onChange={e => setTrackerStatus(e.target.value)}>{['Not started','Documents ready','Submitted','Under review','Approved','Rejected'].map(x => <option key={x}>{x}</option>)}</select></label>
                <label>Application date<input type="date" value={trackerDate} onChange={e => setTrackerDate(e.target.value)} required /></label>
                <label>Reference number (optional)<input value={trackerReference} onChange={e => setTrackerReference(e.target.value)} placeholder="Enter application/reference ID" /></label>
                <label style={{ gridColumn: '1 / -1' }}>Notes / next steps<textarea value={trackerNotes} onChange={e => setTrackerNotes(e.target.value)} rows={3} placeholder="For example: visit the local office next week" /></label>
              </div><div className="form-footer"><span>Keep reference numbers private on shared devices.</span><button className="btn-primary" type="submit">Add to tracker <ArrowRight size={16}/></button></div>
            </form>
          </div>
          <div style={{ display: 'grid', gap: 14, marginTop: 22 }}>
            {applications.map(app => { const scheme = schemes.find(s => s.id === app.schemeId) || demoSchemes.find(s => s.id === app.schemeId); return <article className="scheme-card" key={app.id}><div className="scheme-card-top"><span className="scheme-category">{app.status}</span><span className="match-score">{app.date}</span></div><h3>{scheme?.name || 'Government scheme'}</h3>{app.reference && <p><b>Reference:</b> {app.reference}</p>}{app.notes && <p>{app.notes}</p>}<div className="form-grid" style={{ marginTop: 12 }}><label>Update status<select value={app.status} onChange={e => setApplications(prev => prev.map(x => x.id === app.id ? { ...x, status: e.target.value } : x))}>{['Not started','Documents ready','Submitted','Under review','Approved','Rejected'].map(x => <option key={x}>{x}</option>)}</select></label><label>Update notes<input value={app.notes} onChange={e => setApplications(prev => prev.map(x => x.id === app.id ? { ...x, notes: e.target.value } : x))} placeholder="Next step or reminder" /></label></div><div className="form-footer"><button className="btn-quiet" onClick={() => setApplications(prev => prev.filter(x => x.id !== app.id))}>Remove entry</button></div></article> })}
            {applications.length === 0 && <div className="empty-state">No applications tracked yet. Add your first application above.</div>}
          </div>
        </section>}

        {page === 'assistant' && <section className="page-section"><div className="page-intro"><div className="eyebrow muted">YOUR APPLICATION COMPANION</div><h1>Questions are welcome.</h1><p>Get a simpler explanation of scheme information and common application terms.</p></div><div className="assistant-layout"><div className="assistant-main"><div className="chat-head"><div className="bot-avatar"><Bot/></div><div><b>YojanaSaarthi Assistant</b><small><span className="online-dot"/> Demo assistant · General guidance</small></div><span className="ai-label"><Sparkles size={13}/> AI GUIDE</span></div><div className="chat-body"><div className="message bot-message"><div className="mini-bot"><Bot size={16}/></div><div><b>Namaste! How can I help?</b><p>I can help explain scheme terms, document lists and common application steps. Ask in everyday language.</p></div></div>{messages.map(message => message.role === 'user' ? (
  <div className="message user-message" key={message.id} style={{ alignSelf: 'flex-end', maxWidth: '85%', background: '#19365D', color: '#FFFFFF', borderRadius: '14px 14px 4px 14px', padding: '12px 16px', margin: '8px 0' }}>
    <div><b>You</b><p style={{ color: '#FFFFFF', margin: '6px 0 0', lineHeight: 1.6, overflowWrap: 'anywhere' }}>{message.text}</p></div>
  </div>
) : (
  <div className="message bot-message" key={message.id}>
    <div className="mini-bot"><Bot size={16}/></div>
    <div><b>YojanaSaarthi Assistant</b><p>{message.text}</p></div>
  </div>
))}
{asking && <div className="message bot-message"><div className="mini-bot"><Bot size={16}/></div><div><b>Assistant</b><p>Thinking…</p></div></div>}<div ref={chatEndRef} /></div><form className="chat-input" onSubmit={submitQuestion}><input value={question} onChange={e => setQuestion(e.target.value)} placeholder="E.g. What is an income certificate?"/><button className="btn-primary" disabled={asking || !question.trim()}>{asking ? 'Thinking…' : 'Send'} <ArrowRight size={15}/></button></form><div className="chat-disclaimer" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}><span>This is general demo guidance, not legal advice or an official government response.</span><button type="button" onClick={() => { if (!asking) { setMessages([]); setQuestion('') } }} disabled={asking || messages.length === 0} style={{ border: '1px solid #E2E8F0', background: '#FFFFFF', color: '#19365D', borderRadius: 999, padding: '6px 12px', cursor: messages.length && !asking ? 'pointer' : 'not-allowed', opacity: messages.length && !asking ? 1 : 0.5 }}>Clear chat</button></div></div><aside className="suggestions"><h3>Try asking</h3>{['What is an income certificate?','How do I prepare my documents?','What does eligibility mean?','How can I check my application status?'].map(q => <button key={q} onClick={() => sendQuestion(q)}>{q}<ArrowRight size={14}/></button>)}<div className="suggestion-note"><ShieldCheck size={17}/><p>Never share Aadhaar numbers, passwords, OTPs or bank credentials in this chat.</p></div></aside></div></section>}
        <footer className="footer"><span>© 2026 YojanaSaarthi · Academic project prototype</span><span>Designed for accessible public information</span></footer>
      </div>
    </main>
  </div>
}