"use client";

import { useEffect, useRef, useState } from "react";

// Declare custom element for TypeScript
declare global {
  namespace JSX {
    interface IntrinsicElements {
      "paypal-button": React.DetailedHTMLProps<
        React.HTMLAttributes<HTMLElement>,
        HTMLElement
      > & { type?: string; hidden?: boolean };
    }
  }
}

const PAYPAL_CLIENT_ID =
  process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID ||
  "ASfDlkfY0QexOMLyaQl7LzQP00oDbv3I2j9EkPcBNfSSS6TdwotWY50J3IQWEN17mqpB92UbVY97u3bJ";

const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";
const SDK_URL = "https://www.sandbox.paypal.com/web-sdk/v6/core";

interface PayPalButtonsProps {
  amount: string;
  description: string;
  currency?: string;
  onSuccess: (orderId: string, details: any) => void;
  onError?: (message: string) => void;
}

export function PayPalButtons({
  amount,
  description,
  currency = "EUR",
  onSuccess,
  onError,
}: PayPalButtonsProps) {
  const wrapperRef = useRef<HTMLDivElement>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [retryKey, setRetryKey] = useState(0);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);

    // ── Server-side order creation (v6 requires this) ──────────────────────
    function createOrder(): Promise<{ orderId: string }> {
      console.log("[PayPal v6] createOrder — amount:", amount, currency);
      return fetch(`${API}/api/paypal/create-order`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ amount, currency, description }),
      })
        .then((r) => r.json())
        .then((data) => {
          if (!data.orderId) throw new Error(data.error || "No orderId returned");
          console.log("[PayPal v6] Order created:", data.orderId);
          return { orderId: data.orderId };
        });
    }

    // ── Server-side capture ────────────────────────────────────────────────
    async function captureOrder(orderId: string) {
      console.log("[PayPal v6] Capturing order:", orderId);
      const res = await fetch(`${API}/api/paypal/capture-order/${orderId}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Capture failed");
      console.log("[PayPal v6] Captured:", data.status);
      return data;
    }

    // ── SDK init + session setup ───────────────────────────────────────────
    async function initPayPal() {
      if (cancelled || !wrapperRef.current) return;

      const paypal = (window as any).paypal;
      console.log("[PayPal v6] createInstance...");

      let sdkInstance: any;
      try {
        sdkInstance = await paypal.createInstance({
          clientId: PAYPAL_CLIENT_ID,
          components: ["paypal-payments"],
          pageType: "checkout",
        });
      } catch (err: any) {
        console.error("[PayPal v6] createInstance failed:", err);
        if (!cancelled) {
          setError("PayPal failed to initialize. Please refresh.");
          setLoading(false);
          onError?.("init failed");
        }
        return;
      }

      if (cancelled) return;

      // Create payment session — callbacks defined here per docs
      const session = sdkInstance.createPayPalOneTimePaymentSession({
        onApprove: async (data: any) => {
          console.log("[PayPal v6] onApprove — orderId:", data.orderId);
          try {
            const details = await captureOrder(data.orderId);
            if (!cancelled) onSuccess(data.orderId, details);
          } catch (err: any) {
            console.error("[PayPal v6] capture error:", err);
            if (!cancelled) {
              setError("Payment approved but capture failed. Contact support.");
              onError?.(err.message);
            }
          }
        },
        onCancel: () => {
          console.log("[PayPal v6] Cancelled by user");
        },
        onError: (err: any) => {
          console.error("[PayPal v6] Payment error:", err);
          if (!cancelled) {
            setError("Payment failed. Please try again.");
            onError?.("payment error");
          }
        },
      });

      if (cancelled || !wrapperRef.current) return;

      // Get the pre-rendered <paypal-button> element and unhide it
      const btn = wrapperRef.current.querySelector("paypal-button") as HTMLElement;
      if (!btn) return;

      btn.removeAttribute("hidden");

      btn.addEventListener("click", () => {
        console.log("[PayPal v6] Button clicked — starting session");
        session
          .start({ presentationMode: "auto" }, createOrder())
          .catch((err: any) => {
            console.error("[PayPal v6] session.start error:", err);
            if (!cancelled) setError("Could not start payment. Please try again.");
          });
      });

      if (!cancelled) setLoading(false);
    }

    // ── Load SDK script ────────────────────────────────────────────────────
    function loadSDK() {
      if ((window as any).paypal?.createInstance) {
        console.log("[PayPal v6] SDK already available");
        initPayPal();
        return;
      }

      const existing = document.querySelector('script[src*="web-sdk/v6"]');
      if (existing) {
        console.log("[PayPal v6] Script exists, polling...");
        const poll = setInterval(() => {
          if (cancelled) { clearInterval(poll); return; }
          if ((window as any).paypal?.createInstance) { clearInterval(poll); initPayPal(); }
        }, 200);
        return;
      }

      console.log("[PayPal v6] Loading SDK:", SDK_URL);
      const script = document.createElement("script");
      script.src = SDK_URL;
      script.async = true;
      script.onload = () => { if (!cancelled) initPayPal(); };
      script.onerror = () => {
        if (!cancelled) {
          setError("Could not load PayPal. Check your connection.");
          setLoading(false);
        }
      };
      document.head.appendChild(script);
    }

    const timeoutId = setTimeout(() => {
      if (!cancelled && loading) {
        setError("PayPal is taking too long. Please refresh.");
        setLoading(false);
      }
    }, 20000);

    loadSDK();

    return () => {
      cancelled = true;
      clearTimeout(timeoutId);
    };
  }, [retryKey]); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div ref={wrapperRef}>
      {/* Loading spinner */}
      {loading && !error && (
        <div className="flex flex-col items-center justify-center py-8 gap-3">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-[#b59354] border-t-transparent" />
          <p className="text-sm text-gray-500">Loading PayPal...</p>
        </div>
      )}

      {/* Error state */}
      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-center">
          <p className="text-sm text-red-700 mb-3">{error}</p>
          <button
            onClick={() => { setError(null); setLoading(true); setRetryKey((k) => k + 1); }}
            className="rounded-md bg-[#b59354] px-4 py-2 text-sm font-semibold text-white hover:bg-[#886844] transition-colors"
          >
            Try Again
          </button>
        </div>
      )}

      {/*
        Pre-render <paypal-button> hidden in the DOM — exactly as PayPal v6 docs show.
        The SDK needs it present BEFORE it enhances it. We unhide it after createInstance.
      */}
      <paypal-button type="pay" hidden />
    </div>
  );
}
