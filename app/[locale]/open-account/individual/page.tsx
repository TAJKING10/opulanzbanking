"use client";

import * as React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useTranslations } from "next-intl";
import { CheckCircle2 } from "lucide-react";
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
import { FileDropzone } from "@/components/form/file-dropzone";
import { SectionHeading } from "@/components/section-heading";
import { StatusChip } from "@/components/status-chip";
import { COUNTRIES } from "@/shared/lib/countries";

type ApplicationStatus = "form" | "submitted" | "approved" | "declined";

export default function IndividualAccountPage() {
  const t = useTranslations();
  const [status, setStatus] = React.useState<ApplicationStatus>("form");
  const [iban, setIban] = React.useState<string>("");
  const [selectedPhoneCode, setSelectedPhoneCode] = React.useState<string>("+33");
  const [isDropdownOpen, setIsDropdownOpen] = React.useState<boolean>(false);
  const dropdownRef = React.useRef<HTMLDivElement>(null);

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
    formState: { errors, isSubmitting },
  } = useForm<WhitelabelKYCFormData>({
    resolver: zodResolver(whitelabelKYCSchema),
    defaultValues: {
      isPEP: false,
      activityCountries: [],
      consentKYC: false,
      consentTerms: false,
      idDocument: [],
      selfie: [],
      proofOfAddress: [],
    },
  });

  const isPEP = watch("isPEP");
  const consentKYC = watch("consentKYC");
  const consentTerms = watch("consentTerms");

  const onSubmit = async (data: WhitelabelKYCFormData) => {
    // Simulate API submission
    console.log("Submitting KYC data:", data);
    await new Promise((resolve) => setTimeout(resolve, 2000));

    // Simulate approval for demo
    setStatus("submitted");
    setTimeout(() => {
      setStatus("approved");
      setIban("LU28 0019 4006 4475 0000");
    }, 3000);
  };

  if (status === "approved") {
    return (
      <div className="min-h-screen bg-brand-off py-20">
        <div className="container mx-auto max-w-3xl px-6">
          <Card className="border-none shadow-elevated">
            <CardContent className="p-12 text-center">
              <div className="mb-6 inline-flex h-20 w-20 items-center justify-center rounded-full bg-green-100">
                <CheckCircle2 className="h-10 w-10 text-green-600" />
              </div>
              <h1 className="mb-4 text-3xl font-bold text-brand-dark">
                {t("whitelabel.approved")}
              </h1>
              <p className="mb-8 text-lg text-brand-grayMed">
                {t("whitelabel.approvedMessage")}
              </p>

              <div className="mb-8 rounded-xl bg-brand-grayLight/50 p-6">
                <p className="mb-2 text-sm font-semibold uppercase tracking-wide text-brand-grayMed">
                  {t("whitelabel.yourIban")}
                </p>
                <p className="text-2xl font-bold text-brand-dark">{iban}</p>
              </div>

              <div className="space-y-4 text-left">
                <h3 className="text-xl font-bold text-brand-dark">
                  {t("whitelabel.nextSteps")}
                </h3>
                <ul className="space-y-3 text-brand-grayMed">
                  <li className="flex items-start gap-3">
                    <span className="text-brand-gold">✓</span>
                    <span>
                      Download our mobile app or access web banking
                    </span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="text-brand-gold">✓</span>
                    <span>Set up your account security (2FA, PIN)</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="text-brand-gold">✓</span>
                    <span>Request your debit card</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="text-brand-gold">✓</span>
                    <span>Fund your account via transfer</span>
                  </li>
                </ul>
              </div>

              <div className="mt-10 flex gap-4">
                <Button variant="primary" size="lg" className="flex-1">
                  Go to Dashboard
                </Button>
                <Button variant="outline" size="lg" className="flex-1">
                  Download App
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  if (status === "submitted") {
    return (
      <div className="min-h-screen bg-brand-off py-20">
        <div className="container mx-auto max-w-3xl px-6">
          <Card className="border-none shadow-elevated">
            <CardContent className="p-12 text-center">
              <div className="mb-6 inline-flex h-20 w-20 items-center justify-center">
                <div className="h-12 w-12 animate-spin rounded-full border-4 border-brand-grayLight border-t-brand-gold" />
              </div>
              <h1 className="mb-4 text-3xl font-bold text-brand-dark">
                {t("whitelabel.applicationSubmitted")}
              </h1>
              <p className="mb-8 text-lg text-brand-grayMed">
                {t("whitelabel.decisionPending")}
              </p>
              <StatusChip status="submitted" />
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-brand-off py-20">
      <div className="container mx-auto max-w-4xl px-6">
        <SectionHeading
          title={t("whitelabel.kycTitle")}
          description="Complete your identity verification to open your account"
          align="center"
          className="mb-12"
        />

        <Card className="border-none shadow-elevated">
          <CardHeader>
            <CardTitle>Personal Information</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
              {/* Personal Details */}
              <div className="grid gap-6 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="firstName">
                    First Name<span className="text-red-600">*</span>
                  </Label>
                  <Input id="firstName" {...register("firstName")} />
                  {errors.firstName && (
                    <p className="text-xs text-red-600">
                      {errors.firstName.message}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="lastName">
                    Last Name<span className="text-red-600">*</span>
                  </Label>
                  <Input id="lastName" {...register("lastName")} />
                  {errors.lastName && (
                    <p className="text-xs text-red-600">
                      {errors.lastName.message}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="dateOfBirth">
                    Date of Birth<span className="text-red-600">*</span>
                  </Label>
                  <Input
                    id="dateOfBirth"
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
                  <Label htmlFor="nationality">
                    Nationality<span className="text-red-600">*</span>
                  </Label>
                  <select
                    id="nationality"
                    {...register("nationality")}
                    className="flex h-12 w-full rounded-xl border border-brand-grayLight bg-white px-4 py-3 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-gold"
                  >
                    <option value="">Select nationality</option>
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
                  <Label htmlFor="phoneNumber">
                    Phone Number<span className="text-red-600">*</span>
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
                      id="phoneNumber"
                      type="tel"
                      placeholder="123456789"
                      className="pl-32"
                      {...register("phoneNumber")}
                    />
                  </div>
                  {errors.phoneNumber && (
                    <p className="text-xs text-red-600">
                      {errors.phoneNumber.message}
                    </p>
                  )}
                </div>
              </div>

              {/* Address */}
              <div className="space-y-6">
                <h3 className="text-lg font-bold text-brand-dark">Address</h3>
                <div className="space-y-2">
                  <Label htmlFor="address">
                    Street Address<span className="text-red-600">*</span>
                  </Label>
                  <Input id="address" {...register("address")} />
                  {errors.address && (
                    <p className="text-xs text-red-600">
                      {errors.address.message}
                    </p>
                  )}
                </div>

                <div className="grid gap-6 md:grid-cols-3">
                  <div className="space-y-2">
                    <Label htmlFor="city">
                      City<span className="text-red-600">*</span>
                    </Label>
                    <Input id="city" {...register("city")} />
                    {errors.city && (
                      <p className="text-xs text-red-600">
                        {errors.city.message}
                      </p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="postalCode">
                      Postal Code<span className="text-red-600">*</span>
                    </Label>
                    <Input id="postalCode" {...register("postalCode")} />
                    {errors.postalCode && (
                      <p className="text-xs text-red-600">
                        {errors.postalCode.message}
                      </p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="country">
                      Country<span className="text-red-600">*</span>
                    </Label>
                    <select
                      id="country"
                      {...register("country")}
                      className="flex h-12 w-full rounded-xl border border-brand-grayLight bg-white px-4 py-3 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-gold"
                    >
                      <option value="">Select country</option>
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

              {/* Document Uploads */}
              <div className="space-y-6">
                <h3 className="text-lg font-bold text-brand-dark">
                  Document Verification
                </h3>
                <p className="text-sm text-brand-grayMed">
                  Please upload clear photos or scans of the following documents
                  (max 15MB each)
                </p>

                <div className="space-y-2">
                  <Label>{t("whitelabel.uploadId")}*</Label>
                  <FileDropzone
                    multiple={false}
                    onFilesChange={(files) => setValue("idDocument", files)}
                    error={errors.idDocument?.message}
                  />
                </div>

                <div className="space-y-2">
                  <Label>{t("whitelabel.uploadSelfie")}*</Label>
                  <FileDropzone
                    multiple={false}
                    acceptedTypes={[".jpg", ".jpeg", ".png"]}
                    onFilesChange={(files) => setValue("selfie", files)}
                    error={errors.selfie?.message}
                  />
                </div>

                <div className="space-y-2">
                  <Label>{t("whitelabel.uploadPoa")}*</Label>
                  <FileDropzone
                    multiple={false}
                    onFilesChange={(files) => setValue("proofOfAddress", files)}
                    error={errors.proofOfAddress?.message}
                  />
                </div>
              </div>

              {/* Activity Information */}
              <div className="space-y-6">
                <h3 className="text-lg font-bold text-brand-dark">
                  Activity Information
                </h3>

                <div className="space-y-2">
                  <Label htmlFor="isPEP">
                    Are you a Politically Exposed Person (PEP)?
                  </Label>
                  <div className="flex items-center gap-4">
                    <label className="flex items-center gap-2">
                      <input
                        type="radio"
                        value="false"
                        checked={!isPEP}
                        onChange={() => setValue("isPEP", false)}
                        className="h-4 w-4 text-brand-gold focus:ring-brand-gold"
                      />
                      <span className="text-sm">No</span>
                    </label>
                    <label className="flex items-center gap-2">
                      <input
                        type="radio"
                        value="true"
                        checked={isPEP}
                        onChange={() => setValue("isPEP", true)}
                        className="h-4 w-4 text-brand-gold focus:ring-brand-gold"
                      />
                      <span className="text-sm">Yes</span>
                    </label>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="expectedMonthlyVolume">
                    Expected Monthly Volume<span className="text-red-600">*</span>
                  </Label>
                  <select
                    id="expectedMonthlyVolume"
                    {...register("expectedMonthlyVolume")}
                    className="flex h-12 w-full rounded-xl border border-brand-grayLight bg-white px-4 py-3 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-gold"
                  >
                    <option value="">Select range</option>
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
                  <Label htmlFor="sourceOfFunds">
                    Source of Funds<span className="text-red-600">*</span>
                  </Label>
                  <textarea
                    id="sourceOfFunds"
                    {...register("sourceOfFunds")}
                    rows={4}
                    className="flex w-full rounded-xl border border-brand-grayLight bg-white px-4 py-3 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-gold"
                    placeholder="Please describe the origin of your funds..."
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
                <h3 className="font-bold text-brand-dark">Consents</h3>
                <ConsentCheckbox
                  id="consentKYC"
                  checked={consentKYC}
                  onCheckedChange={(checked) =>
                    setValue("consentKYC", checked as boolean)
                  }
                  label="I consent to identity verification and compliance checks as required by law"
                  required
                  error={errors.consentKYC?.message}
                />
                <ConsentCheckbox
                  id="consentTerms"
                  checked={consentTerms}
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
