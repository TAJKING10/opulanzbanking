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
  // Executive Leadership
  { value: "ceo", label: "CEO – Chief Executive Officer" },
  { value: "coo", label: "COO – Chief Operating Officer" },
  { value: "cfo", label: "CFO – Chief Financial Officer" },
  { value: "cto", label: "CTO – Chief Technology Officer" },
  { value: "cmo", label: "CMO – Chief Marketing Officer" },
  { value: "cso", label: "CSO – Chief Strategy Officer" },
  { value: "cro", label: "CRO – Chief Revenue Officer" },
  { value: "chro", label: "CHRO – Chief Human Resources Officer" },
  { value: "cco", label: "CCO – Chief Compliance Officer" },
  { value: "clro", label: "CLO – Chief Legal Officer" },
  // Ownership & Board
  { value: "owner", label: "Owner" },
  { value: "co_owner", label: "Co-Owner" },
  { value: "founder", label: "Founder" },
  { value: "co_founder", label: "Co-Founder" },
  { value: "chairman", label: "Chairman of the Board" },
  { value: "board_member", label: "Board Member" },
  { value: "managing_director", label: "Managing Director" },
  { value: "general_director", label: "General Director" },
  { value: "president", label: "President" },
  { value: "vice_president", label: "Vice President" },
  // Finance & Accounting
  { value: "finance_director", label: "Finance Director" },
  { value: "financial_controller", label: "Financial Controller" },
  { value: "treasurer", label: "Treasurer" },
  { value: "accountant", label: "Accountant" },
  { value: "chief_accountant", label: "Chief Accountant" },
  { value: "financial_analyst", label: "Financial Analyst" },
  { value: "tax_advisor", label: "Tax Advisor" },
  { value: "auditor", label: "Auditor" },
  // Legal & Compliance
  { value: "legal_director", label: "Legal Director" },
  { value: "general_counsel", label: "General Counsel" },
  { value: "compliance_officer", label: "Compliance Officer" },
  { value: "aml_officer", label: "AML Officer" },
  { value: "data_protection_officer", label: "Data Protection Officer (DPO)" },
  { value: "company_secretary", label: "Company Secretary" },
  // Operations & Administration
  { value: "operations_director", label: "Operations Director" },
  { value: "operations_manager", label: "Operations Manager" },
  { value: "admin_manager", label: "Administrative Manager" },
  { value: "office_manager", label: "Office Manager" },
  { value: "project_manager", label: "Project Manager" },
  { value: "procurement_manager", label: "Procurement Manager" },
  // Sales & Marketing
  { value: "sales_director", label: "Sales Director" },
  { value: "sales_manager", label: "Sales Manager" },
  { value: "marketing_director", label: "Marketing Director" },
  { value: "marketing_manager", label: "Marketing Manager" },
  { value: "business_development", label: "Business Development Manager" },
  { value: "account_manager", label: "Account Manager" },
  // Technology
  { value: "it_director", label: "IT Director" },
  { value: "it_manager", label: "IT Manager" },
  { value: "product_manager", label: "Product Manager" },
  { value: "software_engineer", label: "Software Engineer / Developer" },
  // HR & People
  { value: "hr_director", label: "HR Director" },
  { value: "hr_manager", label: "HR Manager" },
  // Authorized Representative
  { value: "authorized_signatory", label: "Authorized Signatory" },
  { value: "power_of_attorney", label: "Power of Attorney" },
  { value: "legal_representative", label: "Legal Representative" },
  // Other
  { value: "consultant", label: "Consultant / Advisor" },
  { value: "partner", label: "Partner" },
  { value: "associate", label: "Associate" },
  { value: "other", label: "Other" },
];

interface PersonCardProps {
  label: string;
  person: Person;
  onChange: (person: Person) => void;
  required?: boolean;
  errors?: Partial<Record<keyof Person, string>>;
}

function isValidEmail(email: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function isValidPhone(phone: string) {
  const digits = phone.replace(/\D/g, "");
  return phone.trim().startsWith("+") && digits.length >= 7 && digits.length <= 15;
}

export function PersonCard({
  label,
  person,
  onChange,
  required = false,
  errors = {},
}: PersonCardProps) {
  const t = useTranslations();
  const [touchedEmail, setTouchedEmail] = React.useState(false);
  const [touchedPhone, setTouchedPhone] = React.useState(false);

  const updateField = (field: keyof Person, value: string) => {
    onChange({ ...person, [field]: value });
  };

  const emailError =
    touchedEmail && person.email && !isValidEmail(person.email)
      ? "Please enter a valid email address (e.g. name@company.com)"
      : null;

  const phoneError =
    touchedPhone && person.phone && !isValidPhone(person.phone)
      ? "Phone must start with + country code and contain 7–15 digits (e.g. +352 123 456 789)"
      : null;

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
            onBlur={() => setTouchedEmail(true)}
            placeholder={t('accounting.contactsAddresses.placeholders.email')}
            className={emailError ? "border-red-500 focus-visible:ring-red-500" : ""}
          />
          {emailError && (
            <p className="mt-1 text-xs text-red-500">{emailError}</p>
          )}
        </div>

        <div>
          <Label className="text-sm text-brand-dark">{t('accounting.contactsAddresses.fields.phone')}</Label>
          <Input
            type="tel"
            value={person.phone}
            onChange={(e) => updateField("phone", e.target.value)}
            onBlur={() => setTouchedPhone(true)}
            placeholder={t('accounting.contactsAddresses.placeholders.phone')}
            className={phoneError ? "border-red-500 focus-visible:ring-red-500" : ""}
          />
          {phoneError && (
            <p className="mt-1 text-xs text-red-500">{phoneError}</p>
          )}
        </div>
      </div>
    </div>
  );
}
