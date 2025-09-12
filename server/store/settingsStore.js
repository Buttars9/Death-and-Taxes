// death-and-taxes/server/store/settingsStore.js

let settings = {
  adminWallet: '',
}

export function setAdminWallet(address) {
  if (!address || typeof address !== 'string') throw new Error('Invalid wallet address')
  settings.adminWallet = address
}

export function getAdminWallet() {
  return settings.adminWallet
}