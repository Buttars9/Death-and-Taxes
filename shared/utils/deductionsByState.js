// death-and-taxes/src/utils/deductionsByState.js

// Simplified deduction logic scaffold for all 50 states
// This will expand over time with credits, thresholds, and edge cases

export const deductionsByState = {
  Alabama: {
    standardDeduction: 4000,
    notes: 'Itemized allowed if higher than standard. No grocery credit.',
  },
  Alaska: {
    standardDeduction: 0,
    notes: 'No state income tax.',
  },
  Arizona: {
    standardDeduction: 12500,
    notes: 'Matches federal. Allows itemized deductions.',
  },
  // ... full list continues
  Wisconsin: {
    standardDeduction: 10000,
    notes: 'Credits for renters, child care, and retirement.',
  },
  Wyoming: {
    standardDeduction: 0,
    notes: 'No state income tax.',
  }
};