// death-and-taxes/api/utils/pdfBuilder.js

import PDFDocument from 'pdfkit';
import getStream from 'get-stream';

export async function buildFilingPDF({ refund, signature }) {
  const doc = new PDFDocument();
  doc.fontSize(18).text('🧾 Filing Receipt', { align: 'center' }).moveDown();

  doc.fontSize(12).text(`State: ${refund.state}`);
  doc.text(`Filing Status: ${refund.filingStatus}`);
  doc.text(`Income: $${refund.income != null ? refund.income.toLocaleString() : 'N/A'}`);
  doc.text(`Dependents: ${refund.dependents}`);
  doc.text(`Deduction: $${refund.deduction != null ? refund.deduction.toLocaleString() : 'N/A'}`);
  doc.text(`Refund Total: $${refund.total != null ? refund.total.toLocaleString() : 'N/A'}`);
  doc.moveDown().text(`Signature: ${signature}`);

  doc.end();

  const buffer = await getStream.buffer(doc);
  return buffer;
}