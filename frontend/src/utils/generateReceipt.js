import jsPDF from 'jspdf';

export function generateReceipt({ userId, taxYear, refundUSD, refundPi, escrowHash }) {
  const doc = new jsPDF();

  doc.setFont('helvetica');
  doc.setFontSize(16);
  doc.text('IRS Filing Receipt', 20, 20);

  doc.setFontSize(12);
  doc.text(`User ID: ${userId}`, 20, 40);
  doc.text(`Tax Year: ${taxYear}`, 20, 50);
  doc.text(`Refund Amount (USD): $${refundUSD}`, 20, 60);
  doc.text(`Refund Amount (π): ≈ ${refundPi} π`, 20, 70);
  doc.text(`Escrow Hash: ${escrowHash}`, 20, 80);
  doc.text(`Timestamp: ${new Date().toISOString()}`, 20, 90);

  const filename = `${userId}_${taxYear}.pdf`;
  doc.save(filename);

  return filename;
}