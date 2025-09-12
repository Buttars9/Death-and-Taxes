// death-and-taxes/server/routes/payoutRoutes.js

import express from 'express';
import { initiatePayout } from '../controllers/filingController.js';
import { payFiat, approvePiPayment, completePiPayment } from '../controllers/paymentController.js';
const router = express.Router();

// POST: Trigger payout queueing
router.post('/:id', (req, res) => {
  const submissionId = req.params.id;

  try {
    const result = initiatePayout(submissionId);
    res.status(200).json(result);
  } catch (err) {
    console.error('Payout initiation error:', err);
    res.status(400).json({ error: err.message });
  }
});

// POST: Handle fiat payment via Stripe
router.post('/fiat', payFiat);

// POST: Approve Pi Network payment
router.post('/pi/approve', approvePiPayment);

// POST: Complete Pi Network payment
router.post('/pi/complete', completePiPayment);

export default router;