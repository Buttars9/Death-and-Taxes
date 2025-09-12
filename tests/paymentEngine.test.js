// tests/paymentEngine.test.js

import { calculatePayments } from '../shared/utils/calculatePayments';

describe('Payment Engine', () => {
  it('sums tax withheld and estimated payments', () => {
    const result = calculatePayments({
      taxWithheld: 2500,
      estimatedPayments: 1000,
    });

    expect(result.totalPayments).toBe(3500);
  });

  it('handles missing estimated payments', () => {
    const result = calculatePayments({
      taxWithheld: 2000,
    });

    expect(result.totalPayments).toBe(2000);
  });

  it('handles zero payments gracefully', () => {
    const result = calculatePayments({
      taxWithheld: 0,
      estimatedPayments: 0,
    });

    expect(result.totalPayments).toBe(0);
  });
});