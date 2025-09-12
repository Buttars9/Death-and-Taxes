import pdfParse from 'pdf-parse/lib/pdf-parse.js';

export async function parseDocument(fileBuffer) {
  const data = await pdfParse(fileBuffer);
  const text = data.text;

  const fields = {};
  const lines = text.split('\n');

  lines.forEach(line => {
    if (line.includes('Name:')) fields.name = line.split('Name:')[1].trim();
    if (line.includes('SSN:')) fields.ssn = line.split('SSN:')[1].trim();
    if (line.includes('Income:')) fields.income = line.split('Income:')[1].trim();
  });

  return fields;
}