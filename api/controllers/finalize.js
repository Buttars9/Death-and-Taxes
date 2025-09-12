// death-and-taxes/api/controllers/finalize.js

// 📍 Path diagnostics
console.log('Running finalize.js from:', import.meta.url);
console.log('Expecting refundEngine.js at:', new URL('../../shared/utils/refundEngine.js', import.meta.url).href);

import { calculateRefund } from '../../shared/utils/refundEngine.js';
import { persistHash } from '../../server/utils/vaultHasher.js';

export async function finalizeReturn(req, res) {
  try {
    const { refund, signature, will, filingAnswers } = req.body;

    if (!signature) {
      return res.status(400).json({ error: 'Missing signature' });
    }

    if (!filingAnswers && !refund) {
      return res.status(400).json({ error: 'Missing refund data' });
    }

    // 🧠 Recalculate refund if filingAnswers are present
    const verifiedRefund = filingAnswers
      ? calculateRefund({
          state: filingAnswers.state,
          filingStatus: filingAnswers.filingStatus,
          income: filingAnswers.agi,
          dependents: filingAnswers.dependents?.length || 0,
        })
      : refund;

    // 🔐 Persist hash for audit trail
    persistHash(verifiedRefund?.filingStatus || 'unknown', {
      refund: verifiedRefund,
      signature,
      will,
    });

    // 🧾 Simulate return ID and user ID
    const returnId = `RET-${Date.now()}`;
    const userId = `USER-${Math.floor(Math.random() * 1000000)}`; // Replace with real user context when available

    // ✅ Simulate trust confirmation
    const trustConfirmed = true;

    // 📜 Audit log
    console.log(`[AUDIT][FINALIZE] Finalized return ${returnId} for ${verifiedRefund?.filingStatus || 'unknown'} at ${new Date().toISOString()}`);

    // ✅ Respond with confirmation and metadata
    return res.status(200).json({
      id: returnId,
      status: 'submitted',
      refundAmount: verifiedRefund?.amount || 0,
      trustConfirmed,
      userId,
      refund: verifiedRefund,
    });
  } catch (err) {
    console.error('[ERROR] Finalize failed:', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
}