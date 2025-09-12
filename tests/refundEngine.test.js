// tests/refundEngine.test.js

import { calculateRefund } from '../shared/utils/calculateRefund';

describe('Refund Engine', () => {
  it('calculates refund for standard deduction with credits and payments', () => {
    const result = calculateRefund({
      state: 'CA',
      filingStatus: 'single',
      income: 50000,
      dependents: 2,
      age: 30,
      deductionType: 'standard',
      deductions: [],
      credits: ['child_tax', 'education'],
      taxWithheld: 3000,
      estimatedPayments: 1000,
    });

    expect(result.taxableIncome).toBeGreaterThan(0);
    expect(result.taxOwed).toBeGreaterThan(0);
    expect(result.refund).toBeGreaterThan(0);
    expect(result.balanceDue).toBe(0);
  });

  it('calculates balance due when credits and payments are insufficient', () => {
    const result = calculateRefund({
      state: 'TX',
      filingStatus: 'single',
      income: 100000,
      dependents: 0,
      age: 40,
      deductionType: 'standard',
      deductions: [],
      credits: [],
      taxWithheld: 1000,
      estimatedPayments: 500,
    });

    expect(result.taxOwed).toBeGreaterThan(result.totalPayments);
    expect(result.balanceDue).toBeGreaterThan(0);
  });
});