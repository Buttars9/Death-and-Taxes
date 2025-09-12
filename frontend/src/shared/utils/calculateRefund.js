// death-and-taxes/shared/utils/calculateRefund.js

import { OBBBA_LAW } from './lawSync.js';
import { getStateCredits } from './creditsByState.js';

export function calculateRefund({
  state,
  filingStatus,
  income,
  dependents,
  age,
  tipIncome = 0,
  overtimeIncome = 0,
  saltPaid = 0,
  assets = [],
}) {
  // Base refund logic
  const baseRefund = 500;
  const dependentBonus = dependents * 300;
  const incomeAdjustment = income < 40000 ? 200 : -100;

  // State-specific adjustment
  let stateAdjustment = 0;
  switch (state) {
    case 'CA':
      stateAdjustment = -50;
      break;
    case 'TX':
      stateAdjustment = 100;
      break;
    default:
      stateAdjustment = 0;
  }

  // Filing status adjustment
  let filingAdjustment = 0;
  switch (filingStatus) {
    case 'single':
      filingAdjustment = -50;
      break;
    case 'married':
      filingAdjustment = 100;
      break;
    default:
      filingAdjustment = 0;
  }

  // 🧠 OBBBA Enhancements

  // Tip & overtime deductions
  const tipDeduction = Math.min(tipIncome, OBBBA_LAW.thresholds.tipDeductionCap);
  const overtimeDeduction = Math.min(overtimeIncome, OBBBA_LAW.thresholds.overtimeDeductionCap);

  // Senior bonus
  const seniorBonus =
    age >= 65
      ? filingStatus === 'married'
        ? OBBBA_LAW.thresholds.seniorBonusDeduction.married
        : OBBBA_LAW.thresholds.seniorBonusDeduction.single
      : 0;

  // SALT cap logic
  const saltAdjustment =
    income < 500000 ? Math.min(saltPaid, OBBBA_LAW.thresholds.saltCap) : 0;

  // Section 179 and bonus depreciation
  const assetDeduction = assets.reduce((total, asset) => {
    if (asset.type === 'equipment' && asset.value <= OBBBA_LAW.thresholds.section179Limit) {
      return total + asset.value;
    }
    return total;
  }, 0);

  const bonusDepreciation = assetDeduction * OBBBA_LAW.thresholds.bonusDepreciation;

  // State-specific credits
  const stateCredits = getStateCredits(state);
  const stateCreditTotal = stateCredits.reduce((sum, credit) => sum + credit.amount, 0);

  // Final refund total
  const total =
    baseRefund +
    dependentBonus +
    incomeAdjustment +
    stateAdjustment +
    filingAdjustment +
    tipDeduction +
    overtimeDeduction +
    seniorBonus +
    saltAdjustment +
    bonusDepreciation +
    stateCreditTotal;

  return {
    state,
    filingStatus,
    income,
    dependents,
    age,
    tipIncome,
    overtimeIncome,
    saltPaid,
    assets,
    baseRefund,
    dependentBonus,
    incomeAdjustment,
    stateAdjustment,
    filingAdjustment,
    tipDeduction,
    overtimeDeduction,
    seniorBonus,
    saltAdjustment,
    bonusDepreciation,
    stateCredits,
    stateCreditTotal,
    total,
    notes: 'Refund calculated using OBBBA thresholds and state-specific credits.',
  };
}