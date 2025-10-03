// shared/utils/lawSync.js

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
  phaseouts: {
    salt: {
      start: 500000,
      reductionPer10k: 5000,
      minCap: 10000,
    },
    senior: {
      startSingle: 150000,
      startMarried: 300000,
      reductionRate: 0.1, // 10% per bracket
      bracketSize: 50000, // per $50k over start
    },
  },
  notes: [
    "QSBS holding period reduced to 3 years",
    "SALT cap raised for incomes under $500K; phased down above (reduce $5k per $10k over, min $10k)",
    "Senior bonus deduction applies at age 65+; phased out 10% per $50k over $150k single/$300k joint",
  ],
};