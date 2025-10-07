import express from 'express';

const router = express.Router();

/**
 * Clear JWT cookie and end session.
 */
router.post('/', (req, res) => {
  res.clearCookie('token', {
    httpOnly: true,
    secure: true, // Always true for HTTPS live deploy
    sameSite: 'None', // Required for cross-origin cookie clearing
    domain: '.deathntaxes.app', // Explicit domain match for live frontend
  });

  return res.status(200).json({ success: true, message: 'Logged out successfully.' });
});

export default router;