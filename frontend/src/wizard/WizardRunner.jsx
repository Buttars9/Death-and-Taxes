import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useStepNavigator } from '../hooks/useStepNavigator';
import steps from './wizardStep';
import { useWizardStore } from '../stores/wizardStore';

export default function WizardRunner() {
  const navigate = useNavigate();
  const { currentStep, nextStep, previousStep, resetSteps } = useStepNavigator(steps.length);

  const parsedFields = useWizardStore((s) => s.parsedFields);
  const answers = useWizardStore((s) => s.answers);
  const setAnswers = useWizardStore((s) => s.setAnswers);

  const initialData = React.useMemo(() => ({
    ...answers,
    incomeSources: answers.incomeSources || [],
  }), [answers]);

 const StepComponent = steps[currentStep - 1]?.component;

if (!StepComponent) {
  return <p>❌ Invalid step. Please restart the wizard.</p>;
}

console.log('WizardRunner rendering, currentStep:', currentStep, 'onBack:', currentStep > 1 ? previousStep : () => navigate('/dashboard'));

return (
  <div className="wizard-runner">
    <StepComponent
      stepIndex={currentStep}
      onNext={nextStep}
      onBack={currentStep > 1 ? previousStep : () => navigate('/dashboard')}
      onReset={resetSteps}
      parsedFields={parsedFields}
      answers={answers}
        setAnswers={setAnswers}
        initialData={initialData}
      />
    </div>
  );
}