import type { CitizenProfile, Scheme } from '../types'
import { demoSchemes } from '../data/schemes'

const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:8000'
const USE_MOCK = import.meta.env.VITE_USE_MOCK_DATA !== 'false'

async function request<T>(path: string, body: unknown): Promise<T> {
  const response = await fetch(`${API_BASE}${path}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  })
  if (!response.ok) throw new Error(`API error: ${response.status}`)
  return response.json() as Promise<T>
}

export async function getRecommendations(profile: CitizenProfile): Promise<Scheme[]> {
  if (USE_MOCK) return demoSchemes.filter(s => {
    if (profile.occupation.toLowerCase().includes('farm')) return s.category === 'Agriculture' || s.category === 'Housing'
    if (profile.education.toLowerCase().includes('student')) return s.category === 'Education' || s.category === 'Housing'
    return true
  })
  // Update this endpoint and response mapping to match your teammates' backend.
  return request<Scheme[]>('/api/recommendations', profile)
}

export async function askAssistant(question: string, schemeName: string): Promise<string> {
  if (USE_MOCK) {
    return `Here is a simple way to approach this for ${schemeName}: first read the latest official scheme guidelines, then keep your identity, address and eligibility documents ready. The exact requirements can vary by applicant and location. This demo assistant does not submit applications or verify eligibility.`
  }
  // Update endpoint/body to match the backend's AI assistant API.
  const data = await request<{ answer: string }>('/api/assistant', { question, scheme_name: schemeName })
  return data.answer
}