import express from 'express';
import multer from 'multer';
import { parseDocument } from '../utils/DocumentParser.js';

const router = express.Router();
const upload = multer({ storage: multer.memoryStorage() });

router.post('/upload', upload.single('file'), async (req, res) => {
  try {
    const fileBuffer = req.file.buffer;
    const parsedFields = await parseDocument(fileBuffer);
    res.json({ success: true, fields: parsedFields });
  } catch (err) {
    console.error('Document parsing failed:', err);
    res.status(500).json({ success: false, error: 'Parsing failed' });
  }
});

export const documentUploadRoute = router;