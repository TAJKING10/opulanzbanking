"use client";

import * as React from "react";
import { SectionHeading } from "@/components/section-heading";

export default function LifeInsuranceSchedulePage({ params: { locale } }: { params: { locale: string } }) {
  React.useEffect(() => {
    const script = document.createElement("script");
    script.src = "https://assets.calendly.com/assets/external/widget.js";
    script.async = true;
    document.body.appendChild(script);
  }, []);

  return (
    <>
      <section className="hero-gradient py-16 md:py-20">
        <div className="container mx-auto max-w-4xl px-6">
          <div className="text-center">
            <h1 className="mb-4 text-3xl font-bold text-white md:text-4xl lg:text-5xl">
              Schedule Your Life Insurance Consultation
            </h1>
            <p className="text-lg text-white/90">
              Book a consultation with our expert advisors to discuss your life insurance needs
            </p>
          </div>
        </div>
      </section>

      <section className="bg-white py-12 md:py-16">
        <div className="container mx-auto max-w-5xl px-6">
          <SectionHeading
            overline="Book a Consultation"
            title="Choose Your Preferred Time"
            description="Meet with our expert advisors to discuss your life insurance needs and explore the best coverage options for your family."
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
