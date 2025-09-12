// death-and-taxes/server/routes/filingWizardRoutes.js

import express from 'express';
import {
  startSession,
  recordAnswer,
  getAnswers,
  resetSession,
} from '../store/filingWizardStore.js';
import { willifyAnswers } from '../../shared/utils/willifyAnswers.js';

const router = express.Router();

// GET: Start wizard session
router.get('/start', (req, res) => {
  const userId = req.user?.id || 'anonymous';
  startSession(userId);

  res.status(200).json({
    question: 'To begin, what state do you live in?',
    field: 'state',
    options: ['California', 'Texas', 'New York', 'Florida', 'Illinois', 'Other'],
  });
});

// POST: Record answer and return next question
router.post('/answer', (req, res) => {
  const userId = req.user?.id || 'anonymous';
  const { field, value } = req.body;

  recordAnswer(userId, field, value);

  // Branching logic
  if (field === 'state') {
    return res.status(200).json({
      question: 'Did you work full-time, freelance, or both?',
      field: 'employmentType',
      options: ['Full-Time', 'Freelance', 'Both'],
    });
  }

  if (field === 'employmentType') {
    return res.status(200).json({
      question: 'Do you have any dependents?',
      field: 'dependents',
      options: ['Yes', 'No'],
    });
  }

  if (field === 'dependents') {
    return res.status(200).json({
      question: 'Do you own any real estate?',
      field: 'realEstate',
      options: ['Yes', 'No'],
    });
  }

  if (field === 'realEstate') {
    return res.status(200).json({
      question: 'Do you have investment accounts?',
      field: 'investments',
      options: ['Yes', 'No'],
    });
  }

  if (field === 'investments') {
    return res.status(200).json({
      question: 'Do you own any vehicles?',
      field: 'vehicles',
      options: ['Yes', 'No'],
    });
  }

  // Wizard complete → return filing object
  const answers = getAnswers(userId);
  const filing = willifyAnswers(answers);

  return res.status(200).json({
    message: 'Wizard complete',
    filing,
  });
});

export default router;