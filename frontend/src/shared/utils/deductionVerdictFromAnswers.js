// frontend/src/shared/utils/deductionVerdictFromAnswers.js
import { deductionsByState } from './deductionsByState.js';

export default function deductionVerdictFromAnswers(answers) {
  const {
    income = 0,
    dependents = 0,
    filingStatus = 'single',
    itemizedDeductions = [],
    state = 'N/A',
    age,
  } = answers;

  const standardDeductionMap = {
    single: 15750,
    marriedJointly: 31500,
    marriedFilingSeparately: 15750,
    headOfHousehold: 23625,
    qualifyingWidow: 31500,
  };

  let standardAmount = standardDeductionMap[filingStatus] || 15750;

  // Add OBBBA senior extra if applicable
  if (age >= 65) {
    standardAmount += 6000; // Simplified for primary filer
  }

  let itemizedTotal = 0;
  itemizedDeductions.forEach((val) => {
    let amt = Number(val.amount || 0);
    switch (val.value) {
      case 'medical':
        amt = Math.max(0, amt - 0.075 * income);
        break;
      case 'casualty':
        amt = Math.max(0, amt - 0.1 * income);
        break;
      case 'salt':
        amt = Math.min(amt, 40400); // OBBBA cap
        break;
      default:
        break;
    }
    itemizedTotal += amt;
  });

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