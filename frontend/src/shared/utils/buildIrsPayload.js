/**
 * Converts validated user answers into IRS-aligned payload.
 * Uses formMapping.js to assign form, line, and value.
 * Output is structured for backend dispatch and PDF generation.
 */

import { formMapping } from '../../questions/formMapping.js'; // ✅ FIXED PATH
import { autoLoanCap, seniorDeductionAmount } from '../../constants.js'; // 🔧 NEW IMPORT

export function buildIrsPayload(validatedAnswers) {
  const payload = {};

  // Handle atomic fields
  Object.entries(formMapping).forEach(([key, meta]) => {
    if (key === 'incomeSources') return;

    const value = validatedAnswers[key];
    if (value === undefined) return;

    if (!payload[meta.form]) {
      payload[meta.form] = {};
    }

    payload[meta.form][meta.line] = value;

    // 🔧 OBBBA 2025 Deductions — Injected Here
    if (key === 'tipIncome') {
      const deduction = Math.min(Number(value), 3000);
      payload['1040'] = payload['1040'] || {};
      payload['1040']['12a'] = (payload['1040']['12a'] || 0) + deduction;
    }

    if (key === 'overtimeIncome') {
      const deduction = Math.min(Number(value) * 0.15, 5000);
      payload['1040'] = payload['1040'] || {};
      payload['1040']['12b'] = (payload['1040']['12b'] || 0) + deduction;
    }

    if (key === 'autoLoanInterest') {
      const deduction = Math.min(Number(value), autoLoanCap);
      payload['1040'] = payload['1040'] || {};
      payload['1040']['12c'] = (payload['1040']['12c'] || 0) + deduction;
    }

    if (key === 'isSenior' && value === true) {
      payload['1040'] = payload['1040'] || {};
      payload['1040']['12d'] = (payload['1040']['12d'] || 0) + seniorDeductionAmount;
    }
  });

  // Handle incomeSources
  const incomeMeta = formMapping.incomeSources || {};
  Object.keys(validatedAnswers).forEach((key) => {
    if (!key.startsWith('incomeSources.')) return;

    const source = key.split('.')[1];
    const meta = incomeMeta[source];
    if (!meta) return;

    if (!payload[meta.form]) {
      payload[meta.form] = {};
    }

    payload[meta.form][meta.line] = true;
  });

  return payload;
}