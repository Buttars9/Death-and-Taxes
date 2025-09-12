// death-and-taxes/src/pages/Questionnaire/steps/RefundSummaryStep.jsx

import React from 'react';
import PropTypes from 'prop-types';
import GlowingBox from '../../../components/GlowingBox';
import PiSymbol from '../../../components/PiSymbol';
import { formatCurrency } from '../../../utils/formatters';

export default function RefundSummaryStep({ answers, setAnswers, livePrices, onNext, onBack }) {
  const calculateRefundEstimate = () => {
    let baseRefund = 0;

    // 🧾 Income impact
    if (answers.incomeSources?.includes('Unemployment Benefits')) baseRefund += 500;
    if (answers.incomeSources?.includes('Self-Employment (1099)')) baseRefund += 300;

    // 📉 Deductions bonus
    baseRefund += (answers.deductions?.length || 0) * 150;

    // 🎯 Credits boost
    baseRefund += (answers.credits?.length || 0) * 250;

    return baseRefund;
  };

  const refundUSD = calculateRefundEstimate();
  const refundPi = livePrices?.pi ? (refundUSD / livePrices.pi).toFixed(3) : '—';

  const handleSubmit = () => {
    setAnswers((prev) => ({
      ...prev,
      refundEstimateUSD: refundUSD,
      refundEstimatePi: refundPi,
    }));
    onNext();
  };

  return (
    <GlowingBox>
      <div className="refund-summary-step">
        <h2>
          <PiSymbol /> Your Refund Estimate
        </h2>
        <p>
          Based on your inputs, here’s your current estimate. A final breakdown will follow post-review.
        </p>
        <div className="refund-breakdown">
          <p><strong>USD:</strong> {formatCurrency(refundUSD)}</p>
          <p><strong>Pi:</strong> ≈ {refundPi} π</p>
        </div>

        <div className="fee-reminder">
          <p>
            💸 A one-time <strong>$74.99 filing fee</strong> will be charged before your return is submitted.
            This covers secure processing, audit-grade storage, and refund optimization.
          </p>
        </div>

        <div className="step-buttons">
          {onBack && (
            <button type="button" onClick={onBack}>
              Back
            </button>
          )}
          <button className="primary" onClick={handleSubmit}>
            Finalize & Continue
          </button>
        </div>
      </div>
    </GlowingBox>
  );
}

RefundSummaryStep.propTypes = {
  answers: PropTypes.object.isRequired,
  setAnswers: PropTypes.func.isRequired,
  livePrices: PropTypes.shape({
    pi: PropTypes.number,
  }),
  onNext: PropTypes.func.isRequired,
  onBack: PropTypes.func,
};