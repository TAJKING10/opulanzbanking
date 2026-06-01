"use client";

import { useEffect, useRef, useState } from "react";

const PAYPAL_CLIENT_ID =
  process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID ||
  "ASfDlkfY0QexOMLyaQl7LzQP00oDbv3I2j9EkPcBNfSSS6TdwotWY50J3IQWEN17mqpB92UbVY97u3bJ";

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

    const timeoutId = setTimeout(() => {
      if (!cancelled && !(window as any).paypal) {
        setLoading(false);
        const msg = "PayPal is taking too long to load. Please refresh and try again.";
        setError(msg);
        onError?.(msg);
      }
    }, 20000);

    function renderButtons() {
      if (cancelled || !containerRef.current || !(window as any).paypal) return;
      containerRef.current.innerHTML = "";

      console.log("[PayPal] Rendering buttons — amount:", amount, "currency:", currency, "description:", description);

      (window as any).paypal
        .Buttons({
          style: {
            layout: "vertical",
            color: "gold",
            shape: "rect",
            label: "pay",
            height: 50,
          },
          createOrder: function (data: any, actions: any) {
            console.log("[PayPal] createOrder called");
            return actions.order
              .create({
                purchase_units: [
                  {
                    description,
                    amount: { currency_code: currency, value: amount },
                  },
                ],
              })
              .then((orderId: string) => {
                console.log("[PayPal] Order created:", orderId);
                return orderId;
              });
          },
          onApprove: function (data: any, actions: any) {
            console.log("[PayPal] onApprove — orderId:", data.orderID);
            return actions.order.capture().then((details: any) => {
              console.log("[PayPal] Capture success:", details);
              if (!cancelled) {
                setLoading(false);
                onSuccess(data.orderID, details);
              }
            });
          },
          onError: function (err: any) {
            console.error("[PayPal] onError:", err);
            if (!cancelled) {
              const msg = "Payment failed. Please try again or use a different payment method.";
              setError(msg);
              setLoading(false);
              onError?.(msg);
            }
          },
          onCancel: function () {
            console.log("[PayPal] Payment cancelled by user");
          },
        })
        .render(containerRef.current)
        .then(() => { if (!cancelled) setLoading(false); })
        .catch((err: any) => {
          console.error("[PayPal] render error:", err);
          if (!cancelled) {
            setTimeout(() => {
              if (!cancelled) renderButtons();
            }, 800);
          }
        });
    }

    function loadSDK() {
      if ((window as any).paypal) {
        console.log("[PayPal] SDK already loaded, rendering buttons");
        renderButtons();
        return;
      }

      const existing = document.querySelector('script[src*="paypal.com/sdk/js"]');
      if (existing) {
        console.log("[PayPal] SDK script tag exists, polling for window.paypal");
        const poll = setInterval(() => {
          if (cancelled) { clearInterval(poll); return; }
          if ((window as any).paypal) {
            clearInterval(poll);
            renderButtons();
          }
        }, 200);
        return;
      }

      console.log("[PayPal] Loading SDK — clientId:", PAYPAL_CLIENT_ID.slice(0, 12) + "...");
      const script = document.createElement("script");
      script.src = `https://www.paypal.com/sdk/js?client-id=${PAYPAL_CLIENT_ID}&currency=${currency}&components=buttons`;
      script.async = true;
      script.onload = () => {
        console.log("[PayPal] SDK loaded successfully");
        if (!cancelled) renderButtons();
      };
      script.onerror = () => {
        console.error("[PayPal] SDK failed to load");
        if (!cancelled) {
          const msg = "Could not load PayPal. Please check your connection and try again.";
          setError(msg);
          setLoading(false);
          onError?.(msg);
        }
      };
      document.head.appendChild(script);
    }

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

      {/* Always in DOM and always visible — PayPal SDK fails to render into hidden/zero-height elements */}
      <div ref={containerRef} />
    </div>
  );
}
