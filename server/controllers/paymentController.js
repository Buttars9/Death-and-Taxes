import axios from 'axios';
import { updatePayout } from '../store/payoutStore.js';

let stripeInstance = null;

(async () => {
  if (process.env.STRIPE_SECRET_KEY) {
    const stripeImport = await import('stripe');
    stripeInstance = stripeImport.default(process.env.STRIPE_SECRET_KEY);
  }
})();

const piApiKey = process.env.PI_API_KEY;

export async function payFiat(req, res) {
  if (!stripeInstance) {
    return res.status(503).json({ error: 'Stripe not initialized' });
  }

  const { token } = req.body;
  const userId = req.user.id;
  const amount = 7499; // $74.99

  try {
    const charge = await stripeInstance.charges.create({
      amount,
      currency: 'usd',
      source: token.id,
      description: 'Death and Taxes Fee',
    });
    await updatePayout(userId, charge.id, 'stripe');
    console.log(`[AUDIT][PAYMENT] Card payment for user ${userId}: ${charge.id}`);
    res.json({ success: true, charge });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

export async function approvePiPayment(req, res) {
  const { paymentId } = req.body;

  console.log('[DEBUG][Pi Approval] Incoming payload:', req.body);

  if (!paymentId) {
    console.error('[ERROR][Pi Approval] Missing paymentId');
    return res.status(400).json({ error: 'Missing paymentId' });
  }

  try {
    const response = await axios.post(
      `https://api.minepi.com/v2/payments/${paymentId}/approve`,
      {},
      {
        headers: { Authorization: `Key ${piApiKey}` }
      }
    );

    if (!response?.data?.transaction || !response?.data?.status) {
      console.warn('[WARN][Pi Approval] Unexpected response format:', response.data);
    }

    res.json(response.data);
  } catch (err) {
    console.error('[ERROR][Pi Approval] Pi API threw:', err?.response?.data || err.message);
    res.status(500).json({
      error: 'Pi approval failed',
      details: err?.response?.data || err.message
    });
  }
}

export async function completePiPayment(req, res) {
  const { paymentId, txid } = req.body;
  const userId = req.user.id;
  try {
    const response = await axios.post(`https://api.minepi.com/v2/payments/${paymentId}/complete`, { txid }, {
      headers: { Authorization: `Key ${piApiKey}` }
    });
    await updatePayout(userId, txid, 'pi');
    console.log(`[AUDIT][PAYMENT] Pi payment for user ${userId}: ${txid}`);
    res.json(response.data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}