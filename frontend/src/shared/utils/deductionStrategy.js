// death-and-taxes/server/utils/deductionStrategy.js

export function determineDeductionStrategy(answers) {
  const { filingStatus, deductions = {}, agi = 0, age } = answers;

  const standardDeductionMap = {
    single: 15750,
    marriedJointly: 31500,
    headOfHousehold: 23625,
    marriedFilingSeparately: 15750,
    qualifyingWidow: 31500,
  };

  let standardAmount = standardDeductionMap[filingStatus] || 15750;

  // Add OBBBA senior extra if applicable
  if (age >= 65) {
    standardAmount += 6000; // Simplified for primary filer; double for MFJ if both qualify
  }

  const {
    mortgageInterest = 0,
    propertyTaxes = 0,
    stateIncomeTax = 0,
    charitableDonations = 0,
    // Removed non-itemized: educationExpenses, childcareExpenses, retirementContributions
    medicalExpenses = 0,
  } = deductions;

  const medicalThreshold = 0.075 * agi;
  const eligibleMedical = medicalExpenses > medicalThreshold ? medicalExpenses - medicalThreshold : 0; // Fixed to subtract threshold

  // Apply SALT cap
  const saltTotal = propertyTaxes + stateIncomeTax;
  const saltCap = filingStatus === 'marriedFilingSeparately' ? 20200 : 40400;
  const eligibleSalt = Math.min(saltTotal, saltCap);

  const itemizedTotal =
    mortgageInterest +
    eligibleSalt +
    charitableDonations +
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