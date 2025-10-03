/**
 * Generates IRS e-file XML payload from validated answers.
 * Uses full taxpayer structure for audit-grade submission.
 */

export function generateEfileXml(payload) {
  const {
    taxpayer,
    identityVerification,
    incomeDetails,
    deductions,
    credits,
    summary,
    metadata,
  } = payload;

  const xml = `
<IRSSubmission>
  <SubmittedAt>${metadata.submittedAt}</SubmittedAt>
  <ContactEmail>${metadata.contactEmail || ''}</ContactEmail>
  <RefundEstimate>${summary.refundEstimate || 0}</RefundEstimate>

  <Taxpayer>
    <FullName>${taxpayer.fullName}</FullName>
    <SSN>${taxpayer.ssn}</SSN>
    <DOB>${taxpayer.dob}</DOB>
    <Address>${taxpayer.address}</Address>
    <FilingStatus>${taxpayer.filingStatus}</FilingStatus>
    <ResidentState>${taxpayer.residentState}</ResidentState>
    ${taxpayer.spouse ? `
    <Spouse>
      <Name>${taxpayer.spouse.name}</Name>
      <SSN>${taxpayer.spouse.ssn}</SSN>
    </Spouse>` : ''}
    ${Array.isArray(taxpayer.dependents) ? `
    <Dependents>
      ${taxpayer.dependents.map((dep) => `
      <Dependent>
        <Name>${dep.name}</Name>
        <SSN>${dep.ssn}</SSN>
        <DOB>${dep.dob}</DOB>
        <Relationship>${dep.relationship}</Relationship>
      </Dependent>`).join('\n')}
    </Dependents>` : ''}
  </Taxpayer>

  <Income>${incomeDetails.totalIncome}</Income>
  <ForeignIncome>${incomeDetails.foreignIncome ? 'true' : 'false'}</ForeignIncome>

  <Deductions>
    <Type>${deductions.type}</Type>
    <Amount>${deductions.amount}</Amount>
    ${Array.isArray(deductions.items)
      ? deductions.items.map((d) => `<Item>${JSON.stringify(d)}</Item>`).join('\n')
      : ''}
  </Deductions>

  <Credits>
    <Amount>${credits.amount}</Amount>
    ${Array.isArray(credits.items)
      ? credits.items.map((c) => `<Item>${JSON.stringify(c)}</Item>`).join('\n')
      : ''}
  </Credits>

  <Summary>
    <TaxableIncome>${summary.taxableIncome}</TaxableIncome>
    <RefundEstimate>${summary.refundEstimate || 0}</RefundEstimate>
  </Summary>

  <IdentityVerification>
    <PriorAGI>${identityVerification.priorAGI || ''}</PriorAGI>
    <IRSPIN>${identityVerification.irsPIN || ''}</IRSPIN>
  </IdentityVerification>

  <TrustConfirmed>true</TrustConfirmed>
</IRSSubmission>
`.trim();

  return xml;
}