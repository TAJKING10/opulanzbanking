"use client";

import * as React from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { CheckCircle, Calendar, Clock, Mail, User, FileText, Download, ArrowRight } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default function ConfirmationPage({ params: { locale } }: { params: { locale: string } }) {
  const router = useRouter();
  const searchParams = useSearchParams();

  // Get booking details from session storage (primary) or URL params (fallback)
  const bookingData = React.useMemo(() => {
    if (typeof window !== "undefined") {
      // Try session storage first (most reliable)
      const stored = sessionStorage.getItem("tax-advisory-booking");
      if (stored) {
        try {
          const data = JSON.parse(stored);
          // Map session storage data to expected format
          return {
            name: `${data.firstName || ''} ${data.lastName || ''}`.trim(),
            firstName: data.firstName || '',
            lastName: data.lastName || '',
            email: data.email || '',
            phone: data.phone || '',
            date: data.appointmentDate || '',
            time: data.appointmentTime || '',
            service: data.serviceId || '',
            serviceTitle: data.serviceTitle || '',
            price: String(data.servicePrice || 0),
            confirmationNumber: data.confirmationNumber || '',
            paypalOrderId: data.paypalOrderId || '',
            paypalStatus: data.paypalStatus || '',
            paypalPayer: data.paypalPayer || {},
            paymentDate: data.paymentDate || new Date().toISOString(),
          };
        } catch (e) {
          console.error('Error parsing session storage:', e);
        }
      }
    }

    // Fallback to URL params
    return {
      name: searchParams.get("name") || "",
      email: searchParams.get("email") || "",
      date: searchParams.get("date") || "",
      time: searchParams.get("time") || "",
      service: searchParams.get("service") || "",
      serviceTitle: searchParams.get("serviceTitle") || "",
      price: searchParams.get("price") || "0",
      confirmationNumber: searchParams.get("confirmationNumber") || searchParams.get("confirmation") || "",
    };
  }, [searchParams]);

  // Generate confirmation number if not provided
  const confirmationNumber = bookingData.confirmationNumber || `TAX-${Date.now().toString(36).toUpperCase()}`;

  // Format date
  const formattedDate = React.useMemo(() => {
    if (!bookingData.date) return null;

    try {
      const date = new Date(bookingData.date);
      if (isNaN(date.getTime())) return null;

      return date.toLocaleDateString("en-US", {
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric",
      });
    } catch (error) {
      return null;
    }
  }, [bookingData.date]);

  // Format time
  const formattedTime = React.useMemo(() => {
    if (!bookingData.time) return null;
    return bookingData.time;
  }, [bookingData.time]);

  // Check if we have valid appointment data
  const hasAppointmentData = formattedDate && formattedTime;

  const handleDownloadReceipt = () => {
    // Create a properly formatted HTML receipt for PDF download
    const receiptHTML = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>Opulanz Banking - Payment Receipt</title>
  <style>
    body {
      font-family: Arial, sans-serif;
      max-width: 800px;
      margin: 0 auto;
      padding: 40px;
      color: #333;
    }
    .header {
      text-align: center;
      margin-bottom: 40px;
      border-bottom: 3px solid #b59354;
      padding-bottom: 20px;
    }
    .logo {
      font-size: 32px;
      font-weight: bold;
      color: #b59354;
      margin-bottom: 10px;
    }
    .receipt-title {
      font-size: 24px;
      color: #252623;
      margin-top: 20px;
    }
    .confirmation-number {
      background: #f6f8f8;
      padding: 15px;
      margin: 20px 0;
      border-left: 4px solid #b59354;
      font-family: monospace;
      font-size: 18px;
    }
    .section {
      margin: 30px 0;
    }
    .section-title {
      font-size: 18px;
      font-weight: bold;
      color: #252623;
      margin-bottom: 15px;
      border-bottom: 2px solid #e5e7eb;
      padding-bottom: 10px;
    }
    .detail-row {
      display: flex;
      justify-content: space-between;
      padding: 10px 0;
      border-bottom: 1px solid #f3f4f6;
    }
    .detail-label {
      color: #6b7280;
      font-weight: 500;
    }
    .detail-value {
      color: #252623;
      font-weight: 600;
      text-align: right;
    }
    .total-row {
      background: #f6f8f8;
      padding: 15px;
      margin-top: 20px;
      font-size: 20px;
      border-radius: 8px;
    }
    .total-label {
      color: #252623;
      font-weight: bold;
    }
    .total-value {
      color: #b59354;
      font-weight: bold;
      font-size: 24px;
    }
    .paid-stamp {
      display: inline-block;
      background: #10b981;
      color: white;
      padding: 8px 20px;
      border-radius: 20px;
      font-weight: bold;
      margin-top: 10px;
    }
    .footer {
      margin-top: 50px;
      text-align: center;
      color: #6b7280;
      font-size: 14px;
      border-top: 2px solid #e5e7eb;
      padding-top: 20px;
    }
    .print-instructions {
      background: #eff6ff;
      border: 2px solid #3b82f6;
      border-radius: 8px;
      padding: 20px;
      margin: 30px 0;
      text-align: center;
    }
    .print-button {
      background: #3b82f6;
      color: white;
      border: none;
      padding: 12px 24px;
      border-radius: 6px;
      font-size: 16px;
      font-weight: bold;
      cursor: pointer;
      margin-top: 10px;
    }
    .print-button:hover {
      background: #2563eb;
    }
    @media print {
      body { padding: 20px; }
      .print-instructions { display: none; }
    }
  </style>
</head>
<body>
  <div class="print-instructions">
    <h3 style="color: #1e40af; margin-top: 0;">📄 Save as PDF Instructions</h3>
    <p style="color: #1e3a8a; margin: 10px 0;">
      To save this receipt as a PDF, click the button below and select "Save as PDF" as your printer destination.
    </p>
    <button class="print-button" onclick="window.print()">🖨️ Print / Save as PDF</button>
  </div>

  <div class="header">
    <div class="logo">OPULANZ BANKING</div>
    <div>Luxembourg Financial Services</div>
    <div class="receipt-title">PAYMENT RECEIPT</div>
  </div>

  <div class="confirmation-number">
    <strong>Confirmation Number:</strong> ${confirmationNumber}
  </div>

  <div class="section">
    <div class="section-title">APPOINTMENT DETAILS</div>
    <div class="detail-row">
      <span class="detail-label">Client Name:</span>
      <span class="detail-value">${bookingData.name || bookingData.firstName + ' ' + bookingData.lastName || 'Guest'}</span>
    </div>
    <div class="detail-row">
      <span class="detail-label">Email:</span>
      <span class="detail-value">${bookingData.email || 'Not provided'}</span>
    </div>
    ${bookingData.phone ? `<div class="detail-row">
      <span class="detail-label">Phone:</span>
      <span class="detail-value">${bookingData.phone}</span>
    </div>` : ''}
    ${hasAppointmentData ? `
    <div class="detail-row">
      <span class="detail-label">Appointment Date:</span>
      <span class="detail-value">${formattedDate}</span>
    </div>
    <div class="detail-row">
      <span class="detail-label">Appointment Time:</span>
      <span class="detail-value">${formattedTime}</span>
    </div>` : `
    <div class="detail-row">
      <span class="detail-label">Appointment:</span>
      <span class="detail-value">Scheduled via Calendly - Check your email for details</span>
    </div>`}
    <div class="detail-row">
      <span class="detail-label">Duration:</span>
      <span class="detail-value">60 minutes</span>
    </div>
  </div>

  <div class="section">
    <div class="section-title">SERVICE DETAILS</div>
    <div class="detail-row">
      <span class="detail-label">Service:</span>
      <span class="detail-value">${bookingData.serviceTitle || 'Tax Advisory Consultation'}</span>
    </div>
    <div class="detail-row">
      <span class="detail-label">Service Fee (excl. VAT):</span>
      <span class="detail-value">€${(parseFloat(bookingData.price || '0') / 1.17).toFixed(2)}</span>
    </div>
    <div class="detail-row">
      <span class="detail-label">VAT (17%):</span>
      <span class="detail-value">€${(parseFloat(bookingData.price || '0') - (parseFloat(bookingData.price || '0') / 1.17)).toFixed(2)}</span>
    </div>
  </div>

  <div class="total-row detail-row">
    <span class="total-label">TOTAL (incl. VAT):</span>
    <span class="total-value">€${parseFloat(bookingData.price || '0').toFixed(2)}</span>
  </div>

  <div class="section">
    <div class="section-title">PAYMENT INFORMATION</div>
    <div class="detail-row">
      <span class="detail-label">Payment Method:</span>
      <span class="detail-value">PayPal</span>
    </div>
    ${bookingData.paypalOrderId ? `<div class="detail-row">
      <span class="detail-label">PayPal Transaction ID:</span>
      <span class="detail-value">${bookingData.paypalOrderId}</span>
    </div>` : ''}
    <div class="detail-row">
      <span class="detail-label">Payment Date:</span>
      <span class="detail-value">${bookingData.paymentDate ? new Date(bookingData.paymentDate).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' }) : new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</span>
    </div>
    <div class="detail-row">
      <span class="detail-label">Payment Status:</span>
      <span class="detail-value"><span class="paid-stamp">${bookingData.paypalStatus || 'PAID'}</span></span>
    </div>
    ${bookingData.paypalPayer?.email_address ? `<div class="detail-row">
      <span class="detail-label">PayPal Account:</span>
      <span class="detail-value">${bookingData.paypalPayer.email_address}</span>
    </div>` : ''}
  </div>

  <div class="footer">
    <p><strong>Thank you for choosing Opulanz Banking!</strong></p>
    <p>For questions about your booking, please contact us at:<br>
    <strong>support@opulanzbanking.com</strong></p>
    <p style="margin-top: 20px; font-size: 12px;">
      This is an official payment receipt from Opulanz Banking.<br>
      Please keep this receipt for your records.
    </p>
  </div>
</body>
</html>
    `;

    // Create blob and download as HTML file
    const blob = new Blob([receiptHTML], { type: "text/html" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `Opulanz-Receipt-${confirmationNumber}.html`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);

    // Clean up the blob URL
    setTimeout(() => {
      window.URL.revokeObjectURL(url);
    }, 100);
  };

  const handleAddToCalendar = () => {
    // Create Google Calendar link
    const calendarUrl = new URL("https://calendar.google.com/calendar/render");
    calendarUrl.searchParams.set("action", "TEMPLATE");
    calendarUrl.searchParams.set("text", `Opulanz Tax Advisory - ${bookingData.serviceTitle}`);
    calendarUrl.searchParams.set("details", `Tax advisory consultation with Opulanz Banking.\n\nService: ${bookingData.serviceTitle}\nConfirmation: ${confirmationNumber}`);

    if (bookingData.date && bookingData.time) {
      const dateStr = new Date(`${bookingData.date} ${bookingData.time}`).toISOString().replace(/-|:|\.\d+/g, "");
      calendarUrl.searchParams.set("dates", `${dateStr}/${dateStr}`);
    }

    window.open(calendarUrl.toString(), "_blank");
  };

  return (
    <>
      {/* Success Hero */}
      <section className="hero-gradient py-16 md:py-24">
        <div className="container mx-auto max-w-4xl px-6">
          <div className="text-center">
            <div className="mb-6 inline-flex h-20 w-20 items-center justify-center rounded-full bg-green-500 shadow-lg">
              <CheckCircle className="h-12 w-12 text-white" />
            </div>
            <h1 className="mb-4 text-3xl font-bold text-white md:text-4xl lg:text-5xl">
              Booking Confirmed!
            </h1>
            <p className="mb-6 text-lg text-white/90 md:text-xl">
              Your tax advisory consultation has been successfully booked
            </p>
            <div className="inline-flex items-center gap-2 rounded-full bg-white/20 px-6 py-3 backdrop-blur-sm">
              <FileText className="h-5 w-5 text-white" />
              <span className="font-mono text-sm font-semibold text-white">
                Confirmation: {confirmationNumber}
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* Confirmation Details */}
      <section className="bg-white py-12 md:py-16">
        <div className="container mx-auto max-w-4xl px-6">
          {/* Confirmation sent message */}
          <div className="mb-8 rounded-lg bg-green-50 border border-green-200 p-4 md:p-6">
            <div className="flex items-start gap-4">
              <Mail className="h-6 w-6 text-green-600 flex-shrink-0 mt-1" />
              <div>
                <h3 className="font-semibold text-green-900 mb-1">
                  Confirmation email sent
                </h3>
                <p className="text-sm text-green-800">
                  A confirmation email with all the details has been sent to{" "}
                  <span className="font-semibold">{bookingData.email || "your email address"}</span>.
                  Please check your inbox and spam folder.
                </p>
              </div>
            </div>
          </div>

          {/* Appointment Details Card */}
          <Card className="border-2 border-brand-grayLight mb-8">
            <CardHeader className="bg-brand-goldLight/10">
              <CardTitle className="text-2xl">Your Appointment Details</CardTitle>
            </CardHeader>
            <CardContent className="pt-6">
              <div className="grid gap-6 md:grid-cols-2">
                <div className="flex items-start gap-4">
                  <div className="inline-flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-lg bg-brand-gold/10">
                    <User className="h-6 w-6 text-brand-gold" />
                  </div>
                  <div>
                    <p className="text-sm text-brand-grayMed mb-1">Client Name</p>
                    <p className="font-semibold text-brand-dark">
                      {bookingData.name || "Guest"}
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="inline-flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-lg bg-brand-gold/10">
                    <Mail className="h-6 w-6 text-brand-gold" />
                  </div>
                  <div>
                    <p className="text-sm text-brand-grayMed mb-1">Email</p>
                    <p className="font-semibold text-brand-dark break-all">
                      {bookingData.email || "Not provided"}
                    </p>
                  </div>
                </div>

                {bookingData.phone && (
                  <div className="flex items-start gap-4">
                    <div className="inline-flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-lg bg-brand-gold/10">
                      <User className="h-6 w-6 text-brand-gold" />
                    </div>
                    <div>
                      <p className="text-sm text-brand-grayMed mb-1">Phone</p>
                      <p className="font-semibold text-brand-dark">
                        {bookingData.phone}
                      </p>
                    </div>
                  </div>
                )}

                {hasAppointmentData ? (
                  <>
                    <div className="flex items-start gap-4">
                      <div className="inline-flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-lg bg-brand-gold/10">
                        <Calendar className="h-6 w-6 text-brand-gold" />
                      </div>
                      <div>
                        <p className="text-sm text-brand-grayMed mb-1">Date</p>
                        <p className="font-semibold text-brand-dark">{formattedDate}</p>
                      </div>
                    </div>

                    <div className="flex items-start gap-4">
                      <div className="inline-flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-lg bg-brand-gold/10">
                        <Clock className="h-6 w-6 text-brand-gold" />
                      </div>
                      <div>
                        <p className="text-sm text-brand-grayMed mb-1">Time</p>
                        <p className="font-semibold text-brand-dark">
                          {formattedTime}
                        </p>
                        <p className="text-sm text-brand-grayMed">Duration: 60 minutes</p>
                      </div>
                    </div>
                  </>
                ) : (
                  <div className="flex items-start gap-4 md:col-span-2">
                    <div className="inline-flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-lg bg-blue-500/10">
                      <Calendar className="h-6 w-6 text-blue-600" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm text-brand-grayMed mb-1">Appointment Scheduled via Calendly</p>
                      <p className="font-semibold text-brand-dark">Check your email for appointment details</p>
                      <p className="text-sm text-blue-600 mt-2">
                        You will receive a confirmation email from Calendly with your appointment date, time, and Google Meet link.
                      </p>
                      <p className="text-sm text-brand-grayMed mt-1">
                        Duration: 60 minutes
                      </p>
                    </div>
                  </div>
                )}
              </div>

              <div className="mt-6 pt-6 border-t border-brand-grayLight">
                <h4 className="font-semibold text-brand-dark mb-3">Service Details</h4>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-semibold text-brand-dark">{bookingData.serviceTitle}</p>
                    <p className="text-sm text-brand-grayMed">60-minute consultation</p>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-bold text-brand-gold">€{bookingData.price}.00</p>
                    <p className="text-xs text-brand-grayMed">incl. VAT</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Action Buttons */}
          <div className="grid gap-4 md:grid-cols-2 mb-8">
            <Button
              onClick={handleAddToCalendar}
              className="h-14 bg-brand-gold text-white hover:bg-brand-goldDark"
            >
              <Calendar className="mr-2 h-5 w-5" />
              Add to Calendar
            </Button>
            <Button
              onClick={handleDownloadReceipt}
              variant="outline"
              className="h-14 border-2 border-brand-gold text-brand-gold hover:bg-brand-goldLight/10"
            >
              <Download className="mr-2 h-5 w-5" />
              Download PDF Receipt
            </Button>
          </div>

          {/* Next Steps Card */}
          <Card className="border-2 border-blue-200 bg-blue-50">
            <CardHeader>
              <CardTitle className="text-xl text-blue-900">What happens next?</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-4">
                <li className="flex items-start gap-3">
                  <div className="inline-flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-blue-600 text-white text-sm font-bold mt-0.5">
                    1
                  </div>
                  <div>
                    <p className="font-semibold text-blue-900">Check your email</p>
                    <p className="text-sm text-blue-800">
                      You'll receive a confirmation email with a calendar invite and meeting link
                    </p>
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <div className="inline-flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-blue-600 text-white text-sm font-bold mt-0.5">
                    2
                  </div>
                  <div>
                    <p className="font-semibold text-blue-900">Prepare for your consultation</p>
                    <p className="text-sm text-blue-800">
                      Gather relevant documents and prepare questions you'd like to discuss
                    </p>
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <div className="inline-flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-blue-600 text-white text-sm font-bold mt-0.5">
                    3
                  </div>
                  <div>
                    <p className="font-semibold text-blue-900">Join the meeting</p>
                    <p className="text-sm text-blue-800">
                      Click the meeting link in your email at the scheduled time
                    </p>
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <div className="inline-flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-blue-600 text-white text-sm font-bold mt-0.5">
                    4
                  </div>
                  <div>
                    <p className="font-semibold text-blue-900">Receive your action plan</p>
                    <p className="text-sm text-blue-800">
                      After the consultation, you'll receive a summary and recommended next steps
                    </p>
                  </div>
                </li>
              </ul>
            </CardContent>
          </Card>

          {/* Additional Resources */}
          <div className="mt-8 text-center">
            <p className="text-brand-grayMed mb-4">
              Need to reschedule or have questions?
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button
                variant="outline"
                onClick={() => router.push(`/${locale}/tax-advisory`)}
                className="border-brand-grayMed text-brand-grayMed hover:bg-gray-50"
              >
                Back to Tax Advisory
              </Button>
              <Button
                variant="outline"
                onClick={() => router.push(`/${locale}/dashboard`)}
                className="border-brand-gold text-brand-gold hover:bg-brand-goldLight/10"
              >
                Go to Dashboard
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Support Contact */}
          <div className="mt-12 text-center border-t border-brand-grayLight pt-8">
            <p className="text-sm text-brand-grayMed">
              Questions about your booking? Contact us at{" "}
              <a href="mailto:support@opulanzbanking.com" className="text-brand-gold hover:underline font-semibold">
                support@opulanzbanking.com
              </a>
            </p>
          </div>
        </div>
      </section>
    </>
  );
}
