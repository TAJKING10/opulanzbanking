"use client";

import * as React from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Info, Plus, Trash2 } from "lucide-react";

interface BeneficiariesStepProps {
  data: any;
  onUpdate: (data: any) => void;
  onNext: () => void;
}

interface Beneficiary {
  id: string;
  type: string;
  title: string;
  firstName: string;
  lastName: string;
  dateOfBirth: string;
  relationship: string;
  percentage: string;
}

const RELATIONSHIPS = [
  { value: "spouse", label: "Spouse" },
  { value: "partner", label: "Partner" },
  { value: "child", label: "Child" },
  { value: "parent", label: "Parent" },
  { value: "sibling", label: "Sibling" },
  { value: "other-family", label: "Other Family Member" },
  { value: "friend", label: "Friend" },
  { value: "charity", label: "Charity/Organization" },
  { value: "other", label: "Other" },
];

export function BeneficiariesStep({ data, onUpdate, onNext }: BeneficiariesStepProps) {
  const [beneficiaries, setBeneficiaries] = React.useState<Beneficiary[]>(
    data.beneficiaries || []
  );

  const addBeneficiary = () => {
    const newBeneficiary: Beneficiary = {
      id: Date.now().toString(),
      type: "primary",
      title: "",
      firstName: "",
      lastName: "",
      dateOfBirth: "",
      relationship: "",
      percentage: "",
    };
    setBeneficiaries([...beneficiaries, newBeneficiary]);
  };

  const removeBeneficiary = (id: string) => {
    setBeneficiaries(beneficiaries.filter((b) => b.id !== id));
  };

  const updateBeneficiary = (id: string, field: keyof Beneficiary, value: string) => {
    setBeneficiaries(
      beneficiaries.map((b) => (b.id === id ? { ...b, [field]: value } : b))
    );
  };

  // Calculate total percentage
  const totalPercentage = React.useMemo(() => {
    return beneficiaries.reduce((sum, b) => {
      const percent = parseFloat(b.percentage) || 0;
      return sum + percent;
    }, 0);
  }, [beneficiaries]);

  // Validation
  const isFormValid = React.useMemo(() => {
    if (beneficiaries.length === 0) return false;

    // Check all beneficiaries have required fields
    const allFieldsFilled = beneficiaries.every(
      (b) =>
        b.type &&
        b.title &&
        b.firstName &&
        b.lastName &&
        b.dateOfBirth &&
        b.relationship &&
        b.percentage
    );

    // Check total percentage equals 100
    const percentageValid = Math.abs(totalPercentage - 100) < 0.01;

    return allFieldsFilled && percentageValid;
  }, [beneficiaries, totalPercentage]);

  // Update parent with validation status
  React.useEffect(() => {
    onUpdate({
      beneficiaries: beneficiaries,
      isBeneficiariesStepValid: isFormValid,
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [beneficiaries, isFormValid]);

  return (
    <div className="space-y-8">
      <div>
        <h2 className="mb-2 text-2xl font-bold text-brand-dark">Beneficiaries</h2>
        <p className="text-brand-grayMed">
          Designate who will receive the policy proceeds in the event of your death.
        </p>
      </div>

      {beneficiaries.length === 0 ? (
        <div className="rounded-lg border-2 border-dashed border-brand-grayLight p-12 text-center">
          <p className="mb-4 text-brand-grayMed">No beneficiaries added yet</p>
          <Button
            type="button"
            onClick={addBeneficiary}
            className="bg-brand-gold text-white hover:bg-brand-goldDark"
          >
            <Plus className="mr-2 h-4 w-4" />
            Add First Beneficiary
          </Button>
        </div>
      ) : (
        <div className="space-y-6">
          {beneficiaries.map((beneficiary, index) => (
            <div
              key={beneficiary.id}
              className="rounded-lg border border-brand-grayLight bg-white p-6 shadow-sm"
            >
              <div className="mb-4 flex items-center justify-between">
                <h3 className="text-lg font-semibold text-brand-dark">
                  Beneficiary {index + 1}
                </h3>
                <button
                  type="button"
                  onClick={() => removeBeneficiary(beneficiary.id)}
                  className="text-red-600 hover:text-red-700"
                  title="Remove beneficiary"
                >
                  <Trash2 className="h-5 w-5" />
                </button>
              </div>

              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor={`type-${beneficiary.id}`}>Beneficiary Type *</Label>
                  <Select
                    value={beneficiary.type}
                    onValueChange={(value) => updateBeneficiary(beneficiary.id, "type", value)}
                  >
                    <SelectTrigger id={`type-${beneficiary.id}`}>
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="primary">Primary Beneficiary</SelectItem>
                      <SelectItem value="contingent">Contingent Beneficiary</SelectItem>
                    </SelectContent>
                  </Select>
                  <p className="text-xs text-brand-grayMed">
                    Primary beneficiaries receive proceeds first. Contingent beneficiaries receive
                    proceeds if all primary beneficiaries predecease you.
                  </p>
                </div>

                <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
                  <div className="space-y-2">
                    <Label htmlFor={`title-${beneficiary.id}`}>Title *</Label>
                    <Select
                      value={beneficiary.title}
                      onValueChange={(value) => updateBeneficiary(beneficiary.id, "title", value)}
                    >
                      <SelectTrigger id={`title-${beneficiary.id}`}>
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
                    <Label htmlFor={`firstName-${beneficiary.id}`}>First Name *</Label>
                    <Input
                      id={`firstName-${beneficiary.id}`}
                      type="text"
                      value={beneficiary.firstName}
                      onChange={(e) =>
                        updateBeneficiary(beneficiary.id, "firstName", e.target.value)
                      }
                      placeholder="First name"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor={`lastName-${beneficiary.id}`}>Last Name *</Label>
                  <Input
                    id={`lastName-${beneficiary.id}`}
                    type="text"
                    value={beneficiary.lastName}
                    onChange={(e) => updateBeneficiary(beneficiary.id, "lastName", e.target.value)}
                    placeholder="Last name"
                    required
                  />
                </div>

                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor={`dateOfBirth-${beneficiary.id}`}>Date of Birth *</Label>
                    <Input
                      id={`dateOfBirth-${beneficiary.id}`}
                      type="date"
                      value={beneficiary.dateOfBirth}
                      onChange={(e) =>
                        updateBeneficiary(beneficiary.id, "dateOfBirth", e.target.value)
                      }
                      max={new Date().toISOString().split("T")[0]}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor={`relationship-${beneficiary.id}`}>Relationship *</Label>
                    <Select
                      value={beneficiary.relationship}
                      onValueChange={(value) =>
                        updateBeneficiary(beneficiary.id, "relationship", value)
                      }
                    >
                      <SelectTrigger id={`relationship-${beneficiary.id}`}>
                        <SelectValue placeholder="Select relationship" />
                      </SelectTrigger>
                      <SelectContent>
                        {RELATIONSHIPS.map((rel) => (
                          <SelectItem key={rel.value} value={rel.value}>
                            {rel.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor={`percentage-${beneficiary.id}`}>
                    Percentage of Proceeds *
                  </Label>
                  <div className="relative">
                    <Input
                      id={`percentage-${beneficiary.id}`}
                      type="number"
                      min="0"
                      max="100"
                      step="0.01"
                      value={beneficiary.percentage}
                      onChange={(e) =>
                        updateBeneficiary(beneficiary.id, "percentage", e.target.value)
                      }
                      placeholder="0.00"
                      required
                    />
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-brand-grayMed">
                      %
                    </span>
                  </div>
                </div>
              </div>
            </div>
          ))}

          {/* Total Percentage Display */}
          <div
            className={`rounded-lg border-2 p-4 ${
              Math.abs(totalPercentage - 100) < 0.01
                ? "border-green-500 bg-green-50"
                : "border-amber-500 bg-amber-50"
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="font-semibold text-brand-dark">Total Percentage:</span>
              <span
                className={`text-lg font-bold ${
                  Math.abs(totalPercentage - 100) < 0.01 ? "text-green-600" : "text-amber-600"
                }`}
              >
                {totalPercentage.toFixed(2)}%
              </span>
            </div>
            {Math.abs(totalPercentage - 100) >= 0.01 && (
              <p className="mt-2 text-sm text-amber-800">
                The total percentage must equal 100%. Currently{" "}
                {totalPercentage < 100 ? "missing" : "over by"}{" "}
                {Math.abs(100 - totalPercentage).toFixed(2)}%
              </p>
            )}
          </div>

          <Button
            type="button"
            onClick={addBeneficiary}
            variant="outline"
            className="w-full"
          >
            <Plus className="mr-2 h-4 w-4" />
            Add Another Beneficiary
          </Button>
        </div>
      )}

      <div className="space-y-4">
        <div className="rounded-lg border border-blue-200 bg-blue-50 p-4">
          <div className="flex items-start gap-2">
            <Info className="mt-0.5 h-5 w-5 text-blue-600" />
            <div className="space-y-1 text-sm text-blue-800">
              <p className="font-semibold">Beneficiary Designation</p>
              <ul className="ml-4 mt-2 list-disc space-y-1">
                <li>
                  <strong>Primary Beneficiaries:</strong> Receive policy proceeds first according
                  to their percentage allocation.
                </li>
                <li>
                  <strong>Contingent Beneficiaries:</strong> Only receive proceeds if all primary
                  beneficiaries have predeceased you.
                </li>
                <li>
                  The total percentage for all primary beneficiaries must equal 100%, as must the
                  total for all contingent beneficiaries (if any).
                </li>
                <li>You can update beneficiaries at any time during the life of the policy.</li>
              </ul>
            </div>
          </div>
        </div>

        <div className="rounded-lg border border-amber-200 bg-amber-50 p-4">
          <div className="flex items-start gap-2">
            <Info className="mt-0.5 h-5 w-5 text-amber-600" />
            <div className="space-y-1 text-sm text-amber-800">
              <p className="font-semibold">Important Note</p>
              <p>
                If you do not name a beneficiary, or if no named beneficiaries survive you, the
                proceeds will be paid to your estate. We recommend consulting with a legal or tax
                advisor when making beneficiary designations, especially for complex family
                situations or international beneficiaries.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
