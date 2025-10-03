import { determineDeductionStrategy } from './deductionStrategy.js';
import { calculateRefund } from './calculateRefund.js';
import willTemplates from '../../server/data/willTemplates.js';

export function willifyAnswers(answers) {
  const {
    name = 'Unnamed',
    state = 'Unknown',
    employmentType,
    dependents,
    assets,
    deductions = {},
    filingStatus,
    agi,
    executorName = 'Executor Not Specified',
    beneficiaries = 'Beneficiaries Not Specified',
    bequests = 'No specific bequests',
    hasMinorChildren = false,
    guardianName = 'Guardian Not Specified',
    burialPreference = 'Executor’s choice'
  } = answers;

  const hasDependents = Array.isArray(dependents) && dependents.length > 0;
  const hasAssets = Array.isArray(assets) && assets.length > 0;

  // Select state-specific will template
  const template = willTemplates[state]?.template || willTemplates.Unknown.template;
  const guardianClause = hasMinorChildren && guardianName ? `Appoint ${guardianName} as guardian.` : 'No guardianship.';
  const assetSummary = hasAssets ? bequests : 'No specific bequests.';

  const willText = template
    .replace('{name}', name)
    .replace('{executorName}', executorName)
    .replace('{beneficiaries}', beneficiaries)
    .replace('{assetSummary}', assetSummary)
    .replace('{guardianClause}', guardianClause)
    .replace('{burialPreference}', burialPreference);

  const baseWill = {
    name,
    state,
    employmentType,
    provisions: [],
    willVersion: 'v1.0',
    generatedAt: new Date().toISOString(),
    willText
  };

  if (hasDependents) {
    baseWill.provisions.push('Include guardianship and minor trust provisions.');
  }

  if (hasAssets) {
    baseWill.provisions.push('Include asset distribution and estate transfer clauses.');
  }

  const taxVerdict = determineDeductionStrategy({
    filingStatus,
    deductions,
    agi,
  });

  const refundEstimate = calculateRefund({
    state,
    filingStatus,
    income: agi,
    dependents: hasDependents ? dependents.length : 0,
  });

  return {
    ...baseWill,
    taxVerdict,
    refundEstimate,
  };
}