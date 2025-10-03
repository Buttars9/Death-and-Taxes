/**
 * Generates a legally structured Transfer-on-Death Affidavit.
 * Output is a plain text string ready for rendering or PDF generation.
 */

export function generateTodText(data = {}) {
  const {
    owner,
    assetDescription,
    beneficiary,
    jurisdiction,
    signatureDate,
  } = data;

  return `
Transfer-on-Death Affidavit

I, ${owner || '[Owner Name]'}, designate ${beneficiary || '[Beneficiary Name]'} as the beneficiary of the following asset:

${assetDescription || 'No asset description provided.'}

This designation is made under the laws of ${jurisdiction || '[Jurisdiction not specified]'}.

Signed on ${signatureDate || '[Date not provided]'}, this affidavit is intended to be legally binding.
`.trim();
}