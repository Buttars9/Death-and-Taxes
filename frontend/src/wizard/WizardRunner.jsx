import React, { useEffect, Component } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useStepNavigator } from '../hooks/useStepNavigator';
import steps from './wizardStep';
import { useWizardStore } from '../stores/wizardStore';
import { calculateRefund } from '../shared/utils/calculateRefund'; // ✅ correct path


// Error boundary to catch render errors
class ErrorBoundary extends Component {
  state = { hasError: false, error: null };

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{ color: '#ff6666', padding: '2rem' }}>
          <h2>Error in Wizard</h2>
          <p>{this.state.error?.message || 'An unexpected error occurred.'}</p>
          <p>Please try refreshing the page or contact support.</p>
        </div>
      );
    }
    return this.props.children;
  }
}

export default function WizardRunner() {
  const navigate = useNavigate();
  const location = useLocation();
  const { currentStep, nextStep, resetSteps, prevStep, setCurrentStep } = useStepNavigator(steps.length);  // Added setCurrentStep

  const parsedFields = useWizardStore((s) => s.parsedFields);
  const answers = useWizardStore((s) => s.answers);
  const setAnswers = useWizardStore((s) => s.setAnswers);

  useEffect(() => {
    if (answers && typeof answers === 'object' && !Array.isArray(answers)) {
      if (!answers.scopes?.includes('payments')) {
        setAnswers({
          ...answers,
          scopes: [...(answers.scopes || []), 'payments'],
        });
      }
    }
  }, []);

  const initialData = React.useMemo(() => ({
    ...answers,
    incomeSources: answers.incomeSources || [],
  }), [answers]);

  useEffect(() => {
    const pathParts = location.pathname.split('/');
    const urlStepKey = pathParts[pathParts.length - 1];
    const expectedStepKey = steps[currentStep - 1]?.key;
    const isBackNavigation = location.state?.fromBack || location.state?.fromAudit;

    if (urlStepKey !== expectedStepKey && !isBackNavigation) {
      console.log('Syncing navigation:', { currentStep, expectedStepKey, currentPath: location.pathname });
      const urlStepIndex = steps.findIndex((s) => s.key === urlStepKey);
      if (urlStepIndex !== -1) {
        setCurrentStep(urlStepIndex + 1);  // Sync internal to URL for jumps (e.g., from "Fix")
      } else {
        navigate(`/filing/${expectedStepKey}`, { replace: true, state: { refresh: true } });  // Fallback for invalid URL
      }
    }
  }, [currentStep, location, navigate, setCurrentStep]);

  const StepComponent = steps[currentStep - 1]?.component;

  const resolveNextStepKey = () => {
    const current = steps[currentStep - 1];
    if (!current) return null;
    return typeof current.next === 'function' ? current.next(answers) : current.next;
  };

  const handleNext = () => {
    const current = steps[currentStep - 1];
    if (typeof current.next === 'function') {
      const nextKey = current.next(answers);
      const nextIndex = steps.findIndex((s) => s.key === nextKey);
      if (nextIndex !== -1) {
        nextStep(); // advance internal tracker
        navigate(`/filing/${nextKey}`, { replace: true, state: { refresh: true } });
      }
    } else {
      nextStep(); // fallback for normal steps
    }

    // Added: Run calculations and save to store after next
    const refundParams = { /* ... from fields in RefundEstimate */ };
    const summary = calculateRefund(refundParams);
    setAnswers({ ...answers, deductionAmount: summary.deductionAmount, taxableIncome: summary.taxableIncome });
  };

  if (!StepComponent) {
    return <p>❌ Invalid step. Please restart the wizard.</p>;
  }

  return (
    <ErrorBoundary>
      <div className="wizard-runner">
        <StepComponent
          stepIndex={currentStep}
          onNext={handleNext}
          onBack={currentStep > 1 ? () => {
            console.log('Navigating back to:', steps[currentStep - 2].key);
            prevStep();
            navigate(`/filing/${steps[currentStep - 2].key}`, { replace: true, state: { fromBack: true, refresh: true } });
          } : () => {
            console.log('Navigating back to dashboard');
            navigate('/dashboard', { replace: true, state: { refresh: true } });
          }}
          onReset={resetSteps}
          parsedFields={parsedFields}
          answers={answers}
          setAnswers={setAnswers}
          initialData={initialData}
        />
      </div>
    </ErrorBoundary>
  );
}