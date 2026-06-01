"use client";

import * as React from "react";
import { X, HelpCircle, Lightbulb } from "lucide-react";

interface PageGuidanceProps {
  pageKey: string;
  title: string;
  description: string;
  steps: string[];
  tip?: string;
}

export function PageGuidance({ pageKey, title, description, steps, tip }: PageGuidanceProps) {
  const storageKey = `guidance-${pageKey}`;
  const [isOpen, setIsOpen] = React.useState(false);
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => {
    setMounted(true);
    const dismissed = localStorage.getItem(storageKey);
    if (!dismissed) {
      setIsOpen(true);
    }
  }, [storageKey]);

  function close() {
    localStorage.setItem(storageKey, "1");
    setIsOpen(false);
  }

  function toggle() {
    setIsOpen((prev) => !prev);
  }

  if (!mounted) return null;

  return (
    <div className="fixed bottom-6 left-6 z-50 flex flex-col items-start gap-3">
      {isOpen && (
        <div className="w-80 rounded-2xl bg-white shadow-2xl border border-gray-100 overflow-hidden animate-in slide-in-from-bottom-4 duration-300">
          {/* Header */}
          <div className="bg-gradient-to-r from-[#b59354] to-[#886844] px-5 py-4 flex items-center justify-between">
            <div className="flex items-center gap-2 text-white">
              <Lightbulb className="h-4 w-4 flex-shrink-0" />
              <h3 className="font-semibold text-sm">{title}</h3>
            </div>
            <button
              onClick={close}
              className="text-white/70 hover:text-white transition-colors p-0.5 rounded"
              aria-label="Dismiss guidance"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          {/* Body */}
          <div className="px-5 py-4">
            <p className="text-gray-500 text-sm mb-4">{description}</p>
            <ol className="space-y-2.5">
              {steps.map((step, i) => (
                <li key={i} className="flex items-start gap-3">
                  <span className="flex-shrink-0 w-5 h-5 rounded-full bg-[#b59354]/15 text-[#886844] text-xs font-bold flex items-center justify-center mt-0.5">
                    {i + 1}
                  </span>
                  <span className="text-sm text-gray-700 leading-snug">{step}</span>
                </li>
              ))}
            </ol>

            {tip && (
              <div className="mt-4 flex items-start gap-2 p-3 bg-amber-50 rounded-xl border border-amber-100">
                <span className="text-amber-500 text-sm flex-shrink-0 mt-0.5">💡</span>
                <p className="text-xs text-amber-800 leading-relaxed">{tip}</p>
              </div>
            )}

            <button
              onClick={close}
              className="mt-4 w-full text-center text-xs text-gray-400 hover:text-gray-600 transition-colors py-1"
            >
              Got it, don't show again
            </button>
          </div>
        </div>
      )}

      {/* Floating toggle button */}
      <button
        onClick={toggle}
        title="Page guidance"
        className={`w-12 h-12 rounded-full shadow-lg flex items-center justify-center transition-all duration-200 hover:scale-110 ${
          isOpen
            ? "bg-gray-200 text-gray-600 hover:bg-gray-300"
            : "bg-[#b59354] text-white hover:bg-[#886844]"
        }`}
        aria-label="Toggle page guidance"
      >
        {isOpen ? <X className="h-5 w-5" /> : <HelpCircle className="h-5 w-5" />}
      </button>
    </div>
  );
}
