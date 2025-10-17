import PersonalInfoStep from '../pages/Questionnaire/steps/PersonalInfoStep';
import IncomeStep from '../pages/Questionnaire/steps/IncomeStep';
import DeductionsCreditsStep from '../pages/Questionnaire/steps/DeductionsCreditsStep';
import CreditsClaimStep from '../pages/Questionnaire/steps/CreditsClaimStep';
import BankInfoStep from '../pages/Questionnaire/steps/BankInfoStep';
import PriorYearStep from '../pages/Questionnaire/steps/PriorYearStep';
import RefundSummaryStep from '../pages/Questionnaire/steps/RefundSummaryStep';
import WillGenerator from '../components/WillGenerator';
import EstatePlanOfferStep from '../pages/Questionnaire/steps/EstatePlanOfferStep';
import EstatePlanWizard from '../pages/Questionnaire/steps/EstatePlanWizard';
import PaymentMethod from '../pages/Questionnaire/steps/PaymentMethod.jsx';
import FinalReview from '../pages/FinalReview';
import SubmitStep from '../pages/Questionnaire/SubmissionComplete';
import AuditReviewStep from '../pages/Questionnaire/steps/AuditReviewStep'; // Added new step

const isAuditPassed = (answers) => {
  const issues = [];
  if (!answers.firstName || !answers.lastName) issues.push({ message: 'Missing: Full name', step: 'personal' });
  if (!answers.ssn || !/^\d{9}$/.test(answers.ssn)) issues.push({ message: 'Invalid or missing SSN', step: 'personal' });
  if (!answers.dob) issues.push({ message: 'Missing date of birth', step: 'personal' });
  if (!answers.address || !answers.city || !answers.zip) issues.push({ message: 'Incomplete address (street, city, ZIP)', step: 'personal' });
  if (!answers.maritalStatus) issues.push({ message: 'Missing filing status', step: 'personal' });
  if (answers.maritalStatus === 'marriedJointly' && (!answers.spouseName || !answers.spouseSSN || !answers.spouseDob)) issues.push({ message: 'Incomplete spouse info', step: 'personal' });
  if (answers.dependents?.some(dep => !dep.firstName || !dep.lastName || !dep.ssn || !/^\d{9}$/.test(dep.ssn) || !dep.dob || !dep.relationship)) issues.push({ message: 'Incomplete dependent info (name, SSN, DOB, relationship)', step: 'personal' });
  if (!answers.residentState) issues.push({ message: 'Missing resident state', step: 'personal' });
  if (!answers.priorAGI) issues.push({ message: 'Missing prior year AGI', step: 'prior-year' });
  if (!answers.irsPin || !/^\d{5}$/.test(answers.irsPin)) issues.push({ message: 'Invalid or missing IRS PIN', step: 'prior-year' });
  if (answers.incomeSources?.length === 0 || answers.incomeSources.some(src => !src.box1 && !src.amount)) issues.push({ message: 'Incomplete income sources (missing amount/wages)', step: 'income' });
  // Add more checks as needed (e.g., deductions, credits, bank info)
  return issues.length === 0;
};

export const wizardSteps = [
  {
    key: 'personal',
    label: 'Personal Info',
    component: PersonalInfoStep,
    next: 'income',
  },
  {
    key: 'income',
    label: 'Income Sources',
    component: IncomeStep,
    next: 'deductions',
  },
  {
    key: 'deductions',
    label: 'Claim Deductions & Credits',
    component: DeductionsCreditsStep,
    next: 'credits',
  },
  {
    key: 'credits',
    label: 'Claim Credits',
    component: CreditsClaimStep,
    next: 'bank',
  },
  {
    key: 'bank',
    label: 'Bank Info for Refund',
    component: BankInfoStep,
    next: 'prior-year',
  },
  {
    key: 'prior-year',
    label: 'Prior Year Info',
    component: PriorYearStep,
    next: 'refund-summary',
  },
  {
    key: 'refund-summary',
    label: 'Refund Summary',
    component: RefundSummaryStep,
    next: 'will',
  },
  {
    key: 'will',
    label: 'Will Preparation',
    component: WillGenerator,
    next: 'estate-offer',
  },
  {
    key: 'estate-offer',
    label: 'Estate Plan Offer',
    component: EstatePlanOfferStep,
    next: (answers) => answers.includeEstatePlan ? 'estate-wizard' : 'payment',
  },
  {
    key: 'estate-wizard',
    label: 'Estate Plan Documents',
    component: EstatePlanWizard,
    next: 'payment',
  },
  {
    key: 'payment',
    label: 'Payment',
    component: PaymentMethod,
    next: 'review',
  },
  {
    key: 'review',
    label: 'Review & Confirm',
    component: FinalReview,
    next: 'audit',
  },
  {
    key: 'audit',
    label: 'Review & Fix',
    component: AuditReviewStep,
    next: (answers) => isAuditPassed(answers) ? 'submit' : 'review', // Conditional based on audit
  },
  {
    key: 'submit',
    label: 'Submit Return',
    component: SubmitStep,
    next: null,
  },
];

export default wizardSteps;