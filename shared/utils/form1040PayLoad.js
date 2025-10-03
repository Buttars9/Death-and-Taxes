// death-and-taxes/src/shared/utils/form1040Payload.js

export default function buildForm1040Payload(answers) {
  if (!answers?.trustConfirmed) {
    throw new Error('❌ Cannot build 1040 payload without trust confirmation.');
  }

  const {
    fullName,
    ssn,
    dob,
    address,
    maritalStatus,
    spouseName,
    spouseSSN,
    spouseDob,
    dependents = [],
    filingStatus,
    income = 0,
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

  // Map dependents
  const mappedDependents = dependents.map(dep => ({
    name: dep.name,
    ssn: dep.ssn,
    dob: dep.dob,
    relationship: dep.relationship,
  }));

  // Deductions
  const deductionAmount =
    deductionType === 'standard'
      ? getStandardDeduction(filingStatus)
      : deductions.length * 1000;

  // Credits
  const creditAmount = credits.length * 1000;

  return {
    metadata: {
      submittedAt: submissionTimestamp || new Date().toISOString(),
      confirmed: true,
      contactEmail: contactEmail || null,
      refundEstimate: estimatedRefund || null,
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
      totalIncome: income,
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
      taxableIncome: Math.max(income - deductionAmount, 0),
      refundEstimate: estimatedRefund || null,
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