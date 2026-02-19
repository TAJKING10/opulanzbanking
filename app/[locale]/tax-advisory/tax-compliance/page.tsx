"use client";

import * as React from "react";
import Link from "next/link";
import { Shield, CheckCircle, Clock, Euro } from "lucide-react";
import { Hero } from "@/components/hero";
import { SectionHeading } from "@/components/section-heading";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useTranslations } from "next-intl";

import { useState, useEffect, useRef } from "react";
import emailjs from '@emailjs/browser';

export default function TaxCompliancePage({ params: { locale } }: { params: { locale: string } }) {
  const t = useTranslations('taxAdvisory.taxCompliance');
  const tCommon = useTranslations('taxAdvisory.internationalTax');
  const [step, setStep] = useState<'info' | 'calendar' | 'payment' | 'confirmation'>('info');
  const [bookingData, setBookingData] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [paypalLoaded, setPaypalLoaded] = useState(false);
  const [paymentCompleted, setPaymentCompleted] = useState(false);
  const [calendlyLoaded, setCalendlyLoaded] = useState(false);
  const paypalRef = useRef<HTMLDivElement>(null);

  const totalPrice = 250;
  const servicePrice = totalPrice / 1.17;
  const vat = totalPrice - servicePrice;
  // Initialize EmailJS
  useEffect(() => {
    emailjs.init('YOUR_PUBLIC_KEY'); // Replace with your EmailJS public key
  }, []);

  // Generate PDF receipt
  const generatePDFReceipt = () => {
    if (!bookingData || !bookingData.paymentDetails) return;

    const receiptContent = `
OPULANZ BANKING - PAYMENT RECEIPT
==================================================

Service: ${t('hero.title')}
Date: ${new Date(bookingData.eventStartTime).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
Time: ${new Date(bookingData.eventStartTime).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
Duration: 60 minutes

CLIENT INFORMATION
==================================================
Name: ${bookingData.inviteeName}
Email: ${bookingData.inviteeEmail}

PAYMENT DETAILS
==================================================
Order ID: ${bookingData.paymentDetails.orderId}
Amount: €250.00 (incl. VAT)
Service Fee: €${(250 / 1.17).toFixed(2)} (excl. VAT)
VAT (17%): €${(250 - 250 / 1.17).toFixed(2)}
Payment Method: PayPal
Status: ${bookingData.paymentDetails.status}
Date: ${new Date(bookingData.paymentDetails.timestamp).toLocaleString('en-US')}

Thank you for choosing Opulanz Banking!
Contact: opulanz.banking@gmail.com
    `;

    const blob = new Blob([receiptContent], { type: 'text/plain' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Opulanz-Receipt-${bookingData.paymentDetails.orderId}.txt`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  // Send email receipts
  const sendEmailReceipts = async () => {
    if (!bookingData || !bookingData.paymentDetails) return;

    const templateParams = {
      to_email: bookingData.inviteeEmail,
      to_name: bookingData.inviteeName,
      service_name: t('hero.title'),
      appointment_date: new Date(bookingData.eventStartTime).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }),
      appointment_time: new Date(bookingData.eventStartTime).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
      order_id: bookingData.paymentDetails.orderId,
      amount: '€250.00',
      service_fee: '€' + (250 / 1.17).toFixed(2),
      vat: '€' + (250 - 250 / 1.17).toFixed(2),
      payment_status: bookingData.paymentDetails.status,
      payment_date: new Date(bookingData.paymentDetails.timestamp).toLocaleString('en-US')
    };

    try {
      // Send to customer
      await emailjs.send(
        'YOUR_SERVICE_ID', // Replace with your EmailJS service ID
        'YOUR_TEMPLATE_ID', // Replace with your EmailJS template ID
        templateParams,
        'YOUR_PUBLIC_KEY' // Replace with your EmailJS public key
      );

      // Send to admin
      await emailjs.send(
        'YOUR_SERVICE_ID',
        'YOUR_ADMIN_TEMPLATE_ID', // You'll need a separate template for admin
        { ...templateParams, to_email: 'opulanz.banking@gmail.com', to_name: 'Opulanz Admin' },
        'YOUR_PUBLIC_KEY'
      );

      console.log('✅ Email receipts sent successfully');
    } catch (error) {
      console.error('❌ Error sending emails:', error);
    }
  };


  // Load Calendly script when calendar step is active
  useEffect(() => {
    if (step === 'calendar' && !calendlyLoaded) {
      const script = document.createElement('script');
      script.src = 'https://assets.calendly.com/assets/external/widget.js';
      script.async = true;
      script.onload = () => setCalendlyLoaded(true);
      document.head.appendChild(script);
    }
  }, [step, calendlyLoaded]);
  // Load PayPal SDK when payment step is active
  useEffect(() => {
    if (step === 'payment' && !paypalLoaded) {
      const script = document.createElement('script');
      const paypalClientId = process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID || 'AY2J7gUncxDdmNXWjLaw5E9A4Gz6X-hcQvagQBhi2erpaMLeHoaHbGIi7dgns3GZ3oFxg-wO0Xhwy0qo';
      script.src = `https://www.paypal.com/sdk/js?client-id=${paypalClientId}&currency=EUR`;
      script.async = true;
      script.onload = () => setPaypalLoaded(true);
      document.head.appendChild(script);
    }
  }, [step, paypalLoaded]);


  useEffect(() => {
    const handleCalendlyEvent = (e: MessageEvent) => {
      if (e.data.event && e.data.event.indexOf('calendly') === 0 && e.data.event === 'calendly.event_scheduled') {
        setBookingData({
          eventUri: e.data.payload.event.uri,
          inviteeUri: e.data.payload.invitee.uri,
          inviteeName: e.data.payload.invitee.name,
          inviteeEmail: e.data.payload.invitee.email,
          eventStartTime: e.data.payload.event.start_time,
          eventEndTime: e.data.payload.event.end_time,
        });
        setStep('payment');
      }
    };
    window.addEventListener('message', handleCalendlyEvent);
    return () => window.removeEventListener('message', handleCalendlyEvent);
  }, []);

  useEffect(() => {
    if (step === 'payment' && paypalLoaded && paypalRef.current && bookingData) {
      paypalRef.current.innerHTML = '';
      // @ts-ignore
      if (window.paypal) {
        // @ts-ignore
        window.paypal.Buttons({
          style: { layout: 'vertical', color: 'gold', shape: 'rect', label: 'pay', height: 50 },
          createOrder: function(data: any, actions: any) {
            return actions.order.create({
              purchase_units: [{ description: t('payment.serviceTitle') + ' - 60 minutes', amount: { currency_code: 'EUR', value: totalPrice.toFixed(2) } }]
            });
          },
          onApprove: function(data: any, actions: any) {
            return actions.order.capture().then(function(details: any) {
              setBookingData((prev: any) => ({
                ...prev,
                paymentDetails: {
                  orderId: data.orderID,
                  payerId: details.payer.payer_id,
                  payerEmail: details.payer.email_address,
                  payerName: details.payer.name.given_name + ' ' + details.payer.name.surname,
                  amount: details.purchase_units[0].amount.value,
                  currency: details.purchase_units[0].amount.currency_code,
                  status: details.status,
                  timestamp: new Date().toISOString()
                }
              }));
              setPaymentCompleted(true);
            });
          },
          onError: function(err: any) {
            alert(tCommon('payment.paymentFailed'));
          }
        }).render(paypalRef.current);
      }
    }
  }, [step, paypalLoaded, bookingData, totalPrice]);

  const handlePaymentComplete = async () => {
    if (!paymentCompleted) { alert(tCommon('payment.completePaypalFirst')); return; }
    setLoading(true);
    try {
      const startDate = new Date(bookingData.eventStartTime);

      await fetch('http://localhost:5000/api/appointments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          full_name: bookingData.inviteeName, email: bookingData.inviteeEmail, calendly_id: bookingData.eventUri,
          calendly_event_uri: bookingData.eventUri, meeting_type: 'Tax Compliance', status: 'confirmed',
          start_time: bookingData.eventStartTime, end_time: bookingData.eventEndTime,
          timezone: Intl.DateTimeFormat().resolvedOptions().timeZone, location: 'Video Conference',
          notes: `Paid consultation - €${totalPrice}`
        })
      });

      await fetch('http://localhost:5000/api/notifications/appointment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customerName: bookingData.inviteeName,
          customerEmail: bookingData.inviteeEmail,
          appointmentDate: startDate.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }),
          appointmentTime: startDate.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
          meetingType: t('hero.title'),
          price: totalPrice,
          calendlyLink: bookingData.eventUri
        })
      });

      sendEmailReceipts();
      setStep('confirmation');
    } catch (error) {
      console.error('Error:', error);
      alert(tCommon('payment.errorGeneral'));
    } finally {
      setLoading(false);
    }
  };

  const features = [
    t('features.feature1'),
    t('features.feature2'),
    t('features.feature3'),
    t('features.feature4'),
    t('features.feature5'),
    t('features.feature6'),
  ];

  const benefits = [
    t('benefits.benefit1'),
    t('benefits.benefit2'),
    t('benefits.benefit3'),
    t('benefits.benefit4'),
  ];

  if (step === 'confirmation' && bookingData) {
    return (
      <>
        <section className="hero-gradient py-16 md:py-20">
          <div className="container mx-auto max-w-4xl px-6">
            <div className="text-center">
              <div className="mb-6 inline-flex h-20 w-20 items-center justify-center rounded-full bg-green-500">
                <CheckCircle className="h-12 w-12 text-white" />
              </div>
              <h1 className="mb-4 text-3xl font-bold text-white md:text-4xl lg:text-5xl">{tCommon('confirmation.title')}</h1>
              <p className="text-lg text-white/90">{tCommon('confirmation.subtitle')}</p>
            </div>
          </div>
        </section>
        <section className="bg-white py-12 md:py-16">
          <div className="container mx-auto max-w-3xl px-6">
            <Card className="mb-8 border-brand-gold/30 shadow-lg">
              <CardContent className="p-8">
                <h3 className="mb-4 text-xl font-bold text-brand-dark">{tCommon('confirmation.confirmedAppointment')}</h3>
                <div className="space-y-3 text-left">
                  <div className="flex justify-between border-b border-brand-grayLight/30 pb-2"><span className="text-brand-grayMed">{tCommon('confirmation.service')}</span><span className="font-semibold text-brand-dark">{t('hero.title')}</span></div>
                  <div className="flex justify-between border-b border-brand-grayLight/30 pb-2"><span className="text-brand-grayMed">{tCommon('payment.name')}</span><span className="font-semibold text-brand-dark">{bookingData.inviteeName}</span></div>
                  <div className="flex justify-between border-b border-brand-grayLight/30 pb-2"><span className="text-brand-grayMed">{tCommon('payment.email')}</span><span className="font-semibold text-brand-dark">{bookingData.inviteeEmail}</span></div>
                  <div className="flex justify-between border-b border-brand-grayLight/30 pb-2"><span className="text-brand-grayMed">{tCommon('payment.date')}</span><span className="font-semibold text-brand-dark">{new Date(bookingData.eventStartTime).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</span></div>
                  <div className="flex justify-between border-b border-brand-grayLight/30 pb-2"><span className="text-brand-grayMed">{tCommon('payment.time')}</span><span className="font-semibold text-brand-dark">{new Date(bookingData.eventStartTime).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}</span></div>
                  <div className="flex justify-between"><span className="text-brand-grayMed">{tCommon('payment.duration')}</span><span className="font-semibold text-brand-dark">{tCommon('payment.minutes60')}</span></div>
                </div>
              </CardContent>
            </Card>
            <div className="rounded-lg bg-brand-goldLight/20 p-6 mb-8">
              <h4 className="mb-3 font-semibold text-brand-dark">{tCommon('confirmation.whatsNext')}</h4>
              <ul className="space-y-2 text-sm text-brand-grayMed">
                <li>{tCommon('confirmation.checkEmail', { email: bookingData.inviteeEmail })}</li>
                <li>{tCommon('confirmation.prepareDocuments')}</li>
                <li>{tCommon('confirmation.joinConference')}</li>
                <li>{tCommon('confirmation.teamNotified')}</li>
              </ul>
            </div>
            <Button onClick={() => window.location.href = `/${locale}`} className="w-full bg-brand-gold text-white hover:bg-brand-goldDark">
              {tCommon('confirmation.returnToHome')}
            </Button>
          </div>
        </section>
      </>
    );
  }

  if (step === 'payment' && bookingData) {
    return (
      <>
        <section className="hero-gradient py-16 md:py-20">
          <div className="container mx-auto max-w-4xl px-6">
            <div className="text-center">
              <div className="mb-6 inline-flex h-16 w-16 items-center justify-center rounded-full bg-green-500"><CheckCircle className="h-10 w-10 text-white" /></div>
              <h1 className="mb-4 text-3xl font-bold text-white md:text-4xl lg:text-5xl">{tCommon('payment.timeSlotReserved')}</h1>
              <p className="text-lg text-white/90">{tCommon('payment.completePayment')}</p>
            </div>
          </div>
        </section>
        <section className="bg-white py-12 md:py-16">
          <div className="container mx-auto max-w-3xl px-6">
            <Card className="mb-8 border-brand-gold/30 shadow-lg">
              <CardContent className="p-8">
                <h3 className="mb-4 text-xl font-bold text-brand-dark">{tCommon('payment.appointmentDetails')}</h3>
                <div className="space-y-3">
                  <div className="flex justify-between border-b border-brand-grayLight/30 pb-2"><span className="text-brand-grayMed">{tCommon('payment.name')}</span><span className="font-semibold text-brand-dark">{bookingData.inviteeName}</span></div>
                  <div className="flex justify-between border-b border-brand-grayLight/30 pb-2"><span className="text-brand-grayMed">{tCommon('payment.email')}</span><span className="font-semibold text-brand-dark">{bookingData.inviteeEmail}</span></div>
                  <div className="flex justify-between border-b border-brand-grayLight/30 pb-2"><span className="text-brand-grayMed">{tCommon('payment.date')}</span><span className="font-semibold text-brand-dark">{new Date(bookingData.eventStartTime).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</span></div>
                  <div className="flex justify-between border-b border-brand-grayLight/30 pb-2"><span className="text-brand-grayMed">{tCommon('payment.time')}</span><span className="font-semibold text-brand-dark">{new Date(bookingData.eventStartTime).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}</span></div>
                  <div className="flex justify-between"><span className="text-brand-grayMed">{tCommon('payment.duration')}</span><span className="font-semibold text-brand-dark">{tCommon('payment.minutes60')}</span></div>
                </div>
              </CardContent>
            </Card>
            <Card className="border-2 border-brand-grayLight mb-8">
              <CardContent className="p-8">
                <div className="flex items-start gap-4 mb-6">
                  <div className="inline-flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-lg bg-brand-gold/10"><Shield className="h-6 w-6 text-brand-gold" /></div>
                  <div className="flex-1">
                    <h3 className="text-xl font-bold text-brand-dark mb-2">{t('payment.serviceTitle')}</h3>
                    <p className="text-sm text-brand-grayMed mb-2">{t('payment.serviceDesc')}</p>
                    <p className="text-sm text-brand-grayMed">{tCommon('payment.duration')} {tCommon('payment.minutes60')}</p>
                  </div>
                </div>
                <div className="border-t border-brand-grayLight pt-6">
                  <div className="flex justify-between items-center text-lg mb-3"><span className="text-brand-grayMed">{tCommon('payment.serviceFeeExcl')}</span><span className="font-semibold text-brand-dark">€{servicePrice.toFixed(2)}</span></div>
                  <div className="flex justify-between items-center text-lg mb-3"><span className="text-brand-grayMed">{tCommon('payment.vat17')}</span><span className="font-semibold text-brand-dark">€{vat.toFixed(2)}</span></div>
                  <div className="border-t border-brand-grayLight pt-4 mt-4"><div className="flex justify-between items-center"><span className="text-xl font-bold text-brand-dark">{tCommon('payment.totalIncl')}</span><span className="text-3xl font-bold text-brand-gold">€{totalPrice.toFixed(2)}</span></div></div>
                </div>
              </CardContent>
            </Card>
            <Card className="border-none shadow-lg">
              <CardContent className="p-8 md:p-12">
                <div className="text-center">
                  <div className="mb-6">
                    <h3 className="mb-2 text-xl font-bold text-brand-dark">{tCommon('payment.completeYourPayment')}</h3>
                    <p className="text-3xl font-bold text-brand-gold">€{totalPrice.toFixed(2)}</p>
                    <p className="mt-2 text-sm text-brand-grayMed">{tCommon('payment.oneTimePayment')}</p>
                  </div>
                  <div className="mx-auto max-w-md">
                    <div ref={paypalRef} id="paypal-button-container"></div>
                    <div className="mt-6 rounded-lg bg-blue-50 p-4">
                      <p className="text-sm text-blue-800"><strong>{tCommon('payment.testingCard')}</strong> {tCommon('payment.testingCardDesc', { code: '4111 1111 1111 1111' })}</p>
                    </div>
                  </div>
                  {paymentCompleted && (
                    <div className="mt-6">
                      <div className="mb-4 rounded-lg bg-green-50 p-4 text-green-800"><div className="flex items-center justify-center gap-2"><CheckCircle className="h-5 w-5" /><span className="font-semibold">{tCommon('payment.paymentSuccessful')}</span></div></div>
                      <Button type="button" onClick={handlePaymentComplete} disabled={loading} className="bg-brand-gold text-white hover:bg-brand-goldDark">{loading ? tCommon('payment.processing') : tCommon('payment.continueToConfirmation')}</Button>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </section></>
    );
  }

  if (step === 'calendar') {
    return (
      <>
        <section className="hero-gradient py-16 md:py-20">
          <div className="container mx-auto max-w-4xl px-6">
            <div className="text-center">
              <h1 className="mb-4 text-3xl font-bold text-white md:text-4xl lg:text-5xl">{t('calendar.title')}</h1>
              <p className="text-lg text-white/90">{t('calendar.subtitle', { price: totalPrice })}</p>
            </div>
          </div>
        </section>
        <section className="bg-white py-12 md:py-16">
          <div className="container mx-auto max-w-5xl px-6">
            <div className="grid gap-8 md:grid-cols-3 mb-8">
              <div className="text-center"><div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-full bg-brand-goldLight"><Clock className="h-6 w-6 text-brand-goldDark" /></div><h3 className="mb-2 text-lg font-bold text-brand-dark">{t('calendar.consultation60')}</h3><p className="text-sm text-brand-grayMed">{t('calendar.consultationDesc')}</p></div>
              <div className="text-center"><div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-full bg-brand-goldLight"><Euro className="h-6 w-6 text-brand-goldDark" /></div><h3 className="mb-2 text-lg font-bold text-brand-dark">{t('calendar.feeLabel', { price: totalPrice })}</h3><p className="text-sm text-brand-grayMed">{t('calendar.feeDesc')}</p></div>
              <div className="text-center"><div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-full bg-brand-goldLight"><Shield className="h-6 w-6 text-brand-goldDark" /></div><h3 className="mb-2 text-lg font-bold text-brand-dark">{t('calendar.expertService')}</h3><p className="text-sm text-brand-grayMed">{t('calendar.expertDesc')}</p></div>
            </div>
            <div className="calendly-inline-widget" data-url="https://calendly.com/opulanz-banking/tax-advisory?hide_event_type_details=1&primary_color=d8ba4a" style={{ minWidth: '320px', height: '700px' }} />
          </div>
        </section></>
    );
  }

  return (
    <>
      <Hero title={t('hero.title')} subtitle={t('hero.subtitle')} />
      <section className="relative bg-gradient-to-b from-brand-goldLight/10 to-white py-16 md:py-20 overflow-hidden">
        <div className="container mx-auto max-w-4xl px-6 relative z-10">
          <div className="text-center mb-8">
            <div className="relative">
              <div className="relative mb-6 rounded-2xl bg-white p-8 shadow-2xl border-2 border-brand-gold/20">
                <h3 className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-brand-gold to-brand-goldDark">{t('pricing.price')}</h3>
                <p className="text-lg text-brand-grayMed my-6">{t('pricing.description')}</p>
                <Button onClick={() => setStep('calendar')} size="lg" className="bg-gradient-to-r from-brand-gold to-brand-goldDark text-white min-w-64 h-14 text-lg">{t('pricing.bookNow')}</Button>
              </div>
            </div>
          </div>
        </div>
      </section>
      <section className="bg-white py-20">
        <div className="container mx-auto max-w-7xl px-6">
          <div className="grid gap-12 lg:grid-cols-2">
            <div>
              <SectionHeading overline={t('details.overline')} title={t('details.title')} align="left" className="mb-8" />
              <p className="mb-6 text-lg text-brand-grayMed">{t('details.description')}</p>
            </div>
            <div>
              <h3 className="mb-6 text-xl font-bold text-brand-dark">{t('features.title')}</h3>
              <div className="space-y-4">{features.map((feature) => (<div key={feature} className="flex items-start gap-3 p-4 rounded-xl bg-white/60"><CheckCircle className="mt-1 h-5 w-5 flex-shrink-0 text-brand-gold" /><p className="text-brand-dark">{feature}</p></div>))}</div>
            </div>
          </div>
        </div>
      </section>
      <section className="bg-gray-50 py-20">
        <div className="container mx-auto max-w-4xl px-6">
          <SectionHeading overline={t('benefits.overline')} title={t('benefits.title')} align="center" className="mb-12" />
          <div className="grid gap-6 md:grid-cols-2">{benefits.map((benefit) => (<Card key={benefit}><CardContent className="flex items-start gap-4 p-6"><CheckCircle className="h-6 w-6 text-brand-gold flex-shrink-0 mt-1" /><p className="text-lg text-brand-dark">{benefit}</p></CardContent></Card>))}</div>
        </div>
      </section>
      <section className="hero-gradient py-20">
        <div className="container mx-auto max-w-4xl px-6 text-center">
          <h2 className="mb-6 text-3xl font-bold text-white md:text-4xl">{t('cta.title')}</h2>
          <p className="mx-auto mb-10 max-w-2xl text-lg text-white/90">{t('cta.description')}</p>
          <div className="flex flex-col items-center gap-4 sm:flex-row justify-center">
            <Button onClick={() => setStep('calendar')} size="lg" className="bg-white text-brand-dark hover:bg-gray-50 min-w-48">{t('cta.bookButton', { price: totalPrice })}</Button>
            <Button asChild variant="outline" size="lg" className="border-2 border-white bg-transparent text-white hover:bg-white/10 min-w-48"><Link href={`/${locale}/tax-advisory`}>{t('cta.backToTaxAdvisory')}</Link></Button>
          </div>
        </div>
      </section></>
  );
}
