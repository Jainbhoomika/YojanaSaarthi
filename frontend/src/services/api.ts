
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
  official_url: string
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
    documents: [],
    howToApply: [
      'Visit the official scheme website for application instructions.',
    ],
    category: 'Other',
    match: Math.round(scheme.similarity_score * 100),
    tag: scheme.eligibility_status.replace(/_/g, ' '),
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
    return `Here is a simple way to approach this for ${schemeName}: first read the latest official scheme guidelines, then keep your identity, address and eligibility documents ready. The exact requirements can vary by applicant and location. This demo assistant does not submit applications or verify eligibility.`
  }

  const data = await request<{ answer: string }>(
    '/api/assistant/',
    { question, scheme_name: schemeName }
  )

  return data.answer
}
