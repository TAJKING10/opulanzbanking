"use client";

import * as React from "react";
import { useTranslations } from "next-intl";
import { Hero } from "@/components/hero";
import { Card, CardContent } from "@/components/ui/card";
import { Shield, Building2, FileCheck, Scale } from "lucide-react";

export default function RegulatoryPage() {
  const t = useTranslations("regulatory");

  const regulators = [
    { key: "acpr", icon: Shield },
    { key: "amf",  icon: Building2 },
  ] as const;

  return (
    <>
      <Hero
        title={t("hero.title")}
        subtitle={t("hero.subtitle")}
      />

      <section className="bg-white py-12">
        <div className="container mx-auto max-w-4xl px-6">
          <div className="mb-12 text-center">
            <p className="text-lg text-brand-grayMed">{t("intro")}</p>
          </div>

          {/* Regulatory Framework */}
          <Card className="mb-12 border-none shadow-sm">
            <CardContent className="p-8">
              <div className="mb-6 inline-flex h-16 w-16 items-center justify-center rounded-full bg-brand-goldLight">
                <Scale className="h-8 w-8 text-brand-goldDark" />
              </div>
              <h2 className="mb-4 text-2xl font-bold text-brand-dark">{t("framework.title")}</h2>
              <p className="mb-4 text-brand-grayMed">{t("framework.description")}</p>
              <ul className="list-disc pl-6 text-brand-grayMed space-y-2">
                <li>{t("framework.psd2")}</li>
                <li>{t("framework.mifid2")}</li>
                <li>{t("framework.amld")}</li>
                <li>{t("framework.gdpr")}</li>
                <li>{t("framework.french")}</li>
              </ul>
            </CardContent>
          </Card>

          {/* Regulators */}
          <h2 className="mb-8 text-center text-3xl font-bold text-brand-dark">{t("regulators.title")}</h2>
          <div className="space-y-6 mb-12">
            {regulators.map(({ key, icon: Icon }) => (
              <Card key={key} className="card-hover border-none">
                <CardContent className="p-8">
                  <div className="flex items-start gap-6">
                    <div className="flex-shrink-0">
                      <div className="inline-flex h-16 w-16 items-center justify-center rounded-full bg-brand-goldLight">
                        <Icon className="h-8 w-8 text-brand-goldDark" />
                      </div>
                    </div>
                    <div className="flex-1">
                      <div className="mb-2 flex items-center gap-3">
                        <h3 className="text-2xl font-bold text-brand-dark">
                          {t(`regulators.${key}.name` as any)}
                        </h3>
                        <span className="rounded-full bg-brand-goldLight px-3 py-1 text-xs font-semibold text-brand-goldDark">
                          {t(`regulators.${key}.country` as any)}
                        </span>
                      </div>
                      <p className="mb-1 text-sm font-semibold text-brand-gold">
                        {t(`regulators.${key}.fullName` as any)}
                      </p>
                      <p className="mb-4 text-brand-grayMed">
                        {t(`regulators.${key}.description` as any)}
                      </p>
                      <a
                        href={t(`regulators.${key}.website` as any)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm font-semibold text-brand-gold hover:text-brand-goldDark transition-colors"
                      >
                        {t("regulators.visitWebsite")} &rarr;
                      </a>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Compliance Standards */}
          <Card className="mb-12 border-none shadow-sm">
            <CardContent className="p-8">
              <div className="mb-6 inline-flex h-16 w-16 items-center justify-center rounded-full bg-brand-goldLight">
                <FileCheck className="h-8 w-8 text-brand-goldDark" />
              </div>
              <h2 className="mb-4 text-2xl font-bold text-brand-dark">{t("compliance.title")}</h2>
              <p className="mb-4 text-brand-grayMed">{t("compliance.description")}</p>

              {(["aml","kyc","ctf","dataProtection","clientFunds"] as const).map((section) => (
                <div key={section}>
                  <h3 className="mt-6 mb-3 text-xl font-semibold text-brand-dark">
                    {t(`compliance.${section}.title` as any)}
                  </h3>
                  <p className="mb-4 text-brand-grayMed">
                    {t(`compliance.${section}.description` as any)}
                  </p>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Licenses */}
          <Card className="border-none shadow-sm">
            <CardContent className="p-8">
              <h2 className="mb-4 text-2xl font-bold text-brand-dark">{t("licenses.title")}</h2>
              <p className="mb-6 text-brand-grayMed">{t("licenses.description")}</p>
              <div className="space-y-4">
                {(["banking","investment","payment"] as const).map((lic) => (
                  <div key={lic} className="rounded-lg border border-brand-grayLight/30 p-4">
                    <h3 className="mb-2 text-lg font-semibold text-brand-dark">
                      {t(`licenses.${lic}.title` as any)}
                    </h3>
                    <p className="mb-2 text-sm text-brand-grayMed">
                      {t(`licenses.${lic}.authority` as any)}
                    </p>
                    <p className="text-xs text-brand-grayMed">
                      {t(`licenses.${lic}.note` as any)}
                    </p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Contact */}
          <div className="mt-12 rounded-lg bg-brand-off p-8 text-center">
            <h3 className="mb-4 text-xl font-bold text-brand-dark">{t("contact.title")}</h3>
            <p className="mb-6 text-brand-grayMed">{t("contact.description")}</p>
            <div className="space-y-2 text-sm text-brand-grayMed">
              <p><strong>{t("contact.emailLabel")}:</strong> compliance@opulanz.com</p>
              <p><strong>{t("contact.phoneLabel")}:</strong> +352 20 30 40 50</p>
              <p><strong>{t("contact.addressLabel")}:</strong> 1 Avenue de la Liberté, L-1931 Luxembourg</p>
            </div>
          </div>

          <p className="mt-8 text-center text-xs text-brand-grayMed">{t("lastUpdated")}</p>
        </div>
      </section>
    </>
  );
}
