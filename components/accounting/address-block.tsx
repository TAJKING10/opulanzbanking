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

export interface Address {
  street: string;
  city: string;
  postal: string;
  country: string;
}

const COUNTRIES = [
  { code: "LU", name: "Luxembourg" },
  { code: "FR", name: "France" },
  { code: "DE", name: "Germany" },
  { code: "BE", name: "Belgium" },
  { code: "NL", name: "Netherlands" },
  { code: "GB", name: "United Kingdom" },
  { code: "US", name: "United States" },
  { code: "LV", name: "Latvia" },
];

interface AddressBlockProps {
  label: string;
  address: Address;
  onChange: (address: Address) => void;
  required?: boolean;
  errors?: Partial<Record<keyof Address, string>>;
}

export function AddressBlock({
  label,
  address,
  onChange,
  required = false,
  errors = {},
}: AddressBlockProps) {
  const t = useTranslations();

  const updateField = (field: keyof Address, value: string) => {
    onChange({ ...address, [field]: value });
  };

  return (
    <div className="space-y-4 rounded-lg border border-brand-grayLight p-4">
      <h3 className="text-sm font-semibold text-brand-dark">
        {label} {required && <span className="text-red-500">*</span>}
      </h3>

      <div className="space-y-3">
        <div>
          <Label className="text-sm text-brand-dark">{t('accounting.contactsAddresses.fields.street')}</Label>
          <Input
            value={address.street}
            onChange={(e) => updateField("street", e.target.value)}
            placeholder={t('accounting.contactsAddresses.placeholders.street')}
          />
        </div>

        <div className="grid gap-3 md:grid-cols-2">
          <div>
            <Label className="text-sm text-brand-dark">{t('accounting.contactsAddresses.fields.city')}</Label>
            <Input
              value={address.city}
              onChange={(e) => updateField("city", e.target.value)}
              placeholder={t('accounting.contactsAddresses.placeholders.city')}
            />
          </div>

          <div>
            <Label className="text-sm text-brand-dark">{t('accounting.contactsAddresses.fields.postal')}</Label>
            <Input
              value={address.postal}
              onChange={(e) => updateField("postal", e.target.value)}
              placeholder={t('accounting.contactsAddresses.placeholders.postal')}
            />
          </div>
        </div>

        <div>
          <Label className="text-sm text-brand-dark">{t('accounting.contactsAddresses.fields.country')}</Label>
          <Select
            value={address.country}
            onValueChange={(value) => updateField("country", value)}
          >
            <SelectTrigger>
              <SelectValue placeholder={t('accounting.contactsAddresses.placeholders.country')} />
            </SelectTrigger>
            <SelectContent>
              {COUNTRIES.map((country) => (
                <SelectItem key={country.code} value={country.code}>
                  {country.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
    </div>
  );
}
