import { PDFDocument, StandardFonts, rgb } from 'pdf-lib';

/**
 * Loads scheduleC_clean.pdf and overlays business income and expense data.
 * Accepts full form1040Payload structure.
 */
export async function fillOutScheduleC(payload) {
  const formUrl = '/assets/forms/scheduleC_clean.pdf';
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

  // Business info
  const businessName = payload?.business?.name || '—';
  const businessAddress = payload?.business?.address || '—';
  const ein = payload?.business?.ein || '—';
  const accountingMethod = payload?.business?.accountingMethod || '—';

  draw(businessName, 100, 720);         // Line A: Business name
  draw(businessAddress, 100, 700);      // Line E: Business address
  draw(ein, 400, 700);                  // Line D: EIN
  draw(accountingMethod, 100, 680);     // Line F: Accounting method

  // Financials
  const grossIncome = payload?.business?.grossIncome || 0;
  const expenses = payload?.business?.expenses || 0;
  const vehicleExpenses = payload?.business?.vehicleExpenses || 0;
  const netProfit = grossIncome - expenses;

  draw(`$${grossIncome.toLocaleString()}`, 400, 660);    // Line 7: Gross income
  draw(`$${expenses.toLocaleString()}`, 400, 640);       // Line 28: Total expenses
  draw(`$${vehicleExpenses.toLocaleString()}`, 400, 620); // Line 9: Vehicle expenses
  draw(`$${netProfit.toLocaleString()}`, 400, 600);      // Line 31: Net profit

  return pdfDoc;
}