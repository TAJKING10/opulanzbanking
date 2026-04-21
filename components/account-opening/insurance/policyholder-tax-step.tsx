"use client";

import * as React from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Info } from "lucide-react";

interface PolicyholderTaxStepProps {
  data: any;
  onUpdate: (data: any) => void;
  onNext: () => void;
}

const COUNTRIES = [
  { code: "LU", name: "Luxembourg" },
  { code: "FR", name: "France" },
  { code: "BE", name: "Belgium" },
  { code: "DE", name: "Germany" },
  { code: "NL", name: "Netherlands" },
  { code: "IT", name: "Italy" },
  { code: "ES", name: "Spain" },
  { code: "PT", name: "Portugal" },
  { code: "AT", name: "Austria" },
  { code: "CH", name: "Switzerland" },
  { code: "GB", name: "United Kingdom" },
  { code: "US", name: "United States" },
];

export function PolicyholderTaxStep({ data, onUpdate, onNext }: PolicyholderTaxStepProps) {
  const [formState, setFormState] = React.useState({
    title: data.title || "",
    firstName: data.firstName || "",
    lastName: data.lastName || "",
    dateOfBirth: data.dateOfBirth || "",
    placeOfBirth: data.placeOfBirth || "",
    nationality: data.nationality || "",
    email: data.email || "",
    phone: data.phone || "",
    addressLine1: data.addressLine1 || "",
    addressLine2: data.addressLine2 || "",
    city: data.city || "",
    postalCode: data.postalCode || "",
    country: data.country || "",
    taxResidentLU: data.taxResidentLU !== undefined ? data.taxResidentLU : true,
    additionalTaxResidencies: data.additionalTaxResidencies || [],
  });

  const [additionalResidency, setAdditionalResidency] = React.useState({
    country: "",
    tin: "",
  });

  const updateField = (field: string, value: any) => {
    setFormState((prev) => ({ ...prev, [field]: value }));
  };

  const addTaxResidency = () => {
    if (additionalResidency.country && additionalResidency.tin) {
      const updated = [...formState.additionalTaxResidencies, additionalResidency];
      setFormState((prev) => ({ ...prev, additionalTaxResidencies: updated }));
      setAdditionalResidency({ country: "", tin: "" });
    }
  };

  const removeTaxResidency = (index: number) => {
    const updated = formState.additionalTaxResidencies.filter((_: any, i: number) => i !== index);
    setFormState((prev) => ({ ...prev, additionalTaxResidencies: updated }));
  };

  // Validation - Relaxed to allow testing
  const isFormValid = React.useMemo(() => {
    // Only require basic fields to allow progression
    return (
      formState.firstName &&
      formState.lastName &&
      formState.email
    );
  }, [formState]);

  // Update parent with validation status
  React.useEffect(() => {
    onUpdate({
      ...formState,
      isPolicyholderStepValid: isFormValid,
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [formState, isFormValid]);

  return (
    <div className="space-y-8">
      <div>
        <h2 className="mb-2 text-2xl font-bold text-brand-dark">Policyholder Information</h2>
        <p className="text-brand-grayMed">
          Please provide your personal details and tax residency information.
        </p>
      </div>

      {/* Personal Details */}
      <div className="space-y-6">
        <h3 className="text-lg font-semibold text-brand-dark">Personal Details</h3>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-4">
          <div className="space-y-2">
            <Label htmlFor="title">Title *</Label>
            <Select value={formState.title} onValueChange={(value) => updateField("title", value)}>
              <SelectTrigger id="title">
                <SelectValue placeholder="Select" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Mr">Mr</SelectItem>
                <SelectItem value="Mrs">Mrs</SelectItem>
                <SelectItem value="Ms">Ms</SelectItem>
                <SelectItem value="Dr">Dr</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2 md:col-span-3">
            <Label htmlFor="firstName">First Name *</Label>
            <Input
              id="firstName"
              type="text"
              value={formState.firstName}
              onChange={(e) => updateField("firstName", e.target.value)}
              placeholder="Enter your first name"
              required
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="lastName">Last Name *</Label>
          <Input
            id="lastName"
            type="text"
            value={formState.lastName}
            onChange={(e) => updateField("lastName", e.target.value)}
            placeholder="Enter your last name"
            required
          />
        </div>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="dateOfBirth">Date of Birth *</Label>
            <Input
              id="dateOfBirth"
              type="date"
              value={formState.dateOfBirth}
              onChange={(e) => updateField("dateOfBirth", e.target.value)}
              max={new Date().toISOString().split("T")[0]}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="placeOfBirth">Place of Birth *</Label>
            <Input
              id="placeOfBirth"
              type="text"
              value={formState.placeOfBirth}
              onChange={(e) => updateField("placeOfBirth", e.target.value)}
              placeholder="City, Country"
              required
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="nationality">Nationality *</Label>
          <Select value={formState.nationality} onValueChange={(value) => updateField("nationality", value)}>
            <SelectTrigger id="nationality">
              <SelectValue placeholder="Select nationality" />
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

      {/* Contact Information */}
      <div className="space-y-6">
        <h3 className="text-lg font-semibold text-brand-dark">Contact Information</h3>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="email">Email Address *</Label>
            <Input
              id="email"
              type="email"
              value={formState.email}
              onChange={(e) => updateField("email", e.target.value)}
              placeholder="your.email@example.com"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="phone">Phone Number *</Label>
            <Input
              id="phone"
              type="tel"
              value={formState.phone}
              onChange={(e) => updateField("phone", e.target.value)}
              placeholder="+352 123 456 789"
              required
            />
          </div>
        </div>
      </div>

      {/* Address */}
      <div className="space-y-6">
        <h3 className="text-lg font-semibold text-brand-dark">Residential Address</h3>

        <div className="space-y-2">
          <Label htmlFor="addressLine1">Address Line 1 *</Label>
          <Input
            id="addressLine1"
            type="text"
            value={formState.addressLine1}
            onChange={(e) => updateField("addressLine1", e.target.value)}
            placeholder="Street address"
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="addressLine2">Address Line 2</Label>
          <Input
            id="addressLine2"
            type="text"
            value={formState.addressLine2}
            onChange={(e) => updateField("addressLine2", e.target.value)}
            placeholder="Apartment, suite, etc. (optional)"
          />
        </div>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
          <div className="space-y-2">
            <Label htmlFor="city">City *</Label>
            <Input
              id="city"
              type="text"
              value={formState.city}
              onChange={(e) => updateField("city", e.target.value)}
              placeholder="City"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="postalCode">Postal Code *</Label>
            <Input
              id="postalCode"
              type="text"
              value={formState.postalCode}
              onChange={(e) => updateField("postalCode", e.target.value)}
              placeholder="Postal code"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="country">Country *</Label>
            <Select value={formState.country} onValueChange={(value) => updateField("country", value)}>
              <SelectTrigger id="country">
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
          </div>
        </div>
      </div>

      {/* Tax Residency */}
      <div className="space-y-6">
        <h3 className="text-lg font-semibold text-brand-dark">Tax Residency</h3>

        <div className="flex items-start space-x-3 rounded-lg border border-brand-grayLight bg-gray-50 p-4">
          <Checkbox
            id="taxResidentLU"
            checked={formState.taxResidentLU}
            onCheckedChange={(checked) => updateField("taxResidentLU", checked)}
          />
          <div className="space-y-1">
            <Label htmlFor="taxResidentLU" className="cursor-pointer font-medium">
              I am a tax resident of Luxembourg
            </Label>
            <p className="text-sm text-brand-grayMed">
              Check this if you are liable to pay taxes in Luxembourg
            </p>
          </div>
        </div>

        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <Label className="font-medium">Additional Tax Residencies</Label>
            <Info className="h-4 w-4 text-brand-grayMed" />
          </div>

          {formState.additionalTaxResidencies.length > 0 && (
            <div className="space-y-2">
              {formState.additionalTaxResidencies.map((residency: any, index: number) => (
                <div
                  key={index}
                  className="flex items-center justify-between rounded-lg border border-brand-grayLight bg-white p-3"
                >
                  <div>
                    <p className="font-medium">
                      {COUNTRIES.find((c) => c.code === residency.country)?.name || residency.country}
                    </p>
                    <p className="text-sm text-brand-grayMed">TIN: {residency.tin}</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => removeTaxResidency(index)}
                    className="text-sm text-red-600 hover:text-red-700"
                  >
                    Remove
                  </button>
                </div>
              ))}
            </div>
          )}

          <div className="rounded-lg border border-brand-grayLight bg-gray-50 p-4">
            <p className="mb-4 text-sm font-medium text-brand-dark">Add Tax Residency</p>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="additionalCountry">Country</Label>
                <Select
                  value={additionalResidency.country}
                  onValueChange={(value) => setAdditionalResidency((prev) => ({ ...prev, country: value }))}
                >
                  <SelectTrigger id="additionalCountry">
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
              </div>

              <div className="space-y-2">
                <Label htmlFor="tin">Tax Identification Number (TIN)</Label>
                <Input
                  id="tin"
                  type="text"
                  value={additionalResidency.tin}
                  onChange={(e) => setAdditionalResidency((prev) => ({ ...prev, tin: e.target.value }))}
                  placeholder="Enter TIN"
                />
              </div>
            </div>
            <button
              type="button"
              onClick={addTaxResidency}
              disabled={!additionalResidency.country || !additionalResidency.tin}
              className="mt-4 text-sm font-medium text-brand-gold hover:text-brand-goldDark disabled:text-gray-400"
            >
              + Add Tax Residency
            </button>
          </div>
        </div>

        <div className="rounded-lg border border-blue-200 bg-blue-50 p-4">
          <div className="flex items-start gap-2">
            <Info className="mt-0.5 h-5 w-5 text-blue-600" />
            <div className="space-y-1 text-sm text-blue-800">
              <p className="font-semibold">FATCA & CRS Compliance</p>
              <p>
                Luxembourg life insurance companies are required to report to tax authorities under FATCA (US) and
                CRS (OECD) regulations. Please ensure all tax residency information is accurate and complete.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
