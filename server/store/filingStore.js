// death-and-taxes/server/store/filingStore.js

// In-memory queue simulation
const filingQueue = new Map();

/**
 * Save a new filing to the queue.
 * @param {string} id - Submission ID
 * @param {object} data - Filing payload
 */
export function saveFiling(id, data) {
  const entry = {
    ...data,
    savedAt: new Date().toISOString(),
  };

  filingQueue.set(id, entry);
}

/**
 * Retrieve a filing by its ID.
 * @param {string} id - Submission ID
 * @returns {object|null} Filing data or null if not found
 */
export function getFiling(id) {
  return filingQueue.get(id) || null;
}

/**
 * Retrieve all filings for a specific user.
 * @param {string} userId
 * @returns {Array<object>} List of filings
 */
export function getFilingsByUser(userId) {
  const filings = [];

  for (const entry of filingQueue.values()) {
    if (entry.userId === userId) {
      filings.push(entry);
    }
  }

  return filings;
}