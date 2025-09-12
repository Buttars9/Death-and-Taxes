// death-and-taxes/server/routes/refundStoreRoutes.js

import express from 'express'
import { submitRefund, getAllRefunds } from '../store/refundStore.js'
import { authGate } from '../middleware/authGate.js'

const router = express.Router()

router.post('/submit', authGate, (req, res) => {
  try {
    const refund = submitRefund(req.body)
    return res.status(200).json({ success: true, refund })
  } catch (err) {
    console.error('Refund submission error:', err)
    return res.status(400).json({ error: err.message })
  }
})

router.get('/all', authGate, (req, res) => {
  const refunds = getAllRefunds()
  return res.status(200).json({ refunds })
})

export default router