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

  // Medical and Dental Expenses (Lines 1-4)
  const medical = payload?.deductions?.items?.find(d => d.type === 'medical')?.amount || 0;
  draw('Medical Expenses Line 1', `$${medical.toLocaleString()}`, 500, 700, 10, 'right'); // Line 1

  // Taxes You Paid (Lines 5-7)
  const stateLocalTaxes = payload?.deductions?.items?.find(d => d.type === 'stateLocalTaxes')?.amount || 0;
  draw('Taxes Line 5', `$${stateLocalTaxes.toLocaleString()}`, 500, 680, 10, 'right'); // Line 5a or total

  // Interest You Paid (Lines 8-10)
  const mortgageInterest = payload?.deductions?.items?.find(d => d.type === 'mortgageInterest')?.amount || 0;
  draw('Interest Line 8', `$${mortgageInterest.toLocaleString()}`, 500, 660, 10, 'right'); // Line 8

  // Gifts to Charity (Lines 11-14)
  const charitableGifts = payload?.deductions?.items?.find(d => d.type === 'charitableGifts')?.amount || 0;
  draw('Gifts Line 11', `$${charitableGifts.toLocaleString()}`, 500, 640, 10, 'right'); // Line 11

  // Casualty and Theft Losses (Line 15)
  // Add if data available; placeholder
  draw('Casualty Line 15', '$0', 500, 620, 10, 'right');

  // Other Itemized Deductions (Line 16)
  const otherItemized = payload?.deductions?.items?.filter(d => !['medical', 'stateLocalTaxes', 'mortgageInterest', 'charitableGifts'].includes(d.type))
    .reduce((sum, d) => sum + Number(d.amount || 0), 0);
  draw('Other Line 16', `$${otherItemized.toLocaleString()}`, 500, 600, 10, 'right');

  // Total Itemized Deductions (Line 17)
  const totalItemized = payload?.deductions?.amount || 0;
  draw('Total Line 17', `$${totalItemized.toLocaleString()}`, 500, 580, 10, 'right');

  return pdfDoc;
}