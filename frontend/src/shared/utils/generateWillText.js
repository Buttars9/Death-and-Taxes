/**
 * Generates a legally structured will based on user answers.
 * Output is a plain text string ready for rendering or PDF generation.
 */

export function generateWillText(answers) {
  const {
    legalName = '[Full Name]',
    dateOfBirth = '[Date of Birth]',
    executorName = '[Executor Name]',
    beneficiaries = '',
    bequests = '',
    hasMinorChildren = false,
    guardianName = '',
    burialPreference = '',
  } = answers;

  const beneficiaryList = beneficiaries
    .split(',')
    .map((name) => name.trim())
    .filter(Boolean);

  const burialClause = burialPreference
    ? `I request that my remains be handled by ${burialPreference.toLowerCase()}.`
    : `I leave burial or cremation decisions to my executor's discretion.`;

  const guardianClause =
    hasMinorChildren && guardianName
      ? `In the event that I have minor children at the time of my death, I appoint ${guardianName} as their legal guardian.`
      : '';

  const bequestClause = bequests
    ? `I make the following specific bequests:\n${bequests}`
    : '';

  const beneficiaryClause = beneficiaryList.length
    ? `I designate the following individuals as beneficiaries of my estate:\n${beneficiaryList
        .map((b, i) => `${i + 1}. ${b}`)
        .join('\n')}`
    : '';

  return `
Last Will and Testament

I, ${legalName}, born on ${dateOfBirth}, being of sound mind and disposing memory, do hereby declare this to be my Last Will and Testament.

1. Executor Appointment
I appoint ${executorName} as the Executor of my estate, to carry out the provisions of this Will.

2. Burial Instructions
${burialClause}

3. Guardianship
${guardianClause || 'No guardianship instructions provided.'}

4. Specific Bequests
${bequestClause || 'No specific bequests provided.'}

5. Beneficiaries
${beneficiaryClause || 'No beneficiaries designated.'}

6. Residual Clause
All remaining assets not specifically bequeathed shall be distributed equally among my designated beneficiaries.

Signed on the date of filing, this document reflects my final wishes and is intended to be legally binding.
`;
}