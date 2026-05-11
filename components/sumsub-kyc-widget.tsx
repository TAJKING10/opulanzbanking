"use client";

import * as React from "react";
import dynamic from "next/dynamic";
import { X, Loader2, ShieldCheck, ChevronRight } from "lucide-react";

// Load Sumsub SDK client-side only (it requires browser APIs)
const SumsubWebSdk = dynamic(() => import("@sumsub/websdk-react"), {
  ssr: false,
});

interface SumsubKycWidgetProps {
  userId: string;
  levelName: "individual_signup_kyc" | "corporate_signup_kyc";
  onClose: () => void;
  onComplete?: () => void;
}

const KYC_STEPS = [
  "Personal Details",
  "Document Upload",
  "Selfie Check",
  "Review",
];

export function SumsubKycWidget({
  userId,
  levelName,
  onClose,
  onComplete,
}: SumsubKycWidgetProps) {
  const [accessToken, setAccessToken] = React.useState<string | null>(null);
  const [error, setError] = React.useState<string | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [visible, setVisible] = React.useState(false);
  const [currentStep, setCurrentStep] = React.useState(0);

  // Trigger slide-in on mount
  React.useEffect(() => {
    const t = setTimeout(() => setVisible(true), 10);
    return () => clearTimeout(t);
  }, []);

  const fetchToken = React.useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";
      const res = await fetch(`${API}/api/sumsub/access-token`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, levelName }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to get access token");
      }

      const data = await res.json();
      setAccessToken(data.token);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [userId, levelName]);

  React.useEffect(() => {
    fetchToken();
  }, [fetchToken]);

  function handleClose() {
    setVisible(false);
    setTimeout(onClose, 300);
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center"
      style={{ backgroundColor: visible ? "rgba(0,0,0,0.6)" : "transparent", transition: "background-color 0.3s ease" }}
    >
      {/* Backdrop click to close */}
      <div className="absolute inset-0" onClick={handleClose} />

      {/* Panel — slides up on mobile, slides in from right on desktop */}
      <div
        className="relative w-full sm:max-w-2xl bg-white rounded-t-3xl sm:rounded-2xl shadow-2xl overflow-hidden flex flex-col"
        style={{
          maxHeight: "95vh",
          transform: visible ? "translateY(0)" : "translateY(100%)",
          transition: "transform 0.35s cubic-bezier(0.32, 0.72, 0, 1)",
        }}
      >
        {/* Drag handle (mobile) */}
        <div className="flex justify-center pt-3 pb-1 sm:hidden">
          <div className="w-10 h-1 bg-gray-300 rounded-full" />
        </div>

        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 bg-white">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-[#b59354]/10 rounded-xl flex items-center justify-center">
              <ShieldCheck className="h-5 w-5 text-[#b59354]" />
            </div>
            <div>
              <h2 className="text-base font-semibold text-gray-900">Identity Verification</h2>
              <p className="text-xs text-gray-500">Powered by Sumsub · Secure & encrypted</p>
            </div>
          </div>
          <button
            onClick={handleClose}
            className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 transition-colors"
          >
            <X className="h-4 w-4 text-gray-600" />
          </button>
        </div>

        {/* Step slider indicator */}
        <div className="px-6 py-3 bg-gray-50 border-b border-gray-100">
          <div className="flex items-center gap-0 overflow-x-auto">
            {KYC_STEPS.map((step, i) => (
              <React.Fragment key={step}>
                <div className="flex items-center gap-1.5 flex-shrink-0">
                  <div
                    className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold transition-all duration-300 ${
                      i <= currentStep
                        ? "bg-[#b59354] text-white"
                        : "bg-gray-200 text-gray-400"
                    }`}
                  >
                    {i < currentStep ? "✓" : i + 1}
                  </div>
                  <span
                    className={`text-xs font-medium hidden sm:block ${
                      i === currentStep ? "text-[#b59354]" : i < currentStep ? "text-gray-500" : "text-gray-400"
                    }`}
                  >
                    {step}
                  </span>
                </div>
                {i < KYC_STEPS.length - 1 && (
                  <div
                    className={`flex-1 h-0.5 mx-2 min-w-[16px] transition-all duration-500 ${
                      i < currentStep ? "bg-[#b59354]" : "bg-gray-200"
                    }`}
                  />
                )}
              </React.Fragment>
            ))}
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto min-h-[420px] flex items-center justify-center">
          {loading && (
            <div className="flex flex-col items-center gap-4 text-gray-500 py-12">
              <div className="w-16 h-16 bg-[#b59354]/10 rounded-2xl flex items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-[#b59354]" />
              </div>
              <div className="text-center">
                <p className="font-medium text-gray-900">Preparing verification</p>
                <p className="text-sm text-gray-500 mt-1">This will only take a moment...</p>
              </div>
            </div>
          )}

          {error && (
            <div className="flex flex-col items-center gap-4 text-center px-8 py-12">
              <div className="w-16 h-16 bg-red-100 rounded-2xl flex items-center justify-center">
                <X className="h-8 w-8 text-red-500" />
              </div>
              <div>
                <p className="font-semibold text-gray-900">Unable to start verification</p>
                <p className="text-sm text-gray-500 mt-1">{error}</p>
              </div>
              <button
                onClick={() => { setError(null); setLoading(true); fetchToken(); }}
                className="mt-2 px-6 py-2.5 bg-[#b59354] text-white text-sm font-medium rounded-xl hover:bg-[#886844] transition-colors"
              >
                Try Again
              </button>
            </div>
          )}

          {!loading && !error && accessToken && (
            <div className="w-full">
              <SumsubWebSdk
                accessToken={accessToken}
                expirationHandler={fetchToken}
                config={{ lang: "en" }}
                options={{ addViewportTag: false, adaptIframeHeight: true }}
                onMessage={(type: string, payload: any) => {
                  // Advance slider based on Sumsub events
                  if (type === "idCheck.onStepInitiated") {
                    const stepName = payload?.idDocType || payload?.step || "";
                    if (stepName.toLowerCase().includes("document")) setCurrentStep(1);
                    else if (stepName.toLowerCase().includes("selfie") || stepName.toLowerCase().includes("face")) setCurrentStep(2);
                  }
                  if (type === "idCheck.onApplicantLoaded") setCurrentStep(0);
                  if (type === "idCheck.onApplicantSubmitted") setCurrentStep(3);
                  if (type === "idCheck.onApplicantStatusChanged") {
                    const { reviewResult } = payload || {};
                    if (reviewResult?.reviewAnswer === "GREEN") {
                      setCurrentStep(3);
                      onComplete?.();
                    }
                  }
                }}
                onError={(error: any) => {
                  console.error("Sumsub error:", error);
                }}
              />
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-3 bg-gray-50 border-t border-gray-100 flex items-center justify-between">
          <p className="text-xs text-gray-400">Your data is encrypted and processed securely</p>
          <div className="flex items-center gap-1 text-xs text-[#b59354] font-medium">
            <ShieldCheck className="h-3.5 w-3.5" />
            <span>256-bit SSL</span>
          </div>
        </div>
      </div>
    </div>
  );
}
