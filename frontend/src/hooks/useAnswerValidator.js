// death-and-taxes/src/hooks/useAnswerValidator.js

/**
 * Validates user answers against IRS form mapping.
 * Flags missing fields, invalid formats, and unmapped entries.
 * Used before submission, PDF generation, or backend dispatch.
 */

import { useMemo } from 'react';
import { formMapping } from '../questions/formMapping.js';

export function useAnswerValidator(answers) {
  return useMemo(() => {
    const issues = [];
    const validated = {};

    // Validate atomic fields (non-incomeSources)
    Object.entries(formMapping).forEach(([key, meta]) => {
      if (key === 'incomeSources') return; // handled separately

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
        validated[key] = value;
      }
    });

    // Validate incomeSources array
    const selectedIncome = answers.incomeSources || [];
    const mappedIncome = formMapping.incomeSources || {};

    selectedIncome.forEach((source) => {
      const meta = mappedIncome[source];
      if (!meta) {
        issues.push({
          key: `incomeSources.${source}`,
          label: source,
          reason: 'Unknown income type',
        });
        return;
      }

      validated[`incomeSources.${source}`] = true;
    });

    // Check for unmapped income types
    const allMappedIncomeKeys = Object.keys(mappedIncome);
    const unmappedIncome = selectedIncome.filter((src) => !allMappedIncomeKeys.includes(src));
    if (unmappedIncome.length > 0) {
      unmappedIncome.forEach((src) => {
        issues.push({
          key: `incomeSources.${src}`,
          label: src,
          reason: 'Not mapped to IRS form',
        });
      });
    }

    return {
      isValid: issues.length === 0,
      issues,
      validatedAnswers: validated,
    };
  }, [answers]);
}