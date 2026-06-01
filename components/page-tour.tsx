"use client";

import * as React from "react";
import { driver } from "driver.js";
import "driver.js/dist/driver.css";
import { HelpCircle } from "lucide-react";

export interface TourStep {
  element?: string; // CSS selector — omit for a centered intro step
  title: string;
  description: string;
  side?: "top" | "bottom" | "left" | "right" | "over";
  align?: "start" | "center" | "end";
}

interface PageTourProps {
  pageKey: string;
  steps: TourStep[];
}

export function PageTour({ pageKey, steps }: PageTourProps) {
  const storageKey = `tour-v1-${pageKey}`;
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  const startTour = React.useCallback(() => {
    // Map steps, falling back to centered popover if element not found
    const mappedSteps = steps.map((step) => {
      const found = step.element ? !!document.querySelector(step.element) : false;
      return {
        element: found ? step.element : undefined,
        popover: {
          title: `<span style="color:#b59354">◆</span> ${step.title}`,
          description: step.description,
          side: step.side ?? "bottom",
          align: step.align ?? "start",
        },
      };
    });

    const d = driver({
      showProgress: true,
      animate: true,
      allowClose: true,
      overlayColor: "rgba(0,0,0,0.45)",
      smoothScroll: true,
      popoverClass: "opulanz-tour",
      nextBtnText: "Next &rarr;",
      prevBtnText: "&larr; Back",
      doneBtnText: "&#10003; Done",
      progressText: "Step {{current}} of {{total}}",
      steps: mappedSteps,
      onDestroyed: () => {
        localStorage.setItem(storageKey, "1");
      },
    });

    d.drive();
  }, [steps, storageKey]);

  // Auto-start on first visit
  React.useEffect(() => {
    if (!mounted) return;
    if (!localStorage.getItem(storageKey)) {
      const t = setTimeout(startTour, 900);
      return () => clearTimeout(t);
    }
  }, [mounted, startTour, storageKey]);

  if (!mounted) return null;

  return (
    <button
      onClick={startTour}
      title="Take a guided tour of this page"
      className="fixed bottom-6 left-6 z-[9999] flex h-12 w-12 items-center justify-center rounded-full bg-[#b59354] text-white shadow-xl ring-4 ring-[#b59354]/25 transition-all duration-200 hover:scale-110 hover:bg-[#886844] active:scale-95"
      aria-label="Start page tour"
    >
      <HelpCircle className="h-5 w-5" />
    </button>
  );
}
