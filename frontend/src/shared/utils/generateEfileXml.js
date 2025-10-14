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
<Return returnVersion="2025v1.0"
  xmlns="http://www.irs.gov/efile"
  xmlns:efile="http://www.irs.gov/efile"
  xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
  xsi:schemaLocation="http://www.irs.gov/efile">
  <ReturnHeader>
    <ReturnId>${metadata.submissionId || 'GENERATED_ID'}</ReturnId>
    <Timestamp>${metadata.submittedAt}</Timestamp>
    <ReturnType>1040</ReturnType>
    <TaxPeriodBeginDate>${metadata.taxPeriodBeginDate || '2025-01-01'}</TaxPeriodBeginDate>
    <TaxPeriodEndDate>${metadata.taxPeriodEndDate || '2025-12-31'}</TaxPeriodEndDate>
    <Filer>
      <PrimarySSN>${taxpayer.ssn}</PrimarySSN>
      <NameLine1Txt>${taxpayer.fullName}</NameLine1Txt>
      <AddressUS>
        <AddressLine1Txt>${taxpayer.address}</AddressLine1Txt>
        <CityNm>${taxpayer.city || ''}</CityNm>
        <StateAbbreviationCd>${taxpayer.residentState}</StateAbbreviationCd>
        <ZIPCd>${taxpayer.zip || ''}</ZIPCd>
      </AddressUS>
      <FilingStatusCd>${getFilingStatusCode(taxpayer.filingStatus)}</FilingStatusCd>
      ${taxpayer.spouse ? `
      <SpouseNameControlTxt>${taxpayer.spouse.name}</SpouseNameControlTxt>
      <SpouseSSN>${taxpayer.spouse.ssn}</SpouseSSN>` : ''}
      ${Array.isArray(taxpayer.dependents) ? `
      <DependentDetail>
        ${taxpayer.dependents.map((dep) => `
        <DependentNameControlTxt>${dep.name}</DependentNameControlTxt>
        <DependentSSN>${dep.ssn}</DependentSSN>
        <DependentBirthDt>${dep.dob}</DependentBirthDt>
        <DependentRelationshipCd>${dep.relationship}</DependentRelationshipCd>`).join('\n')}
      </DependentDetail>` : ''}
    </Filer>
    <IdentityVerification>
      <PriorYearAGIAmt>${identityVerification.priorAGI || ''}</PriorYearAGIAmt>
      <PIN>${identityVerification.irsPIN || ''}</PIN>
    </IdentityVerification>
    <TaxYr>2025</TaxYr>
  </ReturnHeader>
  <ReturnData>
    <IRS1040>
      <IndividualReturnFilingStatusCd>${getFilingStatusCode(taxpayer.filingStatus)}</IndividualReturnFilingStatusCd>
      <PrimaryBirthDt>${taxpayer.dob}</PrimaryBirthDt>
      <WagesSalariesAndTipsAmt>${incomeDetails.totalIncome}</WagesSalariesAndTipsAmt>
      <ForeignIncomeExcludedAmt>${incomeDetails.foreignIncome ? incomeDetails.foreignIncome : 0}</ForeignIncomeExcludedAmt>
      <TotalItemizedOrStandardDedAmt>${deductions.amount}</TotalItemizedOrStandardDedAmt>
      <TotalCreditsAmt>${credits.amount}</TotalCreditsAmt>
      <TaxableIncomeAmt>${summary.taxableIncome}</TaxableIncomeAmt>
      <RefundAmt>${summary.refundEstimate || 0}</RefundAmt>
      ${Array.isArray(deductions.items)
        ? `<ItemizedDeductions>
            ${deductions.items.map((d) => `<DeductionItem>${JSON.stringify(d)}</DeductionItem>`).join('\n')}
          </ItemizedDeductions>`
        : ''}
      ${Array.isArray(credits.items)
        ? `<Credits>
            ${credits.items.map((c) => `<CreditItem>${JSON.stringify(c)}</CreditItem>`).join('\n')}
          </Credits>`
        : ''}
    </IRS1040>
  </ReturnData>
</Return>
`.trim();

  return xml;
}

// Helper function to map filing status to IRS code (add this based on common mappings)
function getFilingStatusCode(status) {
  const codes = {
    single: 1,
    marriedfilingjointly: 2,
    marriedfilingseparately: 3,
    headofhousehold: 4,
    qualifyingwidow: 5,
    marriedjointly: 2, // Added: To handle 'marriedJointly' or similar variants
  };
  return codes[status.toLowerCase()] || 1; // Default to single
}