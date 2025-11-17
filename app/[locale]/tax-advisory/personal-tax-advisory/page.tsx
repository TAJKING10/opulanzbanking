"use client";

import * as React from "react";
import Link from "next/link";
import { UserCheck, CheckCircle, Clock, Euro } from "lucide-react";
import { Hero } from "@/components/hero";
import { SectionHeading } from "@/components/section-heading";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default function PersonalTaxAdvisoryPage({ params: { locale } }: { params: { locale: string } }) {
  const [showCalendly, setShowCalendly] = React.useState(false);

  React.useEffect(() => {
    if (showCalendly) {
      const script = document.createElement("script");
      script.src = "https://assets.calendly.com/assets/external/widget.js";
      script.async = true;
      document.body.appendChild(script);
    }
  }, [showCalendly]);

  const features = [
    "Personalized tax advice for high-net-worth individuals",
    "Expatriate tax planning and compliance",
    "Personal income tax optimization",
    "Wealth and estate tax planning",
    "Tax-efficient investment strategies",
    "Relocation and residency tax advice",
  ];

  const benefits = [
    "Tailored tax solutions for your situation",
    "Maximize tax efficiency on personal income",
    "Expert guidance for expatriates",
    "Confidential and professional service",
  ];

  if (showCalendly) {
    return (
      <>
        <section className="bg-gradient-to-b from-brand-dark to-brand-grayDark py-16 md:py-20">
          <div className="container mx-auto max-w-4xl px-6">
            <div className="text-center">
              <h1 className="mb-4 text-3xl font-bold text-white md:text-4xl lg:text-5xl">
                Book Your Personal Tax Consultation
              </h1>
              <p className="text-lg text-white/90">
                Schedule your 60-minute consultation - €100
              </p>
            </div>
          </div>
        </section>

        <section className="bg-white py-12 md:py-16">
          <div className="container mx-auto max-w-5xl px-6">
            <div className="grid gap-8 md:grid-cols-3 mb-8">
              <div className="text-center">
                <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-full bg-brand-goldLight">
                  <Clock className="h-6 w-6 text-brand-goldDark" />
                </div>
                <h3 className="mb-2 text-lg font-bold text-brand-dark">60-Minute Consultation</h3>
                <p className="text-sm text-brand-grayMed">
                  Professional consultation session with our expert tax advisor
                </p>
              </div>

              <div className="text-center">
                <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-full bg-brand-goldLight">
                  <Euro className="h-6 w-6 text-brand-goldDark" />
                </div>
                <h3 className="mb-2 text-lg font-bold text-brand-dark">€100 Fee</h3>
                <p className="text-sm text-brand-grayMed">
                  Fixed price for personal tax advisory service
                </p>
              </div>

              <div className="text-center">
                <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-full bg-brand-goldLight">
                  <UserCheck className="h-6 w-6 text-brand-goldDark" />
                </div>
                <h3 className="mb-2 text-lg font-bold text-brand-dark">Expert Service</h3>
                <p className="text-sm text-brand-grayMed">
                  Personalized tax advice for individuals
                </p>
              </div>
            </div>

            <div
              className="calendly-inline-widget"
              data-url="https://calendly.com/opulanz-banking/tax-advisory?hide_event_type_details=1&primary_color=d8ba4a"
              style={{ minWidth: '320px', height: '700px' }}
            />
          </div>
        </section>
      </>
    );
  }

  return (
    <>
      <Hero
        title="Personal Tax Advisory"
        subtitle="Personalized tax advice for high-net-worth individuals and expatriates"
      />

      {/* Booking Section - At Top */}
      <section className="bg-gradient-to-b from-brand-goldLight/10 to-white py-16 md:py-20">
        <div className="container mx-auto max-w-4xl px-6">
          <div className="text-center mb-8">
            <div className="mb-6 rounded-lg bg-white p-8 shadow-lg border-2 border-brand-gold/20">
              <div className="flex items-center justify-center gap-3 mb-4">
                <h3 className="text-4xl font-bold text-brand-dark">€100</h3>
              </div>
              <p className="text-lg text-brand-grayMed mb-6">Fixed fee for personal tax advisory service</p>
              <p className="text-sm text-brand-grayMed mb-6">60-minute consultation with expert tax advisor</p>
              <Button
                onClick={() => setShowCalendly(true)}
                size="lg"
                className="bg-brand-gold text-white hover:bg-brand-goldDark w-full sm:w-auto min-w-64 h-14 text-lg"
              >
                Book Your Consultation Now
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Overview Section */}
      <section className="bg-white py-20 md:py-28">
        <div className="container mx-auto max-w-7xl px-6">
          <div className="grid gap-12 lg:grid-cols-2 lg:gap-16">
            <div>
              <SectionHeading
                overline="SERVICE DETAILS"
                title="Tailored Tax Solutions for Individuals"
                align="left"
                className="mb-8"
              />
              <p className="mb-6 text-lg text-brand-grayMed">
                Your personal tax situation is unique, and you deserve customized advice. Our expert tax
                advisors specialize in helping high-net-worth individuals and expatriates navigate complex
                personal tax matters.
              </p>
              <p className="mb-8 text-brand-grayMed">
                From optimizing your personal income tax to planning for wealth transfer and relocation,
                we provide comprehensive guidance tailored to your individual circumstances and goals.
              </p>
            </div>

            <div>
              <h3 className="mb-6 text-xl font-bold text-brand-dark">What's Included</h3>
              <div className="space-y-4">
                {features.map((feature) => (
                  <div key={feature} className="flex items-start gap-3">
                    <CheckCircle className="mt-1 h-5 w-5 flex-shrink-0 text-brand-gold" />
                    <p className="text-brand-dark">{feature}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="bg-gray-50 py-20 md:py-28">
        <div className="container mx-auto max-w-4xl px-6">
          <SectionHeading
            overline="WHY CHOOSE US"
            title="Benefits of Personal Tax Advisory"
            align="center"
            className="mb-12"
          />
          <div className="grid gap-6 md:grid-cols-2">
            {benefits.map((benefit) => (
              <Card key={benefit} className="border-none shadow-sm">
                <CardContent className="flex items-start gap-4 p-6">
                  <CheckCircle className="h-6 w-6 text-brand-gold flex-shrink-0 mt-1" />
                  <p className="text-lg text-brand-dark">{benefit}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="hero-gradient py-20 md:py-28">
        <div className="container mx-auto max-w-4xl px-6 text-center">
          <h2 className="mb-6 text-balance text-3xl font-bold text-white md:text-4xl lg:text-5xl">
            Get Personalized Tax Advice
          </h2>
          <p className="mx-auto mb-10 max-w-2xl text-balance text-lg text-white/90">
            Book your consultation now and receive expert guidance tailored to your personal tax situation.
          </p>
          <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
            <Button
              onClick={() => setShowCalendly(true)}
              size="lg"
              className="bg-white text-brand-dark hover:bg-gray-50 min-w-48"
            >
              Book Consultation - €100
            </Button>
            <Button
              asChild
              variant="outline"
              size="lg"
              className="border-2 border-white bg-transparent text-white hover:bg-white/10 min-w-48"
            >
              <Link href={`/${locale}/tax-advisory`}>Back to Tax Advisory</Link>
            </Button>
          </div>
        </div>
      </section>
    </>
  );
}
