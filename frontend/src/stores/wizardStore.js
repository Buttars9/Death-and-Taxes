import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

/**
 * Centralized store for guided filing flow.
 * Tracks payment type, answers, state selection, will data, and branching logic.
 * All setters include validation and audit-safe defaults.
 */
export const useWizardStore = create(
  persist(
    (set, get) => ({
      // 💳 Payment Type
      paymentType: 'pi',
      setPaymentType: (type) => {
        if (typeof type !== 'string' || !type.trim()) {
          throw new Error('❌ Invalid payment type');
        }
        set({ paymentType: type.trim() });
      },

      // 🧾 Answers Payload (filingStatus, incomeSources, deductions, credits, AGI, etc.)
      answers: {
        incomeSources: [], // ✅ From IncomeSourcesStep
        deductions: [],     // ✅ From DeductionsClaimStep
        credits: [],        // ✅ From CreditsClaimStep
       trustConfirmed: false, 
      },
      setAnswers: (payload, callback) => {
        if (!payload || typeof payload !== 'object') {
          throw new Error('❌ Invalid answers payload');
        }
        // Added validation for required fields
        if (payload.ssn && !/^\d{9}$/.test(payload.ssn)) throw new Error('Invalid SSN');
        if (payload.address && (!payload.city || !payload.zip)) console.warn('Incomplete address'); // Changed to warn

        // Added computation for deduction/credit totals
        const deductionAmount = payload.deductions.reduce((sum, d) => sum + Number(d.amount || 0), 0);
        const creditAmount = payload.credits.reduce((sum, c) => sum + Number(c.amount || 0), 0);
        set({ answers: { ...payload, deductionAmount, creditAmount } });
        if (typeof callback === 'function') callback();
      },

      // 🧭 State Selection
      state: '',
      setState: (selectedState) => {
        if (typeof selectedState !== 'string' || !selectedState.trim()) {
          throw new Error('❌ Invalid state selection');
        }
        set({ state: selectedState.trim() });
      },
      isStateSelected: () => !!get().state,

      // 🪦 Will & Testament Payload
      willData: {},
      setWillData: (payload) => {
        if (!payload || typeof payload !== 'object') {
          throw new Error('❌ Invalid willData payload');
        }
        set({ willData: { ...payload } });
      },

      // 🔀 Branching Logic (e.g. state-specific flows)
      stateBranch: null,
      setStateBranch: (branchKey) => {
        set({ stateBranch: branchKey || null });
      },
      getStateBranch: () => get().stateBranch,

      // 🧠 Filing Status Access + Validation
      getFilingStatus: () => get().answers?.maritalStatus || '',
      isFilingStatusValid: () => {
        const validStatuses = ['single', 'married', 'head'];
        return validStatuses.includes(get().answers?.maritalStatus);
      },

      // 📥 Deductions & Credits Accessors
      getDeductions: () => get().answers?.deductions || [],
      getCredits: () => get().answers?.credits || [],
      getRefundableCredits: () => {
        const selected = get().answers?.credits || [];
        const refundableSet = new Set(['child_tax', 'eitc', 'education', 'healthcare', 'childcare']);
        return selected.filter((credit) => refundableSet.has(credit));
      },

      // 🧮 Deduction Type + AGI Estimator
      getDeductionType: () => {
        const selected = get().answers?.deductions || [];
        const aboveTheLineSet = new Set(['student_loan', 'ira', 'hsa']);
        const itemizedSet = new Set(['mortgage', 'medical', 'charity']);

        const hasAbove = selected.some((d) => aboveTheLineSet.has(d.value));
        const hasItemized = selected.some((d) => itemizedSet.has(d.value));

        if (hasItemized) return 'itemized';
        if (hasAbove) return 'above-the-line';
        return 'standard';
      },
      estimateAGI: () => {
        const baseAGI = parseFloat(get().answers?.agi) || 0;
        const deductionType = get().getDeductionType();

        let deductionAmount = 0;
        if (deductionType === 'standard') {
          deductionAmount = get().answers?.maritalStatus === 'married' ? 31500 : 13850;
        } else if (deductionType === 'itemized') {
          deductionAmount = get().answers?.deductions?.reduce((sum, d) => sum + Number(d.amount || 0), 0) || 16000;
        } else if (deductionType === 'above-the-line') {
          deductionAmount = get().answers?.deductions?.reduce((sum, d) => sum + Number(d.amount || 0), 0) || 3000;
        }

        return Math.max(0, baseAGI - deductionAmount);
      },

      // 👤 Personal Info Fields (from PersonalInfoStep)
      firstName: '',
      lastName: '',
      ssn: '',
      dob: '',
      address: '',
      maritalStatus: '',
      residentState: '',
      priorAGI: '',
      irsPin: '',
      incomeSources: [],
      dependents: [],
      spouseName: '',
      spouseSSN: '',
      spouseDob: '',
      spouseIncomeSources: [],

      // 💼 W-2 Income Fields
      w2s: [],

      // 🧮 Additional IRS Info
      foreignIncome: '',
      agi: '',
      irsPin: '',

      // 🔧 Generic Field Updater
      updateField: (field, value) => set({ [field]: value }),

      // ✅ Submission Confirmation Flag
      submissionConfirmed: false,
      setSubmissionConfirmed: () => set({ submissionConfirmed: true }),

      // 📜 Audit Trail Ledger
      auditTrail: [],
      logSubmission: (entry) =>
        set((state) => ({
          auditTrail: [...state.auditTrail, entry],
        })),

      // 🔁 Polling Logic for Filing Status Updates
      pollFilingStatus: async () => {
        const currentTrail = get().auditTrail;
        const updatedTrail = await Promise.all(currentTrail.map(async (entry) => {
          try {
            const res = await fetch(`/api/status/${entry.escrowHash}`);
            const data = await res.json();
            return {
              ...entry,
              filingStatus: data.filingStatus || entry.filingStatus,
            };
          } catch (err) {
            return entry;
          }
        }));
        set({ auditTrail: updatedTrail });
      },
    }),
    {
      name: 'wizard-store',
      storage: createJSONStorage(() => localStorage),
      // FIX: Persist key fields to prevent reset on refresh
      partialize: (state) => ({
        answers: state.answers,
        w2s: state.w2s,
        state: state.state,
        willData: state.willData,
        firstName: state.firstName,
        lastName: state.lastName,
        ssn: state.ssn,
        dob: state.dob,
        address: state.address,
        maritalStatus: state.maritalStatus,
        residentState: state.residentState,
        priorAGI: state.priorAGI,
        irsPin: state.irsPin,
        dependents: state.dependents,
        spouseName: state.spouseName,
        spouseSSN: state.spouseSSN,
        spouseDob: state.spouseDob,
        spouseIncomeSources: state.spouseIncomeSources,
        foreignIncome: state.foreignIncome,
        agi: state.agi,
        submissionConfirmed: state.submissionConfirmed,
        auditTrail: state.auditTrail,
      }),
    }
  )
);

// ✅ Will data accessor for FinalWillPage
export const getWillData = () => useWizardStore.getState().willData;