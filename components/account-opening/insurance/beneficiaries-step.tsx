"use client";

import * as React from "react";
import { useTranslations } from "next-intl";
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

const RELATIONSHIP_KEYS = [
  { value: "spouse", labelKey: "relationships.spouse" },
  { value: "partner", labelKey: "relationships.partner" },
  { value: "child", labelKey: "relationships.child" },
  { value: "parent", labelKey: "relationships.parent" },
  { value: "sibling", labelKey: "relationships.sibling" },
  { value: "other-family", labelKey: "relationships.otherFamily" },
  { value: "friend", labelKey: "relationships.friend" },
  { value: "charity", labelKey: "relationships.charity" },
  { value: "other", labelKey: "relationships.other" },
];

export function BeneficiariesStep({ data, onUpdate, onNext }: BeneficiariesStepProps) {
  const t = useTranslations("insurance.beneficiaries");
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

  const totalPercentage = React.useMemo(() => {
    return beneficiaries.reduce((sum, b) => {
      const percent = parseFloat(b.percentage) || 0;
      return sum + percent;
    }, 0);
  }, [beneficiaries]);

  const isFormValid = React.useMemo(() => {
    if (beneficiaries.length === 0) return false;
    const allFieldsFilled = beneficiaries.every(
      (b) => b.type && b.title && b.firstName && b.lastName && b.dateOfBirth && b.relationship && b.percentage
    );
    const percentageValid = Math.abs(totalPercentage - 100) < 0.01;
    return allFieldsFilled && percentageValid;
  }, [beneficiaries, totalPercentage]);

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
        <h2 className="mb-2 text-2xl font-bold text-brand-dark">{t("title")}</h2>
        <p className="text-brand-grayMed">{t("subtitle")}</p>
      </div>

      {beneficiaries.length === 0 ? (
        <div className="rounded-lg border-2 border-dashed border-brand-grayLight p-12 text-center">
          <p className="mb-4 text-brand-grayMed">{t("noBeneficiaries")}</p>
          <Button type="button" onClick={addBeneficiary} className="bg-brand-gold text-white hover:bg-brand-goldDark">
            <Plus className="mr-2 h-4 w-4" />
            {t("addFirst")}
          </Button>
        </div>
      ) : (
        <div className="space-y-6">
          {beneficiaries.map((beneficiary, index) => (
            <div key={beneficiary.id} className="rounded-lg border border-brand-grayLight bg-white p-6 shadow-sm">
              <div className="mb-4 flex items-center justify-between">
                <h3 className="text-lg font-semibold text-brand-dark">
                  {t("beneficiaryNumber", { number: index + 1 })}
                </h3>
                <button type="button" onClick={() => removeBeneficiary(beneficiary.id)} className="text-red-600 hover:text-red-700" title={t("removeBeneficiary")}>
                  <Trash2 className="h-5 w-5" />
                </button>
              </div>

              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor={`type-${beneficiary.id}`}>{t("beneficiaryType")}</Label>
                  <Select value={beneficiary.type} onValueChange={(value) => updateBeneficiary(beneficiary.id, "type", value)}>
                    <SelectTrigger id={`type-${beneficiary.id}`}>
                      <SelectValue placeholder={t("selectType")} />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="primary">{t("primaryBeneficiary")}</SelectItem>
                      <SelectItem value="contingent">{t("contingentBeneficiary")}</SelectItem>
                    </SelectContent>
                  </Select>
                  <p className="text-xs text-brand-grayMed">{t("beneficiaryTypeDesc")}</p>
                </div>

                <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
                  <div className="space-y-2">
                    <Label htmlFor={`title-${beneficiary.id}`}>{t("titleLabel")}</Label>
                    <Select value={beneficiary.title} onValueChange={(value) => updateBeneficiary(beneficiary.id, "title", value)}>
                      <SelectTrigger id={`title-${beneficiary.id}`}>
                        <SelectValue placeholder={t("select")} />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Mr">{t("titles.mr")}</SelectItem>
                        <SelectItem value="Mrs">{t("titles.mrs")}</SelectItem>
                        <SelectItem value="Ms">{t("titles.ms")}</SelectItem>
                        <SelectItem value="Dr">{t("titles.dr")}</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2 md:col-span-3">
                    <Label htmlFor={`firstName-${beneficiary.id}`}>{t("firstName")}</Label>
                    <Input id={`firstName-${beneficiary.id}`} type="text" value={beneficiary.firstName} onChange={(e) => updateBeneficiary(beneficiary.id, "firstName", e.target.value)} placeholder={t("firstNamePlaceholder")} required />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor={`lastName-${beneficiary.id}`}>{t("lastName")}</Label>
                  <Input id={`lastName-${beneficiary.id}`} type="text" value={beneficiary.lastName} onChange={(e) => updateBeneficiary(beneficiary.id, "lastName", e.target.value)} placeholder={t("lastNamePlaceholder")} required />
                </div>

                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor={`dateOfBirth-${beneficiary.id}`}>{t("dateOfBirth")}</Label>
                    <Input id={`dateOfBirth-${beneficiary.id}`} type="date" value={beneficiary.dateOfBirth} onChange={(e) => updateBeneficiary(beneficiary.id, "dateOfBirth", e.target.value)} max={new Date().toISOString().split("T")[0]} required />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor={`relationship-${beneficiary.id}`}>{t("relationship")}</Label>
                    <Select value={beneficiary.relationship} onValueChange={(value) => updateBeneficiary(beneficiary.id, "relationship", value)}>
                      <SelectTrigger id={`relationship-${beneficiary.id}`}>
                        <SelectValue placeholder={t("selectRelationship")} />
                      </SelectTrigger>
                      <SelectContent>
                        {RELATIONSHIP_KEYS.map((rel) => (
                          <SelectItem key={rel.value} value={rel.value}>{t(rel.labelKey)}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor={`percentage-${beneficiary.id}`}>{t("percentage")}</Label>
                  <div className="relative">
                    <Input id={`percentage-${beneficiary.id}`} type="number" min="0" max="100" step="0.01" value={beneficiary.percentage} onChange={(e) => updateBeneficiary(beneficiary.id, "percentage", e.target.value)} placeholder="0.00" required />
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-brand-grayMed">%</span>
                  </div>
                </div>
              </div>
            </div>
          ))}

          {/* Total Percentage Display */}
          <div className={`rounded-lg border-2 p-4 ${Math.abs(totalPercentage - 100) < 0.01 ? "border-green-500 bg-green-50" : "border-amber-500 bg-amber-50"}`}>
            <div className="flex items-center justify-between">
              <span className="font-semibold text-brand-dark">{t("totalPercentage")}:</span>
              <span className={`text-lg font-bold ${Math.abs(totalPercentage - 100) < 0.01 ? "text-green-600" : "text-amber-600"}`}>
                {totalPercentage.toFixed(2)}%
              </span>
            </div>
            {Math.abs(totalPercentage - 100) >= 0.01 && (
              <p className="mt-2 text-sm text-amber-800">
                {t("percentageMustEqual100", { difference: Math.abs(100 - totalPercentage).toFixed(2), direction: totalPercentage < 100 ? t("missing") : t("overBy") })}
              </p>
            )}
          </div>

          <Button type="button" onClick={addBeneficiary} variant="outline" className="w-full">
            <Plus className="mr-2 h-4 w-4" />
            {t("addAnother")}
          </Button>
        </div>
      )}

      <div className="space-y-4">
        <div className="rounded-lg border border-blue-200 bg-blue-50 p-4">
          <div className="flex items-start gap-2">
            <Info className="mt-0.5 h-5 w-5 text-blue-600" />
            <div className="space-y-1 text-sm text-blue-800">
              <p className="font-semibold">{t("designationTitle")}</p>
              <ul className="ml-4 mt-2 list-disc space-y-1">
                <li><strong>{t("primaryLabel")}:</strong> {t("primaryDesc")}</li>
                <li><strong>{t("contingentLabel")}:</strong> {t("contingentDesc")}</li>
                <li>{t("percentageRule")}</li>
                <li>{t("updateAnytime")}</li>
              </ul>
            </div>
          </div>
        </div>

        <div className="rounded-lg border border-amber-200 bg-amber-50 p-4">
          <div className="flex items-start gap-2">
            <Info className="mt-0.5 h-5 w-5 text-amber-600" />
            <div className="space-y-1 text-sm text-amber-800">
              <p className="font-semibold">{t("importantNote")}</p>
              <p>{t("importantNoteText")}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
