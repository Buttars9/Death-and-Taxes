import dbConnect from '../../lib/dbConnect';
import Filing from '../models/Filing';
import { buildFilingPDF } from '../utils/pdfBuilder';
import { stageToVault } from '../utils/vaultUploader';
import { sendFilingConfirmation } from '../utils/emailSender';
import { calculateRefund } from '../../shared/utils/refundEngine';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Only POST requests allowed' });
  }

  await dbConnect();

  try {
    const { refund, signature } = req.body;

    if (!refund || !signature) {
      return res.status(400).json({ error: 'Missing refund or signature' });
    }

    // ✅ Recalculate refund server-side
    const verifiedRefund = calculateRefund({
      state: refund.state,
      filingStatus: refund.filingStatus,
      income: refund.income,
      dependents: refund.dependents,
    });

    const newFiling = new Filing({
      refund: verifiedRefund,
      signature,
    });

    await newFiling.save();

    const pdfBuffer = await buildFilingPDF({
      refund: verifiedRefund,
      signature,
    });

    const vaultFileName = `filing-${newFiling._id}.pdf`;
    const vaultResult = await stageToVault(pdfBuffer, vaultFileName);

    const userEmail = refund.userEmail || 'user@example.com';
    await sendFilingConfirmation(userEmail, {
      refund: verifiedRefund,
      filingId: newFiling._id,
      vaultUrl: vaultResult.vaultUrl,
    });

    // 📜 Audit log
    console.log(`[AUDIT][SUBMIT] Filing ${newFiling._id} submitted by ${userEmail} at ${new Date().toISOString()}`);

    return res.status(200).json({
      success: true,
      filingId: newFiling._id,
      submittedAt: newFiling.submittedAt,
      vaultUrl: vaultResult.vaultUrl,
    });
  } catch (err) {
    console.error(`[ERROR] Filing submission failed:`, err);
    return res.status(500).json({ error: 'Internal server error' });
  }
}