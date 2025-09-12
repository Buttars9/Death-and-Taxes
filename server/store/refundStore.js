// death-and-taxes/server/store/refundStore.js

let refunds = []

export function submitRefund(data) {
  if (!data || typeof data !== 'object') throw new Error('Invalid refund submission')

  const { amount, reason, paymentType } = data
  if (!amount || !reason || !paymentType) throw new Error('Missing refund fields')

  const timestamp = Date.now()
  const refund = { amount, reason, paymentType, timestamp }
  refunds.push(refund)

  return refund
}

export function getAllRefunds() {
  return refunds
}