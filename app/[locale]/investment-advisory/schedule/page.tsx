"use client";

import * as React from "react";
import { useTranslations, useLocale } from "next-intl";
import { Hero } from "@/components/hero";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Script from "next/script";
import { useState, useEffect, useRef } from "react";
import { PayPalButtons } from "@/components/paypal-buttons";

const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

function fetchWithTimeout(url: string, options: RequestInit, timeoutMs = 5000) {
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), timeoutMs);
  return fetch(url, { ...options, signal: controller.signal }).finally(() => clearTimeout(id));
}

export default function ScheduleInvestmentMeetingPage() {
  const t = useTranslations("investmentAdvisory.schedule");
  const locale = useLocale();
  const dateLocale = locale === "fr" ? "fr-FR" : "en-US";

  const [step, setStep] = useState<'contact' | 'calendar' | 'payment' | 'confirmation'>('contact');
  const [contact, setContact] = useState({ firstName: "", lastName: "", email: "" });
  const [errors, setErrors] = useState<{ firstName?: string; lastName?: string; email?: string }>({});
  const [bookingData, setBookingData] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [paymentCompleted, setPaymentCompleted] = useState(false);
  const [confirmationNumber, setConfirmationNumber] = useState('');
  const [calendlyLoaded, setCalendlyLoaded] = useState(false);
  const calendlyRef = useRef<HTMLDivElement>(null);
  // Calendly only sends URIs in event_scheduled — capture the actual ISO start time
  // from date_and_time_selected which fires when the user picks a slot.
  const selectedStartTimeRef = useRef<string | null>(null);

  const fullName = `${contact.firstName} ${contact.lastName}`.trim();

  // If Calendly script was already loaded by a previous page navigation, onLoad won't fire
  useEffect(() => {
    if (typeof window !== 'undefined' && (window as any).Calendly) {
      setCalendlyLoaded(true);
    }
  }, []);

  useEffect(() => {
    const handleCalendlyEvent = (e: MessageEvent) => {
      if (e.data.event && e.data.event.indexOf('calendly') === 0) {
        if (e.data.event === 'calendly.date_and_time_selected') {
          // Store the ISO start time; Calendly omits it from event_scheduled payload
          selectedStartTimeRef.current = e.data.payload?.invitee_start_time ?? null;
        }
        if (e.data.event === 'calendly.event_scheduled') {
          const startTime =
            e.data.payload?.event?.start_time ??
            selectedStartTimeRef.current;
          setBookingData({
            eventUri: e.data.payload.event.uri,
            inviteeUri: e.data.payload.invitee.uri,
            eventStartTime: startTime,
            eventEndTime: e.data.payload?.event?.end_time ?? null,
          });
          setStep('payment');
        }
      }
    };

    window.addEventListener('message', handleCalendlyEvent);
    return () => window.removeEventListener('message', handleCalendlyEvent);
  }, []);

  useEffect(() => {
    if (step === 'calendar' && calendlyLoaded && calendlyRef.current) {
      calendlyRef.current.innerHTML = '';
      // @ts-ignore
      window.Calendly?.initInlineWidget({
        url: `https://calendly.com/opulanz-banking/investment-advisory?hide_event_type_details=1&primary_color=d0ab08&locale=${locale}`,
        parentElement: calendlyRef.current,
        prefill: { name: fullName, email: contact.email },
      });
    }
  }, [step, calendlyLoaded, locale]);

  // Auto-proceed to confirmation after payment completes
  useEffect(() => {
    if (!paymentCompleted) return;
    const timer = setTimeout(() => { handlePaymentComplete(); }, 1200);
    return () => clearTimeout(timer);
  }, [paymentCompleted]);

  function handleContactSubmit(e: React.FormEvent) {
    e.preventDefault();
    const errs: { firstName?: string; lastName?: string; email?: string } = {};
    if (!contact.firstName.trim()) errs.firstName = t("firstNameRequired");
    if (!contact.lastName.trim()) errs.lastName = t("lastNameRequired");
    if (!contact.email.trim()) errs.email = t("emailRequired");
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(contact.email)) errs.email = t("emailInvalid");
    setErrors(errs);
    if (Object.keys(errs).length) return;
    setStep('calendar');
  }

  const handleDownloadReceipt = () => {
    const startDate = bookingData?.eventStartTime ? new Date(bookingData.eventStartTime) : null;
    const dateStr = startDate
      ? startDate.toLocaleDateString(dateLocale, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })
      : '—';
    const timeStr = startDate
      ? startDate.toLocaleTimeString(dateLocale, { hour: '2-digit', minute: '2-digit' })
      : '—';
    const paymentDateStr = new Date().toLocaleDateString(dateLocale, { year: 'numeric', month: 'long', day: 'numeric' });

    const html = `<!DOCTYPE html>
<html lang="en"><head><meta charset="UTF-8">
<title>Opulanz Receipt ${confirmationNumber}</title>
<style>
  body{font-family:-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif;max-width:620px;margin:40px auto;padding:0 24px;color:#252623}
  .print-note{background:#DBEAFE;border:1px solid #93C5FD;border-radius:6px;padding:12px 16px;font-size:12px;margin-bottom:24px;display:flex;align-items:center;gap:8px}
  .print-note button{margin-left:auto;background:#1E3A5F;color:#fff;border:none;border-radius:4px;padding:6px 14px;font-size:12px;cursor:pointer}
  .header{text-align:center;padding-bottom:20px;border-bottom:2px solid #B59354;margin-bottom:24px}
  .logo{font-size:22px;font-weight:800;letter-spacing:.12em;color:#252623}
  .logo span{color:#B59354}
  .sub{font-size:13px;color:#6E6A60;margin-top:4px}
  .conf-pill{display:inline-block;background:#FAF6EE;border:1.5px solid #B59354;border-radius:6px;padding:6px 16px;font-family:monospace;font-size:14px;font-weight:700;color:#886844;margin:12px 0}
  .row{display:flex;justify-content:space-between;align-items:center;padding:10px 0;border-bottom:1px solid #E4DFD5;font-size:13px}
  .row:last-child{border-bottom:none}
  .lbl{color:#6E6A60}
  .val{font-weight:600;color:#252623}
  .total-row{padding:14px 0;border-top:2px solid #B59354;margin-top:8px}
  .total-row .lbl{font-weight:700;color:#252623}
  .total-row .val{font-size:18px;font-weight:700;color:#B59354}
  .footer{margin-top:28px;padding-top:16px;border-top:1px solid #E4DFD5;font-size:11px;color:#6E6A60;text-align:center}
  @media print{.print-note{display:none}}
</style>
</head>
<body>
<div class="print-note">
  📄 To save as PDF: File → Print → Save as PDF
  <button onclick="window.print()">Print / Save as PDF</button>
</div>
<div class="header">
  <div class="logo">OPUL<span>ANZ</span></div>
  <div class="sub">Investment Advisory — Payment Receipt</div>
  <div class="conf-pill">${confirmationNumber}</div>
</div>
<div class="row"><span class="lbl">Service</span><span class="val">Investment Advisory Consultation</span></div>
<div class="row"><span class="lbl">Client Name</span><span class="val">${fullName}</span></div>
<div class="row"><span class="lbl">Email</span><span class="val">${contact.email}</span></div>
<div class="row"><span class="lbl">Appointment Date</span><span class="val">${dateStr}</span></div>
<div class="row"><span class="lbl">Appointment Time</span><span class="val">${timeStr}</span></div>
<div class="row"><span class="lbl">Duration</span><span class="val">45 minutes</span></div>
<div class="row"><span class="lbl">Format</span><span class="val">Video Conference</span></div>
<div class="row"><span class="lbl">Payment Method</span><span class="val">PayPal</span></div>
<div class="row"><span class="lbl">Payment Date</span><span class="val">${paymentDateStr}</span></div>
<div class="row total-row"><span class="lbl">Total Paid</span><span class="val">€99.90</span></div>
<div class="footer">Opulanz Banking · support@opulanzbanking.com<br>This receipt confirms your paid consultation booking.</div>
</body></html>`;

    const blob = new Blob([html], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Opulanz-Receipt-${confirmationNumber}.html`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handlePaymentComplete = async () => {
    setLoading(true);
    const confNum = `INV-${Date.now().toString(36).toUpperCase()}`;
    setConfirmationNumber(confNum);

    try {
      if (!bookingData) throw new Error('No booking data available');

      const startDate = bookingData.eventStartTime ? new Date(bookingData.eventStartTime) : null;

      await fetchWithTimeout(`${API}/api/appointments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          full_name: fullName,
          email: contact.email,
          calendly_id: bookingData.eventUri,
          calendly_event_uri: bookingData.eventUri,
          meeting_type: 'Investment Advisory',
          status: 'confirmed',
          start_time: bookingData.eventStartTime,
          end_time: bookingData.eventEndTime,
          timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
          location: 'Video Conference',
          notes: 'Paid consultation - €99.90'
        })
      }).catch(() => null);

      await fetchWithTimeout(`${API}/api/notifications/appointment`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customerName: fullName,
          customerEmail: contact.email,
          appointmentDate: startDate ? startDate.toLocaleDateString(dateLocale, {
            weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
          }) : '',
          appointmentTime: startDate ? startDate.toLocaleTimeString(dateLocale, {
            hour: '2-digit', minute: '2-digit'
          }) : '',
          meetingType: 'Investment Advisory'
        })
      }).catch(() => null);

      setStep('confirmation');
    } catch (error) {
      console.error('Error processing payment:', error);
      setStep('confirmation');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Hero
        title={t("heroTitle")}
        subtitle={t("heroSubtitle")}
      />

      <section className="bg-white py-12">
        <div className="container mx-auto max-w-5xl px-6">

          {/* Step 0: Contact Details */}
          {step === 'contact' && (
            <>
              <div className="mb-8 text-center">
                <h2 className="mb-4 text-2xl font-bold text-brand-dark md:text-3xl">
                  {t("contactTitle")}
                </h2>
                <p className="text-brand-grayMed">
                  {t("contactSubtitle")}
                </p>
              </div>

              <Card className="border-none shadow-lg">
                <CardContent className="p-8">
                  <form onSubmit={handleContactSubmit} className="space-y-6">
                    <div className="grid gap-6 sm:grid-cols-2">
                      <div>
                        <Label htmlFor="firstName">{t("firstName")} <span className="text-red-500">*</span></Label>
                        <Input
                          id="firstName"
                          value={contact.firstName}
                          onChange={(e) => setContact(p => ({ ...p, firstName: e.target.value }))}
                          className={`mt-1 ${errors.firstName ? "border-red-500" : ""}`}
                        />
                        {errors.firstName && <p className="mt-1 text-sm text-red-500">{errors.firstName}</p>}
                      </div>
                      <div>
                        <Label htmlFor="lastName">{t("lastName")} <span className="text-red-500">*</span></Label>
                        <Input
                          id="lastName"
                          value={contact.lastName}
                          onChange={(e) => setContact(p => ({ ...p, lastName: e.target.value }))}
                          className={`mt-1 ${errors.lastName ? "border-red-500" : ""}`}
                        />
                        {errors.lastName && <p className="mt-1 text-sm text-red-500">{errors.lastName}</p>}
                      </div>
                    </div>
                    <div>
                      <Label htmlFor="email">{t("email")} <span className="text-red-500">*</span></Label>
                      <Input
                        id="email"
                        type="email"
                        value={contact.email}
                        onChange={(e) => setContact(p => ({ ...p, email: e.target.value }))}
                        className={`mt-1 ${errors.email ? "border-red-500" : ""}`}
                      />
                      {errors.email && <p className="mt-1 text-sm text-red-500">{errors.email}</p>}
                    </div>
                    <div className="flex justify-end pt-2">
                      <Button type="submit" className="bg-brand-gold text-white hover:bg-brand-goldDark">
                        {t("continueToCalendar")}
                      </Button>
                    </div>
                  </form>
                </CardContent>
              </Card>
            </>
          )}

          {/* Step 1: Calendar */}
          {step === 'calendar' && (
            <>
              <div className="mb-8 text-center">
                <h2 className="mb-4 text-2xl font-bold text-brand-dark md:text-3xl">
                  {t("calendarTitle")}
                </h2>
                <p className="text-brand-grayMed">
                  {t("calendarSubtitle")}
                </p>
              </div>

              <Card className="border-none shadow-lg">
                <CardContent className="p-4 md:p-8">
                  <div
                    ref={calendlyRef}
                    style={{ minWidth: '320px', height: '700px' }}
                  />
                </CardContent>
              </Card>

              <div className="mt-6 flex justify-start">
                <Button variant="outline" onClick={() => setStep('contact')}>
                  {t("backToContact")}
                </Button>
              </div>

              {/* Info Cards */}
              <div className="mt-12 grid gap-8 md:grid-cols-3">
                <div className="text-center">
                  <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-full bg-brand-goldLight">
                    <svg className="h-6 w-6 text-brand-goldDark" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <h3 className="mb-2 text-lg font-bold text-brand-dark">{t("info1Title")}</h3>
                  <p className="text-sm text-brand-grayMed">{t("info1Desc")}</p>
                </div>

                <div className="text-center">
                  <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-full bg-brand-goldLight">
                    <svg className="h-6 w-6 text-brand-goldDark" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <h3 className="mb-2 text-lg font-bold text-brand-dark">{t("info2Title")}</h3>
                  <p className="text-sm text-brand-grayMed">{t("info2Desc")}</p>
                </div>

                <div className="text-center">
                  <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-full bg-brand-goldLight">
                    <svg className="h-6 w-6 text-brand-goldDark" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                    </svg>
                  </div>
                  <h3 className="mb-2 text-lg font-bold text-brand-dark">{t("info3Title")}</h3>
                  <p className="text-sm text-brand-grayMed">{t("info3Desc")}</p>
                </div>
              </div>

              {/* What to Prepare */}
              <div className="mt-12 rounded-lg bg-brand-off p-8">
                <h3 className="mb-4 text-xl font-bold text-brand-dark">{t("prepareTitle")}</h3>
                <ul className="space-y-3 text-brand-grayMed">
                  {(["prepare1","prepare2","prepare3","prepare4","prepare5"] as const).map((key) => (
                    <li key={key} className="flex items-start gap-3">
                      <svg className="mt-1 h-5 w-5 flex-shrink-0 text-brand-gold" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                      <span>{t(key)}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </>
          )}

          {/* Step 2: Payment */}
          {step === 'payment' && bookingData && (
            <>
              <div className="mb-8 text-center">
                <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-full bg-green-100">
                  <svg className="h-6 w-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <h2 className="mb-4 text-2xl font-bold text-brand-dark md:text-3xl">
                  {t("slotReserved")}
                </h2>
                <p className="text-brand-grayMed">{t("completePaymentDesc")}</p>
              </div>

              <Card className="mb-8 border-brand-gold/30 shadow-lg">
                <CardContent className="p-8">
                  <h3 className="mb-4 text-xl font-bold text-brand-dark">{t("appointmentDetails")}</h3>
                  <div className="space-y-3">
                    <div className="flex justify-between border-b border-brand-grayLight/30 pb-2">
                      <span className="text-brand-grayMed">{t("labelName")}</span>
                      <span className="font-semibold text-brand-dark">{fullName}</span>
                    </div>
                    <div className="flex justify-between border-b border-brand-grayLight/30 pb-2">
                      <span className="text-brand-grayMed">{t("labelEmail")}</span>
                      <span className="font-semibold text-brand-dark">{contact.email}</span>
                    </div>
                    <div className="flex justify-between border-b border-brand-grayLight/30 pb-2">
                      <span className="text-brand-grayMed">{t("labelDate")}</span>
                      <span className="font-semibold text-brand-dark">
                        {bookingData.eventStartTime
                          ? new Date(bookingData.eventStartTime).toLocaleDateString(dateLocale, {
                              weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
                            })
                          : '—'}
                      </span>
                    </div>
                    <div className="flex justify-between border-b border-brand-grayLight/30 pb-2">
                      <span className="text-brand-grayMed">{t("labelTime")}</span>
                      <span className="font-semibold text-brand-dark">
                        {bookingData.eventStartTime
                          ? new Date(bookingData.eventStartTime).toLocaleTimeString(dateLocale, {
                              hour: '2-digit', minute: '2-digit'
                            })
                          : '—'}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-brand-grayMed">{t("labelDuration")}</span>
                      <span className="font-semibold text-brand-dark">{t("duration45")}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-none shadow-lg">
                <CardContent className="p-8 md:p-12">
                  <div className="text-center">
                    <div className="mb-6">
                      <h3 className="mb-2 text-xl font-bold text-brand-dark">{t("completePaymentTitle")}</h3>
                      <p className="text-3xl font-bold text-brand-gold">€99.90</p>
                      <p className="mt-2 text-sm text-brand-grayMed">{t("oneTimePayment")}</p>
                    </div>

                    <div className="mx-auto max-w-md">
                      <PayPalButtons
                        amount="99.90"
                        description="Investment Advisory Consultation - 45 minutes"
                        onSuccess={() => setPaymentCompleted(true)}
                      />

                      <div className="mt-6 rounded-lg bg-blue-50 p-4">
                        <p className="text-sm text-blue-800">
                          <strong>{t("testingLabel")}</strong>{' '}
                          {t("testingDesc")}{' '}
                          <code className="rounded bg-blue-100 px-2 py-1">4111 1111 1111 1111</code>
                          {' '}{t("testingDetails")}
                        </p>
                      </div>
                    </div>

                    {paymentCompleted && (
                      <div className="mt-6">
                        <div className="mb-4 rounded-lg bg-green-50 p-4 text-green-800">
                          <div className="flex items-center justify-center gap-2">
                            <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                            </svg>
                            <span className="font-semibold">{t("paymentSuccess")}</span>
                          </div>
                        </div>
                        <div className="flex items-center justify-center gap-2 text-brand-grayMed text-sm">
                          <svg className="h-4 w-4 animate-spin" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"/>
                          </svg>
                          {loading ? t("processing") : t("redirecting")}
                        </div>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </>
          )}

          {/* Step 3: Confirmation */}
          {step === 'confirmation' && bookingData && (
            <>
              <div className="text-center">
                <div className="mb-6 inline-flex h-20 w-20 items-center justify-center rounded-full bg-green-100">
                  <svg className="h-10 w-10 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <h2 className="mb-4 text-3xl font-bold text-brand-dark">
                  {t("paymentConfirmed")}
                </h2>
                <p className="mb-4 text-brand-grayMed">
                  {t("paymentConfirmedDesc")}
                </p>
                {confirmationNumber && (
                  <div className="mb-8 inline-flex items-center gap-2 rounded-lg border border-brand-gold/50 bg-brand-gold/5 px-5 py-2">
                    <span className="text-xs font-semibold uppercase tracking-widest text-brand-grayMed">Booking Ref</span>
                    <span className="font-mono text-base font-bold text-brand-gold">{confirmationNumber}</span>
                  </div>
                )}

                <Card className="mb-8 border-brand-gold/30 shadow-lg">
                  <CardContent className="p-8">
                    <h3 className="mb-4 text-xl font-bold text-brand-dark">{t("confirmedAppointment")}</h3>
                    <div className="space-y-3 text-left">
                      <div className="flex justify-between border-b border-brand-grayLight/30 pb-2">
                        <span className="text-brand-grayMed">{t("labelService")}</span>
                        <span className="font-semibold text-brand-dark">{t("serviceName")}</span>
                      </div>
                      <div className="flex justify-between border-b border-brand-grayLight/30 pb-2">
                        <span className="text-brand-grayMed">{t("labelName")}</span>
                        <span className="font-semibold text-brand-dark">{fullName}</span>
                      </div>
                      <div className="flex justify-between border-b border-brand-grayLight/30 pb-2">
                        <span className="text-brand-grayMed">{t("labelDate")}</span>
                        <span className="font-semibold text-brand-dark">
                          {new Date(bookingData.eventStartTime).toLocaleDateString(dateLocale, {
                            weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
                          })}
                        </span>
                      </div>
                      <div className="flex justify-between border-b border-brand-grayLight/30 pb-2">
                        <span className="text-brand-grayMed">{t("labelTime")}</span>
                        <span className="font-semibold text-brand-dark">
                          {new Date(bookingData.eventStartTime).toLocaleTimeString(dateLocale, {
                            hour: '2-digit', minute: '2-digit'
                          })}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-brand-grayMed">{t("labelDuration")}</span>
                        <span className="font-semibold text-brand-dark">{t("duration45")}</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <div className="rounded-lg bg-brand-goldLight/20 p-6">
                  <h4 className="mb-3 font-semibold text-brand-dark">{t("whatsNext")}</h4>
                  <ul className="space-y-2 text-sm text-brand-grayMed">
                    <li>✓ {t("next1", { email: contact.email })}</li>
                    <li>✓ {t("next2")}</li>
                    <li>✓ {t("next3")}</li>
                    <li>✓ {t("next4")}</li>
                  </ul>
                </div>

                <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
                  <Button
                    onClick={handleDownloadReceipt}
                    variant="outline"
                    className="border-brand-gold text-brand-gold hover:bg-brand-gold/10"
                  >
                    Download Receipt
                  </Button>
                  <Button
                    onClick={() => window.location.href = `/${locale}`}
                    className="bg-brand-gold text-white hover:bg-brand-goldDark"
                  >
                    {t("returnHome")}
                  </Button>
                </div>
              </div>
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
