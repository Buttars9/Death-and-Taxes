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