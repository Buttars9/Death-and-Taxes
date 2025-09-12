// frontend/src/utils/formatters.js

/**
 * Formats a number as USD currency.
 * Example: 1234.5 → "$1,234.50"
 */
export function formatCurrency(amount) {
  if (typeof amount !== 'number') return '$0.00';
  return amount.toLocaleString('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}