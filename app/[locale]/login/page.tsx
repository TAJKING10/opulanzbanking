"use client";

import * as React from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { Eye, EyeOff, Mail, Lock, ArrowRight, Smartphone, RefreshCw, Loader2 } from "lucide-react";
import { PageGuidance } from "@/components/page-guidance";
import { Button } from "@/components/ui/button";
import { OtpInput } from "@/components/otp-input";
import { setAuthToken } from "@/lib/auth";
import { useGoogleLogin } from "@react-oauth/google";

const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";
type Step = "credentials" | "email-otp" | "phone-otp";

export default function LoginPage() {
  const params = useParams();
  const router = useRouter();
  const locale = params.locale as string;
  const p = useTranslations("login.page");

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
      setError(err.message || p("errors.invalidCredentials"));
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
      setError(err.message || p("errors.invalidCode"));
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
      setError(err.message || p("errors.invalidCode"));
    } finally {
      setIsLoading(false);
    }
  };

  const [googleLoading, setGoogleLoading] = React.useState(false);

  const handleGoogleLogin = useGoogleLogin({
    onSuccess: async (tokenResponse) => {
      setGoogleLoading(true);
      setError("");
      try {
        const userInfoRes = await fetch("https://www.googleapis.com/oauth2/v3/userinfo", {
          headers: { Authorization: `Bearer ${tokenResponse.access_token}` },
        });
        const userInfo = await userInfoRes.json();
        const payload = btoa(JSON.stringify(userInfo));
        const credential = `header.${payload}.sig`;

        const res = await fetch(`${API}/api/auth/google`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ credential }),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || p("errors.googleFailed"));
        setAuthToken(data.token);
        if (data.needsKyc) {
          router.push(`/${locale}/auth/kyc`);
        } else {
          router.push(`/${locale}/dashboard`);
        }
      } catch (err: any) {
        setError(err.message || p("errors.googleFailed"));
      } finally {
        setGoogleLoading(false);
      }
    },
    onError: () => {
      setError(p("errors.googleCancelled"));
    },
  });

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
      <PageGuidance
        pageKey="login"
        locale={locale}
        title="Sign In to Opulanz"
        description="Access your Opulanz account securely with two-step verification."
        steps={[
          { content: "Welcome back. Sign in securely to access your Opulanz dashboard, portfolio, and services." },
          { title: "Your Email", content: "Enter the email address you registered with. This is used to identify your account.", target: "input[type='email']", position: "bottom" },
          { title: "Your Password", content: "Enter your password here. It's stored securely and never visible to anyone.", target: "input[type='password']", position: "bottom" },
          { title: "Sign In", content: "Click this button to sign in. A one-time 6-digit code will be sent to your email to verify it's really you.", target: "button[type='submit']", position: "top" },
        ]}
        tip="Forgot your password? Click the 'Forgot password?' link below the sign-in form to reset it."
      />
      {/* Left Side - Branding */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-[#b59354] to-[#886844] text-white flex-col justify-between p-12">
        <div />

        <div className="space-y-6">
          <h1 className="text-4xl font-bold leading-tight">
            {p("branding.tagline")}
          </h1>
          <p className="text-lg text-white/80 max-w-md">
            {p("branding.description")}
          </p>
          <div className="flex items-center gap-8 pt-8">
            <div>
              <p className="text-3xl font-bold">€2.5B+</p>
              <p className="text-sm text-white/70">{p("branding.stats.volume")}</p>
            </div>
            <div>
              <p className="text-3xl font-bold">50K+</p>
              <p className="text-sm text-white/70">{p("branding.stats.clients")}</p>
            </div>
            <div>
              <p className="text-3xl font-bold">35+</p>
              <p className="text-sm text-white/70">{p("branding.stats.countries")}</p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-4 text-sm text-white/60">
          <span>{p("branding.compliance.acpr")}</span>
          <span>•</span>
          <span>{p("branding.compliance.sepa")}</span>
          <span>•</span>
          <span>{p("branding.compliance.pci")}</span>
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
                  <h2 className="text-2xl font-bold text-gray-900">{p("credentials.title")}</h2>
                  <p className="text-gray-600 mt-2">{p("credentials.subtitle")}</p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-5">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">{p("credentials.emailLabel")}</label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                      <input
                        type="email"
                        value={email}
                        onChange={(e) => { setEmail(e.target.value); setError(""); }}
                        placeholder={p("credentials.emailPlaceholder")}
                        className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#b59354] focus:border-transparent outline-none transition"
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">{p("credentials.passwordLabel")}</label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                      <input
                        type={showPassword ? "text" : "password"}
                        value={password}
                        onChange={(e) => { setPassword(e.target.value); setError(""); }}
                        placeholder={p("credentials.passwordPlaceholder")}
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
                    <span className="text-sm text-gray-500">{p("credentials.twoFactor")}</span>
                    <Link href={`/${locale}/forgot-password`} className="text-sm text-[#b59354] hover:underline font-medium">
                      {p("credentials.forgotPassword")}
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
                      <>{p("credentials.signIn")} <ArrowRight className="h-5 w-5" /></>
                    )}
                  </Button>
                </form>

                {/* Divider */}
                <div className="relative my-6">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-gray-200" />
                  </div>
                  <div className="relative flex justify-center text-sm">
                    <span className="px-4 bg-white text-gray-500">{p("credentials.orContinueWith")}</span>
                  </div>
                </div>

                {/* Social Login */}
                <button
                  type="button"
                  onClick={() => handleGoogleLogin()}
                  disabled={googleLoading}
                  className="w-full flex items-center justify-center gap-3 px-4 py-3 border border-gray-300 rounded-lg bg-white hover:bg-gray-50 hover:border-gray-400 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
                >
                  {googleLoading ? (
                    <Loader2 className="w-5 h-5 animate-spin text-gray-500" />
                  ) : (
                    <svg className="w-5 h-5 flex-shrink-0" viewBox="0 0 24 24">
                      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                      <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                    </svg>
                  )}
                  <span className="text-sm font-semibold text-gray-700">{p("credentials.google")}</span>
                </button>

                <p className="mt-2.5 text-center text-xs text-gray-400">{p("credentials.appleComingSoon")}</p>

                <p className="text-center mt-6 text-sm text-gray-600">
                  {p("credentials.noAccount")}{" "}
                  <Link href={`/${locale}/auth/signup`} className="text-[#b59354] hover:underline font-semibold">
                    {p("credentials.signUp")}
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
                <h2 className="text-2xl font-bold text-gray-900 mb-2">{p("emailOtp.title")}</h2>
                <p className="text-gray-600 mb-6">
                  {p("emailOtp.description")}<br />
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
                  {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : <>{p("emailOtp.verify")} <ArrowRight className="h-5 w-5" /></>}
                </Button>

                <button
                  onClick={() => handleResend("email")}
                  disabled={resending}
                  className="mt-4 flex items-center gap-1.5 text-sm text-gray-500 hover:text-[#b59354] transition mx-auto"
                >
                  <RefreshCw className={`h-3.5 w-3.5 ${resending ? "animate-spin" : ""}`} />
                  {resent ? p("emailOtp.resent") : p("emailOtp.resend")}
                </button>

                <button onClick={() => { setStep("credentials"); setError(""); setOtp(""); }} className="mt-3 text-sm text-gray-400 hover:text-gray-600 transition">
                  {p("emailOtp.back")}
                </button>
              </div>
            )}

            {/* ── STEP 3: PHONE OTP ────────────────────────────── */}
            {step === "phone-otp" && (
              <div className="text-center">
                <div className="w-16 h-16 bg-[#b59354]/10 rounded-2xl flex items-center justify-center mx-auto mb-5">
                  <Smartphone className="h-8 w-8 text-[#b59354]" />
                </div>
                <h2 className="text-2xl font-bold text-gray-900 mb-2">{p("phoneOtp.title")}</h2>
                {smsSent ? (
                  <p className="text-gray-600 mb-6">{p("phoneOtp.descriptionSms")}</p>
                ) : (
                  <p className="text-gray-600 mb-6">{p("phoneOtp.descriptionFallback")}</p>
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
                  {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : <>{p("phoneOtp.signIn")} <ArrowRight className="h-5 w-5" /></>}
                </Button>

                <button
                  onClick={() => handleResend("phone")}
                  disabled={resending}
                  className="mt-4 flex items-center gap-1.5 text-sm text-gray-500 hover:text-[#b59354] transition mx-auto"
                >
                  <RefreshCw className={`h-3.5 w-3.5 ${resending ? "animate-spin" : ""}`} />
                  {resent ? p("phoneOtp.resent") : p("phoneOtp.resend")}
                </button>
              </div>
            )}
          </div>

          {/* Security Badge */}
          <div className="mt-6 flex items-center justify-center gap-2 text-sm text-gray-500">
            <Lock className="h-4 w-4" />
            <span>{p("security")}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
