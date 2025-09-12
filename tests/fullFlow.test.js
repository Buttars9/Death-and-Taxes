// tests/fullFlow.test.js

import { validateInputs } from '../shared/utils/validateInputs';
import { calculateDeductions } from '../shared/utils/calculateDeductions';
import { applyCredits } from '../shared/utils/applyCredits';
import { calculatePayments } from '../shared/utils/calculatePayments';
import { calculateRefund } from '../shared/utils/calculateRefund';
import { generateReceipt } from '../shared/utils/generateReceipt';

describe('Full Tax Flow', () => {
  const userInput = {
    filingStatus: 'single',
    income: 65000,
    dependents: 1,
    age: 29,
    deductionType: 'standard',
    deductions: [],
    credits: ['child_tax'],
    taxWithheld: 3000,
    estimatedPayments: 500,
  };

  it('runs full flow and generates valid receipt', () => {
    const validation = validateInputs(userInput);
    expect(validation.valid).toBe(true);

    const deductions = calculateDeductions(userInput);
    const credits = applyCredits(userInput);
    const payments = calculatePayments(userInput);

    const refundResult = calculateRefund({
      ...userInput,
      deductions,
      credits,
      totalPayments: payments.totalPayments,
    });

    const receipt = generateReceipt({
      ...userInput,
      ...refundResult,
    });

    expect(receipt).toContain('Filing Status: single');
    expect(receipt).toContain('Income: $65,000');
    expect(receipt).toContain('Refund:');
  });
});