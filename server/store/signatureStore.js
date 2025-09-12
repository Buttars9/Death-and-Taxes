// death-and-taxes/server/store/signatureStore.js

const signatureLedger = new Map();

/**
 * Record a signature for a given filing.
 * @param {string} submissionId
 */
export function recordSignature(submissionId) {
  signatureLedger.set(submissionId, {
    signedAt: new Date().toISOString(),
  });
}

/**
 * Check if a filing has been signed.
 * @param {string} submissionId
 * @returns {object|null}
 */
export function getSignatureStatus(submissionId) {
  return signatureLedger.get(submissionId) || null;
}