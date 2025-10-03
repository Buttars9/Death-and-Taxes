import { OBBBA_LAW } from './lawSync.js';
import { getStateCredits } from './creditsByState.js';
import { deductionsByState } from './deductionsByState.js';

export function calculateRefund({
  state,
  statesPaid = [],
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
  stateTaxWithheld = 0,
  incomeSources = [],
}) {
  const grossIncome = Number(income) || 0;

  // Calculate AGI adjustments (above-the-line deductions)
  let agiAdjustments = 0;
  deductions.forEach((d) => {
    const amt = Number(d.amount || 0);
    switch (d.value) {
      case 'student_loan':
        agiAdjustments += Math.min(amt, 2500);
        break;
      case 'education':
        agiAdjustments += amt;
        break;
      case 'retirement':
        agiAdjustments += amt;
        break;
      case 'hsa':
        agiAdjustments += amt;
        break;
      case 'educator':
        agiAdjustments += Math.min(amt, 300);
        break;
      case 'business':
        agiAdjustments += amt;
        break;
      default:
        // Itemized deductions handled below
        break;
    }
  });

  const agi = Math.max(grossIncome - agiAdjustments, 0);

  // Calculate itemized deductions with rules
  let itemizedSum = 0;
  let saltAmount = 0;
  deductions.forEach((d) => {
    const amt = Number(d.amount || 0);
    switch (d.value) {
      case 'mortgage':
      case 'charity':
      case 'other':
        itemizedSum += amt;
        break;
      case 'medical':
        itemizedSum += Math.max(0, amt - 0.075 * agi);
        break;
      case 'casualty':
        itemizedSum += Math.max(0, amt - 0.1 * agi);
        break;
      case 'salt':
        saltAmount = amt;
        // Apply OBBBA_LAW logic for SALT: full if income < 500k, else capped
        if (agi < 500000) {
          itemizedSum += amt;
        } else {
          itemizedSum += Math.min(amt, OBBBA_LAW.thresholds.saltCap);
        }
        break;
      default:
        // Adjustments already handled
        break;
    }
  });

  const standardDeductionMap = {
    single: 15750,
    marriedJointly: 31500,
    marriedFilingSeparately: 15750,
    headOfHousehold: 23650,
    qualifyingWidow: 31500,
  };

  const stateData = deductionsByState[state] || { standardDeduction: 0 };
  const standardDeductionValue = standardDeductionMap[filingStatus] || stateData.standardDeduction || 15750;

  const deductionAmount = deductionType === 'itemized'
    ? itemizedSum
    : standardDeductionValue;

  const taxableIncome = Math.max(agi - deductionAmount, 0);

  const taxBrackets = {
    single: [ { upTo: 11925, rate: 0.10 }, { upTo: 48475, rate: 0.12 }, { upTo: 103350, rate: 0.22 }, { upTo: 197300, rate: 0.24 }, { upTo: 250525, rate: 0.32 }, { upTo: 626350, rate: 0.35 }, { upTo: Infinity, rate: 0.37 } ],
    marriedJointly: [ { upTo: 23850, rate: 0.10 }, { upTo: 96950, rate: 0.12 }, { upTo: 206700, rate: 0.22 }, { upTo: 394600, rate: 0.24 }, { upTo: 501050, rate: 0.32 }, { upTo: 751600, rate: 0.35 }, { upTo: Infinity, rate: 0.37 } ],
    marriedFilingSeparately: [ { upTo: 11925, rate: 0.10 }, { upTo: 48475, rate: 0.12 }, { upTo: 103350, rate: 0.22 }, { upTo: 197300, rate: 0.24 }, { upTo: 250525, rate: 0.32 }, { upTo: 626350, rate: 0.35 }, { upTo: Infinity, rate: 0.37 } ],
    headOfHousehold: [ { upTo: 17000, rate: 0.10 }, { upTo: 64850, rate: 0.12 }, { upTo: 103350, rate: 0.22 }, { upTo: 197300, rate: 0.24 }, { upTo: 250525, rate: 0.32 }, { upTo: 626350, rate: 0.35 }, { upTo: Infinity, rate: 0.37 } ],
    qualifyingWidow: [ { upTo: 23850, rate: 0.10 }, { upTo: 96950, rate: 0.12 }, { upTo: 206700, rate: 0.22 }, { upTo: 394600, rate: 0.24 }, { upTo: 501050, rate: 0.32 }, { upTo: 751600, rate: 0.35 }, { upTo: Infinity, rate: 0.37 } ],
  };

  const brackets = taxBrackets[filingStatus] || taxBrackets.single;
  let remaining = taxableIncome;
  let federalTaxOwed = 0;

  for (let i = 0; i < brackets.length; i++) {
    const { upTo, rate } = brackets[i];
    const prevUpTo = i === 0 ? 0 : brackets[i - 1].upTo;
    const slice = Math.min(remaining, upTo - prevUpTo);
    if (slice > 0) {
      federalTaxOwed += slice * rate;
      remaining -= slice;
    }
  }

  // Removed hardcoded childTaxCredit to rely on credits array from creditEngine.js
  const creditAmount = credits.reduce((sum, c) => sum + Number(c.amount || 0), 0);
  const totalPayments = Number(taxWithheld) + Number(estimatedPayments);

  const tipDeduction = Math.min(tipIncome, OBBBA_LAW.thresholds.tipDeductionCap);
  const overtimeDeduction = Math.min(overtimeIncome, OBBBA_LAW.thresholds.overtimeDeductionCap);

  const seniorBonus =
    age >= 65
      ? ['marriedJointly', 'qualifyingWidow'].includes(filingStatus)
        ? OBBBA_LAW.thresholds.seniorBonusDeduction.married
        : OBBBA_LAW.thresholds.seniorBonusDeduction.single
      : 0;

  // Use saltAmount from deductions if available, else use provided saltPaid
  const effectiveSaltPaid = saltAmount > 0 ? saltAmount : saltPaid;
  const saltAdjustment = agi < 500000 ? Math.min(effectiveSaltPaid, OBBBA_LAW.thresholds.saltCap) : 0;

  const assetDeduction = assets.reduce((sum, asset) => {
    if (asset.type === 'equipment' && asset.value <= OBBBA_LAW.thresholds.section179Limit) {
      return sum + Number(asset.value || 0);
    }
    return sum;
  }, 0);

  const bonusDepreciation = assetDeduction * OBBBA_LAW.thresholds.bonusDepreciation;

  const stateTaxRates = {
    Alabama: 0.05, Alaska: 0, Arizona: 0.025, Arkansas: 0.049, California: 0.093,
    Colorado: 0.044, Connecticut: 0.05, Delaware: 0.066, Florida: 0, Georgia: 0.0575,
    Hawaii: 0.0825, Idaho: 0.058, Illinois: 0.0495, Indiana: 0.0315, Iowa: 0.057,
    Kansas: 0.057, Kentucky: 0.045, Louisiana: 0.0425, Maine: 0.0715, Maryland: 0.055,
    Massachusetts: 0.05, Michigan: 0.0425, Minnesota: 0.0785, Mississippi: 0.05, Missouri: 0.0495,
    Montana: 0.0675, Nebraska: 0.0664, Nevada: 0, NewHampshire: 0, NewJersey: 0.0635,
    NewMexico: 0.059, NewYork: 0.065, NorthCarolina: 0.0475, NorthDakota: 0.029, Ohio: 0.0399,
    Oklahoma: 0.0475, Oregon: 0.099, Pennsylvania: 0.0307, RhodeIsland: 0.055, SouthCarolina: 0.07,
    SouthDakota: 0, Tennessee: 0, Texas: 0, Utah: 0.0485, Vermont: 0.066,
    Virginia: 0.0575, Washington: 0, WestVirginia: 0.065, Wisconsin: 0.0765, Wyoming: 0,
  };

  const stateRefunds = {};
  const statesToProcess = statesPaid.length ? statesPaid : [state];

  statesToProcess.forEach((stateName) => {
    const rate = stateTaxRates[stateName] || 0;
    const credits = getStateCredits(stateName, dependents);
    const creditTotal = credits.reduce((sum, c) => sum + Number(c.amount || 0), 0);
    const owed = taxableIncome * rate;
    const adjustments = Number(stateTaxWithheld) + creditTotal;
    const refund = Math.max(adjustments - owed, 0);
    const balanceDue = Math.max(owed - adjustments, 0);

    stateRefunds[stateName] = {
      stateTaxOwed: owed,
      stateRefund: refund,
      stateBalanceDue: balanceDue,
      stateCredits: credits,
      stateCreditTotal: creditTotal,
    };
  });

  const federalAdjustments =
    creditAmount +
    totalPayments +
    tipDeduction +
    overtimeDeduction +
    seniorBonus +
    saltAdjustment +
    bonusDepreciation;

  const federalRefund = Math.max(federalAdjustments - federalTaxOwed, 0);
  const federalBalanceDue = Math.max(federalTaxOwed - federalAdjustments, 0);

  // Preserve single-state fields for compatibility
  const fallbackState = stateRefunds[state] || {
    stateTaxOwed: 0,
    stateRefund: 0,
    stateBalanceDue: 0,
    stateCredits: [],
    stateCreditTotal: 0,
  };

  return {
    agi,
    deductionAmount,
    deductionType,
    taxableIncome,
    federalTaxOwed,
    creditAmount,
    totalPayments,
    federalRefund,
    federalBalanceDue,
    stateTaxOwed: fallbackState.stateTaxOwed,
    stateRefund: fallbackState.stateRefund,
    stateBalanceDue: fallbackState.stateBalanceDue,
    stateCredits: fallbackState.stateCredits,
    stateCreditTotal: fallbackState.stateCreditTotal,
    tipDeduction,
    overtimeDeduction,
    seniorBonus,
    saltAdjustment,
    bonusDepreciation,
    stateRefunds,
    notes: 'Refund calculated using 2025 IRS brackets, OBBBA enhancements, and multi-state logic.',
  };
}