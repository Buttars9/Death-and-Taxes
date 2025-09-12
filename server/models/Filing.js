// death-and-taxes/server/models/Filing.js

import mongoose from 'mongoose';

const refundSchema = new mongoose.Schema({
  userEmail: { type: String, required: true },
  amount: Number,
  method: String,
  status: String,
});

const filingSchema = new mongoose.Schema({
  refund: refundSchema,
  submittedAt: { type: Date, default: Date.now },
  vaultUrl: String,
  status: String,
});

const Filing = mongoose.model('Filing', filingSchema);

export default Filing;