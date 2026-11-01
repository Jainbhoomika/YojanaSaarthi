export type CitizenProfile = {
  name: string
  age: number
  state: string
  annualIncome: number
  occupation: string
  education: string
  category: string
}

export type Scheme = {
  id: string
  name: string
  ministry: string
  description: string
  benefit: string
  eligibility: string[]
  documents: string[]
  howToApply: string[]
  category: string
  match: number
  tag: string
}