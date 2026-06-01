"use client";

import { useEffect, useRef, useState } from "react";

// Declare custom element for TypeScript (kept hidden in DOM for SDK internals)
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

// Use same-origin Next.js proxy routes — avoids all CSP issues on localhost and production
const PAYPAL_API = "/api/paypal";
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
  const sessionRef = useRef<any>(null);
  const createOrderRef = useRef<(() => Promise<{ orderId: string }>) | null>(null);
  const [ready, setReady] = useState(false);
  const [loading, setLoading] = useState(true);
  const [paying, setPaying] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [retryKey, setRetryKey] = useState(0);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setReady(false);
    setError(null);
    sessionRef.current = null;
    createOrderRef.current = null;

    // ── Server-side order creation ─────────────────────────────────────────
    function createOrder(): Promise<{ orderId: string }> {
      console.log("[PayPal v6] createOrder — amount:", amount, currency);
      return fetch(`${PAYPAL_API}/create-order`, {
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
      const res = await fetch(`${PAYPAL_API}/capture-order/${orderId}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Capture failed");
      console.log("[PayPal v6] Captured:", data.status);
      return data;
    }

    // ── SDK init ───────────────────────────────────────────────────────────
    async function initPayPal() {
      if (cancelled) return;

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

      const session = sdkInstance.createPayPalOneTimePaymentSession({
        onApprove: async (data: any) => {
          console.log("[PayPal v6] onApprove — orderId:", data.orderId);
          try {
            const details = await captureOrder(data.orderId);
            if (!cancelled) {
              setPaying(false);
              onSuccess(data.orderId, details);
            }
          } catch (err: any) {
            console.error("[PayPal v6] capture error:", err);
            if (!cancelled) {
              setPaying(false);
              setError("Payment approved but capture failed. Contact support.");
              onError?.(err.message);
            }
          }
        },
        onCancel: () => {
          console.log("[PayPal v6] Cancelled by user");
          if (!cancelled) setPaying(false);
        },
        onError: (err: any) => {
          console.error("[PayPal v6] Payment error:", err);
          if (!cancelled) {
            setPaying(false);
            setError("Payment failed. Please try again.");
            onError?.("payment error");
          }
        },
      });

      if (cancelled) return;

      sessionRef.current = session;
      createOrderRef.current = createOrder;
      setLoading(false);
      setReady(true);
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
      if (!cancelled && !ready) {
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

  function handlePayClick() {
    if (!sessionRef.current || !createOrderRef.current) return;
    setPaying(true);
    console.log("[PayPal v6] Starting payment session...");
    sessionRef.current
      .start({ presentationMode: "auto" }, createOrderRef.current())
      .catch((err: any) => {
        console.error("[PayPal v6] session.start error:", err);
        setPaying(false);
        setError("Could not start payment. Please try again.");
      });
  }

  return (
    <div>
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
            onClick={() => {
              setError(null);
              setLoading(true);
              setReady(false);
              setRetryKey((k) => k + 1);
            }}
            className="rounded-md bg-[#b59354] px-4 py-2 text-sm font-semibold text-white hover:bg-[#886844] transition-colors"
          >
            Try Again
          </button>
        </div>
      )}

      {/* PayPal pay button — shown once SDK is ready, no conflict with custom element */}
      {ready && !error && (
        <button
          onClick={handlePayClick}
          disabled={paying}
          className="w-full rounded-lg bg-[#FFC439] hover:bg-[#f0b429] disabled:opacity-60 disabled:cursor-not-allowed transition-colors py-3 px-6 flex items-center justify-center gap-3 font-bold text-[#003087] text-base shadow-sm"
        >
          {paying ? (
            <>
              <div className="h-4 w-4 animate-spin rounded-full border-2 border-[#003087] border-t-transparent" />
              Processing...
            </>
          ) : (
            <>
              <svg height="20" viewBox="0 0 124 33" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
                <path d="M46.2 6.8H38c-.5 0-1 .4-1.1.9L33.6 28c-.1.4.2.7.6.7h3.7c.5 0 1-.4 1.1-.9l1-6.1c.1-.5.5-.9 1.1-.9h2.6c5.4 0 8.5-2.6 9.3-7.8.4-2.3 0-4-.9-5.2-1.1-1.3-3-2-5.9-2zm.9 7.7c-.4 2.8-2.7 2.8-4.8 2.8h-1.2l.9-5.4c0-.3.3-.5.6-.5h.6c1.5 0 2.9 0 3.6.8.4.5.5 1.3.3 2.3z" fill="#003087"/>
                <path d="M68.3 14.4h-3.7c-.3 0-.6.2-.6.5l-.2 1.1-.3-.4c-.9-1.3-3-1.8-5-1.8-4.6 0-8.6 3.5-9.3 8.4-.4 2.5.2 4.8 1.5 6.4 1.2 1.5 3 2.1 5.1 2.1 3.7 0 5.7-2.4 5.7-2.4l-.2 1.1c-.1.4.2.7.6.7h3.3c.5 0 1-.4 1.1-.9l2-12.1c.1-.4-.2-.7-.6-.7zm-5.1 8.1c-.4 2.3-2.3 3.9-4.7 3.9-1.2 0-2.2-.4-2.8-1.1-.6-.8-.8-1.8-.6-3 .4-2.3 2.3-3.9 4.6-3.9 1.2 0 2.1.4 2.7 1.1.7.8.9 1.8.8 3z" fill="#003087"/>
                <path d="M87.5 14.4h-3.7c-.4 0-.7.2-.9.5l-5.1 7.5-2.2-7.2c-.1-.5-.6-.8-1-.8h-3.7c-.4 0-.7.4-.6.8l4.1 12-3.9 5.5c-.3.4 0 .9.5.9h3.7c.4 0 .7-.2.9-.5L88 15.3c.3-.4 0-.9-.5-.9z" fill="#003087"/>
                <path d="M98.9 6.8h-8.2c-.5 0-1 .4-1.1.9L86.3 28c-.1.4.2.7.6.7h4c.3 0 .6-.2.7-.5l1-6.5c.1-.5.5-.9 1.1-.9h2.6c5.4 0 8.5-2.6 9.3-7.8.4-2.3 0-4-.9-5.2-1.2-1.3-3.1-2-5.9-2zm.9 7.7c-.4 2.8-2.7 2.8-4.8 2.8h-1.2l.9-5.4c0-.3.3-.5.6-.5h.6c1.5 0 2.9 0 3.6.8.4.5.5 1.3.3 2.3z" fill="#009cde"/>
                <path d="M120.6 14.4h-3.7c-.3 0-.6.2-.6.5l-.2 1.1-.3-.4c-.9-1.3-3-1.8-5-1.8-4.6 0-8.6 3.5-9.3 8.4-.4 2.5.2 4.8 1.5 6.4 1.2 1.5 3 2.1 5.1 2.1 3.7 0 5.7-2.4 5.7-2.4l-.2 1.1c-.1.4.2.7.6.7h3.3c.5 0 1-.4 1.1-.9l2-12.1c.1-.4-.2-.7-.6-.7zm-5.1 8.1c-.4 2.3-2.3 3.9-4.7 3.9-1.2 0-2.2-.4-2.8-1.1-.6-.8-.8-1.8-.6-3 .4-2.3 2.3-3.9 4.6-3.9 1.2 0 2.1.4 2.7 1.1.7.8.9 1.8.8 3z" fill="#009cde"/>
                <path d="M124 7.2l-3.3 20.9c-.1.4.2.7.6.7h3.2c.5 0 1-.4 1.1-.9L128.9 7c.1-.4-.2-.7-.6-.7h-3.6c-.3 0-.6.2-.7.9z" fill="#009cde"/>
              </svg>
              Pay with PayPal
            </>
          )}
        </button>
      )}

      {/* Hidden paypal-button element — stays in DOM for SDK internals, never shown */}
      <paypal-button type="pay" hidden style={{ display: "none" }} />
    </div>
  );
}
