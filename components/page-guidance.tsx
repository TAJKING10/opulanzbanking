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

// ─── Types ───────────────────────────────────────────────────────────────────

export type TourStep =
  | string
  | {
      title?: string;
      content: string;
      target?: string; // CSS selector for element to spotlight
      position?: "top" | "bottom" | "left" | "right";
    };

interface PageGuidanceProps {
  pageKey: string;
  title: string;
  description?: string;
  steps: TourStep[];
  tip?: string;
}

interface NormalizedStep {
  title?: string;
  content: string;
  target?: string;
  position?: "top" | "bottom" | "left" | "right";
}

interface SpotRect {
  top: number;
  left: number;
  width: number;
  height: number;
}

interface Placement {
  top: number;
  left: number;
  arrow: "top" | "bottom" | "left" | "right" | "none";
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

const PAD = 10;
const TW = 340;
const TH = 240;

function normalize(s: TourStep): NormalizedStep {
  return typeof s === "string" ? { content: s } : s;
}

function clamp(v: number, lo: number, hi: number) {
  return Math.max(lo, Math.min(v, hi));
}

function getPlacement(
  rect: DOMRect,
  preferred?: "top" | "bottom" | "left" | "right"
): Placement {
  const vw = window.innerWidth;
  const vh = window.innerHeight;
  const cx = rect.left + rect.width / 2;
  const cy = rect.top + rect.height / 2;

  const candidates: ("bottom" | "top" | "right" | "left")[] = preferred
    ? [preferred, "bottom", "top", "right", "left"]
    : ["bottom", "top", "right", "left"];

  for (const dir of candidates) {
    if (dir === "bottom" && rect.bottom + PAD + 20 + TH < vh) {
      return {
        top: rect.bottom + PAD + 16,
        left: clamp(cx - TW / 2, 16, vw - TW - 16),
        arrow: "top",
      };
    }
    if (dir === "top" && rect.top - PAD - 16 - TH > 0) {
      return {
        top: rect.top - PAD - 16 - TH,
        left: clamp(cx - TW / 2, 16, vw - TW - 16),
        arrow: "bottom",
      };
    }
    if (dir === "right" && rect.right + PAD + 20 + TW < vw) {
      return {
        top: clamp(cy - TH / 2, 16, vh - TH - 16),
        left: rect.right + PAD + 16,
        arrow: "left",
      };
    }
    if (dir === "left" && rect.left - PAD - 16 - TW > 0) {
      return {
        top: clamp(cy - TH / 2, 16, vh - TH - 16),
        left: rect.left - PAD - 16 - TW,
        arrow: "right",
      };
    }
  }

  return { top: vh / 2 - TH / 2, left: vw / 2 - TW / 2, arrow: "none" };
}

// ─── Spotlight ───────────────────────────────────────────────────────────────

function Spotlight({ r }: { r: SpotRect }) {
  return (
    <div style={{ position: "fixed", inset: 0, zIndex: 9998, pointerEvents: "none" }}>
      <div style={{ position: "absolute", inset: `0 0 auto 0`, height: Math.max(0, r.top), background: "rgba(0,0,0,0.68)" }} />
      <div style={{ position: "absolute", top: r.top + r.height, inset: `auto 0 0 0`, background: "rgba(0,0,0,0.68)" }} />
      <div style={{ position: "absolute", top: r.top, left: 0, width: Math.max(0, r.left), height: r.height, background: "rgba(0,0,0,0.68)" }} />
      <div style={{ position: "absolute", top: r.top, left: r.left + r.width, right: 0, height: r.height, background: "rgba(0,0,0,0.68)" }} />
      {/* Gold highlight ring */}
      <div
        style={{
          position: "absolute",
          top: r.top - 2,
          left: r.left - 2,
          width: r.width + 4,
          height: r.height + 4,
          borderRadius: 10,
          border: "2px solid #b59354",
          boxShadow: "0 0 0 3px rgba(181,147,84,0.2), 0 0 30px rgba(181,147,84,0.35)",
          transition: "top 0.35s ease, left 0.35s ease, width 0.35s ease, height 0.35s ease",
        }}
      />
    </div>
  );
}

// ─── Tooltip Arrow ────────────────────────────────────────────────────────────

function TooltipArrow({ dir }: { dir: Placement["arrow"] }) {
  if (dir === "none") return null;
  const s: React.CSSProperties = { position: "absolute", width: 0, height: 0, pointerEvents: "none" };
  const t = "10px solid transparent";
  const c = "#1c1c1c";
  if (dir === "top")
    return <div style={{ ...s, top: -10, left: "50%", transform: "translateX(-50%)", borderLeft: t, borderRight: t, borderBottom: `10px solid ${c}` }} />;
  if (dir === "bottom")
    return <div style={{ ...s, bottom: -10, left: "50%", transform: "translateX(-50%)", borderLeft: t, borderRight: t, borderTop: `10px solid ${c}` }} />;
  if (dir === "left")
    return <div style={{ ...s, left: -10, top: "50%", transform: "translateY(-50%)", borderTop: t, borderBottom: t, borderRight: `10px solid ${c}` }} />;
  if (dir === "right")
    return <div style={{ ...s, right: -10, top: "50%", transform: "translateY(-50%)", borderTop: t, borderBottom: t, borderLeft: `10px solid ${c}` }} />;
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
}: {
  title: string;
  description?: string;
  tip?: string;
  steps: NormalizedStep[];
  idx: number;
  onNext: () => void;
  onPrev: () => void;
  onClose: () => void;
}) {
  const step = steps[idx];
  const isFirst = idx === 0;
  const isLast = idx === steps.length - 1;
  const hasTarget = Boolean(step.target);

  const [spot, setSpot] = React.useState<SpotRect | null>(null);
  const [place, setPlace] = React.useState<Placement | null>(null);
  const [show, setShow] = React.useState(false);

  React.useEffect(() => {
    setShow(false);
    setSpot(null);
    setPlace(null);

    if (!step.target) {
      const t = setTimeout(() => setShow(true), 80);
      return () => clearTimeout(t);
    }

    const el = document.querySelector(step.target);
    if (!el) {
      const t = setTimeout(() => setShow(true), 80);
      return () => clearTimeout(t);
    }

    el.scrollIntoView({ behavior: "smooth", block: "center" });

    const t = setTimeout(() => {
      const r = el.getBoundingClientRect();
      setSpot({ top: r.top - PAD, left: r.left - PAD, width: r.width + PAD * 2, height: r.height + PAD * 2 });
      setPlace(getPlacement(r, step.position));
      setShow(true);
    }, 450);

    return () => clearTimeout(t);
  }, [idx]); // eslint-disable-line react-hooks/exhaustive-deps

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
      {/* Backdrop for steps without a target */}
      {!hasTarget && (
        <div
          onClick={onClose}
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,0.68)",
            zIndex: 9997,
            opacity: show ? 1 : 0,
            transition: "opacity 0.22s ease",
          }}
        />
      )}

      {/* Spotlight cutout */}
      {hasTarget && spot && <Spotlight r={spot} />}

      {/* Tooltip card */}
      <div style={cardStyle}>
        <div
          style={{
            background: "#1c1c1c",
            borderRadius: 14,
            border: "1px solid rgba(181,147,84,0.28)",
            boxShadow: "0 28px 72px rgba(0,0,0,0.7), 0 0 0 1px rgba(255,255,255,0.04)",
            overflow: "visible",
            position: "relative",
          }}
        >
          <TooltipArrow dir={hasTarget && place ? place.arrow : "none"} />

          {/* Gold header bar */}
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
                  borderRadius: 6,
                }}
              >
                <ChevronLeft style={{ width: 14, height: 14 }} />
                Back
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
                Skip tour
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
                  letterSpacing: "0.01em",
                }}
              >
                {isLast ? (
                  <>Get Started <ArrowRight style={{ width: 13, height: 13 }} /></>
                ) : (
                  <>Next <ChevronRight style={{ width: 14, height: 14 }} /></>
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
              borderRadius: 4,
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
  title,
  description,
  steps: rawSteps,
  tip,
}: PageGuidanceProps) {
  const storageKey = `opulanz-tour-v2-${pageKey}`;
  const steps = React.useMemo(() => rawSteps.map(normalize), [rawSteps]);

  const [mounted, setMounted] = React.useState(false);
  const [active, setActive] = React.useState(false);
  const [idx, setIdx] = React.useState(0);

  React.useEffect(() => {
    setMounted(true);
    if (!localStorage.getItem(storageKey)) {
      const t = setTimeout(() => setActive(true), 700);
      return () => clearTimeout(t);
    }
  }, [storageKey]);

  function close() {
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
      {/* Floating ? button */}
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
          />,
          document.body
        )}
    </>
  );
}
