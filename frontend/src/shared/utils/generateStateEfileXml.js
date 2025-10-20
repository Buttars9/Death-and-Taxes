// Reuse helpers from federal
function getStateAbbrev(state) {
  const map = { Idaho: 'ID' /* add more */ };
  return map[state] || state.substring(0, 2).toUpperCase();
}

function getNameControl(name) {
  return name.split(' ').pop().substring(0, 4).toUpperCase();
}

function generateReturnId() {
  return 'ST' + Date.now().toString(36) + Math.random().toString(36).substring(2, 7); // State prefix
}

function getFilingStatusCode(status) {
  const codes = {
    single: 1,
    marriedfilingjointly: 2,
    marriedfilingseparately: 3,
    headofhousehold: 4,
    qualifyingwidow: 5,
    marriedjointly: 2,
  };
  return codes[status.toLowerCase()] || 1;
}

function getDeductionXml(d) {
  // State-specific; placeholder
  switch (d.type) {
    case 'mortgage':
      return `<StateMortgageInterestDedAmt>${d.amount}</StateMortgageInterestDedAmt>`;
    default:
      return `<StateOtherDeductionAmt>${d.amount}</StateOtherDeductionAmt>`;
  }
}

function getCreditXml(c) {
  // State-specific; placeholder
  switch (c.type) {
    case 'child_tax':
      return `<StateChildTaxCreditAmt>${c.amount}</StateChildTaxCreditAmt>`;
    default:
      return `<StateOtherCreditAmt>${c.amount}</StateOtherCreditAmt>`;
  }
}

function calculateTax(taxable, status) {
  return taxable * 0.06; // Placeholder state tax rate (e.g., ~6% average); customize per state
}

export function generateStateEfileXml(payload) {
  const {
    metadata,
    taxpayer,
    identityVerification,
    incomeDetails,
    deductions,
    credits,
    summary,
  } = payload;

  const stateAbbrev = getStateAbbrev(metadata.state);
  const dependents = Array.isArray(taxpayer.dependents) ? taxpayer.dependents : [];

  const xml = `
<StateReturn stateVersion="2025v1.0" state="${stateAbbrev}"
  xmlns="http://www.state.gov/efile" <!-- Replace with actual state namespace -->
  xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
  xsi:schemaLocation="http://www.state.gov/efile">
  <ReturnHeader>
    <ReturnId>${generateReturnId()}</ReturnId>
    <Timestamp>${metadata.submittedAt}</Timestamp>
    <ReturnType>State1040</ReturnType> <!-- e.g., IT-40 for Idaho -->
    <TaxPeriodBeginDate>2025-01-01</TaxPeriodBeginDate>
    <TaxPeriodEndDate>2025-12-31</TaxPeriodEndDate>
    <Filer>
      <PrimarySSN>${taxpayer.ssn}</PrimarySSN>
      <PrimaryNameControlTxt>${getNameControl(taxpayer.fullName)}</PrimaryNameControlTxt>
      <NameLine1Txt>${taxpayer.fullName}</NameLine1Txt>
      <AddressUS>
        <AddressLine1Txt>${taxpayer.address}</AddressLine1Txt>
        <CityNm>${taxpayer.city || ''}</CityNm>
        <StateAbbreviationCd>${stateAbbrev}</StateAbbreviationCd>
        <ZIPCd>${taxpayer.zip || ''}</ZIPCd>
      </AddressUS>
      <FilingStatusCd>${getFilingStatusCode(taxpayer.filingStatus)}</FilingStatusCd>
      ${taxpayer.spouse ? `
      <SpouseFirstNm>${(taxpayer.spouse.name || '').split(' ')[0] || ''}</SpouseFirstNm>
      <SpouseLastNm>${(taxpayer.spouse.name || '').split(' ').slice(1).join(' ') || ''}</SpouseLastNm>
      <SpouseNameControlTxt>${getNameControl(taxpayer.spouse.name || '')}</SpouseNameControlTxt>
      <SpouseSSN>${taxpayer.spouse.ssn}</SpouseSSN>` : ''}
      ${dependents.length > 0 ? `
      <DependentDetail>
        ${dependents.map((dep) => `
        <DependentFirstNm>${dep.firstName || ''}</DependentFirstNm>
        <DependentLastNm>${dep.lastName || ''}</DependentLastNm>
        <DependentNameControlTxt>${getNameControl(dep.lastName || '')}</DependentNameControlTxt>
        <DependentSSN>${dep.ssn}</DependentSSN>
        <DependentBirthDt>${dep.dob}</DependentBirthDt>
        <DependentRelationshipCd>${dep.relationship.toUpperCase()}</DependentRelationshipCd>`).join('\n')}
      </DependentDetail>` : ''}
    </Filer>
    <IdentityVerification>
      <PriorYearAGIAmt>${identityVerification.priorAGI || ''}</PriorYearAGIAmt>
      <PIN>${identityVerification.statePIN || ''}</PIN>
    </IdentityVerification>
    <TaxYr>2025</TaxYr>
    <Preparer>
      <SelfPreparedInd>1</SelfPreparedInd>
    </Preparer>
    <TaxpayerPIN>${identityVerification.statePIN || '00000'}</TaxpayerPIN>
  </ReturnHeader>
  <ReturnData>
    <State1040> <!-- e.g., <IT40> for Idaho -->
      <IndividualReturnFilingStatusCd>${getFilingStatusCode(taxpayer.filingStatus)}</IndividualReturnFilingStatusCd>
      <PrimaryBirthDt>${taxpayer.dob}</PrimaryBirthDt>
      <StateWagesAmt>${incomeDetails.stateIncome}</StateWagesAmt> <!-- State-specific -->
      <ForeignIncomeExcludedAmt>${incomeDetails.foreignIncome ? incomeDetails.foreignIncome : 0}</ForeignIncomeExcludedAmt>
      <TotalItemizedOrStandardDedAmt>${deductions.amount}</TotalItemizedOrStandardDedAmt>
      <TotalCreditsAmt>${credits.amount}</TotalCreditsAmt>
      <TaxableIncomeAmt>${summary.taxableIncome}</TaxableIncomeAmt>
      <TaxAmt>${calculateTax(summary.taxableIncome, taxpayer.filingStatus)}</TaxAmt>
      <RefundAmt>${summary.refundEstimate || 0}</RefundAmt>
      <ItemizedDeductions>
        ${deductions.items.map((d) => getDeductionXml(d)).join('\n')}
      </ItemizedDeductions>
      <Credits>
        ${credits.items.map((c) => getCreditXml(c)).join('\n')}
      </Credits>
    </State1040>
  </ReturnData>
</StateReturn>
`.trim();

  return xml;
}