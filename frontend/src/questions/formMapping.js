/**
 * Maps each guided flow answer to its IRS form, line number, and audit tag.
 * Used for backend validation, PDF generation, and submission traceability.
 */

export const formMapping = {
  w2: {
    label: 'W-2 Employment',
    form: 'Form 1040',
    line: '1',
    auditTag: 'income_w2_selected',
  },
  '1099': {
    label: 'Self-Employment (1099)',
    form: 'Schedule C',
    line: 'Line 1',
    auditTag: 'income_1099_selected',
    notes: 'Triggers SE tax; may require expense breakdown',
  },
  unemployment: {
    label: 'Unemployment Benefits',
    form: 'Form 1040',
    line: '7',
    auditTag: 'income_unemployment_selected',
  },
  interest_dividends: {
    label: 'Interest & Dividends',
    form: 'Schedule B',
    line: 'Lines 1–5',
    auditTag: 'income_interest_selected',
  },
  rental: {
    label: 'Rental Income',
    form: 'Schedule E',
    line: 'Line 3',
    auditTag: 'income_rental_selected',
  },
  retirement: {
    label: 'Retirement Income (401k, IRA)',
    form: 'Form 1040',
    line: '4a–4b',
    auditTag: 'income_retirement_selected',
  },
  social_security: {
    label: 'Social Security Benefits',
    form: 'Form 1040',
    line: '6a–6b',
    auditTag: 'income_social_security_selected',
  },
  crypto_metals: {
    label: 'Crypto & Precious Metals',
    form: 'Schedule D',
    line: 'Line 13',
    auditTag: 'income_crypto_selected',
    notes: 'Report capital gains/losses; may trigger Form 8949',
  },
  alimony: {
    label: 'Alimony Received',
    form: 'Form 1040',
    line: '2a',
    auditTag: 'income_alimony_selected',
    notes: 'Only applicable for divorces finalized before 2019',
  },
  gambling: {
    label: 'Gambling Winnings',
    form: 'Form W-2G',
    line: 'Varies',
    auditTag: 'income_gambling_selected',
  },
  farm: {
    label: 'Farm Income',
    form: 'Schedule F',
    line: 'Line 9',
    auditTag: 'income_farm_selected',
  },
  foreign: {
    label: 'Foreign Income',
    form: 'Form 2555',
    line: 'Line 1',
    auditTag: 'income_foreign_selected',
    notes: 'May qualify for foreign earned income exclusion',
  },
  other: {
    label: 'Other',
    form: 'Form 1040',
    line: '8',
    auditTag: 'income_other_selected',
  },
};