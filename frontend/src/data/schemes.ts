import type { Scheme } from '../types'

// Illustrative demo content only. Verify current eligibility and details on official portals.
export const demoSchemes: Scheme[] = [
  {
    id: 'pm-kisan', name: 'PM-KISAN Samman Nidhi', ministry: 'Ministry of Agriculture & Farmers Welfare',
    description: 'Income support for eligible landholding farmer families through direct benefit transfers.',
    benefit: '₹6,000 per year in three instalments, subject to scheme rules.',
    eligibility: ['Eligible landholding farmer family', 'Land records and exclusion rules apply'],
    documents: ['Aadhaar card', 'Landholding records', 'Bank account details'],
    howToApply: ['Visit the official PM-KISAN portal or a local service centre.', 'Complete farmer registration and provide required details.', 'Track application and beneficiary status on the official portal.'],
    category: 'Agriculture', match: 96, tag: 'Strong match'
  },
  {
    id: 'pmay', name: 'Pradhan Mantri Awas Yojana', ministry: 'Ministry of Housing & Urban Affairs / Rural Development',
    description: 'Housing assistance for eligible households under the applicable urban or rural component.',
    benefit: 'Housing assistance as determined by the applicable component and local guidelines.',
    eligibility: ['Household must meet the applicable housing and income criteria', 'Other scheme-specific conditions apply'],
    documents: ['Identity proof', 'Address proof', 'Income or household details', 'Other documents requested locally'],
    howToApply: ['Identify the relevant PMAY urban or rural component.', 'Check the latest eligibility rules through the official portal or local authority.', 'Submit the application through the authorized channel.'],
    category: 'Housing', match: 89, tag: 'Good match'
  },
  {
    id: 'nsp', name: 'National Scholarship Portal', ministry: 'Ministry of Education and other participating ministries',
    description: 'A common platform for discovering and applying to participating scholarship schemes.',
    benefit: 'Scholarship support varies by scheme, course and eligibility.',
    eligibility: ['Requirements vary by scholarship', 'Academic, income and category criteria may apply'],
    documents: ['Aadhaar or other accepted identity proof', 'Previous academic records', 'Income certificate where required', 'Bank details'],
    howToApply: ['Search for scholarships matching your course and profile.', 'Read the current scheme guidelines carefully.', 'Register and submit the application with required documents.'],
    category: 'Education', match: 82, tag: 'Potential match'
  },
  {
    id: 'mudra', name: 'Pradhan Mantri MUDRA Yojana', ministry: 'Department of Financial Services',
    description: 'Credit support through lending institutions for eligible micro and small business activities.',
    benefit: 'Business loans through participating lending institutions; terms depend on lender and loan category.',
    eligibility: ['Eligible non-corporate, non-farm micro or small business activity', 'Lender assessment and applicable rules apply'],
    documents: ['Identity and address proof', 'Business details', 'Bank statements or financial documents as requested'],
    howToApply: ['Approach a participating bank, NBFC or other lending institution.', 'Discuss the business requirement and suitable loan category.', 'Submit the lender application and supporting documents.'],
    category: 'Business', match: 75, tag: 'Explore'
  }
]