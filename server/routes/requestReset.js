import express from 'express';
import jwt from 'jsonwebtoken';
import nodemailer from 'nodemailer';
import User from '../models/User.js';

const router = express.Router();

// 🔐 Email transport using Gmail
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

router.post('/', async (req, res) => {
  const { email } = req.body;

  if (!email) {
    return res.status(400).json({ error: 'Email is required.' });
  }

  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ error: 'No account found for that email.' });
    }

    const token = jwt.sign(
      { userId: user._id },
      process.env.JWT_SECRET,
      { expiresIn: '15m' }
    );

    user.resetToken = token;
    user.resetTokenExpires = Date.now() + 15 * 60 * 1000;
    await user.save();

    const resetLink = `https://www.deathntaxes.app/reset-password?token=${token}`;

    const mailOptions = {
      from: process.env.EMAIL_FROM,
      to: email,
      subject: 'Reset Your Password',
      html: `
        <p>You requested a password reset.</p>
        <p><a href="${resetLink}">Click here to reset your password</a></p>
        <p>This link will expire in 15 minutes.</p>
      `,
    };

    await transporter.sendMail(mailOptions);
    console.log(`[EMAIL SENT] Reset link sent to ${email}`);

    return res.status(200).json({ success: true, message: 'Reset link emailed.' });
  } catch (err) {
    console.error('[REQUEST RESET ERROR]', err);
    return res.status(500).json({ error: 'Internal server error.' });
  }
});

export default router;