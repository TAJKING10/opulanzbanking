"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  CheckCircle2, Eye, EyeOff, Loader2, Mail, Phone,
  Shield, Building2, RefreshCw
} from "lucide-react";
import { SumsubKycWidget } from "@/components/sumsub-kyc-widget";
import { setAuthToken } from "@/lib/auth";

const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

type InnerStep = "contact-info" | "kyc" | "email-otp" | "sms-otp" | "set-password" | "complete";

interface OtpBoxProps {
  value: string;
  onChange: (v: string) => void;
  disabled?: boolean;
}

function OtpBox({ value, onChange, disabled }: OtpBoxProps) {
  const refs = React.useRef<(HTMLInputElement | null)[]>([]);
  const digits = value.split("").concat(Array(6).fill("")).slice(0, 6);

  const update = (i: number, char: string) => {
    const d = char.replace(/\D/g, "").slice(-1);
    const next = [...digits];
    next[i] = d;
    onChange(next.join(""));
    if (d && i < 5) refs.current[i + 1]?.focus();
  };

  const onKeyDown = (i: number, e: React.KeyboardEvent) => {
    if (e.key === "Backspace" && !digits[i] && i > 0) refs.current[i - 1]?.focus();
  };

  const onPaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6);
    onChange(pasted.padEnd(6, "").slice(0, 6));
    refs.current[Math.min(pasted.length, 5)]?.focus();
  };

  return (
    <div className="flex gap-2 sm:gap-3 justify-center">
      {digits.map((d, i) => (
        <input
          key={i}
          ref={(el) => { refs.current[i] = el; }}
          type="text"
          inputMode="numeric"
          maxLength={1}
          value={d}
          disabled={disabled}
          onChange={(e) => update(i, e.target.value)}
          onKeyDown={(e) => onKeyDown(i, e)}
          onPaste={onPaste}
          className="w-10 h-12 sm:w-12 sm:h-14 text-center text-xl sm:text-2xl font-bold rounded-xl border-2 border-gray-200 focus:border-[#b59354] focus:outline-none bg-white transition-colors disabled:opacity-50"
        />
      ))}
    </div>
  );
}

interface BusinessSubmissionStepProps {
  data: any;
  onUpdate: (data: any) => void;
  locale: string;
}

export function BusinessSubmissionStep({ data, onUpdate, locale }: BusinessSubmissionStepProps) {
  const router = useRouter();

  const [innerStep, setInnerStep] = React.useState<InnerStep>("contact-info");
  const [applicationId, setApplicationId] = React.useState<number | null>(null);
  const hasSavedRef = React.useRef(false);

  // Contact info (collected in first step since business form has no phone)
  const primaryEmail = data.directors?.[0]?.email || data.email || "";
  const [contactEmail, setContactEmail] = React.useState(primaryEmail);
  const [contactPhone, setContactPhone] = React.useState(data.phone || "");
  const [contactInfoError, setContactInfoError] = React.useState("");

  // OTP state
  const [emailOtp, setEmailOtp] = React.useState("");
  const [smsOtp, setSmsOtp] = React.useState("");
  const [otpLoading, setOtpLoading] = React.useState(false);
  const [otpError, setOtpError] = React.useState("");
  const [smsViaTwilio, setSmsViaTwilio] = React.useState(true);
  const [resendCooldown, setResendCooldown] = React.useState(0);

  // Password state
  const [password, setPassword] = React.useState("");
  const [confirmPassword, setConfirmPassword] = React.useState("");
  const [showPwd, setShowPwd] = React.useState(false);
  const [pwdLoading, setPwdLoading] = React.useState(false);
  const [pwdError, setPwdError] = React.useState("");

  // Complete state
  const [iban, setIban] = React.useState("");
  const [bic, setBic] = React.useState("");

  // Derived
  const fullPhone = contactPhone.startsWith("+") ? contactPhone : `+${contactPhone}`;

  // Resend cooldown countdown
  React.useEffect(() => {
    if (resendCooldown <= 0) return;
    const t = setTimeout(() => setResendCooldown((c) => c - 1), 1000);
    return () => clearTimeout(t);
  }, [resendCooldown]);

  // Save application to backend (once)
  async function saveApplication(): Promise<number | null> {
    if (hasSavedRef.current) return applicationId;
    hasSavedRef.current = true;
    try {
      const director = data.directors?.[0] || {};
      const res = await fetch(`${API}/api/applications`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: "company",
          status: "submitted",
          payload: {
            companyStatus: data.companyStatus,
            companyName: data.companyName,
            registrationNumber: data.registrationNumber,
            jurisdiction: data.jurisdiction,
            directors: data.directors || [],
            ubos: data.ubos || [],
            formationDetails: data.formationDetails || null,
            documents: data.documents?.map((doc: any) => ({ name: doc.name, type: doc.type, size: doc.size })) || [],
            consents: data.consents || {},
            contactEmail,
            contactPhone: fullPhone,
            submittedAt: new Date().toISOString(),
          },
        }),
      });
      const result = await res.json();
      const id = result.data?.id || null;
      setApplicationId(id);
      localStorage.removeItem("business-account-progress");
      return id;
    } catch {
      return null;
    }
  }

  // Contact info → KYC
  async function handleContactInfoNext() {
    setContactInfoError("");
    if (!contactEmail || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(contactEmail)) {
      setContactInfoError("Please enter a valid email address");
      return;
    }
    if (!contactPhone || contactPhone.replace(/\D/g, "").length < 7) {
      setContactInfoError("Please enter a valid phone number");
      return;
    }
    setInnerStep("kyc");
  }

  // Called when Sumsub KYC passes
  async function handleSumsubComplete() {
    await saveApplication();
    try {
      await fetch(`${API}/api/auth/pre-register/send-email-otp`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: contactEmail }),
      });
    } catch { /* non-blocking */ }
    setResendCooldown(60);
    setInnerStep("email-otp");
  }

  async function handleVerifyEmailOtp() {
    if (emailOtp.length !== 6) return;
    setOtpLoading(true);
    setOtpError("");
    try {
      const res = await fetch(`${API}/api/auth/pre-register/verify-email-otp`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: contactEmail, otp: emailOtp }),
      });
      if (!res.ok) {
        const d = await res.json();
        setOtpError(d.error || "Invalid or expired code");
        return;
      }
      const smsRes = await fetch(`${API}/api/auth/pre-register/send-sms-otp`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone: fullPhone, email: contactEmail }),
      });
      const smsData = await smsRes.json();
      setSmsViaTwilio(smsData.smsSent === true);
      setResendCooldown(60);
      setInnerStep("sms-otp");
    } finally {
      setOtpLoading(false);
    }
  }

  async function handleVerifySmsOtp() {
    if (smsOtp.length !== 6) return;
    setOtpLoading(true);
    setOtpError("");
    try {
      const res = await fetch(`${API}/api/auth/pre-register/verify-sms-otp`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone: fullPhone, otp: smsOtp, email: contactEmail }),
      });
      if (!res.ok) {
        const d = await res.json();
        setOtpError(d.error || "Invalid or expired code");
        return;
      }
      setInnerStep("set-password");
    } finally {
      setOtpLoading(false);
    }
  }

  async function handleSetPassword() {
    setPwdError("");
    if (password.length < 8) { setPwdError("Password must be at least 8 characters"); return; }
    if (password !== confirmPassword) { setPwdError("Passwords do not match"); return; }

    setPwdLoading(true);
    try {
      const director = data.directors?.[0] || {};
      const res = await fetch(`${API}/api/auth/register-no-2fa`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          firstName: director.firstName || data.companyName || "Business",
          lastName: director.lastName || "Account",
          email: contactEmail,
          phone: fullPhone,
          password,
          accountType: "corporate",
          applicationId,
        }),
      });
      const result = await res.json();
      if (!res.ok) {
        setPwdError(result.error || "Failed to create account");
        return;
      }
      setAuthToken(result.token);
      setIban(result.iban || "");
      setBic(result.bic || "");
      setInnerStep("complete");
    } finally {
      setPwdLoading(false);
    }
  }

  // Auto-submit OTP when 6 digits entered
  React.useEffect(() => {
    if (emailOtp.length === 6 && !otpLoading && innerStep === "email-otp") handleVerifyEmailOtp();
  }, [emailOtp]);

  React.useEffect(() => {
    if (smsOtp.length === 6 && !otpLoading && innerStep === "sms-otp") handleVerifySmsOtp();
  }, [smsOtp]);

  // Password strength
  const pwdStrength = password.length === 0 ? 0
    : password.length < 8 ? 1
    : /[A-Z]/.test(password) && /[0-9]/.test(password) && /[^A-Za-z0-9]/.test(password) ? 3
    : 2;
  const pwdStrengthLabel = ["", "Weak", "Good", "Strong"][pwdStrength];
  const pwdStrengthColor = ["", "bg-red-400", "bg-yellow-400", "bg-green-500"][pwdStrength];

  // ── Contact Info Step ──────────────────────────────────────────────────────
  if (innerStep === "contact-info") {
    return (
      <div className="max-w-md mx-auto space-y-6">
        <div className="text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-[#b59354]/10">
            <Building2 className="h-8 w-8 text-[#b59354]" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Confirm Contact Details</h2>
          <p className="text-gray-500 text-sm">
            We'll send verification codes to these details before creating your business account.
          </p>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Contact Email</label>
            <input
              type="email"
              value={contactEmail}
              onChange={(e) => setContactEmail(e.target.value)}
              placeholder="contact@company.com"
              className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-[#b59354] focus:outline-none text-sm transition-colors"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Contact Phone Number</label>
            <input
              type="tel"
              value={contactPhone}
              onChange={(e) => setContactPhone(e.target.value)}
              placeholder="+33 6 12 34 56 78"
              className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-[#b59354] focus:outline-none text-sm transition-colors"
            />
            <p className="text-xs text-gray-400 mt-1">Include country code (e.g. +33 for France)</p>
          </div>
        </div>

        {contactInfoError && (
          <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-3 text-sm text-red-700 text-center">
            {contactInfoError}
          </div>
        )}

        <button
          onClick={handleContactInfoNext}
          className="w-full py-3 bg-[#b59354] text-white rounded-xl font-semibold text-sm hover:bg-[#886844] transition-colors"
        >
          Continue to Verification
        </button>
      </div>
    );
  }

  // ── KYC Step ──────────────────────────────────────────────────────────────
  if (innerStep === "kyc") {
    return (
      <div className="space-y-6">
        <div className="text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-[#b59354]/10">
            <Shield className="h-8 w-8 text-[#b59354]" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Business Verification</h2>
          <p className="text-gray-500 text-sm max-w-md mx-auto">
            To open a business account, we need to verify your identity as an authorised representative. This is required by financial regulations.
          </p>
        </div>

        <div className="bg-gray-50 rounded-2xl border border-gray-100 p-6">
          <h3 className="font-semibold text-gray-900 mb-3">What you'll need:</h3>
          <ul className="space-y-2 text-sm text-gray-600">
            {[
              "A valid government-issued photo ID (passport or national ID)",
              "A device with a camera for the selfie check",
              "Company registration documents",
              "Proof of business address (last 3 months)",
            ].map((item, i) => (
              <li key={i} className="flex items-start gap-2">
                <span className="text-[#b59354] font-bold mt-0.5">✓</span>
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </div>

        <SumsubKycWidget
          userId={contactEmail || `business-${Date.now()}`}
          levelName="corporate_signup_kyc"
          onClose={() => {/* keep on KYC step */}}
          onComplete={handleSumsubComplete}
        />
      </div>
    );
  }

  // ── Email OTP ─────────────────────────────────────────────────────────────
  if (innerStep === "email-otp") {
    return (
      <div className="max-w-md mx-auto space-y-6">
        <div className="text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-[#b59354]/10">
            <Mail className="h-8 w-8 text-[#b59354]" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Check your email</h2>
          <p className="text-gray-500 text-sm">
            We sent a 6-digit verification code to<br />
            <strong className="text-gray-900">{contactEmail}</strong>
          </p>
        </div>

        <OtpBox value={emailOtp} onChange={setEmailOtp} disabled={otpLoading} />

        {otpError && (
          <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-3 text-sm text-red-700 text-center">
            {otpError}
          </div>
        )}

        <button
          onClick={handleVerifyEmailOtp}
          disabled={emailOtp.length !== 6 || otpLoading}
          className="w-full py-3 bg-[#b59354] text-white rounded-xl font-semibold text-sm hover:bg-[#886844] transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
        >
          {otpLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Verify Email"}
        </button>

        <div className="text-center">
          {resendCooldown > 0 ? (
            <p className="text-sm text-gray-400">Resend in {resendCooldown}s</p>
          ) : (
            <button
              onClick={async () => {
                await fetch(`${API}/api/auth/pre-register/send-email-otp`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ email: contactEmail }) });
                setResendCooldown(60);
              }}
              className="text-sm text-[#b59354] hover:underline flex items-center gap-1 mx-auto"
            >
              <RefreshCw className="h-3.5 w-3.5" /> Resend code
            </button>
          )}
        </div>
      </div>
    );
  }

  // ── SMS OTP ───────────────────────────────────────────────────────────────
  if (innerStep === "sms-otp") {
    return (
      <div className="max-w-md mx-auto space-y-6">
        <div className="text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-[#b59354]/10">
            <Phone className="h-8 w-8 text-[#b59354]" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Phone verification</h2>
          <p className="text-gray-500 text-sm">
            {smsViaTwilio
              ? <><br />Code sent to <strong className="text-gray-900">{fullPhone}</strong></>
              : <>SMS unavailable — code sent to <strong className="text-gray-900">{contactEmail}</strong></>
            }
          </p>
        </div>

        <OtpBox value={smsOtp} onChange={setSmsOtp} disabled={otpLoading} />

        {otpError && (
          <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-3 text-sm text-red-700 text-center">
            {otpError}
          </div>
        )}

        <button
          onClick={handleVerifySmsOtp}
          disabled={smsOtp.length !== 6 || otpLoading}
          className="w-full py-3 bg-[#b59354] text-white rounded-xl font-semibold text-sm hover:bg-[#886844] transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
        >
          {otpLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Verify Phone"}
        </button>

        <div className="text-center">
          {resendCooldown > 0 ? (
            <p className="text-sm text-gray-400">Resend in {resendCooldown}s</p>
          ) : (
            <button
              onClick={async () => {
                const smsRes = await fetch(`${API}/api/auth/pre-register/send-sms-otp`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ phone: fullPhone, email: contactEmail }) });
                const smsData = await smsRes.json();
                setSmsViaTwilio(smsData.smsSent === true);
                setResendCooldown(60);
              }}
              className="text-sm text-[#b59354] hover:underline flex items-center gap-1 mx-auto"
            >
              <RefreshCw className="h-3.5 w-3.5" /> Resend code
            </button>
          )}
        </div>
      </div>
    );
  }

  // ── Set Password ──────────────────────────────────────────────────────────
  if (innerStep === "set-password") {
    return (
      <div className="max-w-md mx-auto space-y-6">
        <div className="text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-[#b59354]/10">
            <Shield className="h-8 w-8 text-[#b59354]" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Set your password</h2>
          <p className="text-gray-500 text-sm">
            Create a secure password for your Opulanz business account.
          </p>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Password</label>
            <div className="relative">
              <input
                type={showPwd ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Min. 8 characters"
                className="w-full px-4 py-3 pr-12 rounded-xl border-2 border-gray-200 focus:border-[#b59354] focus:outline-none text-sm transition-colors"
              />
              <button
                type="button"
                onClick={() => setShowPwd(!showPwd)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                {showPwd ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
              </button>
            </div>
            {password.length > 0 && (
              <div className="mt-2 space-y-1">
                <div className="flex gap-1">
                  {[1, 2, 3].map((l) => (
                    <div key={l} className={`h-1 flex-1 rounded-full transition-colors ${pwdStrength >= l ? pwdStrengthColor : "bg-gray-200"}`} />
                  ))}
                </div>
                <p className={`text-xs font-medium ${["", "text-red-500", "text-yellow-600", "text-green-600"][pwdStrength]}`}>
                  {pwdStrengthLabel}
                </p>
              </div>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Confirm Password</label>
            <input
              type={showPwd ? "text" : "password"}
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Repeat your password"
              className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-[#b59354] focus:outline-none text-sm transition-colors"
            />
          </div>
        </div>

        {pwdError && (
          <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-3 text-sm text-red-700 text-center">
            {pwdError}
          </div>
        )}

        <button
          onClick={handleSetPassword}
          disabled={!password || !confirmPassword || pwdLoading}
          className="w-full py-3 bg-[#b59354] text-white rounded-xl font-semibold text-sm hover:bg-[#886844] transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
        >
          {pwdLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Create Business Account"}
        </button>
      </div>
    );
  }

  // ── Complete ──────────────────────────────────────────────────────────────
  return (
    <div className="max-w-md mx-auto space-y-6 text-center">
      <div>
        <div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-green-100">
          <CheckCircle2 className="h-12 w-12 text-green-600" />
        </div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Business Account Created!</h2>
        <p className="text-gray-500 text-sm">
          Your Opulanz business account is ready. Sign in using SMS and email two-factor authentication.
        </p>
      </div>

      {(iban || bic) && (
        <div className="bg-gray-50 rounded-2xl border border-gray-100 p-5 text-left space-y-3">
          {iban && (
            <div>
              <p className="text-xs text-gray-400 uppercase tracking-wide font-medium">IBAN</p>
              <p className="font-mono text-sm font-semibold text-gray-900 mt-0.5 break-all">{iban}</p>
            </div>
          )}
          {bic && (
            <div>
              <p className="text-xs text-gray-400 uppercase tracking-wide font-medium">BIC / SWIFT</p>
              <p className="font-mono text-sm font-semibold text-gray-900 mt-0.5">{bic}</p>
            </div>
          )}
        </div>
      )}

      <div className="bg-blue-50 rounded-2xl p-4 text-left">
        <p className="text-sm font-semibold text-blue-900 mb-1">Two-factor authentication enabled</p>
        <p className="text-xs text-blue-700">
          Each time you sign in, a verification code will be sent to your email and phone — keeping your business account secure.
        </p>
      </div>

      <Link
        href={`/${locale}/dashboard`}
        className="block w-full py-3 bg-[#b59354] text-white rounded-xl font-semibold text-sm hover:bg-[#886844] transition-colors"
      >
        Go to Dashboard
      </Link>

      <Link
        href={`/${locale}`}
        className="block text-sm text-gray-400 hover:text-gray-600 transition-colors"
      >
        Return to homepage
      </Link>
    </div>
  );
}
