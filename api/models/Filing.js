// death-and-taxes/api/models/Filing.js

import mongoose from 'mongoose';

const FilingSchema = new mongoose.Schema({
  refund: {
    state: String,
    filingStatus: String,
    income: Number,
    dependents: Number,
    deduction: Number,
    notes: String,
    total: Number,
  },
  signature: {
    type: String,
    required: true,
  },
  submittedAt: {
    type: Date,
    default: Date.now,
  },
});

export default mongoose.models.Filing || mongoose.model('Filing', FilingSchema);