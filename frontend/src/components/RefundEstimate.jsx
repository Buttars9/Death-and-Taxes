import React, { useState } from 'react';
import PropTypes from 'prop-types';
import PiSymbol from './PiSymbol.jsx';
import { useWizardStore } from '../stores/wizardStore';
import { calculateRefund } from '../shared/utils/calculateRefund.js';
import deductionVerdictFromAnswers from '../shared/utils/deductionVerdictFromAnswers.js';
// Removed import './RefundEstimate.css'; to eliminate any CSS-added box styles

function calculateAgeFromDOB(dob) {
  if (!dob) return 0;
  const birthDate = new Date(dob);
  const today = new Date();
  let age = today.getFullYear() - birthDate.getFullYear();
  const m = today.getMonth() - birthDate.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
    age--;
  }
  return age;
}

export default function RefundEstimate({ manualFields, isSticky = true }) {
  const { answers, maritalStatus } = useWizardStore();

  const fields = {
    filingStatus: manualFields?.filingStatus || answers.maritalStatus || maritalStatus || 'single',
    state: manualFields?.state || answers.residentState || 'N/A',
    income: answers.incomeSources?.reduce((sum, source) => sum + Number(source.box1 || source.amount || 0), 0) || 0,
    dependents: (Array.isArray(manualFields?.dependents) ? manualFields.dependents.length :
                manualFields?.dependents && typeof manualFields.dependents === 'object' ? 1 :
                Array.isArray(answers.dependents) ? answers.dependents.length : 
                answers.dependents && typeof answers.dependents === 'object' ? 1 : 0) || 0,
    age: manualFields?.age || answers.age || calculateAgeFromDOB(answers.dob),
    tipIncome: manualFields?.tipIncome || answers.tipIncome || 0,
    overtimeIncome: manualFields?.overtimeIncome || answers.overtimeIncome || 0,
    saltPaid: manualFields?.saltPaid || answers.saltPaid || 0,
    assets: manualFields?.assets || answers.assets || [],
    deductionType: (Array.isArray(manualFields?.deductions) && manualFields.deductions.length > 0)
      ? 'itemized'
      : manualFields?.deductionType || answers.deductionType || 'standard',
    itemizedDeductions: Array.isArray(manualFields?.deductions)
      ? manualFields.deductions.map((d) => ({
          value: d.value,
          amount: d.amount || 0,
        }))
      : Array.isArray(answers.deductions)
      ? answers.deductions.map((d) => ({
          value: d.value,
          amount: d.amount || 0,
        }))
      : [],
    credits: manualFields?.credits || answers.credits || [],
    taxWithheld: answers.incomeSources?.reduce((sum, source) => sum + Number(source.box2 || source.federalTaxWithheld || 0), 0) || 0,
    estimatedPayments: Number(manualFields?.estimatedPayments) || Number(answers.estimatedPayments) || 0,
    stateTaxWithheld: answers.incomeSources?.reduce((sum, source) => sum + Number(source.box17 || 0), 0) || 0,
    incomeSources: answers.incomeSources || [],
  };

  console.log('RefundEstimate fields:', {
    deductionType: fields.deductionType,
    itemizedDeductions: fields.itemizedDeductions,
    dependents: fields.dependents,
    manualFields,
    storeAnswers: answers,
  });

  let refundData;
  try {
    const statesPaid = Array.from(
      new Set(
        (fields.incomeSources || [])
          .map((src) => src.box15?.trim())
          .filter(Boolean)
      )
    );

    refundData = calculateRefund({
      state: fields.state,
      statesPaid,
      filingStatus: fields.filingStatus,
      income: Number(fields.income) || 0,
      dependents: Number(fields.dependents) || 0,
      age: Number(fields.age) || 0,
      tipIncome: Number(fields.tipIncome) || 0,
      overtimeIncome: Number(fields.overtimeIncome) || 0,
      saltPaid: Number(fields.saltPaid) || 0,
      assets: fields.assets,
      deductionType: fields.deductionType,
      deductions: fields.itemizedDeductions,
      credits: fields.credits,
      taxWithheld: Number(fields.taxWithheld) || 0,
      estimatedPayments: Number(fields.estimatedPayments) || 0,
      stateTaxWithheld: Number(fields.stateTaxWithheld) || 0,
      incomeSources: fields.incomeSources,
    });

    console.log('calculateRefund result:', refundData);
  } catch (error) {
    console.error('Refund calculation error:', error.message);
    const statesPaid = Array.from(
      new Set(
        (fields.incomeSources || [])
          .map((src) => src.box15?.trim())
          .filter(Boolean)
      )
    );

    refundData = {
      state: fields.state,
      statesPaid,
      filingStatus: fields.filingStatus,
      income: 0,
      dependents: 0,
      age: 0,
      tipIncome: 0,
      overtimeIncome: 0,
      saltPaid: 0,
      assets: [],
      deductionType: fields.deductionType,
      deductionAmount: 0,
      taxableIncome: 0,
      federalTaxOwed: 0,
      stateTaxOwed: 0,
      creditAmount: 0,
      totalPayments: 0,
      federalRefund: 0,
      federalBalanceDue: 0,
      stateRefund: 0,
      stateBalanceDue: 0,
      tipDeduction: 0,
      overtimeDeduction: 0,
      seniorBonus: 0,
      saltAdjustment: 0,
      bonusDepreciation: 0,
      stateCredits: [],
      stateCreditTotal: 0,
      stateRefunds: {},
      notes: 'Error calculating refund. Please complete all required fields.',
    };
  }

  let taxVerdict;
  try {
    const verdictFields = {
      ...fields,
      standardAmount: refundData.deductionAmount || 15750,
    };
    taxVerdict = deductionVerdictFromAnswers(verdictFields).taxVerdict;
    console.log('deductionVerdictFromAnswers result:', taxVerdict);
  } catch (error) {
    console.error('Deduction verdict error:', error.message);
    taxVerdict = {
      standardAmount: 15750,
      itemizedTotal: 0,
      recommendedStrategy: 'standard',
      reasoning: 'No deductions provided yet or error in verdict calculation.',
      filingStatus: fields.filingStatus,
      dependents: fields.dependents,
      income: fields.income,
    };
  }

  const isFederalRefund = refundData.federalRefund > 0;
  const federalAmount = Math.abs(isFederalRefund ? refundData.federalRefund : refundData.federalBalanceDue);
  const stateRefunds = refundData.stateRefunds || {};
  const stateNames = Object.keys(stateRefunds);
  const [showExplanation, setShowExplanation] = useState(false);

  return (
    <>
      <style>{`
        .refund-explanation {
          margin-top: 1rem;
          max-height: 300px;
          overflow-y: auto;
          font-size: 0.85rem;
          line-height: 1.4;
          color: #ffffff;
          padding-right: 8px;
        }
        .refund-explanation::-webkit-scrollbar {
          width: 6px;
        }
        .refund-explanation::-webkit-scrollbar-track {
          background: transparent;
        }
        .refund-explanation::-webkit-scrollbar-thumb {
          background-color: #00ffff;
          border-radius: 3px;
          border: 1px solid #a166ff;
        }
        .refund-explanation::-webkit-scrollbar-thumb:hover {
          background-color: #a166ff;
        }
        @media (max-width: 768px) {
          .refund-explanation {
            font-size: 0.8rem;
            max-height: 250px;
            padding-right: 4px;
          }
          .refund-explanation::-webkit-scrollbar {
            width: 4px;
          }
        }
      `}</style>
      <div
        style={{
          ...(isSticky ? { position: 'sticky', top: '100px', alignSelf: 'flex-start', zIndex: 1000 } : {}),
        }}
      >
        <h2 style={{ color: '#a166ff' }}>
          <PiSymbol /> Refund Estimate
        </h2>
        <p style={{ color: '#c0b3ff' }}>
          Based on your entries, we’ve calculated your estimated refund or balance due for both federal and state taxes.
        </p>

        <div style={{ display: 'grid', gap: '0.75rem', marginTop: '1rem' }}>
          <div>
            <strong>Federal:</strong>{' '}
            <span style={{ color: isFederalRefund ? '#00ff9d' : '#ff4d6d' }}>
              {isFederalRefund
                ? `Refund of ${formatCurrency(federalAmount)}`
                : `Balance Due of ${formatCurrency(federalAmount)}`}
            </span>
          </div>

          {stateNames.map((stateName) => {
            const data = stateRefunds[stateName];
            const isRefund = data.stateRefund > 0;
            const amount = isRefund ? data.stateRefund : data.stateBalanceDue;
            return (
              <div key={stateName}>
                <strong>{stateName}:</strong>{' '}
                <span style={{ color: isRefund ? '#00ff9d' : '#ff4d6d' }}>
                  {isRefund
                    ? `Refund of ${formatCurrency(amount)}`
                    : `Balance Due of ${formatCurrency(amount)}`}
                </span>
              </div>
            );
          })}
        </div>

        <button
          onClick={() => setShowExplanation(!showExplanation)}
          style={{
            marginTop: '1rem',
            padding: '0.5rem 1rem',
            background: '#a166ff',
            color: '#fff',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
          }}
        >
          {showExplanation ? 'Hide Explanation' : 'Show Explanation'}
        </button>

        {showExplanation && (
          <div className="refund-explanation">
            <h3>Calculation Details</h3>
            <p><strong>Filing Status:</strong> {fields.filingStatus}</p>
            <p><strong>Income:</strong> {formatCurrency(fields.income)}</p>
            <p><strong>Dependents:</strong> {fields.dependents}</p>
            <p><strong>Age:</strong> {fields.age}</p>
            <p><strong>Deduction Type:</strong> {fields.deductionType}</p>
            <p><strong>Deduction Amount:</strong> {formatCurrency(refundData.deductionAmount)}</p>
            <p><strong>Taxable Income:</strong> {formatCurrency(refundData.taxableIncome)}</p>
            <p><strong>Federal Tax Owed:</strong> {formatCurrency(refundData.federalTaxOwed)}</p>
            <p><strong>Credits Total:</strong> {formatCurrency(refundData.creditAmount)}</p>
            {fields.credits?.length > 0 && (
              <ul style={{ marginLeft: '1rem', marginBottom: '1rem', color: '#c0b3ff' }}>
                {fields.credits.map((c, i) => (
                  <li key={i}>
                    {c.type === 'child_tax' && 'Child Tax Credit:'}
                    {c.type === 'eitc' && 'Earned Income Tax Credit (EITC):'}
                    {!['child_tax', 'eitc'].includes(c.type) && `${c.type}:`}
                    {' '}
                    {formatCurrency(c.amount)} {c.note ? `– ${c.note}` : ''}
                  </li>
                ))}
              </ul>
            )}
            <p><strong>Total Payments:</strong> {formatCurrency(refundData.totalPayments)}</p>
            <p><strong>Tip Deduction:</strong> {formatCurrency(refundData.tipDeduction)}</p>
            <p><strong>Overtime Deduction:</strong> {formatCurrency(refundData.overtimeDeduction)}</p>
            <p><strong>Senior Bonus:</strong> {formatCurrency(refundData.seniorBonus)}</p>
            <p><strong>SALT Adjustment:</strong> {formatCurrency(refundData.saltAdjustment)}</p>
            <p><strong>Bonus Depreciation:</strong> {formatCurrency(refundData.bonusDepreciation)}</p>
            <p><strong>Notes:</strong> {refundData.notes}</p>
          </div>
        )}
      </div>
    </>
  );
}

RefundEstimate.propTypes = {
  manualFields: PropTypes.object,
  isSticky: PropTypes.bool,
};

function formatCurrency(amount) {
  return `$${Number(amount).toFixed(2)}`;
}