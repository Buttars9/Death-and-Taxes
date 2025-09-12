// shared/utils/generateEfileXml.js

/**
 * Generates IRS e-file XML payload from validated answers.
 * This is a simplified version for future schema integration.
 */

export function generateEfileXml(answers) {
  const {
    filingStatus,
    income,
    deductionType,
    deductions = [],
    credits = [],
    taxWithheld,
    estimatedPayments,
    priorAGI,
    irsPIN,
    routingNumber,
    accountNumber,
    trustConfirmed,
  } = answers;

  const xml = `
<IRSSubmission>
  <FilingStatus>${filingStatus}</FilingStatus>
  <Income>${income}</Income>
  <DeductionType>${deductionType}</DeductionType>
  <Deductions>
    ${deductions.map((d) => `<Deduction>${d}</Deduction>`).join('\n    ')}
  </Deductions>
  <Credits>
    ${credits.map((c) => `<Credit>${c}</Credit>`).join('\n    ')}
  </Credits>
  <TaxWithheld>${taxWithheld}</TaxWithheld>
  <EstimatedPayments>${estimatedPayments}</EstimatedPayments>
  <PriorAGI>${priorAGI}</PriorAGI>
  <IRSPIN>${irsPIN || ''}</IRSPIN>
  <BankInfo>
    <RoutingNumber>${routingNumber}</RoutingNumber>
    <AccountNumber>${accountNumber}</AccountNumber>
  </BankInfo>
  <TrustConfirmed>${trustConfirmed ? 'true' : 'false'}</TrustConfirmed>
</IRSSubmission>
`.trim();

  return xml;
}