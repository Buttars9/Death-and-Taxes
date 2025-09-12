// death-and-taxes/server/utils/deductionStrategy.js

export function determineDeductionStrategy(answers) {
  const { filingStatus, deductions = {}, agi = 0 } = answers;

  const standardDeductionMap = {
    single: 13850,
    married: 27700,
    headOfHousehold: 20800,
  };

  const standardAmount = standardDeductionMap[filingStatus] || 13850;

  const {
    mortgageInterest = 0,
    propertyTaxes = 0,
    stateIncomeTax = 0,
    charitableDonations = 0,
    educationExpenses = 0,
    childcareExpenses = 0,
    retirementContributions = 0,
    medicalExpenses = 0,
    tipIncome = 0,              // 🔧 OBBBA 2025
    overtimeIncome = 0,         // 🔧 OBBBA 2025
    autoLoanInterest = 0,       // 🔧 OBBBA 2025
    isSenior = false,           // 🔧 OBBBA 2025
  } = deductions;

  const medicalThreshold = 0.075 * agi;
  const eligibleMedical = medicalExpenses > medicalThreshold ? medicalExpenses : 0;

  // 🔧 OBBBA 2025 Deduction Logic
  const tipDeduction = Math.min(Number(tipIncome), 3000);
  const overtimeDeduction = Math.min(Number(overtimeIncome) * 0.15, 5000);
  const autoLoanDeduction = Math.min(Number(autoLoanInterest), 2500);
  const seniorDeduction = isSenior ? 1800 : 0;

  const itemizedTotal =
    mortgageInterest +
    propertyTaxes +
    stateIncomeTax +
    charitableDonations +
    educationExpenses +
    childcareExpenses +
    retirementContributions +
    eligibleMedical +
    tipDeduction +
    overtimeDeduction +
    autoLoanDeduction +
    seniorDeduction;

  const recommendedStrategy = itemizedTotal > standardAmount ? 'itemized' : 'standard';

  const reasoning =
    recommendedStrategy === 'itemized'
      ? `Your itemized deductions total $${itemizedTotal}, which exceeds the standard deduction of $${standardAmount}.`
      : `Standard deduction of $${standardAmount} is higher than your itemized total of $${itemizedTotal}.`;

  return {
    standardAmount,
    itemizedTotal,
    recommendedStrategy,
    reasoning,
  };
}