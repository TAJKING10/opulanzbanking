"use client";

import * as React from "react";
import { createPortal } from "react-dom";
import {
  X,
  ChevronRight,
  ChevronLeft,
  HelpCircle,
  Sparkles,
  ArrowRight,
} from "lucide-react";
import { getGuidanceContent, guidanceUI } from "@/lib/guidance-translations";

// ─── Types ───────────────────────────────────────────────────────────────────

export type TourStep =
  | string
  | {
      title?: string;
      content: string;
      target?: string;
      position?: "top" | "bottom" | "left" | "right";
    };

interface PageGuidanceProps {
  pageKey: string;
  title: string;
  description?: string;
  steps: TourStep[];
  tip?: string;
  locale?: string;
}

interface NormalizedStep {
  title?: string;
  content: string;
  target?: string;
  position?: "top" | "bottom" | "left" | "right";
}

interface Placement {
  top: number;
  left: number;
  arrow: "top" | "bottom" | "left" | "right" | "none";
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

const TW = 340;
const TH = 260;

function normalize(s: TourStep): NormalizedStep {
  return typeof s === "string" ? { content: s } : s;
}

function clamp(v: number, lo: number, hi: number) {
  return Math.max(lo, Math.min(v, hi));
}

function getPlacement(rect: DOMRect, preferred?: "top" | "bottom" | "left" | "right"): Placement {
  const vw = window.innerWidth;
  const vh = window.innerHeight;
  const cx = rect.left + rect.width / 2;
  const cy = rect.top + rect.height / 2;
  const GAP = 18;

  const candidates: ("bottom" | "top" | "right" | "left")[] = preferred
    ? [preferred, "bottom", "top", "right", "left"]
    : ["bottom", "top", "right", "left"];

  for (const dir of candidates) {
    if (dir === "bottom" && rect.bottom + GAP + TH < vh) {
      return { top: rect.bottom + GAP, left: clamp(cx - TW / 2, 16, vw - TW - 16), arrow: "top" };
    }
    if (dir === "top" && rect.top - GAP - TH > 0) {
      return { top: rect.top - GAP - TH, left: clamp(cx - TW / 2, 16, vw - TW - 16), arrow: "bottom" };
    }
    if (dir === "right" && rect.right + GAP + TW < vw) {
      return { top: clamp(cy - TH / 2, 16, vh - TH - 16), left: rect.right + GAP, arrow: "left" };
    }
    if (dir === "left" && rect.left - GAP - TW > 0) {
      return { top: clamp(cy - TH / 2, 16, vh - TH - 16), left: rect.left - GAP - TW, arrow: "right" };
    }
  }

  return { top: vh / 2 - TH / 2, left: vw / 2 - TW / 2, arrow: "none" };
}

// ─── Arrow ───────────────────────────────────────────────────────────────────

function TooltipArrow({ dir }: { dir: Placement["arrow"] }) {
  if (dir === "none") return null;
  const s: React.CSSProperties = { position: "absolute", width: 0, height: 0, pointerEvents: "none" };
  const t = "11px solid transparent";
  const c = "#1c1c1c";
  if (dir === "top")
    return <div style={{ ...s, top: -11, left: "50%", transform: "translateX(-50%)", borderLeft: t, borderRight: t, borderBottom: `11px solid ${c}` }} />;
  if (dir === "bottom")
    return <div style={{ ...s, bottom: -11, left: "50%", transform: "translateX(-50%)", borderLeft: t, borderRight: t, borderTop: `11px solid ${c}` }} />;
  if (dir === "left")
    return <div style={{ ...s, left: -11, top: "50%", transform: "translateY(-50%)", borderTop: t, borderBottom: t, borderRight: `11px solid ${c}` }} />;
  if (dir === "right")
    return <div style={{ ...s, right: -11, top: "50%", transform: "translateY(-50%)", borderTop: t, borderBottom: t, borderLeft: `11px solid ${c}` }} />;
  return null;
}

// ─── Tour Overlay ─────────────────────────────────────────────────────────────

function TourOverlay({
  title,
  description,
  tip,
  steps,
  idx,
  onNext,
  onPrev,
  onClose,
  ui,
}: {
  title: string;
  description?: string;
  tip?: string;
  steps: NormalizedStep[];
  idx: number;
  onNext: () => void;
  onPrev: () => void;
  onClose: () => void;
  ui: typeof guidanceUI["en"];
}) {
  const step = steps[idx];
  const isFirst = idx === 0;
  const isLast = idx === steps.length - 1;
  const hasTarget = Boolean(step.target);

  const [place, setPlace] = React.useState<Placement | null>(null);
  const [show, setShow] = React.useState(false);

  // Keep track of the currently elevated element so we can restore it
  const elevatedRef = React.useRef<HTMLElement | null>(null);
  const savedStylesRef = React.useRef<{ position: string; zIndex: string; outline: string; borderRadius: string } | null>(null);

  // Restore previously elevated element
  function restoreElement() {
    const el = elevatedRef.current;
    const saved = savedStylesRef.current;
    if (el && saved) {
      el.style.position = saved.position;
      el.style.zIndex = saved.zIndex;
      el.style.outline = saved.outline;
      el.style.borderRadius = saved.borderRadius;
      el.style.transition = "";
    }
    elevatedRef.current = null;
    savedStylesRef.current = null;
  }

  React.useEffect(() => {
    setShow(false);
    setPlace(null);
    restoreElement();

    if (!step.target) {
      const t = setTimeout(() => setShow(true), 80);
      return () => { clearTimeout(t); restoreElement(); };
    }

    const el = document.querySelector(step.target) as HTMLElement | null;
    if (!el) {
      const t = setTimeout(() => setShow(true), 80);
      return () => { clearTimeout(t); restoreElement(); };
    }

    el.scrollIntoView({ behavior: "smooth", block: "center" });

    const t = setTimeout(() => {
      const rect = el.getBoundingClientRect();

      // Save and elevate the element above the dark overlay
      savedStylesRef.current = {
        position: el.style.position,
        zIndex: el.style.zIndex,
        outline: el.style.outline,
        borderRadius: el.style.borderRadius,
      };
      elevatedRef.current = el;

      el.style.position = "relative";
      el.style.zIndex = "9999";
      el.style.outline = "2.5px solid #b59354";
      el.style.borderRadius = "10px";
      el.style.transition = "outline 0.2s ease";

      setPlace(getPlacement(rect, step.position));
      setShow(true);
    }, 420);

    return () => {
      clearTimeout(t);
      restoreElement();
    };
  }, [idx]); // eslint-disable-line react-hooks/exhaustive-deps

  // Restore on unmount
  React.useEffect(() => {
    return () => restoreElement();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const cardStyle: React.CSSProperties = hasTarget && place
    ? {
        position: "fixed",
        top: place.top,
        left: place.left,
        width: TW,
        zIndex: 10000,
        opacity: show ? 1 : 0,
        transform: show ? "scale(1)" : "scale(0.94)",
        transition: "opacity 0.22s ease, transform 0.22s ease",
      }
    : {
        position: "fixed",
        top: "50%",
        left: "50%",
        width: TW,
        zIndex: 10000,
        opacity: show ? 1 : 0,
        transform: show ? "translate(-50%,-50%) scale(1)" : "translate(-50%,-50%) scale(0.94)",
        transition: "opacity 0.22s ease, transform 0.22s ease",
      };

  return (
    <>
      {/* Full-screen dark backdrop — always shown, target element is elevated above it */}
      <div
        onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
        style={{
          position: "fixed",
          inset: 0,
          background: "rgba(0,0,0,0.72)",
          zIndex: 9998,
          opacity: show ? 1 : 0,
          transition: "opacity 0.22s ease",
        }}
      />

      {/* Tooltip card */}
      <div style={cardStyle}>
        <div
          style={{
            background: "#1c1c1c",
            borderRadius: 14,
            border: "1px solid rgba(181,147,84,0.3)",
            boxShadow: "0 28px 72px rgba(0,0,0,0.7), 0 0 0 1px rgba(255,255,255,0.04)",
            overflow: "visible",
            position: "relative",
          }}
        >
          <TooltipArrow dir={hasTarget && place ? place.arrow : "none"} />

          {/* Gold header */}
          <div
            style={{
              background: "linear-gradient(135deg, #b59354 0%, #886844 100%)",
              padding: "13px 18px 13px 16px",
              borderRadius: "14px 14px 0 0",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 7 }}>
              <Sparkles style={{ width: 14, height: 14, color: "rgba(255,255,255,0.8)", flexShrink: 0 }} />
              <span style={{ color: "white", fontWeight: 700, fontSize: 12.5, letterSpacing: "0.025em" }}>
                {isFirst && !hasTarget ? title : step.title ?? `Step ${idx + 1} of ${steps.length}`}
              </span>
            </div>
            {/* Progress pills */}
            <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
              {steps.map((_, i) => (
                <div
                  key={i}
                  style={{
                    width: i === idx ? 18 : 6,
                    height: 6,
                    borderRadius: 99,
                    background: i === idx ? "rgba(255,255,255,0.95)" : "rgba(255,255,255,0.3)",
                    transition: "all 0.3s ease",
                  }}
                />
              ))}
            </div>
          </div>

          {/* Body */}
          <div style={{ padding: "16px 18px 18px" }}>
            {isFirst && !hasTarget && description && (
              <p style={{ color: "rgba(255,255,255,0.45)", fontSize: 12, marginBottom: 12, lineHeight: 1.65, margin: "0 0 12px" }}>
                {description}
              </p>
            )}

            <p style={{ color: "rgba(255,255,255,0.88)", fontSize: 13.5, lineHeight: 1.65, margin: 0 }}>
              {step.content}
            </p>

            {isLast && tip && (
              <div
                style={{
                  marginTop: 13,
                  padding: "9px 11px",
                  background: "rgba(181,147,84,0.1)",
                  borderRadius: 8,
                  border: "1px solid rgba(181,147,84,0.22)",
                  display: "flex",
                  gap: 7,
                }}
              >
                <span style={{ fontSize: 12, flexShrink: 0 }}>💡</span>
                <p style={{ color: "rgba(181,147,84,0.85)", fontSize: 11.5, lineHeight: 1.55, margin: 0 }}>
                  {tip}
                </p>
              </div>
            )}

            {/* Nav row */}
            <div style={{ marginTop: 16, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <button
                onClick={onPrev}
                disabled={isFirst}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 3,
                  background: "transparent",
                  border: "none",
                  cursor: isFirst ? "default" : "pointer",
                  color: isFirst ? "rgba(255,255,255,0.18)" : "rgba(255,255,255,0.5)",
                  fontSize: 12.5,
                  fontWeight: 600,
                  padding: "5px 2px",
                }}
              >
                <ChevronLeft style={{ width: 14, height: 14 }} />
                {ui.back}
              </button>

              <button
                onClick={onClose}
                style={{
                  background: "transparent",
                  border: "none",
                  cursor: "pointer",
                  color: "rgba(255,255,255,0.22)",
                  fontSize: 11,
                  padding: "4px 8px",
                  borderRadius: 5,
                }}
              >
                {ui.skip}
              </button>

              <button
                onClick={onNext}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 5,
                  background: "linear-gradient(135deg, #b59354, #886844)",
                  border: "none",
                  cursor: "pointer",
                  color: "white",
                  fontSize: 12.5,
                  fontWeight: 700,
                  padding: "8px 15px",
                  borderRadius: 8,
                  boxShadow: "0 3px 10px rgba(181,147,84,0.4)",
                }}
              >
                {isLast ? (
                  <>{ui.done} <ArrowRight style={{ width: 13, height: 13 }} /></>
                ) : (
                  <>{ui.next} <ChevronRight style={{ width: 14, height: 14 }} /></>
                )}
              </button>
            </div>
          </div>

          {/* Close × */}
          <button
            onClick={onClose}
            aria-label="Close"
            style={{
              position: "absolute",
              top: 10,
              right: 12,
              background: "transparent",
              border: "none",
              cursor: "pointer",
              color: "rgba(255,255,255,0.45)",
              display: "flex",
              alignItems: "center",
              padding: 2,
            }}
          >
            <X style={{ width: 13, height: 13 }} />
          </button>
        </div>
      </div>
    </>
  );
}

// ─── Main export ──────────────────────────────────────────────────────────────

export function PageGuidance({
  pageKey,
  title: titleProp,
  description: descriptionProp,
  steps: rawStepsProp,
  tip: tipProp,
  locale,
}: PageGuidanceProps) {
  // Stable key — never change this format or existing users will see the tour again
  const storageKey = `opulanz-tour-${pageKey}`;

  // Use translated content when available, fall back to props
  const translated = locale ? getGuidanceContent(locale, pageKey) : null;
  const title = translated?.title ?? titleProp;
  const description = translated?.description ?? descriptionProp;
  const tip = translated?.tip ?? tipProp;
  const ui = guidanceUI[locale === "fr" ? "fr" : "en"];

  const rawSteps: TourStep[] = React.useMemo(() => {
    if (translated?.steps?.length) {
      return translated.steps.map((s) => ({
        title: s.title,
        content: s.content ?? "",
        target: s.target,
        position: s.position,
      }));
    }
    return rawStepsProp;
  }, [translated, rawStepsProp]); // eslint-disable-line react-hooks/exhaustive-deps

  const steps = React.useMemo(() => rawSteps.map(normalize), [rawSteps]);

  const [mounted, setMounted] = React.useState(false);
  const [active, setActive] = React.useState(false);
  const [idx, setIdx] = React.useState(0);

  React.useEffect(() => {
    setMounted(true);
    // Show only once — if dismissed before, never auto-open again
    if (!localStorage.getItem(storageKey)) {
      const t = setTimeout(() => setActive(true), 700);
      return () => clearTimeout(t);
    }
  }, [storageKey]);

  function close() {
    // Permanently dismissed — won't auto-open again on any future visit
    localStorage.setItem(storageKey, "1");
    setActive(false);
    setIdx(0);
  }

  function next() {
    if (idx < steps.length - 1) setIdx((i) => i + 1);
    else close();
  }

  function prev() {
    if (idx > 0) setIdx((i) => i - 1);
  }

  if (!mounted) return null;

  return (
    <>
      {/* Floating ? button — always visible, re-opens tour */}
      <div style={{ position: "fixed", bottom: 24, left: 24, zIndex: 9996 }}>
        <button
          onClick={() => { setIdx(0); setActive(true); }}
          title="Open page guide"
          aria-label="Open page guidance"
          style={{
            width: 48,
            height: 48,
            borderRadius: "50%",
            background: "linear-gradient(135deg, #b59354, #886844)",
            border: "none",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            boxShadow: "0 4px 18px rgba(181,147,84,0.5)",
            transition: "transform 0.2s, box-shadow 0.2s",
          }}
          onMouseEnter={(e) => {
            (e.currentTarget as HTMLElement).style.transform = "scale(1.12)";
            (e.currentTarget as HTMLElement).style.boxShadow = "0 6px 22px rgba(181,147,84,0.65)";
          }}
          onMouseLeave={(e) => {
            (e.currentTarget as HTMLElement).style.transform = "scale(1)";
            (e.currentTarget as HTMLElement).style.boxShadow = "0 4px 18px rgba(181,147,84,0.5)";
          }}
        >
          <HelpCircle style={{ width: 20, height: 20, color: "white" }} />
        </button>
      </div>

      {active &&
        createPortal(
          <TourOverlay
            title={title}
            description={description}
            tip={tip}
            steps={steps}
            idx={idx}
            onNext={next}
            onPrev={prev}
            onClose={close}
            ui={ui}
          />,
          document.body
        )}
    </>
  );
}
