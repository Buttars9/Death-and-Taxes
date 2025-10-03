// frontend/src/shared/utils/deductionVerdictFromAnswers.js
import { deductionsByState } from './deductionsByState.js';

export default function deductionVerdictFromAnswers(answers) {
  const {
    income = 0,
    dependents = 0,
    filingStatus = 'single',
    itemizedDeductions = [],
    state = 'N/A',
  } = answers;

  const stateData = deductionsByState[state] || {};
  const standardAmount = stateData.standardDeduction || 0;

  const itemizedTotal = itemizedDeductions.reduce((sum, val) => sum + val.amount, 0);

  const recommendedStrategy =
    itemizedTotal > standardAmount ? 'itemized' : 'standard';

  const reasoning =
    recommendedStrategy === 'itemized'
      ? 'Your itemized deductions exceed the standard deduction.'
      : 'Standard deduction provides greater or equal benefit.';

  return {
    taxVerdict: {
      standardAmount,
      itemizedTotal,
      recommendedStrategy,
      reasoning,
      filingStatus, // ✅ Threaded for downstream logic or display
      dependents,   // ✅ Preserved for future child credit logic
      income,       // ✅ Preserved for AGI-based branching
    },
  };
}