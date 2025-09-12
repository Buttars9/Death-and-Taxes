import { v4 as uuidv4 } from 'uuid';

/**
 * Generates a full-text legal-style will based on filing data.
 * @param {Object} filing - User filing data
 * @returns {Object} will payload with ID, timestamp, and text
 */
function generateFinalWill(filing) {
  if (!filing || typeof filing !== 'object') {
    throw new Error('Missing or invalid filing data');
  }

  const consentTimestamp = new Date().toISOString();
  const filingId = uuidv4();

  const {
    estate = {},
    employmentType = '—',
    willTemplate = 'Standard Template',
    hasDependents = false,
    state = '—',
  } = filing;

  const {
    fullName = '—',
    primaryBeneficiary = '—',
    primaryBeneficiaryAge = '—',
    guardianName = '—',
    executor = '—',
    assetSummary = '—',
    finalWishes = '—',
  } = estate;

  const templateVersion = 'v1.0';
  const legalVersion = '2025-US-Standard';
  const stateLawVersion = `2025-${state}-WillCode`;

  const signatoryLine = 'Signed,\n______________________';

  const willText = `
Last Will and Testament

I, ${fullName}, a resident of ${state}, hereby declare this to be my will.

Employment Status: ${employmentType}
Dependents: ${hasDependents ? 'Yes' : 'No'}
Primary Beneficiary: ${primaryBeneficiary} (Age: ${primaryBeneficiaryAge})
Executor: ${executor}
Guardian (if minor): ${guardianName}
Assets: ${assetSummary}
Final Wishes: ${finalWishes}

This document is based on template: ${willTemplate}
Template Version: ${templateVersion}
Legal Version: ${legalVersion}
State Law Reference: ${stateLawVersion}

[Further legal language and clauses would be inserted here.]

${signatoryLine}
`.trim();

  return {
    filingId,
    consentTimestamp,
    willText,
    templateVersion,
    legalVersion,
    stateLawVersion,
    signatoryLine,
  };
}

export { generateFinalWill };