"use client";

import * as React from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { Eye, EyeOff, Loader2, Mail, Smartphone, RefreshCw } from "lucide-react";
import { PageGuidance } from "@/components/page-guidance";
import { OtpInput } from "@/components/otp-input";
import { setAuthToken } from "@/lib/auth";

const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

type Step = "credentials" | "email-otp" | "phone-otp";

export default function SigninPage() {
  const params = useParams();
  const locale = params.locale as string;
  const router = useRouter();

  const [step, setStep] = React.useState<Step>("credentials");
  const [userId, setUserId] = React.useState("");
  const [email, setEmail] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [showPass, setShowPass] = React.useState(false);
  const [otp, setOtp] = React.useState("");
  const [loading, setLoading] = React.useState(false);
  const [resending, setResending] = React.useState(false);
  const [resent, setResent] = React.useState(false);
  const [error, setError] = React.useState("");

  // Step 1: Submit credentials
  async function handleSignin(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const res = await fetch(`${API}/api/auth/signin`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setUserId(String(data.userId));
      setOtp("");
      setStep("email-otp");
    } catch (err: any) {
      setError(err.message || "Failed to sign in");
    } finally {
      setLoading(false);
    }
  }

  // Step 2: Verify email OTP
  async function handleEmailOtp() {
    if (otp.length < 6) return;
    setLoading(true);
    setError("");
    try {
      const res = await fetch(`${API}/api/auth/verify-signin-email-otp`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, otp }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setOtp("");
      setStep("phone-otp");
    } catch (err: any) {
      setError(err.message || "Invalid code");
    } finally {
      setLoading(false);
    }
  }

  // Step 3: Verify phone OTP
  async function handlePhoneOtp() {
    if (otp.length < 6) return;
    setLoading(true);
    setError("");
    try {
      const res = await fetch(`${API}/api/auth/verify-signin-phone-otp`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, otp }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setAuthToken(data.token);
      router.push(`/${locale}/dashboard`);
    } catch (err: any) {
      setError(err.message || "Invalid code");
    } finally {
      setLoading(false);
    }
  }

  async function handleResend(type: "email" | "phone") {
    setResending(true);
    try {
      await fetch(`${API}/api/auth/resend-otp`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, type, purpose: "signin" }),
      });
      setResent(true);
      setTimeout(() => setResent(false), 5000);
    } finally {
      setResending(false);
    }
  }

  // Auto-submit on complete OTP
  React.useEffect(() => {
    if (otp.length === 6 && !loading) {
      if (step === "email-otp") handleEmailOtp();
      if (step === "phone-otp") handlePhoneOtp();
    }
  }, [otp, step]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#f6f8f8] to-white flex items-center justify-center p-4">
      <PageGuidance
        pageKey="auth-signin"
        title="Sign In"
        description="Access your Opulanz account securely."
        steps={[
          "Enter your registered email address and password",
          "Click 'Sign In' — you'll receive a one-time code by email",
          "Enter the 6-digit code to verify your identity",
          "You'll be redirected to your dashboard once verified",
        ]}
        tip="Don't have an account yet? Click 'Create account' below the sign-in form."
      />
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link href={`/${locale}`} className="inline-block">
            <h1 className="text-3xl font-bold text-[#252623] tracking-tight">OPULANZ</h1>
            <p className="text-sm text-gray-500 mt-1">
              {step === "credentials" ? "Sign in to your account" : "Two-factor authentication"}
            </p>
          </Link>
        </div>

        <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-8">
          {/* Step 1: Credentials */}
          {step === "credentials" && (
            <form onSubmit={handleSignin} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1.5">Email Address</label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => { setEmail(e.target.value); setError(""); }}
                  className="w-full px-3 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#b59354]/30 focus:border-[#b59354]"
                  placeholder="john@example.com"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1.5">Password</label>
                <div className="relative">
                  <input
                    type={showPass ? "text" : "password"}
                    required
                    value={password}
                    onChange={(e) => { setPassword(e.target.value); setError(""); }}
                    className="w-full px-3 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#b59354]/30 focus:border-[#b59354] pr-10"
                    placeholder="Your password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPass(!showPass)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showPass ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              {error && (
                <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-3 text-sm text-red-700">
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 bg-[#b59354] text-white rounded-xl font-semibold text-sm hover:bg-[#886844] transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {loading && <Loader2 className="h-4 w-4 animate-spin" />}
                Sign In
              </button>

              <p className="text-center text-sm text-gray-500">
                Don&apos;t have an account?{" "}
                <Link href={`/${locale}/auth/signup`} className="text-[#b59354] font-semibold hover:underline">
                  Sign Up
                </Link>
              </p>
            </form>
          )}

          {/* Step 2: Email OTP */}
          {step === "email-otp" && (
            <div className="text-center">
              <div className="w-14 h-14 bg-[#b59354]/10 rounded-2xl flex items-center justify-center mx-auto mb-5">
                <Mail className="h-7 w-7 text-[#b59354]" />
              </div>
              <h3 className="font-bold text-gray-900 mb-1">Check your email</h3>
              <p className="text-sm text-gray-500 mb-6">
                We sent a verification code to <strong>{email}</strong>
              </p>
              <OtpInput value={otp} onChange={(v) => { setOtp(v); setError(""); }} disabled={loading} />
              {error && (
                <div className="mt-4 bg-red-50 border border-red-200 rounded-xl px-4 py-3 text-sm text-red-700">
                  {error}
                </div>
              )}
              <button
                onClick={handleEmailOtp}
                disabled={otp.length < 6 || loading}
                className="w-full mt-5 py-3 bg-[#b59354] text-white rounded-xl font-semibold text-sm hover:bg-[#886844] transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {loading && <Loader2 className="h-4 w-4 animate-spin" />}
                Verify
              </button>
              <button
                onClick={() => handleResend("email")}
                disabled={resending}
                className="mt-3 flex items-center gap-1.5 text-sm text-gray-500 hover:text-[#b59354] transition-colors mx-auto"
              >
                <RefreshCw className={`h-3.5 w-3.5 ${resending ? "animate-spin" : ""}`} />
                {resent ? "Resent!" : "Resend code"}
              </button>
            </div>
          )}

          {/* Step 3: Phone OTP */}
          {step === "phone-otp" && (
            <div className="text-center">
              <div className="w-14 h-14 bg-[#b59354]/10 rounded-2xl flex items-center justify-center mx-auto mb-5">
                <Smartphone className="h-7 w-7 text-[#b59354]" />
              </div>
              <h3 className="font-bold text-gray-900 mb-1">Phone verification</h3>
              <p className="text-sm text-gray-500 mb-2">Enter the code sent to your phone</p>
              <p className="text-sm text-gray-500 mb-6">Enter the 6-digit code sent to your phone or email</p>
              <OtpInput value={otp} onChange={(v) => { setOtp(v); setError(""); }} disabled={loading} />
              {error && (
                <div className="mt-4 bg-red-50 border border-red-200 rounded-xl px-4 py-3 text-sm text-red-700">
                  {error}
                </div>
              )}
              <button
                onClick={handlePhoneOtp}
                disabled={otp.length < 6 || loading}
                className="w-full mt-5 py-3 bg-[#b59354] text-white rounded-xl font-semibold text-sm hover:bg-[#886844] transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {loading && <Loader2 className="h-4 w-4 animate-spin" />}
                Sign In
              </button>
              <button
                onClick={() => handleResend("phone")}
                disabled={resending}
                className="mt-3 flex items-center gap-1.5 text-sm text-gray-500 hover:text-[#b59354] transition-colors mx-auto"
              >
                <RefreshCw className={`h-3.5 w-3.5 ${resending ? "animate-spin" : ""}`} />
                {resent ? "Resent!" : "Resend code"}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
