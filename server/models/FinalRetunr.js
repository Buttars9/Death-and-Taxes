// server/routes/finalize.js

const express = require('express');
const router = express.Router();
const FinalReturn = require('../models/FinalReturn');

router.post('/', async (req, res) => {
  const { refund, signature } = req.body;

  if (!refund || !signature) {
    return res.status(400).json({ error: 'Missing refund or signature' });
  }

  try {
    const record = new FinalReturn({ refund, signature });
    await record.save();

    res.json({ success: true, id: record._id });
  } catch (err) {
    console.error('Error saving final return:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;