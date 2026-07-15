"use client";

import * as React from "react";
import { useTranslations } from "next-intl";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { AlertCircle } from "lucide-react";
import { PhoneInput, isValidEmail } from "@/components/ui/phone-input";

interface IdentityContactStepProps {
  data: any;
  onUpdate: (data: any) => void;
  onNext: () => void;
}

export function IdentityContactStep({ data, onUpdate, onNext }: IdentityContactStepProps) {
  const t = useTranslations("accountForms.personal.identity");
  const tc = useTranslations("accountForms.common");

  // Parse stored phone back into dialCode + number if possible
  const storedPhone: string = data.phone || "";
  const matchedDial = storedPhone
    ? [...["+352", "+33", "+44", "+1"]].find((d) => storedPhone.startsWith(d)) ||
      "+352"
    : "+352";
  const storedNumber = storedPhone.startsWith(matchedDial)
    ? storedPhone.slice(matchedDial.length).trim()
    : storedPhone;

  const [firstName, setFirstName] = React.useState(data.firstName || "");
  const [lastName, setLastName] = React.useState(data.lastName || "");
  const [email, setEmail] = React.useState(data.email || "");
  const [dialCode, setDialCode] = React.useState(matchedDial);
  const [phoneNumber, setPhoneNumber] = React.useState(storedNumber);

  const [emailTouched, setEmailTouched] = React.useState(false);
  const [phoneTouched, setPhoneTouched] = React.useState(false);

  const emailError =
    emailTouched && email && !isValidEmail(email)
      ? "Please enter a valid email address (e.g. name@example.com)"
      : "";

  const phoneError =
    phoneTouched && phoneNumber.replace(/\D/g, "").length < 5
      ? "Please enter a valid phone number"
      : "";

  const isFormValid =
    firstName.trim() &&
    lastName.trim() &&
    isValidEmail(email) &&
    phoneNumber.replace(/\D/g, "").length >= 5;

  // Push combined phone to parent whenever dial or number changes
  React.useEffect(() => {
    const combined = `${dialCode}${phoneNumber}`;
    onUpdate({
      firstName,
      lastName,
      email,
      phone: combined,
      isIdentityStepValid: !!(
        firstName.trim() &&
        lastName.trim() &&
        isValidEmail(email) &&
        phoneNumber.replace(/\D/g, "").length >= 5
      ),
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [firstName, lastName, email, dialCode, phoneNumber]);

  return (
    <div className="space-y-8">
      <div>
        <h2 className="mb-2 text-2xl font-bold text-brand-dark">{t("title")}</h2>
        <p className="text-brand-grayMed">{t("description")}</p>
      </div>

      <div className="space-y-6">
        {/* Name Fields */}
        <div className="grid gap-6 md:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="firstName">{tc("firstName")} *</Label>
            <Input
              id="firstName"
              type="text"
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              placeholder={t("firstNamePlaceholder")}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="lastName">{tc("lastName")} *</Label>
            <Input
              id="lastName"
              type="text"
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
              placeholder={t("lastNamePlaceholder")}
              required
            />
          </div>
        </div>

        {/* Email */}
        <div className="space-y-2">
          <Label htmlFor="email">{tc("emailAddress")} *</Label>
          <Input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            onBlur={() => setEmailTouched(true)}
            placeholder={t("emailPlaceholder")}
            className={emailError ? "border-red-400 focus-visible:ring-red-300" : ""}
            required
          />
          {emailError && (
            <p className="text-sm text-red-500 flex items-center gap-1.5">
              <AlertCircle className="h-3.5 w-3.5 shrink-0" />
              {emailError}
            </p>
          )}
        </div>

        {/* Phone */}
        <div className="space-y-2">
          <Label htmlFor="phone">{tc("phoneNumber")} *</Label>
          <PhoneInput
            dialCode={dialCode}
            number={phoneNumber}
            onDialCodeChange={setDialCode}
            onNumberChange={(v) => {
              setPhoneNumber(v);
              setPhoneTouched(true);
            }}
            placeholder={t("phonePlaceholder")}
          />
          {phoneError && (
            <p className="text-sm text-red-500 flex items-center gap-1.5">
              <AlertCircle className="h-3.5 w-3.5 shrink-0" />
              {phoneError}
            </p>
          )}
        </div>

        {!isFormValid && (emailTouched || phoneTouched) && (
          <div className="flex items-start gap-3 rounded-lg border border-amber-200 bg-amber-50 p-4">
            <AlertCircle className="h-5 w-5 flex-shrink-0 text-amber-600" />
            <div className="text-sm text-amber-900">
              {tc("completeRequired")}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
