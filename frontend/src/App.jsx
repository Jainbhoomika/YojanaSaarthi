

import { useEffect, useState } from 'react'
import './App.css'
import CustomSelect from './CustomSelect'

const API_URL = '/api/schemes/'


const demoSchemes = [
  {
    id: 1,
    name: 'Scholarship Support Scheme',
    category: 'Education',
    description:
      'Explore financial assistance opportunities for eligible students.',
    eligibility: 'Check the official scheme requirements before applying.',
  },
  {
    id: 2,
    name: 'Women Empowerment Scheme',
    category: 'Women & Development',
    description: 'Explore government support programs for women.',
    eligibility: 'Conditions vary by scheme. Verify the official guidelines.',
  },
  {
    id: 3,
    name: 'Skill Development Support',
    category: 'Skill Development',
    description: 'Discover opportunities for learning and career development.',
    eligibility: 'Review the individual program requirements.',
  },
]


function checkEligibility(scheme, user) {
  const age = Number(user.age)

  if (!user.age || !user.education || !user.occupation || !user.income) {
    return 'Demo - eligibility not checked'
  }

  if (scheme.id === 1) {
    return user.education === 'School' ||
      user.education === '12th Pass' ||
      user.education === 'Diploma'
      ? 'Potential Match'
      : 'Criteria Not Matched'
  }

  if (scheme.id === 2) {
    return 'Potential Match'
  }

  if (scheme.id === 3) {
    return age >= 18 && user.occupation !== 'Unemployed'
      ? 'Potential Match'
      : 'Criteria Not Matched'
  }

  return 'Demo - eligibility not checked'
}


function App() {
  const [form, setForm] = useState({
    age: '',
    state: 'Rajasthan',
    education: '',
    occupation: '',
    income: '',
  })
  const [schemes, setSchemes] = useState([])
const [loading, setLoading] = useState(true)
const [error, setError] = useState('')

  const [submitted, setSubmitted] = useState(false)
  const [search, setSearch] = useState('')
  const [showMatchesOnly, setShowMatchesOnly] = useState(false)
  const [selectedScheme, setSelectedScheme] = useState(null)

  useEffect(() => {
  const fetchSchemes = async () => {
    try {
      const response = await fetch(API_URL)

      if (!response.ok) {
        throw new Error('Failed to fetch schemes')
      }

      const data = await response.json()
      setSchemes(data)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  fetchSchemes()
}, [])

  function updateForm(event) {
    setForm({ ...form, [event.target.name]: event.target.value })
  }

  function handleSubmit(event) {
    event.preventDefault()
    setSubmitted(true)
    setSelectedScheme(null)
  }

  function resetForm() {
    setForm({
      age: '',
      state: 'Rajasthan',
      education: '',
      occupation: '',
      income: '',
    })
    setSubmitted(false)
    setSearch('')
    setShowMatchesOnly(false)
    setSelectedScheme(null)
  }

  const filteredSchemes = schemes.filter((scheme) =>
  `${scheme.name} ${scheme.description}`
    .toLowerCase()
    .includes(search.toLowerCase())
)

 const visibleSchemes = filteredSchemes.filter(() => {
  if (!showMatchesOnly) return true
  return false
})

if (loading) {
  return <div className="app">Loading government schemes...</div>
}

if (error) {
  return <div className="app">Error: {error}</div>
}

  return (
    <div className="app">
      <header className="navbar">
        <a className="brand" href="#home">
          <span className="brand-icon">YS</span>
          <span>YojanaSaarthi</span>
        </a>

        <nav aria-label="Main navigation">
          <a href="#home">Home</a>
          <a href="#search-schemes">Find Schemes</a>
          <a href="#about">About</a>
        </nav>

        <a className="nav-cta" href="#search-schemes">
          Get Started
        </a>
      </header>

      <main>
        <section className="hero" id="home">
          <div className="hero-content">
            <span className="eyebrow">
              YOUR GUIDE TO GOVERNMENT SCHEMES
            </span>

            <h1>
              The right scheme.
              <br />
              <span>For your future.</span>
            </h1>

            <p>
              Discover government schemes that may match your education,
              occupation and needs — all in one place.
            </p>

            <a className="primary-button" href="#search-schemes">
              Find My Schemes <span>→</span>
            </a>

            <div className="hero-note">
              <span>✓</span> Simple to explore · Easy to understand
            </div>
          </div>

          <div className="hero-visual" aria-label="Scheme discovery illustration">
            <div className="visual-circle">
              <div className="visual-card">
                <span className="visual-icon">✦</span>
                <p>Your opportunities</p>
                <h3>Start with what you need.</h3>
                <div className="visual-line" />
                <div className="visual-line short" />
                <span className="visual-pill">
                  Discover possibilities →
                </span>
              </div>

              <span className="floating-icon star">✦</span>
              <span className="floating-icon heart">♡</span>
              <span className="floating-icon check">✓</span>
            </div>
          </div>
        </section>

        <section className="benefits" id="about">
          <div>
            <span className="benefit-icon">⌕</span>
            <h3>Discover</h3>
            <p>Explore opportunities in one place.</p>
          </div>

          <div>
            <span className="benefit-icon">◎</span>
            <h3>Personalize</h3>
            <p>Start with your personal details.</p>
          </div>

          <div>
            <span className="benefit-icon">↗</span>
            <h3>Take the next step</h3>
            <p>Learn what to check before applying.</p>
          </div>
        </section>

        <section className="scheme-section" id="search-schemes">
          <div className="section-heading">
            <span className="eyebrow">MADE FOR YOU</span>
            <h2>Find schemes that fit your journey.</h2>
            <p>Enter your details to explore available demo cards.</p>
          </div>

          <form className="search-form" onSubmit={handleSubmit}>
            <div className="form-grid">
              <label>
                Age
                <input
                  type="number"
                  name="age"
                  min="1"
                  max="120"
                  value={form.age}
                  onChange={updateForm}
                  placeholder="Enter your age"
                  required
                />
              </label>

              <div className="form-checkbox"></div>
              <label>
                State
                <CustomSelect
                  name="state"
                  value={form.state}
                  onChange={updateForm}
                  required
                  placeholder="Select state"
                  options={[
                    'Rajasthan',
                    'Delhi',
                    'Haryana',
                    'Uttar Pradesh',
                    'Madhya Pradesh',
                    'Gujarat',
                    'Maharashtra',
                    'Other',
                  ]}
                />
              </label>

              <label>
                Education
                <CustomSelect
                  name="education"
                  value={form.education}
                  onChange={updateForm}
                  required
                  placeholder="Select education"
                  options={[
                    'School',
                    '12th Pass',
                    'Diploma',
                    'Graduate',
                    'Postgraduate',
                    'Other',
                  ]}
                />
              </label>

              <label>
                Occupation
                <CustomSelect
                  name="occupation"
                  value={form.occupation}
                  onChange={updateForm}
                  required
                  placeholder="Select occupation"
                  options={[
                    'Student',
                    'Salaried employee',
                    'Self-employed',
                    'Farmer',
                    'Unemployed',
                    'Other',
                  ]}
                />
              </label>

              <label className="full-width">
                Annual family income
                <CustomSelect
                  name="income"
                  value={form.income}
                  onChange={updateForm}
                  required
                  placeholder="Select income range"
                  options={[
                    'Below ₹1 lakh',
                    '₹1–2.5 lakh',
                    '₹2.5–5 lakh',
                    'Above ₹5 lakh',
                    'Prefer not to say',
                  ]}
                />
              </label>
</div>

            <div className="form-actions">
              <button className="primary-button" type="submit">
                Explore Schemes <span>→</span>
              </button>

              <button
                className="reset-button"
                type="button"
                onClick={resetForm}
              >
                Reset Form
              </button>
            </div>
          </form>

          {submitted && (
            <div className="results-area">
              <div className="results-heading">
                <div>
                  <span className="eyebrow">YOUR EXPLORATION</span>
                  <h2>Explore opportunities</h2>
                  <p>
                    These demonstration cards are not verified official
                    government schemes or confirmed eligibility matches.
                  </p>
                </div>

                <span className="demo-label">Demo data</span>
              </div>

              <label className="scheme-search">
                Search demo cards
                <input
                  type="search"
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                  placeholder="Try education or skill..."
                />
              </label>


<div className="filter-actions">
  <button
    type="button"
    className={`filter-button ${showMatchesOnly ? 'active' : ''}`}
    onClick={() => setShowMatchesOnly(!showMatchesOnly)}
    aria-pressed={showMatchesOnly}
  >
    {showMatchesOnly
      ? 'Show All Schemes'
      : 'Show Potential Matches'}
  </button>
</div>

              <div className="scheme-grid">
                {visibleSchemes.map((scheme) => (
                  <article className="scheme-card" key={scheme.id}>
                    <span className="scheme-category">
                      Government Scheme
                    </span>
                    
<span className="eligibility-status not-checked">
  Eligibility not verified
</span>


                    <h3>{scheme.name}</h3>
                    <p>{scheme.description}</p>

                    <button
                      className="text-button"
                      type="button"
                      aria-expanded={selectedScheme === scheme.id}
                      onClick={() =>
                        setSelectedScheme(
                          selectedScheme === scheme.id ? null : scheme.id
                        )
                      }
                    >
                      {selectedScheme === scheme.id
                        ? 'Hide details ↑'
                        : 'View details →'}
                    </button>

                    {selectedScheme === scheme.id && (
                     <div className="scheme-details">
  <strong>Eligibility Criteria</strong>
  <p>{scheme.eligibility_summary}</p>

  <strong>Benefits</strong>
  <p>{scheme.benefits}</p>

  <strong>Required Documents</strong>
  <p>{scheme.required_documents || 'Please check the official portal.'}</p>

  <strong>Application Process</strong>
  <p>{scheme.application_process || 'Please check the official portal.'}</p>

  <a href={scheme.official_url} target="_blank" rel="noreferrer">
    Visit Official Website →
  </a>
</div>
                    )}
                  </article>
                ))}

                {visibleSchemes.length === 0 && (
                  <div className="no-results">
                    <h3>No schemes found</h3>
                    <p>
                      Try another keyword or change your filters to explore more opportunities.
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}
        </section>
      </main>

      <footer className="footer">
        <a className="brand" href="#home">
          <span className="brand-icon">YS</span>
          <span>YojanaSaarthi</span>
        </a>

        <p>
          A student project to make scheme discovery easier. Verify scheme
          details on official government websites before applying.
        </p>

        <span>© 2026 YojanaSaarthi · Project Demo</span>
      </footer>
    </div>
  )
}

export default App
