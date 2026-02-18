"use client";

import * as React from "react";
import { useTranslations } from "next-intl";
import { Hero } from "@/components/hero";
import { Card, CardContent } from "@/components/ui/card";
import { Shield, FileCheck, Building2, Scale } from "lucide-react";

export default function RegulatoryPage() {
  const t = useTranslations("legal.regulatory");

  const regulators = [
    {
      name: "ACPR",
      fullName: "Autorité de Contrôle Prudentiel et de Résolution",
      country: t("regulators.acpr.country"),
      description: t("regulators.acpr.description"),
      website: "https://acpr.banque-france.fr",
      icon: Shield,
    },
    {
      name: "AMF",
      fullName: "Autorité des Marchés Financiers",
      country: t("regulators.amf.country"),
      description: t("regulators.amf.description"),
      website: "https://www.amf-france.org",
      icon: Building2,
    },
  ];

  return (
    <>
      <Hero
        title={t("heroTitle")}
        subtitle={t("heroSubtitle")}
      />

      <section className="bg-white py-20">
        <div className="container mx-auto max-w-4xl px-6">
          <div className="mb-12 text-center">
            <p className="text-lg text-brand-grayMed">{t("intro")}</p>
          </div>

          <Card className="mb-12 border-none shadow-sm">
            <CardContent className="p-8">
              <div className="mb-6 inline-flex h-16 w-16 items-center justify-center rounded-full bg-brand-goldLight">
                <Scale className="h-8 w-8 text-brand-goldDark" />
              </div>
              <h2 className="mb-4 text-2xl font-bold text-brand-dark">{t("framework.title")}</h2>
              <p className="mb-4 text-brand-grayMed">{t("framework.intro")}</p>
              <ul className="list-disc pl-6 text-brand-grayMed space-y-2">
                <li>{t("framework.items.psd2")}</li>
                <li>{t("framework.items.mifid")}</li>
                <li>{t("framework.items.amld")}</li>
                <li>{t("framework.items.gdpr")}</li>
                <li>{t("framework.items.banking")}</li>
              </ul>
            </CardContent>
          </Card>

          <h2 className="mb-8 text-center text-3xl font-bold text-brand-dark">{t("regulatorsTitle")}</h2>

          <div className="space-y-6 mb-12">
            {regulators.map((regulator, index) => {
              const Icon = regulator.icon;
              return (
                <Card key={index} className="card-hover border-none">
                  <CardContent className="p-8">
                    <div className="flex items-start gap-6">
                      <div className="flex-shrink-0">
                        <div className="inline-flex h-16 w-16 items-center justify-center rounded-full bg-brand-goldLight">
                          <Icon className="h-8 w-8 text-brand-goldDark" />
                        </div>
                      </div>
                      <div className="flex-1">
                        <div className="mb-2 flex items-center gap-3">
                          <h3 className="text-2xl font-bold text-brand-dark">{regulator.name}</h3>
                          <span className="rounded-full bg-brand-goldLight px-3 py-1 text-xs font-semibold text-brand-goldDark">
                            {regulator.country}
                          </span>
                        </div>
                        <p className="mb-3 text-sm font-semibold text-brand-gold">
                          {regulator.fullName}
                        </p>
                        <p className="mb-4 text-brand-grayMed">
                          {regulator.description}
                        </p>
                        <a
                          href={regulator.website}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-sm font-semibold text-brand-gold hover:text-brand-goldDark transition-colors"
                        >
                          {t("visitWebsite")}
                        </a>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          <Card className="mb-12 border-none shadow-sm">
            <CardContent className="p-8">
              <div className="mb-6 inline-flex h-16 w-16 items-center justify-center rounded-full bg-brand-goldLight">
                <FileCheck className="h-8 w-8 text-brand-goldDark" />
              </div>
              <h2 className="mb-4 text-2xl font-bold text-brand-dark">{t("compliance.title")}</h2>
              <p className="mb-4 text-brand-grayMed">{t("compliance.intro")}</p>

              <h3 className="mt-6 mb-3 text-xl font-semibold text-brand-dark">{t("compliance.aml.title")}</h3>
              <p className="mb-4 text-brand-grayMed">{t("compliance.aml.text")}</p>

              <h3 className="mt-6 mb-3 text-xl font-semibold text-brand-dark">{t("compliance.kyc.title")}</h3>
              <p className="mb-4 text-brand-grayMed">{t("compliance.kyc.text")}</p>

              <h3 className="mt-6 mb-3 text-xl font-semibold text-brand-dark">{t("compliance.ctf.title")}</h3>
              <p className="mb-4 text-brand-grayMed">{t("compliance.ctf.text")}</p>

              <h3 className="mt-6 mb-3 text-xl font-semibold text-brand-dark">{t("compliance.dataProtection.title")}</h3>
              <p className="mb-4 text-brand-grayMed">{t("compliance.dataProtection.text")}</p>

              <h3 className="mt-6 mb-3 text-xl font-semibold text-brand-dark">{t("compliance.clientFunds.title")}</h3>
              <p className="mb-4 text-brand-grayMed">{t("compliance.clientFunds.text")}</p>
            </CardContent>
          </Card>

          <Card className="border-none shadow-sm">
            <CardContent className="p-8">
              <h2 className="mb-4 text-2xl font-bold text-brand-dark">{t("licenses.title")}</h2>
              <p className="mb-6 text-brand-grayMed">{t("licenses.intro")}</p>

              <div className="space-y-4">
                <div className="rounded-lg border border-brand-grayLight/30 p-4">
                  <h3 className="mb-2 text-lg font-semibold text-brand-dark">{t("licenses.banking.title")}</h3>
                  <p className="mb-2 text-sm text-brand-grayMed">{t("licenses.banking.supervised")}</p>
                  <p className="text-xs text-brand-grayMed">{t("licenses.banking.text")}</p>
                </div>

                <div className="rounded-lg border border-brand-grayLight/30 p-4">
                  <h3 className="mb-2 text-lg font-semibold text-brand-dark">{t("licenses.investment.title")}</h3>
                  <p className="mb-2 text-sm text-brand-grayMed">{t("licenses.investment.regulated")}</p>
                  <p className="text-xs text-brand-grayMed">{t("licenses.investment.text")}</p>
                </div>

                <div className="rounded-lg border border-brand-grayLight/30 p-4">
                  <h3 className="mb-2 text-lg font-semibold text-brand-dark">{t("licenses.payment.title")}</h3>
                  <p className="mb-2 text-sm text-brand-grayMed">{t("licenses.payment.authorized")}</p>
                  <p className="text-xs text-brand-grayMed">{t("licenses.payment.text")}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="mt-12 rounded-lg bg-brand-off p-8 text-center">
            <h3 className="mb-4 text-xl font-bold text-brand-dark">{t("questions.title")}</h3>
            <p className="mb-6 text-brand-grayMed">{t("questions.text")}</p>
            <div className="space-y-2 text-sm text-brand-grayMed">
              <p><strong>{t("questions.emailLabel")}</strong> compliance@opulanz.com</p>
              <p><strong>{t("questions.phoneLabel")}</strong> +352 20 30 40 50</p>
              <p><strong>{t("questions.addressLabel")}</strong> 1 Avenue de la Liberté, L-1931 Luxembourg</p>
            </div>
          </div>

          <p className="mt-8 text-center text-xs text-brand-grayMed">
            {t("lastUpdated")}
          </p>
        </div>
      </section>
    </>
  );
}
