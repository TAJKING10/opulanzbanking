"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { FileCheck, Globe, Briefcase, Shield, UserCheck, CheckCircle } from "lucide-react";
import { SectionHeading } from "@/components/section-heading";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default function BookingPage({ params: { locale } }: { params: { locale: string } }) {
  const router = useRouter();
  const [selectedService, setSelectedService] = React.useState<string | null>(null);
  const [step, setStep] = React.useState<"calendly" | "service-selection" | "payment">("calendly");

  React.useEffect(() => {
    // Load Calendly script
    const script = document.createElement("script");
    script.src = "https://assets.calendly.com/assets/external/widget.js";
    script.async = true;
    document.body.appendChild(script);

    // Listen for Calendly events
    const handleCalendlyEvent = (e: MessageEvent) => {
      if (e.data.event === "calendly.event_scheduled") {
        // Move to service selection after booking
        setStep("service-selection");
      }
    };

    window.addEventListener("message", handleCalendlyEvent);

    return () => {
      window.removeEventListener("message", handleCalendlyEvent);
    };
  }, []);

  const services = [
    {
      id: "tax-return-preparation",
      icon: FileCheck,
      title: "Tax Return Preparation",
      description: "Professional preparation and filing of corporate and individual tax returns",
      price: 90,
    },
    {
      id: "international-tax",
      icon: Globe,
      title: "International Tax",
      description: "Expert guidance on cross-border tax matters and transfer pricing",
      price: 250,
    },
    {
      id: "corporate-tax",
      icon: Briefcase,
      title: "Corporate Tax",
      description: "Comprehensive corporate tax services including M&A and VAT consulting",
      price: 150,
    },
    {
      id: "tax-compliance",
      icon: Shield,
      title: "Tax Compliance",
      description: "Ongoing compliance with tax laws and regulations",
      price: 250,
    },
    {
      id: "personal-tax-advisory",
      icon: UserCheck,
      title: "Personal Tax Advisory",
      description: "Personalized tax advice for high-net-worth individuals and expatriates",
      price: 100,
    },
  ];

  const selectedServiceData = services.find((s) => s.id === selectedService);

  const handleServiceSelect = (serviceId: string) => {
    setSelectedService(serviceId);
    setStep("payment");
  };

  if (step === "calendly") {
    return (
      <>
        <section className="hero-gradient py-16 md:py-20">
          <div className="container mx-auto max-w-4xl px-6">
            <div className="text-center">
              <h1 className="mb-4 text-3xl font-bold text-white md:text-4xl lg:text-5xl">
                Schedule Your Tax Advisory Consultation
              </h1>
              <p className="text-lg text-white/90">
                Choose a convenient time for your 60-minute consultation
              </p>
            </div>
          </div>
        </section>

        <section className="bg-white py-12 md:py-16">
          <div className="container mx-auto max-w-5xl px-6">
            <div
              className="calendly-inline-widget"
              data-url="https://calendly.com/opulanz-banking/tax-advisory?hide_event_type_details=1&primary_color=d8ba4a"
              style={{ minWidth: "320px", height: "700px" }}
            />
          </div>
        </section>
      </>
    );
  }

  if (step === "service-selection") {
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
                Now, please select which service you need assistance with
              </p>
            </div>
          </div>
        </section>

        <section className="bg-white py-12 md:py-16">
          <div className="container mx-auto max-w-7xl px-6">
            <SectionHeading
              overline="STEP 2 OF 3"
              title="Select Your Tax Advisory Service"
              description="Choose the service that best matches your needs"
              align="center"
              className="mb-12"
            />

            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {services.map((service) => {
                const Icon = service.icon;
                return (
                  <Card
                    key={service.id}
                    className="border-2 border-brand-grayLight hover:border-brand-gold cursor-pointer transition-all"
                    onClick={() => handleServiceSelect(service.id)}
                  >
                    <CardHeader>
                      <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-lg bg-brand-gold/10">
                        <Icon className="h-6 w-6 text-brand-gold" />
                      </div>
                      <CardTitle className="text-xl">{service.title}</CardTitle>
                      <div className="mt-2">
                        <span className="text-2xl font-bold text-brand-gold">€{service.price}</span>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-brand-grayMed mb-4">{service.description}</p>
                      <Button className="w-full bg-brand-gold text-white hover:bg-brand-goldDark">
                        Select Service
                      </Button>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </div>
        </section>
      </>
    );
  }

  if (step === "payment" && selectedServiceData) {
    return (
      <>
        <section className="hero-gradient py-16 md:py-20">
          <div className="container mx-auto max-w-4xl px-6">
            <div className="text-center">
              <h1 className="mb-4 text-3xl font-bold text-white md:text-4xl lg:text-5xl">
                Complete Your Payment
              </h1>
              <p className="text-lg text-white/90">
                Final step to confirm your consultation
              </p>
            </div>
          </div>
        </section>

        <section className="bg-white py-12 md:py-16">
          <div className="container mx-auto max-w-3xl px-6">
            <SectionHeading
              overline="STEP 3 OF 3"
              title="Payment Details"
              align="center"
              className="mb-12"
            />

            <Card className="border-2 border-brand-grayLight mb-8">
              <CardHeader className="bg-brand-goldLight/10">
                <CardTitle className="text-2xl">Order Summary</CardTitle>
              </CardHeader>
              <CardContent className="pt-6">
                <div className="space-y-4">
                  <div className="flex items-start gap-4">
                    {(() => {
                      const Icon = selectedServiceData.icon;
                      return (
                        <div className="inline-flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-lg bg-brand-gold/10">
                          <Icon className="h-6 w-6 text-brand-gold" />
                        </div>
                      );
                    })()}
                    <div className="flex-1">
                      <h3 className="text-xl font-bold text-brand-dark">{selectedServiceData.title}</h3>
                      <p className="text-sm text-brand-grayMed mt-1">{selectedServiceData.description}</p>
                      <p className="text-sm text-brand-grayMed mt-2">Duration: 60 minutes</p>
                    </div>
                  </div>

                  <div className="border-t border-brand-grayLight pt-4 mt-4">
                    <div className="flex justify-between items-center text-lg mb-2">
                      <span className="text-brand-grayMed">Subtotal:</span>
                      <span className="font-semibold text-brand-dark">€{selectedServiceData.price}</span>
                    </div>
                    <div className="flex justify-between items-center text-lg mb-2">
                      <span className="text-brand-grayMed">VAT (17%):</span>
                      <span className="font-semibold text-brand-dark">
                        €{(selectedServiceData.price * 0.17).toFixed(2)}
                      </span>
                    </div>
                    <div className="border-t border-brand-grayLight pt-4 mt-4">
                      <div className="flex justify-between items-center">
                        <span className="text-xl font-bold text-brand-dark">Total:</span>
                        <span className="text-3xl font-bold text-brand-gold">
                          €{(selectedServiceData.price * 1.17).toFixed(2)}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-2 border-brand-grayLight mb-8">
              <CardHeader>
                <CardTitle>Payment Method</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-brand-grayMed mb-6">
                  To complete your booking, please proceed with the payment using one of the methods below.
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
                onClick={() => setStep("service-selection")}
                className="flex-1"
              >
                Back to Service Selection
              </Button>
              <Button
                variant="outline"
                onClick={() => router.push(`/${locale}/tax-advisory`)}
                className="flex-1"
              >
                Cancel Booking
              </Button>
            </div>
          </div>
        </section>
      </>
    );
  }

  return null;
}
