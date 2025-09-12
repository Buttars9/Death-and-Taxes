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
  deductionType = 'standard',
  deductions = [],
  credits = [],
  taxWithheld = 0,
  estimatedPayments = 0,
}) {
  // 🧮 AGI = income (simplified for now)
  const agi = income;

  // 🧾 Deductions
  const standardDeductionMap = {
    single: 13850,
    married: 27700,
    headOfHousehold: 20800,
  };

  const standardDeduction = standardDeductionMap[filingStatus] || 13850;
  const itemizedDeduction = deductions.length * 1000; // Simplified
  const deductionAmount =
    deductionType === 'itemized' ? itemizedDeduction : standardDeduction;

  // 🧮 Taxable income
  const taxableIncome = Math.max(agi - deductionAmount, 0);

  // 🧾 IRS Tax Brackets (2024 simplified)
  const taxBrackets = {
    single: [
      { upTo: 11000, rate: 0.10 },
      { upTo: 44725, rate: 0.12 },
      { upTo: 95375, rate: 0.22 },
    ],
    married: [
      { upTo: 22000, rate: 0.10 },
      { upTo: 89450, rate: 0.12 },
      { upTo: 190750, rate: 0.22 },
    ],
    headOfHousehold: [
      { upTo: 15700, rate: 0.10 },
      { upTo: 59850, rate: 0.12 },
      { upTo: 95350, rate: 0.22 },
    ],
  };

  const brackets = taxBrackets[filingStatus] || [];
  let remaining = taxableIncome;
  let taxOwed = 0;

  for (let i = 0; i < brackets.length; i++) {
    const { upTo, rate } = brackets[i];
    const prevUpTo = i === 0 ? 0 : brackets[i - 1].upTo;
    const slice = Math.min(remaining, upTo - prevUpTo);
    if (slice > 0) {
      taxOwed += slice * rate;
      remaining -= slice;
    }
  }

  // 💸 Credits
  const creditAmount = credits.length * 1000; // Simplified

  // 💰 Payments
  const totalPayments = taxWithheld + estimatedPayments;

  // 🧠 OBBBA Enhancements
  const tipDeduction = Math.min(tipIncome, OBBBA_LAW.thresholds.tipDeductionCap);
  const overtimeDeduction = Math.min(overtimeIncome, OBBBA_LAW.thresholds.overtimeDeductionCap);

  const seniorBonus =
    age >= 65
      ? filingStatus === 'married'
        ? OBBBA_LAW.thresholds.seniorBonusDeduction.married
        : OBBBA_LAW.thresholds.seniorBonusDeduction.single
      : 0;

  const saltAdjustment =
    income < 500000 ? Math.min(saltPaid, OBBBA_LAW.thresholds.saltCap) : 0;

  const assetDeduction = assets.reduce((total, asset) => {
    if (asset.type === 'equipment' && asset.value <= OBBBA_LAW.thresholds.section179Limit) {
      return total + asset.value;
    }
    return total;
  }, 0);

  const bonusDepreciation = assetDeduction * OBBBA_LAW.thresholds.bonusDepreciation;

  const stateCredits = getStateCredits(state);
  const stateCreditTotal = stateCredits.reduce((sum, credit) => sum + credit.amount, 0);

  // 🧾 Final refund calculation
  const totalAdjustments =
    creditAmount +
    totalPayments +
    tipDeduction +
    overtimeDeduction +
    seniorBonus +
    saltAdjustment +
    bonusDepreciation +
    stateCreditTotal;

  const refund = Math.max(totalAdjustments - taxOwed, 0);
  const balanceDue = Math.max(taxOwed - totalAdjustments, 0);

  return {
    agi,
    deductionAmount,
    deductionType,
    taxableIncome,
    taxOwed,
    creditAmount,
    totalPayments,
    refund,
    balanceDue,
    tipDeduction,
    overtimeDeduction,
    seniorBonus,
    saltAdjustment,
    bonusDepreciation,
    stateCredits,
    stateCreditTotal,
    notes: 'Refund calculated using IRS brackets, credits, payments, and OBBBA thresholds.',
  };
}