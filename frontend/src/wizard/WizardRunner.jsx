import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useStepNavigator } from '../hooks/useStepNavigator';
import wizardSteps from './wizardSteps'; // Assuming this file defines the steps array
import { useWizardStore } from '../stores/wizardStore';

export default function WizardRunner() {
  const navigate = useNavigate();
  const location = useLocation();
  const { currentStep, nextStep, previousStep, resetSteps, setCurrentStep } = useStepNavigator(wizardSteps.length);
  const parsedFields = useWizardStore((s) => s.parsedFields);
  const answers = useWizardStore((s) => s.answers);
  const setAnswers = useWizardStore((s) => s.setAnswers);

  // Sync URL with step (e.g., /filing/step/2 for IncomeStep)
  React.useEffect(() => {
    const stepPath = location.pathname.split('/').pop();
    const stepNum = parseInt(stepPath) || 1;
    if (stepNum !== currentStep) {
      setCurrentStep(stepNum);
    }
  }, [location.pathname, currentStep, setCurrentStep]);

  const initialData = React.useMemo(() => ({
    ...answers,
    incomeSources: answers.incomeSources || [],
  }), [answers]);

  const handleBack = React.useCallback(() => {
    if (currentStep > 1) {
      previousStep(); // Updates internal step state
      if (currentStep === 2) {
        navigate('/filing/personal'); // Direct to PersonalInfoStep
      } else {
        navigate(`/filing/step/${currentStep - 1}`);
      }
    } else {
      navigate('/dashboard');
    }
  }, [currentStep, previousStep, navigate]);

  const StepComponent = wizardSteps[currentStep - 1]?.component;
  if (!StepComponent) {
    return <div>❌ Invalid step. Please restart the wizard.</div>;
  }

  console.log('WizardRunner rendering, currentStep:', currentStep, 'onBack:', handleBack);

  return (
    <StepComponent
      userId={parsedFields.userId}
      initialData={initialData}
      onNext={nextStep}
      onBack={handleBack}
      onReset={resetSteps}
      parsedFields={parsedFields}
      answers={answers}
      setAnswers={setAnswers}
    />
  );
}