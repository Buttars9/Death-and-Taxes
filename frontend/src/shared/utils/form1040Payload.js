import { calculateRefund } from './calculateRefund.js';

export default function buildForm1040Payload(answers) {
  if (!answers?.trustConfirmed) {
    throw new Error('❌ Cannot build 1040 payload without trust confirmation.');
  }

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
    irsPin,
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

  const totalIncome = Array.isArray(incomeSources)
    ? incomeSources.reduce((sum, src) => sum + Number(src.box1 || src.amount || 0), 0)
    : 0;

  const deductionAmount =
    deductionType === 'standard'
      ? getStandardDeduction(maritalStatus)
      : deductions.reduce((sum, d) => sum + Number(d.amount || 0), 0);

  const creditAmount = Array.isArray(credits)
    ? credits.reduce((sum, c) => sum + Number(c.amount || 0), 0)
    : 0;

  const refundParams = {
    state: residentState || 'N/A',
    statesPaid: Array.from(new Set(incomeSources?.map(src => src.box15?.trim()).filter(Boolean))) || [],
    filingStatus: maritalStatus || 'single',
    income: totalIncome,
    dependents: mappedDependents.length,
    age: answers.age || 0,
    tipIncome: answers.tipIncome || 0,
    overtimeIncome: answers.overtimeIncome || 0,
    saltPaid: answers.saltPaid || 0,
    assets: answers.assets || [],
    deductionType: deductionType,
    deductions: deductions,
    credits: credits,
    taxWithheld: incomeSources?.reduce((sum, src) => sum + Number(src.box2 || src.federalTaxWithheld || 0), 0) || 0,
    estimatedPayments: Number(estimatedPayments) || 0,
    stateTaxWithheld: incomeSources?.reduce((sum, src) => sum + Number(src.box17 || 0), 0) || 0,
    incomeSources: incomeSources,
  };
  const refundSummary = calculateRefund(refundParams);
  const calculatedRefundEstimate = refundSummary.federalRefund || 0;

  const payload = {
    metadata: {
      submittedAt: submissionTimestamp || new Date().toISOString(),
      confirmed: true,
      contactEmail: contactEmail || null,
      refundEstimate: calculatedRefundEstimate,
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
      residentState,
    },
    identityVerification: {
      priorAGI: priorAGI || null,
      irsPIN: irsPin || null,
    },
    incomeDetails: {
      totalIncome,
      foreignIncome: !!foreignIncome,
    },
    deductions: {
      type: deductionType,
      items: deductionType === 'itemized' ? deductions : [],
      amount: deductionAmount,
    },
    credits: {
      items: credits,
      amount: creditAmount,
    },
    summary: {
      taxableIncome: Math.max(totalIncome - deductionAmount, 0),
      refundEstimate: calculatedRefundEstimate,
    },
  };

  // Validation
  if (!ssn) throw new Error('Missing SSN');
  if (!fullName) throw new Error('Missing fullName');
  if (calculatedRefundEstimate > 0 && !answers.bankInfo) console.warn('Missing bank info for direct deposit—refund will be mailed');
  if (dependents.some(dep => !dep.firstName || !dep.lastName)) throw new Error('Incomplete dependent names');

  return payload;
}

function getStandardDeduction(status) {
  const table = {
    single: 13850,
    marriedJointly: 27700,
    headOfHousehold: 20800,
    // Add more as needed
  };
  return table[status] || 0;
}