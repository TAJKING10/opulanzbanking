"use client";

import * as React from "react";
import Link from "next/link";
import { useTranslations, useLocale } from "next-intl";
import { Building2, User, ArrowRight } from "lucide-react";
import { PageGuidance } from "@/components/page-guidance";
import { Hero } from "@/components/hero";
import { SectionHeading } from "@/components/section-heading";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default function OpenAccountPage() {
  const t = useTranslations();
  const locale = useLocale();

  return (
    <>
      <PageGuidance
        pageKey="open-account"
        title="Open an Account"
        description="Choose the account type that fits you best."
        steps={[
          { content: "Welcome to Account Opening. You can open a personal account for yourself, or a business account for your company — both fully online." },
          { title: "Choose Your Account Type", content: "These two cards are your options. Select 'Personal' if you are an individual, or 'Business' if you are registering a company account.", target: "#account-types", position: "top" },
          { title: "Personal Account", content: "The Personal account is for individuals. You'll need a valid ID and proof of address. The process takes about 5 minutes.", target: "#account-personal", position: "right" },
          { title: "Business Account", content: "The Business account is for companies. You'll need company registration documents and a representative ID.", target: "#account-business", position: "left" },
        ]}
        tip="You will need a valid ID and proof of address to complete identity verification (KYC)."
      />
      <Hero
        title={t("whitelabel.title")}
        subtitle={t("openAccount.subtitle")}
      />

      <section id="account-types" className="bg-brand-off py-12">
        <div className="container mx-auto max-w-5xl px-6">
          <SectionHeading
            title={t("whitelabel.choiceTitle")}
            align="center"
            className="mb-12"
          />

          <div className="grid gap-8 md:grid-cols-2">
            {/* Individual Account */}
            <Card id="account-personal" className="card-hover group border-2 border-brand-grayLight transition-all hover:border-brand-gold">
              <CardContent className="p-8">
                <div className="mb-6 inline-flex h-16 w-16 items-center justify-center rounded-full bg-brand-goldLight">
                  <User className="h-8 w-8 text-brand-goldDark" />
                </div>
                <h3 className="mb-3 text-2xl font-bold text-brand-dark">
                  {t("whitelabel.individual")}
                </h3>
                <p className="mb-6 text-brand-grayMed">
                  {t("openAccount.individual.description")}
                </p>
                <ul className="mb-8 space-y-2 text-sm text-brand-dark">
                  <li className="flex items-start gap-2">
                    <span className="text-brand-gold">✓</span>
                    <span>{t("openAccount.individual.features.iban")}</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-brand-gold">✓</span>
                    <span>{t("openAccount.individual.features.transfers")}</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-brand-gold">✓</span>
                    <span>{t("openAccount.individual.features.card")}</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-brand-gold">✓</span>
                    <span>{t("openAccount.individual.features.banking")}</span>
                  </li>
                </ul>
                <Button
                  asChild
                  variant="primary"
                  size="lg"
                  className="w-full group-hover:bg-brand-goldDark"
                >
                  <Link href={`/${locale}/open-account/start?mode=personal`}>
                    {t("openAccount.getStarted")}
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Link>
                </Button>
              </CardContent>
            </Card>

            {/* Company Account */}
            <Card id="account-business" className="card-hover group border-2 border-brand-grayLight transition-all hover:border-brand-gold">
              <CardContent className="p-8">
                <div className="mb-6 inline-flex h-16 w-16 items-center justify-center rounded-full bg-brand-goldLight">
                  <Building2 className="h-8 w-8 text-brand-goldDark" />
                </div>
                <h3 className="mb-3 text-2xl font-bold text-brand-dark">
                  {t("whitelabel.company")}
                </h3>
                <p className="mb-6 text-brand-grayMed">
                  {t("openAccount.company.description")}
                </p>
                <ul className="mb-8 space-y-2 text-sm text-brand-dark">
                  <li className="flex items-start gap-2">
                    <span className="text-brand-gold">✓</span>
                    <span>{t("openAccount.company.features.iban")}</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-brand-gold">✓</span>
                    <span>{t("openAccount.company.features.access")}</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-brand-gold">✓</span>
                    <span>{t("openAccount.company.features.accounting")}</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-brand-gold">✓</span>
                    <span>{t("openAccount.company.features.cards")}</span>
                  </li>
                </ul>
                <Button
                  asChild
                  variant="primary"
                  size="lg"
                  className="w-full group-hover:bg-brand-goldDark"
                >
                  <Link href={`/${locale}/open-account/start?mode=business`}>
                    {t("openAccount.getStarted")}
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Link>
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Company Formation CTA */}
          <div className="mt-12 rounded-2xl bg-accent-beige/30 p-8 text-center">
            <h3 className="mb-3 text-xl font-bold text-brand-dark">
              {t("whitelabel.needCompany")}
            </h3>
            <p className="mb-6 text-brand-grayMed">
              {t("openAccount.formation.cta")}
            </p>
            <Button asChild variant="outline" size="lg">
              <Link href={`/${locale}/company-formation`}>
                {t("whitelabel.formCompany")}
              </Link>
            </Button>
          </div>
        </div>
      </section>
    </>
  );
}
