import PersonalInfoStep from '../pages/Questionnaire/steps/PersonalInfoStep';
import IncomeStep from '../pages/Questionnaire/steps/IncomeStep';
import DeductionsCreditsStep from '../pages/Questionnaire/steps/DeductionsCreditsStep';
import CreditsClaimStep from '../pages/Questionnaire/steps/CreditsClaimStep';
import CryptoStep from '../pages/Questionnaire/steps/CryptoStep';
import WillGenerator from '../components/WillGenerator';
import FinalReview from '../pages/FinalReview';
import SubmitStep from '../pages/Questionnaire/SubmissionComplete';
import BankInfoStep from '../pages/Questionnaire/steps/BankInfoStep';

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
    next: 'crypto',
  },
  {
    key: 'crypto',
    label: 'Crypto Income',
    component: CryptoStep,
    next: 'will',
  },
  {
    key: 'will',
    label: 'Will Preparation',
    component: WillGenerator,
    next: 'review',
  },
  {
    key: 'review',
    label: 'Review & Confirm',
    component: FinalReview,
    next: 'bank',
  },
  {
    key: 'bank',
    label: 'Bank Info for Refund',
    component: BankInfoStep,
    next: 'submit',
  },
  {
    key: 'submit',
    label: 'Submit Return',
    component: SubmitStep,
    next: null,
  },
];

export default wizardSteps;