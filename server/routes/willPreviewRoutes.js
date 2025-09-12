// death-and-taxes/server/routes/willPreviewRoutes.js

import express from 'express';
import { getAnswers } from '../store/filingWizardStore.js';
import { willifyAnswers } from '../../shared/utils/willifyAnswers.js';

const router = express.Router();

// GET: Preview will based on current answers
router.get('/preview', (req, res) => {
  const userId = req.user?.id || 'anonymous';
  const answers = getAnswers(userId);
  const filing = willifyAnswers(answers);

  // Example preview content
  const preview = `
    Will Preview for ${userId}
    --------------------------
    State: ${filing.state}
    Employment: ${filing.employmentType}
    Dependents: ${filing.hasDependents ? 'Yes' : 'No'}
    Template: ${filing.willTemplate}
  `;

  res.status(200).json({ preview });
});

export default router;