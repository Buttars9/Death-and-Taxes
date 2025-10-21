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
  const pageHeight = page.getHeight(); // Typically 792 for letter size

  const draw = (label, value, x, yFromTop, size = 9, align = 'left') => {
    const offset = Math.floor(size * 1.2);
    const adjustedY = pageHeight - yFromTop - offset;
    let adjustedX = x;
    if (align === 'right') {
      const width = font.widthOfTextAtSize(String(value), size);
      adjustedX -= width + 5;
    } else if (align === 'center') {
      const width = font.widthOfTextAtSize(String(value), size);
      adjustedX -= width / 2;
    }
    console.log(`Drawing ${label}:`, value);
    page.drawText(String(value), {
      x: adjustedX,
      y: adjustedY,
      size,
      font,
      color: rgb(0, 0, 0),
    });
  };

  // Header (Page 1)
  draw('Name', payload?.taxpayer?.fullName || '—', 100, 745); // Adjusted y
  draw('SSN', payload?.taxpayer?.ssn || '—', 400, 745, 9, 'right'); // Adjusted y

  // Business info (Lines A-H)
  const businessName = payload?.business?.name || '—';
  const ein = payload?.business?.ein || '—';
  const accountingMethod = payload?.business?.accountingMethod || '—';
  draw('Business Name Line A', businessName, 100, 725); // Adjusted y
  draw('EIN Line D', ein, 400, 705, 9, 'right'); // Adjusted y
  draw('Business Address Line E', payload?.business?.address || '—', 100, 705); // Adjusted y
  draw('Accounting Method Line F', accountingMethod, 100, 685); // Adjusted y

  // Financials (Part I - Income, Lines 1-7)
  const grossIncome = payload?.business?.grossIncome || 0;
  draw('Gross Income Line 7', `$${grossIncome.toLocaleString()}`, 500, 665, 9, 'right'); // Adjusted y

  // Expenses (Part II - Expenses, Lines 8-27)
  const expenses = payload?.business?.expenses || 0;
  const vehicleExpenses = payload?.business?.vehicleExpenses || 0;
  draw('Total Expenses Line 28', `$${expenses.toLocaleString()}`, 500, 645, 9, 'right'); // Adjusted y
  draw('Vehicle Expenses Line 9', `$${vehicleExpenses.toLocaleString()}`, 500, 625, 9, 'right'); // Adjusted y

  // Net Profit (Line 31)
  const netProfit = grossIncome - expenses;
  draw('Net Profit Line 31', `$${netProfit.toLocaleString()}`, 500, 605, 9, 'right'); // Adjusted y

  return pdfDoc;
}