export function validateFilingData(data) {
  const errors = [];

  // Required fields
  if (!data.filingStatus) errors.push('Missing filing status');
  if (typeof data.income !== 'number') errors.push('Income must be a number');
  if (typeof data.dependents !== 'number') errors.push('Dependents must be a number');
  if (typeof data.age !== 'number') errors.push('Age must be a number');

  // Income sanity check
  if (data.income < 0) errors.push('Income cannot be negative');
  if (data.income > 10000000) errors.push('Income exceeds supported range');

  // Age check
  if (data.age < 0 || data.age > 120) errors.push('Invalid age');

  // Tip/overtime caps
  if (data.tipIncome > 50000) errors.push('Tip income exceeds supported range');
  if (data.overtimeIncome > 50000) errors.push('Overtime income exceeds supported range');

  // SALT paid
  if (typeof data.saltPaid !== 'number') errors.push('SALT paid must be a number');

  // Asset structure
  if (Array.isArray(data.assets)) {
    data.assets.forEach((asset, i) => {
      if (!asset.type || typeof asset.value !== 'number') {
        errors.push(`Asset #${i + 1} is invalid`);
      }
    });
  }

  return errors;
}