// death-and-taxes/shared/utils/generate1040Pdf.js

import jsPDF from 'jspdf';

/**
 * Generates a real IRS 1040-style PDF from structured refund data.
 * Layout mimics key lines from Form 1040.
 */

export function generate1040Pdf(refundData) {
  const doc = new jsPDF();
  let y = 20;

  doc.setFont('helvetica');
  doc.setFontSize(16);
  doc.text('Form 1040 - U.S. Individual Income Tax Return (Simplified)', 20, y);
  y += 10;

  doc.setFontSize(12);
  doc.text(`Filing Status: ${refundData.filingStatus || '—'}`, 20, y);
  y += 8;

  doc.text(`Adjusted Gross Income (AGI): $${refundData.agi?.toLocaleString() || '—'}`, 20, y);
  y += 8;

  doc.text(`Deductions (${refundData.deductionType}): $${refundData.deductionAmount?.toLocaleString() || '—'}`, 20, y);
  y += 8;

  doc.text(`Taxable Income: $${refundData.taxableIncome?.toLocaleString() || '—'}`, 20, y);
  y += 8;

  doc.text(`Tax Owed: $${refundData.taxOwed?.toLocaleString() || '—'}`, 20, y);
  y += 8;

  doc.text(`Credits: $${refundData.creditAmount?.toLocaleString() || '—'}`, 20, y);
  y += 8;

  doc.text(`Payments (Withheld + Estimated): $${refundData.totalPayments?.toLocaleString() || '—'}`, 20, y);
  y += 8;

  doc.text(`Refund: $${refundData.refund?.toLocaleString() || '0'}`, 20, y);
  y += 8;

  doc.text(`Balance Due: $${refundData.balanceDue?.toLocaleString() || '0'}`, 20, y);
  y += 8;

  doc.text(`State Credits: $${refundData.stateCreditTotal?.toLocaleString() || '—'}`, 20, y);
  y += 8;

  doc.text(`Notes: ${refundData.notes || '—'}`, 20, y);
  y += 10;

  doc.setFontSize(10);
  doc.text('This document is a simplified representation of IRS Form 1040 for preview purposes only.', 20, y);

  return doc;
}