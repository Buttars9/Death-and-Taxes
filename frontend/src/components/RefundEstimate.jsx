import React from 'react';
import PropTypes from 'prop-types';
import GlowingBox from './GlowingBox.jsx';
import PiSymbol from './PiSymbol.jsx';
import { useWizardStore } from '../stores/wizardStore';

export default function RefundEstimate({ manualFields, parsedFields }) {
  const { answers } = useWizardStore();
  const fields = { ...answers, ...parsedFields, ...manualFields };
  
  const standardDeduction = fields.maritalStatus === 'married' ? 31500 : 13850;

  const refund = {
    state: fields.residentState || 'N/A',
    filingStatus: fields.maritalStatus || 'N/A',
    income: fields.incomeSources?.reduce((sum, source) => sum + Number(source.box1 || source.amount || 0), 0) || 0,
    dependents: fields.dependents?.length || 0,
    deduction: fields.deductionType === 'standard' ? standardDeduction : fields.deductions?.reduce((sum, d) => sum + Number(d.amount || 0), 0) || 0,
    total: fields.incomeSources?.reduce((sum, source) => sum + Number(source.box2 || source.federalTaxWithheld || 0), 0) || 0,
  };

  return (
    <GlowingBox>
      <div style={{
        padding: '1rem',
        background: '#1a0028',
        borderRadius: '8px',
        boxShadow: '0 0 12px #8c4dcc',
        marginBottom: '2rem',
        color: '#e0e0ff',
      }}>
        <h3 style={{ fontSize: '1.2rem', marginBottom: '0.5rem', color: '#a166ff' }}>
          <PiSymbol /> Estimated Refund Summary
        </h3>
        <p style={{ fontSize: '0.95rem', color: '#c0b3ff', marginBottom: '1rem' }}>
          Based on your entered and uploaded data.
        </p>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
          gap: '1rem',
        }}>
          <div>
            <strong>State:</strong> {refund.state}
          </div>
          <div>
            <strong>Filing Status:</strong> {refund.filingStatus}
          </div>
          <div>
            <strong>Income:</strong> ${refund.income.toLocaleString()}
          </div>
          <div>
            <strong>Dependents:</strong> {refund.dependents}
          </div>
          <div>
            <strong>Standard Deduction:</strong> ${refund.deduction.toLocaleString()}
          </div>
          <div>
            <strong>Estimated Refund:</strong> ${refund.total.toLocaleString()}
          </div>
        </div>
      </div>
    </GlowingBox>
  );
}

RefundEstimate.propTypes = {
  manualFields: PropTypes.object,
  parsedFields: PropTypes.object,
};