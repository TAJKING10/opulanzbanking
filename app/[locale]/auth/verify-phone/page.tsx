"use client";

import * as React from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { Loader2, Smartphone, RefreshCw } from "lucide-react";
import { OtpInput } from "@/components/otp-input";
import { setAuthToken } from "@/lib/auth";

const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

export default function VerifyPhonePage() {
  const params = useParams();
  const locale = params.locale as string;
  const router = useRouter();

  const [userId, setUserId] = React.useState("");
  const [phone, setPhone] = React.useState("");
  const [otp, setOtp] = React.useState("");
  const [loading, setLoading] = React.useState(false);
  const [resending, setResending] = React.useState(false);
  const [error, setError] = React.useState("");
  const [resent, setResent] = React.useState(false);

  React.useEffect(() => {
    const id = sessionStorage.getItem("auth_user_id");
    const ph = sessionStorage.getItem("auth_phone");
    if (!id) {
      router.replace(`/${locale}/auth/signup`);
      return;
    }
    setUserId(id);
    setPhone(ph || "");
  }, [locale, router]);

  async function handleVerify() {
    if (otp.length < 6) return;
    setLoading(true);
    setError("");
    try {
      const res = await fetch(`${API}/api/auth/verify-phone-otp`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, otp }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      // Store partial token for KYC step
      setAuthToken(data.token);
      sessionStorage.setItem("auth_account_type", data.accountType);
      router.push(`/${locale}/auth/kyc`);
    } catch (err: any) {
      setError(err.message || "Failed to verify code");
    } finally {
      setLoading(false);
    }
  }

  async function handleResend() {
    setResending(true);
    try {
      await fetch(`${API}/api/auth/resend-otp`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, type: "phone", purpose: "signup" }),
      });
      setResent(true);
      setTimeout(() => setResent(false), 5000);
    } finally {
      setResending(false);
    }
  }

  React.useEffect(() => {
    if (otp.length === 6 && !loading) handleVerify();
  }, [otp]);

  const maskedPhone = phone ? phone.slice(0, -4).replace(/\d/g, "•") + phone.slice(-4) : "your phone";

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#f6f8f8] to-white flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link href={`/${locale}`} className="inline-block">
            <h1 className="text-3xl font-bold text-[#252623] tracking-tight">OPULANZ</h1>
          </Link>
        </div>

        <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-8 text-center">
          <div className="w-16 h-16 bg-[#b59354]/10 rounded-2xl flex items-center justify-center mx-auto mb-6">
            <Smartphone className="h-8 w-8 text-[#b59354]" />
          </div>

          <h2 className="text-xl font-bold text-gray-900 mb-2">Verify your phone</h2>
          <p className="text-sm text-gray-500 mb-2">
            We sent a 6-digit code to <strong>{maskedPhone}</strong>
          </p>
          <p className="text-xs text-amber-600 mb-8 bg-amber-50 rounded-lg px-3 py-2">
            Development mode: check your email inbox for the SMS code
          </p>

          <OtpInput value={otp} onChange={setOtp} disabled={loading} />

          {error && (
            <div className="mt-4 bg-red-50 border border-red-200 rounded-xl px-4 py-3 text-sm text-red-700">
              {error}
            </div>
          )}

          <button
            onClick={handleVerify}
            disabled={otp.length < 6 || loading}
            className="w-full mt-6 py-3 bg-[#b59354] text-white rounded-xl font-semibold text-sm hover:bg-[#886844] transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {loading && <Loader2 className="h-4 w-4 animate-spin" />}
            Verify Phone
          </button>

          <button
            onClick={handleResend}
            disabled={resending}
            className="mt-4 flex items-center gap-1.5 text-sm text-gray-500 hover:text-[#b59354] transition-colors mx-auto"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${resending ? "animate-spin" : ""}`} />
            {resent ? "Code resent!" : "Resend code"}
          </button>
        </div>

        <p className="text-center text-xs text-gray-400 mt-4">Step 2 of 3 — Phone verification</p>
      </div>
    </div>
  );
}
