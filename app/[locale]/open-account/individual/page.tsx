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
  const tAccount = useTranslations("accountOpening.individual");
  const [status, setStatus] = React.useState<ApplicationStatus>("form");
  const [iban, setIban] = React.useState<string>("");
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
      isPEP: false,
      activityCountries: [],
      consentKYC: false,
      consentTerms: false,
      idDocument: [],
      selfie: [],
      proofOfAddress: [],
    },
  });

  // Function to reset everything for a new application
  const startNewApplication = () => {
    setStatus("form");
    setIban("");
    setSelectedPhoneCode("+33");
    reset();
  };

  const isPEP = watch("isPEP");
  const consentKYC = watch("consentKYC");
  const consentTerms = watch("consentTerms");

  const onSubmit = async (data: WhitelabelKYCFormData) => {
    try {
      console.log("Submitting KYC data:", data);

      // Prepare the payload for the backend
      const applicationPayload = {
        type: "individual",
        status: "submitted",
        payload: {
          // Personal Information
          firstName: data.firstName,
          lastName: data.lastName,
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
      const response = await fetch('http://localhost:5000/api/applications', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(applicationPayload),
      });

      if (!response.ok) {
        throw new Error('Failed to submit application');
      }

      const result = await response.json();
      console.log("Application submitted successfully:", result);

      // TODO: Handle document uploads separately
      // For now, we'll store document file names in the console
      if (data.idDocument && data.idDocument.length > 0) {
        console.log("ID Document to upload:", data.idDocument[0].name);
      }
      if (data.selfie && data.selfie.length > 0) {
        console.log("Selfie to upload:", data.selfie[0].name);
      }
      if (data.proofOfAddress && data.proofOfAddress.length > 0) {
        console.log("Proof of Address to upload:", data.proofOfAddress[0].name);
      }

      // Show submitted status
      setStatus("submitted");

      // Simulate approval for demo (in production, this would be done by admin)
      setTimeout(() => {
        setStatus("approved");
        setIban("LU28 0019 4006 4475 0000");
      }, 3000);
    } catch (error) {
      console.error("Error submitting application:", error);
      alert("Failed to submit application. Please try again.");
    }
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
                {tAccount("approved.message")}
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
                      {tAccount("approved.nextSteps.mobileApp")}
                    </span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="text-brand-gold">✓</span>
                    <span>{tAccount("approved.nextSteps.security")}</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="text-brand-gold">✓</span>
                    <span>{tAccount("approved.nextSteps.debitCard")}</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="text-brand-gold">✓</span>
                    <span>{tAccount("approved.nextSteps.fundAccount")}</span>
                  </li>
                </ul>
              </div>

              <div className="mt-10 flex flex-col gap-4">
                <div className="flex gap-4">
                  <Button variant="primary" size="lg" className="flex-1">
                    {tAccount("approved.buttons.dashboard")}
                  </Button>
                  <Button variant="outline" size="lg" className="flex-1">
                    {tAccount("approved.buttons.downloadApp")}
                  </Button>
                </div>
                <Button
                  variant="ghost"
                  size="lg"
                  onClick={startNewApplication}
                  className="w-full text-brand-grayMed hover:text-brand-dark"
                >
                  {tAccount("approved.buttons.startNew")}
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
                {tAccount("submitted.message")}
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

              {/* Document Uploads */}
              <div className="space-y-6">
                <h3 className="text-lg font-bold text-brand-dark">
                  {tAccount("form.documentVerification")}
                </h3>
                <p className="text-sm text-brand-grayMed">
                  {tAccount("form.documentDescription")}
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
                    setValue("consentKYC", checked as boolean)
                  }
                  label={tAccount("form.consentKYC")}
                  required
                  error={errors.consentKYC?.message}
                />
                <ConsentCheckbox
                  id="indv_consentTerms"
                  checked={consentTerms}
                  onCheckedChange={(checked) =>
                    setValue("consentTerms", checked as boolean)
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
