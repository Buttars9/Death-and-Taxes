// death-and-taxes/server/store/filingWizardStore.js

const wizardSessions = new Map();

// Start a new session
function startSession(userId) {
  wizardSessions.set(userId, []);
}

// Record an answer
function recordAnswer(userId, field, value) {
  if (!wizardSessions.has(userId)) startSession(userId);
  wizardSessions.get(userId).push({ field, value });
}

// Get all answers
function getAnswers(userId) {
  return wizardSessions.get(userId) || [];
}

// Reset session
function resetSession(userId) {
  wizardSessions.delete(userId);
}

export { startSession, recordAnswer, getAnswers, resetSession };