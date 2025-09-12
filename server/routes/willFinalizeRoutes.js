// death-and-taxes/server/routes/willFinalizeRoutes.js

import express from 'express';
import { getAnswers } from '../store/filingWizardStore.js';
import { willifyAnswers } from '../../shared/utils/willifyAnswers.js';
import { generateFinalWill } from '../../shared/utils/generateFinalWill.js';

const router = express.Router();

router.get('/finalize', (req, res) => {
  const userId = req.user?.id || 'anonymous';
  const answers = getAnswers(userId);
  const filing = willifyAnswers(answers);
  const { filingId, consentTimestamp, willText } = generateFinalWill(filing);

  res.status(200).json({
    filingId,
    consentTimestamp,
    willText
  });
});

export default router;