import PDFDocument from 'pdfkit';
import fs from 'fs';
import { generateFinalWill } from './generateFinalWill.js';

function generateWillPDF(filing, outputPath) {
  const doc = new PDFDocument();
  const {
    willText,
    filingId,
    consentTimestamp,
    templateVersion,
    legalVersion,
    stateLawVersion,
    signatoryLine,
  } = generateFinalWill(filing);

  doc.pipe(fs.createWriteStream(outputPath));

  // Header
  doc.fontSize(16).text('Last Will and Testament', { align: 'center' });
  doc.moveDown();

  // Body
  doc.fontSize(12).text(willText.trim(), {
    align: 'left',
    lineGap: 4,
  });
  doc.moveDown();

  // Signature line
  doc.fontSize(12).text(signatoryLine, { align: 'left' });
  doc.moveDown();

  // Footer metadata
  doc.fontSize(10).fillColor('gray');
  doc.text(`Filing ID: ${filingId}`);
  doc.text(`Consent Timestamp: ${consentTimestamp}`);
  doc.text(`Template Version: ${templateVersion}`);
  doc.text(`Legal Version: ${legalVersion}`);
  doc.text(`State Law Reference: ${stateLawVersion}`);

  doc.end();
}

export { generateWillPDF };