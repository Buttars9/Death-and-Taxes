// death-and-taxes/server/routes/settingsRoutes.js

import express from 'express'
import { setAdminWallet, getAdminWallet } from '../store/settingsStore.js'
import { authGate } from '../middleware/authGate.js'

const router = express.Router()

router.get('/wallet', authGate, (req, res) => {
  return res.status(200).json({ wallet: getAdminWallet() })
})

router.post('/wallet', authGate, (req, res) => {
  try {
    const { wallet } = req.body
    setAdminWallet(wallet)
    return res.status(200).json({ success: true, wallet })
  } catch (err) {
    console.error('Wallet update failed:', err)
    return res.status(400).json({ error: err.message })
  }
})

export default router