"use client";

import * as React from "react";
import Link from "next/link";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { useGoogleLogin } from "@react-oauth/google";
import { Eye, EyeOff, Loader2, Lock } from "lucide-react";
import { setAuthToken } from "@/lib/auth";

const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

function LoginForm() {
  const params = useParams();
  const router = useRouter();
  const locale = params.locale as string;
  const searchParams = useSearchParams();
  const fromOpenAccount = searchParams.get("from") === "open-account";

  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState("");

  // Email + password sign in
  const [email, setEmail] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [showPassword, setShowPassword] = React.useState(false);
  const [emailLoading, setEmailLoading] = React.useState(false);

  // Google Authenticator 2FA step
  const [requires2FA, setRequires2FA] = React.useState(false);
  const [tempToken, setTempToken] = React.useState("");
  const [totpCode, setTotpCode] = React.useState("");
  const [totpLoading, setTotpLoading] = React.useState(false);

  async function handleEmailSignIn(e: React.FormEvent) {
    e.preventDefault();
    setEmailLoading(true);
    setError("");
    try {
      const res = await fetch(`${API}/api/auth/signin-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Sign in failed");

      if (data.requires2FA) {
        // User has Google Authenticator — show TOTP step
        setTempToken(data.tempToken);
        setRequires2FA(true);
      } else {
        setAuthToken(data.token);
        sessionStorage.setItem("auth_account_type", data.user?.account_type || "individual");
        router.push(`/${locale}/dashboard`);
      }
    } catch (err: any) {
      setError(err.message || "Sign in failed. Please check your credentials.");
    } finally {
      setEmailLoading(false);
    }
  }

  async function handleTotpVerify(e: React.FormEvent) {
    e.preventDefault();
    setTotpLoading(true);
    setError("");
    try {
      const res = await fetch(`${API}/api/auth/verify-totp`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tempToken, code: totpCode }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Invalid code");
      setAuthToken(data.token);
      sessionStorage.setItem("auth_account_type", data.user?.account_type || "individual");
      router.push(`/${locale}/dashboard`);
    } catch (err: any) {
      setError(err.message || "Invalid code. Please check Google Authenticator.");
    } finally {
      setTotpLoading(false);
    }
  }

  async function handleGoogleCredential(credential: string) {
    setLoading(true);
    setError("");
    try {
      const res = await fetch(`${API}/api/auth/google`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ credential }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      setAuthToken(data.token);
      sessionStorage.setItem("auth_account_type", data.accountType || "individual");

      if (data.needsKyc) {
        router.push(`/${locale}/auth/kyc`);
      } else {
        router.push(`/${locale}/dashboard`);
      }
    } catch (err: any) {
      setError(err.message || "Google sign-in failed");
    } finally {
      setLoading(false);
    }
  }

  const login = useGoogleLogin({
    onSuccess: async (tokenResponse) => {
      try {
        setLoading(true);
        const userInfoRes = await fetch("https://www.googleapis.com/oauth2/v3/userinfo", {
          headers: { Authorization: `Bearer ${tokenResponse.access_token}` },
        });
        const userInfo = await userInfoRes.json();
        const payload = btoa(JSON.stringify({
          sub: userInfo.sub,
          email: userInfo.email,
          name: userInfo.name,
          given_name: userInfo.given_name,
          family_name: userInfo.family_name,
          picture: userInfo.picture,
        }));
        const fakeCredential = `header.${payload}.sig`;
        await handleGoogleCredential(fakeCredential);
      } catch {
        setError("Failed to get user info from Google");
        setLoading(false);
      }
    },
    onError: () => {
      setError("Google sign-in was cancelled or failed");
    },
  });

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
            {requires2FA ? (
              <>
                <div className="text-center mb-8">
                  <div className="mb-4 inline-flex h-14 w-14 items-center justify-center rounded-full bg-blue-100">
                    <svg className="h-7 w-7 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                    </svg>
                  </div>
                  <h2 className="text-2xl font-bold text-gray-900">Two-Factor Authentication</h2>
                  <p className="text-gray-600 mt-2">Open Google Authenticator and enter the 6-digit code for Opulanz</p>
                </div>

                {error && (
                  <div className="mb-4 bg-red-50 border border-red-200 rounded-xl px-4 py-3 text-sm text-red-700">{error}</div>
                )}

                <form onSubmit={handleTotpVerify} className="space-y-4">
                  <input
                    type="text"
                    inputMode="numeric"
                    maxLength={6}
                    autoFocus
                    value={totpCode}
                    onChange={(e) => setTotpCode(e.target.value.replace(/\D/g, ""))}
                    placeholder="000000"
                    className="w-full px-4 py-4 border border-gray-200 rounded-xl text-3xl font-mono text-center tracking-widest focus:outline-none focus:ring-2 focus:ring-[#b59354]"
                  />
                  <button
                    type="submit"
                    disabled={totpLoading || totpCode.length < 6}
                    className="w-full py-3.5 px-4 bg-[#b59354] hover:bg-[#886844] text-white rounded-xl font-semibold text-sm transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    {totpLoading && <Loader2 className="h-4 w-4 animate-spin" />}
                    {totpLoading ? "Verifying…" : "Verify & Sign In"}
                  </button>
                  <button type="button" onClick={() => { setRequires2FA(false); setTotpCode(""); setError(""); }}
                    className="w-full text-sm text-gray-500 hover:text-gray-700 py-2">
                    ← Back to sign in
                  </button>
                </form>
              </>
            ) : (
            <>
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold text-gray-900">Welcome Back</h2>
              <p className="text-gray-600 mt-2">Sign in to your account</p>
            </div>

            {fromOpenAccount && (
              <div className="mb-5 flex items-start gap-3 bg-green-50 border border-green-200 rounded-xl px-4 py-3">
                <svg className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <div>
                  <p className="text-sm font-semibold text-green-800">Application submitted!</p>
                  <p className="text-xs text-green-700 mt-0.5">Sign in to access your dashboard and complete any remaining steps.</p>
                </div>
              </div>
            )}

            {error && (
              <div className="mb-4 bg-red-50 border border-red-200 rounded-xl px-4 py-3 text-sm text-red-700">
                {error}
              </div>
            )}

            {/* Google Sign In Button */}
            <button
              type="button"
              onClick={() => login()}
              disabled={loading}
              className="w-full flex items-center justify-center gap-3 py-3.5 px-4 border-2 border-gray-200 rounded-xl font-semibold text-sm text-gray-700 hover:border-[#b59354] hover:bg-[#b59354]/5 transition-all disabled:opacity-50"
            >
              {loading ? (
                <Loader2 className="h-5 w-5 animate-spin text-[#b59354]" />
              ) : (
                <svg className="h-5 w-5" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                </svg>
              )}
              {loading ? "Signing in..." : "Continue with Google"}
            </button>

            {/* Divider */}
            <div className="relative my-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-200" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-4 bg-white text-gray-500">or sign in with email</span>
              </div>
            </div>

            {/* Email + Password Form */}
            <form onSubmit={handleEmailSignIn} className="space-y-4">
              <div className="space-y-1">
                <label htmlFor="login-email" className="text-sm font-medium text-gray-700">Email</label>
                <input
                  id="login-email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#b59354] focus:border-transparent"
                />
              </div>
              <div className="space-y-1">
                <label htmlFor="login-password" className="text-sm font-medium text-gray-700">Password</label>
                <div className="relative">
                  <input
                    id="login-password"
                    type={showPassword ? "text" : "password"}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full px-4 py-3 pr-12 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#b59354] focus:border-transparent"
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
              <button
                type="submit"
                disabled={emailLoading}
                className="w-full py-3.5 px-4 bg-[#b59354] hover:bg-[#886844] text-white rounded-xl font-semibold text-sm transition-all disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {emailLoading && <Loader2 className="h-4 w-4 animate-spin" />}
                {emailLoading ? "Signing in..." : "Sign In"}
              </button>
            </form>

            <p className="mt-6 text-center text-sm text-gray-600">
              Don&apos;t have an account?{" "}
              <Link href={`/${locale}/open-account`} className="text-[#b59354] hover:underline font-semibold">
                Open an Account
              </Link>
            </p>
            </>
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

export default function LoginPage() {
  return (
    <React.Suspense fallback={<div className="flex min-h-screen items-center justify-center"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#b59354]" /></div>}>
      <LoginForm />
    </React.Suspense>
  );
}
