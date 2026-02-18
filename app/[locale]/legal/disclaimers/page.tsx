"use client";

import * as React from "react";
import { useTranslations, useLocale } from "next-intl";
import { Hero } from "@/components/hero";
import { Card, CardContent } from "@/components/ui/card";
import { AlertTriangle } from "lucide-react";

export default function DisclaimersPage() {
  const t = useTranslations("legal.disclaimers");
  const locale = useLocale();

  return (
    <>
      <Hero
        title={t("heroTitle")}
        subtitle={t("heroSubtitle")}
      />

      <section className="bg-white py-20">
        <div className="container mx-auto max-w-4xl px-6">
          <div className="mb-8 rounded-lg border-l-4 border-brand-gold bg-brand-goldLight/20 p-6">
            <div className="flex items-start gap-4">
              <AlertTriangle className="h-6 w-6 flex-shrink-0 text-brand-goldDark" />
              <div>
                <h3 className="mb-2 text-lg font-bold text-brand-dark">{t("importantNotice")}</h3>
                <p className="text-sm text-brand-grayMed">
                  {t("importantNoticeText")}
                </p>
              </div>
            </div>
          </div>

          <Card className="border-none shadow-sm">
            <CardContent className="prose prose-lg max-w-none p-8">
              <h2 className="text-2xl font-bold text-brand-dark mb-4">{t("s1.title")}</h2>
              <p className="text-brand-grayMed mb-6">{t("s1.text")}</p>

              <h2 className="text-2xl font-bold text-brand-dark mb-4">{t("s2.title")}</h2>
              <p className="text-brand-grayMed mb-6">{t("s2.text")}</p>

              <h2 className="text-2xl font-bold text-brand-dark mb-4">{t("s3.title")}</h2>
              <p className="text-brand-grayMed mb-4">{t("s3.intro")}</p>
              <ul className="list-disc pl-6 text-brand-grayMed mb-6 space-y-2">
                <li>{t("s3.items.0")}</li>
                <li>{t("s3.items.1")}</li>
                <li>{t("s3.items.2")}</li>
                <li>{t("s3.items.3")}</li>
                <li>{t("s3.items.4")}</li>
              </ul>
              <p className="text-brand-grayMed mb-6">{t("s3.conclusion")}</p>

              <h2 className="text-2xl font-bold text-brand-dark mb-4">{t("s4.title")}</h2>
              <p className="text-brand-grayMed mb-6">{t("s4.text")}</p>

              <h2 className="text-2xl font-bold text-brand-dark mb-4">{t("s5.title")}</h2>
              <p className="text-brand-grayMed mb-6">{t("s5.text")}</p>

              <h2 className="text-2xl font-bold text-brand-dark mb-4">{t("s6.title")}</h2>
              <p className="text-brand-grayMed mb-6">{t("s6.text")}</p>

              <h2 className="text-2xl font-bold text-brand-dark mb-4">{t("s7.title")}</h2>
              <p className="text-brand-grayMed mb-6">{t("s7.text")}</p>

              <h2 className="text-2xl font-bold text-brand-dark mb-4">{t("s8.title")}</h2>
              <p className="text-brand-grayMed mb-6">{t("s8.text")}</p>

              <h2 className="text-2xl font-bold text-brand-dark mb-4">{t("s9.title")}</h2>
              <p className="text-brand-grayMed mb-6">{t("s9.text")}</p>

              <h2 className="text-2xl font-bold text-brand-dark mb-4">{t("s10.title")}</h2>
              <p className="text-brand-grayMed mb-6">{t("s10.text")}</p>

              <h2 className="text-2xl font-bold text-brand-dark mb-4">{t("s11.title")}</h2>
              <p className="text-brand-grayMed mb-6">{t("s11.text")}</p>

              <h2 className="text-2xl font-bold text-brand-dark mb-4">{t("s12.title")}</h2>
              <p className="text-brand-grayMed mb-6">{t("s12.text")}</p>

              <h2 className="text-2xl font-bold text-brand-dark mb-4">{t("s13.title")}</h2>
              <p className="text-brand-grayMed mb-6">{t("s13.text")}</p>

              <h2 className="text-2xl font-bold text-brand-dark mb-4">{t("s14.title")}</h2>
              <p className="text-brand-grayMed mb-6">{t("s14.text")}</p>

              <h2 className="text-2xl font-bold text-brand-dark mb-4">{t("s15.title")}</h2>
              <p className="text-brand-grayMed mb-6">{t("s15.text")}</p>

              <h2 className="text-2xl font-bold text-brand-dark mb-4">{t("s16.title")}</h2>
              <p className="text-brand-grayMed mb-4">{t("s16.intro")}</p>
              <ul className="list-none text-brand-grayMed mb-6 space-y-2">
                <li><strong>{t("s16.emailLabel")}</strong> {t("s16.email")}</li>
                <li><strong>{t("s16.phoneLabel")}</strong> {t("s16.phone")}</li>
                <li><strong>{t("s16.addressLabel")}</strong> {t("s16.address")}</li>
              </ul>

              <p className="text-sm text-brand-grayMed mt-8 pt-6 border-t border-brand-grayLight">
                {t("lastUpdated")}
              </p>
            </CardContent>
          </Card>
        </div>
      </section>
    </>
  );
}
