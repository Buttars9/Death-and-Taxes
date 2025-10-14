import { calculateRefund } from './calculateRefund.js'; // Added: Import to compute refund

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
    maritalStatus,
    spouseName,
    spouseSSN,
    spouseDob,
    dependents = [],
    filingStatus,
    incomeSources = [],
    priorAGI,
    irsPIN,
    foreignIncome,
    residentState,
    deductionType = 'standard',
    deductions = [],
    credits = [],
    estimatedRefund,
    contactEmail,
    submissionTimestamp,
  } = answers;

  const fullName = `${firstName || ''} ${lastName || ''}`.trim();

  const mappedDependents = dependents.map(dep => ({
    name: dep.name,
    ssn: dep.ssn,
    dob: dep.dob,
    relationship: dep.relationship,
  }));

  const totalIncome = Array.isArray(incomeSources)
    ? incomeSources.reduce((sum, src) => sum + Number(src.box1 || src.amount || 0), 0)
    : 0;

  const deductionAmount =
    deductionType === 'standard'
      ? getStandardDeduction(filingStatus)
      : deductions.reduce((sum, d) => sum + Number(d.amount || 0), 0);

  const creditAmount = Array.isArray(credits)
    ? credits.reduce((sum, c) => sum + Number(c.amount || 0), 0)
    : 0;

  // Added: Calculate refund and set refundEstimate to avoid null
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
    estimatedPayments: Number(answers.estimatedPayments) || 0,
    stateTaxWithheld: incomeSources?.reduce((sum, src) => sum + Number(src.box17 || 0), 0) || 0,
    incomeSources: incomeSources,
  };
  const refundSummary = calculateRefund(refundParams);
  const calculatedRefundEstimate = refundSummary.federalRefund || 0; // Set to 0 if null

  return {
    metadata: {
      submittedAt: submissionTimestamp || new Date().toISOString(),
      confirmed: true,
      contactEmail: contactEmail || null,
      refundEstimate: calculatedRefundEstimate, // Updated: Use calculated value
    },
    taxpayer: {
      fullName,
      ssn,
      dob,
      address,
      filingStatus,
      maritalStatus,
      spouse: ['married_joint', 'marriedJointly'].includes(maritalStatus) ? {
        name: spouseName,
        ssn: spouseSSN,
        dob: spouseDob,
      } : null,
      dependents: mappedDependents,
      residentState,
    },
    identityVerification: {
      priorAGI: priorAGI || null,
      irsPIN: irsPIN || null,
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
      refundEstimate: calculatedRefundEstimate, // Updated: Use calculated value
    },
  };
}

function getStandardDeduction(status) {
  const table = {
    single: 13850,
    married_joint: 27700,
    head: 20800,
  };
  return table[status] || 0;
}