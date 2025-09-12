// death-and-taxes/src/questions/questionMap.js

/**
 * Indexes tax questions by key, category, and type.
 * Used for fast lookup, branching logic, and dynamic rendering.
 */

import taxQuestions from './taxQuestions.js';

export const questionMap = {
  byKey: {},
  byCategory: {},
  byType: {},
};

taxQuestions.forEach((q) => {
  questionMap.byKey[q.key] = q;

  if (!questionMap.byCategory[q.category]) {
    questionMap.byCategory[q.category] = [];
  }
  questionMap.byCategory[q.category].push(q);

  if (!questionMap.byType[q.type]) {
    questionMap.byType[q.type] = [];
  }
  questionMap.byType[q.type].push(q);
});