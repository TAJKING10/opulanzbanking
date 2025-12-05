"use client";

import * as React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useTranslations } from "next-intl";
import { CheckCircle2 } from "lucide-react";
import {
  whitelabelKYBSchema,
  type WhitelabelKYBFormData,
} from "@/shared/lib/validators/whitelabel";
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

export default function CompanyAccountPage() {
  const t = useTranslations();
  const [status, setStatus] = React.useState<ApplicationStatus>("form");
  const [iban, setIban] = React.useState<string>("");

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<WhitelabelKYBFormData>({
    resolver: zodResolver(whitelabelKYBSchema),
    defaultValues: {
      activityCountries: [],
      consentKYB: false,
      consentTerms: false,
      statutes: [],
      registerExtract: [],
      uboDeclaration: [],
    },
  });

  const onSubmit = async (data: WhitelabelKYBFormData) => {
    // Simulate API submission
    console.log("Submitting KYB data:", data);
    await new Promise((resolve) => setTimeout(resolve, 2000));

    // Simulate approval for demo
    setStatus("submitted");
    setTimeout(() => {
      setStatus("approved");
      setIban("LU28 0019 4006 4475 0001");
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
                Your business account has been successfully approved!
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
                      Set up multi-user access for your team
                    </span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="text-brand-gold">✓</span>
                    <span>Configure accounting integration</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="text-brand-gold">✓</span>
                    <span>Order corporate debit cards</span>
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
                Your business account application is being reviewed. You will receive a decision within 2-3 business days.
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
          title={t("whitelabel.kybTitle")}
          description="Complete your business verification to open your company account"
          align="center"
          className="mb-12"
        />

        <Card className="border-none shadow-elevated">
          <CardHeader>
            <CardTitle>Company Information</CardTitle>
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

              {/* Document Uploads */}
              <div className="space-y-6">
                <h3 className="text-lg font-bold text-brand-dark">
                  Company Documents
                </h3>
                <p className="text-sm text-brand-grayMed">
                  Please upload clear copies of the following documents (max 15MB each)
                </p>

                <div className="space-y-2">
                  <Label>{t("whitelabel.uploadStatutes")}*</Label>
                  <FileDropzone
                    multiple={false}
                    onFilesChange={(files) => setValue("statutes", files)}
                    error={errors.statutes?.message}
                  />
                </div>

                <div className="space-y-2">
                  <Label>{t("whitelabel.uploadRegister")}*</Label>
                  <FileDropzone
                    multiple={false}
                    onFilesChange={(files) => setValue("registerExtract", files)}
                    error={errors.registerExtract?.message}
                  />
                </div>

                <div className="space-y-2">
                  <Label>{t("whitelabel.uploadUbo")}*</Label>
                  <FileDropzone
                    multiple={false}
                    onFilesChange={(files) => setValue("uboDeclaration", files)}
                    error={errors.uboDeclaration?.message}
                  />
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
                  checked={false}
                  onCheckedChange={(checked) =>
                    setValue("consentKYB", checked as boolean)
                  }
                  label="I consent to business verification and compliance checks as required by law"
                  required
                  error={errors.consentKYB?.message}
                />
                <ConsentCheckbox
                  id="comp_consentTerms"
                  checked={false}
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
