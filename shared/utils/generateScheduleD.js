// shared/utils/generateScheduleD.js

import jsPDF from 'jspdf';

/**
 * Generates IRS Schedule D (Capital Gains and Losses) PDF.
 * Pulls from validated answers and formats line-by-line.
 */

export function generateScheduleD(answers) {
  const doc = new jsPDF();
  let y = 20;

  doc.setFont('helvetica');
  doc.setFontSize(16);
  doc.text('Schedule D - Capital Gains and Losses (Simplified)', 20, y);
  y += 10;

  const fields = [
    { label: 'Short-Term Gains', key: 'shortTermGains', line: '1a' },
    { label: 'Short-Term Losses', key: 'shortTermLosses', line: '1b' },
    { label: 'Long-Term Gains', key: 'longTermGains', line: '8a' },
    { label: 'Long-Term Losses', key: 'longTermLosses', line: '8b' },
    { label: 'Crypto/Metals Gains', key: 'cryptoMetalsGains', line: '13' },
  ];

  doc.setFontSize(12);
  fields.forEach(({ label, key, line }) => {
    const value = answers[key];
    if (value !== undefined && value !== null) {
      doc.text(`Line ${line}: ${label} — $${Number(value).toLocaleString()}`, 20, y);
      y += 8;
    }
  });

  const gains = (answers.shortTermGains || 0) + (answers.longTermGains || 0) + (answers.cryptoMetalsGains || 0);
  const losses = (answers.shortTermLosses || 0) + (answers.longTermLosses || 0);
  const netGain = gains - losses;

  y += 4;
  doc.setFontSize(14);
  doc.text(`Net Capital Gain/Loss: $${netGain.toLocaleString()}`, 20, y);
  y += 10;

  doc.setFontSize(10);
  doc.text('This document is a simplified representation of IRS Schedule D for preview purposes only.', 20, y);

  return doc;
}