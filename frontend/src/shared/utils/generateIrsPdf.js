export default async function generateIrsPdf(payload) {
  console.log('📄 generateIrsPdf invoked');
  console.log('🧾 Raw payload:', payload);
  console.log('📦 payload.json:', payload?.json);

  const { default: jsPDF } = await import('jspdf');
  const doc = new jsPDF();

  doc.setFont('helvetica');
  doc.setFontSize(14);
  doc.text('IRS Filing Summary', 20, 20);

  doc.setFontSize(10);
  doc.text(`Generated: ${new Date().toISOString()}`, 20, 30);
  doc.text(`Source: IRS Filing Flow`, 20, 36);

  let y = 50;

  const json = payload?.json;
  if (!json || typeof json !== 'object') {
    console.warn('⚠️ No valid json block found in payload.');
    doc.text('No IRS data available.', 20, y);
    return doc;
  }

  Object.entries(json).forEach(([section, content]) => {
    console.log(`🔍 Section: ${section}`, content);

    doc.setFontSize(12);
    doc.text(`Form ${section}`, 20, y);
    y += 6;

    if (content == null) {
      const formatted = formatValue(content);
      const lines = doc.splitTextToSize(`Value: ${formatted}`, 160);
      lines.forEach(line => {
        doc.setFontSize(10);
        doc.text(line, 30, y);
        y += 5;
        if (y > 280) {
          doc.addPage();
          y = 20;
        }
      });
    } else if (content && typeof content === 'object' && !Array.isArray(content)) {
      Object.entries(content).forEach(([key, value]) => {
        console.log(`🧩 Line ${key}:`, value);

        const formatted = formatValue(value);
        const lines = doc.splitTextToSize(`Line ${key}: ${formatted}`, 160);
        lines.forEach(line => {
          doc.setFontSize(10);
          doc.text(line, 30, y);
          y += 5;
          if (y > 280) {
            doc.addPage();
            y = 20;
          }
        });
      });
    } else {
      console.log(`📄 Primitive block for ${section}:`, content);

      const formatted = formatValue(content);
      const lines = doc.splitTextToSize(`Value: ${formatted}`, 160);
      lines.forEach(line => {
        doc.setFontSize(10);
        doc.text(line, 30, y);
        y += 5;
        if (y > 280) {
          doc.addPage();
          y = 20;
        }
      });
    }

    y += 8;
  });

  return doc;
}

function formatValue(val) {
  if (val === null || val === undefined) return '—';
  if (typeof val === 'boolean') return val ? '✓' : '✗';
  if (typeof val === 'number') return `$${val.toFixed(2)}`;
  if (Array.isArray(val)) {
    return val.map(item =>
      typeof item === 'object' ? JSON.stringify(item, null, 2) : String(item)
    ).join('\n');
  }
  if (typeof val === 'object') return JSON.stringify(val, null, 2);
  return String(val);
}