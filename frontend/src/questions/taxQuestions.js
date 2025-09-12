// death-and-taxes/src/questions/taxQuestions.js

/**
 * Atomic question set for guided tax flow.
 * Each entry includes audit tags, IRS notes, and category mapping.
 * Used to drive dynamic rendering, branching logic, and backend validation.
 */

const taxQuestions = [
  {
    key: 'filingStatus',
    question: 'What is your filing status?',
    type: 'singleSelect',
    options: ['Single', 'Married', 'Head of Household'],
    category: 'General',
    auditTag: 'filing_status_selected',
  },
  {
    key: 'incomeType',
    question: 'What type of income did you receive?',
    type: 'multiSelect',
    options: ['W-2 Wages', 'Freelance (1099)', 'Investment Income', 'Other'],
    category: 'Income',
    auditTag: 'income_type_selected',
  },
  {
    key: 'agi',
    question: 'What was your approximate adjusted gross income (AGI)?',
    type: 'numeric',
    category: 'Income',
    auditTag: 'agi_entered',
  },
  {
    key: 'mortgageInterest',
    question: 'Did you pay mortgage interest?',
    type: 'numeric',
    category: 'Schedule A',
    irsNote: 'Deductible if itemizing; reported on Form 1098.',
    auditTag: 'mortgage_interest_entered',
  },
  {
    key: 'propertyTaxes',
    question: 'How much did you pay in property taxes?',
    type: 'numeric',
    category: 'Schedule A',
    irsNote: 'Subject to $10,000 SALT cap.',
    auditTag: 'property_taxes_entered',
  },
  {
    key: 'stateIncomeTax',
    question: 'Did you pay state income taxes?',
    type: 'numeric',
    category: 'Schedule A',
    irsNote: 'Included in SALT deduction cap.',
    auditTag: 'state_income_tax_entered',
  },
  {
    key: 'charitableDonations',
    question: 'How much did you donate to qualified charities?',
    type: 'numeric',
    category: 'Schedule A',
    irsNote: 'Must have receipts; subject to AGI limits.',
    auditTag: 'charitable_donations_entered',
  },
  {
    key: 'educationExpenses',
    question: 'Did you or a dependent pay for education expenses?',
    type: 'numeric',
    category: 'Credits',
    irsNote: 'May qualify for American Opportunity or Lifetime Learning Credit.',
    auditTag: 'education_expenses_entered',
  },
  {
    key: 'childcareExpenses',
    question: 'Did you pay for childcare while working or studying?',
    type: 'numeric',
    category: 'Credits',
    irsNote: 'May qualify for Child and Dependent Care Credit.',
    auditTag: 'childcare_expenses_entered',
  },
  {
    key: 'retirementContributions',
    question: 'Did you contribute to a retirement account (IRA/401k)?',
    type: 'numeric',
    category: 'Adjustments',
    irsNote: 'May reduce AGI; subject to income limits.',
    auditTag: 'retirement_contributions_entered',
  },
  {
    key: 'medicalExpenses',
    question: 'Did you have large out-of-pocket medical expenses?',
    type: 'numeric',
    category: 'Schedule A',
    irsNote: 'Only deductible if >7.5% of AGI.',
    auditTag: 'medical_expenses_entered',
  },
];

export default taxQuestions;