export function validateFilingPayload(payload) {
  const requiredFields = [
    'filingStatus',
    'incomeSources',
    'deductions',
    'credits',
    'routingNumber',
    'accountNumber',
    'trustConfirmed',
  ];

  const fieldErrors = [];
  const validatedAt = new Date().toISOString();
  const payloadVersion = 'v1.0';

  for (const field of requiredFields) {
    const value = payload[field];

    if (!payload.hasOwnProperty(field)) {
      fieldErrors.push(`Missing required field: ${field}`);
      continue;
    }

    if (['incomeSources', 'deductions', 'credits'].includes(field)) {
      if (!Array.isArray(value)) {
        fieldErrors.push(`Field ${field} must be an array`);
      }
    } else if (value === '' || value === null || value === undefined) {
      fieldErrors.push(`Field ${field} cannot be empty`);
    }
  }

  if (payload.trustConfirmed !== true) {
    fieldErrors.push('User must confirm trust before submission');
  }

  if (fieldErrors.length > 0) {
    return {
      valid: false,
      message: 'Payload validation failed',
      fieldErrors,
      validatedAt,
      payloadVersion,
    };
  }

  return {
    valid: true,
    validatedAt,
    payloadVersion,
  };
}