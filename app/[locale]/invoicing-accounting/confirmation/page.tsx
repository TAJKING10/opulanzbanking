"use client";

import * as React from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { CheckCircle, Building2, Mail, User, FileText, Download, ArrowRight, Calendar, MapPin, Euro, Users, TrendingUp } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { SearchParamsWrapper } from "@/components/search-params-wrapper";

// Force dynamic rendering to avoid prerendering issues with useSearchParams
export const dynamic = 'force-dynamic';

function AccountingConfirmationPageContent({ locale }: { locale: string }) {
  const router = useRouter();
  const searchParams = useSearchParams();

  // Get application details from URL or sessionStorage
  const applicationData = React.useMemo(() => {
    if (typeof window !== "undefined") {
      const stored = sessionStorage.getItem("accounting-application");
      if (stored) {
        try {
          return JSON.parse(stored);
        } catch (e) {
          console.error('Error parsing session storage:', e);
        }
      }
    }

    return {
      applicationId: searchParams.get("ref") || "",
      legalName: searchParams.get("company") || "",
      email: searchParams.get("email") || "",
    };
  }, [searchParams]);

  const handleDownloadSummary = () => {
    const summaryHTML = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>Opulanz Banking - Application Summary</title>
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
    .document-title {
      font-size: 24px;
      color: #252623;
      margin-top: 20px;
    }
    .reference-number {
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
    .status-badge {
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
      To save this summary as a PDF, click the button below and select "Save as PDF" as your printer destination.
    </p>
    <button class="print-button" onclick="window.print()">🖨️ Print / Save as PDF</button>
  </div>

  <div class="header">
    <div class="logo">OPULANZ BANKING</div>
    <div>Luxembourg Financial Services</div>
    <div class="document-title">ACCOUNTING & INVOICING APPLICATION</div>
  </div>

  <div class="reference-number">
    <strong>Application Reference:</strong> ${applicationData.applicationId || 'N/A'}
  </div>

  <div class="section">
    <div class="section-title">APPLICATION STATUS</div>
    <div class="detail-row">
      <span class="detail-label">Status:</span>
      <span class="detail-value"><span class="status-badge">SUBMITTED</span></span>
    </div>
    <div class="detail-row">
      <span class="detail-label">Submission Date:</span>
      <span class="detail-value">${new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' })}</span>
    </div>
  </div>

  <div class="section">
    <div class="section-title">COMPANY INFORMATION</div>
    <div class="detail-row">
      <span class="detail-label">Legal Name:</span>
      <span class="detail-value">${applicationData.legalName || 'N/A'}</span>
    </div>
    ${applicationData.tradeName ? `<div class="detail-row">
      <span class="detail-label">Trade Name:</span>
      <span class="detail-value">${applicationData.tradeName}</span>
    </div>` : ''}
    ${applicationData.companyType ? `<div class="detail-row">
      <span class="detail-label">Company Type:</span>
      <span class="detail-value">${applicationData.companyType.toUpperCase()}</span>
    </div>` : ''}
    ${applicationData.registrationNumber ? `<div class="detail-row">
      <span class="detail-label">Registration Number:</span>
      <span class="detail-value">${applicationData.registrationNumber}</span>
    </div>` : ''}
    ${applicationData.vatNumber ? `<div class="detail-row">
      <span class="detail-label">VAT Number:</span>
      <span class="detail-value">${applicationData.vatNumber}</span>
    </div>` : ''}
  </div>

  <div class="section">
    <div class="section-title">PRIMARY CONTACT</div>
    ${applicationData.primaryContactName ? `<div class="detail-row">
      <span class="detail-label">Name:</span>
      <span class="detail-value">${applicationData.primaryContactName}</span>
    </div>` : ''}
    <div class="detail-row">
      <span class="detail-label">Email:</span>
      <span class="detail-value">${applicationData.email || 'Not provided'}</span>
    </div>
    ${applicationData.primaryContactPhone ? `<div class="detail-row">
      <span class="detail-label">Phone:</span>
      <span class="detail-value">${applicationData.primaryContactPhone}</span>
    </div>` : ''}
  </div>

  <div class="section">
    <div class="section-title">NEXT STEPS</div>
    <ol style="line-height: 1.8; color: #4b5563;">
      <li>Our accounting team will review your application within 1-2 business days</li>
      <li>You will receive an email confirmation at ${applicationData.email || 'your registered email'}</li>
      <li>We may contact you if we need additional information or documentation</li>
      <li>Once approved, we'll send you onboarding materials and access credentials</li>
      <li>Your dedicated account manager will schedule an onboarding call</li>
    </ol>
  </div>

  <div class="footer">
    <p><strong>Thank you for choosing Opulanz Banking!</strong></p>
    <p>For questions about your application, please contact us at:<br>
    <strong>accounting@opulanzbanking.com</strong></p>
    <p style="margin-top: 20px; font-size: 12px;">
      This is an official application summary from Opulanz Banking.<br>
      Please keep this document for your records.<br>
      Reference: ${applicationData.applicationId || 'N/A'}
    </p>
  </div>
</body>
</html>
    `;

    const blob = new Blob([summaryHTML], { type: "text/html" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `Opulanz-Accounting-Application-${applicationData.applicationId || Date.now()}.html`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    setTimeout(() => window.URL.revokeObjectURL(url), 100);
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
              Application Submitted Successfully!
            </h1>
            <p className="mb-6 text-lg text-white/90 md:text-xl">
              Your accounting & invoicing application has been received
            </p>
            <div className="inline-flex items-center gap-2 rounded-full bg-white/20 px-6 py-3 backdrop-blur-sm">
              <FileText className="h-5 w-5 text-white" />
              <span className="font-mono text-sm font-semibold text-white">
                Reference: {applicationData.applicationId}
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
                  <span className="font-semibold">{applicationData.email || "your email address"}</span>.
                  Please check your inbox and spam folder.
                </p>
              </div>
            </div>
          </div>

          {/* Application Summary Card */}
          <Card className="border-2 border-brand-grayLight mb-8">
            <CardHeader className="bg-brand-goldLight/10">
              <CardTitle className="text-2xl">Application Summary</CardTitle>
            </CardHeader>
            <CardContent className="pt-6">
              <div className="grid gap-6 md:grid-cols-2">
                <div className="flex items-start gap-4">
                  <div className="inline-flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-lg bg-brand-gold/10">
                    <Building2 className="h-6 w-6 text-brand-gold" />
                  </div>
                  <div>
                    <p className="text-sm text-brand-grayMed mb-1">Company Name</p>
                    <p className="font-semibold text-brand-dark">
                      {applicationData.legalName || "Your Company"}
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="inline-flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-lg bg-brand-gold/10">
                    <Mail className="h-6 w-6 text-brand-gold" />
                  </div>
                  <div>
                    <p className="text-sm text-brand-grayMed mb-1">Contact Email</p>
                    <p className="font-semibold text-brand-dark break-all">
                      {applicationData.email || "Not provided"}
                    </p>
                  </div>
                </div>

                {applicationData.primaryContactName && (
                  <div className="flex items-start gap-4">
                    <div className="inline-flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-lg bg-brand-gold/10">
                      <User className="h-6 w-6 text-brand-gold" />
                    </div>
                    <div>
                      <p className="text-sm text-brand-grayMed mb-1">Primary Contact</p>
                      <p className="font-semibold text-brand-dark">
                        {applicationData.primaryContactName}
                      </p>
                    </div>
                  </div>
                )}

                <div className="flex items-start gap-4">
                  <div className="inline-flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-lg bg-green-500/10">
                    <CheckCircle className="h-6 w-6 text-green-600" />
                  </div>
                  <div>
                    <p className="text-sm text-brand-grayMed mb-1">Application Status</p>
                    <div className="inline-flex items-center gap-2 bg-green-100 px-3 py-1 rounded-full">
                      <span className="font-semibold text-green-800">SUBMITTED</span>
                    </div>
                  </div>
                </div>
              </div>

              {(applicationData.companyType || applicationData.vatNumber || applicationData.registrationNumber) && (
                <div className="mt-6 pt-6 border-t border-brand-grayLight">
                  <h4 className="font-semibold text-brand-dark mb-3">Company Details</h4>
                  <div className="grid gap-3 md:grid-cols-2">
                    {applicationData.companyType && (
                      <div className="flex justify-between py-2 border-b border-brand-grayLight/50">
                        <span className="text-sm text-brand-grayMed">Company Type:</span>
                        <span className="font-semibold text-brand-dark uppercase">{applicationData.companyType}</span>
                      </div>
                    )}
                    {applicationData.registrationNumber && (
                      <div className="flex justify-between py-2 border-b border-brand-grayLight/50">
                        <span className="text-sm text-brand-grayMed">Registration Number:</span>
                        <span className="font-semibold text-brand-dark">{applicationData.registrationNumber}</span>
                      </div>
                    )}
                    {applicationData.vatNumber && (
                      <div className="flex justify-between py-2 border-b border-brand-grayLight/50">
                        <span className="text-sm text-brand-grayMed">VAT Number:</span>
                        <span className="font-semibold text-brand-dark">{applicationData.vatNumber}</span>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Action Buttons */}
          <div className="grid gap-4 md:grid-cols-2 mb-8">
            <Button
              onClick={handleDownloadSummary}
              className="h-14 bg-brand-gold text-white hover:bg-brand-goldDark"
            >
              <Download className="mr-2 h-5 w-5" />
              Download PDF Summary
            </Button>
            <Button
              onClick={() => router.push(`/${locale}/dashboard`)}
              variant="outline"
              className="h-14 border-2 border-brand-gold text-brand-gold hover:bg-brand-goldLight/10"
            >
              Go to Dashboard
              <ArrowRight className="ml-2 h-5 w-5" />
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
                    <p className="font-semibold text-blue-900">Application Review</p>
                    <p className="text-sm text-blue-800">
                      Our accounting team will review your application within 1-2 business days
                    </p>
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <div className="inline-flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-blue-600 text-white text-sm font-bold mt-0.5">
                    2
                  </div>
                  <div>
                    <p className="font-semibold text-blue-900">Email Confirmation</p>
                    <p className="text-sm text-blue-800">
                      You'll receive a detailed confirmation email with next steps
                    </p>
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <div className="inline-flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-blue-600 text-white text-sm font-bold mt-0.5">
                    3
                  </div>
                  <div>
                    <p className="font-semibold text-blue-900">Additional Information</p>
                    <p className="text-sm text-blue-800">
                      We may contact you if we need any additional documents or clarification
                    </p>
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <div className="inline-flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-blue-600 text-white text-sm font-bold mt-0.5">
                    4
                  </div>
                  <div>
                    <p className="font-semibold text-blue-900">Onboarding Process</p>
                    <p className="text-sm text-blue-800">
                      Once approved, we'll send onboarding materials and schedule a setup call
                    </p>
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <div className="inline-flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-blue-600 text-white text-sm font-bold mt-0.5">
                    5
                  </div>
                  <div>
                    <p className="font-semibold text-blue-900">Account Activation</p>
                    <p className="text-sm text-blue-800">
                      Your dedicated account manager will help you get started with our services
                    </p>
                  </div>
                </li>
              </ul>
            </CardContent>
          </Card>

          {/* Support Contact */}
          <div className="mt-12 text-center border-t border-brand-grayLight pt-8">
            <p className="text-sm text-brand-grayMed mb-4">
              Questions about your application?
            </p>
            <p className="text-sm text-brand-grayMed">
              Contact our accounting team at{" "}
              <a href="mailto:accounting@opulanzbanking.com" className="text-brand-gold hover:underline font-semibold">
                accounting@opulanzbanking.com
              </a>
            </p>
            <p className="text-xs text-brand-grayMed mt-4">
              Reference Number: <span className="font-mono font-semibold">{applicationData.applicationId}</span>
            </p>
          </div>
        </div>
      </section>
    </>
  );
}

export default function AccountingConfirmationPage({ params: { locale } }: { params: { locale: string } }) {
  return (
    <SearchParamsWrapper>
      <AccountingConfirmationPageContent locale={locale} />
    </SearchParamsWrapper>
  );
}
