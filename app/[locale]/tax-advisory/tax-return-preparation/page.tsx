"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { FileCheck, CheckCircle, Clock, Euro } from "lucide-react";
import { Hero } from "@/components/hero";
import { SectionHeading } from "@/components/section-heading";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default function TaxReturnPreparationPage({ params: { locale } }: { params: { locale: string } }) {
  const router = useRouter();
  const [showCalendly, setShowCalendly] = React.useState(false);
  const [showPayment, setShowPayment] = React.useState(false);

  React.useEffect(() => {
    if (showCalendly) {
      const script = document.createElement("script");
      script.src = "https://assets.calendly.com/assets/external/widget.js";
      script.async = true;
      document.body.appendChild(script);

      // Listen for Calendly events
      const handleCalendlyEvent = (e: MessageEvent) => {
        if (e.data.event === "calendly.event_scheduled") {
          // Move to payment page after booking
          setShowCalendly(false);
          setShowPayment(true);
        }
      };

      window.addEventListener("message", handleCalendlyEvent);

      return () => {
        window.removeEventListener("message", handleCalendlyEvent);
      };
    }
  }, [showCalendly]);

  const features = [
    "Professional preparation of corporate and individual tax returns",
    "Filing across multiple jurisdictions",
    "Accuracy and compliance guaranteed",
    "Expert review of all documentation",
    "Timely submission to tax authorities",
    "Support for tax queries and correspondence",
  ];

  const benefits = [
    "Save time and reduce stress",
    "Ensure compliance with tax regulations",
    "Maximize eligible deductions and credits",
    "Professional expertise at affordable rates",
  ];

  if (showPayment) {
    const totalPrice = 299;
    const servicePrice = totalPrice / 1.17; // Price without VAT
    const vat = totalPrice - servicePrice; // VAT amount

    return (
      <>
        <section className="hero-gradient py-16 md:py-20">
          <div className="container mx-auto max-w-4xl px-6">
            <div className="text-center">
              <div className="mb-6 inline-flex h-16 w-16 items-center justify-center rounded-full bg-green-500">
                <CheckCircle className="h-10 w-10 text-white" />
              </div>
              <h1 className="mb-4 text-3xl font-bold text-white md:text-4xl lg:text-5xl">
                Consultation Scheduled!
              </h1>
              <p className="text-lg text-white/90">
                Now complete your payment to confirm your booking
              </p>
            </div>
          </div>
        </section>

        <section className="bg-white py-12 md:py-16">
          <div className="container mx-auto max-w-3xl px-6">
            <SectionHeading
              overline="FINAL STEP"
              title="Complete Your Payment"
              align="center"
              className="mb-12"
            />

            <Card className="border-2 border-brand-grayLight mb-8">
              <CardContent className="p-8">
                <div className="flex items-start gap-4 mb-6">
                  <div className="inline-flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-lg bg-brand-gold/10">
                    <FileCheck className="h-6 w-6 text-brand-gold" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-xl font-bold text-brand-dark mb-2">Tax Return Preparation</h3>
                    <p className="text-sm text-brand-grayMed mb-2">Professional preparation and filing of corporate and individual tax returns</p>
                    <p className="text-sm text-brand-grayMed">Duration: 60 minutes</p>
                  </div>
                </div>

                <div className="border-t border-brand-grayLight pt-6">
                  <div className="flex justify-between items-center text-lg mb-3">
                    <span className="text-brand-grayMed">Service Fee (excl. VAT):</span>
                    <span className="font-semibold text-brand-dark">€{servicePrice.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between items-center text-lg mb-3">
                    <span className="text-brand-grayMed">VAT (17%):</span>
                    <span className="font-semibold text-brand-dark">€{vat.toFixed(2)}</span>
                  </div>
                  <div className="border-t border-brand-grayLight pt-4 mt-4">
                    <div className="flex justify-between items-center">
                      <span className="text-xl font-bold text-brand-dark">Total (incl. VAT):</span>
                      <span className="text-3xl font-bold text-brand-gold">€{totalPrice.toFixed(2)}</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-2 border-brand-grayLight mb-8">
              <CardContent className="p-8">
                <h3 className="text-xl font-bold text-brand-dark mb-4">Payment Method</h3>
                <p className="text-brand-grayMed mb-6">
                  Select your preferred payment method to complete your booking.
                </p>

                <div className="space-y-4">
                  <Button className="w-full bg-brand-gold text-white hover:bg-brand-goldDark h-14 text-lg">
                    Pay with Credit/Debit Card
                  </Button>
                  <Button
                    variant="outline"
                    className="w-full border-2 border-brand-gold text-brand-gold hover:bg-brand-goldLight/10 h-14 text-lg"
                  >
                    Pay with Bank Transfer
                  </Button>
                  <Button
                    variant="outline"
                    className="w-full border-2 border-brand-grayMed text-brand-grayMed hover:bg-gray-50 h-14 text-lg"
                  >
                    Pay with PayPal
                  </Button>
                </div>

                <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
                  <p className="text-sm text-blue-900">
                    <strong>Note:</strong> Your consultation slot is reserved for 15 minutes. Please complete
                    the payment to confirm your booking.
                  </p>
                </div>
              </CardContent>
            </Card>

            <div className="flex gap-4">
              <Button
                variant="outline"
                onClick={() => { setShowPayment(false); setShowCalendly(false); }}
                className="flex-1"
              >
                Cancel
              </Button>
              <Button
                asChild
                variant="outline"
                className="flex-1"
              >
                <Link href={`/${locale}/tax-advisory`}>Back to Tax Advisory</Link>
              </Button>
            </div>
          </div>
        </section>
      </>
    );
  }

  if (showCalendly) {
    return (
      <>
        <section className="hero-gradient py-16 md:py-20">
          <div className="container mx-auto max-w-4xl px-6">
            <div className="text-center">
              <h1 className="mb-4 text-3xl font-bold text-white md:text-4xl lg:text-5xl">
                Book Your Tax Return Preparation
              </h1>
              <p className="text-lg text-white/90">
                Schedule your 60-minute consultation - €299
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
                <h3 className="mb-2 text-lg font-bold text-brand-dark">€299 Fee</h3>
                <p className="text-sm text-brand-grayMed">
                  Fixed price for tax return preparation service
                </p>
              </div>

              <div className="text-center">
                <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-full bg-brand-goldLight">
                  <FileCheck className="h-6 w-6 text-brand-goldDark" />
                </div>
                <h3 className="mb-2 text-lg font-bold text-brand-dark">Expert Service</h3>
                <p className="text-sm text-brand-grayMed">
                  Professional tax return preparation and filing
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
        title="Tax Return Preparation"
        subtitle="Professional preparation and filing of corporate and individual tax returns"
      />

      {/* Booking Section - At Top */}
      <section className="relative bg-gradient-to-b from-brand-goldLight/10 to-white py-16 md:py-20 overflow-hidden">
        {/* Decorative background elements */}
        <div className="absolute top-0 right-1/4 w-96 h-96 bg-brand-gold/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-0 left-1/4 w-80 h-80 bg-brand-goldLight/20 rounded-full blur-3xl"></div>

        <div className="container mx-auto max-w-4xl px-6 relative z-10">
          <div className="text-center mb-8">
            <div className="relative">
              {/* 3D shadow effect */}
              <div className="absolute inset-0 bg-gradient-to-br from-brand-gold/30 to-transparent rounded-2xl blur-2xl transform translate-x-6 translate-y-6"></div>
              <div className="relative mb-6 rounded-2xl bg-white p-8 shadow-2xl border-2 border-brand-gold/20 backdrop-blur-sm hover:shadow-3xl transition-all duration-300 hover:-translate-y-1">
                <div className="flex items-center justify-center gap-3 mb-4">
                  <div className="relative">
                    <div className="absolute inset-0 bg-brand-gold rounded-full blur-xl opacity-40"></div>
                    <h3 className="relative text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-brand-gold to-brand-goldDark">€299</h3>
                  </div>
                </div>
                <p className="text-lg text-brand-grayMed mb-6">Fixed fee for tax return preparation service</p>
                <p className="text-sm text-brand-grayMed mb-6">60-minute consultation with expert tax advisor</p>
                <Button
                  onClick={() => setShowCalendly(true)}
                  size="lg"
                  className="relative bg-gradient-to-r from-brand-gold to-brand-goldDark text-white hover:from-brand-goldDark hover:to-brand-gold w-full sm:w-auto min-w-64 h-14 text-lg shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-300"
                >
                  <span className="relative z-10">Book Your Consultation Now</span>
                  <div className="absolute inset-0 bg-gradient-to-t from-white/20 to-transparent rounded-2xl"></div>
                </Button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Overview Section */}
      <section className="relative bg-white py-20 md:py-28 overflow-hidden">
        {/* Decorative grid background */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#f0f0f0_1px,transparent_1px),linear-gradient(to_bottom,#f0f0f0_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_80%_50%_at_50%_50%,#000_70%,transparent_110%)] opacity-30"></div>

        <div className="container mx-auto max-w-7xl px-6 relative z-10">
          <div className="grid gap-12 lg:grid-cols-2 lg:gap-16">
            <div className="relative">
              {/* 3D-style card effect */}
              <div className="absolute inset-0 bg-gradient-to-br from-brand-gold/20 to-transparent rounded-2xl blur-xl transform translate-x-4 translate-y-4"></div>
              <div className="relative bg-white rounded-2xl shadow-2xl p-8 border border-brand-grayLight/50 backdrop-blur-sm hover:shadow-3xl transition-shadow duration-300">
                <SectionHeading
                  overline="SERVICE DETAILS"
                  title="Professional Tax Return Services"
                  align="left"
                  className="mb-8"
                />
                <p className="mb-6 text-lg text-brand-grayMed">
                  Let our experienced tax professionals handle the complexity of tax return preparation.
                  We ensure accuracy, compliance, and timely filing across multiple jurisdictions.
                </p>
                <p className="mb-8 text-brand-grayMed">
                  Whether you're an individual taxpayer or a business entity, our comprehensive service
                  covers all aspects of tax return preparation, from documentation review to final submission.
                </p>
              </div>
            </div>

            <div>
              <h3 className="mb-6 text-xl font-bold text-brand-dark">What's Included</h3>
              <div className="space-y-4">
                {features.map((feature, index) => (
                  <div
                    key={feature}
                    className="group flex items-start gap-3 p-4 rounded-xl bg-white/60 backdrop-blur-sm hover:bg-white hover:shadow-lg transition-all duration-300 hover:translate-x-1"
                    style={{ animationDelay: `${index * 50}ms` }}
                  >
                    <div className="relative">
                      <div className="absolute inset-0 bg-brand-gold rounded-full blur-md opacity-30 group-hover:opacity-50 transition-opacity"></div>
                      <CheckCircle className="relative mt-1 h-5 w-5 flex-shrink-0 text-brand-gold group-hover:scale-110 transition-transform" />
                    </div>
                    <p className="text-brand-dark">{feature}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="relative bg-gray-50 py-20 md:py-28 overflow-hidden">
        {/* Animated background orbs */}
        <div className="absolute top-1/4 right-1/4 w-64 h-64 bg-brand-goldLight/20 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-1/4 left-1/3 w-72 h-72 bg-brand-gold/10 rounded-full blur-3xl"></div>

        <div className="container mx-auto max-w-4xl px-6 relative z-10">
          <SectionHeading
            overline="WHY CHOOSE US"
            title="Benefits of Professional Tax Return Preparation"
            align="center"
            className="mb-12"
          />
          <div className="grid gap-6 md:grid-cols-2">
            {benefits.map((benefit, index) => (
              <div
                key={benefit}
                className="group relative"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                {/* 3D shadow effect */}
                <div className="absolute inset-0 bg-gradient-to-br from-brand-gold/10 to-transparent rounded-xl blur-lg opacity-0 group-hover:opacity-100 transition-opacity transform translate-y-1"></div>
                <Card className="relative border-none shadow-sm hover:shadow-xl transition-all duration-300 group-hover:-translate-y-1 bg-white/80 backdrop-blur-sm">
                  <CardContent className="flex items-start gap-4 p-6">
                    <div className="relative">
                      <div className="absolute inset-0 bg-brand-gold rounded-full blur-md opacity-40 group-hover:opacity-60 transition-opacity"></div>
                      <CheckCircle className="relative h-6 w-6 text-brand-gold flex-shrink-0 mt-1 group-hover:scale-110 transition-transform" />
                    </div>
                    <p className="text-lg text-brand-dark group-hover:text-brand-dark/90 transition-colors">{benefit}</p>
                  </CardContent>
                </Card>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="hero-gradient py-20 md:py-28">
        <div className="container mx-auto max-w-4xl px-6 text-center">
          <h2 className="mb-6 text-balance text-3xl font-bold text-white md:text-4xl lg:text-5xl">
            Ready to File Your Tax Return?
          </h2>
          <p className="mx-auto mb-10 max-w-2xl text-balance text-lg text-white/90">
            Book your consultation now and let our experts handle your tax return preparation professionally.
          </p>
          <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
            <Button
              onClick={() => setShowCalendly(true)}
              size="lg"
              className="bg-white text-brand-dark hover:bg-gray-50 min-w-48"
            >
              Book Consultation - €299
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
