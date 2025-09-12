import { PDFDocument } from 'pdf-lib'
import fs from 'fs'
import path from 'path'

/**
 * Injects backend data into a fillable IRS PDF form.
 * @param {'1040' | '706'} formType - IRS form type
 * @param {Object} payload - Backend filing data
 * @returns {Buffer} - Filled PDF buffer
 */
export async function injectIRSForm(formType, payload) {
  const formPath = path.resolve(
    'server/assets/forms',
    formType === '1040' ? 'f1040_flat.pdf' : 'f706_flat.pdf'
  )

  const formBytes = fs.readFileSync(formPath)
  const pdfDoc = await PDFDocument.load(formBytes)
  const form = pdfDoc.getForm()

  const fieldMap = buildFieldMap(formType, payload)

  Object.entries(fieldMap).forEach(([fieldName, value]) => {
    try {
      const field = form.getTextField(fieldName)
      if (field && value !== undefined) {
        field.setText(String(value))
      }
    } catch (err) {
      console.warn(`Field ${fieldName} not found or failed to set.`)
    }
  })

  return await pdfDoc.save()
}

/**
 * Maps backend payload to IRS field names.
 * @param {'1040' | '706'} formType
 * @param {Object} payload
 * @returns {Object} fieldMap
 */
function buildFieldMap(formType, payload) {
  if (formType === '1040') {
    return {
      'f1_1': payload.user?.firstName,
      'f1_2': payload.user?.lastName,
      'f1_3': payload.user?.ssn,
      'f1_4': payload.user?.address?.street,
      'f1_5': payload.user?.address?.cityStateZip,
      'f1_6': payload.user?.filingStatus,
      'f1_7': payload.user?.dependents?.length,
      'f1_8': payload.income?.total,
      'f1_9': payload.deductions?.standard,
      'f1_10': payload.taxLiability
    }
  }

  if (formType === '706') {
    return {
      'f706_1': payload.decedent?.fullName,
      'f706_2': payload.decedent?.ssn,
      'f706_3': payload.decedent?.dateOfDeath,
      'f706_4': payload.executor?.fullName,
      'f706_5': payload.executor?.address,
      'f706_6': payload.estate?.assetTotal,
      'f706_7': payload.estate?.liabilities,
      'f706_8': payload.estate?.taxableEstate,
      'f706_9': payload.estate?.taxDue
    }
  }

  return {}
}