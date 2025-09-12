import dbConnect from '../../lib/dbConnect';
import Filing from '../models/Filing';
import { buildFilingPDF } from '../../api/utils/pdfBuilder';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Only GET requests allowed' });
  }

  await dbConnect();

  const { filingId } = req.query;

  if (!filingId) {
    return res.status(400).json({ error: 'Missing filingId parameter' });
  }

  try {
    const filing = await Filing.findById(filingId);
    if (!filing) {
      return res.status(404).json({ error: 'Filing not found' });
    }

    // 🔐 Mandatory: validate user access to this filing
    if (!req.user || req.user.id !== filing.userId.toString()) {
      console.warn(`[SECURITY] Unauthorized access attempt by user ${req.user?.id}`);
      return res.status(403).json({ error: 'Unauthorized access' });
    }

    const pdfBuffer = await buildFilingPDF({
      refund: filing.refund,
      signature: filing.signature,
    });

    // 📜 Audit log
    console.log(`[AUDIT][DOWNLOAD] Filing ${filingId} downloaded by user ${req.user?.id} at ${new Date().toISOString()}`);

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader(
      'Content-Disposition',
      `attachment; filename=filing-${filingId}.pdf`
    );
    return res.status(200).send(pdfBuffer);
  } catch (err) {
    console.error(`[ERROR] Download failed for filing ${filingId}:`, err);
    return res.status(500).json({ error: 'Internal server error' });
  }
}