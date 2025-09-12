import express from 'express';

const router = express.Router();

/**
 * Clear JWT cookie and end session.
 */
router.post('/', (req, res) => {
  res.clearCookie('token', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'Lax',
  });

  return res.status(200).json({ success: true, message: 'Logged out successfully.' });
});

export default router;