import { PDFDocument, StandardFonts, rgb } from 'pdf-lib';

/**
 * Loads scheduleA_clean.pdf and overlays itemized deduction data.
 * Accepts full form1040Payload structure.
 */
export async function fillOutScheduleA(payload) {
  const formUrl = '/assets/forms/scheduleA_clean.pdf';
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

  // Header
  draw(payload?.taxpayer?.fullName || '—', 100, 740); // Name
  draw(payload?.taxpayer?.ssn || '—', 400, 740);      // SSN

  // Deductions
  const medical = payload?.deductions?.medical || 0;
  const taxes = payload?.deductions?.stateLocalTaxes || 0;
  const interest = payload?.deductions?.mortgageInterest || 0;
  const gifts = payload?.deductions?.charitableGifts || 0;
  const jobExpenses = payload?.deductions?.jobExpenses || 0;
  const otherItemized = payload?.deductions?.otherItemized || 0;
  const totalItemized = payload?.deductions?.amount || 0;

  draw(`$${medical.toLocaleString()}`, 400, 700);       // Line 1: Medical expenses
  draw(`$${taxes.toLocaleString()}`, 400, 680);         // Line 5: State/local taxes
  draw(`$${interest.toLocaleString()}`, 400, 660);      // Line 8: Mortgage interest
  draw(`$${gifts.toLocaleString()}`, 400, 640);         // Line 11: Gifts to charity
  draw(`$${jobExpenses.toLocaleString()}`, 400, 620);   // Line 21: Job expenses
  draw(`$${otherItemized.toLocaleString()}`, 400, 600); // Line 22: Other deductions
  draw(`$${totalItemized.toLocaleString()}`, 400, 580); // Line 29: Total itemized

  return pdfDoc;
}