import { deductionsByState } from '../../server/data/deductionsByState.js';
import { getEligibleCredits } from './creditEngine.js';
import taxData2025 from '../../server/data/taxData2025.js';

/**
 * Calculates refund estimate based on user inputs and 2025 tax rules.
 * @param {Object} params
 * @param {string} params.state - User's selected state
 * @param {string} params.filingStatus - e.g. 'single', 'married'
 * @param {number} params.income - Annual income
 * @param {number} params.dependents - Number of dependents
 * @param {string} params.deductionType - 'standard' or 'itemized'
 * @param {Array} params.deductions - Itemized deductions
 * @param {Array} params.credits - Selected credits
 * @returns {Object} refund estimate
 */
export function calculateRefund({ state, filingStatus, income, dependents, deductionType = 'standard', deductions = [], credits = [] }) {
  if (!state || typeof state !== 'string') {
    throw new Error('Missing or invalid state');
  }
  if (!filingStatus || typeof filingStatus !== 'string') {
    throw new Error('Missing or invalid filing status');
  }
  if (typeof income !== 'number' || income < 0) {
    throw new Error('Invalid income');
  }
  if (typeof dependents !== 'number' || dependents < 0) {
    throw new Error('Invalid dependents');
  }

  const stateData = deductionsByState[state] || {};
  const federalData = taxData2025.federal;
  const notes = stateData.notes ?? '';

  // 🧮 AGI = income (simplified)
  const agi = income;

  // 🧾 Deductions
  const standardDeduction = federalData.standardDeduction[filingStatus] || 15000;
  const itemizedDeduction = deductions.reduce((sum, val) => sum + val.amount, 0);
  const deductionAmount = deductionType === 'itemized' ? itemizedDeduction : standardDeduction;
  const stateDeductionBoost = stateData.standardDeduction ?? 0;

  // 🧮 Taxable income
  const taxableIncome = Math.max(agi - deductionAmount, 0);

  // 🧾 Federal tax brackets
  const brackets = federalData.brackets[filingStatus] || [];
  let taxOwed = 0;
  let remaining = taxableIncome;
  for (let [rate, upTo] of brackets) {
    const prevUpTo = brackets[brackets.indexOf([rate, upTo]) - 1]?.[1] || 0;
    const slice = Math.min(remaining, upTo - prevUpTo);
    if (slice > 0) {
      taxOwed += slice * rate;
      remaining -= slice;
    }
  }

  // 🎯 Credits
  const FEDERAL_BASE = 1500;
  const DEPENDENT_CREDIT = federalData.childTaxCredit || 2200;
  const LOW_INCOME_THRESHOLD = 75000;
  const LOW_INCOME_BONUS = 500;

  const dependentBoost = dependents * DEPENDENT_CREDIT;
  const lowIncomeBoost = income < LOW_INCOME_THRESHOLD ? LOW_INCOME_BONUS : 0;
  const branchingCredits = getEligibleCredits({ income, dependents, filingStatus });
  const branchingTotal = branchingCredits.reduce((sum, c) => sum + c.amount, 0);
  const creditEngineVersion = 'v1.0';

  const creditAmount = FEDERAL_BASE + dependentBoost + lowIncomeBoost + branchingTotal;
  const refund = Math.max(creditAmount - taxOwed, 0);

  return {
    state,
    filingStatus,
    income,
    dependents,
    deduction: deductionAmount + stateDeductionBoost,
    notes,
    creditEngineVersion,
    branchingTotal,
    credits: [
      { label: 'Federal Base Credit', amount: FEDERAL_BASE },
      { label: 'Dependent Credit', amount: dependentBoost },
      ...(lowIncomeBoost > 0 ? [{ label: 'Low Income Bonus', amount: lowIncomeBoost }] : []),
      ...(deductionAmount + stateDeductionBoost > 0 ? [{ label: 'Total Deduction', amount: deductionAmount + stateDeductionBoost }] : []),
      ...branchingCredits.map(c => ({ label: c.type + ' Credit', amount: c.amount })),
    ],
    taxableIncome,
    taxOwed,
    refund
  };
}