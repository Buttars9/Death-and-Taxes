import { PDFDocument } from 'pdf-lib'
import fs from 'fs'
import path from 'path'

async function listFields(pdfPath, outputFileName) {
  const bytes = fs.readFileSync(pdfPath)
  const pdfDoc = await PDFDocument.load(bytes)
  const form = pdfDoc.getForm()
  const fields = form.getFields()

  const output = fields.map(field => field.getName()).join('\n')
  const outputPath = path.join('server/assets/output', outputFileName)
  fs.writeFileSync(outputPath, output)
  console.log(`✅ Field names written to ${outputPath}`)
}

await listFields('server/assets/forms/f1040_clean.pdf', 'f1040_fields.txt')
await listFields('server/assets/forms/f706_clean.pdf', 'f706_fields.txt')