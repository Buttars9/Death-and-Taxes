import html2pdf from 'html2pdf.js';

export const generateWillPDF = (
  elementId,
  filename = 'Will.pdf',
  userName = '',
  timestamp = Date.now()
) => {
  const element = document.getElementById(elementId);
  if (!element) {
    console.error(`Element with ID '${elementId}' not found.`);
    alert('Unable to generate PDF: content not found.');
    return;
  }

  const safeName = userName ? userName.replace(/\s+/g, '_') : 'User';
  const dateStr = new Date(timestamp).toISOString().split('T')[0];
  const finalFilename = `${filename.replace('.pdf', '')}_${safeName}_${dateStr}.pdf`;

  const opt = {
    margin: 0.5,
    filename: finalFilename,
    image: { type: 'jpeg', quality: 0.98 },
    html2canvas: { scale: 2 },
    jsPDF: { unit: 'in', format: 'letter', orientation: 'portrait' },
  };

  try {
    html2pdf().set(opt).from(element).save();

    // 🧠 Audit trail: log PDF generation
    fetch('/api/logEvent', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        event: 'will_pdf_generated',
        filename: finalFilename,
        timestamp,
        userName,
      }),
    });
  } catch (err) {
    console.error('PDF generation failed:', err);
    alert('Something went wrong while generating your PDF.');
  }
};