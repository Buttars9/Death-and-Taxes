import crypto from 'crypto';
import fs from 'fs';
import path from 'path';

const HASH_STORE_PATH = path.join(process.cwd(), 'server', 'logs', 'vaultHashes.json');

function getCurrentHash(payload) {
  return crypto.createHash('sha256').update(JSON.stringify(payload)).digest('hex');
}

function ensureHashStoreExists() {
  if (!fs.existsSync(HASH_STORE_PATH)) {
    fs.writeFileSync(HASH_STORE_PATH, JSON.stringify([], null, 2));
  }
}

function persistHash(id, payload) {
  const hash = getCurrentHash(payload);
  const entry = {
    id,
    hash,
    timestamp: new Date().toISOString(),
  };

  ensureHashStoreExists();

  const existing = JSON.parse(fs.readFileSync(HASH_STORE_PATH, 'utf-8'));
  existing.push(entry);

  fs.writeFileSync(HASH_STORE_PATH, JSON.stringify(existing, null, 2));
}

function verifyHash(id, payload) {
  const currentHash = getCurrentHash(payload);

  if (!fs.existsSync(HASH_STORE_PATH)) return false;

  const existing = JSON.parse(fs.readFileSync(HASH_STORE_PATH, 'utf-8'));
  const match = existing.find(entry => entry.id === id);

  return match ? match.hash === currentHash : false;
}

export { persistHash, verifyHash };