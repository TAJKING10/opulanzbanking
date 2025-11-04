"use client";

import * as React from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Check, Mail, Phone, AlertCircle } from "lucide-react";

interface IdentityContactStepProps {
  data: any;
  onUpdate: (data: any) => void;
  onNext: () => void;
}

export function IdentityContactStep({ data, onUpdate, onNext }: IdentityContactStepProps) {
  const [formState, setFormState] = React.useState({
    firstName: data.firstName || "",
    lastName: data.lastName || "",
    email: data.email || "",
    phone: data.phone || "",
  });

  const [verification, setVerification] = React.useState({
    emailVerified: data.emailVerified || false,
    phoneVerified: data.phoneVerified || false,
    emailOtp: "",
    phoneOtp: "",
    showEmailOtp: false,
    showPhoneOtp: false,
    emailSent: false,
    phoneSent: false,
  });

  const handleInputChange = (field: string, value: string) => {
    setFormState((prev) => ({ ...prev, [field]: value }));
    onUpdate({ [field]: value });
  };

  const sendEmailOtp = async () => {
    // Simulate sending email OTP
    setVerification((prev) => ({ ...prev, emailSent: true, showEmailOtp: true }));
    // In real implementation, call API to send OTP
  };

  const sendPhoneOtp = async () => {
    // Simulate sending phone OTP
    setVerification((prev) => ({ ...prev, phoneSent: true, showPhoneOtp: true }));
    // In real implementation, call API to send OTP
  };

  const verifyEmailOtp = () => {
    // Simulate OTP verification
    if (verification.emailOtp.length === 6) {
      setVerification((prev) => ({ ...prev, emailVerified: true, showEmailOtp: false }));
      onUpdate({ emailVerified: true });
    }
  };

  const verifyPhoneOtp = () => {
    // Simulate OTP verification
    if (verification.phoneOtp.length === 6) {
      setVerification((prev) => ({ ...prev, phoneVerified: true, showPhoneOtp: false }));
      onUpdate({ phoneVerified: true });
    }
  };

  const handleContinue = () => {
    if (
      formState.firstName &&
      formState.lastName &&
      formState.email &&
      formState.phone &&
      verification.emailVerified &&
      verification.phoneVerified
    ) {
      onNext();
    }
  };

  const isFormValid =
    formState.firstName &&
    formState.lastName &&
    formState.email &&
    formState.phone &&
    verification.emailVerified &&
    verification.phoneVerified;

  return (
    <div className="space-y-8">
      <div>
        <h2 className="mb-2 text-2xl font-bold text-brand-dark">Your Identity & Contact</h2>
        <p className="text-brand-grayMed">
          We need to verify your identity and contact information for regulatory compliance.
        </p>
      </div>

      <div className="space-y-6">
        {/* Name Fields */}
        <div className="grid gap-6 md:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="firstName">First Name *</Label>
            <Input
              id="firstName"
              type="text"
              value={formState.firstName}
              onChange={(e) => handleInputChange("firstName", e.target.value)}
              placeholder="Enter your first name"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="lastName">Last Name *</Label>
            <Input
              id="lastName"
              type="text"
              value={formState.lastName}
              onChange={(e) => handleInputChange("lastName", e.target.value)}
              placeholder="Enter your last name"
              required
            />
          </div>
        </div>

        {/* Email Verification */}
        <div className="space-y-2">
          <Label htmlFor="email">Email Address *</Label>
          <div className="flex gap-2">
            <Input
              id="email"
              type="email"
              value={formState.email}
              onChange={(e) => handleInputChange("email", e.target.value)}
              placeholder="your.email@example.com"
              disabled={verification.emailVerified}
              required
              className="flex-1"
            />
            {!verification.emailVerified && (
              <Button
                type="button"
                onClick={sendEmailOtp}
                disabled={!formState.email || verification.emailSent}
                variant="outline"
                className="min-w-32"
              >
                <Mail className="mr-2 h-4 w-4" />
                {verification.emailSent ? "Sent" : "Verify"}
              </Button>
            )}
            {verification.emailVerified && (
              <div className="flex items-center gap-2 rounded-lg border border-green-200 bg-green-50 px-4 py-2 text-green-700">
                <Check className="h-4 w-4" />
                <span className="text-sm font-medium">Verified</span>
              </div>
            )}
          </div>

          {verification.showEmailOtp && !verification.emailVerified && (
            <div className="mt-4 rounded-lg border border-blue-200 bg-blue-50 p-4">
              <p className="mb-3 text-sm text-blue-900">
                We've sent a 6-digit code to {formState.email}. Enter it below:
              </p>
              <div className="flex gap-2">
                <Input
                  type="text"
                  maxLength={6}
                  value={verification.emailOtp}
                  onChange={(e) =>
                    setVerification((prev) => ({ ...prev, emailOtp: e.target.value }))
                  }
                  placeholder="000000"
                  className="max-w-32"
                />
                <Button type="button" onClick={verifyEmailOtp} size="sm">
                  Confirm
                </Button>
              </div>
            </div>
          )}
        </div>

        {/* Phone Verification */}
        <div className="space-y-2">
          <Label htmlFor="phone">Phone Number *</Label>
          <div className="flex gap-2">
            <Input
              id="phone"
              type="tel"
              value={formState.phone}
              onChange={(e) => handleInputChange("phone", e.target.value)}
              placeholder="+352 123 456 789"
              disabled={verification.phoneVerified}
              required
              className="flex-1"
            />
            {!verification.phoneVerified && (
              <Button
                type="button"
                onClick={sendPhoneOtp}
                disabled={!formState.phone || verification.phoneSent}
                variant="outline"
                className="min-w-32"
              >
                <Phone className="mr-2 h-4 w-4" />
                {verification.phoneSent ? "Sent" : "Verify"}
              </Button>
            )}
            {verification.phoneVerified && (
              <div className="flex items-center gap-2 rounded-lg border border-green-200 bg-green-50 px-4 py-2 text-green-700">
                <Check className="h-4 w-4" />
                <span className="text-sm font-medium">Verified</span>
              </div>
            )}
          </div>

          {verification.showPhoneOtp && !verification.phoneVerified && (
            <div className="mt-4 rounded-lg border border-blue-200 bg-blue-50 p-4">
              <p className="mb-3 text-sm text-blue-900">
                We've sent a 6-digit code to {formState.phone}. Enter it below:
              </p>
              <div className="flex gap-2">
                <Input
                  type="text"
                  maxLength={6}
                  value={verification.phoneOtp}
                  onChange={(e) =>
                    setVerification((prev) => ({ ...prev, phoneOtp: e.target.value }))
                  }
                  placeholder="000000"
                  className="max-w-32"
                />
                <Button type="button" onClick={verifyPhoneOtp} size="sm">
                  Confirm
                </Button>
              </div>
              <p className="mt-3 text-xs text-blue-800">
                Didn't receive it? We can use TOTP (authenticator app) as an alternative.
              </p>
            </div>
          )}
        </div>

        {!isFormValid && (
          <div className="flex items-start gap-3 rounded-lg border border-amber-200 bg-amber-50 p-4">
            <AlertCircle className="h-5 w-5 flex-shrink-0 text-amber-600" />
            <div className="text-sm text-amber-900">
              Please complete all fields and verify both your email and phone number to continue.
            </div>
          </div>
        )}
      </div>

      <div className="flex justify-end">
        <Button
          type="button"
          onClick={handleContinue}
          disabled={!isFormValid}
          className="bg-brand-gold text-white hover:bg-brand-goldDark"
        >
          Continue
        </Button>
      </div>
    </div>
  );
}
