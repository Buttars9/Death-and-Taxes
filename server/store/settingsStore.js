// death-and-taxes/server/store/settingsStore.js

import fs from 'fs';
import path from 'path';

const WALLET_PATH = path.resolve('./server/store/adminWallet.json');

export function setAdminWallet(wallet) {
  if (
    !wallet ||
    typeof wallet !== 'object' ||
    typeof wallet.pi !== 'string'
  ) {
    throw new Error('Invalid wallet object');
  }

  try {
    fs.writeFileSync(WALLET_PATH, JSON.stringify(wallet, null, 2));
  } catch (err) {
    console.error('Failed to save wallet:', err);
    throw err;
  }
}

export function getAdminWallet() {
  try {
    if (!fs.existsSync(WALLET_PATH)) return {};
    const raw = fs.readFileSync(WALLET_PATH);
    return JSON.parse(raw);
  } catch (err) {
    console.error('Failed to read wallet:', err);
    return {};
  }
}