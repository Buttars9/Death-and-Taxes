// shared/utils/generateScheduleC.js

import jsPDF from 'jspdf';

/**
 * Generates IRS Schedule C (Profit or Loss from Business) PDF.
 * Pulls from validated answers and formats line-by-line.
 */

export function generateScheduleC(answers) {
  const doc = new jsPDF();
  let y = 20;

  doc.setFont('helvetica');
  doc.setFontSize(16);
  doc.text('Schedule C - Profit or Loss from Business (Simplified)', 20, y);
  y += 10;

  const fields = [
    { label: 'Gross Income (1099)', key: 'income', line: '1' },
    { label: 'Business Expenses', key: 'businessExpenses', line: '28' },
    { label: 'Home Office Deduction', key: 'homeOfficeDeduction', line: '30' },
    { label: 'Vehicle Expenses', key: 'vehicleExpenses', line: '9' },
    { label: 'Other Expenses', key: 'otherBusinessExpenses', line: '48' },
  ];

  doc.setFontSize(12);
  fields.forEach(({ label, key, line }) => {
    const value = answers[key];
    if (value !== undefined && value !== null) {
      doc.text(`Line ${line}: ${label} — $${Number(value).toLocaleString()}`, 20, y);
      y += 8;
    }
  });

  const income = answers.income || 0;
  const expenses = fields.reduce((sum, { key }) => {
    const val = answers[key];
    return sum + (typeof val === 'number' ? val : 0);
  }, 0);

  const netProfit = Math.max(income - expenses, 0);

  y += 4;
  doc.setFontSize(14);
  doc.text(`Net Profit: $${netProfit.toLocaleString()}`, 20, y);
  y += 10;

  doc.setFontSize(10);
  doc.text('This document is a simplified representation of IRS Schedule C for preview purposes only.', 20, y);

  return doc;
}