"use client";

import * as React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useTranslations } from "next-intl";
import { useParams, useRouter } from "next/navigation";
import { CheckCircle2 } from "lucide-react";
import {
  whitelabelKYBSchema,
  type WhitelabelKYBFormData,
} from "@/lib/validators/whitelabel";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ConsentCheckbox } from "@/components/form/consent-checkbox";
import { SectionHeading } from "@/components/section-heading";
import { SumsubKycWidget } from "@/components/sumsub-kyc-widget";
import { COUNTRIES } from "@/shared/lib/countries";

type ApplicationStatus = "form" | "approved" | "declined";

export default function CompanyAccountPage() {
  const t = useTranslations();
  const tAccount = useTranslations("accountOpening.company");
  const params = useParams();
  const router = useRouter();
  const locale = params.locale as string;
  const [status, setStatus] = React.useState<ApplicationStatus>("form");
  const [showKyc, setShowKyc] = React.useState(false);
  const [applicationId, setApplicationId] = React.useState<string>("");

  // Reset status when component mounts to ensure fresh start
  React.useEffect(() => {
    // Clear any persisted state on mount
    setStatus("form");
  }, []);

  const {
    register,
    handleSubmit,
    setValue,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<WhitelabelKYBFormData>({
    resolver: zodResolver(whitelabelKYBSchema),
    defaultValues: {
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
      console.log("Submitting KYB data:", data);

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
      const applicationResponse = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/api/`applications', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
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

      const companyResponse = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/api/`companies', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(companyPayload),
      });

      if (!companyResponse.ok) {
        console.warn('Failed to create company record, but application was saved');
      }

      // Open Sumsub KYC widget for corporate identity verification
      setApplicationId(`company-${applicationResult.id || Date.now()}`);
      setShowKyc(true);
    } catch (error) {
      console.error("Error submitting application:", error);
      alert("Failed to submit application. Please try again.");
    }
  };

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
                Verification Complete
              </h1>
              <p className="mb-8 text-lg text-brand-grayMed">
                Your company verification has been submitted. Our compliance team will review your application and corporate documents.
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
                    <span>You will receive an email confirmation with your application reference</span>
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

              <div className="mt-10 flex flex-col gap-4">
                <Button
                  variant="primary"
                  size="lg"
                  className="w-full"
                  onClick={() => router.push(`/${locale}/login?from=open-account`)}
                >
                  Sign In to Dashboard
                </Button>
                <Button
                  variant="ghost"
                  size="lg"
                  onClick={startNewApplication}
                  className="w-full text-brand-grayMed hover:text-brand-dark"
                >
                  Start Another Application
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
            setStatus("approved");
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
