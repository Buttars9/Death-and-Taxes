/**
 * Generates a legally structured Executor Instruction Letter.
 * Output is a plain text string ready for rendering or PDF generation.
 */

export function generateExecutorText(data = {}) {
  const {
    fullName,
    executor,
    estateOverview,
    specialInstructions,
    jurisdiction,
    signatureDate,
  } = data;

  return `
Executor Instruction Letter

To: ${executor || '[Executor Name]'}
From: ${fullName || '[Your Name]'}

Estate Overview:
${estateOverview || 'No estate overview provided.'}

Special Instructions:
${specialInstructions || 'No special instructions provided.'}

Jurisdiction: ${jurisdiction || '[Jurisdiction not specified]'}

Signed on ${signatureDate || '[Date not provided]'}, this letter is intended to guide the execution of my estate.
`.trim();
}