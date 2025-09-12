import { formMapping } from '../../frontend/src/questions/formMapping.js';

export function validateAnswers(answers) {
  const issues = [];
  const validated = {};

  // Validate standard fields
  for (const [key, meta] of Object.entries(formMapping)) {
    const value = answers[key];

    if (value === undefined || value === null || value === '') {
      issues.push({
        key,
        label: meta.label,
        reason: 'Missing required value',
        form: meta.form,
        line: meta.line,
      });
    } else {
      validated[key] = {
        value,
        form: meta.form,
        line: meta.line,
        label: meta.label,
      };
    }
  }

  // Validate income sources
  const selectedIncome = answers.incomeSources || [];

  for (const source of selectedIncome) {
    const meta = formMapping[source];
    if (!meta) {
      issues.push({
        key: `incomeSources.${source}`,
        label: source,
        reason: 'Unknown income type',
      });
      continue;
    }

    validated[`incomeSources.${source}`] = {
      value: true,
      form: meta.form,
      line: meta.line,
      label: meta.label,
    };
  }

  // Check for unmapped income sources
  const allMappedIncomeKeys = Object.keys(formMapping);
  const unmappedIncome = selectedIncome.filter(
    (src) => !allMappedIncomeKeys.includes(src)
  );

  for (const src of unmappedIncome) {
    issues.push({
      key: `incomeSources.${src}`,
      label: src,
      reason: 'Not mapped to IRS form',
    });
  }

  return {
    isValid: issues.length === 0,
    issues,
    validatedAnswers: validated,
  };
}