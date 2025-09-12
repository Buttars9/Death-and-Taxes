// death-and-taxes/api/utils/vaultUploader.js

import fs from 'fs';
import path from 'path';
import { promisify } from 'util';

const writeFile = promisify(fs.writeFile);

export async function stageToVault(buffer, filename) {
  const vaultDir = path.join(process.cwd(), 'vault-storage');
  const filePath = path.join(vaultDir, filename);

  // Ensure directory exists
  if (!fs.existsSync(vaultDir)) {
    fs.mkdirSync(vaultDir, { recursive: true });
  }

  await writeFile(filePath, buffer);

  return {
    success: true,
    path: filePath,
    vaultUrl: `/vault-storage/${filename}` // Placeholder for future cloud URL
  };
}