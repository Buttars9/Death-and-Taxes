import { PDFDocument } from 'pdf-lib'
import fs from 'fs'

export async function inject1040(payload) {
  const inputPath = 'server/assets/forms/f1040_clean.pdf'
  const outputPath = 'server/assets/output/f1040_filled.pdf'

  const bytes = fs.readFileSync(inputPath)
  const pdfDoc = await PDFDocument.load(bytes)
  const form = pdfDoc.getForm()

  // Replace these with actual field names from your 1040 dump
  form.getField('topmostSubform[0].Page1[0].f1_1[0]').setText(payload.fullName)
  form.getField('topmostSubform[0].Page1[0].f1_2[0]').setText(payload.ssn)
  form.getField('topmostSubform[0].Page1[0].f1_3[0]').setText(payload.income)

  const pdfBytes = await pdfDoc.save()
  fs.writeFileSync(outputPath, pdfBytes)

  return outputPath
}