"use client";

import * as React from "react";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { SectionHeading } from "@/components/section-heading";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { PayPalButtons } from "@/components/paypal-buttons";
import { CheckCircle, ArrowLeft, ArrowRight, Clock, Video, Shield, User, Mail, Phone, Calendar, CreditCard } from "lucide-react";

const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";
const CALENDLY_URL = "https://calendly.com/opulanz-banking/investment-advisory-clone";
const CONSULTATION_PRICE = "99.90";
const CONSULTATION_TITLE = "Investment Advisory Consultation";

type Step = "contact" | "calendar" | "payment" | "confirmation";

interface ContactData { firstName: string; lastName: string; email: string; phone: string; }
interface CalendlyData { eventUri?: string; inviteeUri?: string; startTime?: string; endTime?: string; }

function fmtDate(iso?: string) {
  if (!iso) return "";
  const d = new Date(iso);
  if (isNaN(d.getTime())) return "";
  return d.toLocaleDateString("en-US", { weekday: "long", year: "numeric", month: "long", day: "numeric" });
}
function fmtTime(iso?: string) {
  if (!iso) return "";
  const d = new Date(iso);
  if (isNaN(d.getTime())) return "";
  return d.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" });
}

export default function InvestmentAdvisorySchedulePage({ params: { locale } }: { params: { locale: string } }) {
  const router = useRouter();
  const [step, setStep] = useState<Step>("contact");
  const [contact, setContact] = useState<ContactData>({ firstName: "", lastName: "", email: "", phone: "" });
  const [errors, setErrors] = useState<Partial<ContactData>>({});
  const [calendly, setCalendly] = useState<CalendlyData>({});
  const [loading, setLoading] = useState(false);
  const [confirmationNumber, setConfirmationNumber] = useState("");
  const [submitError, setSubmitError] = useState("");
  const [calendlyScriptLoaded, setCalendlyScriptLoaded] = useState(false);

  const fullName = `${contact.firstName} ${contact.lastName}`.trim();
  const dateStr = fmtDate(calendly.startTime);
  const timeStr = fmtTime(calendly.startTime);

  // Load Calendly script when calendar step is active
  useEffect(() => {
    if (step === "calendar" && !calendlyScriptLoaded) {
      const win = window as any;
      if (win.Calendly) { setCalendlyScriptLoaded(true); return; }
      const existing = document.querySelector('script[src="https://assets.calendly.com/assets/external/widget.js"]');
      if (existing) {
        const poll = setInterval(() => {
          if (win.Calendly) { clearInterval(poll); setCalendlyScriptLoaded(true); }
        }, 100);
        return () => clearInterval(poll);
      }
      const script = document.createElement("script");
      script.src = "https://assets.calendly.com/assets/external/widget.js";
      script.async = true;
      script.onload = () => setCalendlyScriptLoaded(true);
      document.head.appendChild(script);
    }
  }, [step, calendlyScriptLoaded]);

  // Initialise the inline widget once the script is ready
  useEffect(() => {
    if (step === "calendar" && calendlyScriptLoaded) {
      (window as any).Calendly?.initInlineWidgets?.();
    }
  }, [step, calendlyScriptLoaded]);

  // Listen for Calendly booking event → move to payment
  useEffect(() => {
    const handle = (e: MessageEvent) => {
      if (e.data?.event === "calendly.event_scheduled") {
        const p = e.data.payload || {};
        setCalendly({
          eventUri: p.event?.uri,
          inviteeUri: p.invitee?.uri,
          startTime: p.event?.start_time,
          endTime: p.event?.end_time,
        });
        setStep("payment");
      }
    };
    window.addEventListener("message", handle);
    return () => window.removeEventListener("message", handle);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  function handleContactSubmit(e: React.FormEvent) {
    e.preventDefault();
    const errs: Partial<ContactData> = {};
    if (!contact.firstName.trim()) errs.firstName = "First name is required";
    if (!contact.lastName.trim())  errs.lastName  = "Last name is required";
    if (!contact.email.trim())     errs.email     = "Email is required";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(contact.email)) errs.email = "Enter a valid email";
    if (!contact.phone.trim())     errs.phone     = "Phone number is required";
    setErrors(errs);
    if (Object.keys(errs).length) return;
    setStep("calendar");
  }

  async function handlePaymentSuccess(orderId: string, details: any) {
    setLoading(true);
    setSubmitError("");
    try {
      // Save appointment to DB
      let confNum = `CONF-INV-${Date.now()}`;
      try {
        const res = await fetch(`${API}/api/appointments`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            full_name: fullName,
            email: contact.email,
            phone: contact.phone,
            calendly_event_uri: calendly.eventUri || "",
            calendly_invitee_uri: calendly.inviteeUri || "",
            meeting_type: CONSULTATION_TITLE,
            status: "confirmed",
            start_time: calendly.startTime || new Date().toISOString(),
            end_time: calendly.endTime || "",
            timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
            location: "Video Conference",
            notes: `PayPal Order: ${orderId}`,
          }),
        });
        const json = await res.json();
        if (json.confirmation_number) confNum = json.confirmation_number;
        else if (json.data?.confirmation_number) confNum = json.data.confirmation_number;
      } catch { /* non-fatal */ }

      setConfirmationNumber(confNum);

      // Send emails to client + admin
      fetch(`${API}/api/notifications/investment-booking`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          confirmationNumber: confNum,
          customerInfo: { firstName: contact.firstName, lastName: contact.lastName, email: contact.email, phone: contact.phone },
          service: { id: "investment-advisory", title: CONSULTATION_TITLE, price: parseFloat(CONSULTATION_PRICE) },
          appointment: {
            date: calendly.startTime,
            time: timeStr,
            calendlyEventUrl: calendly.eventUri || "",
            calendlyInviteeUrl: calendly.inviteeUri || "",
          },
          payment: { method: "PayPal", orderId, status: "COMPLETED" },
        }),
      }).catch((e) => console.warn("Email notification failed (non-fatal):", e));

      setStep("confirmation");
    } catch (err) {
      console.error("Post-payment processing failed:", err);
      setSubmitError("Payment received but booking confirmation had an issue. Our team will contact you shortly.");
      setStep("confirmation");
    } finally {
      setLoading(false);
    }
  }

  const stepList: Step[] = ["contact", "calendar", "payment", "confirmation"];
  const stepIdx = stepList.indexOf(step);
  const progressSteps: Step[] = ["contact", "calendar", "payment"];

  return (
    <>
      {/* Hero */}
      <section className="hero-gradient py-12 md:py-16">
        <div className="container mx-auto max-w-4xl px-6 text-center">
          <h1 className="mb-4 text-3xl font-bold text-white md:text-4xl lg:text-5xl">
            Talk to an Investment Advisor
          </h1>
          <p className="text-lg text-white/90">
            Schedule a consultation with one of our licensed investment advisors.
          </p>
        </div>
      </section>

      <section className="bg-white py-12">
        <div className="container mx-auto max-w-4xl px-6">

          {/* Progress indicator */}
          {step !== "confirmation" && (
            <div className="mb-10 flex items-center justify-center gap-2">
              {progressSteps.map((s, i) => (
                <React.Fragment key={s}>
                  <div className={`flex h-9 w-9 items-center justify-center rounded-full text-sm font-bold transition-all ${
                    i < stepIdx ? "bg-brand-gold text-white" :
                    i === stepIdx ? "bg-brand-goldLight text-brand-goldDark ring-4 ring-brand-goldLight/30" :
                    "bg-gray-100 text-gray-400"
                  }`}>
                    {i < stepIdx ? <CheckCircle className="h-5 w-5" /> : i + 1}
                  </div>
                  {i < progressSteps.length - 1 && (
                    <div className={`h-1 w-16 rounded transition-all ${i < stepIdx ? "bg-brand-gold" : "bg-gray-100"}`} />
                  )}
                </React.Fragment>
              ))}
            </div>
          )}

          {/* ── STEP 1: Contact ── */}
          {step === "contact" && (
            <>
              <SectionHeading
                overline="STEP 1 OF 3"
                title="Your Contact Details"
                description="Enter your details so our advisor can confirm your appointment."
              />
              <Card className="mt-8 border-none shadow-lg">
                <CardContent className="p-8">
                  <form onSubmit={handleContactSubmit} className="space-y-6">
                    <div className="grid gap-6 sm:grid-cols-2">
                      <div>
                        <Label htmlFor="firstName">First Name <span className="text-red-500">*</span></Label>
                        <Input id="firstName" value={contact.firstName}
                          onChange={(e) => setContact(p => ({ ...p, firstName: e.target.value }))}
                          placeholder="John"
                          className={`mt-1 ${errors.firstName ? "border-red-500" : ""}`} />
                        {errors.firstName && <p className="mt-1 text-sm text-red-500">{errors.firstName}</p>}
                      </div>
                      <div>
                        <Label htmlFor="lastName">Last Name <span className="text-red-500">*</span></Label>
                        <Input id="lastName" value={contact.lastName}
                          onChange={(e) => setContact(p => ({ ...p, lastName: e.target.value }))}
                          placeholder="Doe"
                          className={`mt-1 ${errors.lastName ? "border-red-500" : ""}`} />
                        {errors.lastName && <p className="mt-1 text-sm text-red-500">{errors.lastName}</p>}
                      </div>
                    </div>
                    <div>
                      <Label htmlFor="email">Email Address <span className="text-red-500">*</span></Label>
                      <Input id="email" type="email" value={contact.email}
                        onChange={(e) => setContact(p => ({ ...p, email: e.target.value }))}
                        placeholder="john.doe@example.com"
                        className={`mt-1 ${errors.email ? "border-red-500" : ""}`} />
                      {errors.email && <p className="mt-1 text-sm text-red-500">{errors.email}</p>}
                    </div>
                    <div>
                      <Label htmlFor="phone">Phone Number <span className="text-red-500">*</span></Label>
                      <Input id="phone" type="tel" value={contact.phone}
                        onChange={(e) => setContact(p => ({ ...p, phone: e.target.value }))}
                        placeholder="+352 123 456 789"
                        className={`mt-1 ${errors.phone ? "border-red-500" : ""}`} />
                      {errors.phone && <p className="mt-1 text-sm text-red-500">{errors.phone}</p>}
                    </div>

                    <div className="flex items-center justify-between pt-2">
                      <Button type="button" variant="outline" onClick={() => router.push(`/${locale}/investment-advisory`)} className="flex items-center gap-2">
                        <ArrowLeft className="h-4 w-4" /> Back
                      </Button>
                      <Button type="submit" className="flex items-center gap-2 bg-brand-gold text-white hover:bg-brand-goldDark">
                        Continue to Schedule <ArrowRight className="h-4 w-4" />
                      </Button>
                    </div>
                  </form>
                </CardContent>
              </Card>

              <div className="mt-12 grid gap-8 md:grid-cols-3">
                {[
                  { icon: Clock, title: "60-Minute Session", desc: "A thorough consultation with a licensed investment advisor." },
                  { icon: Video, title: "Video Conference", desc: "Meet your advisor online from anywhere." },
                  { icon: Shield, title: "Fully Confidential", desc: "Your information is kept strictly private." },
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

          {/* ── STEP 2: Calendly ── */}
          {step === "calendar" && (
            <>
              <SectionHeading
                overline="STEP 2 OF 3"
                title="Choose Your Appointment"
                description="Select a date and time that works for you."
              />
              <Card className="mt-8 border-none shadow-lg">
                <CardContent className="p-4 md:p-8">
                  <div
                    key={locale}
                    className="calendly-inline-widget"
                    data-url={`${CALENDLY_URL}?hide_event_type_details=1&primary_color=b59354&name=${encodeURIComponent(fullName)}&email=${encodeURIComponent(contact.email)}`}
                    style={{ minWidth: "320px", height: "700px" }}
                  />
                </CardContent>
              </Card>
              <div className="mt-6 flex justify-start">
                <Button variant="outline" onClick={() => setStep("contact")} className="flex items-center gap-2">
                  <ArrowLeft className="h-4 w-4" /> Back to Contact
                </Button>
              </div>
            </>
          )}

          {/* ── STEP 3: Payment ── */}
          {step === "payment" && (
            <>
              <SectionHeading
                overline="STEP 3 OF 3"
                title="Complete Your Booking"
                description="Secure your consultation with a one-time payment."
              />

              {/* Booking summary */}
              <Card className="mt-8 border-none shadow-lg">
                <CardContent className="p-8">
                  <div className="mb-6 rounded-lg bg-brand-off p-5 space-y-3">
                    <h3 className="text-sm font-semibold uppercase tracking-wider text-brand-grayMed">Booking Summary</h3>
                    <div className="flex items-center gap-3">
                      <User className="h-4 w-4 text-brand-gold flex-shrink-0" />
                      <span className="text-brand-dark font-medium">{fullName}</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <Mail className="h-4 w-4 text-brand-gold flex-shrink-0" />
                      <span className="text-brand-dark">{contact.email}</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <Phone className="h-4 w-4 text-brand-gold flex-shrink-0" />
                      <span className="text-brand-dark">{contact.phone}</span>
                    </div>
                    {dateStr && (
                      <div className="flex items-center gap-3">
                        <Calendar className="h-4 w-4 text-brand-gold flex-shrink-0" />
                        <span className="text-brand-dark">{dateStr}{timeStr ? ` · ${timeStr}` : ""}</span>
                      </div>
                    )}
                    <div className="flex items-center gap-3">
                      <CreditCard className="h-4 w-4 text-brand-gold flex-shrink-0" />
                      <span className="text-brand-dark font-semibold">€{CONSULTATION_PRICE} — {CONSULTATION_TITLE}</span>
                    </div>
                  </div>

                  {loading ? (
                    <div className="flex flex-col items-center justify-center py-10 gap-4">
                      <div className="h-10 w-10 animate-spin rounded-full border-4 border-brand-gold border-t-transparent" />
                      <p className="text-brand-grayMed">Confirming your booking...</p>
                    </div>
                  ) : (
                    <PayPalButtons
                      amount={CONSULTATION_PRICE}
                      description={CONSULTATION_TITLE}
                      currency="EUR"
                      onSuccess={handlePaymentSuccess}
                      onError={(msg) => setSubmitError(msg)}
                    />
                  )}

                  {submitError && (
                    <p className="mt-4 text-sm text-amber-700 bg-amber-50 border border-amber-200 rounded-lg p-3 text-center">{submitError}</p>
                  )}
                </CardContent>
              </Card>

              <div className="mt-6 flex justify-start">
                <Button variant="outline" onClick={() => setStep("calendar")} className="flex items-center gap-2" disabled={loading}>
                  <ArrowLeft className="h-4 w-4" /> Back to Calendar
                </Button>
              </div>
            </>
          )}

          {/* ── STEP 4: Confirmation ── */}
          {step === "confirmation" && (
            <div className="text-center py-8">
              <div className="mb-6 inline-flex h-20 w-20 items-center justify-center rounded-full bg-green-100">
                <CheckCircle className="h-10 w-10 text-green-600" />
              </div>
              <h2 className="mb-3 text-3xl font-bold text-brand-dark">Booking Confirmed!</h2>
              <p className="mb-8 text-lg text-brand-grayMed max-w-xl mx-auto">
                Your investment advisory consultation has been scheduled. A confirmation email has been sent to <strong>{contact.email}</strong>.
              </p>

              {confirmationNumber && (
                <div className="mx-auto mb-8 max-w-sm rounded-lg bg-brand-goldLight/20 border border-brand-gold/30 p-4">
                  <p className="text-sm text-brand-grayMed mb-1">Confirmation Number</p>
                  <p className="text-xl font-bold text-brand-gold font-mono">{confirmationNumber}</p>
                </div>
              )}

              {submitError && (
                <p className="mb-6 text-sm text-amber-600 bg-amber-50 border border-amber-200 rounded-lg p-3 max-w-md mx-auto">{submitError}</p>
              )}

              <div className="mx-auto max-w-sm rounded-lg bg-gray-50 p-6 text-left space-y-3 mb-8">
                <div className="flex items-center gap-3">
                  <User className="h-4 w-4 text-brand-gold flex-shrink-0" />
                  <span className="text-brand-dark font-semibold">{fullName}</span>
                </div>
                <div className="flex items-center gap-3">
                  <Mail className="h-4 w-4 text-brand-gold flex-shrink-0" />
                  <span className="text-brand-dark">{contact.email}</span>
                </div>
                <div className="flex items-center gap-3">
                  <Phone className="h-4 w-4 text-brand-gold flex-shrink-0" />
                  <span className="text-brand-dark">{contact.phone}</span>
                </div>
                {dateStr && (
                  <div className="flex items-center gap-3">
                    <Calendar className="h-4 w-4 text-brand-gold flex-shrink-0" />
                    <span className="text-brand-dark">{dateStr}{timeStr ? ` · ${timeStr}` : ""}</span>
                  </div>
                )}
                <div className="flex items-center gap-3">
                  <CreditCard className="h-4 w-4 text-brand-gold flex-shrink-0" />
                  <span className="text-brand-dark font-semibold text-green-700">€{CONSULTATION_PRICE} Paid</span>
                </div>
              </div>

              {/* Next Step: MiFID II Questionnaire Action Card */}
              <div className="mx-auto mb-8 max-w-xl rounded-2xl border-2 border-brand-gold/40 bg-gradient-to-br from-brand-goldLight/20 to-white p-6 md:p-8 text-left shadow-md">
                <div className="flex items-center gap-3 mb-3">
                  <span className="flex h-7 w-7 items-center justify-center rounded-full bg-brand-gold text-white font-bold text-xs">
                    NEXT
                  </span>
                  <h3 className="text-xl font-bold text-brand-dark">
                    Complete Your Investor Profile (MiFID II)
                  </h3>
                </div>
                <p className="text-sm text-brand-grayMed mb-5 leading-relaxed">
                  To allow our certified advisors to prepare your personalized investment strategy and fulfill European regulatory compliance before your consultation, please complete your investor profile and sign the engagement mandate electronically via DocuSign.
                </p>
                <div className="flex flex-col sm:flex-row gap-3">
                  <Button
                    onClick={() =>
                      router.push(
                        `/${locale}/investment-advisory/onboarding?name=${encodeURIComponent(fullName)}&email=${encodeURIComponent(contact.email)}&phone=${encodeURIComponent(contact.phone)}`
                      )
                    }
                    className="flex-1 bg-brand-gold text-white hover:bg-brand-goldDark h-12 text-base font-semibold shadow-md flex items-center justify-center gap-2"
                  >
                    Complete Profile & Sign <ArrowRight className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => router.push(`/${locale}/investment-advisory`)}
                    className="h-12 border-gray-300 hover:bg-gray-50 text-brand-dark"
                  >
                    I'll Complete It Later
                  </Button>
                </div>
              </div>
            </div>
          )}

        </div>
      </section>
    </>
  );
}
