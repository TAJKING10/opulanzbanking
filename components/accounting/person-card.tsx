"use client";

import * as React from "react";
import { useTranslations } from "next-intl";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export interface Person {
  firstName: string;
  lastName: string;
  role: string;
  email: string;
  phone: string;
}

const ROLES = [
  { value: "ceo", label: "CEO" },
  { value: "cfo", label: "CFO" },
  { value: "owner", label: "Owner" },
  { value: "other", label: "Other" },
];

interface PersonCardProps {
  label: string;
  person: Person;
  onChange: (person: Person) => void;
  required?: boolean;
  errors?: Partial<Record<keyof Person, string>>;
}

export function PersonCard({
  label,
  person,
  onChange,
  required = false,
  errors = {},
}: PersonCardProps) {
  const t = useTranslations();
  const [validationErrors, setValidationErrors] = React.useState<Partial<Record<keyof Person, string>>>({});

  const validateEmail = (email: string): string | null => {
    if (!email) return null;
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return t('accounting.contactsAddresses.errors.invalidEmail');
    }
    return null;
  };

  const validatePhone = (phone: string): string | null => {
    if (!phone) return null;
    // Phone format: must start with + and contain 10-15 digits
    const phoneRegex = /^\+?[\d\s\-()]{10,}$/;
    if (!phoneRegex.test(phone)) {
      return t('accounting.contactsAddresses.errors.invalidPhone');
    }
    return null;
  };

  const updateField = (field: keyof Person, value: string) => {
    onChange({ ...person, [field]: value });

    // Clear validation error for this field when user starts typing
    if (validationErrors[field]) {
      setValidationErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };

  const handleBlur = (field: keyof Person, value: string) => {
    let error: string | null = null;

    if (field === 'email') {
      error = validateEmail(value);
    } else if (field === 'phone') {
      error = validatePhone(value);
    }

    if (error) {
      setValidationErrors((prev) => ({ ...prev, [field]: error }));
    }
  };

  return (
    <div className="space-y-4 rounded-lg border border-brand-grayLight p-4">
      <h3 className="text-sm font-semibold text-brand-dark">
        {label} {required && <span className="text-red-500">*</span>}
      </h3>

      <div className="space-y-3">
        <div className="grid gap-3 md:grid-cols-2">
          <div>
            <Label className="text-sm text-brand-dark">{t('accounting.contactsAddresses.fields.firstName')}</Label>
            <Input
              value={person.firstName}
              onChange={(e) => updateField("firstName", e.target.value)}
              placeholder={t('accounting.contactsAddresses.placeholders.firstName')}
            />
          </div>

          <div>
            <Label className="text-sm text-brand-dark">{t('accounting.contactsAddresses.fields.lastName')}</Label>
            <Input
              value={person.lastName}
              onChange={(e) => updateField("lastName", e.target.value)}
              placeholder={t('accounting.contactsAddresses.placeholders.lastName')}
            />
          </div>
        </div>

        <div>
          <Label className="text-sm text-brand-dark">{t('accounting.contactsAddresses.fields.role')}</Label>
          <Select
            value={person.role}
            onValueChange={(value) => updateField("role", value)}
          >
            <SelectTrigger>
              <SelectValue placeholder={t('accounting.contactsAddresses.placeholders.role')} />
            </SelectTrigger>
            <SelectContent>
              {ROLES.map((role) => (
                <SelectItem key={role.value} value={role.value}>
                  {role.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label className="text-sm text-brand-dark">{t('accounting.contactsAddresses.fields.email')}</Label>
          <Input
            type="email"
            value={person.email}
            onChange={(e) => updateField("email", e.target.value)}
            onBlur={(e) => handleBlur("email", e.target.value)}
            placeholder={t('accounting.contactsAddresses.placeholders.email')}
            className={validationErrors.email ? "border-red-500 focus:ring-red-500" : ""}
          />
          {validationErrors.email && (
            <p className="mt-1 text-xs text-red-500">{validationErrors.email}</p>
          )}
        </div>

        <div>
          <Label className="text-sm text-brand-dark">{t('accounting.contactsAddresses.fields.phone')}</Label>
          <Input
            type="tel"
            value={person.phone}
            onChange={(e) => updateField("phone", e.target.value)}
            onBlur={(e) => handleBlur("phone", e.target.value)}
            placeholder={t('accounting.contactsAddresses.placeholders.phone')}
            className={validationErrors.phone ? "border-red-500 focus:ring-red-500" : ""}
          />
          {validationErrors.phone && (
            <p className="mt-1 text-xs text-red-500">{validationErrors.phone}</p>
          )}
        </div>
      </div>
    </div>
  );
}
