"use client";

import * as React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useTranslations } from "next-intl";
import { motion } from "framer-motion";
import { CheckCircle2, ArrowRight } from "lucide-react";
import {
  warmReferralSchema,
  type WarmReferralFormData,
} from "@/lib/validators/warm-referral";
import { generateRedirectUrl } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ConsentCheckbox } from "@/components/form/consent-checkbox";
import { SectionHeading } from "@/components/section-heading";

type Step = "form" | "handoff" | "thank-you";

export default function WarmReferralPage() {
  const t = useTranslations();
  const [step, setStep] = React.useState<Step>("form");
  const [partner, setPartner] = React.useState<string>("");

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<WarmReferralFormData>({
    resolver: zodResolver(warmReferralSchema),
    defaultValues: {
      clientType: "individual",
      country: "LU",
      consentDataSharing: false,
      consentTerms: false,
      consentPartner: false,
    },
  });

  const clientType = watch("clientType");
  const country = watch("country");
  const consentDataSharing = watch("consentDataSharing");
  const consentTerms = watch("consentTerms");
  const consentPartner = watch("consentPartner");

  const onSubmit = async (data: WarmReferralFormData) => {
    // Simulate partner matching logic
    const matchedPartner =
      data.country === "LU" ? "Banque Partner LU" : "Banque Partner FR";
    setPartner(matchedPartner);
    setStep("handoff");
  };

  const handleProceedToPartner = () => {
    // TODO: Generate signed redirect URL and navigate
    const redirectUrl = generateRedirectUrl(partner, {
      email: watch("email"),
      country: watch("country"),
    });
    console.log("Redirecting to:", redirectUrl);
    setStep("thank-you");
  };

  if (step === "thank-you") {
    return (
      <div className="min-h-screen bg-brand-off py-12">
        <div className="container mx-auto max-w-2xl px-6">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
          >
            <Card className="border-none shadow-elevated">
              <CardContent className="p-12 text-center">
                <div className="mb-6 inline-flex h-20 w-20 items-center justify-center rounded-full bg-green-100">
                  <CheckCircle2 className="h-10 w-10 text-green-600" />
                </div>
                <h1 className="mb-4 text-3xl font-bold text-brand-dark">
                  {t("warmReferral.thankYouTitle")}
                </h1>
                <p className="mb-8 text-brand-grayMed">
                  {t("warmReferral.thankYouDescription")}
                </p>
                <Button variant="primary" size="lg" className="min-w-64">
                  {t("warmReferral.bookCallback")}
                </Button>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>
    );
  }

  if (step === "handoff") {
    return (
      <div className="min-h-screen bg-brand-off py-12">
        <div className="container mx-auto max-w-3xl px-6">
          <SectionHeading
            title={t("warmReferral.handoffTitle")}
            align="center"
            className="mb-12"
          />
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <Card className="border-none shadow-elevated">
              <CardContent className="p-12">
                <div className="mb-8 rounded-xl bg-accent-beige/30 p-6">
                  <p className="text-center text-lg text-brand-dark">
                    {t("warmReferral.handoffDescription", { partner })}
                  </p>
                </div>
                <div className="space-y-6">
                  <div className="flex items-start gap-4">
                    <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-brand-gold text-white">
                      1
                    </div>
                    <div>
                      <h3 className="font-bold text-brand-dark">
                        Secure Handoff
                      </h3>
                      <p className="text-sm text-brand-grayMed">
                        Your information will be securely transferred to{" "}
                        {partner}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-4">
                    <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-brand-gold text-white">
                      2
                    </div>
                    <div>
                      <h3 className="font-bold text-brand-dark">
                        Complete Application
                      </h3>
                      <p className="text-sm text-brand-grayMed">
                        Follow {partner}'s process to complete your application
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-4">
                    <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-brand-gold text-white">
                      3
                    </div>
                    <div>
                      <h3 className="font-bold text-brand-dark">
                        Opulanz Support
                      </h3>
                      <p className="text-sm text-brand-grayMed">
                        We remain your point of contact for any questions
                      </p>
                    </div>
                  </div>
                </div>
                <div className="mt-10 flex justify-center">
                  <Button
                    variant="primary"
                    size="lg"
                    onClick={handleProceedToPartner}
                    className="min-w-64"
                  >
                    {t("warmReferral.proceedToPartner", { partner })}
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-brand-off py-12">
      <div className="container mx-auto max-w-3xl px-6">
        <SectionHeading
          title={t("warmReferral.title")}
          description={t("warmReferral.subtitle")}
          align="center"
          className="mb-12"
        />
        <Card className="border-none shadow-elevated">
          <CardHeader>
            <CardTitle>{t("warmReferral.step1Title")}</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              {/* Email */}
              <div className="space-y-2">
                <Label htmlFor="email">
                  {t("warmReferral.email")}
                  <span className="text-red-600">*</span>
                </Label>
                <Input
                  id="email"
                  type="email"
                  {...register("email")}
                  aria-invalid={!!errors.email}
                />
                {errors.email && (
                  <p className="text-xs text-red-600" role="alert">
                    {errors.email.message}
                  </p>
                )}
              </div>

              {/* Client Type */}
              <div className="space-y-2">
                <Label htmlFor="clientType">
                  {t("warmReferral.clientType")}
                  <span className="text-red-600">*</span>
                </Label>
                <select
                  id="clientType"
                  {...register("clientType")}
                  className="flex h-12 w-full rounded-xl border border-brand-grayLight bg-white px-4 py-3 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-gold focus-visible:ring-offset-2"
                >
                  <option value="individual">
                    {t("warmReferral.individual")}
                  </option>
                  <option value="company">{t("warmReferral.company")}</option>
                </select>
              </div>

              {/* Country */}
              <div className="space-y-2">
                <Label htmlFor="country">
                  {t("warmReferral.country")}
                  <span className="text-red-600">*</span>
                </Label>
                <select
                  id="country"
                  {...register("country")}
                  className="flex h-12 w-full rounded-xl border border-brand-grayLight bg-white px-4 py-3 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-gold focus-visible:ring-offset-2"
                >
                  <option value="LU">{t("warmReferral.luxembourg")}</option>
                  <option value="FR">{t("warmReferral.france")}</option>
                </select>
              </div>

              {/* Legal Form (if company) */}
              {clientType === "company" && (
                <div className="space-y-2">
                  <Label htmlFor="legalForm">
                    {t("warmReferral.legalForm")}
                  </Label>
                  <select
                    id="legalForm"
                    {...register("legalForm")}
                    className="flex h-12 w-full rounded-xl border border-brand-grayLight bg-white px-4 py-3 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-gold focus-visible:ring-offset-2"
                  >
                    <option value="">{t("common.select")}</option>
                    <option value="sarl">{t("warmReferral.sarl")}</option>
                    <option value="sas">{t("warmReferral.sas")}</option>
                    <option value="sa">{t("warmReferral.sa")}</option>
                    <option value="other">{t("warmReferral.other")}</option>
                  </select>
                </div>
              )}

              {/* Expected Volume */}
              <div className="space-y-2">
                <Label htmlFor="expectedVolume">
                  {t("warmReferral.expectedVolume")}
                  <span className="text-red-600">*</span>
                </Label>
                <select
                  id="expectedVolume"
                  {...register("expectedVolume")}
                  className="flex h-12 w-full rounded-xl border border-brand-grayLight bg-white px-4 py-3 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-gold focus-visible:ring-offset-2"
                >
                  <option value="">{t("common.select")}</option>
                  <option value="0-10k">€0 - €10,000</option>
                  <option value="10k-50k">€10,000 - €50,000</option>
                  <option value="50k-100k">€50,000 - €100,000</option>
                  <option value="100k+">€100,000+</option>
                </select>
                {errors.expectedVolume && (
                  <p className="text-xs text-red-600" role="alert">
                    {errors.expectedVolume.message}
                  </p>
                )}
              </div>

              {/* Consents */}
              <div className="space-y-4 rounded-xl bg-brand-grayLight/30 p-6">
                <ConsentCheckbox
                  id="consentDataSharing"
                  checked={consentDataSharing}
                  onCheckedChange={(checked) =>
                    setValue("consentDataSharing", checked as boolean)
                  }
                  label={t("warmReferral.consent.dataSharing")}
                  required
                  error={errors.consentDataSharing?.message}
                />
                <ConsentCheckbox
                  id="consentTerms"
                  checked={consentTerms}
                  onCheckedChange={(checked) =>
                    setValue("consentTerms", checked as boolean)
                  }
                  label={t("warmReferral.consent.terms")}
                  required
                  error={errors.consentTerms?.message}
                  links={[
                    {
                      text: t("warmReferral.consent.termsLink"),
                      href: "/legal/terms",
                    },
                    {
                      text: t("warmReferral.consent.privacy"),
                      href: "/legal/privacy",
                    },
                  ]}
                />
                <ConsentCheckbox
                  id="consentPartner"
                  checked={consentPartner}
                  onCheckedChange={(checked) =>
                    setValue("consentPartner", checked as boolean)
                  }
                  label={t("warmReferral.consent.partnerTerms")}
                  required
                  error={errors.consentPartner?.message}
                />
              </div>

              <Button
                type="submit"
                variant="primary"
                size="lg"
                disabled={isSubmitting}
                className="w-full"
              >
                {isSubmitting ? t("common.loading") : t("common.continue")}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
