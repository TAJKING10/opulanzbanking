"use client";

import * as React from "react";
import { useTranslations } from "next-intl";
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
  const t = useTranslations("common");
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
            <div className="mt-8 flex items-center justify-between gap-4">
              <Button
                type="button"
                variant="outline"
                onClick={onBack}
                disabled={!canGoBack || isLoading}
                className="min-w-32 border-brand-grayLight text-brand-dark hover:bg-brand-grayLight/10"
              >
                <ArrowLeft className="mr-2 h-4 w-4" />
                {t("back")}
              </Button>

              <Button
                type="button"
                onClick={onNext}
                disabled={!canGoNext || isLoading}
                className="min-w-32 bg-brand-gold text-white hover:bg-brand-goldDark disabled:bg-gray-400 disabled:opacity-50"
              >
                {isLoading ? (
                  t("loading")
                ) : (
                  <>
                    {t("continue")}
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </>
                )}
              </Button>
            </div>

            {/* Progress saved indicator */}
            <div className="mt-6 text-center">
              <p className="text-sm text-brand-grayMed">
                {t("progressSaved")}
              </p>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
