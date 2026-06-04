"use client";

import * as React from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { Eye, EyeOff, Loader2, User, Building2 } from "lucide-react";
import { PageGuidance } from "@/components/page-guidance";

const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

export default function SignupPage() {
  const params = useParams();
  const locale = params.locale as string;
  const router = useRouter();

  const [accountType, setAccountType] = React.useState<"individual" | "corporate">("individual");
  const [form, setForm] = React.useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
  });
  const [showPass, setShowPass] = React.useState(false);
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState("");

  function set(field: string, value: string) {
    setForm((f) => ({ ...f, [field]: value }));
    setError("");
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (form.password !== form.confirmPassword) {
      setError("Passwords do not match");
      return;
    }
    if (form.password.length < 8) {
      setError("Password must be at least 8 characters");
      return;
    }
    setLoading(true);
    try {
      const res = await fetch(`${API}/api/auth/signup`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          firstName: form.firstName,
          lastName: form.lastName,
          email: form.email,
          phone: form.phone,
          password: form.password,
          accountType,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      sessionStorage.setItem("auth_user_id", String(data.userId));
      sessionStorage.setItem("auth_email", form.email);
      sessionStorage.setItem("auth_phone", form.phone);
      sessionStorage.setItem("auth_account_type", accountType);

      router.push(`/${locale}/auth/verify-email`);
    } catch (err: any) {
      setError(err.message || "Failed to create account");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#f6f8f8] to-white flex items-center justify-center p-4">
      <PageGuidance
        pageKey="auth-signup"
        locale={locale}
        title="Create Your Account"
        description="Sign up for Opulanz in just a few steps."
        steps={[
          { content: "Let's create your Opulanz account. The signup process takes less than 2 minutes." },
          { title: "Account Type", content: "First, choose whether you're signing up as an Individual or as a Business. This determines what features you'll have access to.", target: "select, [role='radiogroup'], .grid.gap-3", position: "bottom" },
          { title: "Your Email", content: "Enter your email address — this will be your login and where we send notifications and your verification code.", target: "input[type='email']", position: "bottom" },
          { title: "Create Account", content: "Click this button to submit. You'll receive a verification email — click the link to activate your account and start using Opulanz.", target: "button[type='submit']", position: "top" },
        ]}
        tip="Use a strong password with uppercase letters, numbers, and symbols."
      />
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
          <div className="grid grid-cols-2 gap-3 mb-6">
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

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1.5">First Name</label>
                <input
                  type="text"
                  required
                  value={form.firstName}
                  onChange={(e) => set("firstName", e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#b59354]/30 focus:border-[#b59354]"
                  placeholder="John"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1.5">Last Name</label>
                <input
                  type="text"
                  required
                  value={form.lastName}
                  onChange={(e) => set("lastName", e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#b59354]/30 focus:border-[#b59354]"
                  placeholder="Doe"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1.5">Email Address</label>
              <input
                type="email"
                required
                value={form.email}
                onChange={(e) => set("email", e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#b59354]/30 focus:border-[#b59354]"
                placeholder="john@example.com"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1.5">
                Phone Number <span className="font-normal text-gray-400">(include country code)</span>
              </label>
              <input
                type="tel"
                required
                value={form.phone}
                onChange={(e) => set("phone", e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#b59354]/30 focus:border-[#b59354]"
                placeholder="+352 691 234 567"
              />
              <p className="text-xs text-gray-400 mt-1">Start with + and your country code (e.g. +352, +33)</p>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1.5">Password</label>
              <div className="relative">
                <input
                  type={showPass ? "text" : "password"}
                  required
                  value={form.password}
                  onChange={(e) => set("password", e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#b59354]/30 focus:border-[#b59354] pr-10"
                  placeholder="Min. 8 characters"
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

            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1.5">Confirm Password</label>
              <input
                type="password"
                required
                value={form.confirmPassword}
                onChange={(e) => set("confirmPassword", e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#b59354]/30 focus:border-[#b59354]"
                placeholder="Repeat password"
              />
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-3 text-sm text-red-700">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-[#b59354] text-white rounded-xl font-semibold text-sm hover:bg-[#886844] transition-colors disabled:opacity-50 flex items-center justify-center gap-2 mt-2"
            >
              {loading && <Loader2 className="h-4 w-4 animate-spin" />}
              Create Account
            </button>
          </form>

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
