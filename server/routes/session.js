import express from 'express';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';

const router = express.Router();

router.get('/', async (req, res) => {
  const token = req.cookies?.token;

  if (!token) {
    console.warn('[SESSION] No token found in cookies');
    return res.status(401).json({ success: false, error: 'Missing token' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.userId);

    if (!user) {
      console.warn(`[SESSION] No user found for ID: ${decoded.userId}`);
      return res.status(404).json({ success: false, error: 'User not found' });
    }

    res.json({
      success: true,
      user: {
        id: user._id,
        email: user.email,
        createdAt: user.createdAt,
      },
    });
  } catch (err) {
    console.error('[SESSION] Token verification failed:', err.message);
    res.status(401).json({ success: false, error: 'Invalid or expired token' });
  }
});

export default router;