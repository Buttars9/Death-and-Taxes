module.exports = {
  federal: {
    brackets: {
      single: [
        [0.10, 11925], [0.12, 48475], [0.22, 103350], [0.24, 197300],
        [0.32, 250525], [0.35, 626350], [0.37, Infinity]
      ],
      married: [
        [0.10, 23850], [0.12, 96950], [0.22, 206700], [0.24, 394600],
        [0.32, 501050], [0.35, 751600], [0.37, Infinity]
      ],
      headOfHousehold: [
        [0.10, 17000], [0.12, 64850], [0.22, 103350], [0.24, 197300],
        [0.32, 250500], [0.35, 626350], [0.37, Infinity]
      ]
    },
    standardDeduction: { single: 15000, married: 30000, headOfHousehold: 22500 },
    childTaxCredit: 2200
  },
  states: {
    Alabama: { rates: { single: [[2, 500], [4, 3000], [5, Infinity]], married: [[2, 1000], [4, 6000], [5, Infinity]] } },
    Alaska: { rates: { single: [[0, Infinity]] } },
    Arizona: { rates: { single: [[2.5, Infinity]] } },
    // Add more states from taxfoundation.org
  }
};