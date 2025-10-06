import express from 'express';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';
import User from '../models/User.js';

const router = express.Router();

router.post('/', async (req, res) => {
  const { token, newPassword } = req.body;

  if (!token || !newPassword) {
    return res.status(400).json({ error: 'Token and new password are required.' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.userId);

    if (!user || user.resetToken !== token) {
      return res.status(401).json({ error: 'Invalid or expired token.' });
    }

    if (user.resetTokenExpires < Date.now()) {
      return res.status(403).json({ error: 'Reset token has expired.' });
    }

    const hashed = await bcrypt.hash(newPassword, 10);
    user.passwordHash = hashed;
    user.resetToken = null;
    user.resetTokenExpires = null;
    await user.save();

    return res.status(200).json({ success: true, message: 'Password has been reset.' });
  } catch (err) {
    console.error('[RESET PASSWORD ERROR]', err);
    return res.status(500).json({ error: 'Internal server error.' });
  }
});

export default router;