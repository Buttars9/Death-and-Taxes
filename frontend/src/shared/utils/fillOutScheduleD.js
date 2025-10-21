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

  // Short-Term Capital Gains/Losses (Part I, Lines 1-7)
  const shortTermGain = payload?.capitalGains?.shortTerm || 0;
  draw('Short-Term Gain Line 7', `$${shortTermGain.toLocaleString()}`, 500, 705, 9, 'right'); // Adjusted y

  // Long-Term Capital Gains/Losses (Part II, Lines 8-15)
  const longTermGain = payload?.capitalGains?.longTerm || 0;
  draw('Long-Term Gain Line 15', `$${longTermGain.toLocaleString()}`, 500, 685, 9, 'right'); // Adjusted y

  // Summary (Part III, Lines 16-22)
  const totalGain = shortTermGain + longTermGain;
  draw('Combine Lines 7 and 15 Line 16', `$${totalGain.toLocaleString()}`, 500, 665, 9, 'right'); // Adjusted y

  // Form 8949 Transactions (if present; summarized or list first few)
  const transactions = payload?.capitalGains?.transactions || [];
  transactions.slice(0, 5).forEach((tx, i) => {
    const y = 645 - i * 12; // Adjusted y
    draw(`Transaction ${i+1}: ${tx.asset || '—'}`, tx.asset || '—', 100, y); // Description
    draw(`Amount: $${tx.amount?.toLocaleString() || '0'}`, 500, y, 9, 'right'); // Gain/loss
  });

  return pdfDoc;
}