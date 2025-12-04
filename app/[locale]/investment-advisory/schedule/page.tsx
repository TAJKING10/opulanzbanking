"use client";

import * as React from "react";
<<<<<<< HEAD
import { useTranslations, useLocale } from "next-intl";
import { Hero } from "@/components/hero";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Script from "next/script";
import { useState, useEffect, useRef } from "react";

export default function ScheduleInvestmentMeetingPage() {
  const t = useTranslations();
  const locale = useLocale();

  const [step, setStep] = useState<'calendar' | 'payment' | 'confirmation'>('calendar');
  const [bookingData, setBookingData] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [paypalLoaded, setPaypalLoaded] = useState(false);
  const [paymentCompleted, setPaymentCompleted] = useState(false);
  const paypalRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Listen for Calendly events
    const handleCalendlyEvent = (e: MessageEvent) => {
      if (e.data.event && e.data.event.indexOf('calendly') === 0) {
        console.log('Calendly Event:', e.data.event);

        // When user completes booking in Calendly
        if (e.data.event === 'calendly.event_scheduled') {
          console.log('Booking details:', e.data.payload);

          // Store booking data
          setBookingData({
            eventUri: e.data.payload.event.uri,
            inviteeUri: e.data.payload.invitee.uri,
            inviteeName: e.data.payload.invitee.name,
            inviteeEmail: e.data.payload.invitee.email,
            eventStartTime: e.data.payload.event.start_time,
            eventEndTime: e.data.payload.event.end_time,
          });

          // Move to payment step
          setStep('payment');
        }
      }
    };

    window.addEventListener('message', handleCalendlyEvent);

    return () => {
      window.removeEventListener('message', handleCalendlyEvent);
    };
  }, []);

  useEffect(() => {
    // Initialize PayPal buttons when step changes to payment and PayPal is loaded
    if (step === 'payment' && paypalLoaded && paypalRef.current && bookingData) {
      // Clear existing buttons
      paypalRef.current.innerHTML = '';

      // @ts-ignore
      if (window.paypal) {
        // @ts-ignore
        window.paypal.Buttons({
          style: {
            layout: 'vertical',
            color: 'gold',
            shape: 'rect',
            label: 'pay',
            height: 50
          },
          createOrder: function(data: any, actions: any) {
            return actions.order.create({
              purchase_units: [{
                description: 'Investment Advisory Consultation - 45 minutes',
                amount: {
                  currency_code: 'EUR',
                  value: '99.90'
                }
              }]
            });
          },
          onApprove: function(data: any, actions: any) {
            return actions.order.capture().then(function(details: any) {
              console.log('Payment completed:', details);
              setPaymentCompleted(true);
              // Don't move to confirmation yet - wait for user to click button
            });
          },
          onError: function(err: any) {
            console.error('PayPal error:', err);
            alert('Payment failed. Please try again.');
          }
        }).render(paypalRef.current);
      }
    }
  }, [step, paypalLoaded, bookingData]);

  const handlePaymentComplete = async () => {
    if (!paymentCompleted) {
      alert('Please complete the PayPal payment first.');
      return;
    }

    setLoading(true);

    try {
      if (!bookingData) {
        throw new Error('No booking data available');
      }

      // Format date and time for display
      const startDate = new Date(bookingData.eventStartTime);
      const endDate = new Date(bookingData.eventEndTime);

      // Save appointment to database
      const appointmentResponse = await fetch('http://localhost:5000/api/appointments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          full_name: bookingData.inviteeName,
          email: bookingData.inviteeEmail,
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
      });

      if (!appointmentResponse.ok) {
        const errorData = await appointmentResponse.json();
        console.error('Appointment creation failed:', errorData);
        // Continue even if appointment creation fails (might be duplicate)
      }

      // Send email notifications
      const notificationResponse = await fetch('http://localhost:5000/api/notifications/appointment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customerName: bookingData.inviteeName,
          customerEmail: bookingData.inviteeEmail,
          appointmentDate: startDate.toLocaleDateString('en-US', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric'
          }),
          appointmentTime: startDate.toLocaleTimeString('en-US', {
            hour: '2-digit',
            minute: '2-digit'
          }),
          meetingType: 'Investment Advisory'
        })
      });

      if (!notificationResponse.ok) {
        console.warn('Email notification failed, but appointment was created');
      }

      setStep('confirmation');
    } catch (error) {
      console.error('Error processing payment:', error);
      alert('There was an error processing your payment. Please contact support.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Hero
        title="Schedule Your Investment Advisory Meeting"
        subtitle="Book a convenient time to discuss your investment goals with our expert advisors"
      />

      <section className="bg-white py-20">
        <div className="container mx-auto max-w-5xl px-6">
          {/* Step 1: Calendly Calendar */}
          {step === 'calendar' && (
            <>
              <div className="mb-8 text-center">
                <h2 className="mb-4 text-2xl font-bold text-brand-dark md:text-3xl">
                  Choose a Time That Works for You
                </h2>
                <p className="text-brand-grayMed">
                  Select your preferred date and time from the calendar below. Our investment advisors are ready to help you build and grow your wealth.
                </p>
              </div>

              <Card className="border-none shadow-lg">
                <CardContent className="p-4 md:p-8">
                  {/* Calendly inline widget */}
                  <div
                    className="calendly-inline-widget"
                    data-url="https://calendly.com/opulanz-banking/tax-advisory-clone?hide_event_type_details=1&primary_color=d0ab08"
                    style={{ minWidth: '320px', height: '700px' }}
                  />
                </CardContent>
              </Card>

              {/* Information Section */}
              <div className="mt-12 grid gap-8 md:grid-cols-3">
                <div className="text-center">
                  <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-full bg-brand-goldLight">
                    <svg className="h-6 w-6 text-brand-goldDark" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <h3 className="mb-2 text-lg font-bold text-brand-dark">45-Minute Consultation</h3>
                  <p className="text-sm text-brand-grayMed">
                    Comprehensive consultation to understand your investment needs
                  </p>
                </div>

                <div className="text-center">
                  <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-full bg-brand-goldLight">
                    <svg className="h-6 w-6 text-brand-goldDark" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <h3 className="mb-2 text-lg font-bold text-brand-dark">Video Conference</h3>
                  <p className="text-sm text-brand-grayMed">
                    Secure online meeting via your preferred platform
                  </p>
                </div>

                <div className="text-center">
                  <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-full bg-brand-goldLight">
                    <svg className="h-6 w-6 text-brand-goldDark" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                    </svg>
                  </div>
                  <h3 className="mb-2 text-lg font-bold text-brand-dark">Confidential & Secure</h3>
                  <p className="text-sm text-brand-grayMed">
                    All discussions are strictly confidential
                  </p>
                </div>
              </div>

              {/* What to Prepare Section */}
              <div className="mt-12 rounded-lg bg-brand-off p-8">
                <h3 className="mb-4 text-xl font-bold text-brand-dark">What to Prepare for Your Meeting</h3>
                <ul className="space-y-3 text-brand-grayMed">
                  <li className="flex items-start gap-3">
                    <svg className="mt-1 h-5 w-5 flex-shrink-0 text-brand-gold" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    <span>Overview of your current financial situation and investment portfolio</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <svg className="mt-1 h-5 w-5 flex-shrink-0 text-brand-gold" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    <span>Your short-term and long-term financial goals</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <svg className="mt-1 h-5 w-5 flex-shrink-0 text-brand-gold" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    <span>Information about your risk tolerance and investment timeline</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <svg className="mt-1 h-5 w-5 flex-shrink-0 text-brand-gold" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    <span>List of questions or specific investment concerns you'd like to address</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <svg className="mt-1 h-5 w-5 flex-shrink-0 text-brand-gold" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    <span>Recent account statements (if available)</span>
                  </li>
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
                  Time Slot Reserved!
                </h2>
                <p className="text-brand-grayMed">
                  Complete your payment to confirm your appointment.
                </p>
              </div>

              <Card className="mb-8 border-brand-gold/30 shadow-lg">
                <CardContent className="p-8">
                  <h3 className="mb-4 text-xl font-bold text-brand-dark">Your Appointment Details</h3>
                  <div className="space-y-3">
                    <div className="flex justify-between border-b border-brand-grayLight/30 pb-2">
                      <span className="text-brand-grayMed">Name:</span>
                      <span className="font-semibold text-brand-dark">{bookingData.inviteeName}</span>
                    </div>
                    <div className="flex justify-between border-b border-brand-grayLight/30 pb-2">
                      <span className="text-brand-grayMed">Email:</span>
                      <span className="font-semibold text-brand-dark">{bookingData.inviteeEmail}</span>
                    </div>
                    <div className="flex justify-between border-b border-brand-grayLight/30 pb-2">
                      <span className="text-brand-grayMed">Date:</span>
                      <span className="font-semibold text-brand-dark">
                        {new Date(bookingData.eventStartTime).toLocaleDateString('en-US', {
                          weekday: 'long',
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric'
                        })}
                      </span>
                    </div>
                    <div className="flex justify-between border-b border-brand-grayLight/30 pb-2">
                      <span className="text-brand-grayMed">Time:</span>
                      <span className="font-semibold text-brand-dark">
                        {new Date(bookingData.eventStartTime).toLocaleTimeString('en-US', {
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-brand-grayMed">Duration:</span>
                      <span className="font-semibold text-brand-dark">45 minutes</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-none shadow-lg">
                <CardContent className="p-8 md:p-12">
                  <div className="text-center">
                    <div className="mb-6">
                      <h3 className="mb-2 text-xl font-bold text-brand-dark">
                        Complete Your Payment
                      </h3>
                      <p className="text-3xl font-bold text-brand-gold">€99.90</p>
                      <p className="mt-2 text-sm text-brand-grayMed">
                        One-time payment for 45-minute consultation
                      </p>
                    </div>

                    {/* PayPal Button Container */}
                    <div className="mx-auto max-w-md">
                      <div ref={paypalRef} id="paypal-button-container"></div>

                      <div className="mt-6 rounded-lg bg-blue-50 p-4">
                        <p className="text-sm text-blue-800">
                          <strong>Testing:</strong> Use card{' '}
                          <code className="rounded bg-blue-100 px-2 py-1">4111 1111 1111 1111</code>
                          {' '}(Expiry: 12/2030, CVV: 123) - No verification!
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
                            <span className="font-semibold">Payment Successful!</span>
                          </div>
                        </div>

                        <Button
                          type="button"
                          onClick={handlePaymentComplete}
                          disabled={loading}
                          className="bg-brand-gold text-white hover:bg-brand-goldDark"
                        >
                          {loading ? 'Processing...' : 'Continue to Confirmation'}
                        </Button>
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
                  Payment Confirmed!
                </h2>
                <p className="mb-8 text-brand-grayMed">
                  Thank you for your payment. Your appointment is now confirmed. We've sent confirmation emails to both you and our team.
                </p>

                <Card className="mb-8 border-brand-gold/30 shadow-lg">
                  <CardContent className="p-8">
                    <h3 className="mb-4 text-xl font-bold text-brand-dark">Confirmed Appointment</h3>
                    <div className="space-y-3 text-left">
                      <div className="flex justify-between border-b border-brand-grayLight/30 pb-2">
                        <span className="text-brand-grayMed">Service:</span>
                        <span className="font-semibold text-brand-dark">Investment Advisory</span>
                      </div>
                      <div className="flex justify-between border-b border-brand-grayLight/30 pb-2">
                        <span className="text-brand-grayMed">Name:</span>
                        <span className="font-semibold text-brand-dark">{bookingData.inviteeName}</span>
                      </div>
                      <div className="flex justify-between border-b border-brand-grayLight/30 pb-2">
                        <span className="text-brand-grayMed">Date:</span>
                        <span className="font-semibold text-brand-dark">
                          {new Date(bookingData.eventStartTime).toLocaleDateString('en-US', {
                            weekday: 'long',
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric'
                          })}
                        </span>
                      </div>
                      <div className="flex justify-between border-b border-brand-grayLight/30 pb-2">
                        <span className="text-brand-grayMed">Time:</span>
                        <span className="font-semibold text-brand-dark">
                          {new Date(bookingData.eventStartTime).toLocaleTimeString('en-US', {
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-brand-grayMed">Duration:</span>
                        <span className="font-semibold text-brand-dark">45 minutes</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <div className="rounded-lg bg-brand-goldLight/20 p-6">
                  <h4 className="mb-3 font-semibold text-brand-dark">What's Next?</h4>
                  <ul className="space-y-2 text-sm text-brand-grayMed">
                    <li>✓ Check your email ({bookingData.inviteeEmail}) for the meeting link and calendar invite</li>
                    <li>✓ Prepare your financial documents and questions</li>
                    <li>✓ Join the video conference at your scheduled time</li>
                    <li>✓ Our team has been notified at opulanz.banking@gmail.com</li>
                  </ul>
                </div>

                <Button
                  onClick={() => window.location.href = `/${locale}`}
                  className="mt-8 bg-brand-gold text-white hover:bg-brand-goldDark"
                >
                  Return to Home
                </Button>
              </div>
            </>
          )}
=======
import { KYCWizardProvider } from "@/contexts/KYCWizardContext";
import { KYCWizard } from "@/components/kyc/KYCWizard";

export default function InvestmentOnboardingPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-gray-50 py-12">
      <div className="container mx-auto max-w-5xl px-6">
        <div className="mb-8 text-center">
          <div className="inline-block mb-4 px-4 py-2 bg-brand-gold/10 rounded-full">
            <span className="text-sm font-semibold text-brand-gold">Investment Advisory Onboarding</span>
          </div>
          <h1 className="text-3xl md:text-4xl font-bold text-brand-dark mb-4">
            Client Information & Compliance (KYC)
          </h1>
          <p className="text-lg text-brand-grayMed max-w-2xl mx-auto">
            To provide you with personalized investment advisory services, we need to collect
            some information for regulatory compliance and to understand your investment profile.
          </p>
>>>>>>> feature/kyc-wizard
        </div>

<<<<<<< HEAD
      {/* Load Calendly widget script */}
      <Script
        src="https://assets.calendly.com/assets/external/widget.js"
        strategy="lazyOnload"
      />

      {/* Load PayPal SDK - Using PayPal Sandbox Credentials */}
      <Script
        src="https://www.paypal.com/sdk/js?client-id=AY2J7gUncxDdmNXWjLaw5E9A4Gz6X-hcQvagQBhi2erpaMLeHoaHbGIi7dgns3GZ3oFxg-wO0Xhwy0qo&currency=EUR"
        strategy="lazyOnload"
        onLoad={() => setPaypalLoaded(true)}
      />
    </>
=======
        <div className="bg-white rounded-2xl shadow-xl p-8 md:p-12">
          <KYCWizardProvider>
            <KYCWizard />
          </KYCWizardProvider>
        </div>

        <div className="mt-8 text-center">
          <p className="text-sm text-brand-grayMed">
            🔒 Your information is encrypted and secure. We comply with GDPR and French banking regulations (ACPR, AMF).
          </p>
        </div>
      </div>
    </div>
>>>>>>> feature/kyc-wizard
  );
}
