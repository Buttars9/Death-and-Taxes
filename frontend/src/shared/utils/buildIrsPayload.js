import { formMapping } from '../../questions/formMapping.js';
import { calculateRefund } from './calculateRefund.js'; // Correct import for same folder

export function buildIrsPayload(validatedAnswers) {
  const payload = {
    forms: {},
    metadata: {
      timestamp: new Date().toISOString(),
      source: 'Powered by Pi - Death & Taxes',
    },
  };

  const flatAnswers = { ...validatedAnswers };

  // Flatten incomeSources
  if (Array.isArray(validatedAnswers.incomeSources)) {
    validatedAnswers.incomeSources.forEach((src, i) => {
      Object.entries(src).forEach(([subKey, value]) => {
        const key = `incomeSources_${i}_${subKey}`;
        flatAnswers[key] = value;
      });
    });
  }

  // Flatten deductions
  if (Array.isArray(validatedAnswers.deductions)) {
    validatedAnswers.deductions.forEach((d, i) => {
      flatAnswers[`deduction_${i}_value`] = d.value;
      flatAnswers[`deduction_${i}_amount`] = d.amount;
    });
  }

  // Flatten credits
  if (Array.isArray(validatedAnswers.credits)) {
    validatedAnswers.credits.forEach((c, i) => {
      flatAnswers[`credit_${i}_value`] = c.value;
      flatAnswers[`credit_${i}_amount`] = c.amount;
    });
  }

  // Flatten dependents
  if (Array.isArray(validatedAnswers.dependents)) {
    validatedAnswers.dependents.forEach((dep, i) => {
      flatAnswers[`dependent_${i}_firstName`] = dep.firstName; // New: Split for XML
      flatAnswers[`dependent_${i}_lastName`] = dep.lastName;
      flatAnswers[`dependent_${i}_ssn`] = dep.ssn;
      flatAnswers[`dependent_${i}_dob`] = dep.dob;
      flatAnswers[`dependent_${i}_relationship`] = dep.relationship;
    });
  }

  // New: Flatten bank info for refund
  if (validatedAnswers.bankInfo) {
    flatAnswers.bankRouting = validatedAnswers.bankInfo.routingNumber;
    flatAnswers.bankAccount = validatedAnswers.bankInfo.accountNumber;
    flatAnswers.bankType = validatedAnswers.bankInfo.accountType;
  }

  Object.entries(flatAnswers).forEach(([key, value]) => {
    const lookupKey = key.startsWith('incomeSources.') ? key.split('.')[1] : key;
    const meta = formMapping[lookupKey];

    if (!meta || !meta.form || !meta.line) return;

    if (!payload.forms[meta.form]) {
      payload.forms[meta.form] = {};
    }

    payload.forms[meta.form][meta.line] = value;
  });

  // Added: Calculate refund and set refundEstimate to avoid null
  const refundParams = {
    state: validatedAnswers.residentState || 'N/A',
    statesPaid: Array.from(new Set(validatedAnswers.incomeSources?.map(src => src.box15?.trim()).filter(Boolean))) || [],
    filingStatus: validatedAnswers.maritalStatus || 'single',
    income: validatedAnswers.incomeSources?.reduce((sum, src) => sum + Number(src.box1 || src.amount || 0), 0) || 0,
    dependents: Array.isArray(validatedAnswers.dependents) ? validatedAnswers.dependents.length : validatedAnswers.dependents ? 1 : 0,
    age: validatedAnswers.age || 0,
    tipIncome: validatedAnswers.tipIncome || 0,
    overtimeIncome: validatedAnswers.overtimeIncome || 0,
    saltPaid: validatedAnswers.saltPaid || 0,
    assets: validatedAnswers.assets || [],
    deductionType: validatedAnswers.deductionType || 'standard',
    deductions: validatedAnswers.deductions || [],
    credits: validatedAnswers.credits || [],
    taxWithheld: validatedAnswers.incomeSources?.reduce((sum, src) => sum + Number(src.box2 || src.federalTaxWithheld || 0), 0) || 0,
    estimatedPayments: Number(validatedAnswers.estimatedPayments) || 0,
    stateTaxWithheld: validatedAnswers.incomeSources?.reduce((sum, src) => sum + Number(src.box17 || 0), 0) || 0,
    incomeSources: validatedAnswers.incomeSources || [],
  };
  const refundSummary = calculateRefund(refundParams);
  if (!payload.forms.summary) {
    payload.forms.summary = {};
  }
  payload.forms.summary.refundEstimate = refundSummary.federalRefund || 0; // Set to 0 if null
  payload.forms.summary.taxableIncome = refundSummary.taxableIncome || 0; // Added for completeness

  // New: Withholding from W-2s (for FederalIncomeTaxWithheldAmt)
  payload.forms.summary.withholding = refundParams.taxWithheld;

  // New: Basic validation for required fields (throw errors if missing)
  if (!validatedAnswers.ssn) throw new Error('Missing SSN');
  if (!validatedAnswers.fullName) throw new Error('Missing fullName');
  if (summary.refundEstimate > 0 && !validatedAnswers.bankInfo) console.warn('Missing bank info for direct deposit—refund will be mailed');
  if (validatedAnswers.dependents?.some(dep => !dep.firstName || !dep.lastName)) throw new Error('Incomplete dependent names');

  return payload;
}