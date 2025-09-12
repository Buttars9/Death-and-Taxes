// server/scripts/generateIRSForms.js

import fs from 'fs'
import path from 'path'
import { injectIRSForm } from '../utils/irsFormInjector.js' // ✅ Corrected filename

const payloadPath = path.resolve('server/mock/irsPayloadSample.json')
const payload = JSON.parse(fs.readFileSync(payloadPath, 'utf-8'))

async function generateForms() {
  const outputDir = path.resolve('server/output')
  if (!fs.existsSync(outputDir)) fs.mkdirSync(outputDir)

  const filled1040 = await injectIRSForm('1040', payload)
  fs.writeFileSync(path.join(outputDir, 'filled_1040.pdf'), filled1040)

  const filled706 = await injectIRSForm('706', payload)
  fs.writeFileSync(path.join(outputDir, 'filled_706.pdf'), filled706)

  console.log('✅ IRS forms generated and saved to /server/output/')
}

generateForms()