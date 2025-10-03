/**
 * Generates a legally structured will based on user answers.
 * Output is a plain text string ready for rendering or PDF generation.
 */

export function generateWillText(data = {}) {
  const {
    fullName,
    signatureDate,
    executor,
    primaryBeneficiary,
    contingentBeneficiary,
    guardianName,
    assetSummary,
    finalWishes,
    jurisdiction,
    witnesses,
    revocationClause,
    includeResidueClause,
    includeDigitalAssetsClause,
  } = data;

  return `
Last Will and Testament

I, ${fullName || '[Full Name]'}, being of sound mind and disposing memory, do hereby declare this to be my Last Will and Testament.

1. Executor Appointment
I appoint ${executor || '[Executor Name]'} as the Executor of my estate.

2. Guardianship
${guardianName ? `If my primary beneficiary is a minor, I appoint ${guardianName} as legal guardian.` : 'No guardianship instructions provided.'}

3. Beneficiaries
Primary: ${primaryBeneficiary || 'None listed'}
Contingent: ${contingentBeneficiary || 'None listed'}

4. Assets
${assetSummary || 'No asset summary provided.'}

5. Final Wishes
${finalWishes || 'No final wishes provided.'}

6. Clauses
${revocationClause ? '✅ I revoke all prior wills and codicils.' : ''}
${includeResidueClause ? '✅ Include clause for unlisted assets.' : ''}
${includeDigitalAssetsClause ? '✅ Include clause for digital assets.' : ''}

Jurisdiction: ${jurisdiction || '[Jurisdiction not specified]'}
Witnesses: ${witnesses || '[No witnesses listed]'}

Signed on ${signatureDate || '[Date not provided]'}, this document reflects my final wishes and is intended to be legally binding.
`;
}