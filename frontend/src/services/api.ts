
import type { CitizenProfile, Scheme } from '../types'
import { demoSchemes } from '../data/schemes'

const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:8000'
const USE_MOCK = import.meta.env.VITE_USE_MOCK_DATA !== 'false'

// Structure of the profile expected by Django
type BackendProfile = {
  name: string
  age: number
  state: string
  annual_income: number
  occupation: string
  education: string
  gender: string
  category: string
  interests: string[]
}

// Structure of an individual recommendation returned by Django
type BackendScheme = {
  id?: number
  name: string
  description: string
  benefits: string
  eligibility: string
  required_documents: string
  application_process: string
  official_url: string
  last_verified: string | null
  similarity_score: number
  eligibility_status: string
  eligibility_reason: string
}

type RecommendationResponse = {
  count: number
  recommendations: BackendScheme[]
}

// Generic POST request helper
async function request<T>(path: string, body: unknown): Promise<T> {
  const response = await fetch(`${API_BASE}${path}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  })

  if (!response.ok) {
    const errorData = await response.json().catch(() => null)
    throw new Error(
      errorData?.error || `API error: ${response.status}`
    )
  }

  return response.json() as Promise<T>
}

// Convert frontend profile into Django's expected format
function mapProfile(profile: CitizenProfile): BackendProfile {
  return {
    name: profile.name,
    age: profile.age,
    state: profile.state,
    annual_income: profile.annualIncome,
    occupation: profile.occupation,
    education: profile.education,
    gender: profile.gender,
    category: profile.category,
    interests: profile.interests,
  }
}

// Convert Django recommendation into the existing frontend Scheme type
function mapScheme(scheme: BackendScheme): Scheme {
  return {
    id: String(scheme.id ?? scheme.name),
    name: scheme.name,
    ministry: 'Government of India',
    description: scheme.description,
    benefit: scheme.benefits,

    eligibility: [
      scheme.eligibility,
      `Status: ${scheme.eligibility_status}`,
      scheme.eligibility_reason,
    ],

    documents: scheme.required_documents
      ? scheme.required_documents
          .split(/\r?\n/)
          .map(item => item.trim())
          .filter(Boolean)
      : [],

    howToApply: scheme.application_process
      ? scheme.application_process
          .split(/\r?\n/)
          .map(item => item.trim())
          .filter(Boolean)
      : [],

    category: 'Other',
    match: Math.round(scheme.similarity_score * 100),
    tag: scheme.eligibility_status.replace(/_/g, ' '),

    // Newly added fields
    officialUrl: scheme.official_url,
    lastVerified: scheme.last_verified,
  }
}

// Get recommendations
export async function getRecommendations(
  profile: CitizenProfile
): Promise<Scheme[]> {
  if (USE_MOCK) {
    return demoSchemes.filter(s => {
      if (profile.occupation.toLowerCase().includes('farm')) {
        return s.category === 'Agriculture' || s.category === 'Housing'
      }

      if (profile.education.toLowerCase().includes('student')) {
        return s.category === 'Education' || s.category === 'Housing'
      }

      return true
    })
  }

  const response = await request<RecommendationResponse>(
    '/api/recommendations/',
    mapProfile(profile)
  )

  return response.recommendations.map(mapScheme)
}

// AI Assistant — remains in mock mode until its Django API is implemented
export async function askAssistant(
  question: string,
  schemeName: string
): Promise<string> {
  if (USE_MOCK) {
    const q = question.toLowerCase()

    if (q.includes('income certificate')) {
      return 'An income certificate is an official document issued by a competent government authority that records your family or individual income. It may be requested for scholarships, fee concessions or government schemes. Check your state portal or local tehsil/SDM office for the exact process and documents.'
    }
    if (q.includes('document')) {
      return 'Start by checking the scheme’s official document checklist. Commonly requested items may include proof of identity, address, income, bank details and education or occupation proof—but requirements vary. Do not share Aadhaar numbers, OTPs or bank credentials in this chat.'
    }
    if (q.includes('eligibility')) {
      return 'Eligibility means the conditions an applicant must meet to apply for a scheme. These can include age, income, state, occupation, category or education. Read the official scheme guidelines and confirm your details before applying.'
    }
    if (q.includes('application status') || q.includes('status')) {
      return 'To check an application status, visit the official portal where you applied and look for “Track Application” or “Application Status”. You may need an application/reference number. Never share OTPs or passwords here.'
    }

    return `For your question about ${schemeName}, start by checking the latest official scheme guidelines and the relevant government portal. Requirements can vary by scheme, applicant and location. This demo assistant provides general guidance only; it does not submit applications or verify eligibility.`
  }

  const data = await request<{ answer: string }>(
    '/api/assistant/',
    { question, scheme_name: schemeName }
  )

  return data.answer
}
