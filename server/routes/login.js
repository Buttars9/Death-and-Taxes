import express from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';

const router = express.Router();

// ✅ POST /api/login — handles login and sets secure cookie
router.post('/', async (req, res) => {
  const { email, password } = req.body;

  // 🔒 Validate input
  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password required.' });
  }

  try {
    // 🔍 Find user by email
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials.' });
    }

    // 🔐 Compare password hash
    const isMatch = await bcrypt.compare(password, user.passwordHash);
    if (!isMatch) {
      return res.status(401).json({ error: 'Invalid credentials.' });
    }

    // 🔑 Generate JWT token
    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, {
      expiresIn: '30d',
    });

    // 🍪 Set secure cookie
    res.cookie('token', token, {
      httpOnly: true,
      secure: true,
      sameSite: 'None',           // ✅ allow cross-origin
      path: '/',                  // ✅ ensure full path match
      maxAge: 30 * 24 * 60 * 60 * 1000,
    });

    // ✅ Return user payload
    res.status(200).json({
      success: true,
      user: {
        id: user._id,
        email: user.email,
        createdAt: user.createdAt,
      },
    });
  } catch (err) {
    // 🧯 Log and return error
    console.error('Login error:', err);
    res.status(500).json({ error: 'Internal server error.' });
  }
});

export default router;