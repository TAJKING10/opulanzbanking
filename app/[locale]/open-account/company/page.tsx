"use client";

import * as React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useTranslations } from "next-intl";
import { useRouter, useParams } from "next/navigation";
import { CheckCircle2, Eye, EyeOff, Loader2, Mail, Phone, Shield, ExternalLink, Building2 } from "lucide-react";
import { PageGuidance } from "@/components/page-guidance";
import { setAuthToken } from "@/lib/auth";
import ReactCountryFlag from "react-country-flag";
import {
  whitelabelKYBSchema,
  type WhitelabelKYBFormData,
} from "@/lib/validators/whitelabel";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ConsentCheckbox } from "@/components/form/consent-checkbox";
import { FileDropzone } from "@/components/form/file-dropzone";
import { SectionHeading } from "@/components/section-heading";
import { SumsubKycWidget } from "@/components/sumsub-kyc-widget";
import { COUNTRIES } from "@/shared/lib/countries";

const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

type Step = "form" | "questionnaire" | "sumsub" | "email-otp" | "sms-otp" | "set-password" | "complete";

interface QuestionnaireData {
  sourceOfFunds: string[];
  accountPurpose: string[];
  transactionNature: string;
  typeOfInflow: string[];
  expectedInflow: string;
  usSecurities: string;
}

const STEP_LABELS = [
  { key: "form", label: "Application" },
  { key: "questionnaire", label: "Profile" },
  { key: "sumsub", label: "Identity" },
  { key: "email-otp", label: "Email" },
  { key: "sms-otp", label: "Phone" },
  { key: "set-password", label: "Setup" },
  { key: "complete", label: "Ready" },
];

const STEP_INDEX: Record<Step, number> = {
  form: 0, questionnaire: 1, sumsub: 2, "email-otp": 3,
  "sms-otp": 4, "set-password": 5, complete: 6,
};

function StepProgress({ current }: { current: Step }) {
  const idx = STEP_INDEX[current];
  return (
    <div className="mb-10">
      {/* Mobile: compact progress bar */}
      <div className="sm:hidden mb-3">
        <div className="flex items-center justify-between text-xs text-brand-grayMed mb-2">
          <span className="font-semibold text-brand-gold">{STEP_LABELS[idx].label}</span>
          <span>{idx + 1} / {STEP_LABELS.length}</span>
        </div>
        <div className="h-1.5 w-full bg-brand-grayLight rounded-full overflow-hidden">
          <div className="h-full bg-brand-gold rounded-full transition-all duration-500" style={{ width: `${((idx + 1) / STEP_LABELS.length) * 100}%` }} />
        </div>
      </div>
      {/* Desktop: full step indicators */}
      <div className="hidden sm:flex items-center justify-center gap-0">
        {STEP_LABELS.map((s, i) => (
          <React.Fragment key={s.key}>
            <div className="flex flex-col items-center min-w-[60px]">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-all ${i < idx ? "bg-green-500 text-white" : i === idx ? "bg-brand-gold text-white ring-4 ring-brand-gold/20" : "bg-brand-grayLight text-brand-grayMed"}`}>
                {i < idx ? "✓" : i + 1}
              </div>
              <span className={`mt-1 text-xs font-medium ${i === idx ? "text-brand-gold" : i < idx ? "text-green-500" : "text-brand-grayMed"}`}>{s.label}</span>
            </div>
            {i < STEP_LABELS.length - 1 && (
              <div className={`h-0.5 w-8 mb-5 ${i < idx ? "bg-green-500" : "bg-brand-grayLight"}`} />
            )}
          </React.Fragment>
        ))}
      </div>
    </div>
  );
}

function OtpInput({ value, onChange }: { value: string; onChange: (v: string) => void }) {
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
    <div className="flex gap-3 justify-center">
      {digits.map((d, i) => (
        <input
          key={i}
          ref={(el) => (refs.current[i] = el)}
          type="text"
          inputMode="numeric"
          maxLength={1}
          value={d}
          onChange={(e) => update(i, e.target.value)}
          onKeyDown={(e) => onKeyDown(i, e)}
          onPaste={onPaste}
          className="w-12 h-14 text-center text-2xl font-bold rounded-xl border-2 border-brand-grayLight focus:border-brand-gold focus:outline-none bg-white transition-colors"
        />
      ))}
    </div>
  );
}

export default function CompanyAccountPage() {
  const t = useTranslations();
  const tAccount = useTranslations("accountOpening.company");
  const router = useRouter();
  const params = useParams();
  const locale = params?.locale as string || "en";

  const [step, setStep] = React.useState<Step>("form");
  const [savedFormData, setSavedFormData] = React.useState<(WhitelabelKYBFormData & { repPhoneCode: string }) | null>(null);
  const [applicationId, setApplicationId] = React.useState<number | null>(null);
  const [showFormError, setShowFormError] = React.useState(false);
  const formTopRef = React.useRef<HTMLDivElement>(null);

  // Phone code dropdown (for representative)
  const [repPhoneCode, setRepPhoneCode] = React.useState("+33");
  const [isDropdownOpen, setIsDropdownOpen] = React.useState(false);
  const dropdownRef = React.useRef<HTMLDivElement>(null);

  // Questionnaire
  const [questionnaire, setQuestionnaire] = React.useState<QuestionnaireData>({
    sourceOfFunds: [],
    accountPurpose: [],
    transactionNature: "",
    typeOfInflow: [],
    expectedInflow: "",
    usSecurities: "",
  });
  const [questionnaireErrors, setQuestionnaireErrors] = React.useState<Partial<Record<keyof QuestionnaireData, string>>>({});
  const [questionnaireLoading, setQuestionnaireLoading] = React.useState(false);

  // OTP
  const [emailOtpCode, setEmailOtpCode] = React.useState("");
  const [smsOtpCode, setSmsOtpCode] = React.useState("");
  const [otpLoading, setOtpLoading] = React.useState(false);
  const [otpError, setOtpError] = React.useState("");
  const [smsViaTwilio, setSmsViaTwilio] = React.useState(true);
  const [resendCooldown, setResendCooldown] = React.useState(0);

  // Password
  const [password, setPassword] = React.useState("");
  const [confirmPassword, setConfirmPassword] = React.useState("");
  const [showPwd, setShowPwd] = React.useState(false);
  const [pwdLoading, setPwdLoading] = React.useState(false);
  const [pwdError, setPwdError] = React.useState("");

  // Complete
  const [iban, setIban] = React.useState("");
  const [bic, setBic] = React.useState("");

  const userEmail = savedFormData?.contactEmail || "";
  const fullPhone = savedFormData ? `${savedFormData.repPhoneCode}${savedFormData.representativePhone}` : "";

  // Close dropdown outside click
  React.useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) setIsDropdownOpen(false);
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  // Resend cooldown
  React.useEffect(() => {
    if (resendCooldown <= 0) return;
    const timer = setTimeout(() => setResendCooldown((c) => c - 1), 1000);
    return () => clearTimeout(timer);
  }, [resendCooldown]);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<WhitelabelKYBFormData>({
    resolver: zodResolver(whitelabelKYBSchema),
    defaultValues: {
      contactEmail: "",
      representativeFirstName: "",
      representativeLastName: "",
      representativePhone: "",
      activityCountries: [],
      consentKYB: false,
      consentTerms: false,
      statutes: [],
      registerExtract: [],
      uboDeclaration: [],
    },
  });

  const consentKYB = watch("consentKYB");
  const consentTerms = watch("consentTerms");

  // ─── STEP 1: Store form data → questionnaire ─────────────────────────────────
  const onSubmit = async (data: WhitelabelKYBFormData) => {
    setShowFormError(false);
    setSavedFormData({ ...data, repPhoneCode });
    setStep("questionnaire");
  };

  const onFormError = () => {
    setShowFormError(true);
    formTopRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  // ─── STEP 2: Questionnaire → save to backend → Sumsub ────────────────────────
  const handleQuestionnaireSubmit = async () => {
    const errs: Partial<Record<keyof QuestionnaireData, string>> = {};
    if (!questionnaire.sourceOfFunds.length) errs.sourceOfFunds = "Please select at least one option";
    if (!questionnaire.accountPurpose.length) errs.accountPurpose = "Please select at least one option";
    if (!questionnaire.transactionNature) errs.transactionNature = "Please select an option";
    if (!questionnaire.expectedInflow) errs.expectedInflow = "Please enter an amount";
    if (!questionnaire.usSecurities) errs.usSecurities = "Please select an option";
    setQuestionnaireErrors(errs);
    if (Object.keys(errs).length > 0) return;

    setQuestionnaireLoading(true);
    try {
      const response = await fetch(`${API}/api/applications`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: "company",
          status: "submitted",
          payload: {
            ...savedFormData,
            questionnaire,
            submittedAt: new Date().toISOString(),
          },
        }),
      });
      if (!response.ok) throw new Error("Failed to submit");
      const result = await response.json();

      // Also create company record
      await fetch(`${API}/api/companies`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: savedFormData?.companyName,
          registration_number: savedFormData?.registrationNumber,
          country: savedFormData?.companyCountry,
          legal_form: savedFormData?.legalForm,
          incorporation_date: savedFormData?.dateOfIncorporation,
          registered_address: {
            street: savedFormData?.companyAddress,
            city: savedFormData?.companyCity,
            zip: savedFormData?.companyPostalCode,
            country: savedFormData?.companyCountry,
          },
        }),
      }).catch(() => {});

      setApplicationId(result.data?.id || null);
      setStep("sumsub");
    } catch {
      alert("Failed to submit. Please try again.");
    } finally {
      setQuestionnaireLoading(false);
    }
  };

  // ─── STEP 3: Sumsub complete → send email OTP ────────────────────────────────
  const handleSumsubComplete = async () => {
    await fetch(`${API}/api/auth/pre-register/send-email-otp`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: userEmail }),
    }).catch(() => {});
    setResendCooldown(60);
    setStep("email-otp");
  };

  // ─── STEP 4: Verify email OTP → send SMS OTP ─────────────────────────────────
  const handleVerifyEmailOtp = async () => {
    if (emailOtpCode.length !== 6) return;
    setOtpLoading(true);
    setOtpError("");
    try {
      const res = await fetch(`${API}/api/auth/pre-register/verify-email-otp`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: userEmail, otp: emailOtpCode }),
      });
      if (!res.ok) { const d = await res.json(); setOtpError(d.error || "Invalid or expired code"); return; }

      const smsRes = await fetch(`${API}/api/auth/pre-register/send-sms-otp`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone: fullPhone, email: userEmail }),
      });
      const smsData = await smsRes.json();
      setSmsViaTwilio(smsData.smsSent);
      setResendCooldown(60);
      setStep("sms-otp");
    } finally {
      setOtpLoading(false);
    }
  };

  // ─── STEP 5: Verify SMS OTP ───────────────────────────────────────────────────
  const handleVerifySmsOtp = async () => {
    if (smsOtpCode.length !== 6) return;
    setOtpLoading(true);
    setOtpError("");
    try {
      const res = await fetch(`${API}/api/auth/pre-register/verify-sms-otp`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone: fullPhone, otp: smsOtpCode, email: userEmail }),
      });
      if (!res.ok) { const d = await res.json(); setOtpError(d.error || "Invalid or expired code"); return; }
      setStep("set-password");
    } finally {
      setOtpLoading(false);
    }
  };

  // ─── STEP 6: Set password → create account → complete ────────────────────────
  const handleSetPassword = async () => {
    setPwdError("");
    if (password.length < 8) { setPwdError("Password must be at least 8 characters"); return; }
    if (password !== confirmPassword) { setPwdError("Passwords do not match"); return; }

    setPwdLoading(true);
    try {
      const res = await fetch(`${API}/api/auth/register-no-2fa`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          firstName: savedFormData?.representativeFirstName,
          lastName: savedFormData?.representativeLastName,
          email: userEmail,
          phone: fullPhone,
          password,
          accountType: "corporate",
          applicationId,
        }),
      });
      const data = await res.json();
      if (!res.ok) { setPwdError(data.error || "Failed to create account"); return; }
      setAuthToken(data.token);
      setIban(data.iban || "");
      setBic(data.bic || "");
      setStep("complete");
    } finally {
      setPwdLoading(false);
    }
  };

  // ─── STEP: Questionnaire ──────────────────────────────────────────────────────
  if (step === "questionnaire") {
    const toggleCheck = (field: "sourceOfFunds" | "accountPurpose" | "typeOfInflow", value: string) => {
      setQuestionnaire((q) => {
        const arr = q[field] as string[];
        return { ...q, [field]: arr.includes(value) ? arr.filter((v) => v !== value) : [...arr, value] };
      });
      setQuestionnaireErrors((e) => ({ ...e, [field]: undefined }));
    };

    const CheckOption = ({ field, value, label }: { field: "sourceOfFunds" | "accountPurpose" | "typeOfInflow"; value: string; label: string }) => {
      const checked = (questionnaire[field] as string[]).includes(value);
      return (
        <label className={`flex items-center gap-3 p-3 rounded-xl border-2 cursor-pointer transition-all ${checked ? "border-brand-gold bg-brand-gold/5" : "border-brand-grayLight hover:border-brand-gold/40"}`}>
          <input type="checkbox" checked={checked} onChange={() => toggleCheck(field, value)} className="sr-only" />
          <div className={`w-5 h-5 rounded flex items-center justify-center border-2 transition-all flex-shrink-0 ${checked ? "bg-brand-gold border-brand-gold" : "border-brand-grayMed"}`}>
            {checked && <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>}
          </div>
          <span className="text-sm font-medium text-brand-dark">{label}</span>
        </label>
      );
    };

    const RadioOption = ({ field, value, label }: { field: "transactionNature" | "usSecurities"; value: string; label: string }) => {
      const checked = questionnaire[field] === value;
      return (
        <label className={`flex items-center gap-3 p-3 rounded-xl border-2 cursor-pointer transition-all ${checked ? "border-brand-gold bg-brand-gold/5" : "border-brand-grayLight hover:border-brand-gold/40"}`}>
          <input type="radio" name={field} value={value} checked={checked} onChange={() => { setQuestionnaire((q) => ({ ...q, [field]: value })); setQuestionnaireErrors((e) => ({ ...e, [field]: undefined })); }} className="sr-only" />
          <div className={`w-5 h-5 rounded-full flex items-center justify-center border-2 transition-all flex-shrink-0 ${checked ? "border-brand-gold" : "border-brand-grayMed"}`}>
            {checked && <div className="w-2.5 h-2.5 rounded-full bg-brand-gold" />}
          </div>
          <span className="text-sm font-medium text-brand-dark">{label}</span>
        </label>
      );
    };

    return (
      <div className="min-h-screen bg-brand-off py-12">
        <div className="container mx-auto max-w-2xl px-6">
          <StepProgress current="questionnaire" />
          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold text-brand-dark">Corporate Clients Questionnaire</h2>
            <p className="text-brand-grayMed mt-1 text-sm">Please answer the following questions</p>
          </div>

          <Card className="border-none shadow-elevated">
            <CardContent className="p-8 space-y-8">

              {/* Source of company funds */}
              <div className="space-y-3">
                <Label className="text-base font-semibold text-brand-dark">
                  Source of company funds <span className="text-red-600">*</span>
                </Label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {["Operating revenue / Sales", "Investment / Capital raise", "Shareholder contributions", "Loans / Financing", "Other"].map((v) => (
                    <CheckOption key={v} field="sourceOfFunds" value={v} label={v} />
                  ))}
                </div>
                {questionnaireErrors.sourceOfFunds && <p className="text-xs text-red-600">{questionnaireErrors.sourceOfFunds}</p>}
              </div>

              {/* Purpose of the account */}
              <div className="space-y-3">
                <Label className="text-base font-semibold text-brand-dark">
                  Purpose of the business account <span className="text-red-600">*</span>
                </Label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {["Business operations / Supplier payments", "Payroll management", "International transfers", "Investment activities", "Other"].map((v) => (
                    <CheckOption key={v} field="accountPurpose" value={v} label={v} />
                  ))}
                </div>
                {questionnaireErrors.accountPurpose && <p className="text-xs text-red-600">{questionnaireErrors.accountPurpose}</p>}
              </div>

              {/* Nature of transactions */}
              <div className="space-y-3">
                <Label className="text-base font-semibold text-brand-dark">
                  Nature of transactions <span className="text-red-600">*</span>
                </Label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <RadioOption field="transactionNature" value="Domestic only" label="Domestic only" />
                  <RadioOption field="transactionNature" value="International" label="International" />
                </div>
                {questionnaireErrors.transactionNature && <p className="text-xs text-red-600">{questionnaireErrors.transactionNature}</p>}
              </div>

              {/* Type of inflow */}
              <div className="space-y-3">
                <Label className="text-base font-semibold text-brand-dark">Type of inflow</Label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {["SEPA transfer", "International wire", "Cash", "Deposit of securities", "Other"].map((v) => (
                    <CheckOption key={v} field="typeOfInflow" value={v} label={v} />
                  ))}
                </div>
              </div>

              {/* Expected inflow */}
              <div className="space-y-3">
                <Label htmlFor="comp_expectedInflow" className="text-base font-semibold text-brand-dark">
                  Expected EUR inflow amount within the first twelve months <span className="text-red-600">*</span>
                </Label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-brand-grayMed font-semibold">€</span>
                  <Input
                    id="comp_expectedInflow"
                    type="number"
                    min="0"
                    placeholder="50000"
                    value={questionnaire.expectedInflow}
                    onChange={(e) => { setQuestionnaire((q) => ({ ...q, expectedInflow: e.target.value })); setQuestionnaireErrors((e2) => ({ ...e2, expectedInflow: undefined })); }}
                    className="pl-8"
                  />
                </div>
                {questionnaireErrors.expectedInflow && <p className="text-xs text-red-600">{questionnaireErrors.expectedInflow}</p>}
              </div>

              {/* US Securities */}
              <div className="space-y-3">
                <Label className="text-base font-semibold text-brand-dark">
                  Intention to transact in US securities <span className="text-red-600">*</span>
                </Label>
                <div className="grid grid-cols-2 gap-2">
                  <RadioOption field="usSecurities" value="yes" label="Yes" />
                  <RadioOption field="usSecurities" value="no" label="No" />
                </div>
                {questionnaireErrors.usSecurities && <p className="text-xs text-red-600">{questionnaireErrors.usSecurities}</p>}
              </div>

              <p className="text-xs text-brand-grayMed">* Required fields</p>

              <Button variant="primary" size="lg" className="w-full" disabled={questionnaireLoading} onClick={handleQuestionnaireSubmit}>
                {questionnaireLoading ? <Loader2 className="h-5 w-5 animate-spin" /> : "Continue"}
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  // ─── STEP: Sumsub ─────────────────────────────────────────────────────────────
  if (step === "sumsub") {
    return (
      <div className="min-h-screen bg-brand-off py-12">
        <div className="container mx-auto max-w-4xl px-6">
          <StepProgress current="sumsub" />
          <div className="text-center mb-6">
            <h2 className="text-2xl font-bold text-brand-dark">Business Identity Verification</h2>
            <p className="text-brand-grayMed mt-1">We need to verify your company and representative identity.</p>
          </div>
          <SumsubKycWidget
            userId={userEmail}
            levelName="corporate_signup_kyc"
            onClose={() => setStep("questionnaire")}
            onComplete={handleSumsubComplete}
          />
        </div>
      </div>
    );
  }

  // ─── STEP: Email OTP ──────────────────────────────────────────────────────────
  if (step === "email-otp") {
    return (
      <div className="min-h-screen bg-brand-off py-12">
        <div className="container mx-auto max-w-lg px-6">
          <StepProgress current="email-otp" />
          <Card className="border-none shadow-elevated">
            <CardContent className="p-10">
              <div className="mb-6 flex justify-center">
                <div className="w-16 h-16 rounded-full bg-brand-gold/10 flex items-center justify-center">
                  <Mail className="h-8 w-8 text-brand-gold" />
                </div>
              </div>
              <h2 className="text-2xl font-bold text-brand-dark text-center mb-2">Check your email</h2>
              <p className="text-brand-grayMed text-center text-sm mb-8">
                We sent a 6-digit code to <span className="font-semibold text-brand-dark">{userEmail}</span>
              </p>
              <OtpInput value={emailOtpCode} onChange={setEmailOtpCode} />
              {otpError && <p className="text-red-600 text-sm text-center mt-4">{otpError}</p>}
              <Button variant="primary" size="lg" className="w-full mt-8" disabled={emailOtpCode.length !== 6 || otpLoading} onClick={handleVerifyEmailOtp}>
                {otpLoading ? <Loader2 className="h-5 w-5 animate-spin" /> : "Verify Email"}
              </Button>
              <div className="text-center mt-4">
                {resendCooldown > 0 ? (
                  <p className="text-sm text-brand-grayMed">Resend in {resendCooldown}s</p>
                ) : (
                  <button className="text-sm text-brand-gold hover:underline" onClick={async () => { await fetch(`${API}/api/auth/pre-register/send-email-otp`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ email: userEmail }) }); setResendCooldown(60); }}>
                    Resend code
                  </button>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  // ─── STEP: SMS OTP ────────────────────────────────────────────────────────────
  if (step === "sms-otp") {
    return (
      <div className="min-h-screen bg-brand-off py-12">
        <div className="container mx-auto max-w-lg px-6">
          <StepProgress current="sms-otp" />
          <Card className="border-none shadow-elevated">
            <CardContent className="p-10">
              <div className="mb-6 flex justify-center">
                <div className="w-16 h-16 rounded-full bg-brand-gold/10 flex items-center justify-center">
                  <Phone className="h-8 w-8 text-brand-gold" />
                </div>
              </div>
              <h2 className="text-2xl font-bold text-brand-dark text-center mb-2">Verify your phone</h2>
              <p className="text-brand-grayMed text-center text-sm mb-8">
                {smsViaTwilio
                  ? <>Code sent to <span className="font-semibold text-brand-dark">{fullPhone}</span></>
                  : <>SMS unavailable — code sent to <span className="font-semibold text-brand-dark">{userEmail}</span></>}
              </p>
              <OtpInput value={smsOtpCode} onChange={setSmsOtpCode} />
              {otpError && <p className="text-red-600 text-sm text-center mt-4">{otpError}</p>}
              <Button variant="primary" size="lg" className="w-full mt-8" disabled={smsOtpCode.length !== 6 || otpLoading} onClick={handleVerifySmsOtp}>
                {otpLoading ? <Loader2 className="h-5 w-5 animate-spin" /> : "Verify Phone"}
              </Button>
              <div className="text-center mt-4">
                {resendCooldown > 0 ? (
                  <p className="text-sm text-brand-grayMed">Resend in {resendCooldown}s</p>
                ) : (
                  <button className="text-sm text-brand-gold hover:underline" onClick={async () => { await fetch(`${API}/api/auth/pre-register/send-sms-otp`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ phone: fullPhone, email: userEmail }) }); setResendCooldown(60); }}>
                    Resend code
                  </button>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  // ─── STEP: Set Password ───────────────────────────────────────────────────────
  if (step === "set-password") {
    return (
      <div className="min-h-screen bg-brand-off py-12">
        <div className="container mx-auto max-w-lg px-6">
          <StepProgress current="set-password" />
          <Card className="border-none shadow-elevated">
            <CardContent className="p-10">
              <div className="mb-6 flex justify-center">
                <div className="w-16 h-16 rounded-full bg-brand-gold/10 flex items-center justify-center">
                  <Shield className="h-8 w-8 text-brand-gold" />
                </div>
              </div>
              <h2 className="text-2xl font-bold text-brand-dark text-center mb-2">Create your account</h2>
              <p className="text-brand-grayMed text-center text-sm mb-8">Set a password to access your Opulanz business account</p>
              <div className="space-y-5">
                <div className="space-y-2">
                  <Label>Email</Label>
                  <Input value={userEmail} disabled className="bg-brand-grayLight/40" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="comp_pwd">Password *</Label>
                  <div className="relative">
                    <Input id="comp_pwd" type={showPwd ? "text" : "password"} value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Minimum 8 characters" className="pr-12" />
                    <button type="button" onClick={() => setShowPwd(!showPwd)} className="absolute right-3 top-1/2 -translate-y-1/2 text-brand-grayMed">
                      {showPwd ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="comp_cpwd">Confirm Password *</Label>
                  <Input id="comp_cpwd" type={showPwd ? "text" : "password"} value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} placeholder="Re-enter your password" />
                </div>
                {password && (
                  <div className="space-y-1">
                    <div className="flex gap-1">
                      {[8, 12, 16, 20].map((len, i) => (
                        <div key={i} className={`h-1.5 flex-1 rounded-full transition-all ${password.length >= len ? i < 1 ? "bg-red-400" : i < 2 ? "bg-yellow-400" : i < 3 ? "bg-blue-400" : "bg-green-500" : "bg-brand-grayLight"}`} />
                      ))}
                    </div>
                    <p className="text-xs text-brand-grayMed">{password.length < 8 ? "Too short" : password.length < 12 ? "Weak" : password.length < 16 ? "Fair" : password.length < 20 ? "Good" : "Strong"}</p>
                  </div>
                )}
                {pwdError && <p className="text-red-600 text-sm">{pwdError}</p>}
                <Button variant="primary" size="lg" className="w-full mt-2" disabled={!password || !confirmPassword || pwdLoading} onClick={handleSetPassword}>
                  {pwdLoading ? <Loader2 className="h-5 w-5 animate-spin" /> : "Activate Account"}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  // ─── STEP: Complete ───────────────────────────────────────────────────────────
  if (step === "complete") {
    return (
      <div className="min-h-screen bg-brand-off py-12">
        <div className="container mx-auto max-w-lg px-6">
          <StepProgress current="complete" />
          <Card className="border-none shadow-elevated">
            <CardContent className="p-10 text-center">
              <div className="mb-6 inline-flex h-20 w-20 items-center justify-center rounded-full bg-green-100">
                <CheckCircle2 className="h-10 w-10 text-green-600" />
              </div>
              <h1 className="text-3xl font-bold text-brand-dark mb-3">Business Account Active! 🎉</h1>
              <p className="text-brand-grayMed mb-8">
                Your company has been verified and your Opulanz business account is now ready. A welcome email has been sent to{" "}
                <span className="font-semibold text-brand-dark">{userEmail}</span>.
              </p>
              {iban && (
                <div className="mb-8 rounded-xl bg-gradient-to-r from-brand-gold/10 to-brand-gold/5 border border-brand-gold/20 p-6">
                  <p className="text-xs font-semibold uppercase tracking-widest text-brand-grayMed mb-2">Your Business IBAN</p>
                  <p className="text-xl font-bold text-brand-dark font-mono tracking-wider">{iban}</p>
                  {bic && <p className="text-sm text-brand-grayMed mt-1">BIC: <span className="font-semibold">{bic}</span></p>}
                </div>
              )}
              <div className="space-y-3 text-left mb-8">
                <h3 className="font-bold text-brand-dark">Next Steps</h3>
                <ul className="space-y-2 text-sm text-brand-grayMed">
                  {["Invite team members and set up user roles.", "Connect your accounting software for automated bookkeeping.", "Order corporate cards for your team.", "Fund your account via SEPA transfer to start transacting."].map((s, i) => (
                    <li key={i} className="flex items-start gap-2">
                      <span className="text-green-500 font-bold mt-0.5">✓</span>
                      <span>{s}</span>
                    </li>
                  ))}
                </ul>
              </div>
              <Button variant="primary" size="lg" className="w-full flex items-center justify-center gap-2" onClick={() => router.push(`/${locale}/dashboard`)}>
                Go to Dashboard <ExternalLink className="h-4 w-4" />
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  // ─── STEP: Form ───────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-brand-off py-12">
      <PageGuidance
        pageKey="open-account-company"
        locale={locale}
        title="Company Account Application"
        description="Complete your KYB to open a business Opulanz account."
        steps={[
          { content: "You're applying for a Business Opulanz account. This form collects your company details required for Know Your Business (KYB) compliance. Have your incorporation documents ready." },
          { title: "Company Name", content: "Enter your company's full legal name exactly as it appears on your Certificate of Incorporation.", target: "#comp_companyName", position: "bottom" },
          { title: "Registration Number", content: "Enter your company's official registration number — this is on your incorporation certificate.", target: "#comp_registrationNumber", position: "bottom" },
          { title: "Legal Form", content: "Select your company's legal structure (SARL, SAS, SA, Ltd, etc.) from this dropdown.", target: "#comp_legalForm", position: "bottom" },
          { title: "Representative Details", content: "Enter the details of the authorised representative — the person legally acting on behalf of the company.", target: "#comp_repFirstName", position: "bottom" },
        ]}
        tip="Have your Certificate of Incorporation, proof of company address, and a director's ID ready."
      />
      <div className="container mx-auto max-w-4xl px-6">
        <SectionHeading
          title={tAccount("title")}
          description={tAccount("description")}
          align="center"
          className="mb-12"
        />

        <div ref={formTopRef}>
        <Card className="border-none shadow-elevated">
          <CardHeader>
            <CardTitle>{tAccount("form.companyInfo")}</CardTitle>
          </CardHeader>
          <CardContent>
            {showFormError && (
              <div className="mb-6 flex items-start gap-3 rounded-lg border border-red-200 bg-red-50 px-4 py-4 text-sm text-red-700">
                <span className="mt-0.5 flex-shrink-0 font-bold text-base">⚠</span>
                <div>
                  <p className="font-semibold">
                    {locale === "fr"
                      ? "Veuillez remplir tous les champs obligatoires (*) avant de continuer."
                      : "Please fill in all required fields (*) before submitting."}
                  </p>
                  <p className="mt-1 text-xs text-red-600">
                    {locale === "fr"
                      ? "Les champs en rouge doivent être complétés."
                      : "Fields highlighted in red must be completed."}
                  </p>
                </div>
              </div>
            )}
            <form onSubmit={handleSubmit(onSubmit, onFormError)} className="space-y-8">

              {/* Company Details */}
              <div className="grid gap-6 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="comp_companyName">Company Name<span className="text-red-600">*</span></Label>
                  <Input id="comp_companyName" {...register("companyName")} />
                  {errors.companyName && <p className="text-xs text-red-600">{errors.companyName.message}</p>}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="comp_registrationNumber">Registration Number<span className="text-red-600">*</span></Label>
                  <Input id="comp_registrationNumber" {...register("registrationNumber")} />
                  {errors.registrationNumber && <p className="text-xs text-red-600">{errors.registrationNumber.message}</p>}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="comp_dateOfIncorporation">Date of Incorporation<span className="text-red-600">*</span></Label>
                  <Input id="comp_dateOfIncorporation" type="date" {...register("dateOfIncorporation")} />
                  {errors.dateOfIncorporation && <p className="text-xs text-red-600">{errors.dateOfIncorporation.message}</p>}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="comp_legalForm">Legal Form<span className="text-red-600">*</span></Label>
                  <select id="comp_legalForm" {...register("legalForm")} className="flex h-12 w-full rounded-xl border border-brand-grayLight bg-white px-4 py-3 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-gold">
                    <option value="">Select legal form</option>
                    <option value="SARL">SARL - Société à Responsabilité Limitée</option>
                    <option value="SA">SA - Société Anonyme</option>
                    <option value="SAS">SAS - Société par Actions Simplifiée</option>
                    <option value="EURL">EURL - Entreprise Unipersonnelle à Responsabilité Limitée</option>
                    <option value="SCSp">SCSp - Société en Commandite Spéciale</option>
                    <option value="OTHER">Other</option>
                  </select>
                  {errors.legalForm && <p className="text-xs text-red-600">{errors.legalForm.message}</p>}
                </div>
              </div>

              {/* Account Administrator */}
              <div className="space-y-6">
                <h3 className="text-lg font-bold text-brand-dark">Account Administrator</h3>
                <p className="text-sm text-brand-grayMed -mt-2">The person who will manage this business account</p>
                <div className="grid gap-6 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="comp_repFirstName">First Name<span className="text-red-600">*</span></Label>
                    <Input id="comp_repFirstName" {...register("representativeFirstName")} />
                    {errors.representativeFirstName && <p className="text-xs text-red-600">{errors.representativeFirstName.message}</p>}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="comp_repLastName">Last Name<span className="text-red-600">*</span></Label>
                    <Input id="comp_repLastName" {...register("representativeLastName")} />
                    {errors.representativeLastName && <p className="text-xs text-red-600">{errors.representativeLastName.message}</p>}
                  </div>
                  <div className="space-y-2 md:col-span-2">
                    <Label htmlFor="comp_contactEmail">Contact Email Address<span className="text-red-600">*</span></Label>
                    <Input id="comp_contactEmail" type="email" placeholder="contact@company.com" {...register("contactEmail")} />
                    {errors.contactEmail && <p className="text-xs text-red-600">{errors.contactEmail.message}</p>}
                  </div>
                  <div className="space-y-2 md:col-span-2">
                    <Label htmlFor="comp_repPhone">Phone Number<span className="text-red-600">*</span></Label>
                    <div className="relative">
                      <div className="absolute left-3 top-1/2 -translate-y-1/2 flex items-center gap-2 z-10">
                        <div ref={dropdownRef} className="relative">
                          <button type="button" onClick={() => setIsDropdownOpen(!isDropdownOpen)} className="flex items-center gap-2 bg-transparent border-none text-sm font-medium focus:outline-none cursor-pointer">
                            <ReactCountryFlag countryCode={COUNTRIES.find((c) => c.phoneCode === repPhoneCode)?.code || "FR"} svg style={{ width: "1.5em", height: "1.5em" }} />
                            <span>{repPhoneCode}</span>
                            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
                          </button>
                          {isDropdownOpen && (
                            <div className="absolute top-full mt-1 left-0 w-64 max-h-60 overflow-y-auto bg-white border border-brand-grayLight rounded-lg shadow-lg z-50">
                              {COUNTRIES.map((c) => (
                                <button key={c.code} type="button" onClick={() => { setRepPhoneCode(c.phoneCode); setIsDropdownOpen(false); }} className="w-full flex items-center gap-3 px-3 py-2 hover:bg-gray-50 text-left text-sm">
                                  <ReactCountryFlag countryCode={c.code} svg style={{ width: "1.5em", height: "1.5em" }} />
                                  <span className="font-medium">{c.phoneCode}</span>
                                  <span className="text-gray-600 text-xs">{c.name}</span>
                                </button>
                              ))}
                            </div>
                          )}
                        </div>
                        <span className="text-brand-grayLight">|</span>
                      </div>
                      <Input id="comp_repPhone" type="tel" placeholder="Local number only" className="pl-32" {...register("representativePhone")} />
                    </div>
                    {errors.representativePhone && <p className="text-xs text-red-600">{errors.representativePhone.message}</p>}
                  </div>
                </div>
              </div>

              {/* Company Address */}
              <div className="space-y-6">
                <h3 className="text-lg font-bold text-brand-dark">Company Address</h3>
                <div className="space-y-2">
                  <Label htmlFor="comp_companyAddress">Street Address<span className="text-red-600">*</span></Label>
                  <Input id="comp_companyAddress" {...register("companyAddress")} />
                  {errors.companyAddress && <p className="text-xs text-red-600">{errors.companyAddress.message}</p>}
                </div>
                <div className="grid gap-6 md:grid-cols-3">
                  <div className="space-y-2">
                    <Label htmlFor="comp_companyCity">City<span className="text-red-600">*</span></Label>
                    <Input id="comp_companyCity" {...register("companyCity")} />
                    {errors.companyCity && <p className="text-xs text-red-600">{errors.companyCity.message}</p>}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="comp_companyPostalCode">Postal Code<span className="text-red-600">*</span></Label>
                    <Input id="comp_companyPostalCode" {...register("companyPostalCode")} />
                    {errors.companyPostalCode && <p className="text-xs text-red-600">{errors.companyPostalCode.message}</p>}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="comp_companyCountry">Country<span className="text-red-600">*</span></Label>
                    <select id="comp_companyCountry" {...register("companyCountry")} className="flex h-12 w-full rounded-xl border border-brand-grayLight bg-white px-4 py-3 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-gold">
                      <option value="">Select country</option>
                      {COUNTRIES.map((c) => <option key={c.code} value={c.code}>{c.name}</option>)}
                    </select>
                    {errors.companyCountry && <p className="text-xs text-red-600">{errors.companyCountry.message}</p>}
                  </div>
                </div>
              </div>

              {/* Company Documents */}
              <div className="space-y-6">
                <h3 className="text-lg font-bold text-brand-dark">Company Documents</h3>
                <p className="text-sm text-brand-grayMed">Please upload clear copies of the following documents (max 15MB each)</p>
                <div className="space-y-2">
                  <Label>{t("whitelabel.uploadStatutes")}*</Label>
                  <FileDropzone multiple={false} onFilesChange={(f) => setValue("statutes", f)} error={errors.statutes?.message} />
                </div>
                <div className="space-y-2">
                  <Label>{t("whitelabel.uploadRegister")}*</Label>
                  <FileDropzone multiple={false} onFilesChange={(f) => setValue("registerExtract", f)} error={errors.registerExtract?.message} />
                </div>
                <div className="space-y-2">
                  <Label>{t("whitelabel.uploadUbo")}*</Label>
                  <FileDropzone multiple={false} onFilesChange={(f) => setValue("uboDeclaration", f)} error={errors.uboDeclaration?.message} />
                </div>
              </div>

              {/* Business Activity */}
              <div className="space-y-6">
                <h3 className="text-lg font-bold text-brand-dark">Business Activity</h3>
                <div className="space-y-2">
                  <Label htmlFor="comp_businessActivity">Business Activity Description<span className="text-red-600">*</span></Label>
                  <textarea id="comp_businessActivity" {...register("businessActivity")} rows={4} className="flex w-full rounded-xl border border-brand-grayLight bg-white px-4 py-3 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-gold" placeholder="Describe your main business activities..." />
                  {errors.businessActivity && <p className="text-xs text-red-600">{errors.businessActivity.message}</p>}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="comp_activityCountries">Countries of Activity<span className="text-red-600">*</span></Label>
                  <select id="comp_activityCountries" {...register("activityCountries")} multiple size={5} className="flex w-full rounded-xl border border-brand-grayLight bg-white px-4 py-3 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-gold">
                    {COUNTRIES.map((c) => <option key={c.code} value={c.code}>{c.name}</option>)}
                  </select>
                  <p className="text-xs text-brand-grayMed">Hold Ctrl (Windows) or Cmd (Mac) to select multiple countries</p>
                  {errors.activityCountries && <p className="text-xs text-red-600">{errors.activityCountries.message}</p>}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="comp_expectedMonthlyVolume">Expected Monthly Transaction Volume<span className="text-red-600">*</span></Label>
                  <select id="comp_expectedMonthlyVolume" {...register("expectedMonthlyVolume")} className="flex h-12 w-full rounded-xl border border-brand-grayLight bg-white px-4 py-3 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-gold">
                    <option value="">Select range</option>
                    <option value="0-10k">€0 - €10,000</option>
                    <option value="10k-50k">€10,000 - €50,000</option>
                    <option value="50k-100k">€50,000 - €100,000</option>
                    <option value="100k-500k">€100,000 - €500,000</option>
                    <option value="500k+">€500,000+</option>
                  </select>
                  {errors.expectedMonthlyVolume && <p className="text-xs text-red-600">{errors.expectedMonthlyVolume.message}</p>}
                </div>
              </div>

              {/* Consents */}
              <div className="space-y-4 rounded-xl bg-brand-grayLight/30 p-6">
                <h3 className="font-bold text-brand-dark">Consents</h3>
                <ConsentCheckbox
                  id="comp_consentKYB"
                  checked={consentKYB}
                  onCheckedChange={(v) => setValue("consentKYB", v as boolean)}
                  label="I consent to business verification and compliance checks as required by law"
                  required
                  error={errors.consentKYB?.message}
                />
                <ConsentCheckbox
                  id="comp_consentTerms"
                  checked={consentTerms}
                  onCheckedChange={(v) => setValue("consentTerms", v as boolean)}
                  label="I agree to Opulanz"
                  required
                  error={errors.consentTerms?.message}
                  links={[
                    { text: "Terms & Conditions", href: "/legal/terms" },
                    { text: "Privacy Policy", href: "/legal/privacy" },
                  ]}
                />
              </div>

              <Button type="submit" variant="primary" size="lg" disabled={isSubmitting} className="w-full">
                {isSubmitting ? <Loader2 className="h-5 w-5 animate-spin" /> : t("whitelabel.submitApplication")}
              </Button>
            </form>
          </CardContent>
        </Card>
        </div>
      </div>
    </div>
  );
}
