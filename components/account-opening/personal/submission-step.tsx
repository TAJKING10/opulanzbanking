"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  CheckCircle2, Eye, EyeOff, Loader2, Mail, Phone,
  Shield, ExternalLink, RefreshCw
} from "lucide-react";
import { SumsubKycWidget } from "@/components/sumsub-kyc-widget";
import { setAuthToken } from "@/lib/auth";

const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

type InnerStep = "kyc" | "email-otp" | "sms-otp" | "set-password" | "complete";

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
          ref={(el) => (refs.current[i] = el)}
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

interface SubmissionStepProps {
  data: any;
  onUpdate: (data: any) => void;
  locale: string;
}

export function SubmissionStep({ data, onUpdate, locale }: SubmissionStepProps) {
  const router = useRouter();

  const [innerStep, setInnerStep] = React.useState<InnerStep>("kyc");
  const [applicationId, setApplicationId] = React.useState<number | null>(null);
  const [appSaved, setAppSaved] = React.useState(false);
  const hasSavedRef = React.useRef(false);

  // OTP state
  const [emailOtp, setEmailOtp] = React.useState("");
  const [smsOtp, setSmsOtp] = React.useState("");
  const [otpLoading, setOtpLoading] = React.useState(false);
  const [otpError, setOtpError] = React.useState("");
  const [smsViaTwilio, setSmsViaTwilio] = React.useState(true);
  const [resendCooldown, setResendCooldown] = React.useState(0);
  const [demoOtp, setDemoOtp] = React.useState("");

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
  const userEmail = data.email || "";
  const userPhone = data.phone || "";
  const fullPhone = userPhone.startsWith("+") ? userPhone : `+${userPhone}`;

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
      const res = await fetch(`${API}/api/applications`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: "individual",
          status: "submitted",
          payload: {
            firstName: data.firstName,
            lastName: data.lastName,
            email: userEmail,
            phone: fullPhone,
            accountIntent: data.accountIntent,
            residence: data.residence,
            country: data.country,
            currencies: data.currencies,
            monthlyTransfers: data.monthlyTransfers,
            sourceOfFunds: data.sourceOfFunds,
            mode: data.mode,
            consents: data.consents,
            submittedAt: new Date().toISOString(),
          },
        }),
      });
      const result = await res.json();
      const id = result.data?.id || null;
      setApplicationId(id);
      setAppSaved(true);
      localStorage.removeItem("personal-account-progress");
      return id;
    } catch {
      setAppSaved(true);
      return null;
    }
  }

  // Called when Sumsub KYC passes
  async function handleSumsubComplete() {
    await saveApplication();
    try {
      const res = await fetch(`${API}/api/auth/pre-register/send-email-otp`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: userEmail }),
      });
      const data = await res.json();
      // In dev/demo mode the backend returns the OTP for testing
      if (data.demoOtp) setDemoOtp(data.demoOtp);
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
        body: JSON.stringify({ email: userEmail, otp: emailOtp }),
      });
      if (!res.ok) {
        const d = await res.json();
        setOtpError(d.error || "Invalid or expired code");
        return;
      }
      // Send SMS OTP
      const smsRes = await fetch(`${API}/api/auth/pre-register/send-sms-otp`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone: fullPhone, email: userEmail }),
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
        body: JSON.stringify({ phone: fullPhone, otp: smsOtp, email: userEmail }),
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
      const res = await fetch(`${API}/api/auth/register-no-2fa`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          firstName: data.firstName,
          lastName: data.lastName,
          email: userEmail,
          phone: fullPhone,
          password,
          accountType: "individual",
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

  // Auto-submit OTP when complete
  React.useEffect(() => {
    if (emailOtp.length === 6 && !otpLoading && innerStep === "email-otp") handleVerifyEmailOtp();
  }, [emailOtp]);

  React.useEffect(() => {
    if (smsOtp.length === 6 && !otpLoading && innerStep === "sms-otp") handleVerifySmsOtp();
  }, [smsOtp]);

  // ── Private Banking: Send email to contact@opulanz.com ────────────────────
  const [privateSubmitting, setPrivateSubmitting] = React.useState(false);
  const [privateSubmitted, setPrivateSubmitted] = React.useState(false);
  const [privateRef, setPrivateRef] = React.useState("");
  const [privateError, setPrivateError] = React.useState("");

  async function handlePrivateBankingSubmit() {
    setPrivateSubmitting(true);
    setPrivateError("");
    try {
      const appId = await saveApplication();
      const ref = `OPL-PB-${Date.now().toString(36).toUpperCase()}`;
      setPrivateRef(ref);

      await fetch(`${API}/api/notifications/private-banking`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ref,
          applicationId: appId,
          firstName: data.firstName,
          lastName: data.lastName,
          email: userEmail,
          phone: userPhone,
          residence: data.residence,
          country: data.country,
          currencies: data.currencies,
          monthlyTransfers: data.monthlyTransfers,
          sourceOfFunds: data.sourceOfFunds,
          documentsCount: (data.documents || []).length,
        }),
      });

      setPrivateSubmitted(true);
    } catch {
      setPrivateError("An error occurred. Please try again.");
    } finally {
      setPrivateSubmitting(false);
    }
  }

  // For private banking, show simplified submission (no Sumsub)
  if (data.mode === "private" && innerStep === "kyc") {
    if (privateSubmitted) {
      return (
        <div className="max-w-md mx-auto space-y-6 text-center">
          <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-green-100">
            <CheckCircle2 className="h-10 w-10 text-green-600" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Application Submitted</h2>
            <p className="text-gray-500 text-sm">
              Your private banking application has been received. Our team will contact you at{" "}
              <strong className="text-gray-900">{userEmail}</strong> within 1–2 business days.
            </p>
          </div>
          <div className="rounded-2xl bg-gradient-to-r from-[#b59354]/10 to-[#b59354]/5 border border-[#b59354]/20 p-6">
            <p className="text-xs font-semibold uppercase tracking-widest text-gray-400 mb-2">Reference Number</p>
            <p className="text-xl font-bold text-gray-900 font-mono tracking-wider">{privateRef}</p>
          </div>
        </div>
      );
    }

    return (
      <div className="space-y-6">
        <div className="text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-[#b59354]/10">
            <Shield className="h-8 w-8 text-[#b59354]" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Submit Your Application</h2>
          <p className="text-gray-500 text-sm max-w-md mx-auto">
            Your private banking application will be sent to our team at{" "}
            <strong>contact@opulanz.com</strong>. A relationship manager will reach out to you directly.
          </p>
        </div>

        <div className="bg-gray-50 rounded-2xl border border-gray-100 p-6 space-y-3">
          <p className="font-semibold text-gray-900">Application Summary</p>
          <div className="text-sm text-gray-600 space-y-1">
            <p><strong>Name:</strong> {data.firstName} {data.lastName}</p>
            <p><strong>Email:</strong> {userEmail}</p>
            <p><strong>Phone:</strong> {userPhone}</p>
            <p><strong>Documents uploaded:</strong> {(data.documents || []).length}</p>
          </div>
        </div>

        {privateError && (
          <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-3 text-sm text-red-700 text-center">
            {privateError}
          </div>
        )}

        <button
          onClick={handlePrivateBankingSubmit}
          disabled={privateSubmitting}
          className="w-full py-3 bg-[#b59354] text-white rounded-xl font-semibold text-sm hover:bg-[#886844] transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
        >
          {privateSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : "Submit Application"}
        </button>
      </div>
    );
  }

  // ── KYC Step (standard accounts) ──────────────────────────────────────────
  if (innerStep === "kyc") {
    return (
      <div className="space-y-6">
        <div className="text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-[#b59354]/10">
            <Shield className="h-8 w-8 text-[#b59354]" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Identity Verification</h2>
          <p className="text-gray-500 text-sm max-w-md mx-auto">
            To create your account, we need to verify your identity. This takes 2–3 minutes and is required by financial regulations.
          </p>
        </div>

        <div className="bg-gray-50 rounded-2xl border border-gray-100 p-6">
          <h3 className="font-semibold text-gray-900 mb-3">What you'll need:</h3>
          <ul className="space-y-2 text-sm text-gray-600">
            {["A valid government-issued photo ID (passport or national ID)", "A device with a camera for the selfie check", "Proof of address (utility bill, bank statement — last 3 months)"].map((item, i) => (
              <li key={i} className="flex items-start gap-2">
                <span className="text-[#b59354] font-bold mt-0.5">✓</span>
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </div>

        <SumsubKycWidget
          userId={userEmail || `personal-${Date.now()}`}
          levelName="individual_signup_kyc"
          onClose={() => {/* keep on KYC step if closed */}}
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
            <strong className="text-gray-900">{userEmail}</strong>
          </p>
        </div>

        <OtpBox value={emailOtp} onChange={setEmailOtp} disabled={otpLoading} />

        {demoOtp && (
          <div className="bg-amber-50 border border-amber-200 rounded-xl px-4 py-3 text-sm text-amber-800 text-center">
            <strong>Dev mode:</strong> your code is <strong className="font-mono tracking-widest">{demoOtp}</strong>
          </div>
        )}

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
                const res = await fetch(`${API}/api/auth/pre-register/send-email-otp`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ email: userEmail }) });
                const d = await res.json();
                if (d.demoOtp) setDemoOtp(d.demoOtp);
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
              ? <>Code sent to <strong className="text-gray-900">{fullPhone}</strong></>
              : <>SMS unavailable — code sent to <strong className="text-gray-900">{userEmail}</strong></>
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
                await fetch(`${API}/api/auth/pre-register/send-sms-otp`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ phone: fullPhone, email: userEmail }) });
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
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Create your password</h2>
          <p className="text-gray-500 text-sm">Set a secure password to protect your Opulanz account</p>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Email</label>
            <input value={userEmail} disabled className="w-full px-3 py-2.5 rounded-xl border border-gray-200 text-sm bg-gray-50 text-gray-500" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Password</label>
            <div className="relative">
              <input
                type={showPwd ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Minimum 8 characters"
                className="w-full px-3 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#b59354]/30 focus:border-[#b59354] pr-10"
              />
              <button type="button" onClick={() => setShowPwd(!showPwd)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">
                {showPwd ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Confirm Password</label>
            <input
              type={showPwd ? "text" : "password"}
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Re-enter your password"
              className="w-full px-3 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#b59354]/30 focus:border-[#b59354]"
            />
          </div>

          {/* Strength indicator */}
          {password && (
            <div className="space-y-1">
              <div className="flex gap-1">
                {[8, 12, 16, 20].map((len, i) => (
                  <div key={i} className={`h-1.5 flex-1 rounded-full transition-all ${password.length >= len ? ["bg-red-400", "bg-yellow-400", "bg-blue-400", "bg-green-500"][i] : "bg-gray-200"}`} />
                ))}
              </div>
              <p className="text-xs text-gray-400">
                {password.length < 8 ? "Too short" : password.length < 12 ? "Weak" : password.length < 16 ? "Fair" : "Strong"}
              </p>
            </div>
          )}

          {pwdError && (
            <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-3 text-sm text-red-700">
              {pwdError}
            </div>
          )}

          <button
            onClick={handleSetPassword}
            disabled={!password || !confirmPassword || pwdLoading}
            className="w-full py-3 bg-[#b59354] text-white rounded-xl font-semibold text-sm hover:bg-[#886844] transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {pwdLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Create Account"}
          </button>
        </div>
      </div>
    );
  }

  // ── Complete ──────────────────────────────────────────────────────────────
  return (
    <div className="max-w-md mx-auto space-y-6 text-center">
      <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-green-100">
        <CheckCircle2 className="h-10 w-10 text-green-600" />
      </div>
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Account Active! 🎉</h2>
        <p className="text-gray-500 text-sm">
          Your identity has been verified and your Opulanz account is now ready.
          A welcome email has been sent to <strong className="text-gray-900">{userEmail}</strong>.
        </p>
      </div>

      {iban && (
        <div className="rounded-2xl bg-gradient-to-r from-[#b59354]/10 to-[#b59354]/5 border border-[#b59354]/20 p-6">
          <p className="text-xs font-semibold uppercase tracking-widest text-gray-400 mb-2">Your IBAN</p>
          <p className="text-xl font-bold text-gray-900 font-mono tracking-wider">{iban}</p>
          {bic && <p className="text-sm text-gray-400 mt-1">BIC: <span className="font-semibold text-gray-700">{bic}</span></p>}
        </div>
      )}

      <div className="bg-gray-50 rounded-2xl border border-gray-100 p-5 text-left space-y-2">
        <h3 className="font-bold text-gray-900">Next Steps</h3>
        {[
          "Sign in with your email and password — SMS & email 2FA keeps you secure.",
          "Your debit card will be mailed within 5–7 business days.",
          "Fund your account via SEPA transfer to start transacting.",
        ].map((s, i) => (
          <div key={i} className="flex items-start gap-2 text-sm text-gray-600">
            <span className="text-green-500 font-bold mt-0.5">✓</span>
            <span>{s}</span>
          </div>
        ))}
      </div>

      <button
        onClick={() => router.push(`/${locale}/dashboard`)}
        className="w-full py-3 bg-[#b59354] text-white rounded-xl font-semibold text-sm hover:bg-[#886844] transition-colors flex items-center justify-center gap-2"
      >
        Go to Dashboard <ExternalLink className="h-4 w-4" />
      </button>

      <Link href={`/${locale}/login`} className="block text-sm text-gray-400 hover:text-gray-600">
        Sign in instead
      </Link>
    </div>
  );
}
