"use client";

import * as React from "react";
import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { Globe, CheckCircle, Clock, Euro } from "lucide-react";
import { Hero } from "@/components/hero";
import { SectionHeading } from "@/components/section-heading";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import emailjs from '@emailjs/browser';

export default function InternationalTaxPage({ params: { locale } }: { params: { locale: string } }) {
  const [step, setStep] = useState<'info' | 'calendar' | 'payment' | 'confirmation'>('info');
  const [bookingData, setBookingData] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [paypalLoaded, setPaypalLoaded] = useState(false);
  const [paymentCompleted, setPaymentCompleted] = useState(false);
  const [paymentDetails, setPaymentDetails] = useState<any>(null);
  const [calendlyLoaded, setCalendlyLoaded] = useState(false);
  const [useManualBooking, setUseManualBooking] = useState(false);
  const paypalRef = useRef<HTMLDivElement>(null);

  const totalPrice = 250;
  const servicePrice = totalPrice / 1.17; // Price without VAT
  const vat = totalPrice - servicePrice;

  // Reset function to clear all booking data
  const resetBooking = () => {
    localStorage.removeItem('internationalTaxBookingData');
    localStorage.removeItem('internationalTaxStep');
    setBookingData(null);
    setPaymentCompleted(false);
    setPaymentDetails(null);
    setUseManualBooking(false);
    setStep('info');
  };

  // Manual booking form submission
  const handleManualBooking = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);

    const dateStr = formData.get('date') as string;
    const timeStr = formData.get('time') as string;
    const eventStartTime = `${dateStr}T${timeStr}`;

    // Calculate end time (60 minutes later)
    const startDate = new Date(eventStartTime);
    const endDate = new Date(startDate.getTime() + 60 * 60 * 1000);
    const eventEndTime = endDate.toISOString();

    // Merge with existing bookingData (if from Calendly) or create new
    const completeBookingInfo = {
      ...(bookingData || {}),
      inviteeName: formData.get('name') as string,
      inviteeEmail: formData.get('email') as string,
      eventStartTime: eventStartTime,
      eventEndTime: eventEndTime,
      // If not from Calendly, generate manual URIs
      eventUri: bookingData?.eventUri || `manual-${Date.now()}`,
      inviteeUri: bookingData?.inviteeUri || `manual-invitee-${Date.now()}`,
    };

    console.log('✅ Complete booking info:', completeBookingInfo);
    setBookingData(completeBookingInfo);
    setStep('payment');
  };

  // Load booking data from localStorage on mount
  useEffect(() => {
    const savedBookingData = localStorage.getItem('internationalTaxBookingData');
    const savedStep = localStorage.getItem('internationalTaxStep');

    if (savedBookingData) {
      try {
        const parsedData = JSON.parse(savedBookingData);
        setBookingData(parsedData);
        if (savedStep && ['info', 'calendar', 'payment', 'confirmation'].includes(savedStep)) {
          setStep(savedStep as any);
        }
      } catch (error) {
        console.error('Error loading booking data:', error);
        localStorage.removeItem('internationalTaxBookingData');
        localStorage.removeItem('internationalTaxStep');
      }
    }
  }, []);

  // Save booking data to localStorage whenever it changes
  useEffect(() => {
    if (bookingData) {
      localStorage.setItem('internationalTaxBookingData', JSON.stringify(bookingData));
      localStorage.setItem('internationalTaxStep', step);
    }
  }, [bookingData, step]);
  // Initialize EmailJS
  useEffect(() => {
    emailjs.init('YOUR_PUBLIC_KEY'); // Replace with your EmailJS public key
  }, []);

  // Generate PDF receipt
  const generatePDFReceipt = () => {
    if (!bookingData || !bookingData.paymentDetails) return;

    const pd = bookingData.paymentDetails;
    const receiptContent = `
╔══════════════════════════════════════════════════════════════╗
║           OPULANZ BANKING - PAYMENT RECEIPT                  ║
╚══════════════════════════════════════════════════════════════╝

APPOINTMENT DETAILS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Service:        International Tax Consultation
Date:           ${new Date(bookingData.eventStartTime).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
Time:           ${new Date(bookingData.eventStartTime).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
Duration:       60 minutes

CLIENT INFORMATION
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Name:           ${bookingData.inviteeName}
Email:          ${bookingData.inviteeEmail}

PAYMENT INFORMATION
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
PayPal Order ID:    ${pd.orderId}
PayPal Payer ID:    ${pd.payerId}
Payer Name:         ${pd.payerName}
Payer Email:        ${pd.payerEmail}
Payment Status:     ${pd.status}
Payment Date:       ${new Date(pd.timestamp).toLocaleString('en-US', {
  year: 'numeric',
  month: 'long',
  day: 'numeric',
  hour: '2-digit',
  minute: '2-digit',
  second: '2-digit',
  timeZoneName: 'short'
})}

AMOUNT BREAKDOWN
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Service Fee (excl. VAT):    €${(250 / 1.17).toFixed(2)}
VAT (17%):                   €${(250 - 250 / 1.17).toFixed(2)}
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
TOTAL PAID:                  €${pd.amount} ${pd.currency}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
This is an official receipt for your payment to Opulanz Banking.
Please keep this receipt for your records.

For questions or support, contact us at:
Email: opulanz.banking@gmail.com
Web: www.opulanzbanking.com

Thank you for choosing Opulanz Banking!
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Receipt Generated: ${new Date().toLocaleString('en-US')}
    `;

    const blob = new Blob([receiptContent], { type: 'text/plain' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Opulanz-Receipt-${pd.orderId}.txt`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  // Send email receipts
  const sendEmailReceipts = async () => {
    if (!bookingData || !bookingData.paymentDetails) return;

    const templateParams = {
      to_email: bookingData.inviteeEmail,
      to_name: bookingData.inviteeName,
      service_name: 'International Tax',
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
 // VAT amount

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


  // Listen for Calendly events
  useEffect(() => {
    const handleCalendlyEvent = (e: MessageEvent) => {
      // Only process Calendly events
      if (!e.data.event || e.data.event.indexOf('calendly') !== 0) {
        return;
      }

      console.log('🎯 Calendly Event:', e.data.event);
      console.log('📦 Full event data:', e.data);

      if (e.data.event === 'calendly.event_scheduled') {
        console.log('✅ EVENT SCHEDULED! Processing...');
        console.log('📋 Payload:', e.data.payload);

        try {
          // Calendly sends data in the payload
          const payload = e.data.payload;

          if (!payload) {
            console.error('❌ No payload received from Calendly');
            alert('Calendly booking failed. Please use Manual Booking instead.');
            setUseManualBooking(true);
            return;
          }

          console.log('📋 Full Payload Structure:', JSON.stringify(payload, null, 2));

          // Calendly inline widget limitation: only provides URIs, not actual data
          // Solution: Show manual form with the Calendly URIs pre-filled
          const eventUri = payload.event?.uri || '';
          const inviteeUri = payload.invitee?.uri || '';

          console.log('✅ Calendly booking successful!');
          console.log('🔗 Event URI:', eventUri);
          console.log('🔗 Invitee URI:', inviteeUri);
          console.log('📝 Switching to manual form to collect details');

          // Store the Calendly URIs
          setBookingData({
            eventUri: eventUri,
            inviteeUri: inviteeUri,
            isFromCalendly: true
          });

          // Show manual form to collect user details
          alert('✅ Time slot reserved on Calendly!\n\nPlease fill in your details to complete the booking.');
          setUseManualBooking(true);

        } catch (error) {
          console.error('❌ Error processing Calendly event:', error);
          alert('Error processing booking. Please use Manual Booking instead.');
          setUseManualBooking(true);
        }
      }
    };

    window.addEventListener('message', handleCalendlyEvent);
    return () => window.removeEventListener('message', handleCalendlyEvent);
  }, []);

  // Initialize PayPal buttons
  useEffect(() => {
    if (step === 'payment' && paypalLoaded && paypalRef.current && bookingData) {
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
                description: 'International Tax - 60 minutes',
                amount: {
                  currency_code: 'EUR',
                  value: totalPrice.toFixed(2)
                }
              }]
            });
          },
          onApprove: function(data: any, actions: any) {
            return actions.order.capture().then(function(details: any) {
              console.log('Payment completed:', details);

              // Extract payment information from PayPal response
              const paymentInfo = {
                orderId: details.id,
                payerId: details.payer.payer_id,
                payerEmail: details.payer.email_address,
                payerName: details.payer.name.given_name + ' ' + details.payer.name.surname,
                amount: details.purchase_units[0].amount.value,
                currency: details.purchase_units[0].amount.currency_code,
                status: details.status,
                timestamp: details.create_time,
                updateTime: details.update_time
              };

              console.log('Payment info:', paymentInfo);
              setPaymentDetails(paymentInfo);
              setPaymentCompleted(true);
            });
          },
          onError: function(err: any) {
            console.error('PayPal error:', err);
            alert('Payment failed. Please try again.');
          }
        }).render(paypalRef.current);
      }
    }
  }, [step, paypalLoaded, bookingData, totalPrice]);

  const handlePaymentComplete = async () => {
    if (!paymentCompleted || !paymentDetails) {
      alert('Please complete the PayPal payment first.');
      return;
    }

    setLoading(true);

    try {
      if (!bookingData) {
        throw new Error('No booking data available');
      }

      await fetch('http://localhost:5000/api/appointments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          full_name: bookingData.inviteeName,
          email: bookingData.inviteeEmail,
          calendly_id: bookingData.eventUri,
          calendly_event_uri: bookingData.eventUri,
          meeting_type: 'International Tax',
          status: 'confirmed',
          start_time: bookingData.eventStartTime,
          end_time: bookingData.eventEndTime,
          timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
          location: 'Video Conference',
          notes: `Paid consultation - €${totalPrice} - PayPal Order ID: ${paymentDetails.orderId}`
        })
      });

      // Store payment details in booking data for receipt generation
      const updatedBookingData = {
        ...bookingData,
        paymentDetails: {
          orderId: paymentDetails.orderId,
          payerId: paymentDetails.payerId,
          payerEmail: paymentDetails.payerEmail,
          payerName: paymentDetails.payerName,
          amount: paymentDetails.amount,
          currency: paymentDetails.currency,
          status: paymentDetails.status,
          timestamp: paymentDetails.timestamp,
          updateTime: paymentDetails.updateTime
        }
      };
      setBookingData(updatedBookingData);

      sendEmailReceipts();

      setStep('confirmation');
    } catch (error) {
      console.error('Error processing payment:', error);
      alert('There was an error processing your payment. Please contact support.');
    } finally {
      setLoading(false);
    }
  };

  const features = [
    "Expert guidance on cross-border tax matters",
    "Transfer pricing analysis and documentation",
    "Double taxation treaty optimization",
    "International tax structuring advice",
    "Cross-border transaction planning",
    "Compliance with multiple jurisdictions",
  ];

  const benefits = [
    "Minimize international tax exposure",
    "Navigate complex cross-border regulations",
    "Optimize global tax structures",
    "Expert knowledge of EU and international tax law",
  ];

  // Step 3: Confirmation
  if (step === 'confirmation' && bookingData) {
    // Validate and format appointment details
    const appointmentName = bookingData.inviteeName || 'Not provided';
    const appointmentEmail = bookingData.inviteeEmail || 'Not provided';
    const startDate = bookingData.eventStartTime ? new Date(bookingData.eventStartTime) : null;
    const isValidDate = startDate && !isNaN(startDate.getTime());

    const formattedDate = isValidDate
      ? startDate!.toLocaleDateString('en-US', {
          weekday: 'long',
          year: 'numeric',
          month: 'long',
          day: 'numeric'
        })
      : 'Date not set';

    const formattedTime = isValidDate
      ? startDate!.toLocaleTimeString('en-US', {
          hour: '2-digit',
          minute: '2-digit'
        })
      : 'Time not set';

    return (
      <>
        <section className="hero-gradient py-16 md:py-20">
          <div className="container mx-auto max-w-4xl px-6">
            <div className="text-center">
              <div className="mb-6 inline-flex h-20 w-20 items-center justify-center rounded-full bg-green-500">
                <CheckCircle className="h-12 w-12 text-white" />
              </div>
              <h1 className="mb-4 text-3xl font-bold text-white md:text-4xl lg:text-5xl">
                Payment Confirmed!
              </h1>
              <p className="text-lg text-white/90">
                Thank you for your payment. Your appointment is now confirmed.
              </p>
            </div>
          </div>
        </section>

        <section className="bg-white py-12 md:py-16">
          <div className="container mx-auto max-w-3xl px-6">
            <Card className="mb-8 border-brand-gold/30 shadow-lg">
              <CardContent className="p-8">
                <h3 className="mb-4 text-xl font-bold text-brand-dark">Confirmed Appointment</h3>
                <div className="space-y-3 text-left">
                  <div className="flex justify-between border-b border-brand-grayLight/30 pb-2">
                    <span className="text-brand-grayMed">Service:</span>
                    <span className="font-semibold text-brand-dark">International Tax</span>
                  </div>
                  <div className="flex justify-between border-b border-brand-grayLight/30 pb-2">
                    <span className="text-brand-grayMed">Name:</span>
                    <span className="font-semibold text-brand-dark">{appointmentName}</span>
                  </div>
                  <div className="flex justify-between border-b border-brand-grayLight/30 pb-2">
                    <span className="text-brand-grayMed">Email:</span>
                    <span className="font-semibold text-brand-dark">{appointmentEmail}</span>
                  </div>
                  <div className="flex justify-between border-b border-brand-grayLight/30 pb-2">
                    <span className="text-brand-grayMed">Date:</span>
                    <span className="font-semibold text-brand-dark">{formattedDate}</span>
                  </div>
                  <div className="flex justify-between border-b border-brand-grayLight/30 pb-2">
                    <span className="text-brand-grayMed">Time:</span>
                    <span className="font-semibold text-brand-dark">{formattedTime}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-brand-grayMed">Duration:</span>
                    <span className="font-semibold text-brand-dark">60 minutes</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {bookingData.paymentDetails && (
              <Card className="mb-8 border-green-200 bg-green-50/50 shadow-lg">
                <CardContent className="p-8">
                  <div className="flex items-center gap-2 mb-4">
                    <CheckCircle className="h-5 w-5 text-green-600" />
                    <h3 className="text-xl font-bold text-brand-dark">Payment Receipt</h3>
                  </div>
                  <div className="space-y-3 text-left">
                    <div className="flex justify-between border-b border-green-200 pb-2">
                      <span className="text-brand-grayMed">PayPal Order ID:</span>
                      <span className="font-mono text-sm font-semibold text-brand-dark">{bookingData.paymentDetails.orderId}</span>
                    </div>
                    <div className="flex justify-between border-b border-green-200 pb-2">
                      <span className="text-brand-grayMed">Payer Name:</span>
                      <span className="font-semibold text-brand-dark">{bookingData.paymentDetails.payerName}</span>
                    </div>
                    <div className="flex justify-between border-b border-green-200 pb-2">
                      <span className="text-brand-grayMed">Payer Email:</span>
                      <span className="font-semibold text-brand-dark">{bookingData.paymentDetails.payerEmail}</span>
                    </div>
                    <div className="flex justify-between border-b border-green-200 pb-2">
                      <span className="text-brand-grayMed">Amount Paid:</span>
                      <span className="font-semibold text-brand-dark">€{bookingData.paymentDetails.amount} {bookingData.paymentDetails.currency}</span>
                    </div>
                    <div className="flex justify-between border-b border-green-200 pb-2">
                      <span className="text-brand-grayMed">Payment Status:</span>
                      <span className="font-semibold text-green-600">{bookingData.paymentDetails.status}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-brand-grayMed">Payment Date:</span>
                      <span className="font-semibold text-brand-dark">
                        {new Date(bookingData.paymentDetails.timestamp).toLocaleString('en-US', {
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            <div className="rounded-lg bg-brand-goldLight/20 p-6 mb-8">
              <h4 className="mb-3 font-semibold text-brand-dark">What's Next?</h4>
              <ul className="space-y-2 text-sm text-brand-grayMed">
                <li>✓ Check your email ({appointmentEmail}) for the meeting link and calendar invite</li>
                <li>✓ Prepare your tax documents and questions</li>
                <li>✓ Join the video conference at your scheduled time</li>
                <li>✓ Our team has been notified and will be ready for your consultation</li>
              </ul>
            </div>

            <div className="flex flex-col gap-4">
              <Button
                onClick={generatePDFReceipt}
                variant="outline"
                className="w-full border-2 border-brand-gold text-brand-gold hover:bg-brand-goldLight/10"
              >
                Download Receipt
              </Button>
              <Button
                onClick={() => {
                  resetBooking();
                  window.location.href = `/${locale}`;
                }}
                className="w-full bg-brand-gold text-white hover:bg-brand-goldDark"
              >
                Return to Home
              </Button>
            </div>
          </div>
        </section>

        </>
    );
  }

  // If payment step but no booking data, redirect to calendar
  if (step === 'payment' && !bookingData) {
    // Clear localStorage and redirect
    localStorage.removeItem('internationalTaxBookingData');
    localStorage.removeItem('internationalTaxStep');
    setStep('calendar');
    return null;
  }

  // If confirmation step but no booking data, show error and reset
  if (step === 'confirmation' && (!bookingData || !bookingData.inviteeName || !bookingData.eventStartTime)) {
    return (
      <>
        <section className="hero-gradient py-16 md:py-20">
          <div className="container mx-auto max-w-4xl px-6">
            <div className="text-center">
              <div className="mb-6 inline-flex h-20 w-20 items-center justify-center rounded-full bg-red-500">
                <CheckCircle className="h-12 w-12 text-white" />
              </div>
              <h1 className="mb-4 text-3xl font-bold text-white md:text-4xl lg:text-5xl">
                No Booking Found
              </h1>
              <p className="text-lg text-white/90 mb-8">
                You need to book an appointment through Calendly first before seeing the confirmation.
              </p>
              <Button
                onClick={resetBooking}
                size="lg"
                className="bg-white text-brand-dark hover:bg-gray-50"
              >
                Start Fresh - Book Appointment
              </Button>
            </div>
          </div>
        </section>
      </>
    );
  }

  // Step 2: Payment
  if (step === 'payment' && bookingData) {
    // Validate booking data - if missing critical info, redirect to calendar
    if (!bookingData.inviteeName || !bookingData.inviteeEmail || !bookingData.eventStartTime) {
      console.error('Invalid booking data:', bookingData);
      resetBooking();
      return null;
    }

    // Validate and format appointment details
    const appointmentName = bookingData.inviteeName;
    const appointmentEmail = bookingData.inviteeEmail;
    const startDate = new Date(bookingData.eventStartTime);
    const isValidDate = startDate && !isNaN(startDate.getTime());

    if (!isValidDate) {
      console.error('Invalid date:', bookingData.eventStartTime);
      resetBooking();
      return null;
    }

    const formattedDate = startDate.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });

    const formattedTime = startDate.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit'
    });

    return (
      <>
        <section className="hero-gradient py-16 md:py-20">
          <div className="container mx-auto max-w-4xl px-6">
            <div className="text-center">
              <div className="mb-6 inline-flex h-16 w-16 items-center justify-center rounded-full bg-green-500">
                <CheckCircle className="h-10 w-10 text-white" />
              </div>
              <h1 className="mb-4 text-3xl font-bold text-white md:text-4xl lg:text-5xl">
                Time Slot Reserved!
              </h1>
              <p className="text-lg text-white/90">
                Complete your payment to confirm your booking
              </p>
            </div>
          </div>
        </section>

        <section className="bg-white py-12 md:py-16">
          <div className="container mx-auto max-w-3xl px-6">
            <Card className="mb-8 border-brand-gold/30 shadow-lg">
              <CardContent className="p-8">
                <h3 className="mb-4 text-xl font-bold text-brand-dark">Your Appointment Details</h3>
                <div className="space-y-3">
                  <div className="flex justify-between border-b border-brand-grayLight/30 pb-2">
                    <span className="text-brand-grayMed">Name:</span>
                    <span className="font-semibold text-brand-dark">{appointmentName}</span>
                  </div>
                  <div className="flex justify-between border-b border-brand-grayLight/30 pb-2">
                    <span className="text-brand-grayMed">Email:</span>
                    <span className="font-semibold text-brand-dark">{appointmentEmail}</span>
                  </div>
                  <div className="flex justify-between border-b border-brand-grayLight/30 pb-2">
                    <span className="text-brand-grayMed">Date:</span>
                    <span className="font-semibold text-brand-dark">{formattedDate}</span>
                  </div>
                  <div className="flex justify-between border-b border-brand-grayLight/30 pb-2">
                    <span className="text-brand-grayMed">Time:</span>
                    <span className="font-semibold text-brand-dark">{formattedTime}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-brand-grayMed">Duration:</span>
                    <span className="font-semibold text-brand-dark">60 minutes</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-2 border-brand-grayLight mb-8">
              <CardContent className="p-8">
                <div className="flex items-start gap-4 mb-6">
                  <div className="inline-flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-lg bg-brand-gold/10">
                    <Globe className="h-6 w-6 text-brand-gold" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-xl font-bold text-brand-dark mb-2">International Tax</h3>
                    <p className="text-sm text-brand-grayMed mb-2">Expert guidance on cross-border tax matters and transfer pricing</p>
                    <p className="text-sm text-brand-grayMed">Duration: 60 minutes</p>
                  </div>
                </div>

                <div className="border-t border-brand-grayLight pt-6">
                  <div className="flex justify-between items-center text-lg mb-3">
                    <span className="text-brand-grayMed">Service Fee (excl. VAT):</span>
                    <span className="font-semibold text-brand-dark">€{servicePrice.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between items-center text-lg mb-3">
                    <span className="text-brand-grayMed">VAT (17%):</span>
                    <span className="font-semibold text-brand-dark">€{vat.toFixed(2)}</span>
                  </div>
                  <div className="border-t border-brand-grayLight pt-4 mt-4">
                    <div className="flex justify-between items-center">
                      <span className="text-xl font-bold text-brand-dark">Total (incl. VAT):</span>
                      <span className="text-3xl font-bold text-brand-gold">€{totalPrice.toFixed(2)}</span>
                    </div>
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
                    <p className="text-3xl font-bold text-brand-gold">€{totalPrice.toFixed(2)}</p>
                    <p className="mt-2 text-sm text-brand-grayMed">
                      One-time payment for 60-minute consultation
                    </p>
                  </div>

                  <div className="mx-auto max-w-md">
                    <div ref={paypalRef} id="paypal-button-container"></div>

                    <div className="mt-6 rounded-lg bg-blue-50 p-4">
                      <p className="text-sm text-blue-800">
                        <strong>Testing:</strong> Use card{' '}
                        <code className="rounded bg-blue-100 px-2 py-1">4111 1111 1111 1111</code>
                        {' '}(Expiry: 12/2030, CVV: 123)
                      </p>
                    </div>
                  </div>

                  {paymentCompleted && (
                    <div className="mt-6">
                      <div className="mb-4 rounded-lg bg-green-50 p-4 text-green-800">
                        <div className="flex items-center justify-center gap-2">
                          <CheckCircle className="h-5 w-5" />
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
          </div>
        </section>

        </>
    );
  }

  // Step 1: Calendar
  if (step === 'calendar') {
    if (useManualBooking) {
      // Manual booking form
      return (
        <>
          <section className="hero-gradient py-16 md:py-20">
            <div className="container mx-auto max-w-4xl px-6">
              <div className="text-center">
                <h1 className="mb-4 text-3xl font-bold text-white md:text-4xl lg:text-5xl">
                  Book Your Consultation
                </h1>
                <p className="text-lg text-white/90">
                  Fill in your details to proceed with payment
                </p>
              </div>
            </div>
          </section>

          <section className="bg-white py-12 md:py-16">
            <div className="container mx-auto max-w-2xl px-6">
              <Card className="border-2 border-brand-gold/30">
                <CardContent className="p-8">
                  <form onSubmit={handleManualBooking} className="space-y-6">
                    <div>
                      <label htmlFor="name" className="block text-sm font-semibold text-brand-dark mb-2">
                        Full Name *
                      </label>
                      <input
                        type="text"
                        id="name"
                        name="name"
                        required
                        className="w-full rounded-lg border-2 border-brand-grayLight px-4 py-3 focus:border-brand-gold focus:outline-none"
                        placeholder="John Smith"
                      />
                    </div>

                    <div>
                      <label htmlFor="email" className="block text-sm font-semibold text-brand-dark mb-2">
                        Email Address *
                      </label>
                      <input
                        type="email"
                        id="email"
                        name="email"
                        required
                        className="w-full rounded-lg border-2 border-brand-grayLight px-4 py-3 focus:border-brand-gold focus:outline-none"
                        placeholder="john@example.com"
                      />
                    </div>

                    <div>
                      <label htmlFor="date" className="block text-sm font-semibold text-brand-dark mb-2">
                        Preferred Date *
                      </label>
                      <input
                        type="date"
                        id="date"
                        name="date"
                        required
                        min={new Date().toISOString().split('T')[0]}
                        className="w-full rounded-lg border-2 border-brand-grayLight px-4 py-3 focus:border-brand-gold focus:outline-none"
                      />
                    </div>

                    <div>
                      <label htmlFor="time" className="block text-sm font-semibold text-brand-dark mb-2">
                        Preferred Time *
                      </label>
                      <input
                        type="time"
                        id="time"
                        name="time"
                        required
                        className="w-full rounded-lg border-2 border-brand-grayLight px-4 py-3 focus:border-brand-gold focus:outline-none"
                      />
                    </div>

                    <div className="bg-brand-goldLight/20 rounded-lg p-4">
                      <p className="text-sm text-brand-dark">
                        <strong>Note:</strong> This is a preferred time. We'll contact you to confirm availability.
                      </p>
                    </div>

                    <div className="flex gap-4">
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => setUseManualBooking(false)}
                        className="flex-1"
                      >
                        Back to Calendly
                      </Button>
                      <Button
                        type="submit"
                        className="flex-1 bg-brand-gold text-white hover:bg-brand-goldDark"
                      >
                        Continue to Payment
                      </Button>
                    </div>
                  </form>
                </CardContent>
              </Card>
            </div>
          </section>
        </>
      );
    }

    // Calendly widget view
    return (
      <>
        <section className="hero-gradient py-16 md:py-20">
          <div className="container mx-auto max-w-4xl px-6">
            <div className="text-center">
              <h1 className="mb-4 text-3xl font-bold text-white md:text-4xl lg:text-5xl">
                Book Your International Tax Consultation
              </h1>
              <p className="text-lg text-white/90">
                Schedule your 60-minute consultation - €{totalPrice}
              </p>
            </div>
          </div>
        </section>

        <section className="bg-white py-12 md:py-16">
          <div className="container mx-auto max-w-5xl px-6">
            <div className="mb-6 text-center">
              <Button
                onClick={() => setUseManualBooking(true)}
                variant="outline"
                className="border-2 border-brand-gold text-brand-gold hover:bg-brand-goldLight/10"
              >
                Having trouble with Calendly? Use Manual Booking →
              </Button>
            </div>

            <div className="grid gap-8 md:grid-cols-3 mb-8">
              <div className="text-center">
                <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-full bg-brand-goldLight">
                  <Clock className="h-6 w-6 text-brand-goldDark" />
                </div>
                <h3 className="mb-2 text-lg font-bold text-brand-dark">60-Minute Consultation</h3>
                <p className="text-sm text-brand-grayMed">
                  Professional consultation session with our expert tax advisor
                </p>
              </div>

              <div className="text-center">
                <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-full bg-brand-goldLight">
                  <Euro className="h-6 w-6 text-brand-goldDark" />
                </div>
                <h3 className="mb-2 text-lg font-bold text-brand-dark">€{totalPrice} Fee</h3>
                <p className="text-sm text-brand-grayMed">
                  Fixed price for international tax service
                </p>
              </div>

              <div className="text-center">
                <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-full bg-brand-goldLight">
                  <Globe className="h-6 w-6 text-brand-goldDark" />
                </div>
                <h3 className="mb-2 text-lg font-bold text-brand-dark">Expert Service</h3>
                <p className="text-sm text-brand-grayMed">
                  Cross-border tax and transfer pricing expertise
                </p>
              </div>
            </div>

            <div
              className="calendly-inline-widget"
              data-url="https://calendly.com/opulanz-banking/tax-advisory?hide_event_type_details=1&primary_color=d8ba4a"
              style={{ minWidth: '320px', height: '700px' }}
            />
          </div>
        </section>

        </>
    );
  }

  // Default: Info page
  return (
    <>
      <Hero
        title="International Tax"
        subtitle="Expert guidance on cross-border tax matters and transfer pricing"
      />

      <section className="relative bg-gradient-to-b from-brand-goldLight/10 to-white py-16 md:py-20 overflow-hidden">
        <div className="absolute top-0 right-1/4 w-96 h-96 bg-brand-gold/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-0 left-1/4 w-80 h-80 bg-brand-goldLight/20 rounded-full blur-3xl"></div>

        <div className="container mx-auto max-w-4xl px-6 relative z-10">
          <div className="text-center mb-8">
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-br from-brand-gold/30 to-transparent rounded-2xl blur-2xl transform translate-x-6 translate-y-6"></div>
              <div className="relative mb-6 rounded-2xl bg-white p-8 shadow-2xl border-2 border-brand-gold/20 backdrop-blur-sm hover:shadow-3xl transition-all duration-300 hover:-translate-y-1">
                <div className="flex items-center justify-center gap-3 mb-4">
                  <div className="relative">
                    <div className="absolute inset-0 bg-brand-gold rounded-full blur-xl opacity-40"></div>
                    <h3 className="relative text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-brand-gold to-brand-goldDark">€{totalPrice}</h3>
                  </div>
                </div>
                <p className="text-lg text-brand-grayMed mb-6">Fixed fee for international tax service</p>
                <p className="text-sm text-brand-grayMed mb-6">60-minute consultation with expert tax advisor</p>
                <Button
                  onClick={() => setStep('calendar')}
                  size="lg"
                  className="relative bg-gradient-to-r from-brand-gold to-brand-goldDark text-white hover:from-brand-goldDark hover:to-brand-gold w-full sm:w-auto min-w-64 h-14 text-lg shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-300"
                >
                  <span className="relative z-10">Book Your Consultation Now</span>
                  <div className="absolute inset-0 bg-gradient-to-t from-white/20 to-transparent rounded-2xl"></div>
                </Button>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="relative bg-white py-20 md:py-28 overflow-hidden">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#f0f0f0_1px,transparent_1px),linear-gradient(to_bottom,#f0f0f0_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_80%_50%_at_50%_50%,#000_70%,transparent_110%)] opacity-30"></div>

        <div className="container mx-auto max-w-7xl px-6 relative z-10">
          <div className="grid gap-12 lg:grid-cols-2 lg:gap-16">
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-br from-brand-gold/20 to-transparent rounded-2xl blur-xl transform translate-x-4 translate-y-4"></div>
              <div className="relative bg-white rounded-2xl shadow-2xl p-8 border border-brand-grayLight/50 backdrop-blur-sm hover:shadow-3xl transition-shadow duration-300">
                <SectionHeading
                  overline="SERVICE DETAILS"
                  title="International Tax Expertise"
                  align="left"
                  className="mb-8"
                />
                <p className="mb-6 text-lg text-brand-grayMed">
                  Navigate the complexities of cross-border taxation with our expert guidance.
                  We specialize in international tax structuring, transfer pricing, and treaty optimization.
                </p>
                <p className="mb-8 text-brand-grayMed">
                  Our team has extensive experience with EU and global tax regulations, ensuring your
                  international operations are tax-efficient and compliant.
                </p>
              </div>
            </div>

            <div>
              <h3 className="mb-6 text-xl font-bold text-brand-dark">What's Included</h3>
              <div className="space-y-4">
                {features.map((feature, index) => (
                  <div
                    key={feature}
                    className="group flex items-start gap-3 p-4 rounded-xl bg-white/60 backdrop-blur-sm hover:bg-white hover:shadow-lg transition-all duration-300 hover:translate-x-1"
                    style={{ animationDelay: `${index * 50}ms` }}
                  >
                    <div className="relative">
                      <div className="absolute inset-0 bg-brand-gold rounded-full blur-md opacity-30 group-hover:opacity-50 transition-opacity"></div>
                      <CheckCircle className="relative mt-1 h-5 w-5 flex-shrink-0 text-brand-gold group-hover:scale-110 transition-transform" />
                    </div>
                    <p className="text-brand-dark">{feature}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="relative bg-gray-50 py-20 md:py-28 overflow-hidden">
        <div className="absolute top-1/4 right-1/4 w-64 h-64 bg-brand-goldLight/20 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-1/4 left-1/3 w-72 h-72 bg-brand-gold/10 rounded-full blur-3xl"></div>

        <div className="container mx-auto max-w-4xl px-6 relative z-10">
          <SectionHeading
            overline="WHY CHOOSE US"
            title="Benefits of Professional International Tax Advice"
            align="center"
            className="mb-12"
          />
          <div className="grid gap-6 md:grid-cols-2">
            {benefits.map((benefit, index) => (
              <div
                key={benefit}
                className="group relative"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <div className="absolute inset-0 bg-gradient-to-br from-brand-gold/10 to-transparent rounded-xl blur-lg opacity-0 group-hover:opacity-100 transition-opacity transform translate-y-1"></div>
                <Card className="relative border-none shadow-sm hover:shadow-xl transition-all duration-300 group-hover:-translate-y-1 bg-white/80 backdrop-blur-sm">
                  <CardContent className="flex items-start gap-4 p-6">
                    <div className="relative">
                      <div className="absolute inset-0 bg-brand-gold rounded-full blur-md opacity-40 group-hover:opacity-60 transition-opacity"></div>
                      <CheckCircle className="relative h-6 w-6 text-brand-gold flex-shrink-0 mt-1 group-hover:scale-110 transition-transform" />
                    </div>
                    <p className="text-lg text-brand-dark group-hover:text-brand-dark/90 transition-colors">{benefit}</p>
                  </CardContent>
                </Card>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="hero-gradient py-20 md:py-28">
        <div className="container mx-auto max-w-4xl px-6 text-center">
          <h2 className="mb-6 text-balance text-3xl font-bold text-white md:text-4xl lg:text-5xl">
            Ready to Optimize Your International Tax?
          </h2>
          <p className="mx-auto mb-10 max-w-2xl text-balance text-lg text-white/90">
            Book your consultation now and let our experts help you navigate cross-border taxation.
          </p>
          <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
            <Button
              onClick={() => setStep('calendar')}
              size="lg"
              className="bg-white text-brand-dark hover:bg-gray-50 min-w-48"
            >
              Book Consultation - €{totalPrice}
            </Button>
            <Button
              asChild
              variant="outline"
              size="lg"
              className="border-2 border-white bg-transparent text-white hover:bg-white/10 min-w-48"
            >
              <Link href={`/${locale}/tax-advisory`}>Back to Tax Advisory</Link>
            </Button>
          </div>
        </div>
      </section>

      </>
  );
}
