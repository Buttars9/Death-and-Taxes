// ...imports unchanged...

export default function WizardFlow() {
  const [step, setStep] = useState(1);
  const [answers, setAnswers] = useState(null);
  const [refund, setRefund] = useState(null);
  const [signature, setSignature] = useState('');
  const [filingId, setFilingId] = useState('');
  const [submittedAt, setSubmittedAt] = useState('');

  const handleState = (selectedState) => {
    setState(selectedState);
    setStep(2);
  };

  const handleAnswers = (data) => {
    const state = getState();

    const validationErrors = validateFilingData(data);
    if (validationErrors.length > 0) {
      alert('❌ Validation errors:\n' + validationErrors.join('\n'));
      return;
    }

    setAnswers(data);

    const refundEstimate = calculateRefund({
      state,
      filingStatus: data.filingStatus,
      income: data.income,
      dependents: data.dependents,
      age: data.age,
      tipIncome: data.tipIncome,
      overtimeIncome: data.overtimeIncome,
      saltPaid: data.saltPaid,
      assets: data.assets,
    });

    setRefund(refundEstimate);
    setStep(3);
  };

  const handleRefundReview = () => setStep(3.5);
  const handleWillComplete = () => setStep(3.6);

  const handleSignatureSubmit = (typedSignature) => {
    setSignature(typedSignature);
    setStep(5);
  };

  const handleFinalSubmit = async () => {
    try {
      const res = await fetch('/api/controllers/filingController', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ refund, signature }),
      });

      const result = await res.json();

      if (!res.ok) {
        throw new Error(result.error || 'Submission failed');
      }

      setFilingId(result.filingId);
      setSubmittedAt(result.submittedAt);
      setStep(6);
    } catch (err) {
      console.error('Submission error:', err);
      alert('❌ Filing failed: ' + err.message);
    }
  };

  return (
    <div className="wizard-flow">
      {step === 1 && <StateSelector onSelect={handleState} />}
      {step === 2 && <FilingQuestions onAnswers={handleAnswers} />}
      {step === 3 && refund && (
        <div className="refund-preview">
          <h2>Final Refund Estimate</h2>
          <ul>
            <li><strong>Base Refund:</strong> ${refund.baseRefund}</li>
            <li><strong>Dependent Bonus:</strong> ${refund.dependentBonus}</li>
            <li><strong>Income Adjustment:</strong> ${refund.incomeAdjustment}</li>
            <li><strong>State Adjustment:</strong> ${refund.stateAdjustment}</li>
            <li><strong>Filing Status Adjustment:</strong> ${refund.filingAdjustment}</li>
            <li><strong>Tip Deduction:</strong> ${refund.tipDeduction}</li>
            <li><strong>Overtime Deduction:</strong> ${refund.overtimeDeduction}</li>
            <li><strong>Senior Bonus:</strong> ${refund.seniorBonus}</li>
            <li><strong>SALT Adjustment:</strong> ${refund.saltAdjustment}</li>
            <li><strong>Bonus Depreciation:</strong> ${refund.bonusDepreciation}</li>
            <li><strong>State Credits:</strong>
              <ul>
                {refund.stateCredits.map((credit, i) => (
                  <li key={i}>{credit.type}: ${credit.amount}</li>
                ))}
              </ul>
            </li>
            <li><strong>Total Refund:</strong> ${refund.total}</li>
          </ul>
          <p><em>{refund.notes}</em></p>
          <button onClick={handleRefundReview}>Continue to Estate Planning →</button>
        </div>
      )}

      {step === 3.5 && <WillGenerator onNext={handleWillComplete} />}
      {step === 3.6 && <FinalWillPage onNext={() => setStep(4)} />}

      {step === 4 && (
        <SignatureStep
          onNext={() => handleSignatureSubmit(signature)}
          signature={signature}
          setSignature={setSignature}
        />
      )}

      {step === 5 && (
        <FinalReview
          refund={refund}
          signature={signature}
          onNext={handleFinalSubmit}
        />
      )}

      {step === 6 && (
        <FilingSuccess
          filingId={filingId}
          submittedAt={submittedAt}
        />
      )}
    </div>
  );
}