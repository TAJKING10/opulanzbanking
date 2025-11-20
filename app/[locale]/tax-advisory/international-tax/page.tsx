"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Globe, CheckCircle, Clock, Euro } from "lucide-react";
import { Hero } from "@/components/hero";
import { SectionHeading } from "@/components/section-heading";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default function InternationalTaxPage({ params: { locale } }: { params: { locale: string } }) {
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
    "Expert guidance on cross-border tax matters",
    "Transfer pricing analysis and documentation",
    "Double taxation treaty optimization",
    "International tax structuring advice",
    "Cross-border transaction planning",
    "Compliance with multiple jurisdictions",
  ];

  const benefits = [
    "Minimize international tax exposure",
    "Navigate complex cross-border regulations",
    "Optimize global tax structures",
    "Expert knowledge of EU and international tax law",
  ];

  if (showPayment) {
    const totalPrice = 250;
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
                    <Globe className="h-6 w-6 text-brand-gold" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-xl font-bold text-brand-dark mb-2">International Tax</h3>
                    <p className="text-sm text-brand-grayMed mb-2">Expert guidance on cross-border tax matters and transfer pricing</p>
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
                Book Your International Tax Consultation
              </h1>
              <p className="text-lg text-white/90">
                Schedule your 60-minute consultation - €250
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
                <h3 className="mb-2 text-lg font-bold text-brand-dark">€250 Fee</h3>
                <p className="text-sm text-brand-grayMed">
                  Fixed price for international tax advisory service
                </p>
              </div>

              <div className="text-center">
                <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-full bg-brand-goldLight">
                  <Globe className="h-6 w-6 text-brand-goldDark" />
                </div>
                <h3 className="mb-2 text-lg font-bold text-brand-dark">Expert Service</h3>
                <p className="text-sm text-brand-grayMed">
                  Cross-border tax expertise and structuring
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
        title="International Tax Advisory"
        subtitle="Expert guidance on cross-border tax matters and international tax optimization"
      />

      {/* Booking Section - At Top */}
      <section className="bg-gradient-to-b from-brand-goldLight/10 to-white py-16 md:py-20">
        <div className="container mx-auto max-w-4xl px-6">
          <div className="text-center mb-8">
            <div className="mb-6 rounded-lg bg-white p-8 shadow-lg border-2 border-brand-gold/20">
              <div className="flex items-center justify-center gap-3 mb-4">
                <h3 className="text-4xl font-bold text-brand-dark">€250</h3>
              </div>
              <p className="text-lg text-brand-grayMed mb-6">Fixed fee for international tax advisory service</p>
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
                title="Navigate International Tax Complexity"
                align="left"
                className="mb-8"
              />
              <p className="mb-6 text-lg text-brand-grayMed">
                International taxation requires specialized expertise in cross-border regulations, transfer
                pricing, and double taxation treaties. Our team provides comprehensive guidance for businesses
                and individuals operating across multiple jurisdictions.
              </p>
              <p className="mb-8 text-brand-grayMed">
                From structuring international operations to ensuring compliance with global tax requirements,
                we help you navigate the complexities of international tax law while optimizing your tax position.
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
            title="Benefits of Expert International Tax Advisory"
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
            Need International Tax Expertise?
          </h2>
          <p className="mx-auto mb-10 max-w-2xl text-balance text-lg text-white/90">
            Book your consultation now and get expert guidance on cross-border tax matters.
          </p>
          <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
            <Button
              onClick={() => setShowCalendly(true)}
              size="lg"
              className="bg-white text-brand-dark hover:bg-gray-50 min-w-48"
            >
              Book Consultation - €250
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
