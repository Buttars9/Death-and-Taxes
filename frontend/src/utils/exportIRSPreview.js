import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

export async function exportIRSPreviewPDF() {
  const previewElement = document.querySelector('.irs-preview');
  if (!previewElement) return;

  const canvas = await html2canvas(previewElement, {
    scale: 2,
    useCORS: true,
    backgroundColor: '#ffffff',
  });

  const imgData = canvas.toDataURL('image/png');
  const pdf = new jsPDF('p', 'mm', 'a4');
  const pageWidth = pdf.internal.pageSize.getWidth();
  const imgProps = pdf.getImageProperties(imgData);
  const ratio = imgProps.width / imgProps.height;
  const pdfWidth = pageWidth * 0.9;
  const pdfHeight = pdfWidth / ratio;
  const x = (pageWidth - pdfWidth) / 2;
  const y = 20;

  pdf.addImage(imgData, 'PNG', x, y, pdfWidth, pdfHeight);
  pdf.save('IRS_Filing_Preview.pdf');
}

export async function exportIRSReceiptPDF() {
  const receiptElement = document.querySelector('.irs-receipt');
  if (!receiptElement) return;

  const canvas = await html2canvas(receiptElement, {
    scale: 2,
    useCORS: true,
    backgroundColor: '#ffffff',
  });

  const imgData = canvas.toDataURL('image/png');
  const pdf = new jsPDF('p', 'mm', 'a4');
  const pageWidth = pdf.internal.pageSize.getWidth();
  const imgProps = pdf.getImageProperties(imgData);
  const ratio = imgProps.width / imgProps.height;
  const pdfWidth = pageWidth * 0.9;
  const pdfHeight = pdfWidth / ratio;
  const x = (pageWidth - pdfWidth) / 2;
  const y = 20;

  pdf.addImage(imgData, 'PNG', x, y, pdfWidth, pdfHeight);
  pdf.save('IRS_Receipt.pdf');
}