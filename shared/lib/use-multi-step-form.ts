/**
 * Shared Multi-Step Form Hook
 * Centralized stepper state management and validation
 */

import * as React from "react";

export interface Step {
  id: string;
  label: string;
  shortLabel?: string;
}

export interface UseMultiStepFormOptions<TFormData = any> {
  steps: Step[];
  initialStep?: number;
  onStepChange?: (step: number) => void;
  onComplete?: (data: TFormData) => void | Promise<void>;
}

export interface MultiStepFormState<TFormData = any> {
  currentStep: number;
  formData: Partial<TFormData>;
  isSubmitting: boolean;
}

export interface MultiStepFormActions<TFormData = any> {
  nextStep: () => void;
  prevStep: () => void;
  goToStep: (step: number) => void;
  updateFormData: (data: Partial<TFormData>) => void;
  setFormData: (data: Partial<TFormData>) => void;
  setIsSubmitting: (isSubmitting: boolean) => void;
  reset: () => void;
  canGoBack: boolean;
  canGoNext: boolean;
  isFirstStep: boolean;
  isLastStep: boolean;
  progress: number;
}

export function useMultiStepForm<TFormData = any>({
  steps,
  initialStep = 1,
  onStepChange,
  onComplete,
}: UseMultiStepFormOptions<TFormData>) {
  const [currentStep, setCurrentStep] = React.useState(initialStep);
  const [formData, setFormData] = React.useState<Partial<TFormData>>({});
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  const totalSteps = steps.length;
  const isFirstStep = currentStep === 1;
  const isLastStep = currentStep === totalSteps;
  const canGoBack = currentStep > 1;
  const canGoNext = currentStep < totalSteps;
  const progress = (currentStep / totalSteps) * 100;

  const goToStep = React.useCallback(
    (step: number) => {
      if (step < 1 || step > totalSteps) return;
      
      setCurrentStep(step);
      window.scrollTo({ top: 0, behavior: "smooth" });
      onStepChange?.(step);
    },
    [totalSteps, onStepChange]
  );

  const nextStep = React.useCallback(() => {
    if (canGoNext) {
      goToStep(currentStep + 1);
    }
  }, [currentStep, canGoNext, goToStep]);

  const prevStep = React.useCallback(() => {
    if (canGoBack) {
      goToStep(currentStep - 1);
    }
  }, [currentStep, canGoBack, goToStep]);

  const updateFormData = React.useCallback((data: Partial<TFormData>) => {
    setFormData((prev) => ({ ...prev, ...data }));
  }, []);

  const reset = React.useCallback(() => {
    setCurrentStep(initialStep);
    setFormData({});
    setIsSubmitting(false);
  }, [initialStep]);

  // Scroll to top on step change
  React.useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [currentStep]);

  const state: MultiStepFormState<TFormData> = {
    currentStep,
    formData,
    isSubmitting,
  };

  const actions: MultiStepFormActions<TFormData> = {
    nextStep,
    prevStep,
    goToStep,
    updateFormData,
    setFormData,
    setIsSubmitting,
    reset,
    canGoBack,
    canGoNext,
    isFirstStep,
    isLastStep,
    progress,
  };

  return [state, actions] as const;
}
