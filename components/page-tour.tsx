"use client";

import * as React from "react";
import { driver } from "driver.js";
import "driver.js/dist/driver.css";
import { HelpCircle } from "lucide-react";
import { getGuidanceContent, tourUI } from "@/lib/guidance-translations";

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
  locale?: string;
}

export function PageTour({ pageKey, steps: stepsProp, locale }: PageTourProps) {
  const storageKey = `tour-v1-${pageKey}`;
  const [mounted, setMounted] = React.useState(false);
  const ui = tourUI[locale === "fr" ? "fr" : "en"];

  // Use translated steps when available
  const translated = locale ? getGuidanceContent(locale, pageKey) : null;
  const steps: TourStep[] = React.useMemo(() => {
    if (translated?.steps?.length) {
      return translated.steps.map((s) => ({
        element: s.element ?? s.target,
        title: s.title ?? "",
        description: s.content ?? s.description ?? "",
        side: s.side,
        align: s.align,
      }));
    }
    return stepsProp;
  }, [translated, stepsProp]); // eslint-disable-line react-hooks/exhaustive-deps

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
      nextBtnText: ui.next.replace("→", "&rarr;").replace("←", "&larr;"),
      prevBtnText: ui.prev.replace("→", "&rarr;").replace("←", "&larr;"),
      doneBtnText: ui.done.replace("✓", "&#10003;"),
      progressText: ui.progress,
      steps: mappedSteps,
      onDestroyed: () => {
        localStorage.setItem(storageKey, "1");
      },
    });

    d.drive();
  }, [steps, storageKey, ui]);

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
