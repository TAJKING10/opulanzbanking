"use client";

import * as React from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { ShieldCheck, Loader2 } from "lucide-react";
import dynamic from "next/dynamic";
import { getAuthToken, setAuthToken, parseToken } from "@/lib/auth";

const SumsubWebSdk = dynamic(() => import("@sumsub/websdk-react"), { ssr: false });

const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

export default function KycPage() {
  const params = useParams();
  const locale = params.locale as string;
  const router = useRouter();

  const [userId, setUserId] = React.useState("");
  const [levelName, setLevelName] = React.useState<"individual_signup_kyc" | "corporate_signup_kyc">("individual_signup_kyc");
  const [accessToken, setAccessToken] = React.useState<string | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState("");
  const [completing, setCompleting] = React.useState(false);

  React.useEffect(() => {
    const token = getAuthToken();
    if (!token) {
      router.replace(`/${locale}/auth/signup`);
      return;
    }
    const user = parseToken(token);
    if (!user) {
      router.replace(`/${locale}/auth/signup`);
      return;
    }
    const uid = String(user.userId);
    setUserId(uid);
    setLevelName(
      user.accountType === "corporate" ? "corporate_signup_kyc" : "individual_signup_kyc"
    );
    fetchSumsubToken(uid, user.accountType === "corporate" ? "corporate_signup_kyc" : "individual_signup_kyc");
  }, [locale, router]);

  async function fetchSumsubToken(uid: string, level: string) {
    setLoading(true);
    setError("");
    try {
      const res = await fetch(`${API}/api/sumsub/access-token`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: `user-${uid}`, levelName: level }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to start verification");
      setAccessToken(data.token);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  async function handleKycComplete() {
    setCompleting(true);
    try {
      const authToken = getAuthToken();
      const res = await fetch(`${API}/api/auth/kyc-complete`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${authToken}`,
        },
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      // Store full JWT
      setAuthToken(data.token);

      // Store narvi account info for dashboard
      if (data.narviAccount) {
        localStorage.setItem("narvi_account", JSON.stringify(data.narviAccount));
      }

      sessionStorage.clear();
      router.push(`/${locale}/dashboard`);
    } catch (err: any) {
      // Even if this fails, take them to dashboard
      sessionStorage.clear();
      router.push(`/${locale}/dashboard`);
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#f6f8f8] to-white flex items-center justify-center p-4">
      <div className="w-full max-w-2xl">
        <div className="text-center mb-6">
          <Link href={`/${locale}`} className="inline-block">
            <h1 className="text-3xl font-bold text-[#252623] tracking-tight">OPULANZ</h1>
          </Link>
          <p className="text-sm text-gray-500 mt-1">Identity Verification</p>
        </div>

        <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
          {/* Header */}
          <div className="px-6 py-4 border-b border-gray-100 flex items-center gap-3">
            <div className="w-10 h-10 bg-[#b59354]/10 rounded-xl flex items-center justify-center">
              <ShieldCheck className="h-5 w-5 text-[#b59354]" />
            </div>
            <div>
              <p className="font-semibold text-gray-900 text-sm">KYC Verification</p>
              <p className="text-xs text-gray-500">Powered by Sumsub • Step 3 of 3</p>
            </div>
          </div>

          {/* Demo bypass banner */}
          <div className="px-6 py-3 bg-amber-50 border-b border-amber-100 flex items-center justify-between gap-4">
            <p className="text-xs text-amber-800">
              <strong>Demo mode:</strong> Complete the Sumsub verification below, or skip for testing.
            </p>
            <button
              onClick={handleKycComplete}
              disabled={completing}
              className="flex-shrink-0 px-3 py-1.5 bg-amber-600 hover:bg-amber-700 text-white text-xs font-semibold rounded-lg transition-colors disabled:opacity-50"
            >
              {completing ? "Setting up..." : "Skip KYC (Demo)"}
            </button>
          </div>

          {/* Content */}
          <div className="min-h-[500px] flex items-center justify-center p-4">
            {loading && (
              <div className="flex flex-col items-center gap-3 text-gray-500">
                <Loader2 className="h-8 w-8 animate-spin text-[#b59354]" />
                <p className="text-sm">Preparing verification...</p>
              </div>
            )}

            {error && (
              <div className="flex flex-col items-center gap-3 text-center px-6">
                <p className="font-medium text-gray-900">Unable to start verification</p>
                <p className="text-sm text-gray-500">{error}</p>
                <button
                  onClick={() => fetchSumsubToken(userId, levelName)}
                  className="px-4 py-2 bg-[#b59354] text-white text-sm rounded-xl hover:bg-[#886844] transition-colors"
                >
                  Try Again
                </button>
              </div>
            )}

            {completing && (
              <div className="flex flex-col items-center gap-3 text-gray-500">
                <Loader2 className="h-8 w-8 animate-spin text-[#b59354]" />
                <p className="text-sm">Completing setup...</p>
              </div>
            )}

            {!loading && !error && !completing && accessToken && (
              <div className="w-full">
                <SumsubWebSdk
                  accessToken={accessToken}
                  expirationHandler={() => fetchSumsubToken(userId, levelName)}
                  config={{ lang: "en" }}
                  options={{ addViewportTag: false, adaptIframeHeight: true }}
                  onMessage={(type: string, payload: any) => {
                    if (type === "idCheck.onApplicantStatusChanged") {
                      if (payload?.reviewResult?.reviewAnswer === "GREEN") {
                        handleKycComplete();
                      }
                    }
                  }}
                  onError={(err: any) => console.error("Sumsub error:", err)}
                />
              </div>
            )}
          </div>
        </div>

        <p className="text-center text-xs text-gray-400 mt-4">
          Your data is encrypted and processed securely by Sumsub
        </p>
      </div>
    </div>
  );
}
