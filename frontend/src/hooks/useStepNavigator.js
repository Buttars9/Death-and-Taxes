import { useState } from 'react';

/**
 * Hook for managing managing step-based navigation in guided flows.
 * Supports next/prev/reset logic with maxStep constraint.
 */

export function useStepNavigator(maxStep = 4) {
  const [currentStep, setCurrentStep] = useState(1);

  const nextStep = () => {
    setCurrentStep((prev) => Math.min(prev + 1, maxStep));
  };

  const prevStep = () => {
    setCurrentStep((prev) => Math.max(prev - 1, 1));
  };

  const resetSteps = () => {
    setCurrentStep(1);
  };

  return {
    currentStep,
    nextStep,
    prevStep,
    resetSteps,
    setCurrentStep,  // Added to allow direct step jumps (e.g., from audit "Fix")
  };
}