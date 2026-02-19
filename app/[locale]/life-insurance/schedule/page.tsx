"use client";

import * as React from "react";
import { useTranslations } from "next-intl";
import { SectionHeading } from "@/components/section-heading";

export default function LifeInsuranceSchedulePage({ params: { locale } }: { params: { locale: string } }) {
  const t = useTranslations("lifeInsuranceBooking.schedule");

  React.useEffect(() => {
    const script = document.createElement("script");
    script.src = "https://assets.calendly.com/assets/external/widget.js";
    script.async = true;
    document.body.appendChild(script);
  }, []);

  return (
    <>
      <section className="hero-gradient py-12 md:py-16">
        <div className="container mx-auto max-w-4xl px-6">
          <div className="text-center">
            <h1 className="mb-4 text-3xl font-bold text-white md:text-4xl lg:text-5xl">
              {t("heroTitle")}
            </h1>
            <p className="text-lg text-white/90">
              {t("heroSubtitle")}
            </p>
          </div>
        </div>
      </section>

      <section className="bg-white py-12 md:py-16">
        <div className="container mx-auto max-w-5xl px-6">
          <SectionHeading
            overline={t("overline")}
            title={t("title")}
            description={t("description")}
            align="center"
            className="mb-12"
          />
          <div
            className="calendly-inline-widget"
            data-url="https://calendly.com/opulanz-banking/investment-advisory-clone?hide_event_type_details=1&primary_color=bfa72a"
            style={{ minWidth: '320px', height: '700px' }}
          />
        </div>
      </section>
    </>
  );
}
