export const creditsByState = {
  CA: [
    { type: 'CA Earned Income Credit', amount: 500 },
    { type: 'Solar Incentive', amount: 750 },
  ],
  NY: [
    { type: 'Renters Rebate', amount: 300 },
    { type: 'College Tuition Credit', amount: 1000 },
  ],
  TX: [
    { type: 'Veterans Property Credit', amount: 800 },
  ],
  FL: [
    { type: 'Hurricane Prep Credit', amount: 250 },
  ],
  IL: [
    { type: 'Green Vehicle Credit', amount: 600 },
  ],
  // Add more states as needed
};

export function getStateCredits(state) {
  return creditsByState[state] || [];
}