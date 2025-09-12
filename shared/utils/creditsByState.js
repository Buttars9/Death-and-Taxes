// shared/utils/creditsByState.js

export function getStateCredits(state) {
  const credits = {
    CA: [
      { name: 'Renters Credit', amount: 60 },
      { name: 'Child Care Credit', amount: 200 },
    ],
    TX: [
      { name: 'Property Tax Relief', amount: 150 },
    ],
    NY: [
      { name: 'Earned Income Credit', amount: 250 },
      { name: 'College Tuition Credit', amount: 300 },
    ],
    FL: [],
    // Add more states as needed
  };

  return credits[state] || [];
}