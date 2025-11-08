"use client";

import * as React from "react";
import { Check } from "lucide-react";
import { cn } from "@/lib/utils";

export interface Step {
  id: number;
  label: string;
  description?: string;
}

interface StepperProps {
  steps: Step[];
  currentStep: number;
  onStepClick?: (stepId: number) => void;
  allowNavigation?: boolean;
}

export function Stepper({ steps, currentStep, onStepClick, allowNavigation = true }: StepperProps) {
  const handleStepClick = (stepId: number) => {
    // Only allow going back to previous steps, not forward
    if (allowNavigation && stepId < currentStep && onStepClick) {
      onStepClick(stepId);
    }
  };

  return (
    <nav aria-label="Progress">
      <ol role="list" className="flex items-center justify-between">
        {steps.map((step, stepIdx) => {
          const isCompleted = currentStep > step.id;
          const isCurrent = currentStep === step.id;
          const canNavigate = allowNavigation && step.id < currentStep;

          return (
            <li
              key={step.id}
              className={cn(
                "relative flex flex-1 flex-col items-center",
                stepIdx !== steps.length - 1 && "pr-8 sm:pr-12"
              )}
            >
              {/* Connector line */}
              {stepIdx !== steps.length - 1 && (
                <div
                  className="absolute left-[calc(50%+1rem)] right-[-0.5rem] top-5 hidden h-0.5 sm:block"
                  aria-hidden="true"
                >
                  <div
                    className={cn(
                      "h-full transition-all duration-300",
                      isCompleted ? "bg-brand-gold" : "bg-gray-200"
                    )}
                  />
                </div>
              )}

              {/* Step circle */}
              <button
                type="button"
                onClick={() => handleStepClick(step.id)}
                disabled={!canNavigate}
                className={cn(
                  "relative z-10 flex h-10 w-10 items-center justify-center rounded-full border-2 transition-all duration-200",
                  isCompleted &&
                    "border-brand-gold bg-brand-gold text-white hover:bg-brand-goldDark",
                  isCurrent && "border-brand-gold bg-white text-brand-gold shadow-md",
                  !isCompleted && !isCurrent && "border-gray-300 bg-white text-gray-500",
                  canNavigate && "cursor-pointer hover:scale-110",
                  !canNavigate && "cursor-not-allowed"
                )}
                aria-current={isCurrent ? "step" : undefined}
              >
                {isCompleted ? (
                  <Check className="h-5 w-5" aria-hidden="true" />
                ) : (
                  <span className="text-sm font-semibold">{step.id}</span>
                )}
              </button>

              {/* Step label */}
              <div className="mt-3 text-center">
                <p
                  className={cn(
                    "text-sm font-medium transition-colors",
                    isCurrent && "text-brand-gold",
                    isCompleted && "text-brand-dark",
                    !isCompleted && !isCurrent && "text-gray-500"
                  )}
                >
                  {step.label}
                </p>
                {step.description && (
                  <p className="mt-1 hidden text-xs text-gray-500 sm:block">{step.description}</p>
                )}
              </div>
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
