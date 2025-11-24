"use client";

import * as React from "react";
import Link from "next/link";
import { Shield, CheckCircle, Clock, Euro } from "lucide-react";
import { Hero } from "@/components/hero";
import { SectionHeading } from "@/components/section-heading";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Script from "next/script";
import { useState, useEffect, useRef } from "react";

export default function TaxCompliancePage({ params: { locale } }: { params: { locale: string } }) {
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
              purchase_units: [{ description: 'Tax Compliance - 60 minutes', amount: { currency_code: 'EUR', value: totalPrice.toFixed(2) } }]
            });
          },
          onApprove: function(data: any, actions: any) {
            return actions.order.capture().then(function(details: any) {
              setPaymentCompleted(true);
            });
          },
          onError: function(err: any) {
            alert('Payment failed. Please try again.');
          }
        }).render(paypalRef.current);
      }
    }
  }, [step, paypalLoaded, bookingData, totalPrice]);

  const handlePaymentComplete = async () => {
    if (!paymentCompleted) { alert('Please complete the PayPal payment first.'); return; }
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
          meetingType: 'Tax Compliance',
          price: totalPrice,
          calendlyLink: bookingData.eventUri
        })
      });

      setStep('confirmation');
    } catch (error) {
      console.error('Error:', error);
      alert('There was an error. Please contact support.');
    } finally {
      setLoading(false);
    }
  };

  const features = [
    "Ensure ongoing compliance with tax laws and regulations",
    "Regular monitoring of regulatory changes",
    "Proactive compliance advice and guidance",
    "Tax authority correspondence and representation",
    "Compliance reviews and health checks",
    "Updates on Luxembourg and EU tax law changes",
  ];

  const benefits = [
    "Stay compliant with evolving regulations",
    "Avoid penalties and legal issues",
    "Peace of mind with expert monitoring",
    "Proactive risk management",
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
              <h1 className="mb-4 text-3xl font-bold text-white md:text-4xl lg:text-5xl">Payment Confirmed!</h1>
              <p className="text-lg text-white/90">Your appointment is confirmed. Confirmation emails sent!</p>
            </div>
          </div>
        </section>
        <section className="bg-white py-12 md:py-16">
          <div className="container mx-auto max-w-3xl px-6">
            <Card className="mb-8 border-brand-gold/30 shadow-lg">
              <CardContent className="p-8">
                <h3 className="mb-4 text-xl font-bold text-brand-dark">Confirmed Appointment</h3>
                <div className="space-y-3 text-left">
                  <div className="flex justify-between border-b border-brand-grayLight/30 pb-2"><span className="text-brand-grayMed">Service:</span><span className="font-semibold text-brand-dark">Tax Compliance</span></div>
                  <div className="flex justify-between border-b border-brand-grayLight/30 pb-2"><span className="text-brand-grayMed">Name:</span><span className="font-semibold text-brand-dark">{bookingData.inviteeName}</span></div>
                  <div className="flex justify-between border-b border-brand-grayLight/30 pb-2"><span className="text-brand-grayMed">Email:</span><span className="font-semibold text-brand-dark">{bookingData.inviteeEmail}</span></div>
                  <div className="flex justify-between border-b border-brand-grayLight/30 pb-2"><span className="text-brand-grayMed">Date:</span><span className="font-semibold text-brand-dark">{new Date(bookingData.eventStartTime).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</span></div>
                  <div className="flex justify-between border-b border-brand-grayLight/30 pb-2"><span className="text-brand-grayMed">Time:</span><span className="font-semibold text-brand-dark">{new Date(bookingData.eventStartTime).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}</span></div>
                  <div className="flex justify-between"><span className="text-brand-grayMed">Duration:</span><span className="font-semibold text-brand-dark">60 minutes</span></div>
                </div>
              </CardContent>
            </Card>
            <div className="rounded-lg bg-brand-goldLight/20 p-6 mb-8">
              <h4 className="mb-3 font-semibold text-brand-dark">What's Next?</h4>
              <ul className="space-y-2 text-sm text-brand-grayMed">
                <li>✓ Confirmation email sent to {bookingData.inviteeEmail}</li>
                <li>✓ Our team at opulanz.banking@gmail.com has been notified</li>
                <li>✓ Check your email for the Google Meet link from Calendly</li>
                <li>✓ Prepare your compliance questions and documents</li>
              </ul>
            </div>
            <Button onClick={() => window.location.href = `/${locale}`} className="w-full bg-brand-gold text-white hover:bg-brand-goldDark">Return to Home</Button>
          </div>
        </section>
        <Script src="https://assets.calendly.com/assets/external/widget.js" strategy="lazyOnload" />
        <Script src="https://www.paypal.com/sdk/js?client-id=AY2J7gUncxDdmNXWjLaw5E9A4Gz6X-hcQvagQBhi2erpaMLeHoaHbGIi7dgns3GZ3oFxg-wO0Xhwy0qo&currency=EUR" strategy="lazyOnload" onLoad={() => setPaypalLoaded(true)} />
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
              <h1 className="mb-4 text-3xl font-bold text-white md:text-4xl lg:text-5xl">Time Slot Reserved!</h1>
              <p className="text-lg text-white/90">Complete your payment to confirm your booking</p>
            </div>
          </div>
        </section>
        <section className="bg-white py-12 md:py-16">
          <div className="container mx-auto max-w-3xl px-6">
            <Card className="mb-8 border-brand-gold/30 shadow-lg">
              <CardContent className="p-8">
                <h3 className="mb-4 text-xl font-bold text-brand-dark">Your Appointment Details</h3>
                <div className="space-y-3">
                  <div className="flex justify-between border-b border-brand-grayLight/30 pb-2"><span className="text-brand-grayMed">Name:</span><span className="font-semibold text-brand-dark">{bookingData.inviteeName}</span></div>
                  <div className="flex justify-between border-b border-brand-grayLight/30 pb-2"><span className="text-brand-grayMed">Email:</span><span className="font-semibold text-brand-dark">{bookingData.inviteeEmail}</span></div>
                  <div className="flex justify-between border-b border-brand-grayLight/30 pb-2"><span className="text-brand-grayMed">Date:</span><span className="font-semibold text-brand-dark">{new Date(bookingData.eventStartTime).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</span></div>
                  <div className="flex justify-between border-b border-brand-grayLight/30 pb-2"><span className="text-brand-grayMed">Time:</span><span className="font-semibold text-brand-dark">{new Date(bookingData.eventStartTime).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}</span></div>
                  <div className="flex justify-between"><span className="text-brand-grayMed">Duration:</span><span className="font-semibold text-brand-dark">60 minutes</span></div>
                </div>
              </CardContent>
            </Card>
            <Card className="border-2 border-brand-grayLight mb-8">
              <CardContent className="p-8">
                <div className="flex items-start gap-4 mb-6">
                  <div className="inline-flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-lg bg-brand-gold/10"><Shield className="h-6 w-6 text-brand-gold" /></div>
                  <div className="flex-1">
                    <h3 className="text-xl font-bold text-brand-dark mb-2">Tax Compliance</h3>
                    <p className="text-sm text-brand-grayMed mb-2">Ongoing compliance with tax laws and regulations</p>
                    <p className="text-sm text-brand-grayMed">Duration: 60 minutes</p>
                  </div>
                </div>
                <div className="border-t border-brand-grayLight pt-6">
                  <div className="flex justify-between items-center text-lg mb-3"><span className="text-brand-grayMed">Service Fee (excl. VAT):</span><span className="font-semibold text-brand-dark">€{servicePrice.toFixed(2)}</span></div>
                  <div className="flex justify-between items-center text-lg mb-3"><span className="text-brand-grayMed">VAT (17%):</span><span className="font-semibold text-brand-dark">€{vat.toFixed(2)}</span></div>
                  <div className="border-t border-brand-grayLight pt-4 mt-4"><div className="flex justify-between items-center"><span className="text-xl font-bold text-brand-dark">Total (incl. VAT):</span><span className="text-3xl font-bold text-brand-gold">€{totalPrice.toFixed(2)}</span></div></div>
                </div>
              </CardContent>
            </Card>
            <Card className="border-none shadow-lg">
              <CardContent className="p-8 md:p-12">
                <div className="text-center">
                  <div className="mb-6">
                    <h3 className="mb-2 text-xl font-bold text-brand-dark">Complete Your Payment</h3>
                    <p className="text-3xl font-bold text-brand-gold">€{totalPrice.toFixed(2)}</p>
                    <p className="mt-2 text-sm text-brand-grayMed">One-time payment for 60-minute consultation</p>
                  </div>
                  <div className="mx-auto max-w-md">
                    <div ref={paypalRef} id="paypal-button-container"></div>
                    <div className="mt-6 rounded-lg bg-blue-50 p-4">
                      <p className="text-sm text-blue-800"><strong>Testing:</strong> Use card <code className="rounded bg-blue-100 px-2 py-1">4111 1111 1111 1111</code> (Expiry: 12/2030, CVV: 123)</p>
                    </div>
                  </div>
                  {paymentCompleted && (
                    <div className="mt-6">
                      <div className="mb-4 rounded-lg bg-green-50 p-4 text-green-800"><div className="flex items-center justify-center gap-2"><CheckCircle className="h-5 w-5" /><span className="font-semibold">Payment Successful!</span></div></div>
                      <Button type="button" onClick={handlePaymentComplete} disabled={loading} className="bg-brand-gold text-white hover:bg-brand-goldDark">{loading ? 'Processing...' : 'Continue to Confirmation'}</Button>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </section>
        <Script src="https://assets.calendly.com/assets/external/widget.js" strategy="lazyOnload" />
        <Script src="https://www.paypal.com/sdk/js?client-id=AY2J7gUncxDdmNXWjLaw5E9A4Gz6X-hcQvagQBhi2erpaMLeHoaHbGIi7dgns3GZ3oFxg-wO0Xhwy0qo&currency=EUR" strategy="lazyOnload" onLoad={() => setPaypalLoaded(true)} />
      </>
    );
  }

  if (step === 'calendar') {
    return (
      <>
        <section className="hero-gradient py-16 md:py-20">
          <div className="container mx-auto max-w-4xl px-6">
            <div className="text-center">
              <h1 className="mb-4 text-3xl font-bold text-white md:text-4xl lg:text-5xl">Book Your Tax Compliance Consultation</h1>
              <p className="text-lg text-white/90">Schedule your 60-minute consultation - €{totalPrice}</p>
            </div>
          </div>
        </section>
        <section className="bg-white py-12 md:py-16">
          <div className="container mx-auto max-w-5xl px-6">
            <div className="grid gap-8 md:grid-cols-3 mb-8">
              <div className="text-center"><div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-full bg-brand-goldLight"><Clock className="h-6 w-6 text-brand-goldDark" /></div><h3 className="mb-2 text-lg font-bold text-brand-dark">60-Minute Consultation</h3><p className="text-sm text-brand-grayMed">Professional consultation session</p></div>
              <div className="text-center"><div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-full bg-brand-goldLight"><Euro className="h-6 w-6 text-brand-goldDark" /></div><h3 className="mb-2 text-lg font-bold text-brand-dark">€{totalPrice} Fee</h3><p className="text-sm text-brand-grayMed">Fixed price for tax compliance</p></div>
              <div className="text-center"><div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-full bg-brand-goldLight"><Shield className="h-6 w-6 text-brand-goldDark" /></div><h3 className="mb-2 text-lg font-bold text-brand-dark">Expert Service</h3><p className="text-sm text-brand-grayMed">Compliance monitoring and advice</p></div>
            </div>
            <div className="calendly-inline-widget" data-url="https://calendly.com/opulanz-banking/tax-advisory?hide_event_type_details=1&primary_color=d8ba4a" style={{ minWidth: '320px', height: '700px' }} />
          </div>
        </section>
        <Script src="https://assets.calendly.com/assets/external/widget.js" strategy="lazyOnload" />
        <Script src="https://www.paypal.com/sdk/js?client-id=AY2J7gUncxDdmNXWjLaw5E9A4Gz6X-hcQvagQBhi2erpaMLeHoaHbGIi7dgns3GZ3oFxg-wO0Xhwy0qo&currency=EUR" strategy="lazyOnload" onLoad={() => setPaypalLoaded(true)} />
      </>
    );
  }

  return (
    <>
      <Hero title="Tax Compliance" subtitle="Ensure ongoing compliance with tax laws and regulations" />
      <section className="relative bg-gradient-to-b from-brand-goldLight/10 to-white py-16 md:py-20 overflow-hidden">
        <div className="container mx-auto max-w-4xl px-6 relative z-10">
          <div className="text-center mb-8">
            <div className="relative">
              <div className="relative mb-6 rounded-2xl bg-white p-8 shadow-2xl border-2 border-brand-gold/20">
                <h3 className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-brand-gold to-brand-goldDark">€{totalPrice}</h3>
                <p className="text-lg text-brand-grayMed my-6">Fixed fee for tax compliance service</p>
                <Button onClick={() => setStep('calendar')} size="lg" className="bg-gradient-to-r from-brand-gold to-brand-goldDark text-white min-w-64 h-14 text-lg">Book Your Consultation Now</Button>
              </div>
            </div>
          </div>
        </div>
      </section>
      <section className="bg-white py-20">
        <div className="container mx-auto max-w-7xl px-6">
          <div className="grid gap-12 lg:grid-cols-2">
            <div>
              <SectionHeading overline="SERVICE DETAILS" title="Tax Compliance Services" align="left" className="mb-8" />
              <p className="mb-6 text-lg text-brand-grayMed">Stay compliant with evolving tax regulations through our proactive monitoring and expert guidance.</p>
            </div>
            <div>
              <h3 className="mb-6 text-xl font-bold text-brand-dark">What's Included</h3>
              <div className="space-y-4">{features.map((feature) => (<div key={feature} className="flex items-start gap-3 p-4 rounded-xl bg-white/60"><CheckCircle className="mt-1 h-5 w-5 flex-shrink-0 text-brand-gold" /><p className="text-brand-dark">{feature}</p></div>))}</div>
            </div>
          </div>
        </div>
      </section>
      <section className="bg-gray-50 py-20">
        <div className="container mx-auto max-w-4xl px-6">
          <SectionHeading overline="WHY CHOOSE US" title="Benefits" align="center" className="mb-12" />
          <div className="grid gap-6 md:grid-cols-2">{benefits.map((benefit) => (<Card key={benefit}><CardContent className="flex items-start gap-4 p-6"><CheckCircle className="h-6 w-6 text-brand-gold flex-shrink-0 mt-1" /><p className="text-lg text-brand-dark">{benefit}</p></CardContent></Card>))}</div>
        </div>
      </section>
      <section className="hero-gradient py-20">
        <div className="container mx-auto max-w-4xl px-6 text-center">
          <h2 className="mb-6 text-3xl font-bold text-white md:text-4xl">Ready to Ensure Compliance?</h2>
          <p className="mx-auto mb-10 max-w-2xl text-lg text-white/90">Book your consultation now.</p>
          <div className="flex flex-col items-center gap-4 sm:flex-row justify-center">
            <Button onClick={() => setStep('calendar')} size="lg" className="bg-white text-brand-dark hover:bg-gray-50 min-w-48">Book - €{totalPrice}</Button>
            <Button asChild variant="outline" size="lg" className="border-2 border-white bg-transparent text-white hover:bg-white/10 min-w-48"><Link href={`/${locale}/tax-advisory`}>Back to Tax Advisory</Link></Button>
          </div>
        </div>
      </section>
      <Script src="https://assets.calendly.com/assets/external/widget.js" strategy="lazyOnload" />
      <Script src="https://www.paypal.com/sdk/js?client-id=AY2J7gUncxDdmNXWjLaw5E9A4Gz6X-hcQvagQBhi2erpaMLeHoaHbGIi7dgns3GZ3oFxg-wO0Xhwy0qo&currency=EUR" strategy="lazyOnload" onLoad={() => setPaypalLoaded(true)} />
    </>
  );
}
