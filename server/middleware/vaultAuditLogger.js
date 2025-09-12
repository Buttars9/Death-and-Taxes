// death-and-taxes/server/middleware/vaultAuditLogger.js

import fs from 'fs';
import path from 'path';

const LOG_PATH = path.join(process.cwd(), 'server', 'logs', 'vaultAuditLog.json');

function vaultAuditLogger(req, res, next) {
  const logEntry = {
    timestamp: new Date().toISOString(),
    method: req.method,
    path: req.originalUrl,
    ip: req.ip,
    userId: req.user?.id || 'anonymous',
    payload: req.body,
  };

  // Ensure log file exists
  if (!fs.existsSync(LOG_PATH)) fs.writeFileSync(LOG_PATH, JSON.stringify([]));

  // Append new entry
  const existing = JSON.parse(fs.readFileSync(LOG_PATH));
  existing.push(logEntry);
  fs.writeFileSync(LOG_PATH, JSON.stringify(existing, null, 2));

  next();
}

export default vaultAuditLogger;