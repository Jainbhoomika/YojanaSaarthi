import { useMemo, useState } from 'react'
import { ArrowRight, BadgeCheck, BookOpen, Bot, CheckCircle2, ChevronDown, CircleHelp, FileText, Filter, HeartHandshake, Home, Landmark, Menu, MessageCircle, Search, ShieldCheck, Sparkles, UserRound, X } from 'lucide-react'
import type { CitizenProfile, Scheme } from './types'
import { demoSchemes } from './data/schemes'
import { askAssistant, getRecommendations } from './services/api'

type Page = 'overview' | 'profile' | 'schemes' | 'assistant'
const emptyProfile: CitizenProfile = { name: '', age: 21, state: 'Rajasthan', annualIncome: 200000, occupation: 'Student', education: 'Undergraduate', category: 'General' }

export default function App() {
  const [page, setPage] = useState<Page>('overview')
  const [profile, setProfile] = useState<CitizenProfile>(emptyProfile)
  const [schemes, setSchemes] = useState<Scheme[]>(demoSchemes)
  const [selected, setSelected] = useState<Scheme | null>(null)
  const [search, setSearch] = useState('')
  const [category, setCategory] = useState('All')
  const [loading, setLoading] = useState(false)
  const [notice, setNotice] = useState('Demo mode is active. Scheme information is illustrative; confirm details on official government portals.')
  const [question, setQuestion] = useState('')
  const [answer, setAnswer] = useState('')
  const [asking, setAsking] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)

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

  async function submitQuestion(e: React.FormEvent) {
    e.preventDefault()
    if (!question.trim()) return
    setAsking(true)
    try { setAnswer(await askAssistant(question, selected?.name || 'government schemes')) }
    catch { setAnswer('The assistant service is not connected yet. Please check the backend API configuration.') }
    finally { setAsking(false) }
  }

  const navItems: { id: Page; label: string; icon: typeof Home }[] = [
    { id: 'overview', label: 'Overview', icon: Home },
    { id: 'profile', label: 'My profile', icon: UserRound },
    { id: 'schemes', label: 'Find schemes', icon: Landmark },
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
      <header className="topbar"><button className="mobile-menu" onClick={() => setMobileOpen(true)}><Menu/></button><div className="breadcrumb">Workspace <span>/</span> <b>{navItems.find(n => n.id === page)?.label || 'Overview'}</b></div><div className="top-actions"><span className="demo-pill"><span/> DEMO ENVIRONMENT</span><div className="avatar">BM</div></div></header>
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

        {page === 'assistant' && <section className="page-section"><div className="page-intro"><div className="eyebrow muted">YOUR APPLICATION COMPANION</div><h1>Questions are welcome.</h1><p>Get a simpler explanation of scheme information and common application terms.</p></div><div className="assistant-layout"><div className="assistant-main"><div className="chat-head"><div className="bot-avatar"><Bot/></div><div><b>YojanaSaarthi Assistant</b><small><span className="online-dot"/> Demo assistant · General guidance</small></div><span className="ai-label"><Sparkles size={13}/> AI GUIDE</span></div><div className="chat-body"><div className="message bot-message"><div className="mini-bot"><Bot size={16}/></div><div><b>Namaste! How can I help?</b><p>I can help explain scheme terms, document lists and common application steps. Ask in everyday language.</p></div></div>{answer && <div className="message bot-message"><div className="mini-bot"><Bot size={16}/></div><div><b>Here's some guidance</b><p>{answer}</p></div></div>}</div><form className="chat-input" onSubmit={submitQuestion}><input value={question} onChange={e => setQuestion(e.target.value)} placeholder="E.g. What is an income certificate?"/><button className="btn-primary" disabled={asking || !question.trim()}>{asking ? 'Thinking…' : 'Send'} <ArrowRight size={15}/></button></form><div className="chat-disclaimer">This is general demo guidance, not legal advice or an official government response.</div></div><aside className="suggestions"><h3>Try asking</h3>{['What is an income certificate?','How do I prepare my documents?','What does eligibility mean?','How can I check my application status?'].map(q => <button key={q} onClick={() => setQuestion(q)}>{q}<ArrowRight size={14}/></button>)}<div className="suggestion-note"><ShieldCheck size={17}/><p>Never share Aadhaar numbers, passwords, OTPs or bank credentials in this chat.</p></div></aside></div></section>}
        <footer className="footer"><span>© 2026 YojanaSaarthi · Academic project prototype</span><span>Designed for accessible public information</span></footer>
      </div>
    </main>
  </div>
}