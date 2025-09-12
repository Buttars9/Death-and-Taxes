// src/utils/lawSync.js

export const OBBBA_LAW = {
  year: 2025,
  thresholds: {
    bonusDepreciation: 1.0, // 100%
    section179Limit: 2500000,
    section179PhaseOut: 4000000,
    tipDeductionCap: 25000,
    overtimeDeductionCap: 12500,
    saltCap: 40000,
    seniorBonusDeduction: {
      single: 6000,
      married: 12000,
    },
  },
  notes: [
    "QSBS holding period reduced to 3 years",
    "SALT cap raised for incomes under $500K",
    "Senior bonus deduction applies at age 65+",
  ],
};