// tests/errorHandler.test.js

import { handleError } from '../shared/utils/errorHandler';

describe('Error Handler', () => {
  it('returns user-friendly message for known error codes', () => {
    const result = handleError({ code: 'INVALID_INPUT' });
    expect(result.message).toBe('Some of your inputs are invalid. Please review and try again.');
  });

  it('returns fallback message for unknown error codes', () => {
    const result = handleError({ code: 'UNKNOWN_CODE' });
    expect(result.message).toBe('An unexpected error occurred. Please contact support.');
  });

  it('handles missing error code gracefully', () => {
    const result = handleError({});
    expect(result.message).toBe('An unexpected error occurred. Please contact support.');
  });
});