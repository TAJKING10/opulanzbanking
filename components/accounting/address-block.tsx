"use client";

import * as React from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Address } from "@/shared/types/person";

export type { Address };

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
          <Label className="text-sm text-brand-dark">Street Address</Label>
          <Input
            value={address.street}
            onChange={(e) => updateField("street", e.target.value)}
            placeholder="123 Main Street"
            className={errors.street ? "border-red-500" : ""}
          />
          {errors.street && (
            <p className="mt-1 text-xs text-red-500">{errors.street}</p>
          )}
        </div>

        <div className="grid gap-3 md:grid-cols-2">
          <div>
            <Label className="text-sm text-brand-dark">City</Label>
            <Input
              value={address.city}
              onChange={(e) => updateField("city", e.target.value)}
              placeholder="Luxembourg"
              className={errors.city ? "border-red-500" : ""}
            />
            {errors.city && (
              <p className="mt-1 text-xs text-red-500">{errors.city}</p>
            )}
          </div>

          <div>
            <Label className="text-sm text-brand-dark">Postal Code</Label>
            <Input
              value={address.postal}
              onChange={(e) => updateField("postal", e.target.value)}
              placeholder="L-1234"
              className={errors.postal ? "border-red-500" : ""}
            />
            {errors.postal && (
              <p className="mt-1 text-xs text-red-500">{errors.postal}</p>
            )}
          </div>
        </div>

        <div>
          <Label className="text-sm text-brand-dark">Country</Label>
          <Select
            value={address.country}
            onValueChange={(value) => updateField("country", value)}
          >
            <SelectTrigger className={errors.country ? "border-red-500" : ""}>
              <SelectValue placeholder="Select country" />
            </SelectTrigger>
            <SelectContent>
              {COUNTRIES.map((country) => (
                <SelectItem key={country.code} value={country.code}>
                  {country.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {errors.country && (
            <p className="mt-1 text-xs text-red-500">{errors.country}</p>
          )}
        </div>
      </div>
    </div>
  );
}
