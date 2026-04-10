"use client";

import * as React from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useGoogleLogin } from "@react-oauth/google";
import { Loader2, User, Building2 } from "lucide-react";
import { setAuthToken } from "@/lib/auth";

const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

export default function SignupPage() {
  const params = useParams();
  const locale = params.locale as string;
  const router = useRouter();

  const [accountType, setAccountType] = React.useState<"individual" | "corporate">("individual");
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState("");

  async function handleGoogleCredential(credential: string) {
    setLoading(true);
    setError("");
    try {
      const res = await fetch(`${API}/api/auth/google`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ credential, accountType }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      setAuthToken(data.token);
      sessionStorage.setItem("auth_account_type", data.accountType || accountType);

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
      // For implicit flow, we get an access token — exchange it for user info
      // then send as a mock credential in demo mode
      try {
        setLoading(true);
        const userInfoRes = await fetch("https://www.googleapis.com/oauth2/v3/userinfo", {
          headers: { Authorization: `Bearer ${tokenResponse.access_token}` },
        });
        const userInfo = await userInfoRes.json();
        // Build a minimal JWT-like payload for demo backend
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
      } catch (err: any) {
        setError("Failed to get user info from Google");
        setLoading(false);
      }
    },
    onError: () => {
      setError("Google sign-in was cancelled or failed");
    },
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#f6f8f8] to-white flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <Link href={`/${locale}`} className="inline-block">
            <h1 className="text-3xl font-bold text-[#252623] tracking-tight">OPULANZ</h1>
            <p className="text-sm text-gray-500 mt-1">Create your account</p>
          </Link>
        </div>

        <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-8">
          {/* Account type selector */}
          <div className="mb-6">
            <p className="text-xs font-semibold text-gray-600 mb-3">Account Type</p>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setAccountType("individual")}
                className={`flex items-center gap-2 p-3 rounded-xl border-2 transition-all text-sm font-medium ${
                  accountType === "individual"
                    ? "border-[#b59354] bg-[#b59354]/5 text-[#b59354]"
                    : "border-gray-200 text-gray-500 hover:border-gray-300"
                }`}
              >
                <User className="h-4 w-4" />
                Individual
              </button>
              <button
                type="button"
                onClick={() => setAccountType("corporate")}
                className={`flex items-center gap-2 p-3 rounded-xl border-2 transition-all text-sm font-medium ${
                  accountType === "corporate"
                    ? "border-[#b59354] bg-[#b59354]/5 text-[#b59354]"
                    : "border-gray-200 text-gray-500 hover:border-gray-300"
                }`}
              >
                <Building2 className="h-4 w-4" />
                Corporate
              </button>
            </div>
          </div>

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
            className="w-full flex items-center justify-center gap-3 py-3 px-4 border-2 border-gray-200 rounded-xl font-semibold text-sm text-gray-700 hover:border-[#b59354] hover:bg-[#b59354]/5 transition-all disabled:opacity-50"
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
              <div className="w-full border-t border-gray-100" />
            </div>
            <div className="relative flex justify-center">
              <span className="bg-white px-3 text-xs text-gray-400">Your data is protected</span>
            </div>
          </div>

          <p className="text-center text-xs text-gray-400">
            By continuing, you agree to our{" "}
            <Link href={`/${locale}/legal/terms`} className="text-[#b59354] hover:underline">Terms of Service</Link>
            {" "}and{" "}
            <Link href={`/${locale}/legal/privacy`} className="text-[#b59354] hover:underline">Privacy Policy</Link>
          </p>

          <p className="text-center text-sm text-gray-500 mt-6">
            Already have an account?{" "}
            <Link href={`/${locale}/auth/signin`} className="text-[#b59354] font-semibold hover:underline">
              Sign In
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
