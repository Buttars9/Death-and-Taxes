/**
 * Generates a printable IRS-aligned PDF from structured payload.
 * Uses formMapping.js for labels and layout.
 * Can be used client-side (preview) or server-side (final export).
 */

import jsPDF from 'jspdf';
import { formMapping } from '../../questions/formMapping.js'; // ✅ FIXED PATH

export function generateIrsPdf(payload) {
  const doc = new jsPDF();
  let y = 20;

  doc.setFont('helvetica');
  doc.setFontSize(16);
  doc.text('IRS Filing Summary', 20, y);
  y += 10;

  Object.entries(payload).forEach(([form, lines]) => {
    doc.setFontSize(14);
    doc.text(`Form ${form}`, 20, y);
    y += 8;

    Object.entries(lines).forEach(([line, value]) => {
      const label = findLabel(form, line);
      const displayValue = formatValue(value);

      doc.setFontSize(12);
      doc.text(`Line ${line}: ${label} — ${displayValue}`, 25, y);
      y += 6;

      if (y > 280) {
        doc.addPage();
        y = 20;
      }
    });

    y += 4;
  });

  return doc;
}

// Helper: Find label from formMapping
function findLabel(form, line) {
  for (const [key, meta] of Object.entries(formMapping)) {
    if (meta.form === form && meta.line === line) {
      return meta.label || key;
    }
  }
  return 'Unknown field';
}

// Helper: Format value for display
function formatValue(val) {
  if (typeof val === 'boolean') return val ? '✓' : '✗';
  if (typeof val === 'number') return `$${val.toFixed(2)}`;
  return String(val);
}