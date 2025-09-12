module.exports = {
  California: {
    template: `I, {name}, of California, declare this my Last Will and Testament.
    Executor: {executorName}.
    Beneficiaries: {beneficiaries}.
    Assets: {assetSummary}.
    Guardianship: {guardianClause}.
    Burial: {burialPreference}.`
  },
  Texas: {
    template: `I, {name}, of Texas, declare this my Last Will and Testament.
    Executor: {executorName}.
    Beneficiaries: {beneficiaries}.
    Assets: {assetSummary}.
    Guardianship: {guardianClause}.
    Burial: {burialPreference}.`
  },
  // Add more states as needed
  Unknown: {
    template: `I, {name}, declare this my Last Will and Testament.
    Executor: {executorName}.
    Beneficiaries: {beneficiaries}.
    Assets: {assetSummary}.
    Guardianship: {guardianClause}.
    Burial: {burialPreference}.`
  }
};