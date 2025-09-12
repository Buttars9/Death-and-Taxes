// death-and-taxes/src/hooks/useAnswers.js

import { useState, useEffect } from 'react';
import {
  getAnswers as storeGetAnswers,
  setAnswers as storeSetAnswers,
} from '../stores/wizardStore';

/**
 * Hook for managing guided filing answers and verdict.
 * Syncs local state with global wizard store.
 * Used across intake, review, and submission flows.
 */

export default function useAnswers() {
  const [answers, setAnswers] = useState(storeGetAnswers());
  const [verdict, setVerdict] = useState(null);

  // 🧠 Sync local answers to global store on change
  useEffect(() => {
    storeSetAnswers(answers);
  }, [answers]);

  return {
    answers,
    setAnswers,
    verdict,
    setVerdict,
  };
}