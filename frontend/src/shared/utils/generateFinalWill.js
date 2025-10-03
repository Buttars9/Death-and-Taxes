import { v4 as uuidv4 } from 'uuid';
import { generateWillText } from './generateWillText.js';

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
    answers = {},
    state = '—',
    employmentType = '—',
    willTemplate = 'Standard Template',
    hasDependents = false,
  } = filing;

  const willData = answers.willData || {};

  const templateVersion = 'v1.0';
  const legalVersion = '2025-US-Standard';
  const stateLawVersion = `2025-${state}-WillCode`;

  const signatoryLine = 'Signed,\n______________________';

  const willText = generateWillText({
    ...willData,
    jurisdiction: state,
    employmentType,
    hasDependents,
    willTemplate,
  });

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