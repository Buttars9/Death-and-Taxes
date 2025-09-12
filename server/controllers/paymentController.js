import stripe from 'stripe';
import axios from 'axios';
import { updatePayout } from '../store/payoutStore.js';

const stripeInstance = stripe(process.env.STRIPE_SECRET_KEY);
const piApiKey = process.env.PI_API_KEY;

export async function payFiat(req, res) {
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
  try {
    const response = await axios.post(`https://api.minepi.com/v2/payments/${paymentId}/approve`, {}, {
      headers: { Authorization: `Key ${piApiKey}` }
    });
    res.json(response.data);
  } catch (err) {
    res.status(500).json({ error: err.message });
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