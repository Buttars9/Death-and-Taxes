export function getEligibleCredits({
  income,
  dependents,
  filingStatus,
  capitalGains = 0,
  retirementIncome = 0,
  foreignAssets = [],
  autoLoanInterest = 0,
  age,
}) {
  const THRESHOLDS = {
    childTaxCreditHighIncome: 200000,
    earnedIncomeCreditLimit: 45000,
    educationCreditLimit: 80000,
    amtTrigger: { married: 200000, single: 125000 },
    capitalGainsCreditLimit: 100000,
    retirementExclusionCap: 10000,
    autoLoanDeductionCap: 2500,
    autoLoanIncomeLimit: 150000,
  };

  const credits = [];

  // 💰 Child Tax Credit
  if (dependents > 0) {
    const baseCTC =
      income < THRESHOLDS.childTaxCreditHighIncome ? 2000 : 1000;
    credits.push({ type: 'CTC', amount: dependents * baseCTC });
  }

  // 🏥 Earned Income Credit
  if (income < THRESHOLDS.earnedIncomeCreditLimit && filingStatus === 'single') {
    credits.push({ type: 'EIC', amount: 500 });
  }

  // 🎓 Education Credit
  if (income < THRESHOLDS.educationCreditLimit) {
    credits.push({ type: 'EDU', amount: 1000 });
  }

  // 🧠 AMT Trigger
  const amtThreshold = THRESHOLDS.amtTrigger[filingStatus] ?? 125000;
  if (income > amtThreshold && capitalGains > 50000) {
    credits.push({
      type: 'AMT Warning',
      amount: 0,
      note: 'Potential AMT trigger',
    });
  }

  // 📈 Capital Gains Threshold
  if (capitalGains > 0 && income < THRESHOLDS.capitalGainsCreditLimit) {
    credits.push({ type: 'Capital Gains Credit', amount: 250 });
  }

  // 🧓 Retirement Income Exclusion
  if (retirementIncome > 0 && age >= 65) {
    const exclusion = Math.min(
      retirementIncome,
      THRESHOLDS.retirementExclusionCap
    );
    credits.push({ type: 'Retirement Exclusion', amount: exclusion });
  }

  // 🌍 Foreign Asset Disclosure
  if (foreignAssets.length > 0) {
    credits.push({
      type: 'Foreign Asset Disclosure',
      amount: 0,
      note: `${foreignAssets.length} foreign assets flagged for review`,
    });
  }

  // 🚗 Auto Loan Interest Deduction
  if (autoLoanInterest > 0 && income < THRESHOLDS.autoLoanIncomeLimit) {
    const deduction = Math.min(
      autoLoanInterest,
      THRESHOLDS.autoLoanDeductionCap
    );
    credits.push({ type: 'Auto Loan Deduction', amount: deduction });
  }

  return credits
    .map((credit) => ({
      ...credit,
      eligible: credit.amount > 0 || !!credit.note,
    }))
    .sort((a, b) => a.type.localeCompare(b.type));
}