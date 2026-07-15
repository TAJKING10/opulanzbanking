"use client";

import * as React from "react";
import { CheckCircle, Clock, Circle } from "lucide-react";

const STAGES = [
  { label: "Request completed", done: true },
  { label: "Information under review", done: true },
  { label: "Appointment scheduled", done: true },
  { label: "Consultation completed", done: false },
  { label: "Suitability report being prepared", done: false },
  { label: "Report ready for review", done: false },
  { label: "Signature pending", done: false },
  { label: "Completed", done: false },
];

export function IATTimeline() {
  return (
    <div className="space-y-4">
      <div className="rounded-xl bg-amber-50 border border-amber-200 px-4 py-3 text-xs text-amber-800">
        Prototype status — no real advisory case has been created.
      </div>

      <div className="relative">
        <div className="absolute left-5 top-0 bottom-0 w-0.5 bg-brand-grayLight" aria-hidden="true" />
        <ol className="space-y-1">
          {STAGES.map((stage, i) => (
            <li key={i} className="relative flex items-start gap-4 pl-12 py-3">
              <div className={`absolute left-3 top-3.5 flex h-5 w-5 items-center justify-center rounded-full border-2 transition-colors ${
                stage.done
                  ? "border-brand-gold bg-brand-gold"
                  : i === STAGES.findIndex((s) => !s.done)
                  ? "border-brand-gold bg-white"
                  : "border-gray-200 bg-white"
              }`}>
                {stage.done ? (
                  <CheckCircle className="h-3 w-3 text-white" />
                ) : i === STAGES.findIndex((s) => !s.done) ? (
                  <Clock className="h-3 w-3 text-brand-gold" />
                ) : (
                  <Circle className="h-3 w-3 text-gray-300" />
                )}
              </div>
              <div>
                <p className={`text-sm font-medium ${
                  stage.done ? "text-brand-dark" : "text-brand-grayMed"
                }`}>
                  {stage.label}
                </p>
                {stage.done && (
                  <p className="text-xs text-brand-gold">Completed (prototype)</p>
                )}
                {!stage.done && i === STAGES.findIndex((s) => !s.done) && (
                  <p className="text-xs text-brand-grayMed">Pending in prototype</p>
                )}
              </div>
            </li>
          ))}
        </ol>
      </div>
    </div>
  );
}
