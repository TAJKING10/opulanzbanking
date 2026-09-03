"use client";
import * as React from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { Plus, Minus } from "lucide-react";
import { useTranslations } from "next-intl";
import type { IATFormData, Titulaire, MaritalStatus } from "./iat-types";

interface Props {
  formData: IATFormData;
  onChange: (data: Partial<IATFormData>) => void;
  onNext: () => void;
  error: string;
  setError: (e: string) => void;
}

function RadioGroup({
  name,
  options,
  value,
  onChange,
}: {
  name: string;
  options: [string, string][];
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <div className="flex flex-wrap gap-4 mt-2">
      {options.map(([val, lbl]) => (
        <label key={val} className="flex items-center gap-2 cursor-pointer text-sm">
          <input
            type="radio"
            name={name}
            checked={value === val}
            onChange={() => onChange(val)}
            className="accent-brand-gold"
          />
          {lbl}
        </label>
      ))}
    </div>
  );
}

function TitulaireForm({
  id,
  label,
  data,
  onChange,
  t,
}: {
  id: string;
  label: string;
  data: Titulaire;
  onChange: (d: Partial<Titulaire>) => void;
  t: ReturnType<typeof useTranslations>;
}) {
  const up = (field: keyof Titulaire, val: unknown) =>
    onChange({ [field]: val } as Partial<Titulaire>);

  return (
    <div className="space-y-4">
      <h3 className="font-semibold text-brand-dark text-sm border-b border-brand-grayLight pb-2">
        {label}
      </h3>

      <div className="grid grid-cols-3 gap-3">
        <div>
          <Label>{t("ppStep1.civility")}</Label>
          <select
            value={data.civility}
            onChange={(e) => up("civility", e.target.value)}
            className="mt-1 w-full rounded-xl border border-brand-grayLight px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-gold bg-white"
          >
            <option value="">—</option>
            <option value="M">M.</option>
            <option value="Mme">Mme</option>
          </select>
        </div>
        <div>
          <Label>{t("ppStep1.lastName")} <span className="text-red-500">*</span></Label>
          <Input
            value={data.lastName}
            onChange={(e) => up("lastName", e.target.value)}
            className="mt-1"
            placeholder="NOM"
          />
        </div>
        <div>
          <Label>{t("ppStep1.firstName")} <span className="text-red-500">*</span></Label>
          <Input
            value={data.firstName}
            onChange={(e) => up("firstName", e.target.value)}
            className="mt-1"
            placeholder={t("ppStep1.firstName")}
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <Label>{t("ppStep1.maidenName")}</Label>
          <Input
            value={data.maidenName}
            onChange={(e) => up("maidenName", e.target.value)}
            className="mt-1"
          />
        </div>
        <div>
          <Label>{t("ppStep1.nationality")} <span className="text-red-500">*</span></Label>
          <Input
            value={data.nationality}
            onChange={(e) => up("nationality", e.target.value)}
            className="mt-1"
            placeholder={t("ppStep1.nationalityPlaceholder")}
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <Label>{t("ppStep1.birthDate")} <span className="text-red-500">*</span></Label>
          <Input
            type="date"
            value={data.birthDate}
            onChange={(e) => up("birthDate", e.target.value)}
            className="mt-1"
          />
        </div>
        <div>
          <Label>{t("ppStep1.birthPlace")}</Label>
          <Input
            value={data.birthPlace}
            onChange={(e) => up("birthPlace", e.target.value)}
            className="mt-1"
          />
        </div>
      </div>

      <div>
        <Label>{t("ppStep1.address")} <span className="text-red-500">*</span></Label>
        <Input
          value={data.address}
          onChange={(e) => up("address", e.target.value)}
          className="mt-1"
          placeholder={t("ppStep1.addressPlaceholder")}
        />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <Label>{t("ppStep1.email")} <span className="text-red-500">*</span></Label>
          <Input
            type="email"
            value={data.email}
            onChange={(e) => up("email", e.target.value)}
            className="mt-1"
          />
        </div>
        <div>
          <Label>{t("ppStep1.phone")} <span className="text-red-500">*</span></Label>
          <Input
            type="tel"
            value={data.phone}
            onChange={(e) => up("phone", e.target.value)}
            className="mt-1"
          />
        </div>
      </div>

      <div>
        <Label>{t("ppStep1.fiscalResidence")} <span className="text-red-500">*</span></Label>
        <RadioGroup
          name={`fiscal-${id}`}
          options={[["France", t("ppStep1.fiscalFrance")], ["Other", t("ppStep1.fiscalOther")]]}
          value={data.fiscalResidence}
          onChange={(v) => up("fiscalResidence", v)}
        />
        {data.fiscalResidence === "Other" && (
          <Input
            value={data.fiscalResidenceOther}
            onChange={(e) => up("fiscalResidenceOther", e.target.value)}
            className="mt-2"
            placeholder={t("ppStep1.fiscalOtherPlaceholder")}
          />
        )}
      </div>

      <div>
        <Label>{t("ppStep1.usPerson")} <span className="text-red-500">*</span></Label>
        <RadioGroup
          name={`fatca-${id}`}
          options={[["true", t("ppStep1.usYes")], ["false", t("ppStep1.usNo")]]}
          value={data.isUSPerson === null ? "" : String(data.isUSPerson)}
          onChange={(v) => up("isUSPerson", v === "true")}
        />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <Label>{t("ppStep1.profession")} <span className="text-red-500">*</span></Label>
          <Input
            value={data.profession}
            onChange={(e) => up("profession", e.target.value)}
            className="mt-1"
          />
        </div>
        <div className="flex items-end pb-1">
          <label className="flex items-center gap-2 cursor-pointer text-sm">
            <Checkbox
              checked={data.isRetired}
              onCheckedChange={(v) => up("isRetired", !!v)}
            />
            {t("ppStep1.retired")}
          </label>
        </div>
      </div>
      {data.isRetired && (
        <div className="grid grid-cols-2 gap-3">
          <div>
            <Label>{t("ppStep1.retiredSince")}</Label>
            <Input
              type="date"
              value={data.retiredSince}
              onChange={(e) => up("retiredSince", e.target.value)}
              className="mt-1"
            />
          </div>
          <div>
            <Label>{t("ppStep1.formerProfession")}</Label>
            <Input
              value={data.formerProfession}
              onChange={(e) => up("formerProfession", e.target.value)}
              className="mt-1"
            />
          </div>
        </div>
      )}

      <div>
        <label className="flex items-center gap-2 cursor-pointer text-sm font-medium">
          <Checkbox
            checked={data.isBusinessOwner}
            onCheckedChange={(v) => up("isBusinessOwner", !!v)}
          />
          {t("ppStep1.businessOwner")}
        </label>
        {data.isBusinessOwner && (
          <div className="mt-3 grid grid-cols-2 gap-3">
            <div>
              <Label>{t("ppStep1.companyName")}</Label>
              <Input
                value={data.companyName}
                onChange={(e) => up("companyName", e.target.value)}
                className="mt-1"
              />
            </div>
            <div>
              <Label>{t("ppStep1.legalForm")}</Label>
              <Input
                value={data.companyLegalForm}
                onChange={(e) => up("companyLegalForm", e.target.value)}
                className="mt-1"
              />
            </div>
            <div className="col-span-2">
              <Label>{t("ppStep1.companySiege")}</Label>
              <Input
                value={data.companySiege}
                onChange={(e) => up("companySiege", e.target.value)}
                className="mt-1"
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function MaritalForm({
  data,
  onChange,
  t,
}: {
  data: MaritalStatus;
  onChange: (d: Partial<MaritalStatus>) => void;
  t: ReturnType<typeof useTranslations>;
}) {
  const up = (field: keyof MaritalStatus, val: unknown) =>
    onChange({ [field]: val } as Partial<MaritalStatus>);

  return (
    <div className="space-y-4">
      <h3 className="font-semibold text-brand-dark text-sm border-b border-brand-grayLight pb-2">
        {t("ppStep1.maritalTitle")}
      </h3>

      <RadioGroup
        name="marital-status"
        options={[
          ["married", t("ppStep1.married")],
          ["pacs", t("ppStep1.pacs")],
          ["divorced", t("ppStep1.divorced")],
          ["widowed", t("ppStep1.widowed")],
          ["single", t("ppStep1.single")],
          ["freeUnion", t("ppStep1.freeUnion")],
        ]}
        value={data.status}
        onChange={(v) => up("status", v)}
      />

      {data.status === "married" && (
        <div className="grid grid-cols-2 gap-3">
          <div>
            <Label>{t("ppStep1.marriageDate")}</Label>
            <Input
              type="date"
              value={data.marriageDate}
              onChange={(e) => up("marriageDate", e.target.value)}
              className="mt-1"
            />
          </div>
          <div>
            <Label>{t("ppStep1.marriageContractLabel")}</Label>
            <RadioGroup
              name="marriage-contract"
              options={[["true", t("review.yes")], ["false", t("review.no")]]}
              value={data.marriageContract === null ? "" : String(data.marriageContract)}
              onChange={(v) => up("marriageContract", v === "true")}
            />
          </div>
          {data.marriageContract && (
            <div className="col-span-2">
              <Label>{t("ppStep1.marriageRegimeLabel")}</Label>
              <Input
                value={data.marriageRegime}
                onChange={(e) => up("marriageRegime", e.target.value)}
                className="mt-1"
                placeholder={t("ppStep1.marriageRegimePlaceholder")}
              />
            </div>
          )}
        </div>
      )}

      {data.status === "pacs" && (
        <div className="grid grid-cols-2 gap-3">
          <div>
            <Label>{t("ppStep1.pacsDate")}</Label>
            <Input
              type="date"
              value={data.pacsDate}
              onChange={(e) => up("pacsDate", e.target.value)}
              className="mt-1"
            />
          </div>
          <div>
            <Label>{t("ppStep1.pacsConventionLabel")}</Label>
            <RadioGroup
              name="pacs-convention"
              options={[["true", t("review.yes")], ["false", t("review.no")]]}
              value={data.pacsConvention === null ? "" : String(data.pacsConvention)}
              onChange={(v) => up("pacsConvention", v === "true")}
            />
          </div>
        </div>
      )}

      {data.status === "divorced" && (
        <div>
          <Label>{t("ppStep1.divorceDate")}</Label>
          <Input
            type="date"
            value={data.divorceDate}
            onChange={(e) => up("divorceDate", e.target.value)}
            className="mt-1"
          />
        </div>
      )}

      <div className="grid grid-cols-2 gap-3">
        <div>
          <Label>{t("ppStep1.numberOfChildren")}</Label>
          <Input
            type="number"
            min={0}
            value={data.numberOfChildren}
            onChange={(e) => up("numberOfChildren", e.target.value)}
            className="mt-1"
          />
        </div>
        <div>
          <Label>{t("ppStep1.childrenAtCharge")}</Label>
          <Input
            type="number"
            min={0}
            value={data.childrenAtCharge}
            onChange={(e) => up("childrenAtCharge", e.target.value)}
            className="mt-1"
          />
        </div>
      </div>
    </div>
  );
}

export function IATppStep1({ formData, onChange, onNext, error, setError }: Props) {
  const t = useTranslations("iat");

  const handleNext = () => {
    const t1 = formData.titulaire1;
    if (!t1.lastName.trim()) { setError(t("ppStep1.errLastName")); return; }
    if (!t1.firstName.trim()) { setError(t("ppStep1.errFirstName")); return; }
    if (!t1.email.trim()) { setError(t("ppStep1.errEmail")); return; }
    if (!t1.nationality.trim()) { setError(t("ppStep1.errNationality")); return; }
    if (!t1.profession.trim() && !t1.isRetired) { setError(t("ppStep1.errProfession")); return; }
    setError("");
    onNext();
  };

  return (
    <div className="space-y-8">
      <div className="rounded-xl bg-amber-50 border border-amber-200 px-4 py-3 text-xs text-amber-800">
        <strong>{t("ppStep1.warningStrong")}</strong> {t("ppStep1.warning")}
      </div>

      <TitulaireForm
        id="t1"
        label={t("ppStep1.titulaire1Label")}
        data={formData.titulaire1}
        onChange={(d) => onChange({ titulaire1: { ...formData.titulaire1, ...d } })}
        t={t}
      />

      <div>
        <button
          type="button"
          onClick={() => onChange({ hasTitulaire2: !formData.hasTitulaire2 })}
          className="flex items-center gap-2 text-sm text-brand-gold font-semibold hover:underline focus:outline-none"
        >
          {formData.hasTitulaire2 ? (
            <Minus className="h-4 w-4" />
          ) : (
            <Plus className="h-4 w-4" />
          )}
          {formData.hasTitulaire2
            ? t("ppStep1.removeTitulaire2")
            : t("ppStep1.addTitulaire2")}
        </button>
        {formData.hasTitulaire2 && (
          <div className="mt-6">
            <TitulaireForm
              id="t2"
              label={t("ppStep1.titulaire2Label")}
              data={formData.titulaire2}
              onChange={(d) =>
                onChange({ titulaire2: { ...formData.titulaire2, ...d } })
              }
              t={t}
            />
          </div>
        )}
      </div>

      <MaritalForm
        data={formData.maritalStatus}
        onChange={(d) =>
          onChange({ maritalStatus: { ...formData.maritalStatus, ...d } })
        }
        t={t}
      />

      {error && <p className="text-sm text-red-600 font-medium">{error}</p>}

      <Button variant="primary" size="lg" className="w-full" onClick={handleNext}>
        {t("ppStep1.nextBtn")}
      </Button>
    </div>
  );
}
