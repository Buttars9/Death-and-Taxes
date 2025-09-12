// shared/utils/generateScheduleA.js

import jsPDF from 'jspdf';

/**
 * Generates IRS Schedule A (Itemized Deductions) PDF.
 * Pulls from validated answers and formats line-by-line.
 */

export function generateScheduleA(answers) {
  const doc = new jsPDF();
  let y = 20;

  doc.setFont('helvetica');
  doc.setFontSize(16);
  doc.text('Schedule A - Itemized Deductions (Simplified)', 20, y);
  y += 10;

  const fields = [
    { label: 'Medical Expenses', key: 'medicalExpenses', line: '1' },
    { label: 'State Income Tax', key: 'stateIncomeTax', line: '5a' },
    { label: 'Property Taxes', key: 'propertyTaxes', line: '5b' },
    { label: 'Mortgage Interest', key: 'mortgageInterest', line: '8a' },
    { label: 'Charitable Donations', key: 'charitableDonations', line: '11' },
    { label: 'Education Expenses', key: 'educationExpenses', line: '21' },
    { label: 'Retirement Contributions', key: 'retirementContributions', line: '22' },
    { label: 'Other Deductions', key: 'otherDeductions', line: '23' },
  ];

  doc.setFontSize(12);
  fields.forEach(({ label, key, line }) => {
    const value = answers[key];
    if (value !== undefined && value !== null) {
      doc.text(`Line ${line}: ${label} — $${Number(value).toLocaleString()}`, 20, y);
      y += 8;
    }
  });

  const total = fields.reduce((sum, { key }) => {
    const val = answers[key];
    return sum + (typeof val === 'number' ? val : 0);
  }, 0);

  y += 4;
  doc.setFontSize(14);
  doc.text(`Total Itemized Deductions: $${total.toLocaleString()}`, 20, y);
  y += 10;

  doc.setFontSize(10);
  doc.text('This document is a simplified representation of IRS Schedule A for preview purposes only.', 20, y);

  return doc;
}