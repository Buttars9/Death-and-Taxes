import { formMapping } from '../../questions/formMapping.js';

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
        const key = `incomeSources.${subKey}`;
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
      flatAnswers[`dependent_${i}_name`] = dep.name;
      flatAnswers[`dependent_${i}_ssn`] = dep.ssn;
      flatAnswers[`dependent_${i}_dob`] = dep.dob;
      flatAnswers[`dependent_${i}_relationship`] = dep.relationship;
    });
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

  return payload;
}