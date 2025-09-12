// tests/receiptGenerator.test.js

import { generateReceipt } from '../shared/utils/generateReceipt';

describe('Audit-Grade Receipt Generator', () => {
  const mockData = {
    filingStatus: 'single',
    income: 55000,
    dependents: 1,
    age: 30,
    deductionType: 'standard',
    credits: ['child_tax'],
    taxWithheld: 2500,
    estimatedPayments: 500,
    refund: 1200,
    balanceDue: 0,
  };

  it('includes all key fields in the receipt', () => {
    const receipt = generateReceipt(mockData);
    expect(receipt).toContain('Filing Status: single');
    expect(receipt).toContain('Income: $55,000');
    expect(receipt).toContain('Dependents: 1');
    expect(receipt).toContain('Refund: $1,200');
    expect(receipt).toContain('Balance Due: $0');
  });

  it('flags when refund is zero and balance is due', () => {
    const altData = { ...mockData, refund: 0, balanceDue: 800 };
    const receipt = generateReceipt(altData);
    expect(receipt).toContain('Refund: $0');
    expect(receipt).toContain('Balance Due: $800');
  });
});