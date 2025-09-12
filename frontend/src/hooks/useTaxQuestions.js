// death-and-taxes/src/hooks/useTaxQuestions.js

/**
 * Centralized hook for accessing tax questions and IRS mappings.
 * Injects question set and form metadata into guided flows.
 */

import { useMemo } from 'react';
import taxQuestions from '../questions/taxQuestions.js';
import { formMapping } from '../questions/formMapping.js';
import { questionMap } from '../questions/questionMap.js';

export function useTaxQuestions() {
  return useMemo(() => ({
    questions: taxQuestions,
    formMapping,
    questionMap,
  }), []);
}