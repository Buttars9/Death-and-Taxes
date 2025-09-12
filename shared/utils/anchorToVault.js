// shared/utils/anchorToVault.js

import crypto from 'crypto';

/**
 * Anchors final payload and PDF to backend vault.
 * Generates SHA-256 hash, logs metadata, and prepares for blockchain anchoring.
 */

export async function anchorToVault({ payload, pdfBuffer, userId }) {
  if (!payload || !pdfBuffer || !userId) {
    throw new Error('Missing required vault anchoring inputs');
  }

  const payloadHash = crypto.createHash('sha256').update(JSON.stringify(payload)).digest('hex');
  const pdfHash = crypto.createHash('sha256').update(pdfBuffer).digest('hex');
  const timestamp = new Date().toISOString();

  const vaultRecord = {
    userId,
    timestamp,
    payloadHash,
    pdfHash,
    auditTag: 'final_submission_anchored',
  };

  try {
    const res = await fetch('/api/vault/anchor', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(vaultRecord),
    });

    if (!res.ok) {
      throw new Error(`Vault anchoring failed: ${res.status}`);
    }

    return await res.json();
  } catch (err) {
    console.error('❌ Vault anchoring error:', err);
    throw err;
  }
}