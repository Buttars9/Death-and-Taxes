export function getEligibleCredits({
  income,
  dependents,
  filingStatus,
  capitalGains = 0,
  retirementIncome = 0,
  foreignAssets = [],
  autoLoanInterest = 0,
  age,
  expenses = {}, // User-entered expenses for variable credits
}) {
  const THRESHOLDS = {
    childTaxCreditPhaseOut: { single: 200000, married: 400000 },
    earnedIncomeCreditLimits: {
      0: { single: 18591, married: 25511, maxCredit: 649 },
      1: { single: 49084, married: 56004, maxCredit: 4314 },
      2: { single: 55768, married: 62688, maxCredit: 7152 },
      3: { single: 59899, married: 66819, maxCredit: 8046 },
    },
    investmentIncomeLimit: 11600,
    educationCreditLimit: { single: 90000, married: 180000 },
    retirementCreditLimits: {
      50: { single: 39500, married: 79000 },
      20: { single: 43000, married: 86000 },
      10: { single: 47500, married: 95000 },
    },
    healthcareIncomeLimit: { single: 58000, married: 116000 },
    adoptionPhaseOut: 259190,
    adoptionMax: 17280,
    energyMax: 3200,
    evMax: 7500,
    childcareMax: { oneChild: 3000, twoPlus: 6000 },
    childcarePhaseOutStart: 15000,
    amtTrigger: { married: 200000, single: 125000 },
    capitalGainsCreditLimit: 100000,
    autoLoanDeductionCap: 2500,
    autoLoanIncomeLimit: 150000,
  };

  const credits = [];

  // 💰 Child Tax Credit (2025 IRS Rules)
  if (dependents > 0) {
    const phaseOutStart = filingStatus === 'marriedJointly' ? THRESHOLDS.childTaxCreditPhaseOut.married : THRESHOLDS.childTaxCreditPhaseOut.single;
    const phaseOutRate = 0.05; // $50 per $1,000 over threshold
    const baseAmount = 2200 * dependents; // $2,200 per child
    const excessIncome = Math.max(income - phaseOutStart, 0);
    const reduction = Math.floor(excessIncome / 1000) * 50;
    const amount = Math.max(baseAmount - reduction, 0);
    credits.push({ type: 'child_tax', amount, note: amount > 0 ? `${dependents} qualifying children` : 'Phased out due to income' });
  }

  // 🏥 Earned Income Credit (2025 IRS Rules)
  if (filingStatus !== 'marriedFilingSeparately') {
    const numKids = Math.min(dependents, 3);
    const isMarried = filingStatus === 'marriedJointly';
    const limit = THRESHOLDS.earnedIncomeCreditLimits[numKids]?.[isMarried ? 'married' : 'single'] || 0;
    const maxCredit = THRESHOLDS.earnedIncomeCreditLimits[numKids]?.maxCredit || 0;
    if (income <= limit) {
      credits.push({ type: 'eitc', amount: maxCredit, note: `${numKids} qualifying children` });
    } else {
      credits.push({ type: 'eitc', amount: 0, note: 'Ineligible due to income' });
    }
  }

  // 🎓 Education Credit (AOTC + LLC)
  if (income < (filingStatus === 'marriedJointly' ? THRESHOLDS.educationCreditLimit.married : THRESHOLDS.educationCreditLimit.single)) {
    const expense = expenses.education || 0;
    // Simplified: AOTC up to $2,500 (100% of first $2,000 + 25% of next $2,000)
    const amount = Math.min(2500, expense * 1 + (expense > 2000 ? Math.min(expense - 2000, 2000) * 0.25 : 0));
    credits.push({ type: 'education', amount, note: amount > 0 ? 'Based on qualified education expenses' : 'No expenses provided' });
  }

  // 🧓 Retirement Savings Contributions Credit
  if (expenses.retirement && age >= 18) {
    let percent = 0.5;
    const agiLimit50 = filingStatus === 'marriedJointly' ? THRESHOLDS.retirementCreditLimits[50].married : THRESHOLDS.retirementCreditLimits[50].single;
    const agiLimit20 = filingStatus === 'marriedJointly' ? THRESHOLDS.retirementCreditLimits[20].married : THRESHOLDS.retirementCreditLimits[20].single;
    const agiLimit10 = filingStatus === 'marriedJointly' ? THRESHOLDS.retirementCreditLimits[10].married : THRESHOLDS.retirementCreditLimits[10].single;
    if (income > agiLimit50) percent = 0.2;
    if (income > agiLimit20) percent = 0.1;
    if (income > agiLimit10) percent = 0;
    const maxContribution = filingStatus === 'marriedJointly' ? 4000 : 2000;
    const amount = percent * Math.min(expenses.retirement, maxContribution);
    credits.push({ type: 'retirement', amount, note: amount > 0 ? 'Based on retirement contributions' : 'No credit due to income or no contributions' });
  }

  // 🏥 Healthcare Premium Tax Credit
  if (income < (filingStatus === 'marriedJointly' ? THRESHOLDS.healthcareIncomeLimit.married : THRESHOLDS.healthcareIncomeLimit.single)) {
    const expense = expenses.healthcare || 0;
    // Simplified: 8.5% of income cap
    const amount = Math.min(expense, income * 0.085);
    credits.push({ type: 'healthcare', amount, note: amount > 0 ? 'Based on premium expenses' : 'No expenses provided' });
  }

  // 🌍 Foreign Tax Credit
  if (expenses.foreign) {
    const amount = expenses.foreign; // Simplified: Full foreign tax paid
    credits.push({ type: 'foreign', amount, note: amount > 0 ? 'Based on foreign taxes paid' : 'No foreign taxes provided' });
  }

  // 👶 Adoption Credit
  if (expenses.adoption) {
    const amount = income > THRESHOLDS.adoptionPhaseOut
      ? Math.max(THRESHOLDS.adoptionMax - ((income - THRESHOLDS.adoptionPhaseOut) / 40000) * THRESHOLDS.adoptionMax, 0)
      : Math.min(expenses.adoption, THRESHOLDS.adoptionMax);
    credits.push({ type: 'adoption', amount, note: amount > 0 ? 'Based on adoption expenses' : 'Phased out or no expenses' });
  }

  // 🌱 Residential Energy Credit
  if (expenses.energy) {
    const amount = Math.min(expenses.energy * 0.3, THRESHOLDS.energyMax); // 30% of costs, up to $3,200
    credits.push({ type: 'energy', amount, note: amount > 0 ? 'Based on energy-efficient improvements' : 'No expenses provided' });
  }

  // 🚗 Electric Vehicle Credit
  if (expenses.ev) {
    const amount = Math.min(expenses.ev, THRESHOLDS.evMax); // Up to $7,500
    credits.push({ type: 'ev', amount, note: amount > 0 ? 'Based on EV purchase cost' : 'No expenses provided' });
  }

  // 🧸 Child and Dependent Care Credit
  if (expenses.childcare && dependents > 0) {
    const maxExpense = dependents >= 2 ? THRESHOLDS.childcareMax.twoPlus : THRESHOLDS.childcareMax.oneChild;
    let childcarePercent = 35;
    if (income > THRESHOLDS.childcarePhaseOutStart) {
      childcarePercent = 35 - Math.min(Math.floor((income - THRESHOLDS.childcarePhaseOutStart) / 2000), 15);
    }
    const amount = (childcarePercent / 100) * Math.min(expenses.childcare, maxExpense);
    credits.push({ type: 'childcare', amount, note: amount > 0 ? 'Based on childcare expenses' : 'No expenses provided' });
  }

  // ❓ Other Credit
  if (expenses.other) {
    const amount = expenses.other; // User-defined
    credits.push({ type: 'other', amount, note: 'User-specified credit' });
  }

  // 🧠 AMT Trigger
  const amtThreshold = THRESHOLDS.amtTrigger[filingStatus === 'marriedJointly' ? 'married' : 'single'];
  if (income > amtThreshold && capitalGains > 50000) {
    credits.push({ type: 'amt_warning', amount: 0, note: 'Potential AMT trigger' });
  }

  // 📈 Capital Gains Credit
  if (capitalGains > 0 && income < THRESHOLDS.capitalGainsCreditLimit) {
    credits.push({ type: 'capital_gains', amount: 250, note: 'Based on capital gains' });
  }

  // 🚗 Auto Loan Interest Deduction
  if (autoLoanInterest > 0 && income < THRESHOLDS.autoLoanIncomeLimit) {
    const amount = Math.min(autoLoanInterest, THRESHOLDS.autoLoanDeductionCap);
    credits.push({ type: 'auto_loan', amount, note: 'Based on auto loan interest' });
  }

  // 🌍 Foreign Asset Disclosure
  if (foreignAssets.length > 0) {
    credits.push({ type: 'foreign_assets', amount: 0, note: `${foreignAssets.length} foreign assets flagged for review` });
  }

  return credits
    .map((credit) => ({
      ...credit,
      eligible: credit.amount > 0 || !!credit.note,
    }))
    .sort((a, b) => a.type.localeCompare(b.type));
}