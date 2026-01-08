"use client";

import * as React from "react";
import { useTranslations } from "next-intl";
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
  const t = useTranslations();
  const [sameAsRegistered, setSameAsRegistered] = React.useState(
    data.sameAsRegistered || false
  );
  const [hasAccountingContact, setHasAccountingContact] = React.useState(
    data.hasAccountingContact || false
  );

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

  const validateEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const validatePhone = (phone: string): boolean => {
    const phoneRegex = /^\+?[\d\s\-()]{10,}$/;
    return phoneRegex.test(phone);
  };

  const checkValidity = () => {
    // Check registered address
    if (!data.registeredAddress?.street) return false;
    if (!data.registeredAddress?.city) return false;
    if (!data.registeredAddress?.postal) return false;
    if (!data.registeredAddress?.country) return false;

    // Check operating address if different
    if (!sameAsRegistered) {
      if (!data.operatingAddress?.street) return false;
      if (!data.operatingAddress?.city) return false;
      if (!data.operatingAddress?.postal) return false;
      if (!data.operatingAddress?.country) return false;
    }

    // Check primary contact
    if (!data.primaryContact?.firstName) return false;
    if (!data.primaryContact?.lastName) return false;
    if (!data.primaryContact?.role) return false;
    if (!data.primaryContact?.email) return false;
    if (!validateEmail(data.primaryContact.email)) return false;
    if (!data.primaryContact?.phone) return false;
    if (!validatePhone(data.primaryContact.phone)) return false;

    // Check accounting contact if provided
    if (hasAccountingContact) {
      if (!data.accountingContact?.firstName) return false;
      if (!data.accountingContact?.lastName) return false;
      if (!data.accountingContact?.role) return false;
      if (!data.accountingContact?.email) return false;
      if (!validateEmail(data.accountingContact.email)) return false;
      if (!data.accountingContact?.phone) return false;
      if (!validatePhone(data.accountingContact.phone)) return false;
    }

    return true;
  };

  // Check validation whenever data changes
  React.useEffect(() => {
    const isValid = checkValidity();
    onUpdate({ isStep3Valid: isValid });
  }, [
    data.registeredAddress,
    data.operatingAddress,
    data.primaryContact,
    data.accountingContact,
    sameAsRegistered,
    hasAccountingContact,
  ]);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="mb-2 text-2xl font-bold text-brand-dark">
          {t('accounting.contactsAddresses.title')}
        </h2>
        <p className="text-brand-grayMed">
          {t('accounting.contactsAddresses.subtitle')}
        </p>
      </div>

      <div className="space-y-6">
        {/* Registered Address */}
        <AddressBlock
          label={t('accounting.contactsAddresses.registeredAddress')}
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
              {t('accounting.contactsAddresses.sameAsRegistered')}
            </Label>
          </div>

          {!sameAsRegistered && (
            <AddressBlock
              label={t('accounting.contactsAddresses.operatingAddress')}
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
            />
          )}
        </div>

        {/* Primary Contact */}
        <PersonCard
          label={t('accounting.contactsAddresses.primaryContact')}
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
              {t('accounting.contactsAddresses.addAccountingContact')}
            </Label>
          </div>

          {hasAccountingContact && (
            <PersonCard
              label={t('accounting.contactsAddresses.accountingContact')}
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
    </div>
  );
}
