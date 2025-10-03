import { v4 as uuidv4 } from 'uuid';

/**
 * Generates a full-text Advance Directive based on filing data.
 * @param {Object} filing - User filing data
 * @returns {Object} directive payload with ID, timestamp, and text
 */
function generateFinalDirective(filing) {
  if (!filing || typeof filing !== 'object') {
    throw new Error('Missing or invalid filing data');
  }

  const consentTimestamp = new Date().toISOString();
  const filingId = uuidv4();

  const {
    answers = {},
    state = '—',
    employmentType = '—',
    directiveTemplate = 'Standard Template',
    hasDependents = false,
  } = filing;

  const directiveData = answers.directiveData || {};

  const templateVersion = 'v1.0';
  const legalVersion = '2025-US-Directive';
  const stateLawVersion = `2025-${state}-DirectiveCode`;

  const signatoryLine = 'Signed,\n______________________';

  const directiveText = `
Advance Directive

Jurisdiction: ${state}
Employment Type: ${employmentType}
Dependents: ${hasDependents ? 'Yes' : 'No'}
Template: ${directiveTemplate}

Instructions:
${directiveData.instructions || 'No specific instructions provided.'}

Healthcare Agent:
${directiveData.healthcareAgent || '[Not specified]'}

Signed on ${consentTimestamp}

${signatoryLine}
`.trim();

  return {
    filingId,
    consentTimestamp,
    directiveText,
    templateVersion,
    legalVersion,
    stateLawVersion,
    signatoryLine,
  };
}

export { generateFinalDirective };