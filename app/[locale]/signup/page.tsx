"use client";

import * as React from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { Eye, EyeOff, Mail, Lock, User, Building2, ArrowRight, Check } from "lucide-react";
import { PageGuidance } from "@/components/page-guidance";

export default function SignupPage() {
  const params = useParams();
  const router = useRouter();
  const locale = params.locale as string;

  const [accountType, setAccountType] = React.useState<"personal" | "business">("business");
  const [fullName, setFullName] = React.useState("");
  const [email, setEmail] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [confirmPassword, setConfirmPassword] = React.useState("");
  const [showPassword, setShowPassword] = React.useState(false);
  const [acceptTerms, setAcceptTerms] = React.useState(false);
  const [isLoading, setIsLoading] = React.useState(false);
  const [error, setError] = React.useState("");

  const passwordRequirements = [
    { text: "At least 8 characters", met: password.length >= 8 },
    { text: "Contains a number", met: /\d/.test(password) },
    { text: "Contains uppercase letter", met: /[A-Z]/.test(password) },
    { text: "Contains special character", met: /[!@#$%^&*]/.test(password) },
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    if (!acceptTerms) {
      setError("Please accept the terms and conditions");
      return;
    }

    setIsLoading(true);

    // Simulate signup - in production, this would call your auth API
    setTimeout(() => {
      localStorage.setItem("isLoggedIn", "true");
      localStorage.setItem("userEmail", email);
      localStorage.setItem("userName", fullName);
      router.push(`/${locale}/dashboard`);
    }, 1500);
  };

  return (
    <div className="min-h-screen bg-[#f6f6f7] flex">
      <PageGuidance
        pageKey="signup"
        locale={locale}
        title="Create Your Account"
        description="Sign up for Opulanz — takes less than 2 minutes."
        steps={[
          "Select Personal or Business account type",
          "Fill in your full name, email, and a secure password",
          "Click 'Create Account' to register",
          "Check your email to verify your address and activate your account",
        ]}
        tip="After signing up, you'll be guided through identity verification (KYC)."
      />
      {/* Left Side - Branding */}
      <div className="hidden lg:flex lg:flex-1 bg-gradient-to-br from-[#b59354] to-[#886844] text-white flex-col justify-between p-12">
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
            Start Your Business<br />Journey Today
          </h1>
          <p className="text-lg text-white/80 max-w-md">
            Join thousands of businesses using Opulanz for smarter banking, seamless payments, and financial growth.
          </p>

          <div className="space-y-4 pt-8">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
                <Check className="h-6 w-6" />
              </div>
              <div>
                <p className="font-semibold">Free to Open</p>
                <p className="text-sm text-white/70">No setup fees or hidden charges</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
                <Check className="h-6 w-6" />
              </div>
              <div>
                <p className="font-semibold">IBAN in Minutes</p>
                <p className="text-sm text-white/70">Get your dedicated IBAN instantly</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
                <Check className="h-6 w-6" />
              </div>
              <div>
                <p className="font-semibold">Multi-Currency</p>
                <p className="text-sm text-white/70">Hold and exchange 30+ currencies</p>
              </div>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-4 text-sm text-white/60">
          <span>Regulated by ACPR</span>
          <span>.</span>
          <span>SEPA Licensed</span>
          <span>.</span>
          <span>PCI DSS Compliant</span>
        </div>
      </div>

      {/* Right Side - Form */}
      <div className="flex-1 flex items-center justify-center p-8 overflow-y-auto">
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
            <div className="text-center mb-6">
              <h2 className="text-2xl font-bold text-gray-900">Create Account</h2>
              <p className="text-gray-600 mt-2">Start banking with Opulanz</p>
            </div>

            {/* Account Type Selector */}
            <div className="grid grid-cols-2 gap-3 mb-6">
              <button
                type="button"
                onClick={() => setAccountType("personal")}
                className={`flex items-center justify-center gap-2 py-3 px-4 rounded-xl border-2 transition-all ${
                  accountType === "personal"
                    ? "border-[#b59354] bg-[#b59354]/5 text-[#b59354]"
                    : "border-gray-200 text-gray-600 hover:border-gray-300"
                }`}
              >
                <User className="h-5 w-5" />
                <span className="font-medium">Personal</span>
              </button>
              <button
                type="button"
                onClick={() => setAccountType("business")}
                className={`flex items-center justify-center gap-2 py-3 px-4 rounded-xl border-2 transition-all ${
                  accountType === "business"
                    ? "border-[#b59354] bg-[#b59354]/5 text-[#b59354]"
                    : "border-gray-200 text-gray-600 hover:border-gray-300"
                }`}
              >
                <Building2 className="h-5 w-5" />
                <span className="font-medium">Business</span>
              </button>
            </div>

            {error && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Full Name */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {accountType === "business" ? "Company Name" : "Full Name"}
                </label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <input
                    type="text"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder={accountType === "business" ? "Your company name" : "Your full name"}
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#b59354] focus:border-transparent outline-none transition"
                    required
                  />
                </div>
              </div>

              {/* Email */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="name@company.com"
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#b59354] focus:border-transparent outline-none transition"
                    required
                  />
                </div>
              </div>

              {/* Password */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <input
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Create a strong password"
                    className="w-full pl-10 pr-12 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#b59354] focus:border-transparent outline-none transition"
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
                {/* Password Requirements */}
                {password && (
                  <div className="mt-2 grid grid-cols-2 gap-1">
                    {passwordRequirements.map((req, index) => (
                      <div key={index} className="flex items-center gap-1 text-xs">
                        <div className={`w-3 h-3 rounded-full ${req.met ? "bg-green-500" : "bg-gray-300"}`} />
                        <span className={req.met ? "text-green-600" : "text-gray-500"}>{req.text}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Confirm Password */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Confirm Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <input
                    type={showPassword ? "text" : "password"}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Confirm your password"
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#b59354] focus:border-transparent outline-none transition"
                    required
                  />
                </div>
              </div>

              {/* Terms */}
              <label className="flex items-start gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={acceptTerms}
                  onChange={(e) => setAcceptTerms(e.target.checked)}
                  className="w-4 h-4 mt-1 rounded border-gray-300 text-[#b59354] focus:ring-[#b59354]"
                />
                <span className="text-sm text-gray-600">
                  I agree to the{" "}
                  <Link href={`/${locale}/terms`} className="text-[#b59354] hover:underline">
                    Terms of Service
                  </Link>{" "}
                  and{" "}
                  <Link href={`/${locale}/privacy`} className="text-[#b59354] hover:underline">
                    Privacy Policy
                  </Link>
                </span>
              </label>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-[#b59354] hover:bg-[#886844] text-white py-3.5 rounded-xl font-semibold flex items-center justify-center gap-2 transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? (
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <>
                    Create Account
                    <ArrowRight className="h-5 w-5" />
                  </>
                )}
              </button>
            </form>

            {/* Sign In Link */}
            <p className="text-center mt-6 text-sm text-gray-600">
              Already have an account?{" "}
              <Link href={`/${locale}/login`} className="text-[#b59354] hover:underline font-semibold">
                Sign In
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
