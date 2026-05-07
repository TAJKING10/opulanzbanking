"use client";

import * as React from "react";
import { useSearchParams } from "next/navigation";
import { useLocale } from "next-intl";
import { Hero } from "@/components/hero";
import { SectionHeading } from "@/components/section-heading";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Script from "next/script";
import { useState, useEffect, useRef } from "react";
import { CheckCircle, Clock, Video, Shield, ArrowLeft, ArrowRight, Calendar } from "lucide-react";

const SERVICE_MAP: Record<string, { title: string; price: number }> = {
  "tax-return-preparation": { title: "Tax Return Preparation", price: 299 },
  "international-tax": { title: "International Tax Advisory", price: 250 },
  "corporate-tax": { title: "Corporate Tax Advisory", price: 150 },
  "tax-compliance": { title: "Tax Compliance", price: 250 },
  "personal-tax-advisory": { title: "Personal Tax Advisory", price: 100 },
};

const DEFAULT_SERVICE = { title: "Tax Advisory Consultation", price: 150 };

interface ContactData {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
}

interface BookingData extends ContactData {
  eventUri?: string;
  inviteeUri?: string;
  eventStartTime?: string;
  eventEndTime?: string;
  appointmentScheduled: boolean;
  serviceTitle: string;
  servicePrice: number;
}

function formatDate(isoString?: string): string {
  if (!isoString) return "";
  const d = new Date(isoString);
  if (isNaN(d.getTime())) return "";
  return d.toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

function formatTime(isoString?: string): string {
  if (!isoString) return "";
  const d = new Date(isoString);
  if (isNaN(d.getTime())) return "";
  return d.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" });
}

export default function BookingClient() {
  const locale = useLocale();
  const searchParams = useSearchParams();
  const serviceId = searchParams.get("service") || "";
  const service = SERVICE_MAP[serviceId] || DEFAULT_SERVICE;

  const [step, setStep] = useState<"contact" | "calendar" | "payment" | "confirmation">("contact");
  const [contactData, setContactData] = useState<ContactData>({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
  });
  const [contactErrors, setContactErrors] = useState<Partial<ContactData>>({});
  const [bookingData, setBookingData] = useState<BookingData>({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    appointmentScheduled: false,
    serviceTitle: service.title,
    servicePrice: service.price,
  });
  const [loading, setLoading] = useState(false);
  const [paypalLoaded, setPaypalLoaded] = useState(false);
  const [paymentCompleted, setPaymentCompleted] = useState(false);
  const [calendlyScriptLoaded, setCalendlyScriptLoaded] = useState(false);
  const paypalRef = useRef<HTMLDivElement>(null);
  const calendlyRef = useRef<HTMLDivElement>(null);

  // Init Calendly widget when script is ready and step is calendar
  useEffect(() => {
    if (step !== "calendar") return;
    const fullName = `${bookingData.firstName} ${bookingData.lastName}`.trim();

    function initWidget() {
      // @ts-ignore
      if (window.Calendly && calendlyRef.current) {
        calendlyRef.current.innerHTML = "";
        // @ts-ignore
        window.Calendly.initInlineWidget({
          url: `https://calendly.com/opulanz-banking/tax-advisory?hide_event_type_details=1&primary_color=b59354`,
          parentElement: calendlyRef.current,
          prefill: {
            name: fullName,
            email: bookingData.email,
          },
        });
      }
    }

    // @ts-ignore
    if (window.Calendly) {
      initWidget();
    } else {
      const interval = setInterval(() => {
        // @ts-ignore
        if (window.Calendly) {
          clearInterval(interval);
          initWidget();
        }
      }, 200);
      return () => clearInterval(interval);
    }
  }, [step, calendlyScriptLoaded]);

  // Listen for Calendly booking confirmation
  useEffect(() => {
    const handleCalendlyEvent = (e: MessageEvent) => {
      if (e.data?.event?.indexOf?.("calendly") === 0) {
        if (e.data.event === "calendly.event_scheduled") {
          const payload = e.data.payload || {};
          setBookingData((prev) => ({
            ...prev,
            eventUri: payload.event?.uri,
            inviteeUri: payload.invitee?.uri,
            eventStartTime: payload.event?.start_time || prev.eventStartTime,
            eventEndTime: payload.event?.end_time || prev.eventEndTime,
            appointmentScheduled: true,
          }));
          setStep("payment");
        }
      }
    };
    window.addEventListener("message", handleCalendlyEvent);
    return () => window.removeEventListener("message", handleCalendlyEvent);
  }, []);

  // Render PayPal buttons when step = payment — poll until SDK + ref are both ready
  useEffect(() => {
    if (step !== "payment") return;

    function tryRender(): boolean {
      // @ts-ignore
      if (!paypalRef.current || !window.paypal) return false;
      paypalRef.current.innerHTML = "";
      // @ts-ignore
      window.paypal
        .Buttons({
          style: { layout: "vertical", color: "gold", shape: "rect", label: "pay", height: 50 },
          createOrder: (_data: any, actions: any) =>
            actions.order.create({
              purchase_units: [
                {
                  description: `${bookingData.serviceTitle} – Tax Advisory Consultation`,
                  amount: { currency_code: "EUR", value: bookingData.servicePrice.toFixed(2) },
                },
              ],
            }),
          onApprove: (_data: any, actions: any) =>
            actions.order.capture().then(() => setPaymentCompleted(true)),
          onError: (err: any) => {
            console.error("PayPal error:", err);
            alert("Payment failed. Please try again.");
          },
        })
        .render(paypalRef.current);
      return true;
    }

    if (!tryRender()) {
      const poll = setInterval(() => {
        if (tryRender()) clearInterval(poll);
      }, 300);
      return () => clearInterval(poll);
    }
  }, [step, paypalLoaded]);

  function handleContactSubmit(e: React.FormEvent) {
    e.preventDefault();
    const errs: Partial<ContactData> = {};
    if (!contactData.firstName.trim()) errs.firstName = "First name is required";
    if (!contactData.lastName.trim()) errs.lastName = "Last name is required";
    if (!contactData.email.trim()) errs.email = "Email is required";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(contactData.email))
      errs.email = "Enter a valid email";
    if (!contactData.phone.trim()) errs.phone = "Phone number is required";
    setContactErrors(errs);
    if (Object.keys(errs).length) return;

    setBookingData((prev) => ({ ...prev, ...contactData }));
    setStep("calendar");
  }

  async function handlePaymentComplete() {
    if (!paymentCompleted) {
      alert("Please complete the PayPal payment first.");
      return;
    }
    setLoading(true);

    const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";
    const name = `${bookingData.firstName} ${bookingData.lastName}`.trim();
    const now = new Date().toISOString();
    const startTime = bookingData.eventStartTime || now;
    const endTime =
      bookingData.eventEndTime ||
      new Date(Date.now() + 60 * 60 * 1000).toISOString();
    const startDate = new Date(startTime);

    // Save appointment — silently continue on failure (payment already taken)
    try {
      await fetch(`${API}/api/appointments`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          full_name: name,
          email: bookingData.email,
          phone: bookingData.phone,
          calendly_event_uri: bookingData.eventUri || null,
          meeting_type: "Tax Advisory",
          status: "confirmed",
          start_time: startTime,
          end_time: endTime,
          timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
          location: "Video Conference",
          notes: `Paid consultation – €${bookingData.servicePrice.toFixed(2)} – ${bookingData.serviceTitle}`,
        }),
      });
    } catch (err) {
      console.warn("Appointment save failed (non-blocking):", err);
    }

    // Send notification email — silently continue on failure
    try {
      await fetch(`${API}/api/notifications/appointment`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          customerName: name,
          customerEmail: bookingData.email,
          appointmentDate: bookingData.eventStartTime
            ? startDate.toLocaleDateString("en-US", {
                weekday: "long",
                year: "numeric",
                month: "long",
                day: "numeric",
              })
            : "Scheduled via Calendly — check your confirmation email",
          appointmentTime: bookingData.eventStartTime
            ? startDate.toLocaleTimeString("en-US", {
                hour: "2-digit",
                minute: "2-digit",
              })
            : "See Calendly confirmation",
          meetingType: `Tax Advisory – ${bookingData.serviceTitle}`,
          price: bookingData.servicePrice.toFixed(2),
        }),
      });
    } catch (err) {
      console.warn("Notification send failed (non-blocking):", err);
    }

    // Always proceed to confirmation — payment was successful
    setLoading(false);
    setStep("confirmation");
  }

  const fullName = `${bookingData.firstName} ${bookingData.lastName}`.trim();
  const dateDisplay = formatDate(bookingData.eventStartTime);
  const timeDisplay = formatTime(bookingData.eventStartTime);

  return (
    <>
      <Hero
        title="Schedule Your Tax Advisory Consultation"
        subtitle={`Book your ${bookingData.serviceTitle} session with our expert tax advisors`}
      />

      <section className="bg-white py-12">
        <div className="container mx-auto max-w-4xl px-6">

          {/* ─── STEP 1: CONTACT INFO ─────────────────────────────────── */}
          {step === "contact" && (
            <>
              <SectionHeading
                overline="STEP 1 OF 4"
                title="Your Contact Information"
                description="Please provide your details before scheduling your consultation"
              />

              <Card className="mt-8 border-none shadow-lg">
                <CardContent className="p-8">
                  <form onSubmit={handleContactSubmit} className="space-y-6">
                    <div className="grid gap-6 sm:grid-cols-2">
                      <div>
                        <Label htmlFor="firstName">
                          First Name <span className="text-red-500">*</span>
                        </Label>
                        <Input
                          id="firstName"
                          value={contactData.firstName}
                          onChange={(e) =>
                            setContactData((p) => ({ ...p, firstName: e.target.value }))
                          }
                          placeholder="Enter your first name"
                          className={`mt-1 ${contactErrors.firstName ? "border-red-500" : ""}`}
                        />
                        {contactErrors.firstName && (
                          <p className="mt-1 text-sm text-red-500">{contactErrors.firstName}</p>
                        )}
                      </div>
                      <div>
                        <Label htmlFor="lastName">
                          Last Name <span className="text-red-500">*</span>
                        </Label>
                        <Input
                          id="lastName"
                          value={contactData.lastName}
                          onChange={(e) =>
                            setContactData((p) => ({ ...p, lastName: e.target.value }))
                          }
                          placeholder="Enter your last name"
                          className={`mt-1 ${contactErrors.lastName ? "border-red-500" : ""}`}
                        />
                        {contactErrors.lastName && (
                          <p className="mt-1 text-sm text-red-500">{contactErrors.lastName}</p>
                        )}
                      </div>
                    </div>

                    <div>
                      <Label htmlFor="email">
                        Email Address <span className="text-red-500">*</span>
                      </Label>
                      <Input
                        id="email"
                        type="email"
                        value={contactData.email}
                        onChange={(e) =>
                          setContactData((p) => ({ ...p, email: e.target.value }))
                        }
                        placeholder="Enter your email address"
                        className={`mt-1 ${contactErrors.email ? "border-red-500" : ""}`}
                      />
                      {contactErrors.email && (
                        <p className="mt-1 text-sm text-red-500">{contactErrors.email}</p>
                      )}
                    </div>

                    <div>
                      <Label htmlFor="phone">
                        Phone Number <span className="text-red-500">*</span>
                      </Label>
                      <Input
                        id="phone"
                        type="tel"
                        value={contactData.phone}
                        onChange={(e) =>
                          setContactData((p) => ({ ...p, phone: e.target.value }))
                        }
                        placeholder="Enter your phone number"
                        className={`mt-1 ${contactErrors.phone ? "border-red-500" : ""}`}
                      />
                      {contactErrors.phone && (
                        <p className="mt-1 text-sm text-red-500">{contactErrors.phone}</p>
                      )}
                    </div>

                    {/* Selected service summary */}
                    <div className="rounded-lg bg-brand-goldLight/20 p-4 border border-brand-gold/30">
                      <div className="flex justify-between items-center">
                        <span className="font-semibold text-brand-dark">
                          {bookingData.serviceTitle}
                        </span>
                        <span className="text-xl font-bold text-brand-gold">
                          €{bookingData.servicePrice.toFixed(2)}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-2">
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => (window.location.href = `/${locale}/tax-advisory`)}
                        className="flex items-center gap-2"
                      >
                        <ArrowLeft className="h-4 w-4" /> Back to Tax Advisory
                      </Button>
                      <Button
                        type="submit"
                        className="flex items-center gap-2 bg-brand-gold text-white hover:bg-brand-goldDark"
                      >
                        Continue to Schedule <ArrowRight className="h-4 w-4" />
                      </Button>
                    </div>
                  </form>
                </CardContent>
              </Card>

              {/* Info cards */}
              <div className="mt-12 grid gap-8 md:grid-cols-3">
                {[
                  {
                    icon: Clock,
                    title: "60-Minute Consultation",
                    desc: "Comprehensive session covering your tax needs",
                  },
                  {
                    icon: Video,
                    title: "Video Conference",
                    desc: "Secure online meeting via your preferred platform",
                  },
                  {
                    icon: Shield,
                    title: "Confidential & Secure",
                    desc: "All discussions are strictly confidential",
                  },
                ].map(({ icon: Icon, title, desc }) => (
                  <div key={title} className="text-center">
                    <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-full bg-brand-goldLight">
                      <Icon className="h-6 w-6 text-brand-goldDark" />
                    </div>
                    <h3 className="mb-2 text-lg font-bold text-brand-dark">{title}</h3>
                    <p className="text-sm text-brand-grayMed">{desc}</p>
                  </div>
                ))}
              </div>
            </>
          )}

          {/* ─── STEP 2: CALENDLY CALENDAR ───────────────────────────── */}
          {step === "calendar" && (
            <>
              <SectionHeading
                overline="STEP 2 OF 4"
                title="Pick a Date & Time"
                description={`Booking for ${fullName} (${bookingData.email})`}
              />

              <Card className="mt-8 border-none shadow-lg">
                <CardContent className="p-4 md:p-8">
                  <div
                    ref={calendlyRef}
                    style={{ minWidth: "320px", height: "700px" }}
                  />
                </CardContent>
              </Card>

              <div className="mt-6 flex justify-start">
                <Button
                  variant="outline"
                  onClick={() => setStep("contact")}
                  className="flex items-center gap-2"
                >
                  <ArrowLeft className="h-4 w-4" /> Back to Contact Info
                </Button>
              </div>
            </>
          )}

          {/* ─── STEP 3: PAYMENT ─────────────────────────────────────── */}
          {step === "payment" && (
            <>
              <div className="mb-8 text-center">
                <div className="mb-4 inline-flex h-14 w-14 items-center justify-center rounded-full bg-green-100">
                  <CheckCircle className="h-7 w-7 text-green-600" />
                </div>
                <h2 className="mb-2 text-2xl font-bold text-brand-dark md:text-3xl">
                  Time Slot Reserved!
                </h2>
                <p className="text-brand-grayMed">
                  Complete your payment to confirm your appointment.
                </p>
              </div>

              {/* Appointment details */}
              <Card className="mb-8 border-brand-gold/30 shadow-lg">
                <CardContent className="p-8">
                  <h3 className="mb-6 text-xl font-bold text-brand-dark">
                    Your Appointment Details
                  </h3>
                  <div className="space-y-4">
                    <div className="flex justify-between border-b border-brand-grayLight/30 pb-3">
                      <span className="text-brand-grayMed">Service:</span>
                      <span className="font-semibold text-brand-dark">
                        {bookingData.serviceTitle}
                      </span>
                    </div>
                    <div className="flex justify-between border-b border-brand-grayLight/30 pb-3">
                      <span className="text-brand-grayMed">Name:</span>
                      <span className="font-semibold text-brand-dark">{fullName}</span>
                    </div>
                    <div className="flex justify-between border-b border-brand-grayLight/30 pb-3">
                      <span className="text-brand-grayMed">Email:</span>
                      <span className="font-semibold text-brand-dark">{bookingData.email}</span>
                    </div>
                    <div className="flex justify-between border-b border-brand-grayLight/30 pb-3">
                      <span className="text-brand-grayMed">Phone:</span>
                      <span className="font-semibold text-brand-dark">{bookingData.phone}</span>
                    </div>
                    <div className="flex justify-between border-b border-brand-grayLight/30 pb-3">
                      <span className="text-brand-grayMed">Date:</span>
                      <span className="font-semibold text-brand-dark">
                        {dateDisplay || (
                          <span className="flex items-center gap-1 text-brand-grayMed">
                            <Calendar className="h-4 w-4" /> Scheduled via Calendly
                          </span>
                        )}
                      </span>
                    </div>
                    <div className="flex justify-between border-b border-brand-grayLight/30 pb-3">
                      <span className="text-brand-grayMed">Time:</span>
                      <span className="font-semibold text-brand-dark">
                        {timeDisplay || "Check your Calendly confirmation email"}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-brand-grayMed">Duration:</span>
                      <span className="font-semibold text-brand-dark">60 minutes</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Payment */}
              <Card className="border-none shadow-lg">
                <CardContent className="p-8 md:p-12">
                  <div className="text-center">
                    <h3 className="mb-2 text-xl font-bold text-brand-dark">
                      Complete Your Payment
                    </h3>
                    <p className="text-3xl font-bold text-brand-gold">
                      €{bookingData.servicePrice.toFixed(2)}
                    </p>
                    <p className="mt-2 text-sm text-brand-grayMed">
                      One-time payment for 60-minute consultation
                    </p>

                    <div className="mx-auto mt-8 max-w-md">
                      <div ref={paypalRef} id="paypal-button-container" />
                      {!paypalLoaded && !paymentCompleted && (
                        <div className="flex flex-col items-center gap-3 py-6">
                          <div className="h-8 w-8 animate-spin rounded-full border-4 border-solid border-brand-gold border-r-transparent" />
                          <p className="text-sm text-brand-grayMed">Loading payment options…</p>
                        </div>
                      )}
                    </div>

                    {paymentCompleted && (
                      <div className="mt-6 space-y-4">
                        <div className="rounded-lg bg-green-50 p-4 text-green-800">
                          <div className="flex items-center justify-center gap-2">
                            <CheckCircle className="h-5 w-5" />
                            <span className="font-semibold">Payment Successful!</span>
                          </div>
                        </div>
                        <Button
                          onClick={handlePaymentComplete}
                          disabled={loading}
                          className="bg-brand-gold text-white hover:bg-brand-goldDark"
                        >
                          {loading ? "Processing..." : "Continue to Confirmation"}
                        </Button>
                      </div>
                    )}

                    <Button
                      variant="outline"
                      onClick={() => setStep("calendar")}
                      className="mt-4 flex items-center gap-2"
                    >
                      <ArrowLeft className="h-4 w-4" /> Back to Calendar
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </>
          )}

          {/* ─── STEP 4: CONFIRMATION ────────────────────────────────── */}
          {step === "confirmation" && (
            <div className="text-center">
              <div className="mb-6 inline-flex h-20 w-20 items-center justify-center rounded-full bg-green-100">
                <CheckCircle className="h-10 w-10 text-green-600" />
              </div>
              <h2 className="mb-4 text-3xl font-bold text-brand-dark">
                Payment Confirmed!
              </h2>
              <p className="mb-10 text-brand-grayMed">
                Thank you for your payment. Your appointment is now confirmed. We've sent
                confirmation details to your email.
              </p>

              <Card className="mb-8 border-brand-gold/30 text-left shadow-lg">
                <CardContent className="p-8">
                  <h3 className="mb-6 text-xl font-bold text-brand-dark">
                    Confirmed Appointment
                  </h3>
                  <div className="space-y-4">
                    <div className="flex justify-between border-b border-brand-grayLight/30 pb-3">
                      <span className="text-brand-grayMed">Service:</span>
                      <span className="font-semibold text-brand-dark">
                        {bookingData.serviceTitle}
                      </span>
                    </div>
                    <div className="flex justify-between border-b border-brand-grayLight/30 pb-3">
                      <span className="text-brand-grayMed">Name:</span>
                      <span className="font-semibold text-brand-dark">{fullName}</span>
                    </div>
                    <div className="flex justify-between border-b border-brand-grayLight/30 pb-3">
                      <span className="text-brand-grayMed">Email:</span>
                      <span className="font-semibold text-brand-dark">{bookingData.email}</span>
                    </div>
                    <div className="flex justify-between border-b border-brand-grayLight/30 pb-3">
                      <span className="text-brand-grayMed">Date:</span>
                      <span className="font-semibold text-brand-dark">
                        {dateDisplay || "Check your Calendly confirmation email"}
                      </span>
                    </div>
                    <div className="flex justify-between border-b border-brand-grayLight/30 pb-3">
                      <span className="text-brand-grayMed">Time:</span>
                      <span className="font-semibold text-brand-dark">
                        {timeDisplay || "Scheduled via Calendly"}
                      </span>
                    </div>
                    <div className="flex justify-between border-b border-brand-grayLight/30 pb-3">
                      <span className="text-brand-grayMed">Duration:</span>
                      <span className="font-semibold text-brand-dark">60 minutes</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-brand-grayMed">Amount Paid:</span>
                      <span className="font-bold text-brand-gold">
                        €{bookingData.servicePrice.toFixed(2)}
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <div className="rounded-lg bg-brand-goldLight/20 p-6 text-left">
                <h4 className="mb-4 font-semibold text-brand-dark">What's Next?</h4>
                <ul className="space-y-3 text-sm text-brand-grayMed">
                  <li className="flex items-start gap-2">
                    <CheckCircle className="mt-0.5 h-4 w-4 flex-shrink-0 text-brand-gold" />
                    <span>
                      Check your email ({bookingData.email}) for the meeting link and
                      calendar invite
                    </span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="mt-0.5 h-4 w-4 flex-shrink-0 text-brand-gold" />
                    <span>
                      Prepare your tax documents, recent returns, and any relevant
                      financial records
                    </span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="mt-0.5 h-4 w-4 flex-shrink-0 text-brand-gold" />
                    <span>Join the video conference at your scheduled time</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="mt-0.5 h-4 w-4 flex-shrink-0 text-brand-gold" />
                    <span>
                      Our team at opulanz.banking@gmail.com has been notified
                    </span>
                  </li>
                </ul>
              </div>

              <Button
                onClick={() => (window.location.href = `/${locale}`)}
                className="mt-8 bg-brand-gold text-white hover:bg-brand-goldDark"
              >
                Return to Home
              </Button>
            </div>
          )}
        </div>
      </section>

      <Script
        src="https://assets.calendly.com/assets/external/widget.js"
        strategy="afterInteractive"
        onLoad={() => setCalendlyScriptLoaded(true)}
      />
      <Script
        src={`https://www.paypal.com/sdk/js?client-id=${
          process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID ||
          "AY2J7gUncxDdmNXWjLaw5E9A4Gz6X-hcQvagQBhi2erpaMLeHoaHbGIi7dgns3GZ3oFxg-wO0Xhwy0qo"
        }&currency=EUR`}
        strategy="lazyOnload"
        onLoad={() => setPaypalLoaded(true)}
      />
    </>
  );
}
