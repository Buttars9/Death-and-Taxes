const express = require('express');
const router = express.Router();
const FinalReturn = require('../models/FinalReturn');
const fs = require('fs').promises; // Changed: Use promises for async file ops (original fs is now promises)
const path = require('path'); // Added: For file paths
const Client = require('ssh2-sftp-client'); // Added: For SFTP upload (install with npm i ssh2-sftp-client)
const { generateEfileXml } = require('../../shared/utils/generateEfileXml.js'); // Added: Import your XML generator (adjust path if needed)

router.post('/', async (req, res) => {
  const { refund, signature } = req.body;

  if (!refund || !signature) {
    return res.status(400).json({ error: 'Missing refund or signature' });
  }

  try {
    const record = new FinalReturn({ refund, signature });
    await record.save();

    // Added: PDP-specific logic
    if (req.body.transmitter === 'pdp') {
      // Map req.body to expected XML structure (adjust if your payload needs tweaks)
      const xmlPayload = {
        taxpayer: req.body.taxpayer || {}, // Example mapping—add based on your app's data
        identityVerification: req.body.identityVerification || {},
        incomeDetails: req.body.incomeDetails || {},
        deductions: req.body.deductions || {},
        credits: req.body.credits || {},
        summary: req.body.summary || {},
        metadata: req.body.metadata || {},
      };
      const xml = generateEfileXml(xmlPayload); // Uses your function to create the XML string
      const tempDir = path.join(__dirname, 'temp');
      await fs.mkdir(tempDir, { recursive: true }); // Create temp folder if not exists
      const filePath = path.join(tempDir, `return_${record._id}.xml`); // Temp file in temp folder
      await fs.writeFile(filePath, xml); // Async write

      // Upload to PDP via SFTP (in try/catch for error handling)
      try {
        const sftp = new Client();
        await sftp.connect({
          host: process.env.PDP_HOST || 'sftp.pdptax.com', // From .env
          port: 22,
          username: process.env.PDP_USERNAME,
          password: process.env.PDP_PASSWORD,
        });
        await sftp.put(filePath, process.env.PDP_REMOTE_PATH || '/uploads/return.xml'); // From .env
        await sftp.end();
      } catch (sftpErr) {
        console.error('SFTP upload failed:', sftpErr);
        // Don't crash the response—log and continue (or return error if you want to fail the submission)
      }

      await fs.unlink(filePath); // Async delete temp file
    }

    res.json({ success: true, id: record._id });
  } catch (err) {
    console.error('Error saving final return:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;