// death-and-taxes/server/middleware/authGate.js

export function authGate(req, res, next) {
  const userEmail = req.headers['x-user-email']
  if (!userEmail || typeof userEmail !== 'string') {
    return res.status(401).json({ error: 'Unauthorized: missing x-user-email' })
  }

  // 🔒 Attach to request for downstream access
  req.userEmail = userEmail.trim()
  next()
}