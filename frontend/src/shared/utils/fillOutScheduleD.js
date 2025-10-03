import { PDFDocument, StandardFonts, rgb } from 'pdf-lib';

/**
 * Loads scheduleD_clean.pdf and overlays capital gains/losses data.
 * Accepts full form1040Payload structure.
 */
export async function fillOutScheduleD(payload) {
  const formUrl = '/assets/forms/scheduleD_clean.pdf';
  const formBytes = await fetch(formUrl).then((res) => res.arrayBuffer());
  const pdfDoc = await PDFDocument.load(formBytes);
  const page = pdfDoc.getPages()[0];
  const font = await pdfDoc.embedFont(StandardFonts.Helvetica);

  const draw = (text, x, y) => {
    page.drawText(String(text), {
      x,
      y,
      size: 10,
      font,
      color: rgb(0, 0, 0),
    });
  };

  // Taxpayer identity
  draw(payload?.taxpayer?.fullName || '—', 100, 740); // Name
  draw(payload?.taxpayer?.ssn || '—', 400, 740);      // SSN

  // Gain summary
  const shortTermGain = payload?.capitalGains?.shortTerm || 0;
  const longTermGain = payload?.capitalGains?.longTerm || 0;
  const totalGain = shortTermGain + longTermGain;

  draw(`$${shortTermGain.toLocaleString()}`, 400, 700);  // Line 1b: Short-term gain
  draw(`$${longTermGain.toLocaleString()}`, 400, 680);   // Line 8b: Long-term gain
  draw(`$${totalGain.toLocaleString()}`, 400, 660);      // Line 16: Total gain/loss

  // Form 8949 breakdown (if present)
  const transactions = payload?.capitalGains?.transactions || [];
  transactions.slice(0, 5).forEach((tx, i) => {
    const y = 640 - i * 12;
    draw(`${tx.asset || '—'}: $${tx.amount?.toLocaleString() || '0'}`, 100, y);
  });

  return pdfDoc;
}