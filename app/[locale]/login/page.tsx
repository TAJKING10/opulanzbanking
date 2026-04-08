"use client";

import * as React from "react";
import Link from "next/link";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { Eye, EyeOff, Mail, Lock, ArrowRight, Smartphone, RefreshCw, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { OtpInput } from "@/components/otp-input";
import { setAuthToken } from "@/lib/auth";

const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";
type Step = "credentials" | "email-otp" | "phone-otp";

export default function LoginPage() {
  const params = useParams();
  const router = useRouter();
  const locale = params.locale as string;

  const searchParams = useSearchParams();
  const fromOpenAccount = searchParams.get("from") === "open-account";

  const [step, setStep] = React.useState<Step>("credentials");
  const [userId, setUserId] = React.useState("");
  const [email, setEmail] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [showPassword, setShowPassword] = React.useState(false);
  const [otp, setOtp] = React.useState("");
  const [isLoading, setIsLoading] = React.useState(false);
  const [resending, setResending] = React.useState(false);
  const [resent, setResent] = React.useState(false);
  const [error, setError] = React.useState("");
  const [smsSent, setSmsSent] = React.useState(false);

  // Step 1: Submit credentials → send email OTP
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
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
      setError(err.message || "Invalid email or password");
    } finally {
      setIsLoading(false);
    }
  };

  // Step 2: Verify email OTP → send phone OTP
  const handleEmailOtp = async () => {
    if (otp.length < 6) return;
    setIsLoading(true);
    setError("");
    try {
      const res = await fetch(`${API}/api/auth/verify-signin-email-otp`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, otp }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setSmsSent(data.smsSent === true);
      setOtp("");
      setStep("phone-otp");
    } catch (err: any) {
      setError(err.message || "Invalid code");
    } finally {
      setIsLoading(false);
    }
  };

  // Step 3: Verify phone OTP → dashboard
  const handlePhoneOtp = async () => {
    if (otp.length < 6) return;
    setIsLoading(true);
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
      setIsLoading(false);
    }
  };

  const handleResend = async (type: "email" | "phone") => {
    setResending(true);
    setResent(false);
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
  };

  // Auto-submit when OTP is complete
  React.useEffect(() => {
    if (otp.length === 6 && !isLoading) {
      if (step === "email-otp") handleEmailOtp();
      if (step === "phone-otp") handlePhoneOtp();
    }
  }, [otp, step]);

  return (
    <div className="flex min-h-screen">
      {/* Left Side - Branding */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-[#b59354] to-[#886844] text-white flex-col justify-between p-12">
        <div>
          <Link href={`/${locale}`} className="flex items-center gap-3">
            <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center">
              <span className="text-xl font-bold">O</span>
            </div>
            <span className="text-2xl font-bold">Opulanz</span>
          </Link>
        </div>

        <div className="space-y-6">
          <h1 className="text-4xl font-bold leading-tight">
            Business Banking<br />Made Simple
          </h1>
          <p className="text-lg text-white/80 max-w-md">
            Manage your business finances with powerful tools for payments, invoicing, and multi-currency accounts.
          </p>
          <div className="flex items-center gap-8 pt-8">
            <div>
              <p className="text-3xl font-bold">€2.5B+</p>
              <p className="text-sm text-white/70">Processed annually</p>
            </div>
            <div>
              <p className="text-3xl font-bold">50K+</p>
              <p className="text-sm text-white/70">Business clients</p>
            </div>
            <div>
              <p className="text-3xl font-bold">35+</p>
              <p className="text-sm text-white/70">Countries</p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-4 text-sm text-white/60">
          <span>Regulated by ACPR</span>
          <span>•</span>
          <span>SEPA Licensed</span>
          <span>•</span>
          <span>PCI DSS Compliant</span>
        </div>
      </div>

      {/* Right Side - Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 bg-gray-50">
        <div className="w-full max-w-md">
          {/* Mobile Logo */}
          <div className="lg:hidden mb-8 text-center">
            <Link href={`/${locale}`} className="inline-flex items-center gap-3">
              <div className="w-10 h-10 bg-[#b59354] rounded-lg flex items-center justify-center">
                <span className="text-xl font-bold text-white">O</span>
              </div>
              <span className="text-2xl font-bold text-[#b59354]">Opulanz</span>
            </Link>
          </div>

          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8">

            {/* ── STEP 1: CREDENTIALS ─────────────────────────── */}
            {step === "credentials" && (
              <>
                <div className="text-center mb-8">
                  <h2 className="text-2xl font-bold text-gray-900">Welcome Back</h2>
                  <p className="text-gray-600 mt-2">Sign in to your account</p>
                </div>

                {fromOpenAccount && (
                  <div className="mb-5 flex items-start gap-3 bg-green-50 border border-green-200 rounded-xl px-4 py-3">
                    <svg className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                    <div>
                      <p className="text-sm font-semibold text-green-800">Application submitted!</p>
                      <p className="text-xs text-green-700 mt-0.5">Sign in to access your dashboard and complete any remaining steps.</p>
                    </div>
                  </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-5">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Email Address</label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                      <input
                        type="email"
                        value={email}
                        onChange={(e) => { setEmail(e.target.value); setError(""); }}
                        placeholder="name@company.com"
                        className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#b59354] focus:border-transparent outline-none transition"
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Password</label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                      <input
                        type={showPassword ? "text" : "password"}
                        value={password}
                        onChange={(e) => { setPassword(e.target.value); setError(""); }}
                        placeholder="Enter your password"
                        className="w-full pl-10 pr-12 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#b59354] focus:border-transparent outline-none transition"
                        required
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                      >
                        {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                      </button>
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-500">Two-factor authentication required</span>
                    <Link href={`/${locale}/forgot-password`} className="text-sm text-[#b59354] hover:underline font-medium">
                      Forgot Password?
                    </Link>
                  </div>

                  {error && (
                    <div className="bg-red-50 border border-red-200 rounded-lg px-4 py-3 text-sm text-red-700">
                      {error}
                    </div>
                  )}

                  <Button
                    type="submit"
                    disabled={isLoading}
                    className="w-full bg-[#b59354] hover:bg-[#886844] text-white py-3 rounded-lg font-semibold flex items-center justify-center gap-2 transition"
                  >
                    {isLoading ? (
                      <Loader2 className="w-5 h-5 animate-spin" />
                    ) : (
                      <>Sign In <ArrowRight className="h-5 w-5" /></>
                    )}
                  </Button>
                </form>

                {/* Divider */}
                <div className="relative my-6">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-gray-200" />
                  </div>
                  <div className="relative flex justify-center text-sm">
                    <span className="px-4 bg-white text-gray-500">Or continue with</span>
                  </div>
                </div>

                {/* Social Login */}
                <div className="grid grid-cols-2 gap-3">
                  <button className="flex items-center justify-center gap-2 px-4 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition">
                    <svg className="w-5 h-5" viewBox="0 0 24 24">
                      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                      <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                    </svg>
                    <span className="text-sm font-medium text-gray-700">Google</span>
                  </button>
                  <button className="flex items-center justify-center gap-2 px-4 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition">
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12.152 6.896c-.948 0-2.415-1.078-3.96-1.04-2.04.027-3.91 1.183-4.961 3.014-2.117 3.675-.546 9.103 1.519 12.09 1.013 1.454 2.208 3.09 3.792 3.039 1.52-.065 2.09-.987 3.935-.987 1.831 0 2.35.987 3.96.948 1.637-.026 2.676-1.48 3.676-2.948 1.156-1.688 1.636-3.325 1.662-3.415-.039-.013-3.182-1.221-3.22-4.857-.026-3.04 2.48-4.494 2.597-4.559-1.429-2.09-3.623-2.324-4.39-2.376-2-.156-3.675 1.09-4.61 1.09zM15.53 3.83c.843-1.012 1.4-2.427 1.245-3.83-1.207.052-2.662.805-3.532 1.818-.78.896-1.454 2.338-1.273 3.714 1.338.104 2.715-.688 3.559-1.701"/>
                    </svg>
                    <span className="text-sm font-medium text-gray-700">Apple</span>
                  </button>
                </div>

                <p className="text-center mt-6 text-sm text-gray-600">
                  Don&apos;t have an account?{" "}
                  <Link href={`/${locale}/auth/signup`} className="text-[#b59354] hover:underline font-semibold">
                    Sign Up
                  </Link>
                </p>
              </>
            )}

            {/* ── STEP 2: EMAIL OTP ────────────────────────────── */}
            {step === "email-otp" && (
              <div className="text-center">
                <div className="w-16 h-16 bg-[#b59354]/10 rounded-2xl flex items-center justify-center mx-auto mb-5">
                  <Mail className="h-8 w-8 text-[#b59354]" />
                </div>
                <h2 className="text-2xl font-bold text-gray-900 mb-2">Check your email</h2>
                <p className="text-gray-600 mb-6">
                  We sent a verification code to<br />
                  <strong>{email}</strong>
                </p>

                <OtpInput value={otp} onChange={(v) => { setOtp(v); setError(""); }} disabled={isLoading} />

                {error && (
                  <div className="mt-4 bg-red-50 border border-red-200 rounded-lg px-4 py-3 text-sm text-red-700">
                    {error}
                  </div>
                )}

                <Button
                  onClick={handleEmailOtp}
                  disabled={otp.length < 6 || isLoading}
                  className="w-full mt-6 bg-[#b59354] hover:bg-[#886844] text-white py-3 rounded-lg font-semibold flex items-center justify-center gap-2"
                >
                  {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : <>Verify <ArrowRight className="h-5 w-5" /></>}
                </Button>

                <button
                  onClick={() => handleResend("email")}
                  disabled={resending}
                  className="mt-4 flex items-center gap-1.5 text-sm text-gray-500 hover:text-[#b59354] transition mx-auto"
                >
                  <RefreshCw className={`h-3.5 w-3.5 ${resending ? "animate-spin" : ""}`} />
                  {resent ? "Code resent!" : "Resend code"}
                </button>

                <button onClick={() => { setStep("credentials"); setError(""); setOtp(""); }} className="mt-3 text-sm text-gray-400 hover:text-gray-600 transition">
                  ← Back
                </button>
              </div>
            )}

            {/* ── STEP 3: PHONE OTP ────────────────────────────── */}
            {step === "phone-otp" && (
              <div className="text-center">
                <div className="w-16 h-16 bg-[#b59354]/10 rounded-2xl flex items-center justify-center mx-auto mb-5">
                  <Smartphone className="h-8 w-8 text-[#b59354]" />
                </div>
                <h2 className="text-2xl font-bold text-gray-900 mb-2">Phone verification</h2>
                {smsSent ? (
                  <p className="text-gray-600 mb-6">Enter the SMS code sent to your phone</p>
                ) : (
                  <>
                    <p className="text-gray-600 mb-2">Enter your phone verification code</p>
                    <p className="text-xs text-amber-700 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2 mb-6">
                      Twilio not configured — check the backend console for your OTP code
                    </p>
                  </>
                )}

                <OtpInput value={otp} onChange={(v) => { setOtp(v); setError(""); }} disabled={isLoading} />

                {error && (
                  <div className="mt-4 bg-red-50 border border-red-200 rounded-lg px-4 py-3 text-sm text-red-700">
                    {error}
                  </div>
                )}

                <Button
                  onClick={handlePhoneOtp}
                  disabled={otp.length < 6 || isLoading}
                  className="w-full mt-6 bg-[#b59354] hover:bg-[#886844] text-white py-3 rounded-lg font-semibold flex items-center justify-center gap-2"
                >
                  {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : <>Sign In <ArrowRight className="h-5 w-5" /></>}
                </Button>

                <button
                  onClick={() => handleResend("phone")}
                  disabled={resending}
                  className="mt-4 flex items-center gap-1.5 text-sm text-gray-500 hover:text-[#b59354] transition mx-auto"
                >
                  <RefreshCw className={`h-3.5 w-3.5 ${resending ? "animate-spin" : ""}`} />
                  {resent ? "Code resent!" : "Resend code"}
                </button>
              </div>
            )}
          </div>

          {/* Security Badge */}
          <div className="mt-6 flex items-center justify-center gap-2 text-sm text-gray-500">
            <Lock className="h-4 w-4" />
            <span>Secured with 256-bit SSL encryption</span>
          </div>
        </div>
      </div>
    </div>
  );
}
