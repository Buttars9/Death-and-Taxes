// tests/validator.test.js

import { validateInputs } from '../shared/utils/validateInputs';

describe('Input Validator', () => {
  it('passes valid input with all required fields', () => {
    const result = validateInputs({
      filingStatus: 'married',
      income: 75000,
      dependents: 1,
      age: 35,
      deductionType: 'standard',
      credits: ['child_tax'],
    });

    expect(result.valid).toBe(true);
    expect(result.errors.length).toBe(0);
  });

  it('fails when required fields are missing', () => {
    const result = validateInputs({
      income: 75000,
      age: 35,
    });

    expect(result.valid).toBe(false);
    expect(result.errors).toContain('filingStatus is required');
    expect(result.errors).toContain('deductionType is required');
  });

  it('flags invalid deduction type', () => {
    const result = validateInputs({
      filingStatus: 'single',
      income: 50000,
      age: 28,
      deductionType: 'banana',
    });

    expect(result.valid).toBe(false);
    expect(result.errors).toContain('deductionType must be standard or itemized');
  });
});