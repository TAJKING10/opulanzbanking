"use client";

import * as React from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { useLocale, useTranslations } from "next-intl";
import { Hero } from "@/components/hero";
import { SectionHeading } from "@/components/section-heading";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Script from "next/script";
import { useState, useEffect, useRef } from "react";
import { PayPalButtons } from "@/components/paypal-buttons";
import {
  CheckCircle, Clock, Video, Shield,
  ArrowLeft, ArrowRight, Calendar, User, Mail, Phone, CreditCard,
  Download, FileText,
} from "lucide-react";
import { PageGuidance } from "@/components/page-guidance";

const SERVICE_MAP: Record<string, { title: string; titleFr: string; price: number }> = {
  "tax-return-preparation": { title: "Tax Return Preparation", titleFr: "Préparation de déclaration fiscale", price: 299 },
  "international-tax":      { title: "International Tax Advisory", titleFr: "Conseil fiscal international", price: 250 },
  "corporate-tax":          { title: "Corporate Tax Advisory", titleFr: "Conseil fiscal d'entreprise", price: 150 },
  "tax-compliance":         { title: "Tax Compliance", titleFr: "Conformité fiscale", price: 250 },
  "personal-tax-advisory":  { title: "Personal Tax Advisory", titleFr: "Conseil fiscal personnel", price: 100 },
};
const DEFAULT_SERVICE = { title: "Tax Advisory Consultation", titleFr: "Consultation fiscale", price: 150 };

type Step = "contact" | "calendar" | "summary" | "payment" | "confirmation";

interface ContactData { firstName: string; lastName: string; email: string; phone: string; }
interface CalendlyData { eventUri?: string; inviteeUri?: string; startTime?: string; endTime?: string; }
interface PaypalData { orderId?: string; status?: string; payer?: any; }

function fmtDate(iso?: string, loc?: string) {
  if (!iso) return "";
  const d = new Date(iso);
  if (isNaN(d.getTime())) return "";
  return d.toLocaleDateString(loc === "fr" ? "fr-FR" : "en-US", { weekday: "long", year: "numeric", month: "long", day: "numeric" });
}
function fmtTime(iso?: string, loc?: string) {
  if (!iso) return "";
  const d = new Date(iso);
  if (isNaN(d.getTime())) return "";
  return d.toLocaleTimeString(loc === "fr" ? "fr-FR" : "en-US", { hour: "2-digit", minute: "2-digit" });
}

export default function BookingClient() {
  const locale = useLocale();
  const router = useRouter();
  const searchParams = useSearchParams();
  const t = useTranslations("taxAdvisory.booking");
  const tConf = useTranslations("taxAdvisory.confirmation");

  const serviceId = searchParams.get("service") || "";
  const svc = SERVICE_MAP[serviceId] || DEFAULT_SERVICE;
  const serviceTitle = locale === "fr" ? svc.titleFr : svc.title;

  const [step, setStep] = useState<Step>("contact");
  const [contact, setContact] = useState<ContactData>({ firstName: "", lastName: "", email: "", phone: "" });
  const [errors, setErrors] = useState<Partial<ContactData>>({});
  const [calendly, setCalendly] = useState<CalendlyData>({});
  const [paypal, setPaypal] = useState<PaypalData>({});
  const [paymentDone, setPaymentDone] = useState(false);
  const [calendlyLoaded, setCalendlyLoaded] = useState(false);
  const [loading, setLoading] = useState(false);
  const [confirmationNumber, setConfirmationNumber] = useState("");
  const calendlyRef = useRef<HTMLDivElement>(null);

  const fullName = `${contact.firstName} ${contact.lastName}`.trim();
  const dateStr = fmtDate(calendly.startTime, locale);
  const timeStr = fmtTime(calendly.startTime, locale);

  // ── Calendly init ──────────────────────────────────────────────────────────
  useEffect(() => {
    if (step !== "calendar") return;
    function init() {
      // @ts-ignore
      if (window.Calendly && calendlyRef.current) {
        calendlyRef.current.innerHTML = "";
        // @ts-ignore
        window.Calendly.initInlineWidget({
          url: "https://calendly.com/opulanz-banking/tax-advisory?hide_event_type_details=1&primary_color=b59354",
          parentElement: calendlyRef.current,
          prefill: { name: fullName, email: contact.email },
        });
      }
    }
    // @ts-ignore
    if (window.Calendly) { init(); }
    else {
      const iv = setInterval(() => { // @ts-ignore
        if (window.Calendly) { clearInterval(iv); init(); }
      }, 200);
      return () => clearInterval(iv);
    }
  }, [step, calendlyLoaded]);

  // ── Calendly event listener ────────────────────────────────────────────────
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
        setStep("summary");
      }
    };
    window.addEventListener("message", handle);
    return () => window.removeEventListener("message", handle);
  }, []);

  // ── Step 1: Validate contact ───────────────────────────────────────────────
  function handleContactSubmit(e: React.FormEvent) {
    e.preventDefault();
    const errs: Partial<ContactData> = {};
    if (!contact.firstName.trim()) errs.firstName = t("step1.firstNameRequired");
    if (!contact.lastName.trim())  errs.lastName  = t("step1.lastNameRequired");
    if (!contact.email.trim())     errs.email     = t("step1.emailRequired");
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(contact.email)) errs.email = t("step1.emailInvalid");
    if (!contact.phone.trim())     errs.phone     = t("step1.phoneRequired");
    setErrors(errs);
    if (Object.keys(errs).length) return;
    setStep("calendar");
  }

  // ── Fetch with 5-second timeout ───────────────────────────────────────────
  async function fetchWithTimeout(url: string, options: RequestInit, ms = 5000) {
    const controller = new AbortController();
    const id = setTimeout(() => controller.abort(), ms);
    try {
      return await fetch(url, { ...options, signal: controller.signal });
    } finally {
      clearTimeout(id);
    }
  }

  // ── Step 4: After PayPal – auto-proceeds when paymentDone becomes true ────
  async function handlePaymentComplete() {
    setLoading(true);

    const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";
    const confNum = `TAX-${Date.now().toString(36).toUpperCase()}`;
    const paymentDate = new Date().toISOString();

    try {
      await fetchWithTimeout(`${API}/api/appointments`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          full_name: fullName,
          email: contact.email,
          phone: contact.phone,
          calendly_event_uri: calendly.eventUri || null,
          meeting_type: "Tax Advisory",
          status: "confirmed",
          start_time: calendly.startTime || paymentDate,
          end_time: calendly.endTime || new Date(Date.now() + 3600000).toISOString(),
          timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
          location: "Video Conference",
          notes: `Paid €${svc.price.toFixed(2)} – ${serviceTitle} – PayPal: ${paypal.orderId || "N/A"} – Conf: ${confNum}`,
        }),
      });
    } catch (err) { console.warn("Appointment save failed:", err); }

    try {
      await fetchWithTimeout(`${API}/api/notifications/appointment`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          customerName: fullName,
          customerEmail: contact.email,
          appointmentDate: dateStr || "Scheduled via Calendly",
          appointmentTime: timeStr || "See Calendly confirmation",
          meetingType: `Tax Advisory – ${serviceTitle}`,
          price: svc.price.toFixed(2),
        }),
      });
    } catch (err) { console.warn("Notification failed:", err); }

    // Save to sessionStorage for confirmation page
    try {
      sessionStorage.setItem("tax-advisory-booking", JSON.stringify({
        firstName: contact.firstName,
        lastName: contact.lastName,
        email: contact.email,
        phone: contact.phone,
        serviceId,
        serviceTitle,
        servicePrice: svc.price,
        appointmentDate: calendly.startTime || paymentDate,
        appointmentTime: calendly.startTime || paymentDate,
        confirmationNumber: confNum,
        paypalOrderId: paypal.orderId,
        paypalStatus: paypal.status,
        paypalPayer: paypal.payer,
        paymentDate,
      }));
    } catch (err) { console.warn("sessionStorage failed:", err); }

    setConfirmationNumber(confNum);
    setLoading(false);
    setStep("confirmation");
  }

  // ── Auto-proceed to confirmation once PayPal payment is done ──────────────
  useEffect(() => {
    if (!paymentDone) return;
    const timer = setTimeout(() => { handlePaymentComplete(); }, 1200);
    return () => clearTimeout(timer);
  }, [paymentDone]); // eslint-disable-line react-hooks/exhaustive-deps

  // ── Download receipt ───────────────────────────────────────────────────────
  function handleDownloadReceipt() {
    const confNo = confirmationNumber || `TAX-${Date.now().toString(36).toUpperCase()}`;
    const paymentDate = new Date().toISOString();
    const receiptHTML = `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>Opulanz Banking - Payment Receipt</title>
  <style>
    body { font-family: Arial, sans-serif; max-width: 800px; margin: 0 auto; padding: 40px; color: #333; }
    .header { text-align: center; margin-bottom: 40px; border-bottom: 3px solid #b59354; padding-bottom: 20px; }
    .logo { font-size: 32px; font-weight: bold; color: #b59354; margin-bottom: 10px; }
    .receipt-title { font-size: 24px; color: #252623; margin-top: 20px; }
    .confirmation-number { background: #f6f8f8; padding: 15px; margin: 20px 0; border-left: 4px solid #b59354; font-family: monospace; font-size: 18px; }
    .section { margin: 30px 0; }
    .section-title { font-size: 18px; font-weight: bold; color: #252623; margin-bottom: 15px; border-bottom: 2px solid #e5e7eb; padding-bottom: 10px; }
    .detail-row { display: flex; justify-content: space-between; padding: 10px 0; border-bottom: 1px solid #f3f4f6; }
    .detail-label { color: #6b7280; font-weight: 500; }
    .detail-value { color: #252623; font-weight: 600; text-align: right; }
    .total-row { background: #f6f8f8; padding: 15px; margin-top: 20px; font-size: 20px; border-radius: 8px; }
    .total-label { color: #252623; font-weight: bold; }
    .total-value { color: #b59354; font-weight: bold; font-size: 24px; }
    .paid-stamp { display: inline-block; background: #10b981; color: white; padding: 8px 20px; border-radius: 20px; font-weight: bold; margin-top: 10px; }
    .footer { margin-top: 50px; text-align: center; color: #6b7280; font-size: 14px; border-top: 2px solid #e5e7eb; padding-top: 20px; }
    .print-instructions { background: #eff6ff; border: 2px solid #3b82f6; border-radius: 8px; padding: 20px; margin: 30px 0; text-align: center; }
    .print-button { background: #3b82f6; color: white; border: none; padding: 12px 24px; border-radius: 6px; font-size: 16px; font-weight: bold; cursor: pointer; margin-top: 10px; }
    @media print { body { padding: 20px; } .print-instructions { display: none; } }
  </style>
</head>
<body>
  <div class="print-instructions">
    <h3 style="color:#1e40af;margin-top:0;">Save as PDF Instructions</h3>
    <p style="color:#1e3a8a;margin:10px 0;">Click the button below and select "Save as PDF" as your printer destination.</p>
    <button class="print-button" onclick="window.print()">Print / Save as PDF</button>
  </div>
  <div class="header">
    <div class="logo">OPULANZ BANKING</div>
    <div>Luxembourg Financial Services</div>
    <div class="receipt-title">PAYMENT RECEIPT</div>
  </div>
  <div class="confirmation-number"><strong>Confirmation Number:</strong> ${confNo}</div>
  <div class="section">
    <div class="section-title">APPOINTMENT DETAILS</div>
    <div class="detail-row"><span class="detail-label">Client Name:</span><span class="detail-value">${fullName}</span></div>
    <div class="detail-row"><span class="detail-label">Email:</span><span class="detail-value">${contact.email}</span></div>
    <div class="detail-row"><span class="detail-label">Phone:</span><span class="detail-value">${contact.phone}</span></div>
    ${dateStr ? `<div class="detail-row"><span class="detail-label">Appointment Date:</span><span class="detail-value">${dateStr}</span></div>` : ""}
    ${timeStr ? `<div class="detail-row"><span class="detail-label">Appointment Time:</span><span class="detail-value">${timeStr}</span></div>` : ""}
    <div class="detail-row"><span class="detail-label">Duration:</span><span class="detail-value">60 minutes</span></div>
  </div>
  <div class="section">
    <div class="section-title">SERVICE DETAILS</div>
    <div class="detail-row"><span class="detail-label">Service:</span><span class="detail-value">${serviceTitle}</span></div>
    <div class="detail-row"><span class="detail-label">Service Fee (excl. VAT):</span><span class="detail-value">\u20AC${(svc.price / 1.17).toFixed(2)}</span></div>
    <div class="detail-row"><span class="detail-label">VAT (17%):</span><span class="detail-value">\u20AC${(svc.price - svc.price / 1.17).toFixed(2)}</span></div>
  </div>
  <div class="total-row detail-row">
    <span class="total-label">TOTAL (incl. VAT):</span>
    <span class="total-value">\u20AC${svc.price.toFixed(2)}</span>
  </div>
  <div class="section">
    <div class="section-title">PAYMENT INFORMATION</div>
    <div class="detail-row"><span class="detail-label">Payment Method:</span><span class="detail-value">PayPal</span></div>
    ${paypal.orderId ? `<div class="detail-row"><span class="detail-label">PayPal Transaction ID:</span><span class="detail-value">${paypal.orderId}</span></div>` : ""}
    <div class="detail-row"><span class="detail-label">Payment Date:</span><span class="detail-value">${new Date().toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })}</span></div>
    <div class="detail-row"><span class="detail-label">Payment Status:</span><span class="detail-value"><span class="paid-stamp">${paypal.status || "PAID"}</span></span></div>
  </div>
  <div class="footer">
    <p><strong>Thank you for choosing Opulanz Banking!</strong></p>
    <p>For questions about your booking, please contact us at:<br><strong>support@opulanzbanking.com</strong></p>
    <p style="margin-top:20px;font-size:12px;">This is an official payment receipt from Opulanz Banking. Please keep this receipt for your records.</p>
  </div>
</body>
</html>`;
    const blob = new Blob([receiptHTML], { type: "text/html" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `Opulanz-Receipt-${confNo}.html`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    setTimeout(() => window.URL.revokeObjectURL(url), 100);
  }

  // ── Progress bar ───────────────────────────────────────────────────────────
  const steps: Step[] = ["contact", "calendar", "summary", "payment", "confirmation"];
  const stepIdx = steps.indexOf(step);
  const stepLabels = [t("step1.overline"), t("step2.overline"), t("step3.overline"), t("step4.overline"), "DONE"];

  return (
    <>
      <PageGuidance
        pageKey="tax-advisory-booking"
        locale={locale}
        title="Book a Tax Consultation"
        description="Schedule your session with a certified tax advisor in 4 easy steps."
        steps={[
          { content: "Welcome to the booking flow. Booking your tax consultation takes just 4 steps — contact info, date selection, review, and payment." },
          { title: "Progress Steps", content: "This progress bar shows where you are in the process. Each step must be completed before moving to the next.", target: ".mb-10.flex.items-center", position: "bottom" },
          { title: "Your Contact Details", content: "Start by entering your name, email, and phone number so your advisor can confirm your appointment.", target: "#firstName", position: "bottom" },
          { title: "Complete Payment", content: "On the final step, you'll pay securely with PayPal or debit card. Once paid, your booking is confirmed and a calendar invite is sent.", target: "a[href*='open-account']", position: "top" },
        ]}
        tip="You'll receive a calendar invite and meeting link by email immediately after payment."
      />
      <Hero
        title={t("heroTitle")}
        subtitle={t("heroSubtitle", { service: serviceTitle })}
      />

      <section className="bg-white py-12">
        <div className="container mx-auto max-w-4xl px-6">

          {/* Progress indicator */}
          {step !== "confirmation" && (
            <div className="mb-10 flex items-center justify-center gap-2">
              {steps.filter(s => s !== "confirmation").map((s, i) => (
                <React.Fragment key={s}>
                  <div className={`flex h-9 w-9 items-center justify-center rounded-full text-sm font-bold transition-all ${
                    i < stepIdx ? "bg-brand-gold text-white" :
                    i === stepIdx ? "bg-brand-goldLight text-brand-goldDark ring-4 ring-brand-goldLight/30" :
                    "bg-gray-100 text-gray-400"
                  }`}>
                    {i < stepIdx ? <CheckCircle className="h-5 w-5" /> : i + 1}
                  </div>
                  {i < 3 && (
                    <div className={`h-1 w-10 rounded transition-all ${i < stepIdx ? "bg-brand-gold" : "bg-gray-100"}`} />
                  )}
                </React.Fragment>
              ))}
            </div>
          )}

          {/* ── STEP 1: Contact ──────────────────────────────────────────── */}
          {step === "contact" && (
            <>
              <SectionHeading
                overline={t("step1.overline")}
                title={t("step1.title")}
                description={t("step1.description")}
              />
              <Card className="mt-8 border-none shadow-lg">
                <CardContent className="p-8">
                  <form onSubmit={handleContactSubmit} className="space-y-6">
                    <div className="grid gap-6 sm:grid-cols-2">
                      <div>
                        <Label htmlFor="firstName">{t("step1.firstName")} <span className="text-red-500">*</span></Label>
                        <Input id="firstName" value={contact.firstName}
                          onChange={(e) => setContact(p => ({ ...p, firstName: e.target.value }))}
                          placeholder={t("step1.firstNamePlaceholder")}
                          className={`mt-1 ${errors.firstName ? "border-red-500" : ""}`} />
                        {errors.firstName && <p className="mt-1 text-sm text-red-500">{errors.firstName}</p>}
                      </div>
                      <div>
                        <Label htmlFor="lastName">{t("step1.lastName")} <span className="text-red-500">*</span></Label>
                        <Input id="lastName" value={contact.lastName}
                          onChange={(e) => setContact(p => ({ ...p, lastName: e.target.value }))}
                          placeholder={t("step1.lastNamePlaceholder")}
                          className={`mt-1 ${errors.lastName ? "border-red-500" : ""}`} />
                        {errors.lastName && <p className="mt-1 text-sm text-red-500">{errors.lastName}</p>}
                      </div>
                    </div>
                    <div>
                      <Label htmlFor="email">{t("step1.email")} <span className="text-red-500">*</span></Label>
                      <Input id="email" type="email" value={contact.email}
                        onChange={(e) => setContact(p => ({ ...p, email: e.target.value }))}
                        placeholder={t("step1.emailPlaceholder")}
                        className={`mt-1 ${errors.email ? "border-red-500" : ""}`} />
                      {errors.email && <p className="mt-1 text-sm text-red-500">{errors.email}</p>}
                    </div>
                    <div>
                      <Label htmlFor="phone">{t("step1.phone")} <span className="text-red-500">*</span></Label>
                      <Input id="phone" type="tel" value={contact.phone}
                        onChange={(e) => setContact(p => ({ ...p, phone: e.target.value }))}
                        placeholder={t("step1.phonePlaceholder")}
                        className={`mt-1 ${errors.phone ? "border-red-500" : ""}`} />
                      {errors.phone && <p className="mt-1 text-sm text-red-500">{errors.phone}</p>}
                    </div>

                    {/* Service preview */}
                    <div className="rounded-lg bg-brand-goldLight/20 p-4 border border-brand-gold/30">
                      <div className="flex justify-between items-center">
                        <span className="font-semibold text-brand-dark">{serviceTitle}</span>
                        <span className="text-xl font-bold text-brand-gold">€{svc.price.toFixed(2)}</span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-2">
                      <Button type="button" variant="outline" onClick={() => router.push(`/${locale}/tax-advisory`)} className="flex items-center gap-2">
                        <ArrowLeft className="h-4 w-4" /> {t("step1.backToTaxAdvisory")}
                      </Button>
                      <Button type="submit" className="flex items-center gap-2 bg-brand-gold text-white hover:bg-brand-goldDark">
                        {t("step1.continueToSchedule")} <ArrowRight className="h-4 w-4" />
                      </Button>
                    </div>
                  </form>
                </CardContent>
              </Card>

              <div className="mt-12 grid gap-8 md:grid-cols-3">
                {[
                  { icon: Clock, title: t("step1.feature60min"), desc: t("step1.feature60minDesc") },
                  { icon: Video, title: t("step1.featureVideo"), desc: t("step1.featureVideoDesc") },
                  { icon: Shield, title: t("step1.featureConfidential"), desc: t("step1.featureConfidentialDesc") },
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

          {/* ── STEP 2: Calendly ─────────────────────────────────────────── */}
          {step === "calendar" && (
            <>
              <SectionHeading
                overline={t("step2.overline")}
                title={t("calendly.title")}
                description={t("calendly.subtitle")}
              />
              <Card className="mt-8 border-none shadow-lg">
                <CardContent className="p-4 md:p-8">
                  <div ref={calendlyRef} style={{ minWidth: "320px", height: "700px" }} />
                </CardContent>
              </Card>
              <div className="mt-6 flex justify-start">
                <Button variant="outline" onClick={() => setStep("contact")} className="flex items-center gap-2">
                  <ArrowLeft className="h-4 w-4" /> {t("step2.backToContact")}
                </Button>
              </div>
            </>
          )}

          {/* ── STEP 3: Summary ──────────────────────────────────────────── */}
          {step === "summary" && (
            <>
              <SectionHeading
                overline={t("step3.overline")}
                title={t("step3.title")}
                description={t("step3.description")}
              />

              <Card className="mt-8 border-none shadow-lg">
                <CardContent className="p-8">
                  <h3 className="mb-6 text-xl font-bold text-brand-dark">{t("step3.summary")}</h3>

                  <div className="space-y-4">
                    {/* Contact info */}
                    <div className="rounded-lg bg-gray-50 p-4">
                      <h4 className="mb-3 text-sm font-semibold uppercase tracking-wider text-brand-grayMed">Contact</h4>
                      <div className="space-y-2">
                        <div className="flex items-center gap-3">
                          <User className="h-4 w-4 text-brand-gold flex-shrink-0" />
                          <span className="font-semibold text-brand-dark">{fullName}</span>
                        </div>
                        <div className="flex items-center gap-3">
                          <Mail className="h-4 w-4 text-brand-gold flex-shrink-0" />
                          <span className="text-brand-dark">{contact.email}</span>
                        </div>
                        <div className="flex items-center gap-3">
                          <Phone className="h-4 w-4 text-brand-gold flex-shrink-0" />
                          <span className="text-brand-dark">{contact.phone}</span>
                        </div>
                      </div>
                    </div>

                    {/* Appointment */}
                    <div className="rounded-lg bg-gray-50 p-4">
                      <h4 className="mb-3 text-sm font-semibold uppercase tracking-wider text-brand-grayMed">Appointment</h4>
                      <div className="space-y-2">
                        <div className="flex items-center gap-3">
                          <Calendar className="h-4 w-4 text-brand-gold flex-shrink-0" />
                          <span className="font-semibold text-brand-dark">
                            {dateStr || t("step3.scheduledViaCalendly")}
                          </span>
                        </div>
                        {timeStr && (
                          <div className="flex items-center gap-3">
                            <Clock className="h-4 w-4 text-brand-gold flex-shrink-0" />
                            <span className="text-brand-dark">{timeStr} · {t("step3.durationValue")}</span>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Service & Price */}
                    <div className="rounded-lg border-2 border-brand-gold/30 bg-brand-goldLight/10 p-4">
                      <h4 className="mb-3 text-sm font-semibold uppercase tracking-wider text-brand-grayMed">Service</h4>
                      <div className="flex items-center justify-between">
                        <span className="font-semibold text-brand-dark">{serviceTitle}</span>
                        <span className="text-2xl font-bold text-brand-gold">€{svc.price.toFixed(2)}</span>
                      </div>
                      <div className="mt-2 space-y-1 text-sm text-brand-grayMed">
                        <div className="flex justify-between">
                          <span>{locale === "fr" ? "Hors TVA" : "Excl. VAT"}</span>
                          <span>€{(svc.price / 1.17).toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>TVA 17%</span>
                          <span>€{(svc.price - svc.price / 1.17).toFixed(2)}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="mt-8 flex items-center justify-between">
                    <Button variant="outline" onClick={() => setStep("calendar")} className="flex items-center gap-2">
                      <ArrowLeft className="h-4 w-4" /> {t("step3.backToCalendar")}
                    </Button>
                    <Button onClick={() => setStep("payment")} className="flex items-center gap-2 bg-brand-gold text-white hover:bg-brand-goldDark">
                      <CreditCard className="h-4 w-4" /> {t("step3.proceedToPayment")}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </>
          )}

          {/* ── STEP 4: Payment ──────────────────────────────────────────── */}
          {step === "payment" && (
            <>
              <div className="mb-8 text-center">
                <div className="mb-4 inline-flex h-14 w-14 items-center justify-center rounded-full bg-green-100">
                  <CheckCircle className="h-7 w-7 text-green-600" />
                </div>
                <h2 className="mb-2 text-2xl font-bold text-brand-dark md:text-3xl">
                  {t("step4.slotReserved")}
                </h2>
                <p className="text-brand-grayMed">{t("step4.slotReservedDesc")}</p>
              </div>

              <Card className="border-none shadow-lg">
                <CardContent className="p-8 md:p-12">
                  <div className="text-center">
                    <h3 className="mb-2 text-xl font-bold text-brand-dark">{t("step4.completePayment")}</h3>
                    <p className="text-4xl font-bold text-brand-gold">€{svc.price.toFixed(2)}</p>
                    <p className="mt-2 text-sm text-brand-grayMed">{t("step4.oneTimePayment")}</p>

                    {/* Mini booking recap above PayPal */}
                    <div className="mx-auto mt-6 max-w-sm rounded-lg bg-gray-50 p-4 text-left text-sm">
                      <p className="font-semibold text-brand-dark">{serviceTitle}</p>
                      {dateStr && <p className="text-brand-grayMed">{dateStr}{timeStr ? ` · ${timeStr}` : ""}</p>}
                      <p className="text-brand-grayMed">{fullName} · {contact.email}</p>
                    </div>

                    <div className="mx-auto mt-8 max-w-md">
                      <PayPalButtons
                        amount={svc.price.toFixed(2)}
                        description={`${serviceTitle} – Tax Advisory Consultation`}
                        onSuccess={(orderId, details) => {
                          setPaypal({ orderId: details.id, status: details.status, payer: details.payer });
                          setPaymentDone(true);
                        }}
                      />
                    </div>

                    {paymentDone && (
                      <div className="mt-6 space-y-4">
                        <div className="rounded-lg bg-green-50 p-4 text-green-800">
                          <div className="flex items-center justify-center gap-2">
                            <CheckCircle className="h-5 w-5" />
                            <span className="font-semibold">{t("step4.paymentSuccess")}</span>
                          </div>
                        </div>
                        <div className="flex items-center justify-center gap-2 text-sm text-brand-grayMed">
                          <div className="h-4 w-4 animate-spin rounded-full border-2 border-solid border-brand-gold border-r-transparent" />
                          <span>{loading ? t("step4.processing") : "Confirming your booking…"}</span>
                        </div>
                      </div>
                    )}

                    {!paymentDone && (
                      <Button variant="outline" onClick={() => setStep("summary")}
                        className="mt-4 flex items-center gap-2 mx-auto">
                        <ArrowLeft className="h-4 w-4" /> {t("step4.backToSummary")}
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            </>
          )}
          {/* ── STEP 5: Confirmation ─────────────────────────────────────── */}
          {step === "confirmation" && (
            <>
              {/* Success header */}
              <div className="mb-8 text-center">
                <div className="mb-4 inline-flex h-20 w-20 items-center justify-center rounded-full bg-green-100">
                  <CheckCircle className="h-10 w-10 text-green-600" />
                </div>
                <h2 className="mb-2 text-3xl font-bold text-brand-dark">
                  {tConf("heroTitle")}
                </h2>
                <p className="text-brand-grayMed">{tConf("heroSubtitle")}</p>
                <div className="mt-4 inline-flex items-center gap-2 rounded-full bg-brand-goldLight/30 px-6 py-2">
                  <FileText className="h-4 w-4 text-brand-goldDark" />
                  <span className="font-mono text-sm font-semibold text-brand-goldDark">
                    {tConf("confirmationLabel")} {confirmationNumber}
                  </span>
                </div>
              </div>

              {/* Full summary card */}
              <Card className="mb-6 border-none shadow-lg">
                <CardContent className="p-8">
                  <h3 className="mb-6 text-xl font-bold text-brand-dark">{t("step3.summary")}</h3>
                  <div className="space-y-4">
                    {/* Contact */}
                    <div className="rounded-lg bg-gray-50 p-4">
                      <h4 className="mb-3 text-sm font-semibold uppercase tracking-wider text-brand-grayMed">Contact</h4>
                      <div className="space-y-2">
                        <div className="flex items-center gap-3">
                          <User className="h-4 w-4 flex-shrink-0 text-brand-gold" />
                          <span className="font-semibold text-brand-dark">{fullName}</span>
                        </div>
                        <div className="flex items-center gap-3">
                          <Mail className="h-4 w-4 flex-shrink-0 text-brand-gold" />
                          <span className="text-brand-dark">{contact.email}</span>
                        </div>
                        <div className="flex items-center gap-3">
                          <Phone className="h-4 w-4 flex-shrink-0 text-brand-gold" />
                          <span className="text-brand-dark">{contact.phone}</span>
                        </div>
                      </div>
                    </div>

                    {/* Appointment */}
                    <div className="rounded-lg bg-gray-50 p-4">
                      <h4 className="mb-3 text-sm font-semibold uppercase tracking-wider text-brand-grayMed">Appointment</h4>
                      <div className="space-y-2">
                        <div className="flex items-center gap-3">
                          <Calendar className="h-4 w-4 flex-shrink-0 text-brand-gold" />
                          <span className="font-semibold text-brand-dark">
                            {dateStr || t("step3.scheduledViaCalendly")}
                          </span>
                        </div>
                        {timeStr && (
                          <div className="flex items-center gap-3">
                            <Clock className="h-4 w-4 flex-shrink-0 text-brand-gold" />
                            <span className="text-brand-dark">{timeStr} · {t("step3.durationValue")}</span>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Service & Price */}
                    <div className="rounded-lg border-2 border-brand-gold/30 bg-brand-goldLight/10 p-4">
                      <h4 className="mb-3 text-sm font-semibold uppercase tracking-wider text-brand-grayMed">Service</h4>
                      <div className="flex items-center justify-between">
                        <span className="font-semibold text-brand-dark">{serviceTitle}</span>
                        <span className="text-2xl font-bold text-brand-gold">€{svc.price.toFixed(2)}</span>
                      </div>
                    </div>

                    {/* Payment */}
                    <div className="rounded-lg bg-green-50 p-4">
                      <h4 className="mb-3 text-sm font-semibold uppercase tracking-wider text-green-700">Payment</h4>
                      <div className="flex items-center justify-between">
                        <span className="text-green-800">PayPal</span>
                        <span className="flex items-center gap-2 font-semibold text-green-700">
                          <CheckCircle className="h-4 w-4" /> {paypal.status || "PAID"}
                        </span>
                      </div>
                      {paypal.orderId && (
                        <p className="mt-1 text-xs text-green-700">Order ID: {paypal.orderId}</p>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Action buttons */}
              <div className="grid gap-4 sm:grid-cols-2 mb-6">
                <Button
                  onClick={handleDownloadReceipt}
                  className="h-14 bg-brand-gold text-white hover:bg-brand-goldDark"
                >
                  <Download className="mr-2 h-5 w-5" />
                  {tConf("downloadPDFReceipt")}
                </Button>
                <Button
                  variant="outline"
                  onClick={() => router.push(`/${locale}/tax-advisory`)}
                  className="h-14 border-brand-gold text-brand-gold hover:bg-brand-goldLight/10"
                >
                  {tConf("backToTaxAdvisory")}
                </Button>
              </div>

              {/* What happens next */}
              <Card className="border-2 border-blue-200 bg-blue-50">
                <CardContent className="p-6">
                  <h3 className="mb-4 text-lg font-bold text-blue-900">{tConf("whatHappensNext.title")}</h3>
                  <ul className="space-y-3">
                    {([
                      { title: tConf("whatHappensNext.step1.title"), desc: tConf("whatHappensNext.step1.description") },
                      { title: tConf("whatHappensNext.step2.title"), desc: tConf("whatHappensNext.step2.description") },
                      { title: tConf("whatHappensNext.step3.title"), desc: tConf("whatHappensNext.step3.description") },
                      { title: tConf("whatHappensNext.step4.title"), desc: tConf("whatHappensNext.step4.description") },
                    ]).map(({ title, desc }, i) => (
                      <li key={i} className="flex items-start gap-3">
                        <div className="inline-flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-blue-600 text-white text-sm font-bold mt-0.5">
                          {i + 1}
                        </div>
                        <div>
                          <p className="font-semibold text-blue-900">{title}</p>
                          <p className="text-sm text-blue-800">{desc}</p>
                        </div>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            </>
          )}

        </div>
      </section>

      <Script
        src="https://assets.calendly.com/assets/external/widget.js"
        strategy="afterInteractive"
        onLoad={() => setCalendlyLoaded(true)}
      />
    </>
  );
}
