import mongoose from 'mongoose';
import bcrypt from 'bcrypt';
import dotenv from 'dotenv';
import User from '../models/User.js';

dotenv.config();

await mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const email = 'testuser@pi.dev';
const password = 'PiTest123!';
const passwordHash = await bcrypt.hash(password, 12);

const existing = await User.findOne({ email });
if (existing) {
  console.log('🚫 Test user already exists.');
  process.exit(0);
}

const user = new User({ email, passwordHash });
await user.save();

console.log('✅ Test user seeded:', email);
process.exit(0);