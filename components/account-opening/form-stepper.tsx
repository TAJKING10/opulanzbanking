/**
 * FormStepper Component
 * Visual progress indicator for multi-step forms
 */

"use client";

import * as React from "react";
import { useTranslations } from "next-intl";
import { Check } from "lucide-react";
import { cn } from "@/lib/utils";

export interface Step {
  id: string;
  label: string;
  shortLabel?: string;
}

export interface FormStepperProps {
  steps: Step[];
  currentStep: number;
  className?: string;
}

export function FormStepper({ steps, currentStep, className }: FormStepperProps) {
  const t = useTranslations("common");
  return (
    <div className={cn("w-full", className)}>
      {/* Desktop View */}
      <div className="hidden md:block">
        <div className="flex items-center justify-between">
          {steps.map((step, index) => {
            const stepNumber = index + 1;
            const isCompleted = stepNumber < currentStep;
            const isCurrent = stepNumber === currentStep;
            const isUpcoming = stepNumber > currentStep;

            return (
              <React.Fragment key={step.id}>
                <div className="flex flex-col items-center gap-2">
                  {/* Step Circle */}
                  <div
                    className={cn(
                      "relative flex h-10 w-10 items-center justify-center rounded-full border-2 font-semibold transition-all",
                      {
                        "border-brand-gold bg-brand-gold text-white":
                          isCompleted,
                        "border-brand-gold bg-white text-brand-gold":
                          isCurrent,
                        "border-brand-grayLight bg-white text-brand-grayMed":
                          isUpcoming,
                      }
                    )}
                  >
                    {isCompleted ? (
                      <Check className="h-5 w-5" />
                    ) : (
                      <span>{stepNumber}</span>
                    )}
                  </div>

                  {/* Step Label */}
                  <div
                    className={cn(
                      "text-center text-sm font-medium transition-colors",
                      {
                        "text-brand-dark": isCompleted || isCurrent,
                        "text-brand-grayMed": isUpcoming,
                      }
                    )}
                  >
                    {step.label}
                  </div>
                </div>

                {/* Connector Line */}
                {index < steps.length - 1 && (
                  <div
                    className={cn(
                      "mx-2 h-0.5 flex-1 transition-colors",
                      {
                        "bg-brand-gold": stepNumber < currentStep,
                        "bg-brand-grayLight": stepNumber >= currentStep,
                      }
                    )}
                  />
                )}
              </React.Fragment>
            );
          })}
        </div>
      </div>

      {/* Mobile View */}
      <div className="md:hidden">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-brand-dark">
            {t("stepOf", { current: currentStep, total: steps.length })}
          </span>
          <span className="text-sm text-brand-grayMed">
            {steps[currentStep - 1].shortLabel || steps[currentStep - 1].label}
          </span>
        </div>

        {/* Progress Bar */}
        <div className="h-2 w-full overflow-hidden rounded-full bg-brand-grayLight">
          <div
            className="h-full bg-brand-gold transition-all duration-300"
            style={{ width: `${(currentStep / steps.length) * 100}%` }}
          />
        </div>
      </div>
    </div>
  );
}
