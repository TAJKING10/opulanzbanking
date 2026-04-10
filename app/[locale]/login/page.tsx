"use client";

import * as React from "react";
import Link from "next/link";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { useGoogleLogin } from "@react-oauth/google";
import { Loader2, Lock } from "lucide-react";
import { setAuthToken } from "@/lib/auth";

const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

export default function LoginPage() {
  const params = useParams();
  const router = useRouter();
  const locale = params.locale as string;
  const searchParams = useSearchParams();
  const fromOpenAccount = searchParams.get("from") === "open-account";

  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState("");

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

            <div className="relative my-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-200" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-4 bg-white text-gray-500">Your data is protected</span>
              </div>
            </div>

            <p className="text-center text-sm text-gray-600">
              Don&apos;t have an account?{" "}
              <Link href={`/${locale}/auth/signup`} className="text-[#b59354] hover:underline font-semibold">
                Create Account
              </Link>
            </p>
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
