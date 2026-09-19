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
import { useState, useEffect, useRef } from "react";
import { PayPalButtons } from "@/components/paypal-buttons";
import {
  CheckCircle, Clock, Video, Shield,
  ArrowLeft, ArrowRight, Calendar, User, Mail, Phone, CreditCard,
  Download, FileText, Sparkles, ExternalLink, AlertCircle
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

type Step = "contact" | "payment" | "calendar" | "confirmation";

interface ContactData { firstName: string; lastName: string; email: string; phone: string; }
interface CalendlyData {
  eventUri?: string;
  inviteeUri?: string;
  startTime?: string;
  endTime?: string;
  meetingLink?: string;
}
interface PaypalData { orderId?: string; status?: string; payer?: any; amount?: number; }

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
  const calendlyUrl = locale === "fr"
    ? "https://calendly.com/opulanz-banking/conseil-fiscal"
    : "https://calendly.com/opulanz-banking/tax-advisory";

  // Sequence: contact -> payment -> calendar -> confirmation
  const [step, setStep] = useState<Step>("contact");
  const [contact, setContact] = useState<ContactData>({ firstName: "", lastName: "", email: "", phone: "" });
  const [errors, setErrors] = useState<Partial<ContactData>>({});
  const [calendly, setCalendly] = useState<CalendlyData>({});
  const [paypal, setPaypal] = useState<PaypalData>({});
  const [bookingId, setBookingId] = useState<number | string | null>(null);
  const [confirmationNumber, setConfirmationNumber] = useState<string>("");
  const [paymentDone, setPaymentDone] = useState(false);
  const [isSavingPayment, setIsSavingPayment] = useState(false);
  const [isSavingAppointment, setIsSavingAppointment] = useState(false);
  const [calendlyLoaded, setCalendlyLoaded] = useState(false);
  const [lastSelectedSlot, setLastSelectedSlot] = useState<string | null>(null);

  const fullName = `${contact.firstName} ${contact.lastName}`.trim();
  const dateStr = fmtDate(calendly.startTime || lastSelectedSlot || undefined, locale);
  const timeStr = fmtTime(calendly.startTime || lastSelectedSlot || undefined, locale);

  const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

  async function fetchWithTimeout(url: string, options: RequestInit, ms = 7000) {
    const controller = new AbortController();
    const id = setTimeout(() => controller.abort(), ms);
    try {
      return await fetch(url, { ...options, signal: controller.signal });
    } finally {
      clearTimeout(id);
    }
  }

  // ── Step 1: Validate contact & Proceed to Payment ─────────────────────────
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
    setStep("payment");
  }

  // ── Step 2: Payment Success -> Save Details in DB -> Move to Calendly ─────
  async function handlePaymentSuccess(orderId: string, details: any) {
    setIsSavingPayment(true);
    const paymentDate = new Date().toISOString();
    const paypalData: PaypalData = {
      orderId: details.id || orderId,
      status: details.status || "COMPLETED",
      payer: details.payer || {},
      amount: svc.price,
    };
    setPaypal(paypalData);
    setPaymentDone(true);

    let confNum = `TAX-${Date.now().toString(36).toUpperCase()}`;
    let savedBookingId: number | string | null = null;

    // 1. Save Initial Booking to DB with Payment Info
    try {
      const res = await fetchWithTimeout(`${API}/api/tax-advisory-bookings`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: "tax_advisory",
          status: "confirmed",
          customer_info: {
            firstName: contact.firstName,
            lastName: contact.lastName,
            email: contact.email,
            phone: contact.phone,
          },
          service: {
            id: serviceId || "tax-advisory",
            title: serviceTitle,
            price: svc.price,
          },
          appointment: {
            status: "pending_schedule",
            paymentDate,
          },
          payment: {
            method: "paypal",
            orderId: paypalData.orderId,
            status: paypalData.status,
            amount: svc.price,
            payer: paypalData.payer,
            paid_at: paymentDate,
          },
        }),
      });
      const data = await res.json();
      if (data.success && data.data) {
        if (data.data.confirmation_number) confNum = data.data.confirmation_number;
        if (data.data.id) savedBookingId = data.data.id;
      }
    } catch (err) {
      console.warn("Initial tax booking save warning:", err);
    }

    setConfirmationNumber(confNum);
    setBookingId(savedBookingId);

    // Save preliminary booking info to sessionStorage
    try {
      sessionStorage.setItem("tax-advisory-booking", JSON.stringify({
        firstName: contact.firstName,
        lastName: contact.lastName,
        email: contact.email,
        phone: contact.phone,
        serviceId,
        serviceTitle,
        servicePrice: svc.price,
        confirmationNumber: confNum,
        bookingId: savedBookingId,
        paypalOrderId: paypalData.orderId,
        paypalStatus: paypalData.status,
        paypalPayer: paypalData.payer,
        paymentDate,
        appointmentStatus: "pending_schedule",
      }));
    } catch (e) {
      console.warn("sessionStorage save error:", e);
    }

    setIsSavingPayment(false);
    // Proceed to Calendly scheduler
    setStep("calendar");
  }

  // ── Step 3: Load Calendly script when calendar step is active ─────────────
  useEffect(() => {
    if (step !== "calendar") return;
    const win = window as any;
    if (win.Calendly) {
      win.Calendly.initInlineWidgets?.();
      setCalendlyLoaded(true);
      return;
    }
    const existing = document.querySelector('script[src="https://assets.calendly.com/assets/external/widget.js"]');
    if (existing) {
      const poll = setInterval(() => {
        if ((window as any).Calendly) {
          clearInterval(poll);
          (window as any).Calendly.initInlineWidgets?.();
          setCalendlyLoaded(true);
        }
      }, 100);
      return () => clearInterval(poll);
    }
    const script = document.createElement("script");
    script.src = "https://assets.calendly.com/assets/external/widget.js";
    script.async = true;
    script.onload = () => {
      (window as any).Calendly?.initInlineWidgets?.();
      setCalendlyLoaded(true);
    };
    document.head.appendChild(script);
  }, [step]);

  // Re-init widget when step or contact details change
  useEffect(() => {
    if (step === "calendar" && (window as any).Calendly?.initInlineWidgets) {
      const timer = setTimeout(() => {
        (window as any).Calendly.initInlineWidgets();
      }, 50);
      return () => clearTimeout(timer);
    }
  }, [step, fullName, contact.email]);

  // ── Calendly event listener (Capture date, time, and scheduled event) ─────
  useEffect(() => {
    const handleMessage = async (e: MessageEvent) => {
      // 1. Capture date/time selection if emitted
      if (e.data?.event === "calendly.date_and_time_selected") {
        const slot = e.data?.payload?.date_and_time;
        if (slot) setLastSelectedSlot(slot);
      }

      // 2. Capture final event_scheduled
      if (e.data?.event === "calendly.event_scheduled") {
        const p = e.data.payload || {};
        const eventUri = p.event?.uri || "";
        const inviteeUri = p.invitee?.uri || "";
        const startTime = p.event?.start_time || lastSelectedSlot || new Date().toISOString();
        const endTime = p.event?.end_time || (startTime ? new Date(new Date(startTime).getTime() + 3600000).toISOString() : "");

        const eventUuidMatch = typeof eventUri === "string" ? eventUri.match(/scheduled_events\/([a-f0-9\-]+)/i) : null;
        const googleMeetUrl = eventUuidMatch && eventUuidMatch[1]
          ? `https://calendly.com/events/${eventUuidMatch[1]}/google_meet`
          : "";
        const meetingLink = googleMeetUrl || p.event?.location || eventUri || "Calendar invite & Google Meet link sent to your email";

        const calendlyData: CalendlyData = {
          eventUri,
          inviteeUri,
          startTime,
          endTime,
          meetingLink,
        };
        setCalendly(calendlyData);
        setIsSavingAppointment(true);

        const currentConf = confirmationNumber || `TAX-${Date.now().toString(36).toUpperCase()}`;
        const targetId = bookingId || currentConf;

        // Update booking in DB with appointment details
        try {
          await fetchWithTimeout(`${API}/api/tax-advisory-bookings/${targetId}`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              status: "confirmed",
              appointment: {
                date: startTime,
                time: fmtTime(startTime, locale) || "",
                endTime,
                calendlyEventUrl: eventUri,
                calendlyInviteeUrl: inviteeUri,
                meetingLink,
                status: "scheduled",
              },
            }),
          });
        } catch (err) {
          console.warn("DB Booking update with appointment failed:", err);
        }

        // Update sessionStorage
        try {
          sessionStorage.setItem("tax-advisory-booking", JSON.stringify({
            firstName: contact.firstName,
            lastName: contact.lastName,
            email: contact.email,
            phone: contact.phone,
            serviceId,
            serviceTitle,
            servicePrice: svc.price,
            appointmentDate: startTime,
            appointmentTime: fmtTime(startTime, locale) || "",
            appointmentEndTime: endTime,
            calendlyEventUrl: eventUri,
            calendlyInviteeUrl: inviteeUri,
            meetingLink,
            confirmationNumber: currentConf,
            paypalOrderId: paypal.orderId,
            paypalStatus: paypal.status,
            paypalPayer: paypal.payer,
            paymentDate: new Date().toISOString(),
          }));
        } catch (e) {
          console.warn("sessionStorage update error:", e);
        }

        setIsSavingAppointment(false);
        setStep("confirmation");
      }
    };

    window.addEventListener("message", handleMessage);
    return () => window.removeEventListener("message", handleMessage);
  }, [bookingId, confirmationNumber, contact, fullName, lastSelectedSlot, locale, paypal, serviceId, serviceTitle, svc.price, API]);

  // ── Download Receipt ───────────────────────────────────────────────────────
  function handleDownloadReceipt() {
    const confNo = confirmationNumber || `TAX-${Date.now().toString(36).toUpperCase()}`;
    const receiptHTML = `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>Opulanz Banking - Payment Receipt</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif; max-width: 800px; margin: 0 auto; padding: 40px; color: #252623; background: #fff; }
    .header { text-align: center; margin-bottom: 30px; border-bottom: 3px solid #b59354; padding-bottom: 20px; }
    .logo { font-size: 28px; font-weight: bold; letter-spacing: 2px; color: #b59354; margin-bottom: 6px; }
    .subtitle { color: #949ea3; font-size: 14px; text-transform: uppercase; letter-spacing: 1px; }
    .receipt-title { font-size: 22px; font-weight: bold; color: #252623; margin-top: 15px; }
    .conf-box { background: #f6f8f8; padding: 16px; margin: 20px 0; border-left: 4px solid #b59354; border-radius: 4px; font-family: monospace; font-size: 16px; }
    .section { margin: 24px 0; }
    .section-title { font-size: 14px; font-weight: bold; text-transform: uppercase; letter-spacing: 1px; color: #949ea3; margin-bottom: 12px; border-bottom: 1px solid #e5e7eb; padding-bottom: 6px; }
    .detail-row { display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid #f6f8f8; }
    .detail-label { color: #6b7280; font-size: 14px; }
    .detail-value { color: #252623; font-weight: 600; font-size: 14px; text-align: right; }
    .total-box { background: #f6f8f8; padding: 16px; margin-top: 20px; border-radius: 8px; display: flex; justify-content: space-between; align-items: center; }
    .total-label { font-size: 16px; font-weight: bold; color: #252623; }
    .total-value { font-size: 24px; font-weight: bold; color: #b59354; }
    .status-badge { display: inline-block; background: #10b981; color: white; padding: 4px 12px; border-radius: 20px; font-size: 12px; font-weight: bold; }
    .footer { margin-top: 40px; text-align: center; color: #949ea3; font-size: 12px; border-top: 1px solid #e5e7eb; padding-top: 20px; }
    .print-box { background: #eff6ff; border: 1px solid #bfdbfe; border-radius: 8px; padding: 16px; margin-bottom: 24px; text-align: center; }
    .print-btn { background: #b59354; color: white; border: none; padding: 10px 20px; border-radius: 6px; font-size: 14px; font-weight: bold; cursor: pointer; margin-top: 8px; }
    @media print { body { padding: 20px; } .print-box { display: none; } }
  </style>
</head>
<body>
  <div class="print-box">
    <p style="margin:0 0 8px 0; color:#1e40af; font-weight:bold;">Print or Save as PDF</p>
    <button class="print-btn" onclick="window.print()">Print Receipt</button>
  </div>
  <div class="header">
    <div class="logo">OPULANZ BANKING</div>
    <div class="subtitle">Luxembourg Financial & Tax Advisory Services</div>
    <div class="receipt-title">PAYMENT RECEIPT</div>
  </div>
  <div class="conf-box">
    <strong>Confirmation Number:</strong> ${confNo}
  </div>
  <div class="section">
    <div class="section-title">Client Information</div>
    <div class="detail-row"><span class="detail-label">Client Name:</span><span class="detail-value">${fullName}</span></div>
    <div class="detail-row"><span class="detail-label">Email Address:</span><span class="detail-value">${contact.email}</span></div>
    <div class="detail-row"><span class="detail-label">Phone Number:</span><span class="detail-value">${contact.phone}</span></div>
  </div>
  <div class="section">
    <div class="section-title">Consultation Service</div>
    <div class="detail-row"><span class="detail-label">Service:</span><span class="detail-value">${serviceTitle}</span></div>
    <div class="detail-row"><span class="detail-label">Duration:</span><span class="detail-value">60 Minutes</span></div>
    ${dateStr ? `<div class="detail-row"><span class="detail-label">Scheduled Date:</span><span class="detail-value">${dateStr}</span></div>` : ""}
    ${timeStr ? `<div class="detail-row"><span class="detail-label">Scheduled Time:</span><span class="detail-value">${timeStr}</span></div>` : ""}
    <div class="detail-row"><span class="detail-label">Net Fee (excl. VAT):</span><span class="detail-value">&euro;${(svc.price / 1.17).toFixed(2)}</span></div>
    <div class="detail-row"><span class="detail-label">VAT (17% Luxembourg):</span><span class="detail-value">&euro;${(svc.price - svc.price / 1.17).toFixed(2)}</span></div>
  </div>
  <div class="total-box">
    <span class="total-label">Total Paid:</span>
    <span class="total-value">&euro;${svc.price.toFixed(2)}</span>
  </div>
  <div class="section">
    <div class="section-title">Payment Information</div>
    <div class="detail-row"><span class="detail-label">Payment Method:</span><span class="detail-value">PayPal</span></div>
    ${paypal.orderId ? `<div class="detail-row"><span class="detail-label">PayPal Order ID:</span><span class="detail-value">${paypal.orderId}</span></div>` : ""}
    <div class="detail-row"><span class="detail-label">Payment Status:</span><span class="detail-value"><span class="status-badge">${paypal.status || "PAID"}</span></span></div>
    <div class="detail-row"><span class="detail-label">Payment Date:</span><span class="detail-value">${new Date().toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })}</span></div>
  </div>
  <div class="footer">
    <p><strong>Thank you for choosing Opulanz Banking.</strong></p>
    <p>If you have any questions regarding your consultation, please contact support@opulanz.com</p>
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

  // ── Progress Steps Configuration ──────────────────────────────────────────
  const stepsList: { key: Step; label: string }[] = [
    { key: "contact", label: "1. Details" },
    { key: "payment", label: "2. Payment" },
    { key: "calendar", label: "3. Schedule" },
    { key: "confirmation", label: "4. Confirmed" },
  ];
  const currentStepIdx = stepsList.findIndex((s) => s.key === step);

  return (
    <>
      <PageGuidance
        pageKey="tax-advisory-booking"
        locale={locale}
        title="Tax Advisory Booking"
        description="Provide details, complete consultation payment, and schedule your appointment with a certified advisor."
        steps={[
          { content: "Step 1: Enter your personal details and review the consultation fee." },
          { content: "Step 2: Pay securely with PayPal or debit card. Your booking is instantly recorded in our database." },
          { content: "Step 3: Select your preferred consultation date and time directly on our Calendly scheduler." },
          { content: "Step 4: Receive your meeting confirmation and Google Meet link." },
        ]}
        tip="Your consultation slot and meeting invitation will be sent to your email immediately upon scheduling."
      />

      <Hero
        title={t("heroTitle")}
        subtitle={t("heroSubtitle", { service: serviceTitle })}
      />

      <section className="bg-brand-off py-12">
        <div className="container mx-auto max-w-4xl px-6">

          {/* Stepper Progress Bar */}
          <div className="mb-10">
            <div className="flex items-center justify-between max-w-2xl mx-auto">
              {stepsList.map((s, idx) => {
                const isCompleted = idx < currentStepIdx;
                const isCurrent = idx === currentStepIdx;
                return (
                  <React.Fragment key={s.key}>
                    <div className="flex flex-col items-center">
                      <div
                        className={`flex h-10 w-10 items-center justify-center rounded-full text-sm font-bold transition-all shadow-sm ${
                          isCompleted
                            ? "bg-emerald-600 text-white"
                            : isCurrent
                            ? "bg-brand-gold text-white ring-4 ring-brand-gold/20"
                            : "bg-white border border-brand-grayLight text-brand-grayMed"
                        }`}
                      >
                        {isCompleted ? <CheckCircle className="h-5 w-5" /> : idx + 1}
                      </div>
                      <span
                        className={`mt-2 text-xs font-semibold ${
                          isCurrent
                            ? "text-brand-dark"
                            : isCompleted
                            ? "text-emerald-700"
                            : "text-brand-grayMed"
                        }`}
                      >
                        {s.label}
                      </span>
                    </div>
                    {idx < stepsList.length - 1 && (
                      <div
                        className={`h-1 flex-1 mx-3 rounded transition-all ${
                          idx < currentStepIdx ? "bg-emerald-600" : "bg-brand-grayLight/60"
                        }`}
                      />
                    )}
                  </React.Fragment>
                );
              })}
            </div>
          </div>

          {/* ═════════════════════════════════════════════════════════════════ */}
          {/* STEP 1: Basic Details Form                                        */}
          {/* ═════════════════════════════════════════════════════════════════ */}
          {step === "contact" && (
            <>
              <SectionHeading
                overline="STEP 1 OF 3"
                title={t("step1.title")}
                description={t("step1.description")}
              />
              <Card className="mt-8 border border-brand-grayLight/40 bg-white shadow-md rounded-2xl">
                <CardContent className="p-8">
                  <form onSubmit={handleContactSubmit} className="space-y-6">
                    <div className="grid gap-6 sm:grid-cols-2">
                      <div>
                        <Label htmlFor="firstName" className="text-brand-dark font-medium">
                          {t("step1.firstName")} <span className="text-red-500">*</span>
                        </Label>
                        <Input
                          id="firstName"
                          value={contact.firstName}
                          onChange={(e) => setContact((p) => ({ ...p, firstName: e.target.value }))}
                          placeholder={t("step1.firstNamePlaceholder")}
                          className={`mt-1 bg-white border-brand-grayLight/60 focus:border-brand-gold ${errors.firstName ? "border-red-500" : ""}`}
                        />
                        {errors.firstName && <p className="mt-1 text-xs text-red-500">{errors.firstName}</p>}
                      </div>
                      <div>
                        <Label htmlFor="lastName" className="text-brand-dark font-medium">
                          {t("step1.lastName")} <span className="text-red-500">*</span>
                        </Label>
                        <Input
                          id="lastName"
                          value={contact.lastName}
                          onChange={(e) => setContact((p) => ({ ...p, lastName: e.target.value }))}
                          placeholder={t("step1.lastNamePlaceholder")}
                          className={`mt-1 bg-white border-brand-grayLight/60 focus:border-brand-gold ${errors.lastName ? "border-red-500" : ""}`}
                        />
                        {errors.lastName && <p className="mt-1 text-xs text-red-500">{errors.lastName}</p>}
                      </div>
                    </div>

                    <div>
                      <Label htmlFor="email" className="text-brand-dark font-medium">
                        {t("step1.email")} <span className="text-red-500">*</span>
                      </Label>
                      <Input
                        id="email"
                        type="email"
                        value={contact.email}
                        onChange={(e) => setContact((p) => ({ ...p, email: e.target.value }))}
                        placeholder={t("step1.emailPlaceholder")}
                        className={`mt-1 bg-white border-brand-grayLight/60 focus:border-brand-gold ${errors.email ? "border-red-500" : ""}`}
                      />
                      {errors.email && <p className="mt-1 text-xs text-red-500">{errors.email}</p>}
                    </div>

                    <div>
                      <Label htmlFor="phone" className="text-brand-dark font-medium">
                        {t("step1.phone")} <span className="text-red-500">*</span>
                      </Label>
                      <Input
                        id="phone"
                        type="tel"
                        value={contact.phone}
                        onChange={(e) => setContact((p) => ({ ...p, phone: e.target.value }))}
                        placeholder={t("step1.phonePlaceholder")}
                        className={`mt-1 bg-white border-brand-grayLight/60 focus:border-brand-gold ${errors.phone ? "border-red-500" : ""}`}
                      />
                      {errors.phone && <p className="mt-1 text-xs text-red-500">{errors.phone}</p>}
                    </div>

                    {/* Service & Price Banner */}
                    <div className="rounded-xl bg-brand-off p-5 border border-brand-gold/30 flex items-center justify-between">
                      <div>
                        <p className="text-xs uppercase tracking-wider text-brand-grayMed font-semibold">Selected Consultation</p>
                        <h4 className="text-base font-bold text-brand-dark mt-0.5">{serviceTitle}</h4>
                        <p className="text-xs text-brand-grayMed mt-1">60-minute confidential 1-on-1 session with tax advisor</p>
                      </div>
                      <div className="text-right">
                        <span className="text-2xl font-bold text-brand-gold">€{svc.price.toFixed(2)}</span>
                        <p className="text-[11px] text-brand-grayMed">incl. VAT</p>
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-4 border-t border-brand-grayLight/30">
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => router.push(`/${locale}/tax-advisory`)}
                        className="border-brand-grayLight/60 text-brand-dark hover:bg-brand-off"
                      >
                        <ArrowLeft className="h-4 w-4 mr-2" /> {t("step1.backToTaxAdvisory")}
                      </Button>
                      <Button
                        type="submit"
                        className="bg-brand-gold text-white hover:bg-brand-goldDark font-semibold px-6 shadow-sm"
                      >
                        Proceed to Payment <ArrowRight className="h-4 w-4 ml-2" />
                      </Button>
                    </div>
                  </form>
                </CardContent>
              </Card>

              {/* Service Features Highlights */}
              <div className="mt-12 grid gap-6 md:grid-cols-3">
                {[
                  { icon: Clock, title: t("step1.feature60min"), desc: t("step1.feature60minDesc") },
                  { icon: Video, title: t("step1.featureVideo"), desc: t("step1.featureVideoDesc") },
                  { icon: Shield, title: t("step1.featureConfidential"), desc: t("step1.featureConfidentialDesc") },
                ].map(({ icon: Icon, title, desc }) => (
                  <div key={title} className="text-center p-6 rounded-2xl bg-white border border-brand-grayLight/30 shadow-sm">
                    <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-full bg-brand-gold/10">
                      <Icon className="h-6 w-6 text-brand-gold" />
                    </div>
                    <h3 className="mb-1 text-base font-bold text-brand-dark">{title}</h3>
                    <p className="text-xs text-brand-grayMed leading-relaxed">{desc}</p>
                  </div>
                ))}
              </div>
            </>
          )}

          {/* ═════════════════════════════════════════════════════════════════ */}
          {/* STEP 2: Payment (Save to DB once done -> Proceed to Calendly)    */}
          {/* ═════════════════════════════════════════════════════════════════ */}
          {step === "payment" && (
            <>
              <SectionHeading
                overline="STEP 2 OF 3"
                title="Consultation Payment"
                description="Complete your secure payment. Once confirmed, you will pick your consultation time slot."
              />

              <div className="mt-8 grid gap-8 md:grid-cols-3">
                {/* Left: Booking & Client Summary */}
                <div className="md:col-span-1 space-y-4">
                  <Card className="border border-brand-grayLight/40 bg-white shadow-sm rounded-2xl">
                    <CardContent className="p-6 space-y-4">
                      <h4 className="text-xs font-bold uppercase tracking-wider text-brand-grayMed">Consultation Details</h4>
                      <div>
                        <p className="font-bold text-brand-dark text-base">{serviceTitle}</p>
                        <p className="text-xs text-brand-grayMed mt-0.5">60 Minutes Session</p>
                      </div>

                      <div className="pt-3 border-t border-brand-grayLight/30 space-y-2 text-xs">
                        <div className="flex justify-between">
                          <span className="text-brand-grayMed">Fee (excl. VAT)</span>
                          <span className="font-medium text-brand-dark">€{(svc.price / 1.17).toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-brand-grayMed">VAT (17%)</span>
                          <span className="font-medium text-brand-dark">€{(svc.price - svc.price / 1.17).toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between pt-2 border-t border-brand-grayLight/30 text-sm font-bold">
                          <span className="text-brand-dark">Total Amount</span>
                          <span className="text-brand-gold text-lg">€{svc.price.toFixed(2)}</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="border border-brand-grayLight/40 bg-white shadow-sm rounded-2xl">
                    <CardContent className="p-6 space-y-3">
                      <h4 className="text-xs font-bold uppercase tracking-wider text-brand-grayMed">Client Information</h4>
                      <div className="space-y-1.5 text-xs">
                        <p className="font-semibold text-brand-dark flex items-center gap-2">
                          <User className="h-3.5 w-3.5 text-brand-gold" /> {fullName}
                        </p>
                        <p className="text-brand-grayMed flex items-center gap-2">
                          <Mail className="h-3.5 w-3.5 text-brand-gold" /> {contact.email}
                        </p>
                        <p className="text-brand-grayMed flex items-center gap-2">
                          <Phone className="h-3.5 w-3.5 text-brand-gold" /> {contact.phone}
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* Right: PayPal Payment Box */}
                <div className="md:col-span-2">
                  <Card className="border border-brand-grayLight/40 bg-white shadow-md rounded-2xl">
                    <CardContent className="p-8 text-center">
                      <div className="mb-6">
                        <div className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-brand-gold/10 mb-3">
                          <CreditCard className="h-6 w-6 text-brand-gold" />
                        </div>
                        <h3 className="text-xl font-bold text-brand-dark">Complete Secure Payment</h3>
                        <p className="text-xs text-brand-grayMed mt-1">
                          Pay securely via PayPal, Credit, or Debit card to confirm your booking.
                        </p>
                      </div>

                      {/* PayPal Button Container */}
                      <div className="max-w-md mx-auto my-4">
                        <PayPalButtons
                          amount={svc.price.toFixed(2)}
                          description={`${serviceTitle} – Opulanz Tax Advisory`}
                          onSuccess={(orderId, details) => {
                            handlePaymentSuccess(orderId, details);
                          }}
                        />
                      </div>

                      {isSavingPayment && (
                        <div className="mt-6 flex flex-col items-center gap-2 text-sm text-brand-grayMed">
                          <div className="h-6 w-6 animate-spin rounded-full border-2 border-brand-gold border-t-transparent" />
                          <p className="font-medium text-brand-dark">Recording payment & preparing scheduler…</p>
                        </div>
                      )}

                      {!isSavingPayment && (
                        <div className="mt-6 flex justify-start border-t border-brand-grayLight/30 pt-4">
                          <Button
                            variant="outline"
                            onClick={() => setStep("contact")}
                            className="border-brand-grayLight/60 text-brand-dark hover:bg-brand-off"
                          >
                            <ArrowLeft className="h-4 w-4 mr-2" /> Back to Details
                          </Button>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </div>
              </div>
            </>
          )}

          {/* ═════════════════════════════════════════════════════════════════ */}
          {/* STEP 3: Calendly Scheduling (After Payment)                      */}
          {/* ═════════════════════════════════════════════════════════════════ */}
          {step === "calendar" && (
            <>
              {/* Payment Success & Instruction Banner */}
              <div className="mb-6 rounded-2xl bg-emerald-50 border border-emerald-200 p-6 shadow-sm">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-full bg-emerald-600 flex items-center justify-center text-white flex-shrink-0">
                      <CheckCircle className="h-6 w-6" />
                    </div>
                    <div>
                      <h3 className="font-bold text-emerald-950 text-base">Payment Confirmed (€{svc.price.toFixed(2)})</h3>
                      <p className="text-xs text-emerald-800 mt-0.5">
                        Confirmation #{confirmationNumber} • Please pick your date and time below to finalize your meeting.
                      </p>
                    </div>
                  </div>
                  <div className="text-xs font-mono bg-white px-3 py-1.5 rounded-lg border border-emerald-200 text-emerald-900">
                    Client: {fullName}
                  </div>
                </div>
              </div>

              <SectionHeading
                overline="STEP 3 OF 3"
                title="Select Consultation Date & Time"
                description={`Choose your preferred slot. A calendar invitation and Google Meet link will be generated automatically.`}
              />

              <Card className="mt-6 border border-brand-grayLight/40 bg-white shadow-md rounded-2xl overflow-hidden">
                <CardContent className="p-4 md:p-6">
                  {!calendlyLoaded && (
                    <div className="flex h-96 flex-col items-center justify-center gap-3">
                      <div className="h-8 w-8 animate-spin rounded-full border-4 border-brand-gold border-r-transparent" />
                      <p className="text-xs text-brand-grayMed">Loading Calendly calendar…</p>
                    </div>
                  )}
                  <div
                    key={locale}
                    className="calendly-inline-widget"
                    data-url={`${calendlyUrl}?hide_event_type_details=1&primary_color=b59354&name=${encodeURIComponent(fullName)}&email=${encodeURIComponent(contact.email)}`}
                    style={{ minWidth: "320px", height: "720px" }}
                  />
                </CardContent>
              </Card>

              {isSavingAppointment && (
                <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center">
                  <div className="bg-white p-6 rounded-2xl shadow-xl flex flex-col items-center gap-3 text-center max-w-sm">
                    <div className="h-8 w-8 animate-spin rounded-full border-4 border-brand-gold border-r-transparent" />
                    <p className="font-bold text-brand-dark">Saving Meeting Details…</p>
                    <p className="text-xs text-brand-grayMed">We are linking your scheduled slot with your booking record in our system.</p>
                  </div>
                </div>
              )}
            </>
          )}

          {/* ═════════════════════════════════════════════════════════════════ */}
          {/* STEP 4: Confirmation & Receipt                                    */}
          {/* ═════════════════════════════════════════════════════════════════ */}
          {step === "confirmation" && (
            <>
              {/* Success Hero Badge */}
              <div className="mb-8 text-center">
                <div className="mb-4 inline-flex h-20 w-20 items-center justify-center rounded-full bg-emerald-100 text-emerald-600 shadow-sm">
                  <CheckCircle className="h-10 w-10" />
                </div>
                <h2 className="text-3xl font-bold text-brand-dark">
                  {tConf("heroTitle")}
                </h2>
                <p className="text-brand-grayMed mt-1 text-sm max-w-lg mx-auto">
                  Your tax consultation has been booked, paid, and scheduled with our certified tax advisor.
                </p>
                <div className="mt-4 inline-flex items-center gap-2 rounded-full bg-brand-gold/10 border border-brand-gold/30 px-6 py-2">
                  <FileText className="h-4 w-4 text-brand-gold" />
                  <span className="font-mono text-sm font-bold text-brand-dark">
                    Confirmation #{confirmationNumber}
                  </span>
                </div>
              </div>

              {/* Full Summary Card */}
              <Card className="mb-6 border border-brand-grayLight/40 bg-white shadow-md rounded-2xl">
                <CardContent className="p-8 space-y-6">
                  <h3 className="text-lg font-bold text-brand-dark border-b border-brand-grayLight/30 pb-3">
                    Booking & Meeting Summary
                  </h3>

                  <div className="grid gap-6 md:grid-cols-2">
                    {/* Contact details */}
                    <div className="rounded-xl bg-brand-off p-5 border border-brand-grayLight/30">
                      <h4 className="text-xs font-bold uppercase tracking-wider text-brand-grayMed mb-3">Client Details</h4>
                      <div className="space-y-2 text-sm">
                        <div className="flex items-center gap-2.5">
                          <User className="h-4 w-4 text-brand-gold flex-shrink-0" />
                          <span className="font-semibold text-brand-dark">{fullName}</span>
                        </div>
                        <div className="flex items-center gap-2.5">
                          <Mail className="h-4 w-4 text-brand-gold flex-shrink-0" />
                          <span className="text-brand-dark">{contact.email}</span>
                        </div>
                        <div className="flex items-center gap-2.5">
                          <Phone className="h-4 w-4 text-brand-gold flex-shrink-0" />
                          <span className="text-brand-dark">{contact.phone}</span>
                        </div>
                      </div>
                    </div>

                    {/* Appointment details */}
                    <div className="rounded-xl bg-brand-off p-5 border border-brand-grayLight/30">
                      <h4 className="text-xs font-bold uppercase tracking-wider text-brand-grayMed mb-3">Scheduled Consultation</h4>
                      <div className="space-y-2 text-sm">
                        <div className="flex items-center gap-2.5">
                          <Calendar className="h-4 w-4 text-brand-gold flex-shrink-0" />
                          <span className="font-semibold text-brand-dark">
                            {dateStr || "Calendar Invitation Sent"}
                          </span>
                        </div>
                        {timeStr ? (
                          <div className="flex items-center gap-2.5">
                            <Clock className="h-4 w-4 text-brand-gold flex-shrink-0" />
                            <span className="text-brand-dark">{timeStr} · 60 Minutes</span>
                          </div>
                        ) : null}
                        <div className="flex items-center gap-2.5">
                          <Video className="h-4 w-4 text-brand-gold flex-shrink-0" />
                          <span className="text-xs text-brand-grayMed">
                            Meeting link sent to {contact.email}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Payment Breakdown */}
                  <div className="rounded-xl bg-emerald-50/70 border border-emerald-200/80 p-5">
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
                      <div>
                        <span className="text-xs font-bold uppercase tracking-wider text-emerald-800">Payment Status</span>
                        <h4 className="text-base font-bold text-emerald-950 mt-0.5">{serviceTitle}</h4>
                        {paypal.orderId && (
                          <p className="text-xs text-emerald-700 font-mono mt-0.5">PayPal Order ID: {paypal.orderId}</p>
                        )}
                      </div>
                      <div className="text-right">
                        <span className="text-2xl font-bold text-emerald-800">€{svc.price.toFixed(2)}</span>
                        <div className="flex items-center gap-1.5 text-xs text-emerald-700 font-semibold justify-end mt-0.5">
                          <CheckCircle className="h-3.5 w-3.5" /> PAID (incl. VAT)
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Action Buttons */}
              <div className="grid gap-4 sm:grid-cols-2 mb-8">
                <Button
                  onClick={handleDownloadReceipt}
                  className="h-12 bg-brand-gold text-white hover:bg-brand-goldDark font-semibold shadow-sm"
                >
                  <Download className="mr-2 h-4 w-4" />
                  {tConf("downloadPDFReceipt")}
                </Button>
                <Button
                  variant="outline"
                  onClick={() => router.push(`/${locale}/tax-advisory`)}
                  className="h-12 border-brand-grayLight/60 text-brand-dark hover:bg-white"
                >
                  {tConf("backToTaxAdvisory")}
                </Button>
              </div>

              {/* Next Steps Guide */}
              <Card className="border border-brand-grayLight/40 bg-white shadow-sm rounded-2xl">
                <CardContent className="p-6">
                  <h3 className="mb-4 text-base font-bold text-brand-dark flex items-center gap-2">
                    <Sparkles className="h-4 w-4 text-brand-gold" />
                    {tConf("whatHappensNext.title")}
                  </h3>
                  <ul className="space-y-3">
                    {[
                      { title: tConf("whatHappensNext.step1.title"), desc: tConf("whatHappensNext.step1.description") },
                      { title: tConf("whatHappensNext.step2.title"), desc: tConf("whatHappensNext.step2.description") },
                      { title: tConf("whatHappensNext.step3.title"), desc: tConf("whatHappensNext.step3.description") },
                      { title: tConf("whatHappensNext.step4.title"), desc: tConf("whatHappensNext.step4.description") },
                    ].map(({ title, desc }, i) => (
                      <li key={i} className="flex items-start gap-3 text-xs">
                        <div className="inline-flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full bg-brand-gold/10 text-brand-goldDark font-bold mt-0.5">
                          {i + 1}
                        </div>
                        <div>
                          <p className="font-semibold text-brand-dark">{title}</p>
                          <p className="text-brand-grayMed mt-0.5">{desc}</p>
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
    </>
  );
}
