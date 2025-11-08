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

  const isFormValid =
    formState.firstName?.trim() &&
    formState.lastName?.trim() &&
    formState.email?.trim() &&
    formState.phone?.trim();
    // Note: Email and phone verification disabled for now
    // && verification.emailVerified &&
    // && verification.phoneVerified;

  // Update parent with validation status
  React.useEffect(() => {
    console.log("Identity step validation:", {
      firstName: formState.firstName,
      lastName: formState.lastName,
      email: formState.email,
      phone: formState.phone,
      isFormValid
    });
    onUpdate({ isIdentityStepValid: isFormValid });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isFormValid, formState.firstName, formState.lastName, formState.email, formState.phone]);

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

        {/* Email - Verification Disabled */}
        <div className="space-y-2">
          <Label htmlFor="email">Email Address *</Label>
          <Input
            id="email"
            type="email"
            value={formState.email}
            onChange={(e) => handleInputChange("email", e.target.value)}
            placeholder="your.email@example.com"
            required
          />
        </div>

        {/* Phone - Verification Disabled */}
        <div className="space-y-2">
          <Label htmlFor="phone">Phone Number *</Label>
          <Input
            id="phone"
            type="tel"
            value={formState.phone}
            onChange={(e) => handleInputChange("phone", e.target.value)}
            placeholder="+352 123 456 789"
            required
          />
        </div>

        {!isFormValid && (
          <div className="flex items-start gap-3 rounded-lg border border-amber-200 bg-amber-50 p-4">
            <AlertCircle className="h-5 w-5 flex-shrink-0 text-amber-600" />
            <div className="text-sm text-amber-900">
              Please complete all required fields to continue.
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
