"use client";

import * as React from "react";
import dynamic from "next/dynamic";
import { X, Loader2 } from "lucide-react";

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

export function SumsubKycWidget({
  userId,
  levelName,
  onClose,
  onComplete,
}: SumsubKycWidgetProps) {
  const [accessToken, setAccessToken] = React.useState<string | null>(null);
  const [error, setError] = React.useState<string | null>(null);
  const [loading, setLoading] = React.useState(true);

  const fetchToken = React.useCallback(async () => {
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000"}/api/sumsub/access-token`, {
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

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center bg-black/60 overflow-y-auto p-4">
      <div className="relative w-full max-w-2xl rounded-2xl bg-white shadow-2xl my-4 flex flex-col">
        {/* Header — sticky so it stays visible while scrolling */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 sticky top-0 bg-white rounded-t-2xl z-10 flex-shrink-0">
          <div>
            <h2 className="text-lg font-semibold text-gray-900">Identity Verification</h2>
            <p className="text-sm text-gray-500">Powered by Sumsub</p>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 transition-colors"
          >
            <X className="h-4 w-4 text-gray-600" />
          </button>
        </div>

        {/* Content — no height cap so Sumsub can expand freely */}
        <div className="min-h-[500px] flex items-center justify-center flex-1">
          {loading && (
            <div className="flex flex-col items-center gap-3 text-gray-500">
              <Loader2 className="h-8 w-8 animate-spin text-[#b59354]" />
              <p className="text-sm">Preparing verification...</p>
            </div>
          )}

          {error && (
            <div className="flex flex-col items-center gap-3 text-center px-6">
              <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
                <X className="h-6 w-6 text-red-600" />
              </div>
              <p className="font-medium text-gray-900">Unable to start verification</p>
              <p className="text-sm text-gray-500">{error}</p>
              <button
                onClick={() => { setError(null); setLoading(true); fetchToken(); }}
                className="mt-2 px-4 py-2 bg-[#b59354] text-white text-sm rounded-lg hover:bg-[#886844] transition-colors"
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
                  if (type === "idCheck.onApplicantStatusChanged") {
                    const { reviewResult } = payload;
                    if (reviewResult?.reviewAnswer === "GREEN") {
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
      </div>
    </div>
  );
}
