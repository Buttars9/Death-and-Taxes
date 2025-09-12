// tests/deductionEngine.test.js

import { calculateDeductions } from '../shared/utils/calculateDeductions';

describe('Deduction Engine', () => {
  it('applies standard deduction for single filer', () => {
    const result = calculateDeductions({
      filingStatus: 'single',
      deductionType: 'standard',
      deductions: [],
    });

    expect(result.total).toBeGreaterThan(0);
    expect(result.type).toBe('standard');
  });

  it('calculates itemized deductions correctly', () => {
    const result = calculateDeductions({
      filingStatus: 'married',
      deductionType: 'itemized',
      deductions: [
        { type: 'mortgageInterest', amount: 8000 },
        { type: 'charity', amount: 2000 },
        { type: 'medical', amount: 1500 },
      ],
    });

    expect(result.total).toBe(11500);
    expect(result.type).toBe('itemized');
  });

  it('defaults to standard if itemized total is lower', () => {
    const result = calculateDeductions({
      filingStatus: 'single',
      deductionType: 'itemized',
      deductions: [
        { type: 'charity', amount: 500 },
        { type: 'medical', amount: 300 },
      ],
    });

    expect(result.type).toBe('standard');
  });
});