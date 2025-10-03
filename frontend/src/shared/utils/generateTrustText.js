/**
 * Generates a legally structured Trust Agreement.
 * Output is a plain text string ready for rendering or PDF generation.
 */

export function generateTrustText(data = {}) {
  const {
    trustName,
    grantor,
    trustee,
    beneficiaries,
    assets,
    jurisdiction,
    signatureDate,
    revocationClause,
    includeSpendthriftClause,
  } = data;

  return `
Revocable Living Trust Agreement

Trust Name: ${trustName || '[Trust Name]'}
Grantor: ${grantor || '[Grantor Name]'}
Trustee: ${trustee || '[Trustee Name]'}
Beneficiaries: ${beneficiaries || '[No beneficiaries listed]'}

Assets Transferred:
${assets || 'No assets specified.'}

Clauses:
${revocationClause ? '✅ This trust may be revoked by the grantor.' : ''}
${includeSpendthriftClause ? '✅ Includes spendthrift protection clause.' : ''}

Jurisdiction: ${jurisdiction || '[Jurisdiction not specified]'}
Signed on ${signatureDate || '[Date not provided]'}, this trust is intended to be legally binding.
`.trim();
}