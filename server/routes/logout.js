import express from 'express';

const router = express.Router();

/**
 * Clear JWT cookie and end session.
 */
router.post('/', (req, res) => {
  res.clearCookie('token', {
    httpOnly: true,
    secure: true,               // Required for HTTPS
    sameSite: 'None',           // Required for cross-origin cookie clearing
    path: '/',                  // Ensure full path match
  });

  return res.status(200).json({ success: true, message: 'Logged out successfully.' });
});

export default router;