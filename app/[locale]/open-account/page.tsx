"use client";

import * as React from "react";
import Link from "next/link";
import { useTranslations, useLocale } from "next-intl";
import { Building2, User, ArrowRight } from "lucide-react";
import { Hero } from "@/components/hero";
import { SectionHeading } from "@/components/section-heading";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default function OpenAccountPage() {
  const t = useTranslations();
  const locale = useLocale();

  return (
    <>
      <Hero
        title={t("whitelabel.title")}
        subtitle={t("openAccount.subtitle")}
      />

      <section className="bg-brand-off py-20">
        <div className="container mx-auto max-w-5xl px-6">
          <SectionHeading
            title={t("whitelabel.choiceTitle")}
            align="center"
            className="mb-12"
          />

          <div className="grid gap-8 md:grid-cols-2">
            {/* Individual Account */}
            <Card className="card-hover group border-2 border-brand-grayLight transition-all hover:border-brand-gold">
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
                    {t("openAccount.buttons.getStarted")}
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Link>
                </Button>
              </CardContent>
            </Card>

            {/* Company Account */}
            <Card className="card-hover group border-2 border-brand-grayLight transition-all hover:border-brand-gold">
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
                    {t("openAccount.buttons.getStarted")}
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
