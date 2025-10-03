// death-and-taxes/server/store/payoutStore.js

const payoutQueue = new Map();

/**
 * Queue a payout request.
 * @param {string} submissionId
 * @param {object} filingPayload
 */
export function queuePayout(submissionId, filingPayload) {
  const refundCount = filingPayload.credits?.length || 0;
  const queuedAt = new Date().toISOString();

  payoutQueue.set(submissionId, {
    refundCount,
    queuedAt,
    trustConfirmed: filingPayload.trustConfirmed === true,
    status: 'Pending',
  });
}

/**
 * Fetch a payout request by ID.
 * @param {string} submissionId
 * @returns {object|null}
 */
export function getPayout(submissionId) {
  return payoutQueue.get(submissionId) || null;
}

/**
 * Update a payout record after payment.
 * @param {string} submissionId
 * @param {string} txid
 * @param {string} method
 * @returns {boolean}
 */
export function updatePayout(submissionId, txid, method) {
  const existing = payoutQueue.get(submissionId);
  if (!existing) return false;

  payoutQueue.set(submissionId, {
    ...existing,
    txid,
    method,
    status: 'Completed',
    updatedAt: new Date().toISOString(),
  });

  return true;
}