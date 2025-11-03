"use client";

import * as React from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { CheckCircle, ArrowRight, Mail, Clock, FileText } from "lucide-react";

interface BusinessSubmissionStepProps {
  data: any;
  onUpdate: (data: any) => void;
  locale: string;
}

export function BusinessSubmissionStep({ data, onUpdate, locale }: BusinessSubmissionStepProps) {
  const [submitted, setSubmitted] = React.useState(false);
  const [applicationId, setApplicationId] = React.useState("");

  React.useEffect(() => {
    // Simulate submission
    const submitApplication = async () => {
      // In real implementation, send data to backend
      const appId = `OPL-B-${Date.now()}`;
      setApplicationId(appId);

      // Internal routing logic
      const route = determineRoute(data);
      console.log("Application routed to:", route);
      console.log("Application data:", data);

      // Create back-office task
      console.log("Back-office task created for:", appId);

      setSubmitted(true);

      // Clear saved progress
      localStorage.removeItem("business-account-progress");
    };

    submitApplication();
  }, [data]);

  const determineRoute = (applicationData: any) => {
    // Internal routing logic based on jurisdiction
    const { jurisdiction } = applicationData;

    if (jurisdiction === "LU" || jurisdiction === "FR") {
      return "ROUTE_A_OLKY"; // Luxembourg/France → OLKY
    } else if (jurisdiction === "FI") {
      return "ROUTE_B_NARVI"; // Finland → NARVI
    }

    // Default route
    return "ROUTE_A_OLKY";
  };

  return (
    <div className="space-y-8">
      {submitted ? (
        <>
          {/* Success State */}
          <div className="text-center">
            <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-green-100">
              <CheckCircle className="h-12 w-12 text-green-600" />
            </div>
            <h2 className="mb-2 text-2xl font-bold text-brand-dark">Application Submitted!</h2>
            <p className="text-lg text-brand-grayMed">
              Your application has been successfully submitted to Opulanz Partner Bank.
            </p>
          </div>

          {/* Application ID */}
          <div className="rounded-lg border border-brand-grayLight bg-brand-gold/5 p-6 text-center">
            <p className="mb-2 text-sm font-medium text-brand-dark">Your Application Reference</p>
            <p className="text-2xl font-bold text-brand-gold">{applicationId}</p>
            <p className="mt-2 text-xs text-brand-grayMed">
              Save this reference number for tracking your application
            </p>
          </div>

          {/* Next Steps */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-brand-dark">What Happens Next?</h3>

            <div className="space-y-3">
              <div className="flex items-start gap-4 rounded-lg border border-brand-grayLight bg-white p-4">
                <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-brand-gold/10 text-sm font-bold text-brand-gold">
                  1
                </div>
                <div>
                  <p className="font-semibold text-brand-dark">Email Confirmation</p>
                  <p className="mt-1 text-sm text-brand-grayMed">
                    We've sent a confirmation email to <strong>{data.email}</strong> with your
                    application details and reference number.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4 rounded-lg border border-brand-grayLight bg-white p-4">
                <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-brand-gold/10 text-sm font-bold text-brand-gold">
                  2
                </div>
                <div>
                  <p className="font-semibold text-brand-dark">Bank Review</p>
                  <p className="mt-1 text-sm text-brand-grayMed">
                    Opulanz Partner Bank will review your application and verify your documents.
                    This typically takes 2-5 business days.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4 rounded-lg border border-brand-grayLight bg-white p-4">
                <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-brand-gold/10 text-sm font-bold text-brand-gold">
                  3
                </div>
                <div>
                  <p className="font-semibold text-brand-dark">Account Activation</p>
                  <p className="mt-1 text-sm text-brand-grayMed">
                    Once approved, the bank will contact you directly to complete the account
                    activation and provide your account details.
                  </p>
                </div>
              </div>

              {data.uploadLater && (
                <div className="flex items-start gap-4 rounded-lg border border-amber-200 bg-amber-50 p-4">
                  <FileText className="h-5 w-5 flex-shrink-0 text-amber-600" />
                  <div>
                    <p className="font-semibold text-amber-900">Document Upload Pending</p>
                    <p className="mt-1 text-sm text-amber-800">
                      You still need to upload your documents. We'll send you a secure link to your
                      dashboard within 24 hours.
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Quick Actions */}
          <div className="space-y-3">
            <h3 className="text-lg font-semibold text-brand-dark">Quick Actions</h3>

            <div className="grid gap-3 md:grid-cols-2">
              <div className="flex items-center gap-3 rounded-lg border border-brand-grayLight bg-white p-4">
                <Mail className="h-8 w-8 text-brand-gold" />
                <div className="flex-1">
                  <p className="text-sm font-semibold text-brand-dark">Check Your Email</p>
                  <p className="text-xs text-brand-grayMed">Confirmation sent to {data.email}</p>
                </div>
              </div>

              <div className="flex items-center gap-3 rounded-lg border border-brand-grayLight bg-white p-4">
                <Clock className="h-8 w-8 text-brand-gold" />
                <div className="flex-1">
                  <p className="text-sm font-semibold text-brand-dark">Expected Timeline</p>
                  <p className="text-xs text-brand-grayMed">2-5 business days for review</p>
                </div>
              </div>
            </div>
          </div>

          {/* CTA Buttons */}
          <div className="flex flex-col items-center gap-4 pt-6 sm:flex-row sm:justify-center">
            <Button asChild className="min-w-48 bg-brand-gold text-white hover:bg-brand-goldDark">
              <Link href={`/${locale}`}>
                Return to Homepage
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>

            <Button asChild variant="outline" className="min-w-48">
              <Link href={`/${locale}/support`}>Contact Support</Link>
            </Button>
          </div>

          {/* Additional Info */}
          <div className="rounded-lg bg-blue-50 p-4 text-center">
            <p className="text-sm text-blue-900">
              <strong>Need help?</strong> Our support team is available Monday-Friday, 9:00-18:00 CET.
              Email us at{" "}
              <a href="mailto:support@opulanz.com" className="underline">
                support@opulanz.com
              </a>
            </p>
          </div>
        </>
      ) : (
        <>
          {/* Loading State */}
          <div className="text-center">
            <div className="mx-auto mb-6 h-16 w-16 animate-spin rounded-full border-4 border-brand-gold border-t-transparent"></div>
            <h2 className="mb-2 text-2xl font-bold text-brand-dark">Submitting Your Application</h2>
            <p className="text-lg text-brand-grayMed">Please wait while we process your application...</p>
          </div>
        </>
      )}
    </div>
  );
}
