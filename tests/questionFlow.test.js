// tests/questionFlow.test.js

import { getNextQuestion } from '../frontend/flows/questionEngine';

describe('Guided Question Engine', () => {
  it('starts with filing status question', () => {
    const result = getNextQuestion({});
    expect(result.id).toBe('filingStatus');
    expect(result.type).toBe('single-select');
  });

  it('branches correctly after filing status', () => {
    const result = getNextQuestion({ filingStatus: 'single' });
    expect(result.id).toBe('income');
  });

  it('skips dependent questions for single filers with no children', () => {
    const result = getNextQuestion({
      filingStatus: 'single',
      income: 60000,
      dependents: 0,
    });
    expect(result.id).not.toBe('childCareExpenses');
  });

  it('asks about education credits if age < 30', () => {
    const result = getNextQuestion({
      filingStatus: 'single',
      income: 40000,
      age: 25,
    });
    expect(result.id).toBe('educationCredits');
  });
});