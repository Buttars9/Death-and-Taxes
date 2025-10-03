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

// Get a specific answer by field
function getAnswerByField(userId, field) {
  const session = wizardSessions.get(userId) || [];
  const entry = session.find((a) => a.field === field);
  return entry?.value || '';
}

// Reset session
function resetSession(userId) {
  wizardSessions.delete(userId);
}

export { startSession, recordAnswer, getAnswers, getAnswerByField, resetSession };