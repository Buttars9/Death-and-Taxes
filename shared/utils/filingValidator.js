export function validateFilingData(data) {
  const errors = [];

  // Filing status
  if (!data.filingStatus) errors.push('Missing filing status');
  if (!['single', 'married', 'headOfHousehold', 'widow'].includes(data.filingStatus)) {
    errors.push('Invalid filing status');
  }

  // Income
  if (typeof data.income !== 'number') errors.push('Income must be a number');
  if (data.income < 0) errors.push('Income cannot be negative');
  if (data.income > 10000000) errors.push('Income exceeds supported range');

  // Age
  if (typeof data.age !== 'number') errors.push('Age must be a number');
  if (data.age < 0 || data.age > 120) errors.push('Invalid age');

  // Dependents
  if (!Array.isArray(data.dependents)) errors.push('Dependents must be an array');
  data.dependents?.forEach((dep, i) => {
    if (!dep.name || typeof dep.age !== 'number') {
      errors.push(`Dependent #${i + 1} is missing name or age`);
    }
  });

  // Tip/overtime
  if (typeof data.tipIncome !== 'number') errors.push('Tip income must be a number');
  if (data.tipIncome > 50000) errors.push('Tip income exceeds supported range');
  if (typeof data.overtimeIncome !== 'number') errors.push('Overtime income must be a number');
  if (data.overtimeIncome > 50000) errors.push('Overtime income exceeds supported range');

  // SALT
  if (typeof data.saltPaid !== 'number') errors.push('SALT paid must be a number');

  // Assets
  if (!Array.isArray(data.assets)) errors.push('Assets must be an array');
  data.assets?.forEach((asset, i) => {
    if (!asset.type || typeof asset.value !== 'number') {
      errors.push(`Asset #${i + 1} is invalid`);
    }
  });

  // Deductions
  if (!['standard', 'itemized'].includes(data.deductionType)) {
    errors.push('Deduction type must be standard or itemized');
  }
  if (!Array.isArray(data.deductions)) errors.push('Deductions must be an array');

  // Credits
  if (!Array.isArray(data.credits)) errors.push('Credits must be an array');

  // Withholding
  if (typeof data.taxWithheld !== 'number') errors.push('Tax withheld must be a number');
  if (typeof data.estimatedPayments !== 'number') errors.push('Estimated payments must be a number');

  // Prior AGI
  if (typeof data.priorAGI !== 'number') errors.push('Prior AGI must be a number');

  // IRS PIN
  if (data.irsPIN && !/^\d{6}$/.test(data.irsPIN)) {
    errors.push('IRS PIN must be 6 digits');
  }

  // Routing/account
  if (!/^\d{9}$/.test(data.routingNumber)) errors.push('Routing number must be 9 digits');
  if (!/^\d{4,17}$/.test(data.accountNumber)) errors.push('Account number must be 4–17 digits');

  // Trust confirmation
  if (data.trustConfirmed !== true) errors.push('Trust must be confirmed before submission');

  return errors;
}