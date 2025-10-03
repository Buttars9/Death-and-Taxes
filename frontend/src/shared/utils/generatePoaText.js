/**
 * Generates a legally structured Power of Attorney document.
 * Output is a plain text string ready for rendering or PDF generation.
 */

export function generatePoaText(data = {}) {
  const {
    principal,
    agent,
    powers,
    expiration,
    jurisdiction,
    signatureDate,
  } = data;

  return `
Power of Attorney

I, ${principal || '[Your Name]'}, appoint ${agent || '[Agent Name]'} as my lawful agent.

1. Granted Powers
${powers || 'No powers specified.'}

2. Expiration
This POA remains in effect until ${expiration || 'revoked in writing'}.

Jurisdiction: ${jurisdiction || '[Jurisdiction not specified]'}

Signed on ${signatureDate || '[Date not provided]'}, this document is intended to be legally binding.
`.trim();
}