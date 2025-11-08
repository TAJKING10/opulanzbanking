"use client";

import * as React from "react";
import { Stepper, Step } from "./stepper";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";

interface AccountOpeningLayoutProps {
  children: React.ReactNode;
  steps: Step[];
  currentStep: number;
  onStepChange: (stepId: number) => void;
  onNext?: () => void;
  onBack?: () => void;
  canGoNext?: boolean;
  canGoBack?: boolean;
  isLoading?: boolean;
  title: string;
  description?: string;
  hideNavigation?: boolean;
}

export function AccountOpeningLayout({
  children,
  steps,
  currentStep,
  onStepChange,
  onNext,
  onBack,
  canGoNext = true,
  canGoBack = true,
  isLoading = false,
  title,
  description,
  hideNavigation = false,
}: AccountOpeningLayoutProps) {
  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="container mx-auto max-w-4xl px-6">
        {/* Header */}
        <div className="mb-8 text-center">
          <h1 className="mb-2 text-3xl font-bold text-brand-dark md:text-4xl">{title}</h1>
          {description && <p className="text-lg text-brand-grayMed">{description}</p>}
        </div>

        {/* Stepper */}
        <div className="mb-12">
          <Stepper steps={steps} currentStep={currentStep} onStepClick={onStepChange} />
        </div>

        {/* Content */}
        <div className="rounded-2xl border border-brand-grayLight/30 bg-white p-8 shadow-sm md:p-12">
          {children}
        </div>

        {/* Navigation Buttons - Hidden on submission step */}
        {!hideNavigation && (
          <>
            <div className="mt-8 rounded-lg border-4 border-red-500 bg-yellow-100 p-6">
              <p className="mb-4 text-center font-bold text-red-600">
                DEBUG: canGoNext={String(canGoNext)} | canGoBack={String(canGoBack)} | hideNav={String(hideNavigation)}
              </p>
              <div className="flex items-center justify-between">
                <Button
                  type="button"
                  variant="outline"
                  onClick={onBack}
                  disabled={!canGoBack || isLoading}
                  className="min-w-32"
                >
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Back
                </Button>

                <Button
                  type="button"
                  onClick={onNext}
                  disabled={!canGoNext || isLoading}
                  className="min-w-32 bg-brand-gold text-white hover:bg-brand-goldDark disabled:bg-gray-400"
                >
                  {isLoading ? (
                    "Processing..."
                  ) : (
                    <>
                      Continue
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </>
                  )}
                </Button>
              </div>
            </div>

            {/* Progress saved indicator */}
            <div className="mt-6 text-center">
              <p className="text-sm text-brand-grayMed">
                Your progress is automatically saved. You can return anytime to complete your application.
              </p>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
