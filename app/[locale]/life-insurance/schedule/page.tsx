"use client";

import * as React from "react";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { SectionHeading } from "@/components/section-heading";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { CheckCircle, ArrowLeft, ArrowRight, Clock, Video, Shield, User, Mail, Calendar } from "lucide-react";

const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

// Confirmed working slugs in the Calendly account
const CALENDLY_URL_EN = "https://calendly.com/opulanz-banking/investment-advisory-clone";
const CALENDLY_URL_FR = "https://calendly.com/opulanz-banking/assurance-vie";

type Step = "contact" | "calendar" | "confirmation";

interface ContactData { firstName: string; lastName: string; email: string; phone: string; }
interface CalendlyData { eventUri?: string; inviteeUri?: string; startTime?: string; endTime?: string; }

function fmtDate(iso?: string, locale?: string) {
  if (!iso) return "";
  const d = new Date(iso);
  if (isNaN(d.getTime())) return "";
  return d.toLocaleDateString(locale === "fr" ? "fr-FR" : "en-US", {
    weekday: "long", year: "numeric", month: "long", day: "numeric",
  });
}
function fmtTime(iso?: string, locale?: string) {
  if (!iso) return "";
  const d = new Date(iso);
  if (isNaN(d.getTime())) return "";
  return d.toLocaleTimeString(locale === "fr" ? "fr-FR" : "en-US", { hour: "2-digit", minute: "2-digit" });
}

export default function LifeInsuranceSchedulePage({ params: { locale } }: { params: { locale: string } }) {
  const router = useRouter();
  const t = useTranslations("lifeInsurance.schedule");

  const [step, setStep] = useState<Step>("contact");
  const [contact, setContact] = useState<ContactData>({ firstName: "", lastName: "", email: "", phone: "" });
  const [errors, setErrors] = useState<Partial<ContactData>>({});
  const [calendly, setCalendly] = useState<CalendlyData>({});
  const [saving, setSaving] = useState(false);
  const [confirmationNumber, setConfirmationNumber] = useState("");
  const [submitError, setSubmitError] = useState("");

  const fullName = `${contact.firstName} ${contact.lastName}`.trim();
  const dateStr = fmtDate(calendly.startTime, locale);
  const timeStr = fmtTime(calendly.startTime, locale);
  const calendlyUrl = locale === "fr" ? CALENDLY_URL_FR : CALENDLY_URL_EN;

  // Load Calendly script + init widget whenever we enter the calendar step
  useEffect(() => {
    if (step !== "calendar") return;

    const win = window as any;
    const init = () => win.Calendly?.initInlineWidgets?.();

    if (win.Calendly) {
      init();
      return;
    }

    const existing = document.querySelector('script[src="https://assets.calendly.com/assets/external/widget.js"]');
    if (existing) {
      const poll = setInterval(() => {
        if (win.Calendly) { clearInterval(poll); init(); }
      }, 100);
      return () => clearInterval(poll);
    }

    const script = document.createElement("script");
    script.src = "https://assets.calendly.com/assets/external/widget.js";
    script.async = true;
    script.onload = init;
    document.head.appendChild(script);
  }, [step]);

  // Listen for Calendly booking completion
  useEffect(() => {
    const handle = (e: MessageEvent) => {
      if (e.data?.event === "calendly.event_scheduled") {
        const p = e.data.payload || {};
        const data: CalendlyData = {
          eventUri: p.event?.uri,
          inviteeUri: p.invitee?.uri,
          startTime: p.event?.start_time,
          endTime: p.event?.end_time,
        };
        setCalendly(data);
        submitBooking(data);
      }
    };
    window.addEventListener("message", handle);
    return () => window.removeEventListener("message", handle);
  }, [contact]); // eslint-disable-line react-hooks/exhaustive-deps

  function handleContactSubmit(e: React.FormEvent) {
    e.preventDefault();
    const errs: Partial<ContactData> = {};
    if (!contact.firstName.trim()) errs.firstName = t("errFirstName");
    if (!contact.lastName.trim())  errs.lastName  = t("errLastName");
    if (!contact.email.trim())     errs.email     = t("errEmail");
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(contact.email)) errs.email = t("errEmailInvalid");
    if (!contact.phone.trim())     errs.phone     = t("errPhone");
    setErrors(errs);
    if (Object.keys(errs).length) return;
    setStep("calendar");
  }

  async function submitBooking(cal: CalendlyData) {
    setSaving(true);
    setSubmitError("");
    try {
      const res = await fetch(`${API}/api/life-insurance-bookings`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: "life_insurance",
          status: "confirmed",
          customer_info: {
            firstName: contact.firstName,
            lastName: contact.lastName,
            email: contact.email,
            phone: contact.phone,
          },
          service: {
            id: "life-insurance-consultation",
            title: "Life Insurance Consultation",
            price: 0,
          },
          appointment: {
            date: cal.startTime || new Date().toISOString(),
            time: fmtTime(cal.startTime, locale),
            calendlyEventUrl: cal.eventUri || "",
            calendlyInviteeUrl: cal.inviteeUri || "",
          },
          payment: { method: "none", status: "N/A" },
        }),
      });
      const json = await res.json();
      if (json.success && json.data?.confirmation_number) {
        setConfirmationNumber(json.data.confirmation_number);
      }
    } catch (err) {
      console.error("Booking submission failed:", err);
      setSubmitError("Booking saved via Calendly. Our team will confirm by email shortly.");
    } finally {
      setSaving(false);
      setStep("confirmation");
    }
  }

  const stepList: Step[] = ["contact", "calendar", "confirmation"];
  const stepIdx = stepList.indexOf(step);

  return (
    <>
      {/* Hero */}
      <section className="hero-gradient py-12 md:py-16">
        <div className="container mx-auto max-w-4xl px-6 text-center">
          <h1 className="mb-4 text-3xl font-bold text-white md:text-4xl lg:text-5xl">
            {t("heroTitle")}
          </h1>
          <p className="text-lg text-white/90">{t("heroSubtitle")}</p>
        </div>
      </section>

      <section className="bg-white py-12">
        <div className="container mx-auto max-w-4xl px-6">

          {/* Progress indicator */}
          {step !== "confirmation" && (
            <div className="mb-10 flex items-center justify-center gap-2">
              {(["contact", "calendar"] as Step[]).map((s, i) => (
                <React.Fragment key={s}>
                  <div className={`flex h-9 w-9 items-center justify-center rounded-full text-sm font-bold transition-all ${
                    i < stepIdx ? "bg-brand-gold text-white" :
                    i === stepIdx ? "bg-brand-goldLight text-brand-goldDark ring-4 ring-brand-goldLight/30" :
                    "bg-gray-100 text-gray-400"
                  }`}>
                    {i < stepIdx ? <CheckCircle className="h-5 w-5" /> : i + 1}
                  </div>
                  {i < 1 && (
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
                overline={t("step1Overline")}
                title={t("step1Title")}
                description={t("step1Desc")}
              />
              <Card className="mt-8 border-none shadow-lg">
                <CardContent className="p-8">
                  <form onSubmit={handleContactSubmit} className="space-y-6">
                    <div className="grid gap-6 sm:grid-cols-2">
                      <div>
                        <Label htmlFor="firstName">{t("firstName")} <span className="text-red-500">*</span></Label>
                        <Input id="firstName" value={contact.firstName}
                          onChange={(e) => setContact(p => ({ ...p, firstName: e.target.value }))}
                          placeholder="Jean"
                          className={`mt-1 ${errors.firstName ? "border-red-500" : ""}`} />
                        {errors.firstName && <p className="mt-1 text-sm text-red-500">{errors.firstName}</p>}
                      </div>
                      <div>
                        <Label htmlFor="lastName">{t("lastName")} <span className="text-red-500">*</span></Label>
                        <Input id="lastName" value={contact.lastName}
                          onChange={(e) => setContact(p => ({ ...p, lastName: e.target.value }))}
                          placeholder="Dupont"
                          className={`mt-1 ${errors.lastName ? "border-red-500" : ""}`} />
                        {errors.lastName && <p className="mt-1 text-sm text-red-500">{errors.lastName}</p>}
                      </div>
                    </div>
                    <div>
                      <Label htmlFor="email">{t("emailAddress")} <span className="text-red-500">*</span></Label>
                      <Input id="email" type="email" value={contact.email}
                        onChange={(e) => setContact(p => ({ ...p, email: e.target.value }))}
                        placeholder="jean.dupont@exemple.com"
                        className={`mt-1 ${errors.email ? "border-red-500" : ""}`} />
                      {errors.email && <p className="mt-1 text-sm text-red-500">{errors.email}</p>}
                    </div>
                    <div>
                      <Label htmlFor="phone">{t("phoneNumber")} <span className="text-red-500">*</span></Label>
                      <Input id="phone" type="tel" value={contact.phone}
                        onChange={(e) => setContact(p => ({ ...p, phone: e.target.value }))}
                        placeholder="+352 123 456 789"
                        className={`mt-1 ${errors.phone ? "border-red-500" : ""}`} />
                      {errors.phone && <p className="mt-1 text-sm text-red-500">{errors.phone}</p>}
                    </div>

                    <div className="flex items-center justify-between pt-2">
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => router.push(`/${locale}/life-insurance`)}
                        className="flex items-center gap-2 hover:text-brand-dark hover:bg-brand-grayLight/20 hover:border-brand-grayLight"
                      >
                        <ArrowLeft className="h-4 w-4" /> {t("back")}
                      </Button>
                      <Button type="submit" className="flex items-center gap-2 bg-brand-gold text-white hover:bg-brand-goldDark">
                        {t("continueToSchedule")} <ArrowRight className="h-4 w-4" />
                      </Button>
                    </div>
                  </form>
                </CardContent>
              </Card>

              <div className="mt-12 grid gap-8 md:grid-cols-3">
                {[
                  { icon: Clock, titleKey: "card1Title", descKey: "card1Desc" },
                  { icon: Video, titleKey: "card2Title", descKey: "card2Desc" },
                  { icon: Shield, titleKey: "card3Title", descKey: "card3Desc" },
                ].map(({ icon: Icon, titleKey, descKey }) => (
                  <div key={titleKey} className="text-center">
                    <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-full bg-brand-goldLight">
                      <Icon className="h-6 w-6 text-brand-goldDark" />
                    </div>
                    <h3 className="mb-2 text-lg font-bold text-brand-dark">{t(titleKey as any)}</h3>
                    <p className="text-sm text-brand-grayMed">{t(descKey as any)}</p>
                  </div>
                ))}
              </div>
            </>
          )}

          {/* ── STEP 2: Calendly ── */}
          {step === "calendar" && (
            <>
              <SectionHeading
                overline={t("step2Overline")}
                title={t("step2Title")}
                description={t("step2Desc")}
              />

              {/* Consultation label shown above the widget */}
              <div className="mt-6 mb-2 flex items-center gap-2 justify-center">
                <Shield className="h-4 w-4 text-brand-gold" />
                <span className="text-sm font-semibold text-brand-dark">
                  {locale === "fr" ? "Consultation en Assurance Vie — Gratuit" : "Life Insurance Consultation — Free"}
                </span>
              </div>

              <Card className="border-none shadow-lg">
                <CardContent className="p-4 md:p-6">
                  {saving ? (
                    <div className="flex flex-col items-center justify-center py-16 gap-4">
                      <div className="h-10 w-10 animate-spin rounded-full border-4 border-brand-gold border-t-transparent" />
                      <p className="text-brand-grayMed">{t("savingBooking")}</p>
                    </div>
                  ) : (
                    <div
                      className="calendly-inline-widget"
                      data-url={`${calendlyUrl}?hide_event_type_details=1&hide_gdpr_banner=1&primary_color=b59354&name=${encodeURIComponent(fullName)}&email=${encodeURIComponent(contact.email)}`}
                      style={{ minWidth: "320px", height: "700px" }}
                    />
                  )}
                </CardContent>
              </Card>

              <div className="mt-6 flex justify-start">
                <Button
                  variant="outline"
                  onClick={() => setStep("contact")}
                  className="flex items-center gap-2 hover:text-brand-dark hover:bg-brand-grayLight/20 hover:border-brand-grayLight"
                  disabled={saving}
                >
                  <ArrowLeft className="h-4 w-4" /> {t("backToContact")}
                </Button>
              </div>
            </>
          )}

          {/* ── STEP 3: Confirmation ── */}
          {step === "confirmation" && (
            <div className="text-center py-8">
              <div className="mb-6 inline-flex h-20 w-20 items-center justify-center rounded-full bg-green-100">
                <CheckCircle className="h-10 w-10 text-green-600" />
              </div>
              <h2 className="mb-3 text-3xl font-bold text-brand-dark">{t("confirmTitle")}</h2>
              <p className="mb-8 text-lg text-brand-grayMed max-w-xl mx-auto">
                {t("confirmDesc", { email: contact.email }).split(contact.email).map((part, i, arr) =>
                  i < arr.length - 1
                    ? <React.Fragment key={i}>{part}<strong>{contact.email}</strong></React.Fragment>
                    : part
                )}
              </p>

              {confirmationNumber && (
                <div className="mx-auto mb-8 max-w-sm rounded-lg bg-brand-goldLight/20 border border-brand-gold/30 p-4">
                  <p className="text-sm text-brand-grayMed mb-1">{t("confirmationNumber")}</p>
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
                {dateStr && (
                  <div className="flex items-center gap-3">
                    <Calendar className="h-4 w-4 text-brand-gold flex-shrink-0" />
                    <span className="text-brand-dark">{dateStr}{timeStr ? ` · ${timeStr}` : ""}</span>
                  </div>
                )}
              </div>

              <Button
                onClick={() => router.push(`/${locale}/life-insurance`)}
                className="bg-brand-gold text-white hover:bg-brand-goldDark"
              >
                {t("backToLifeInsurance")}
              </Button>
            </div>
          )}

        </div>
      </section>
    </>
  );
}
