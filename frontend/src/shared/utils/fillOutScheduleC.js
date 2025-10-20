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

  const draw = (label, value, x, yFromTop, size = 10, align = 'left') => {
    const offset = Math.floor(size * 0.8); // Adjusted offset for better alignment
    const adjustedY = pageHeight - yFromTop - offset;
    let adjustedX = x;
    if (align === 'right') {
      const width = font.widthOfTextAtSize(String(value), size);
      adjustedX -= width;
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
  draw('Name', payload?.taxpayer?.fullName || '—', 100, 740); // Name at top
  draw('SSN', payload?.taxpayer?.ssn || '—', 400, 740, 10, 'right'); // SSN, right-aligned

  // Business info (Lines A-H)
  const businessName = payload?.business?.name || '—';
  const ein = payload?.business?.ein || '—';
  const accountingMethod = payload?.business?.accountingMethod || '—';
  draw('Business Name Line A', businessName, 100, 720); // Line A
  draw('EIN Line D', ein, 400, 700, 10, 'right'); // Line D
  draw('Business Address Line E', payload?.business?.address || '—', 100, 700); // Line E
  draw('Accounting Method Line F', accountingMethod, 100, 680); // Line F

  // Financials (Part I - Income, Lines 1-7)
  const grossIncome = payload?.business?.grossIncome || 0;
  draw('Gross Income Line 7', `$${grossIncome.toLocaleString()}`, 500, 660, 10, 'right'); // Line 7

  // Expenses (Part II - Expenses, Lines 8-27)
  const expenses = payload?.business?.expenses || 0;
  const vehicleExpenses = payload?.business?.vehicleExpenses || 0;
  draw('Total Expenses Line 28', `$${expenses.toLocaleString()}`, 500, 640, 10, 'right'); // Line 28
  draw('Vehicle Expenses Line 9', `$${vehicleExpenses.toLocaleString()}`, 500, 620, 10, 'right'); // Line 9 (example field)

  // Net Profit (Line 31)
  const netProfit = grossIncome - expenses;
  draw('Net Profit Line 31', `$${netProfit.toLocaleString()}`, 500, 600, 10, 'right'); // Line 31

  return pdfDoc;
}