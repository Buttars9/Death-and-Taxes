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