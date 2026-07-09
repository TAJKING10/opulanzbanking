"use client";

import * as React from "react";
import { useTranslations } from "next-intl";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { COUNTRIES } from "@/shared/lib/countries";

export interface Address {
  street: string;
  city: string;
  postal: string;
  country: string;
}

interface AddressBlockProps {
  label: string;
  address: Address;
  onChange: (address: Address) => void;
  required?: boolean;
  errors?: Partial<Record<keyof Address, string>>;
}

function CountrySearch({
  value,
  onChange,
  placeholder,
}: {
  value: string;
  onChange: (code: string) => void;
  placeholder: string;
}) {
  const [query, setQuery] = React.useState("");
  const [open, setOpen] = React.useState(false);
  const containerRef = React.useRef<HTMLDivElement>(null);

  const selected = COUNTRIES.find((c) => c.code === value);
  const filtered = COUNTRIES.filter((c) =>
    c.name.toLowerCase().includes(query.toLowerCase())
  );

  React.useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
        setQuery("");
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  return (
    <div ref={containerRef} className="relative">
      <Input
        value={open ? query : (selected?.name ?? "")}
        placeholder={placeholder}
        onFocus={() => {
          setOpen(true);
          setQuery("");
        }}
        onChange={(e) => setQuery(e.target.value)}
      />
      {open && (
        <div className="absolute z-50 mt-1 max-h-56 w-full overflow-auto rounded-md border border-brand-grayLight bg-white shadow-md">
          {filtered.length === 0 ? (
            <div className="px-3 py-2 text-sm text-brand-grayMed">No results</div>
          ) : (
            filtered.map((c) => (
              <button
                key={c.code}
                type="button"
                className="w-full px-3 py-2 text-left text-sm hover:bg-brand-offWhite focus:bg-brand-offWhite"
                onMouseDown={() => {
                  onChange(c.code);
                  setOpen(false);
                  setQuery("");
                }}
              >
                {c.name}
              </button>
            ))
          )}
        </div>
      )}
    </div>
  );
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
          <CountrySearch
            value={address.country}
            onChange={(code) => updateField("country", code)}
            placeholder={t('accounting.contactsAddresses.placeholders.country')}
          />
        </div>
      </div>
    </div>
  );
}
