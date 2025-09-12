import jsPDF from 'jspdf';

export function generateIrsPdf(payload) {
  const doc = new jsPDF();

  doc.setFont('helvetica');
  doc.setFontSize(14);
  doc.text('IRS Filing Summary', 20, 20);

  doc.setFontSize(10);
  doc.text(`Generated: ${payload.metadata.timestamp}`, 20, 30);
  doc.text(`Source: ${payload.metadata.source}`, 20, 36);

  let y = 50;

  Object.entries(payload.forms).forEach(([form, lines]) => {
    doc.setFontSize(12);
    doc.text(`Form ${form}`, 20, y);
    y += 6;

    Object.entries(lines).forEach(([line, value]) => {
      doc.setFontSize(10);
      doc.text(`Line ${line}: ${String(value)}`, 30, y);
      y += 5;

      if (y > 280) {
        doc.addPage();
        y = 20;
      }
    });

    y += 8;
  });

  return doc;
}