// server/lib/dbConnect.js

import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config(); // ✅ Load .env variables

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/deathAndTaxes';

export async function dbConnect() {
  try {
    await mongoose.connect(MONGO_URI); // 🚫 No deprecated options
    console.log('✅ MongoDB connected');
  } catch (err) {
    console.error('❌ MongoDB connection error:', err);
    process.exit(1);
  }
}