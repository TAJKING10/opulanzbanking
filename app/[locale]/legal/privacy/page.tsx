"use client";

import * as React from "react";
import { useTranslations, useLocale } from "next-intl";
import { Hero } from "@/components/hero";
import { Card, CardContent } from "@/components/ui/card";

export default function PrivacyPage() {
  const t = useTranslations("legal.privacy");
  const locale = useLocale();

  return (
    <>
      <Hero
        title={t("heroTitle")}
        subtitle={t("heroSubtitle")}
      />

      <section className="bg-white py-12">
        <div className="container mx-auto max-w-4xl px-6">
          <Card className="border-none shadow-sm">
            <CardContent className="prose prose-lg max-w-none p-8">
              <h2 className="text-2xl font-bold text-brand-dark mb-4">{t("gdpr.title")}</h2>
              <p className="text-brand-grayMed mb-6">{t("gdpr.text1")}</p>
              <p className="text-brand-grayMed mb-6">{t("gdpr.text2")}</p>
              <p className="text-brand-grayMed mb-6">
                {t("gdpr.contactText")} <strong>contact@advensys-in-finance.com</strong>
              </p>

              <h2 className="text-2xl font-bold text-brand-dark mb-4">{t("dataController.title")}</h2>
              <p className="text-brand-grayMed mb-6">{t("dataController.text1")}</p>
              <p className="text-brand-grayMed mb-6">{t("dataController.text2")}</p>

              <h2 className="text-2xl font-bold text-brand-dark mb-4">{t("dataCollection.title")}</h2>
              <p className="text-brand-grayMed mb-6">{t("dataCollection.text1")}</p>
              <p className="text-brand-grayMed mb-6">{t("dataCollection.text2")}</p>

              <h2 className="text-2xl font-bold text-brand-dark mb-4">{t("typesOfData.title")}</h2>
              <p className="text-brand-grayMed mb-4">{t("typesOfData.intro")}</p>
              <ul className="list-disc pl-6 text-brand-grayMed mb-6 space-y-2">
                <li>{t("typesOfData.items.surname")}</li>
                <li>{t("typesOfData.items.firstName")}</li>
                <li>{t("typesOfData.items.address")}</li>
                <li>{t("typesOfData.items.email")}</li>
                <li>{t("typesOfData.items.ip")}</li>
              </ul>

              <p className="text-brand-grayMed mb-4">{t("typesOfData.purposeIntro")}</p>
              <ul className="list-disc pl-6 text-brand-grayMed mb-6 space-y-2">
                <li>{t("typesOfData.purposes.navigation")}</li>
                <li>{t("typesOfData.purposes.statistics")}</li>
              </ul>

              <h2 className="text-2xl font-bold text-brand-dark mb-4">{t("legitimateInterest.title")}</h2>
              <p className="text-brand-grayMed mb-4">{t("legitimateInterest.intro")}</p>
              <ul className="list-disc pl-6 text-brand-grayMed mb-6 space-y-2">
                <li>{t("legitimateInterest.items.news")}</li>
                <li>{t("legitimateInterest.items.wealthManagement")}</li>
              </ul>

              <h2 className="text-2xl font-bold text-brand-dark mb-4">{t("processingLocation.title")}</h2>
              <p className="text-brand-grayMed mb-6">{t("processingLocation.text")}</p>

              <h2 className="text-2xl font-bold text-brand-dark mb-4">{t("dataRetention.title")}</h2>
              <p className="text-brand-grayMed mb-4">{t("dataRetention.intro")}</p>
              <ul className="list-disc pl-6 text-brand-grayMed mb-6 space-y-2">
                <li><strong>{t("dataRetention.navigation.label")}</strong> {t("dataRetention.navigation.duration")}</li>
                <li><strong>{t("dataRetention.membership.label")}</strong> {t("dataRetention.membership.duration")}</li>
              </ul>

              <h2 className="text-2xl font-bold text-brand-dark mb-4">{t("yourRights.title")}</h2>
              <p className="text-brand-grayMed mb-4">{t("yourRights.intro")}</p>
              <ul className="list-disc pl-6 text-brand-grayMed mb-6 space-y-2">
                <li><strong>{t("yourRights.access.label")}</strong> {t("yourRights.access.text")}</li>
                <li><strong>{t("yourRights.rectification.label")}</strong> {t("yourRights.rectification.text")}</li>
                <li><strong>{t("yourRights.erasure.label")}</strong> {t("yourRights.erasure.text")}</li>
                <li><strong>{t("yourRights.portability.label")}</strong> {t("yourRights.portability.text")}</li>
                <li><strong>{t("yourRights.object.label")}</strong> {t("yourRights.object.text")}</li>
                <li><strong>{t("yourRights.restriction.label")}</strong> {t("yourRights.restriction.text")}</li>
              </ul>

              <h2 className="text-2xl font-bold text-brand-dark mb-4">{t("contactDPO.title")}</h2>
              <p className="text-brand-grayMed mb-4">{t("contactDPO.intro")}</p>
              <div className="text-brand-grayMed mb-6 space-y-2">
                <p><strong>{t("contactDPO.emailLabel")}</strong> contact@advensys-in-finance.com</p>
                <p><strong>{t("contactDPO.addressLabel")}</strong> 66 avenue des Champs Elysées, 75008 Paris</p>
                <p><strong>{t("contactDPO.phoneLabel")}</strong> +33 6 98 21 44 46</p>
              </div>

              <h2 className="text-2xl font-bold text-brand-dark mb-4">{t("cookies.title")}</h2>
              <p className="text-brand-grayMed mb-6">{t("cookies.text")}</p>

              <h2 className="text-2xl font-bold text-brand-dark mb-4">{t("dataSecurity.title")}</h2>
              <p className="text-brand-grayMed mb-6">{t("dataSecurity.text")}</p>

              <h2 className="text-2xl font-bold text-brand-dark mb-4">{t("updates.title")}</h2>
              <p className="text-brand-grayMed mb-6">{t("updates.text")}</p>

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
