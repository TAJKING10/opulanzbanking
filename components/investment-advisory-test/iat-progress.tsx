"use client";
import * as React from "react";
import { CheckCircle } from "lucide-react";

interface Props {
  step: number;       // 1-based current step
  totalSteps: number;
  labels: string[];
}

export function IATProgress({ step, totalSteps, labels }: Props) {
  return (
    <>
      {/* Desktop */}
      <div className="hidden md:flex items-center gap-0 w-full overflow-x-auto pb-2">
        {labels.map((label, i) => {
          const num = i + 1;
          const done = num < step;
          const active = num === step;
          return (
            <React.Fragment key={num}>
              <div className="flex flex-col items-center flex-shrink-0" style={{ minWidth: 72 }}>
                <div
                  className={`flex h-8 w-8 items-center justify-center rounded-full border-2 text-xs font-bold transition-all ${
                    done
                      ? "border-brand-gold bg-brand-gold text-white"
                      : active
                      ? "border-brand-gold bg-white text-brand-gold"
                      : "border-gray-200 bg-white text-gray-400"
                  }`}
                >
                  {done ? <CheckCircle className="h-4 w-4" /> : num}
                </div>
                <span
                  className={`mt-1 text-center text-[9px] leading-tight max-w-[68px] ${
                    active ? "text-brand-gold font-semibold" : done ? "text-brand-dark" : "text-gray-400"
                  }`}
                >
                  {label}
                </span>
              </div>
              {i < totalSteps - 1 && (
                <div
                  className={`h-0.5 flex-1 mx-1 transition-colors ${
                    done ? "bg-brand-gold" : "bg-gray-200"
                  }`}
                />
              )}
            </React.Fragment>
          );
        })}
      </div>

      {/* Mobile */}
      <div className="md:hidden">
        <div className="flex items-center gap-1.5 mb-2">
          {labels.map((_, i) => {
            const num = i + 1;
            return (
              <div
                key={num}
                className={`h-1.5 flex-1 rounded-full transition-colors ${
                  num < step ? "bg-brand-gold" : num === step ? "bg-brand-gold/60" : "bg-gray-200"
                }`}
              />
            );
          })}
        </div>
        <p className="text-xs text-brand-grayMed">
          Étape <span className="font-bold text-brand-dark">{step}</span> sur{" "}
          <span className="font-bold text-brand-dark">{totalSteps}</span> —{" "}
          <span className="text-brand-gold font-semibold">{labels[step - 1]}</span>
        </p>
      </div>
    </>
  );
}
