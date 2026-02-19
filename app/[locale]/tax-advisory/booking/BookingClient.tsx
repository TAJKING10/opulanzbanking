"use client";

import * as React from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useTranslations } from "next-intl";

export const dynamic = 'force-dynamic';
import { FileCheck, Globe, Briefcase, Shield, UserCheck, CheckCircle, ArrowRight, ArrowLeft, User, Mail, Phone } from "lucide-react";
import { SectionHeading } from "@/components/section-heading";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Script from "next/script";

interface BookingData {
  // Customer info
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  // Calendly info
  calendlyEventUrl?: string;
  calendlyInviteeUrl?: string;
  appointmentDate?: string;
  appointmentTime?: string;
  // Service info
  serviceId?: string;
  serviceTitle?: string;
  servicePrice?: number;
  // Payment info
  paypalOrderId?: string;
  paymentStatus?: string;
}

export default function BookingClient({ params: { locale } }: { params: { locale: string } }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const t = useTranslations("taxAdvisory.booking");
  const [step, setStep] = React.useState<"info" | "calendly" | "service-selection" | "summary" | "payment">("info");
  const [bookingData, setBookingData] = React.useState<BookingData>({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
  });
  const [errors, setErrors] = React.useState<Partial<BookingData>>({});
  const [isPayPalLoaded, setIsPayPalLoaded] = React.useState(false);

  const services = [
    {
      id: "tax-return-preparation",
      icon: FileCheck,
      title: t("services.taxReturnPreparation.title"),
      description: t("services.taxReturnPreparation.description"),
      price: 299,
    },
    {
      id: "international-tax",
      icon: Globe,
      title: t("services.internationalTax.title"),
      description: t("services.internationalTax.description"),
      price: 250,
    },
    {
      id: "corporate-tax",
      icon: Briefcase,
      title: t("services.corporateTax.title"),
      description: t("services.corporateTax.description"),
      price: 150,
    },
    {
      id: "tax-compliance",
      icon: Shield,
      title: t("services.taxCompliance.title"),
      description: t("services.taxCompliance.description"),
      price: 250,
    },
    {
      id: "personal-tax-advisory",
      icon: UserCheck,
      title: t("services.personalTaxAdvisory.title"),
      description: t("services.personalTaxAdvisory.description"),
      price: 100,
    },
  ];

  // Check for pre-selected service from URL
  React.useEffect(() => {
    const preSelectedServiceId = searchParams.get('service');
    if (preSelectedServiceId) {
      const service = services.find(s => s.id === preSelectedServiceId);
      if (service) {
        setBookingData(prev => ({
          ...prev,
          serviceId: service.id,
          serviceTitle: service.title,
          servicePrice: service.price,
        }));
      }
    }
  }, [searchParams]);

  // Load Calendly script
  React.useEffect(() => {
    if (step === "calendly") {
      const script = document.createElement("script");
      script.src = "https://assets.calendly.com/assets/external/widget.js";
      script.async = true;
      document.body.appendChild(script);

      // Listen for Calendly events
      const handleCalendlyEvent = (e: MessageEvent) => {
        if (e.data.event === "calendly.event_scheduled") {
          // Extract event details
          const eventData = e.data.payload;
          setBookingData(prev => {
            const updated = {
              ...prev,
              calendlyEventUrl: eventData.event?.uri || "",
              calendlyInviteeUrl: eventData.invitee?.uri || "",
              appointmentDate: eventData.event?.start_time ? new Date(eventData.event.start_time).toISOString() : "",
              appointmentTime: eventData.event?.start_time ? new Date(eventData.event.start_time).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }) : "",
            };

            // If service is already selected, go directly to summary
            // Otherwise, go to service selection
            if (updated.serviceId) {
              setTimeout(() => setStep("summary"), 100);
            } else {
              setTimeout(() => setStep("service-selection"), 100);
            }

            return updated;
          });
        }
      };

      window.addEventListener("message", handleCalendlyEvent);

      return () => {
        window.removeEventListener("message", handleCalendlyEvent);
      };
    }
  }, [step]);

  const validateCustomerInfo = () => {
    const newErrors: Partial<BookingData> = {};

    if (!bookingData.firstName.trim()) {
      newErrors.firstName = t("validation.firstNameRequired");
    }

    if (!bookingData.lastName.trim()) {
      newErrors.lastName = t("validation.lastNameRequired");
    }

    if (!bookingData.email.trim()) {
      newErrors.email = t("validation.emailRequired");
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(bookingData.email)) {
      newErrors.email = t("validation.emailInvalid");
    }

    if (!bookingData.phone.trim()) {
      newErrors.phone = t("validation.phoneRequired");
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleCustomerInfoSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validateCustomerInfo()) {
      setStep("calendly");
    }
  };

  const handleServiceSelect = (serviceId: string) => {
    const service = services.find(s => s.id === serviceId);
    if (service) {
      setBookingData(prev => ({
        ...prev,
        serviceId: service.id,
        serviceTitle: service.title,
        servicePrice: service.price,
      }));
      setStep("summary");
    }
  };

  const handleProceedToPayment = () => {
    setStep("payment");
  };

  const handleBackToServiceSelection = () => {
    setStep("service-selection");
  };

  const handleBackToInfo = () => {
    setStep("info");
  };

  const handlePaymentSuccess = async (details: any) => {
    try {
      // Prepare complete booking data
      const completeBookingData = {
        type: 'tax_advisory',
        status: 'confirmed',
        customer_info: {
          firstName: bookingData.firstName,
          lastName: bookingData.lastName,
          email: bookingData.email,
          phone: bookingData.phone,
        },
        service: {
          id: bookingData.serviceId,
          title: bookingData.serviceTitle,
          price: bookingData.servicePrice,
        },
        appointment: {
          date: bookingData.appointmentDate,
          time: bookingData.appointmentTime,
          calendlyEventUrl: bookingData.calendlyEventUrl,
          calendlyInviteeUrl: bookingData.calendlyInviteeUrl,
        },
        payment: {
          method: 'paypal',
          orderId: details.id,
          status: details.status,
          payer: details.payer,
          amount: bookingData.servicePrice,
          currency: 'EUR',
          paymentDate: new Date().toISOString(),
        },
        created_at: new Date().toISOString(),
      };

      // Save booking to database
      const response = await fetch('http://localhost:5000/api/tax-advisory-bookings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(completeBookingData),
      });

      if (!response.ok) {
        throw new Error('Failed to save booking');
      }

      const savedBooking = await response.json();
      const confirmationNumber = savedBooking.data?.confirmation_number || `TAX-${Date.now().toString(36).toUpperCase()}`;

      // Store complete data in sessionStorage for confirmation page
      const confirmationData = {
        confirmationNumber,
        firstName: bookingData.firstName,
        lastName: bookingData.lastName,
        email: bookingData.email,
        phone: bookingData.phone,
        appointmentDate: bookingData.appointmentDate,
        appointmentTime: bookingData.appointmentTime,
        serviceId: bookingData.serviceId,
        serviceTitle: bookingData.serviceTitle,
        servicePrice: bookingData.servicePrice,
        paypalOrderId: details.id,
        paypalStatus: details.status,
        paypalPayer: details.payer,
        paymentDate: new Date().toISOString(),
      };

      sessionStorage.setItem('tax-advisory-booking', JSON.stringify(confirmationData));

      // Redirect to confirmation page
      router.push(`/${locale}/tax-advisory/confirmation?confirmation=${confirmationNumber}`);
    } catch (error) {
      console.error('Error saving booking:', error);
      alert(t("payment.paymentSuccessError"));
    }
  };

  // STEP 1: Customer Information
  if (step === "info") {
    return (
      <>
        <section className="hero-gradient py-16 md:py-20">
          <div className="container mx-auto max-w-4xl px-6">
            <div className="text-center">
              <h1 className="mb-4 text-3xl font-bold text-white md:text-4xl lg:text-5xl">
                {t("step1.heroTitle")}
              </h1>
              <p className="text-lg text-white/90">
                {t("step1.heroSubtitle")}
              </p>
            </div>
          </div>
        </section>

        <section className="bg-white py-12 md:py-16">
          <div className="container mx-auto max-w-2xl px-6">
            <SectionHeading
              overline={t("step1.overline")}
              title={t("step1.title")}
              description={t("step1.description")}
              align="center"
              className="mb-12"
            />

            <Card className="border-2 border-brand-grayLight">
              <CardContent className="pt-8">
                <form onSubmit={handleCustomerInfoSubmit} className="space-y-6">
                  <div className="grid gap-6 md:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="firstName">{t("step1.firstName")} {t("step1.required")}</Label>
                      <div className="relative">
                        <User className="absolute left-3 top-3 h-5 w-5 text-brand-grayMed" />
                        <Input
                          id="firstName"
                          type="text"
                          placeholder={t("step1.firstNamePlaceholder")}
                          className="pl-10"
                          value={bookingData.firstName}
                          onChange={(e) => setBookingData(prev => ({ ...prev, firstName: e.target.value }))}
                        />
                      </div>
                      {errors.firstName && (
                        <p className="text-sm text-red-600">{errors.firstName}</p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="lastName">{t("step1.lastName")} {t("step1.required")}</Label>
                      <div className="relative">
                        <User className="absolute left-3 top-3 h-5 w-5 text-brand-grayMed" />
                        <Input
                          id="lastName"
                          type="text"
                          placeholder={t("step1.lastNamePlaceholder")}
                          className="pl-10"
                          value={bookingData.lastName}
                          onChange={(e) => setBookingData(prev => ({ ...prev, lastName: e.target.value }))}
                        />
                      </div>
                      {errors.lastName && (
                        <p className="text-sm text-red-600">{errors.lastName}</p>
                      )}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="email">{t("step1.email")} {t("step1.required")}</Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-3 h-5 w-5 text-brand-grayMed" />
                      <Input
                        id="email"
                        type="email"
                        placeholder={t("step1.emailPlaceholder")}
                        className="pl-10"
                        value={bookingData.email}
                        onChange={(e) => setBookingData(prev => ({ ...prev, email: e.target.value }))}
                      />
                    </div>
                    {errors.email && (
                      <p className="text-sm text-red-600">{errors.email}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="phone">{t("step1.phone")} {t("step1.required")}</Label>
                    <div className="relative">
                      <Phone className="absolute left-3 top-3 h-5 w-5 text-brand-grayMed" />
                      <Input
                        id="phone"
                        type="tel"
                        placeholder={t("step1.phonePlaceholder")}
                        className="pl-10"
                        value={bookingData.phone}
                        onChange={(e) => setBookingData(prev => ({ ...prev, phone: e.target.value }))}
                      />
                    </div>
                    {errors.phone && (
                      <p className="text-sm text-red-600">{errors.phone}</p>
                    )}
                  </div>

                  <div className="pt-4">
                    <Button type="submit" className="w-full bg-brand-gold text-white hover:bg-brand-goldDark h-12 text-lg">
                      {t("step1.continue")}
                      <ArrowRight className="ml-2 h-5 w-5" />
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>

            <div className="mt-8 text-center">
              <Button
                variant="link"
                onClick={() => router.push(`/${locale}/tax-advisory`)}
                className="text-brand-grayMed hover:text-brand-gold"
              >
                <ArrowLeft className="mr-2 h-4 w-4" />
                {t("step1.backToTaxAdvisory")}
              </Button>
            </div>
          </div>
        </section>
      </>
    );
  }

  // STEP 2: Calendly Scheduling
  if (step === "calendly") {
    return (
      <>
        <section className="hero-gradient py-16 md:py-20">
          <div className="container mx-auto max-w-4xl px-6">
            <div className="text-center">
              <h1 className="mb-4 text-3xl font-bold text-white md:text-4xl lg:text-5xl">
                {t("step2.heroTitle")}
              </h1>
              <p className="text-lg text-white/90">
                {t("step2.heroSubtitle")}
              </p>
            </div>
          </div>
        </section>

        <section className="bg-white py-12 md:py-16">
          <div className="container mx-auto max-w-5xl px-6">
            <SectionHeading
              overline={t("step2.overline")}
              title={t("step2.title")}
              description={`${bookingData.firstName} ${bookingData.lastName} (${bookingData.email})`}
              align="center"
              className="mb-8"
            />

            {bookingData.serviceTitle && (
              <div className="mb-8 p-4 bg-brand-goldLight/20 rounded-lg border-2 border-brand-gold">
                <div className="flex items-center justify-center gap-3">
                  <CheckCircle className="h-5 w-5 text-brand-gold" />
                  <p className="text-brand-dark font-semibold">
                    {bookingData.serviceTitle} (€{bookingData.servicePrice})
                  </p>
                </div>
              </div>
            )}

            <div
              className="calendly-inline-widget"
              data-url={`https://calendly.com/opulanz-banking/tax-advisory?hide_event_type_details=1&primary_color=b59354&locale=${locale}&name=${encodeURIComponent(bookingData.firstName + ' ' + bookingData.lastName)}&email=${encodeURIComponent(bookingData.email)}`}
              style={{ minWidth: "320px", height: "700px" }}
            />

            <div className="mt-8 text-center">
              <Button
                variant="outline"
                onClick={handleBackToInfo}
                className="border-brand-grayMed text-brand-grayMed hover:bg-gray-50"
              >
                <ArrowLeft className="mr-2 h-4 w-4" />
                {t("step2.backToContactInfo")}
              </Button>
            </div>
          </div>
        </section>
      </>
    );
  }

  // STEP 3: Service Selection
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
                {t("step3.heroTitle")}
              </h1>
              <p className="text-lg text-white/90">
                {t("step3.heroSubtitle")}
              </p>
            </div>
          </div>
        </section>

        <section className="bg-white py-12 md:py-16">
          <div className="container mx-auto max-w-7xl px-6">
            <SectionHeading
              overline={t("step3.overline")}
              title={t("step3.title")}
              description={t("step3.description")}
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
                        {t("step3.selectService")}
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

  // STEP 4: Summary
  if (step === "summary") {
    const selectedService = services.find(s => s.id === bookingData.serviceId);

    return (
      <>
        <section className="hero-gradient py-16 md:py-20">
          <div className="container mx-auto max-w-4xl px-6">
            <div className="text-center">
              <h1 className="mb-4 text-3xl font-bold text-white md:text-4xl lg:text-5xl">
                {t("step4.heroTitle")}
              </h1>
              <p className="text-lg text-white/90">
                {t("step4.heroSubtitle")}
              </p>
            </div>
          </div>
        </section>

        <section className="bg-white py-12 md:py-16">
          <div className="container mx-auto max-w-3xl px-6">
            <SectionHeading
              overline={t("step4.overline")}
              title={t("step4.title")}
              align="center"
              className="mb-12"
            />

            {/* Contact Information */}
            <Card className="border-2 border-brand-grayLight mb-6">
              <CardHeader className="bg-brand-goldLight/10">
                <CardTitle className="text-xl">{t("step4.contactInfo")}</CardTitle>
              </CardHeader>
              <CardContent className="pt-6">
                <div className="grid gap-4 md:grid-cols-2">
                  <div>
                    <p className="text-sm text-brand-grayMed mb-1">{t("step4.name")}</p>
                    <p className="font-semibold text-brand-dark">{bookingData.firstName} {bookingData.lastName}</p>
                  </div>
                  <div>
                    <p className="text-sm text-brand-grayMed mb-1">{t("step4.email")}</p>
                    <p className="font-semibold text-brand-dark break-all">{bookingData.email}</p>
                  </div>
                  <div>
                    <p className="text-sm text-brand-grayMed mb-1">{t("step4.phone")}</p>
                    <p className="font-semibold text-brand-dark">{bookingData.phone}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Appointment Details */}
            <Card className="border-2 border-brand-grayLight mb-6">
              <CardHeader className="bg-brand-goldLight/10">
                <CardTitle className="text-xl">{t("step4.appointmentDetails")}</CardTitle>
              </CardHeader>
              <CardContent className="pt-6">
                <div className="space-y-3">
                  <div>
                    <p className="text-sm text-brand-grayMed mb-1">{t("step4.appointmentConfirmation")}</p>
                    <p className="font-semibold text-brand-dark">
                      {t("step4.scheduledViaCalendly")}
                    </p>
                    <p className="text-sm text-brand-grayMed mt-1">
                      {t("step4.calendlyEmailNotice")}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-brand-grayMed mb-1">{t("step4.duration")}</p>
                    <p className="font-semibold text-brand-dark">60 {t("step4.minutes")}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Service & Payment */}
            <Card className="border-2 border-brand-grayLight mb-8">
              <CardHeader className="bg-brand-goldLight/10">
                <CardTitle className="text-2xl">{t("step4.servicePayment")}</CardTitle>
              </CardHeader>
              <CardContent className="pt-6">
                <div className="space-y-4">
                  {selectedService && (
                    <div className="flex items-start gap-4">
                      {(() => {
                        const Icon = selectedService.icon;
                        return (
                          <div className="inline-flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-lg bg-brand-gold/10">
                            <Icon className="h-6 w-6 text-brand-gold" />
                          </div>
                        );
                      })()}
                      <div className="flex-1">
                        <h3 className="text-xl font-bold text-brand-dark">{selectedService.title}</h3>
                        <p className="text-sm text-brand-grayMed mt-1">{selectedService.description}</p>
                      </div>
                    </div>
                  )}

                  <div className="border-t border-brand-grayLight pt-4 mt-4">
                    <div className="flex justify-between items-center text-lg mb-2">
                      <span className="text-brand-grayMed">{t("step4.serviceFeeExclVAT")}</span>
                      <span className="font-semibold text-brand-dark">
                        €{((bookingData.servicePrice || 0) / 1.17).toFixed(2)}
                      </span>
                    </div>
                    <div className="flex justify-between items-center text-lg mb-2">
                      <span className="text-brand-grayMed">{t("step4.vat")}</span>
                      <span className="font-semibold text-brand-dark">
                        €{((bookingData.servicePrice || 0) - ((bookingData.servicePrice || 0) / 1.17)).toFixed(2)}
                      </span>
                    </div>
                    <div className="border-t border-brand-grayLight pt-4 mt-4">
                      <div className="flex justify-between items-center">
                        <span className="text-xl font-bold text-brand-dark">{t("step4.totalInclVAT")}</span>
                        <span className="text-3xl font-bold text-brand-gold">
                          €{(bookingData.servicePrice || 0).toFixed(2)}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <div className="flex gap-4">
              <Button
                variant="outline"
                onClick={handleBackToServiceSelection}
                className="flex-1 border-brand-grayMed text-brand-grayMed hover:bg-gray-50"
              >
                <ArrowLeft className="mr-2 h-4 w-4" />
                {t("step4.changeService")}
              </Button>
              <Button
                onClick={handleProceedToPayment}
                className="flex-1 bg-brand-gold text-white hover:bg-brand-goldDark h-12 text-lg"
              >
                {t("step4.proceedToPayment")}
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </div>
          </div>
        </section>
      </>
    );
  }

  // STEP 5: Payment
  if (step === "payment") {
    return (
      <>
        <Script
          src={`https://www.paypal.com/sdk/js?client-id=${process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID || 'test'}&currency=EUR`}
          onLoad={() => {
            setIsPayPalLoaded(true);

            // Initialize PayPal Buttons
            if (window.paypal && bookingData.servicePrice) {
              window.paypal.Buttons({
                createOrder: function(data: any, actions: any) {
                  return actions.order.create({
                    purchase_units: [{
                      description: bookingData.serviceTitle || 'Tax Advisory Consultation',
                      amount: {
                        currency_code: 'EUR',
                        value: (bookingData.servicePrice || 0).toFixed(2)
                      }
                    }]
                  });
                },
                onApprove: async function(data: any, actions: any) {
                  const order = await actions.order.capture();
                  await handlePaymentSuccess(order);
                },
                onError: function(err: any) {
                  console.error('PayPal error:', err);
                  alert(t("payment.paymentFailed"));
                }
              }).render('#paypal-button-container');
            }
          }}
        />

        <section className="hero-gradient py-16 md:py-20">
          <div className="container mx-auto max-w-4xl px-6">
            <div className="text-center">
              <h1 className="mb-4 text-3xl font-bold text-white md:text-4xl lg:text-5xl">
                {t("payment.heroTitle")}
              </h1>
              <p className="text-lg text-white/90">
                {t("payment.heroSubtitle")}
              </p>
            </div>
          </div>
        </section>

        <section className="bg-white py-12 md:py-16">
          <div className="container mx-auto max-w-3xl px-6">
            <div className="mb-8 p-4 bg-blue-50 rounded-lg border border-blue-200">
              <p className="text-sm text-blue-900">
                {t("payment.securePaymentNotice")}
              </p>
            </div>

            <Card className="border-2 border-brand-grayLight mb-8">
              <CardHeader className="bg-brand-goldLight/10">
                <CardTitle className="text-2xl">{t("payment.paymentSummary")}</CardTitle>
              </CardHeader>
              <CardContent className="pt-6">
                <div className="space-y-3 mb-6">
                  <div className="flex justify-between">
                    <span className="text-brand-grayMed">{t("payment.service")}</span>
                    <span className="font-semibold text-brand-dark">{bookingData.serviceTitle}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-brand-grayMed">{t("payment.client")}</span>
                    <span className="font-semibold text-brand-dark">{bookingData.firstName} {bookingData.lastName}</span>
                  </div>
                  <div className="flex justify-between text-xl font-bold border-t pt-3">
                    <span className="text-brand-dark">{t("payment.total")}</span>
                    <span className="text-brand-gold">€{(bookingData.servicePrice || 0).toFixed(2)}</span>
                  </div>
                </div>

                <div id="paypal-button-container" className="mt-6"></div>

                {!isPayPalLoaded && (
                  <div className="text-center py-8">
                    <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-brand-gold border-r-transparent"></div>
                    <p className="mt-4 text-brand-grayMed">{t("payment.loadingPaymentOptions")}</p>
                  </div>
                )}
              </CardContent>
            </Card>

            <div className="flex gap-4">
              <Button
                variant="outline"
                onClick={() => setStep("summary")}
                className="flex-1 border-brand-grayMed text-brand-grayMed hover:bg-gray-50"
              >
                <ArrowLeft className="mr-2 h-4 w-4" />
                {t("payment.backToSummary")}
              </Button>
              <Button
                variant="outline"
                onClick={() => router.push(`/${locale}/tax-advisory`)}
                className="flex-1"
              >
                {t("payment.cancelBooking")}
              </Button>
            </div>
          </div>
        </section>
      </>
    );
  }

  return null;
}

// Extend Window interface for PayPal
declare global {
  interface Window {
    paypal?: any;
  }
}
