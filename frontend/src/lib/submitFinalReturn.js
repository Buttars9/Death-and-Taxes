// src/lib/submitFinalReturn.js

import axios from 'axios';

/**
 * Submits final refund + estate payload to backend.
 * Includes optional will data, logs audit event, and triggers fee routing (optional).
 *
 * Expected response from /api/finalize:
 * {
 *   id: string,
 *   userId: string,
 *   refundAmount: number,
 *   trustConfirmed: boolean,
 *   ...
 * }
 */

export async function submitFinalReturn({ refund, signature, will }) {
  try {
    const payload = {
      refund,
      signature,
      ...(will && { will }), // 🧠 Include will payload if present
    };

    // 🔐 Finalize return
    const res = await axios.post('/api/finalize', payload);

    if (!res.data) {
      throw new Error('No response data from /api/finalize');
    }

    // 🧠 Audit trail: log submission event with metadata
    await axios.post('/api/logEvent', {
      event: 'final_return_submitted',
      timestamp: Date.now(),
      returnId: res.data.id,
      refundAmount: res.data.refundAmount,
      trustConfirmed: res.data.trustConfirmed,
    });

    // 💰 Fee routing placeholder (enable when admin wallet is ready)
    // await axios.post('/api/triggerFeePayment', {
    //   userId: res.data.userId,
    //   amount: 25,
    //   currency: 'PI',
    // });

    return res.data;
  } catch (err) {
    console.error('❌ Final return submission failed:', err);
    throw err;
  }
}