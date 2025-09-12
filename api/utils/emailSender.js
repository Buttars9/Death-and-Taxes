// death-and-taxes/api/utils/emailSender.js

export async function sendFilingConfirmation(to, { refund, filingId, vaultUrl }) {
  if (!to || !refund || !filingId || !vaultUrl) {
    throw new Error('Missing email confirmation parameters');
  }

  // 🧾 Compose message
  const subject = `Your Tax Filing Receipt`;
  const body = `
    Thanks for filing with Death and Taxes.

    Filing ID: ${filingId}
    Refund Estimate: $${refund.amount ?? 'N/A'}
    Receipt URL: ${vaultUrl}

    We'll notify you when your refund is confirmed on-chain.
  `.trim();

  // 📬 Log to console for now
  console.log(`[AUDIT][EMAIL] Sending confirmation to ${to}`);
  console.log(subject);
  console.log(body);

  return { success: true, mockSent: true };
}