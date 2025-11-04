"use client";

import * as React from "react";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { AddressBlock, Address } from "./address-block";
import { PersonCard, Person } from "./person-card";

interface ContactsAddressesStepProps {
  data: any;
  onUpdate: (data: any) => void;
  onNext: () => void;
}

export function ContactsAddressesStep({
  data,
  onUpdate,
  onNext,
}: ContactsAddressesStepProps) {
  const [sameAsRegistered, setSameAsRegistered] = React.useState(
    data.sameAsRegistered || false
  );
  const [hasAccountingContact, setHasAccountingContact] = React.useState(
    data.hasAccountingContact || false
  );
  const [errors, setErrors] = React.useState<Record<string, any>>({});

  const updateField = (field: string, value: any) => {
    onUpdate({ [field]: value });
  };

  const handleSameAsRegisteredChange = (checked: boolean) => {
    setSameAsRegistered(checked);
    onUpdate({ sameAsRegistered: checked });
    if (checked) {
      onUpdate({ operatingAddress: data.registeredAddress });
    }
  };

  const handleHasAccountingContactChange = (checked: boolean) => {
    setHasAccountingContact(checked);
    onUpdate({ hasAccountingContact: checked });
  };

  const validate = () => {
    const newErrors: Record<string, any> = {};

    // Validate registered address
    if (!data.registeredAddress?.street)
      newErrors.registeredAddress = { street: "Street is required" };
    if (!data.registeredAddress?.city)
      newErrors.registeredAddress = {
        ...newErrors.registeredAddress,
        city: "City is required",
      };
    if (!data.registeredAddress?.postal)
      newErrors.registeredAddress = {
        ...newErrors.registeredAddress,
        postal: "Postal code is required",
      };
    if (!data.registeredAddress?.country)
      newErrors.registeredAddress = {
        ...newErrors.registeredAddress,
        country: "Country is required",
      };

    // Validate operating address if different
    if (!sameAsRegistered) {
      if (!data.operatingAddress?.street)
        newErrors.operatingAddress = { street: "Street is required" };
      if (!data.operatingAddress?.city)
        newErrors.operatingAddress = {
          ...newErrors.operatingAddress,
          city: "City is required",
        };
      if (!data.operatingAddress?.postal)
        newErrors.operatingAddress = {
          ...newErrors.operatingAddress,
          postal: "Postal code is required",
        };
      if (!data.operatingAddress?.country)
        newErrors.operatingAddress = {
          ...newErrors.operatingAddress,
          country: "Country is required",
        };
    }

    // Validate primary contact
    if (!data.primaryContact?.firstName)
      newErrors.primaryContact = { firstName: "First name is required" };
    if (!data.primaryContact?.lastName)
      newErrors.primaryContact = {
        ...newErrors.primaryContact,
        lastName: "Last name is required",
      };
    if (!data.primaryContact?.role)
      newErrors.primaryContact = {
        ...newErrors.primaryContact,
        role: "Role is required",
      };
    if (!data.primaryContact?.email)
      newErrors.primaryContact = {
        ...newErrors.primaryContact,
        email: "Email is required",
      };
    if (!data.primaryContact?.phone)
      newErrors.primaryContact = {
        ...newErrors.primaryContact,
        phone: "Phone is required",
      };

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleContinue = () => {
    if (validate()) {
      onNext();
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="mb-2 text-2xl font-bold text-brand-dark">
          Contacts & Addresses
        </h2>
        <p className="text-brand-grayMed">
          Provide your company addresses and key contact information.
        </p>
      </div>

      <div className="space-y-6">
        {/* Registered Address */}
        <AddressBlock
          label="Registered Address"
          address={
            data.registeredAddress || {
              street: "",
              city: "",
              postal: "",
              country: "",
            }
          }
          onChange={(address) => updateField("registeredAddress", address)}
          required
          errors={errors.registeredAddress}
        />

        {/* Operating Address */}
        <div className="space-y-3">
          <div className="flex items-center space-x-2">
            <Checkbox
              id="sameAsRegistered"
              checked={sameAsRegistered}
              onCheckedChange={handleSameAsRegisteredChange}
            />
            <Label
              htmlFor="sameAsRegistered"
              className="cursor-pointer text-sm font-medium text-brand-dark"
            >
              Operating address same as registered address
            </Label>
          </div>

          {!sameAsRegistered && (
            <AddressBlock
              label="Operating Address"
              address={
                data.operatingAddress || {
                  street: "",
                  city: "",
                  postal: "",
                  country: "",
                }
              }
              onChange={(address) => updateField("operatingAddress", address)}
              required
              errors={errors.operatingAddress}
            />
          )}
        </div>

        {/* Primary Contact */}
        <PersonCard
          label="Primary Contact"
          person={
            data.primaryContact || {
              firstName: "",
              lastName: "",
              role: "",
              email: "",
              phone: "",
            }
          }
          onChange={(person) => updateField("primaryContact", person)}
          required
          errors={errors.primaryContact}
        />

        {/* Accounting Contact */}
        <div className="space-y-3">
          <div className="flex items-center space-x-2">
            <Checkbox
              id="hasAccountingContact"
              checked={hasAccountingContact}
              onCheckedChange={handleHasAccountingContactChange}
            />
            <Label
              htmlFor="hasAccountingContact"
              className="cursor-pointer text-sm font-medium text-brand-dark"
            >
              Add a separate accounting contact
            </Label>
          </div>

          {hasAccountingContact && (
            <PersonCard
              label="Accounting Contact"
              person={
                data.accountingContact || {
                  firstName: "",
                  lastName: "",
                  role: "",
                  email: "",
                  phone: "",
                }
              }
              onChange={(person) => updateField("accountingContact", person)}
            />
          )}
        </div>
      </div>

      <div className="flex justify-end">
        <button
          onClick={handleContinue}
          className="rounded-lg bg-brand-gold px-6 py-3 font-semibold text-white transition-all hover:bg-brand-goldDark"
        >
          Continue
        </button>
      </div>
    </div>
  );
}
