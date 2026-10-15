"use client";

import * as React from "react";
import { useTranslations, useLocale } from "next-intl";
import { HelpCircle, Clock, ExternalLink } from "lucide-react";
import { PageGuidance } from "@/components/page-guidance";
import { Hero } from "@/components/hero";
import { SectionHeading } from "@/components/section-heading";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";


export default function SupportPage() {
  const t = useTranslations("supportPage");
  const locale = useLocale();


  return (
    <>
      <PageGuidance
        pageKey="support"
        locale={locale}
        title="Help Centre"
        description="Find answers to common questions and check service status."
        steps={[
          { content: "Welcome to the Opulanz Help Centre. Browse the FAQ for quick answers or check service status." },
          { title: "FAQ", content: "Click any question to expand the answer.", target: "#faq", position: "bottom" },
        ]}
        tip="Most questions are answered in the FAQ below."
      />
      <Hero
        title={t("hero.title")}
        subtitle={t("hero.subtitle")}
      />

      {/* FAQ — visible answers for users and FAQPage schema */}
      <section className="bg-brand-off py-12 md:py-16" id="faq">
        <div className="container mx-auto max-w-3xl px-6">
          <SectionHeading
            title={t("faq.title")}
            description={t("faq.description")}
            align="center"
            className="mb-10"
          />
          <div className="space-y-3">
            {(
              [
                "openAccount",
                "documents",
                "fees",
                "currencies",
                "contact",
              ] as const
            ).map((key) => (
              <details
                key={key}
                className="group rounded-xl border border-brand-grayLight bg-white px-5 py-4"
              >
                <summary className="cursor-pointer list-none text-left text-base font-semibold text-brand-dark marker:content-none">
                  {t(`faq.questions.${key}.question`)}
                </summary>
                <p className="mt-3 text-sm leading-relaxed text-brand-grayMed">
                  {t(`faq.questions.${key}.answer`)}
                </p>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* Additional Resources */}
      <section className="bg-white py-12">
        <div className="container mx-auto max-w-7xl px-6">
          <SectionHeading
            title={t("resources.title")}
            description={t("resources.description")}
            align="center"
            className="mb-12"
          />

          <div className="grid gap-8 md:grid-cols-2 max-w-4xl mx-auto">
            {/* Help Center → scroll to FAQ */}
            <Card className="card-hover border-none text-center">
              <CardContent className="p-8">
                <div className="mb-6 inline-flex h-16 w-16 items-center justify-center rounded-full bg-brand-goldLight">
                  <HelpCircle className="h-8 w-8 text-brand-goldDark" />
                </div>
                <h3 className="mb-3 text-xl font-bold text-brand-dark">{t("resources.helpCenter.title")}</h3>
                <p className="mb-6 text-sm text-brand-grayMed">
                  {t("resources.helpCenter.description")}
                </p>
                <Button variant="outline" asChild>
                  <a href="#faq">{t("resources.helpCenter.button")}</a>
                </Button>
              </CardContent>
            </Card>

            {/* Service Status — inline live status */}
            <Card className="card-hover border-none text-center">
              <CardContent className="p-8">
                <div className="mb-6 inline-flex h-16 w-16 items-center justify-center rounded-full bg-brand-goldLight">
                  <Clock className="h-8 w-8 text-brand-goldDark" />
                </div>
                <h3 className="mb-3 text-xl font-bold text-brand-dark">
                  {t("resources.status.title")}
                </h3>
                <p className="mb-4 text-sm text-brand-grayMed">
                  {t("resources.status.description")}
                </p>
                <div className="mb-4 rounded-lg bg-green-50 border border-green-200 px-4 py-3">
                  <div className="flex items-center justify-center gap-2">
                    <span className="inline-block h-2.5 w-2.5 rounded-full bg-green-500 animate-pulse" />
                    <span className="text-sm font-semibold text-green-700">
                      {locale === "fr" ? "Tous les systèmes opérationnels" : "All Systems Operational"}
                    </span>
                  </div>
                </div>
                <a href="mailto:support@opulanz.com">
                  <Button variant="outline" className="flex items-center gap-2">
                    {t("resources.status.button")} <ExternalLink className="h-4 w-4" />
                  </Button>
                </a>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

    </>
  );
}
