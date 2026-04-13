"use client";

import * as React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useTranslations } from "next-intl";
import { useParams, useRouter } from "next/navigation";
import { CheckCircle2, Eye, EyeOff, Loader2 } from "lucide-react";
import { setAuthToken } from "@/lib/auth";
import {
  whitelabelKYBSchema,
  type WhitelabelKYBFormData,
} from "@/shared/lib/validators/whitelabel";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ConsentCheckbox } from "@/components/form/consent-checkbox";
import { SectionHeading } from "@/components/section-heading";
import { SumsubKycWidget } from "@/components/sumsub-kyc-widget";
import { COUNTRIES } from "@/shared/lib/countries";

type ApplicationStatus = "form" | "create-login" | "setup-2fa" | "approved" | "declined";

export default function CompanyAccountPage() {
  const t = useTranslations();
  const tAccount = useTranslations("accountOpening.company");
  const params = useParams();
  const router = useRouter();
  const locale = params.locale as string;
  const [status, setStatus] = React.useState<ApplicationStatus>("form");
  const [showKyc, setShowKyc] = React.useState(false);
  const [applicationId, setApplicationId] = React.useState<string>("");
  const [submittedEmail, setSubmittedEmail] = React.useState("");
  const [submittedCompanyName, setSubmittedCompanyName] = React.useState("");
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

  // Reset status when component mounts to ensure fresh start
  React.useEffect(() => {
    // Clear any persisted state on mount
    setStatus("form");
  }, []);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<WhitelabelKYBFormData>({
    resolver: zodResolver(whitelabelKYBSchema),
    defaultValues: {
      contactEmail: "",
      activityCountries: [],
      consentKYB: false,
      consentTerms: false,
    },
  });

  // Function to reset everything for a new application
  const startNewApplication = () => {
    setStatus("form");
    setShowKyc(false);
    setApplicationId("");
    reset();
  };

  const onSubmit = async (data: WhitelabelKYBFormData) => {
    try {
      const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

      // Prepare the payload for the backend
      const applicationPayload = {
        type: "company",
        status: "submitted",
        payload: {
          // Company Information
          companyName: data.companyName,
          registrationNumber: data.registrationNumber,
          dateOfIncorporation: data.dateOfIncorporation,
          legalForm: data.legalForm,
          contactEmail: data.contactEmail,

          // Company Address
          companyAddress: data.companyAddress,
          companyCity: data.companyCity,
          companyPostalCode: data.companyPostalCode,
          companyCountry: data.companyCountry,

          // Business Activity
          businessActivity: data.businessActivity,
          activityCountries: data.activityCountries,
          expectedMonthlyVolume: data.expectedMonthlyVolume,

          // Consents
          consentKYB: data.consentKYB,
          consentTerms: data.consentTerms,

          // Metadata
          submittedAt: new Date().toISOString(),
        }
      };

      // Submit application to backend API
      const applicationResponse = await fetch(`${API}/api/applications`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(applicationPayload),
      });

      if (!applicationResponse.ok) {
        throw new Error('Failed to submit application');
      }

      const applicationResult = await applicationResponse.json();

      // Also create a company record
      const companyPayload = {
        name: data.companyName,
        registration_number: data.registrationNumber,
        country: data.companyCountry,
        legal_form: data.legalForm,
        incorporation_date: data.dateOfIncorporation,
        registered_address: {
          street: data.companyAddress,
          city: data.companyCity,
          zip: data.companyPostalCode,
          country: data.companyCountry,
        },
      };

      await fetch(`${API}/api/companies`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(companyPayload),
      }).catch(() => {}); // non-blocking

      // Send confirmation notification
      fetch(`${API}/api/notifications/appointment`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customerName: data.companyName,
          customerEmail: data.contactEmail,
          meetingType: 'Company Account Application',
          appointmentDate: new Date().toLocaleDateString(),
          appointmentTime: new Date().toLocaleTimeString(),
          price: 0,
        }),
      }).catch(() => {}); // non-blocking

      // Store form data for account creation after KYC
      setSubmittedEmail(data.contactEmail);
      setSubmittedCompanyName(data.companyName);
      setSubmittedAppId(applicationResult.id || "");

      // Open Sumsub KYC widget for corporate identity verification
      setApplicationId(`company-${applicationResult.id || Date.now()}`);
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
            firstName: submittedCompanyName,
            lastName: "",
            email: submittedEmail,
            phone: null,
            password,
            accountType: "corporate",
            applicationId: submittedAppId,
          }),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error);
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
                <h1 className="text-2xl font-bold text-brand-dark">Verification Complete!</h1>
                <p className="mt-2 text-brand-grayMed">Set a password to access your Opulanz business account</p>
              </div>

              <form onSubmit={handleCreateLogin} className="space-y-4">
                <div className="space-y-1">
                  <Label>Contact Email</Label>
                  <Input value={submittedEmail} disabled className="bg-gray-50 text-brand-grayMed" />
                </div>

                <div className="space-y-1">
                  <Label htmlFor="comp_password">Password <span className="text-red-500">*</span></Label>
                  <div className="relative">
                    <Input
                      id="comp_password"
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
                  <Label htmlFor="comp_confirm_password">Confirm Password <span className="text-red-500">*</span></Label>
                  <Input
                    id="comp_confirm_password"
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
                <p className="mt-2 text-sm text-brand-grayMed">Scan the QR code with the Google Authenticator app to enable two-factor authentication on your business account.</p>
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
                  <Label htmlFor="comp_totp_code">3. Enter the 6-digit code from the app <span className="text-red-500">*</span></Label>
                  <Input
                    id="comp_totp_code"
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
                Your company verification is submitted and your account is active. A welcome email has been sent to <strong>{submittedEmail}</strong>.
              </p>

              <div className="mb-8 rounded-xl bg-amber-50 border border-amber-200 p-6">
                <p className="text-sm font-semibold text-amber-800">Application Under Review</p>
                <p className="mt-1 text-sm text-amber-700">Corporate applications are reviewed within 2-5 business days due to enhanced due diligence requirements.</p>
              </div>

              <div className="space-y-4 text-left">
                <h3 className="text-xl font-bold text-brand-dark">What happens next?</h3>
                <ul className="space-y-3 text-brand-grayMed">
                  <li className="flex items-start gap-3">
                    <span className="text-brand-gold">✓</span>
                    <span>Welcome email sent to {submittedEmail}</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="text-brand-gold">✓</span>
                    <span>Our compliance team will perform enhanced due diligence on your company</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="text-brand-gold">✓</span>
                    <span>Once approved, you will receive your corporate IBAN and account details</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="text-brand-gold">✓</span>
                    <span>Set up multi-user access and corporate cards for your team</span>
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
          levelName="corporate_signup_kyc"
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
            <CardTitle>{tAccount("form.companyInfo")}</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
              {/* Company Details */}
              <div className="grid gap-6 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="comp_companyName">
                    Company Name<span className="text-red-600">*</span>
                  </Label>
                  <Input id="comp_companyName" {...register("companyName")} />
                  {errors.companyName && (
                    <p className="text-xs text-red-600">
                      {errors.companyName.message}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="comp_registrationNumber">
                    Registration Number<span className="text-red-600">*</span>
                  </Label>
                  <Input id="comp_registrationNumber" {...register("registrationNumber")} />
                  {errors.registrationNumber && (
                    <p className="text-xs text-red-600">
                      {errors.registrationNumber.message}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="comp_dateOfIncorporation">
                    Date of Incorporation<span className="text-red-600">*</span>
                  </Label>
                  <Input
                    id="comp_dateOfIncorporation"
                    type="date"
                    {...register("dateOfIncorporation")}
                  />
                  {errors.dateOfIncorporation && (
                    <p className="text-xs text-red-600">
                      {errors.dateOfIncorporation.message}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="comp_legalForm">
                    Legal Form<span className="text-red-600">*</span>
                  </Label>
                  <select
                    id="comp_legalForm"
                    {...register("legalForm")}
                    className="flex h-12 w-full rounded-xl border border-brand-grayLight bg-white px-4 py-3 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-gold"
                  >
                    <option value="">Select legal form</option>
                    <option value="SARL">SARL - Société à Responsabilité Limitée</option>
                    <option value="SA">SA - Société Anonyme</option>
                    <option value="SAS">SAS - Société par Actions Simplifiée</option>
                    <option value="EURL">EURL - Entreprise Unipersonnelle à Responsabilité Limitée</option>
                    <option value="SCSp">SCSp - Société en Commandite Spéciale</option>
                    <option value="OTHER">Other</option>
                  </select>
                  {errors.legalForm && (
                    <p className="text-xs text-red-600">
                      {errors.legalForm.message}
                    </p>
                  )}
                </div>
              </div>

              {/* Contact Email */}
              <div className="space-y-2">
                <Label htmlFor="comp_contactEmail">
                  Contact Email<span className="text-red-600">*</span>
                </Label>
                <Input
                  id="comp_contactEmail"
                  type="email"
                  placeholder="contact@company.com"
                  {...register("contactEmail")}
                />
                {errors.contactEmail && (
                  <p className="text-xs text-red-600">
                    {errors.contactEmail.message}
                  </p>
                )}
              </div>

              {/* Company Address */}
              <div className="space-y-6">
                <h3 className="text-lg font-bold text-brand-dark">Company Address</h3>
                <div className="space-y-2">
                  <Label htmlFor="comp_companyAddress">
                    Street Address<span className="text-red-600">*</span>
                  </Label>
                  <Input id="comp_companyAddress" {...register("companyAddress")} />
                  {errors.companyAddress && (
                    <p className="text-xs text-red-600">
                      {errors.companyAddress.message}
                    </p>
                  )}
                </div>

                <div className="grid gap-6 md:grid-cols-3">
                  <div className="space-y-2">
                    <Label htmlFor="comp_companyCity">
                      City<span className="text-red-600">*</span>
                    </Label>
                    <Input id="comp_companyCity" {...register("companyCity")} />
                    {errors.companyCity && (
                      <p className="text-xs text-red-600">
                        {errors.companyCity.message}
                      </p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="comp_companyPostalCode">
                      Postal Code<span className="text-red-600">*</span>
                    </Label>
                    <Input id="comp_companyPostalCode" {...register("companyPostalCode")} />
                    {errors.companyPostalCode && (
                      <p className="text-xs text-red-600">
                        {errors.companyPostalCode.message}
                      </p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="comp_companyCountry">
                      Country<span className="text-red-600">*</span>
                    </Label>
                    <select
                      id="comp_companyCountry"
                      {...register("companyCountry")}
                      className="flex h-12 w-full rounded-xl border border-brand-grayLight bg-white px-4 py-3 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-gold"
                    >
                      <option value="">Select country</option>
                      {COUNTRIES.map((country) => (
                        <option key={country.code} value={country.code}>
                          {country.name}
                        </option>
                      ))}
                    </select>
                    {errors.companyCountry && (
                      <p className="text-xs text-red-600">
                        {errors.companyCountry.message}
                      </p>
                    )}
                  </div>
                </div>
              </div>

              {/* Business Activity */}
              <div className="space-y-6">
                <h3 className="text-lg font-bold text-brand-dark">
                  Business Activity
                </h3>

                <div className="space-y-2">
                  <Label htmlFor="comp_businessActivity">
                    Business Activity Description<span className="text-red-600">*</span>
                  </Label>
                  <textarea
                    id="comp_businessActivity"
                    {...register("businessActivity")}
                    rows={4}
                    className="flex w-full rounded-xl border border-brand-grayLight bg-white px-4 py-3 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-gold"
                    placeholder="Describe your main business activities..."
                  />
                  {errors.businessActivity && (
                    <p className="text-xs text-red-600">
                      {errors.businessActivity.message}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="comp_activityCountries">
                    Countries of Activity<span className="text-red-600">*</span>
                  </Label>
                  <select
                    id="comp_activityCountries"
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
                  <Label htmlFor="comp_expectedMonthlyVolume">
                    Expected Monthly Transaction Volume<span className="text-red-600">*</span>
                  </Label>
                  <select
                    id="comp_expectedMonthlyVolume"
                    {...register("expectedMonthlyVolume")}
                    className="flex h-12 w-full rounded-xl border border-brand-grayLight bg-white px-4 py-3 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-gold"
                  >
                    <option value="">Select range</option>
                    <option value="0-10k">€0 - €10,000</option>
                    <option value="10k-50k">€10,000 - €50,000</option>
                    <option value="50k-100k">€50,000 - €100,000</option>
                    <option value="100k-500k">€100,000 - €500,000</option>
                    <option value="500k+">€500,000+</option>
                  </select>
                  {errors.expectedMonthlyVolume && (
                    <p className="text-xs text-red-600">
                      {errors.expectedMonthlyVolume.message}
                    </p>
                  )}
                </div>
              </div>

              {/* Consents */}
              <div className="space-y-4 rounded-xl bg-brand-grayLight/30 p-6">
                <h3 className="font-bold text-brand-dark">Consents</h3>
                <ConsentCheckbox
                  id="comp_consentKYB"
                  checked={watch("consentKYB")}
                  onCheckedChange={(checked) =>
                    setValue("consentKYB", checked as boolean)
                  }
                  label="I consent to business verification and compliance checks as required by law"
                  required
                  error={errors.consentKYB?.message}
                />
                <ConsentCheckbox
                  id="comp_consentTerms"
                  checked={watch("consentTerms")}
                  onCheckedChange={(checked) =>
                    setValue("consentTerms", checked as boolean)
                  }
                  label="I agree to Opulanz"
                  required
                  error={errors.consentTerms?.message}
                  links={[
                    { text: "Terms & Conditions", href: "/legal/terms" },
                    { text: "Privacy Policy", href: "/legal/privacy" },
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
