/**
 * Generates a legally structured HIPAA Release Authorization.
 * Output is a plain text string ready for rendering or PDF generation.
 */

export function generateHipaaText(data = {}) {
  const {
    fullName,
    authorizedPerson,
    purpose,
    expiration,
    jurisdiction,
    signatureDate,
  } = data;

  return `
HIPAA Release Authorization

I, ${fullName || '[Your Name]'}, authorize ${authorizedPerson || '[Authorized Person]'} to access my protected health information.

Purpose:
${purpose || 'No specific purpose provided.'}

Expiration:
This authorization expires on ${expiration || '[No expiration specified]'}.

Jurisdiction: ${jurisdiction || '[Jurisdiction not specified]'}

Signed on ${signatureDate || '[Date not provided]'}, this release is intended to be legally binding.
`.trim();
}