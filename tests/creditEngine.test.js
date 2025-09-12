// tests/creditEngine.test.js

import { applyCredits } from '../shared/utils/applyCredits';

describe('Credit Engine', () => {
  it('applies child tax and education credits correctly', () => {
    const result = applyCredits({
      income: 60000,
      dependents: 2,
      age: 28,
      credits: ['child_tax', 'education'],
    });

    expect(result.totalCredits).toBeGreaterThan(0);
    expect(result.breakdown.child_tax).toBeDefined();
    expect(result.breakdown.education).toBeDefined();
  });

  it('excludes credits when not eligible', () => {
    const result = applyCredits({
      income: 120000,
      dependents: 0,
      age: 45,
      credits: ['child_tax', 'education'],
    });

    expect(result.totalCredits).toBe(0);
    expect(result.breakdown.child_tax).toBe(0);
    expect(result.breakdown.education).toBe(0);
  });

  it('handles unknown credit types gracefully', () => {
    const result = applyCredits({
      income: 50000,
      dependents: 1,
      age: 30,
      credits: ['banana_bonus'],
    });

    expect(result.totalCredits).toBe(0);
    expect(result.breakdown.banana_bonus).toBeUndefined();
  });
});