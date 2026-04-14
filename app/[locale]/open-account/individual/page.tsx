"use client";

import * as React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useTranslations } from "next-intl";
import { useParams, useRouter } from "next/navigation";
import { CheckCircle2, Eye, EyeOff, Loader2 } from "lucide-react";
import { setAuthToken } from "@/lib/auth";
import ReactCountryFlag from "react-country-flag";
import {
  whitelabelKYCSchema,
  type WhitelabelKYCFormData,
} from "@/lib/validators/whitelabel";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ConsentCheckbox } from "@/components/form/consent-checkbox";
import { SectionHeading } from "@/components/section-heading";
import { SumsubKycWidget } from "@/components/sumsub-kyc-widget";
import { COUNTRIES } from "@/shared/lib/countries";

type ApplicationStatus = "form" | "create-login" | "setup-2fa" | "approved" | "declined";

export default function IndividualAccountPage() {
  const t = useTranslations();
  const tAccount = useTranslations("accountOpening.individual");
  const params = useParams();
  const router = useRouter();
  const locale = params.locale as string;
  const [status, setStatus] = React.useState<ApplicationStatus>("form");
  const [showKyc, setShowKyc] = React.useState(false);
  const [applicationId, setApplicationId] = React.useState<string>("");
  const [submittedEmail, setSubmittedEmail] = React.useState("");
  const [submittedFirstName, setSubmittedFirstName] = React.useState("");
  const [submittedLastName, setSubmittedLastName] = React.useState("");
  const [submittedPhone, setSubmittedPhone] = React.useState("");
  const [submittedAppId, setSubmittedAppId] = React.useState<string | number>("");
  const [password, setPassword] = React.useState("");
  const [confirmPassword, setConfirmPassword] = React.useState("");
  const [showPassword, setShowPassword] = React.useState(false);
  const [createLoginLoading, setCreateLoginLoading] = React.useState(false);
  const [createLoginError, setCreateLoginError] = React.useState("");
  const [totpQrCode, setTotpQrCode] = React.useState("");
  const [totpSecret, setTotpSecret] = React.useState("");
  const [totpTempToken, setTotpTempToken] = React.useState("");
  const [totpCode, setTotpCode] = React.useState("");
  const [totpLoading, setTotpLoading] = React.useState(false);
  const [totpError, setTotpError] = React.useState("");
  const [accountIban, setAccountIban] = React.useState("");
  const [accountBic, setAccountBic] = React.useState("");
  const [selectedPhoneCode, setSelectedPhoneCode] = React.useState<string>("+33");
  const [isDropdownOpen, setIsDropdownOpen] = React.useState<boolean>(false);
  const dropdownRef = React.useRef<HTMLDivElement>(null);

  // Reset status when component mounts to ensure fresh start
  React.useEffect(() => {
    // Clear any persisted state on mount
    setStatus("form");
  }, []);

  // Close dropdown when clicking outside
  React.useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<WhitelabelKYCFormData>({
    resolver: zodResolver(whitelabelKYCSchema),
    defaultValues: {
      email: "",
      isPEP: false,
      activityCountries: [],
      consentKYC: false,
      consentTerms: false,
    },
  });

  // Function to reset everything for a new application
  const startNewApplication = () => {
    setStatus("form");
    setShowKyc(false);
    setApplicationId("");
    setSelectedPhoneCode("+33");
    reset();
  };

  const isPEP = watch("isPEP");
  const consentKYC = watch("consentKYC");
  const consentTerms = watch("consentTerms");

  const onSubmit = async (data: WhitelabelKYCFormData) => {
    try {
      const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

      // Prepare the payload for the backend
      const applicationPayload = {
        type: "individual",
        status: "submitted",
        payload: {
          // Personal Information
          firstName: data.firstName,
          lastName: data.lastName,
          email: data.email,
          dateOfBirth: data.dateOfBirth,
          nationality: data.nationality,
          phoneNumber: data.phoneNumber,
          phoneCode: selectedPhoneCode,

          // Address Information
          address: data.address,
          city: data.city,
          postalCode: data.postalCode,
          country: data.country,

          // Activity Information
          isPEP: data.isPEP,
          activityCountries: data.activityCountries,
          expectedMonthlyVolume: data.expectedMonthlyVolume,
          sourceOfFunds: data.sourceOfFunds,

          // Consents
          consentKYC: data.consentKYC,
          consentTerms: data.consentTerms,

          // Metadata
          submittedAt: new Date().toISOString(),
        }
      };

      // Submit to backend API
      const response = await fetch(`${API}/api/applications`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(applicationPayload),
      });

      if (!response.ok) {
        throw new Error('Failed to submit application');
      }

      const result = await response.json();

      // Send confirmation notification
      fetch(`${API}/api/notifications/appointment`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customerName: `${data.firstName} ${data.lastName}`,
          customerEmail: data.email,
          meetingType: 'Individual Account Application',
          appointmentDate: new Date().toLocaleDateString(),
          appointmentTime: new Date().toLocaleTimeString(),
          price: 0,
        }),
      }).catch(() => {}); // non-blocking

      // Store form data for account creation after KYC
      setSubmittedEmail(data.email);
      setSubmittedFirstName(data.firstName);
      setSubmittedLastName(data.lastName);
      setSubmittedPhone(`${selectedPhoneCode}${data.phoneNumber}`);
      setSubmittedAppId(result.id || "");

      // Open Sumsub KYC widget for identity verification
      setApplicationId(`individual-${result.id || Date.now()}`);
      setShowKyc(true);
    } catch (error) {
      console.error("Error submitting application:", error);
      alert("Failed to submit application. Please try again.");
    }
  };

  if (status === "create-login") {
    const handleCreateLogin = async (e: React.FormEvent) => {
      e.preventDefault();
      setCreateLoginError("");
      if (password.length < 8) { setCreateLoginError("Password must be at least 8 characters."); return; }
      if (password !== confirmPassword) { setCreateLoginError("Passwords do not match."); return; }
      setCreateLoginLoading(true);
      try {
        const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";
        const res = await fetch(`${API}/api/auth/register-post-kyc`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            firstName: submittedFirstName,
            lastName: submittedLastName,
            email: submittedEmail,
            phone: submittedPhone,
            password,
            accountType: "individual",
            applicationId: submittedAppId,
          }),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error);
        // Account created — now set up Google Authenticator
        setTotpQrCode(data.totpQrCode);
        setTotpSecret(data.totpSecret);
        setTotpTempToken(data.tempToken);
        setStatus("setup-2fa");
      } catch (err: any) {
        setCreateLoginError(err.message || "Failed to create account. Please try again.");
      } finally {
        setCreateLoginLoading(false);
      }
    };

    return (
      <div className="min-h-screen bg-brand-off py-12">
        <div className="container mx-auto max-w-md px-6">
          <Card className="border-none shadow-elevated">
            <CardContent className="p-10">
              <div className="mb-6 text-center">
                <div className="mb-4 inline-flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
                  <CheckCircle2 className="h-8 w-8 text-green-600" />
                </div>
                <h1 className="text-2xl font-bold text-brand-dark">Identity Verified!</h1>
                <p className="mt-2 text-brand-grayMed">Set a password to access your Opulanz account</p>
              </div>

              <form onSubmit={handleCreateLogin} className="space-y-4">
                <div className="space-y-1">
                  <Label>Email</Label>
                  <Input value={submittedEmail} disabled className="bg-gray-50 text-brand-grayMed" />
                </div>

                <div className="space-y-1">
                  <Label htmlFor="new_password">Password <span className="text-red-500">*</span></Label>
                  <div className="relative">
                    <Input
                      id="new_password"
                      type={showPassword ? "text" : "password"}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Min. 8 characters"
                      className="pr-10"
                    />
                    <button type="button" onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-brand-grayMed">
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>

                <div className="space-y-1">
                  <Label htmlFor="confirm_password">Confirm Password <span className="text-red-500">*</span></Label>
                  <Input
                    id="confirm_password"
                    type={showPassword ? "text" : "password"}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Repeat your password"
                  />
                </div>

                {createLoginError && (
                  <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700 border border-red-200">{createLoginError}</p>
                )}

                <Button type="submit" variant="primary" size="lg" disabled={createLoginLoading} className="w-full">
                  {createLoginLoading ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Creating account…</> : "Create Account & Sign In"}
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  if (status === "setup-2fa") {
    const handleVerifyTotp = async (e: React.FormEvent) => {
      e.preventDefault();
      setTotpError("");
      setTotpLoading(true);
      try {
        const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";
        const res = await fetch(`${API}/api/auth/verify-totp-setup`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ tempToken: totpTempToken, code: totpCode }),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error);
        setAuthToken(data.token);
        if (data.iban) setAccountIban(data.iban);
        if (data.bic) setAccountBic(data.bic);
        setStatus("approved");
      } catch (err: any) {
        setTotpError(err.message || "Invalid code. Please try again.");
      } finally {
        setTotpLoading(false);
      }
    };

    return (
      <div className="min-h-screen bg-brand-off py-12">
        <div className="container mx-auto max-w-md px-6">
          <Card className="border-none shadow-elevated">
            <CardContent className="p-10">
              <div className="mb-6 text-center">
                <div className="mb-4 inline-flex h-16 w-16 items-center justify-center rounded-full bg-blue-100">
                  <svg className="h-8 w-8 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                </div>
                <h1 className="text-2xl font-bold text-brand-dark">Set Up Google Authenticator</h1>
                <p className="mt-2 text-sm text-brand-grayMed">Scan the QR code with the Google Authenticator app to enable two-factor authentication on your account.</p>
              </div>

              <div className="mb-6 space-y-4">
                <div className="flex flex-col items-center gap-3">
                  <p className="text-sm font-semibold text-brand-dark">1. Install Google Authenticator on your phone</p>
                  <p className="text-sm font-semibold text-brand-dark">2. Tap "+" and scan this QR code</p>
                  {totpQrCode && (
                    <img src={totpQrCode} alt="Google Authenticator QR Code" className="h-48 w-48 rounded-xl border border-brand-grayLight p-2" />
                  )}
                </div>

                <details className="rounded-lg border border-brand-grayLight p-3">
                  <summary className="cursor-pointer text-xs text-brand-grayMed select-none">Can&apos;t scan? Enter the key manually</summary>
                  <p className="mt-2 break-all rounded bg-gray-50 px-3 py-2 font-mono text-xs text-brand-dark">{totpSecret}</p>
                </details>
              </div>

              <form onSubmit={handleVerifyTotp} className="space-y-4">
                <div className="space-y-1">
                  <Label htmlFor="totp_code">3. Enter the 6-digit code from the app <span className="text-red-500">*</span></Label>
                  <Input
                    id="totp_code"
                    type="text"
                    inputMode="numeric"
                    maxLength={6}
                    value={totpCode}
                    onChange={(e) => setTotpCode(e.target.value.replace(/\D/g, ""))}
                    placeholder="000000"
                    className="text-center text-2xl font-mono tracking-widest"
                  />
                </div>

                {totpError && (
                  <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700 border border-red-200">{totpError}</p>
                )}

                <Button type="submit" variant="primary" size="lg" disabled={totpLoading || totpCode.length < 6} className="w-full">
                  {totpLoading ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Verifying…</> : "Verify & Activate Account"}
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  if (status === "approved") {
    return (
      <div className="min-h-screen bg-brand-off py-12">
        <div className="container mx-auto max-w-3xl px-6">
          <Card className="border-none shadow-elevated">
            <CardContent className="p-12 text-center">
              <div className="mb-6 inline-flex h-20 w-20 items-center justify-center rounded-full bg-green-100">
                <CheckCircle2 className="h-10 w-10 text-green-600" />
              </div>
              <h1 className="mb-4 text-3xl font-bold text-brand-dark">
                Account Created!
              </h1>
              <p className="mb-8 text-lg text-brand-grayMed">
                Your identity has been verified and your account is active. Account details have been sent to <strong>{submittedEmail}</strong>.
              </p>

              {/* IBAN Card */}
              {accountIban && (
                <div className="mb-8 rounded-xl bg-brand-dark p-6 text-left text-white">
                  <p className="mb-1 text-xs font-semibold uppercase tracking-widest text-brand-goldLight">Your Bank Account</p>
                  <p className="mb-4 text-sm text-white/60">Luxembourg SEPA Account · EUR</p>
                  <div className="space-y-3">
                    <div>
                      <p className="text-xs text-white/50 mb-0.5">IBAN</p>
                      <p className="text-lg font-mono font-bold tracking-wider text-brand-gold">
                        {accountIban.replace(/(.{4})/g, "$1 ").trim()}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-white/50 mb-0.5">BIC / SWIFT</p>
                      <p className="font-mono font-semibold">{accountBic}</p>
                    </div>
                    <div>
                      <p className="text-xs text-white/50 mb-0.5">Account Holder</p>
                      <p className="font-semibold">{submittedFirstName} {submittedLastName}</p>
                    </div>
                  </div>
                  <div className="mt-4 flex items-center gap-2">
                    <span className="inline-flex items-center gap-1 rounded-full bg-green-500/20 px-3 py-1 text-xs font-semibold text-green-300">
                      ● Active
                    </span>
                    <span className="text-xs text-white/50">SEPA transfers enabled</span>
                  </div>
                </div>
              )}

              <div className="space-y-4 text-left">
                <h3 className="text-xl font-bold text-brand-dark">What you can do now</h3>
                <ul className="space-y-3 text-brand-grayMed">
                  <li className="flex items-start gap-3">
                    <span className="text-brand-gold">✓</span>
                    <span>Receive SEPA transfers to your IBAN</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="text-brand-gold">✓</span>
                    <span>Send payments across 36 SEPA countries</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="text-brand-gold">✓</span>
                    <span>Access your account dashboard and transaction history</span>
                  </li>
                </ul>
              </div>

              <div className="mt-10">
                <Button
                  variant="primary"
                  size="lg"
                  className="w-full"
                  onClick={() => router.push(`/${locale}/dashboard`)}
                >
                  Go to Dashboard
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-brand-off py-12">
      {showKyc && (
        <SumsubKycWidget
          userId={applicationId}
          levelName="individual_signup_kyc"
          onClose={() => setShowKyc(false)}
          onComplete={() => {
            setShowKyc(false);
            setStatus("create-login");
          }}
        />

      )}
      <div className="container mx-auto max-w-4xl px-6">
        <SectionHeading
          title={tAccount("title")}
          description={tAccount("description")}
          align="center"
          className="mb-12"
        />

        <Card className="border-none shadow-elevated">
          <CardHeader>
            <CardTitle>{tAccount("form.personalInfo")}</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
              {/* Personal Details */}
              <div className="grid gap-6 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="indv_firstName">
                    {tAccount("form.firstName")}<span className="text-red-600">*</span>
                  </Label>
                  <Input id="indv_firstName" {...register("firstName")} />
                  {errors.firstName && (
                    <p className="text-xs text-red-600">
                      {errors.firstName.message}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="indv_lastName">
                    {tAccount("form.lastName")}<span className="text-red-600">*</span>
                  </Label>
                  <Input id="indv_lastName" {...register("lastName")} />
                  {errors.lastName && (
                    <p className="text-xs text-red-600">
                      {errors.lastName.message}
                    </p>
                  )}
                </div>

                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="indv_email">
                    Email Address<span className="text-red-600">*</span>
                  </Label>
                  <Input
                    id="indv_email"
                    type="email"
                    placeholder="your@email.com"
                    {...register("email")}
                  />
                  {errors.email && (
                    <p className="text-xs text-red-600">
                      {errors.email.message}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="indv_dateOfBirth">
                    {tAccount("form.dateOfBirth")}<span className="text-red-600">*</span>
                  </Label>
                  <Input
                    id="indv_dateOfBirth"
                    type="date"
                    {...register("dateOfBirth")}
                  />
                  {errors.dateOfBirth && (
                    <p className="text-xs text-red-600">
                      {errors.dateOfBirth.message}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="indv_nationality">
                    {tAccount("form.nationality")}<span className="text-red-600">*</span>
                  </Label>
                  <select
                    id="indv_nationality"
                    {...register("nationality")}
                    className="flex h-12 w-full rounded-xl border border-brand-grayLight bg-white px-4 py-3 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-gold"
                  >
                    <option value="">{tAccount("form.selectNationality")}</option>
                    {COUNTRIES.map((country) => (
                      <option key={country.code} value={country.code}>
                        {country.name}
                      </option>
                    ))}
                  </select>
                  {errors.nationality && (
                    <p className="text-xs text-red-600">
                      {errors.nationality.message}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="indv_phoneNumber">
                    {tAccount("form.phoneNumber")}<span className="text-red-600">*</span>
                  </Label>
                  <div className="relative">
                    <div className="absolute left-3 top-1/2 -translate-y-1/2 flex items-center gap-2 z-10">
                      <div ref={dropdownRef} className="relative">
                        <button
                          type="button"
                          onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                          className="flex items-center gap-2 bg-transparent border-none text-sm font-medium focus:outline-none cursor-pointer"
                        >
                          <ReactCountryFlag
                            countryCode={COUNTRIES.find(c => c.phoneCode === selectedPhoneCode)?.code || "FR"}
                            svg
                            style={{
                              width: '1.5em',
                              height: '1.5em',
                            }}
                          />
                          <span>{selectedPhoneCode}</span>
                          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                          </svg>
                        </button>

                        {isDropdownOpen && (
                          <div className="absolute top-full mt-1 left-0 w-64 max-h-60 overflow-y-auto bg-white border border-brand-grayLight rounded-lg shadow-lg z-50">
                            {COUNTRIES.map((country) => (
                              <button
                                key={country.code}
                                type="button"
                                onClick={() => {
                                  setSelectedPhoneCode(country.phoneCode);
                                  setIsDropdownOpen(false);
                                }}
                                className="w-full flex items-center gap-3 px-3 py-2 hover:bg-gray-50 text-left text-sm"
                              >
                                <ReactCountryFlag
                                  countryCode={country.code}
                                  svg
                                  style={{
                                    width: '1.5em',
                                    height: '1.5em',
                                  }}
                                />
                                <span className="font-medium">{country.phoneCode}</span>
                                <span className="text-gray-600 text-xs">{country.name}</span>
                              </button>
                            ))}
                          </div>
                        )}
                      </div>
                      <span className="text-brand-grayLight">|</span>
                    </div>
                    <Input
                      id="indv_phoneNumber"
                      type="tel"
                      placeholder="123456789"
                      className="pl-36"
                      {...register("phoneNumber")}
                    />
                  </div>
                  <p className="text-xs text-brand-grayMed">Enter local number only, without country code</p>
                  {errors.phoneNumber && (
                    <p className="text-xs text-red-600">
                      {errors.phoneNumber.message}
                    </p>
                  )}
                </div>
              </div>

              {/* Address */}
              <div className="space-y-6">
                <h3 className="text-lg font-bold text-brand-dark">{tAccount("form.address")}</h3>
                <div className="space-y-2">
                  <Label htmlFor="indv_address">
                    {tAccount("form.streetAddress")}<span className="text-red-600">*</span>
                  </Label>
                  <Input id="indv_address" {...register("address")} />
                  {errors.address && (
                    <p className="text-xs text-red-600">
                      {errors.address.message}
                    </p>
                  )}
                </div>

                <div className="grid gap-6 md:grid-cols-3">
                  <div className="space-y-2">
                    <Label htmlFor="indv_city">
                      {tAccount("form.city")}<span className="text-red-600">*</span>
                    </Label>
                    <Input id="indv_city" {...register("city")} />
                    {errors.city && (
                      <p className="text-xs text-red-600">
                        {errors.city.message}
                      </p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="indv_postalCode">
                      {tAccount("form.postalCode")}<span className="text-red-600">*</span>
                    </Label>
                    <Input id="indv_postalCode" {...register("postalCode")} />
                    {errors.postalCode && (
                      <p className="text-xs text-red-600">
                        {errors.postalCode.message}
                      </p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="indv_country">
                      {tAccount("form.country")}<span className="text-red-600">*</span>
                    </Label>
                    <select
                      id="indv_country"
                      {...register("country")}
                      className="flex h-12 w-full rounded-xl border border-brand-grayLight bg-white px-4 py-3 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-gold"
                    >
                      <option value="">{tAccount("form.selectCountry")}</option>
                      {COUNTRIES.map((country) => (
                        <option key={country.code} value={country.code}>
                          {country.name}
                        </option>
                      ))}
                    </select>
                    {errors.country && (
                      <p className="text-xs text-red-600">
                        {errors.country.message}
                      </p>
                    )}
                  </div>
                </div>
              </div>

              {/* Activity Information */}
              <div className="space-y-6">
                <h3 className="text-lg font-bold text-brand-dark">
                  {tAccount("form.activityInfo")}
                </h3>

                <div className="space-y-2">
                  <Label htmlFor="indv_isPEP">
                    {tAccount("form.isPEP")}
                  </Label>
                  <div className="flex items-center gap-4">
                    <label className="flex items-center gap-2">
                      <input
                        type="radio"
                        name="indv_isPEP"
                        value="false"
                        checked={!isPEP}
                        onChange={() => setValue("isPEP", false)}
                        className="h-4 w-4 text-brand-gold focus:ring-brand-gold"
                      />
                      <span className="text-sm">{tAccount("form.no")}</span>
                    </label>
                    <label className="flex items-center gap-2">
                      <input
                        type="radio"
                        name="indv_isPEP"
                        value="true"
                        checked={isPEP}
                        onChange={() => setValue("isPEP", true)}
                        className="h-4 w-4 text-brand-gold focus:ring-brand-gold"
                      />
                      <span className="text-sm">{tAccount("form.yes")}</span>
                    </label>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="indv_activityCountries">
                    Countries of Activity<span className="text-red-600">*</span>
                  </Label>
                  <select
                    id="indv_activityCountries"
                    {...register("activityCountries")}
                    multiple
                    size={5}
                    className="flex w-full rounded-xl border border-brand-grayLight bg-white px-4 py-3 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-gold"
                  >
                    {COUNTRIES.map((country) => (
                      <option key={country.code} value={country.code}>
                        {country.name}
                      </option>
                    ))}
                  </select>
                  <p className="text-xs text-brand-grayMed">
                    Hold Ctrl (Windows) or Cmd (Mac) to select multiple countries
                  </p>
                  {errors.activityCountries && (
                    <p className="text-xs text-red-600">
                      {errors.activityCountries.message}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="indv_expectedMonthlyVolume">
                    {tAccount("form.expectedMonthlyVolume")}<span className="text-red-600">*</span>
                  </Label>
                  <select
                    id="indv_expectedMonthlyVolume"
                    {...register("expectedMonthlyVolume")}
                    className="flex h-12 w-full rounded-xl border border-brand-grayLight bg-white px-4 py-3 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-gold"
                  >
                    <option value="">{tAccount("form.selectRange")}</option>
                    <option value="0-5k">€0 - €5,000</option>
                    <option value="5k-20k">€5,000 - €20,000</option>
                    <option value="20k-50k">€20,000 - €50,000</option>
                    <option value="50k+">€50,000+</option>
                  </select>
                  {errors.expectedMonthlyVolume && (
                    <p className="text-xs text-red-600">
                      {errors.expectedMonthlyVolume.message}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="indv_sourceOfFunds">
                    {tAccount("form.sourceOfFunds")}<span className="text-red-600">*</span>
                  </Label>
                  <textarea
                    id="indv_sourceOfFunds"
                    {...register("sourceOfFunds")}
                    rows={4}
                    className="flex w-full rounded-xl border border-brand-grayLight bg-white px-4 py-3 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-gold"
                    placeholder={tAccount("form.sourceOfFundsPlaceholder")}
                  />
                  {errors.sourceOfFunds && (
                    <p className="text-xs text-red-600">
                      {errors.sourceOfFunds.message}
                    </p>
                  )}
                </div>
              </div>

              {/* Consents */}
              <div className="space-y-4 rounded-xl bg-brand-grayLight/30 p-6">
                <h3 className="font-bold text-brand-dark">{tAccount("form.consents")}</h3>
                <ConsentCheckbox
                  id="indv_consentKYC"
                  checked={consentKYC}
                  onCheckedChange={(checked) =>
                    setValue("consentKYC", checked as boolean, { shouldValidate: true })
                  }
                  label={tAccount("form.consentKYC")}
                  required
                  error={errors.consentKYC?.message}
                />
                <ConsentCheckbox
                  id="indv_consentTerms"
                  checked={consentTerms}
                  onCheckedChange={(checked) =>
                    setValue("consentTerms", checked as boolean, { shouldValidate: true })
                  }
                  label={tAccount("form.consentTerms")}
                  required
                  error={errors.consentTerms?.message}
                  links={[
                    { text: tAccount("form.termsLink"), href: "/legal/terms" },
                    { text: tAccount("form.privacyLink"), href: "/legal/privacy" },
                  ]}
                />
              </div>

              <Button
                type="submit"
                variant="primary"
                size="lg"
                disabled={isSubmitting}
                className="w-full"
              >
                {isSubmitting
                  ? t("common.loading")
                  : t("whitelabel.submitApplication")}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
