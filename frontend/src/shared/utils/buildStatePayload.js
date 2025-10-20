import { calculateRefund } from './calculateRefund.js'; // If needed for recalcs

export default function buildStatePayload({ answers, refundSummary }) {
  const {
    firstName,
    lastName,
    ssn,
    dob,
    address,
    city,
    zip,
    maritalStatus,
    spouseName,
    spouseSSN,
    spouseDob,
    dependents = [],
    incomeSources = [],
    priorAGI,
    irsPin, // State might reuse federal PIN or have own
    foreignIncome,
    residentState,
    deductionType = 'standard',
    deductions = [],
    credits = [],
    estimatedPayments,
    contactEmail,
    submissionTimestamp,
  } = answers;

  const fullName = `${firstName || ''} ${lastName || ''}`.trim();

  const mappedDependents = dependents.map(dep => ({
    firstName: dep.firstName || '',
    lastName: dep.lastName || '',
    ssn: dep.ssn,
    dob: dep.dob,
    relationship: dep.relationship,
  }));

  // State-specific income (e.g., from W-2 box 16)
  const stateIncome = incomeSources.reduce((sum, src) => {
    if (src.box15?.trim() === residentState) { // Filter by state
      return sum + Number(src.box16 || 0); // State wages
    }
    return sum;
  }, 0);

  // State deduction (adapt standard/itemized for state rules)
  const stateDeductionAmount =
    deductionType === 'standard'
      ? getStandardDeduction(maritalStatus, residentState) // Customize per state if needed
      : deductions.reduce((sum, d) => sum + Number(d.amount || 0), 0);

  // State credits (filter or adjust federal credits for state)
  const stateCreditAmount = Array.isArray(credits)
    ? credits.reduce((sum, c) => sum + Number(c.amount || 0), 0) // Placeholder; state-specific calcs here
    : 0;

  // Use refundSummary for state refund/balance
  const stateRefundData = refundSummary.stateRefunds?.[residentState] || {};
  const calculatedStateRefund = stateRefundData.stateRefund || 0;
  const calculatedStateTaxableIncome = stateIncome - stateDeductionAmount;

  const payload = {
    metadata: {
      state: residentState,
      submittedAt: submissionTimestamp || new Date().toISOString(),
      confirmed: true,
      contactEmail: contactEmail || null,
      refundEstimate: calculatedStateRefund,
    },
    taxpayer: {
      fullName,
      ssn,
      dob,
      address,
      city: city || '',
      zip: zip || '',
      filingStatus: maritalStatus,
      spouse: ['marriedJointly', 'married_joint'].includes(maritalStatus) ? {
        name: spouseName,
        ssn: spouseSSN,
        dob: spouseDob,
      } : null,
      dependents: mappedDependents,
    },
    identityVerification: {
      priorAGI: priorAGI || null,
      statePIN: irsPin || null, // Reuse federal PIN or add state-specific
    },
    incomeDetails: {
      stateIncome,
      foreignIncome: !!foreignIncome, // May affect state taxes
    },
    deductions: {
      type: deductionType,
      items: deductionType === 'itemized' ? deductions : [],
      amount: stateDeductionAmount,
    },
    credits: {
      items: credits, // Filter for state-eligible credits if needed
      amount: stateCreditAmount,
    },
    summary: {
      taxableIncome: Math.max(calculatedStateTaxableIncome, 0),
      refundEstimate: calculatedStateRefund,
      withholding: incomeSources.reduce((sum, src) => sum + Number(src.box17 || 0), 0), // State withholding
    },
  };

  // Validation (adapt from federal)
  if (!ssn) throw new Error('Missing SSN for state filing');
  if (!fullName) throw new Error('Missing fullName for state filing');
  if (calculatedStateRefund > 0 && !answers.bankInfo) console.warn('Missing bank info for state direct deposit');
  if (mappedDependents.some(dep => !dep.firstName || !dep.lastName)) throw new Error('Incomplete dependent names for state filing');

  return payload;
}

// Customize standard deduction per state (example for Idaho; add more)
function getStandardDeduction(status, state) {
  // Federal fallback as base; override per state
  const federalTable = {
    single: 13850,
    marriedJointly: 27700,
    headOfHousehold: 20800,
  };
  let base = federalTable[status] || 0;

  // State adjustments (research actual values)
  if (state === 'Idaho') {
    // Idaho mirrors federal but with adjustments; placeholder
    base *= 1.0; // No change for example
  }
  // Add cases for other states

  return base;
}