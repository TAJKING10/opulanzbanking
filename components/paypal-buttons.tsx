"use client";

import { useEffect, useRef, useState } from "react";

const PAYPAL_CLIENT_ID =
  process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID ||
  "ASfDlkfY0QexOMLyaQl7LzQP00oDbv3I2j9EkPcBNfSSS6TdwotWY50J3IQWEN17mqpB92UbVY97u3bJ";

const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

// Sandbox if the Client ID starts with sandbox prefix (all sandbox IDs start with A)
// We always use sandbox SDK URL when using sandbox credentials
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
  const containerRef = useRef<HTMLDivElement>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [retryKey, setRetryKey] = useState(0);

  useEffect(() => {
    let cancelled = false;

    setLoading(true);
    setError(null);

    async function createOrder(): Promise<{ orderId: string }> {
      console.log("[PayPal v6] Creating order — amount:", amount, currency, description);
      const res = await fetch(`${API}/api/paypal/create-order`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ amount, currency, description }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to create PayPal order");
      console.log("[PayPal v6] Order created:", data.orderId);
      return { orderId: data.orderId };
    }

    async function captureOrder(orderId: string) {
      console.log("[PayPal v6] Capturing order:", orderId);
      const res = await fetch(`${API}/api/paypal/capture-order/${orderId}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to capture PayPal order");
      console.log("[PayPal v6] Capture success:", data.status);
      return data;
    }

    async function initPayPal() {
      if (!containerRef.current) return;

      const paypal = (window as any).paypal;
      console.log("[PayPal v6] Initializing SDK instance — clientId:", PAYPAL_CLIENT_ID.slice(0, 12) + "...");

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
          const msg = "PayPal failed to initialize. Please refresh and try again.";
          setError(msg);
          setLoading(false);
          onError?.(msg);
        }
        return;
      }

      // Check eligibility
      let eligible = false;
      try {
        const methods = await sdkInstance.findEligibleMethods({ currencyCode: currency });
        eligible = methods.isEligible("paypal");
        console.log("[PayPal v6] Eligible for PayPal:", eligible);
      } catch {
        eligible = true; // proceed anyway
      }

      if (!eligible) {
        const msg = "PayPal is not available for your region or currency.";
        setError(msg);
        setLoading(false);
        onError?.(msg);
        return;
      }

      // Create payment session
      const session = sdkInstance.createPayPalOneTimePaymentSession({
        onApprove: async (data: any) => {
          if (cancelled) return;
          console.log("[PayPal v6] onApprove — orderId:", data.orderId);
          try {
            const details = await captureOrder(data.orderId);
            if (!cancelled) onSuccess(data.orderId, details);
          } catch (err: any) {
            console.error("[PayPal v6] capture failed:", err);
            if (!cancelled) {
              const msg = "Payment approved but capture failed. Please contact support.";
              setError(msg);
              onError?.(msg);
            }
          }
        },
        onCancel: () => {
          console.log("[PayPal v6] Payment cancelled by user");
        },
        onError: (err: any) => {
          console.error("[PayPal v6] Payment error:", err);
          if (!cancelled) {
            const msg = "Payment failed. Please try again.";
            setError(msg);
            setLoading(false);
            onError?.(msg);
          }
        },
      });

      if (cancelled || !containerRef.current) return;

      // Create and mount the <paypal-button> custom element
      containerRef.current.innerHTML = "";
      const btn = document.createElement("paypal-button") as any;
      btn.setAttribute("type", "pay");
      containerRef.current.appendChild(btn);

      btn.addEventListener("click", async () => {
        console.log("[PayPal v6] Button clicked — starting session");
        try {
          await session.start(
            { presentationMode: "auto" },
            createOrder()
          );
        } catch (err: any) {
          console.error("[PayPal v6] session.start error:", err);
          if (!cancelled) {
            const msg = "Could not start payment. Please try again.";
            setError(msg);
            onError?.(msg);
          }
        }
      });

      if (!cancelled) setLoading(false);
    }

    function loadSDK() {
      // If already loaded, init directly
      if ((window as any).paypal?.createInstance) {
        console.log("[PayPal v6] SDK already loaded");
        initPayPal();
        return;
      }

      // If script tag exists, poll
      const existing = document.querySelector('script[src*="web-sdk/v6"]');
      if (existing) {
        console.log("[PayPal v6] Script tag exists, polling...");
        const poll = setInterval(() => {
          if (cancelled) { clearInterval(poll); return; }
          if ((window as any).paypal?.createInstance) {
            clearInterval(poll);
            initPayPal();
          }
        }, 200);
        return;
      }

      // Inject SDK script
      console.log("[PayPal v6] Loading SDK from:", SDK_URL);
      const script = document.createElement("script");
      script.src = SDK_URL;
      script.async = true;
      script.onload = () => {
        if (!cancelled) initPayPal();
      };
      script.onerror = () => {
        if (!cancelled) {
          const msg = "Could not load PayPal. Please check your connection.";
          setError(msg);
          setLoading(false);
          onError?.(msg);
        }
      };
      document.head.appendChild(script);
    }

    // 20-second timeout
    const timeoutId = setTimeout(() => {
      if (!cancelled && loading) {
        const msg = "PayPal is taking too long to load. Please refresh.";
        setError(msg);
        setLoading(false);
        onError?.(msg);
      }
    }, 20000);

    loadSDK();

    return () => {
      cancelled = true;
      clearTimeout(timeoutId);
    };
  }, [retryKey]); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div>
      {loading && !error && (
        <div className="flex flex-col items-center justify-center py-8 gap-3">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-[#b59354] border-t-transparent" />
          <p className="text-sm text-gray-500">Loading PayPal...</p>
        </div>
      )}

      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-center">
          <p className="text-sm text-red-700 mb-3">{error}</p>
          <button
            onClick={() => {
              setError(null);
              setLoading(true);
              setRetryKey((k) => k + 1);
            }}
            className="rounded-md bg-[#b59354] px-4 py-2 text-sm font-semibold text-white hover:bg-[#886844] transition-colors"
          >
            Try Again
          </button>
        </div>
      )}

      {/* Always in DOM so PayPal can measure it */}
      <div ref={containerRef} />
    </div>
  );
}
