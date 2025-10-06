import express from 'express';
import { getUserFilings, createUserFiling } from '../controllers/filingController.js';
import { validateAnswers } from '../../shared/utils/validateAnswers.js';
import { buildIrsPayload } from '../../shared/utils/buildIrsPayload.js';
import { generateIrsPdf } from '../../shared/utils/generateIrsPdf.js';

const router = express.Router();

// GET all filings for a user
router.get('/:userId', async (req, res) => {
  try {
    const filings = await getUserFilings(req.params.userId);
    res.status(200).json(filings);
  } catch (err) {
    console.error('Error fetching filings:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// POST new filing for a user
router.post('/:userId', async (req, res) => {
  try {
    const { answers } = req.body;
    const userId = req.params.userId;

    if (!answers || typeof answers !== 'object') {
      return res.status(400).json({ error: 'Missing or invalid answers' });
    }

    const filing = await createUserFiling(userId, answers);
    res.status(201).json(filing);
  } catch (err) {
    console.error('Error creating filing:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// POST IRS-aligned filing submission
router.post('/submit', async (req, res) => {
  try {
    const answers = req.body.answers;
    if (!answers || typeof answers !== 'object') {
      return res.status(400).json({ error: 'Missing or invalid answers' });
    }

    // Validate answers
    const { isValid, issues, validatedAnswers } = validateAnswers(answers);
    if (!isValid) {
      return res.status(422).json({ error: 'Validation failed', issues });
    }

    // Build IRS payload
    const irsPayload = buildIrsPayload(validatedAnswers);

    // Generate PDF
    const pdf = generateIrsPdf(irsPayload);
    const pdfBuffer = pdf.output('arraybuffer');

    // TODO: Save to database, audit log, or cloud storage
    // await saveFiling({ userId, irsPayload, pdfBuffer });

    return res.status(200).json({
      message: 'Filing submitted successfully',
      payload: irsPayload,
      pdf: Buffer.from(pdfBuffer).toString('base64'), // optional preview
    });
  } catch (err) {
    console.error('Filing submission error:', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;