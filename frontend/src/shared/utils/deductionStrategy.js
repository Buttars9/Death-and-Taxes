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
  } = deductions;

  const medicalThreshold = 0.075 * agi;
  const eligibleMedical = medicalExpenses > medicalThreshold ? medicalExpenses : 0;

  const itemizedTotal =
    mortgageInterest +
    propertyTaxes +
    stateIncomeTax +
    charitableDonations +
    educationExpenses +
    childcareExpenses +
    retirementContributions +
    eligibleMedical;

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