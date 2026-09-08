"use client";
import * as React from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { useTranslations } from "next-intl";
import type {
  IATFormData,
  CompanyIdentity,
  LegalRepresentative,
  CompanySector,
} from "./iat-types";
import { SECTOR_LABELS as SECTORS } from "./iat-types";

interface Props {
  formData: IATFormData;
  onChange: (data: Partial<IATFormData>) => void;
  onNext: () => void;
  error: string;
  setError: (e: string) => void;
}

function RepForm({
  label,
  data,
  onChange,
  required,
  t,
}: {
  label: string;
  data: LegalRepresentative;
  onChange: (d: Partial<LegalRepresentative>) => void;
  required?: boolean;
  t: ReturnType<typeof useTranslations>;
}) {
  const up = (field: keyof LegalRepresentative, val: unknown) =>
    onChange({ [field]: val } as Partial<LegalRepresentative>);

  const R = ({ children }: { children: React.ReactNode }) => (
    <>
      {children}
      {required && <span className="text-red-500"> *</span>}
    </>
  );

  return (
    <div className="space-y-3">
      <h4 className="text-xs font-bold text-brand-grayMed uppercase tracking-wide">{label}</h4>
      <div className="grid grid-cols-3 gap-3">
        <div>
          <Label><R>{t("pmStep1.repLastName")}</R></Label>
          <Input value={data.lastName} onChange={(e) => up("lastName", e.target.value)} className="mt-1" />
        </div>
        <div>
          <Label><R>{t("pmStep1.repFirstName")}</R></Label>
          <Input value={data.firstName} onChange={(e) => up("firstName", e.target.value)} className="mt-1" />
        </div>
        <div>
          <Label>{t("pmStep1.repFunction")}</Label>
          <Input value={data.function} onChange={(e) => up("function", e.target.value)} className="mt-1" />
        </div>
        <div>
          <Label><R>{t("pmStep1.repPhone")}</R></Label>
          <Input type="tel" value={data.phone} onChange={(e) => up("phone", e.target.value)} className="mt-1" />
        </div>
        <div>
          <Label><R>{t("pmStep1.repEmail")}</R></Label>
          <Input type="email" value={data.email} onChange={(e) => up("email", e.target.value)} className="mt-1" />
        </div>
        <div>
          <Label>{t("pmStep1.pep")}</Label>
          <div className="flex gap-3 mt-2">
            {([true, false] as const).map((v) => (
              <label key={String(v)} className="flex items-center gap-1.5 cursor-pointer text-sm">
                <input
                  type="radio"
                  name={`pep-${label}`}
                  checked={data.isPEP === v}
                  onChange={() => up("isPEP", v)}
                  className="accent-brand-gold"
                />
                {v ? t("pmStep1.yesUC") : t("pmStep1.noUC")}
              </label>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export function IATpmStep1({ formData, onChange, onNext, error, setError }: Props) {
  const t = useTranslations("iat");
  const ci = formData.companyIdentity;
  const up = (field: keyof CompanyIdentity, val: unknown) =>
    onChange({ companyIdentity: { ...ci, [field]: val } });

  const toggleSector = (s: CompanySector) => {
    const prev = ci.sectors;
    const next = prev.includes(s) ? prev.filter((x) => x !== s) : [...prev, s];
    up("sectors", next);
  };

  const handleNext = () => {
    if (!ci.companyName.trim()) { setError(t("pmStep1.errCompanyName")); return; }
    if (!ci.legalForm.trim()) { setError(t("pmStep1.errLegalForm")); return; }
    if (!ci.address.trim()) { setError(t("pmStep1.errAddress")); return; }
    if (!ci.country.trim()) { setError(t("pmStep1.errCountry")); return; }
    if (!ci.rcs.trim()) { setError(t("pmStep1.errRcs")); return; }
    if (!ci.representative.firstName.trim()) { setError(t("pmStep1.errRepFirstName")); return; }
    if (!ci.representative.lastName.trim()) { setError(t("pmStep1.errRepLastName")); return; }
    if (!ci.representative.phone.trim()) { setError(t("pmStep1.errRepPhone")); return; }
    if (!ci.representative.email.trim()) { setError(t("pmStep1.errRepEmail")); return; }
    setError("");
    onNext();
  };

  return (
    <div className="space-y-8">
      <div className="rounded-xl bg-amber-50 border border-amber-200 px-4 py-3 text-xs text-amber-800">
        <strong>{t("pmStep1.warningStrong")}</strong> {t("pmStep1.warning")}
      </div>

      {/* Company info */}
      <div className="space-y-4">
        <h3 className="font-semibold text-brand-dark text-sm border-b border-brand-grayLight pb-2">
          {t("pmStep1.companyTitle")}
        </h3>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <Label>{t("pmStep1.companyName")} <span className="text-red-500">*</span></Label>
            <Input value={ci.companyName} onChange={(e) => up("companyName", e.target.value)} className="mt-1" />
          </div>
          <div>
            <Label>{t("pmStep1.legalForm")} <span className="text-red-500">*</span></Label>
            <Input value={ci.legalForm} onChange={(e) => up("legalForm", e.target.value)} className="mt-1" placeholder={t("pmStep1.legalFormPlaceholder")} />
          </div>
        </div>
        <div>
          <Label>{t("pmStep1.address")} <span className="text-red-500">*</span></Label>
          <Input value={ci.address} onChange={(e) => up("address", e.target.value)} className="mt-1" />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <Label>{t("pmStep1.country")} <span className="text-red-500">*</span></Label>
            <Input value={ci.country} onChange={(e) => up("country", e.target.value)} className="mt-1" placeholder={t("pmStep1.countryPlaceholder")} />
          </div>
          <div>
            <Label>{t("pmStep1.rcs")} <span className="text-red-500">*</span></Label>
            <Input value={ci.rcs} onChange={(e) => up("rcs", e.target.value)} className="mt-1" placeholder={t("pmStep1.rcsPlaceholder")} />
          </div>
        </div>

        {/* Sectors */}
        <div>
          <Label>{t("pmStep1.sectors")}</Label>
          <div className="mt-2 grid grid-cols-2 gap-2">
            {(Object.keys(SECTORS) as CompanySector[]).map((key) => (
              <label key={key} className="flex items-center gap-2 cursor-pointer text-sm">
                <Checkbox
                  checked={ci.sectors.includes(key)}
                  onCheckedChange={() => toggleSector(key)}
                />
                {t(`sectors.${key}` as any)}
              </label>
            ))}
          </div>
          {ci.sectors.includes("autre") && (
            <Input
              value={ci.sectorOther}
              onChange={(e) => up("sectorOther", e.target.value)}
              className="mt-2"
              placeholder={t("pmStep1.sectorOtherPlaceholder")}
            />
          )}
        </div>

        {/* Geo zone */}
        <div>
          <Label>{t("pmStep1.geoZone")}</Label>
          <div className="flex gap-4 mt-2">
            {[["EU", t("pmStep1.geoZoneEU")], ["Non-EU", t("pmStep1.geoZoneNonEU")], ["Both", t("pmStep1.geoZoneBoth")]].map(([val, lbl]) => (
              <label key={val} className="flex items-center gap-2 cursor-pointer text-sm">
                <input
                  type="radio"
                  name="geo-zone"
                  checked={ci.geoZone === val}
                  onChange={() => up("geoZone", val)}
                  className="accent-brand-gold"
                />
                {lbl}
              </label>
            ))}
          </div>
          {(ci.geoZone === "Non-EU" || ci.geoZone === "Both") && (
            <Input
              value={ci.geoZoneOther}
              onChange={(e) => up("geoZoneOther", e.target.value)}
              className="mt-2"
              placeholder={t("pmStep1.geoZoneOtherPlaceholder")}
            />
          )}
        </div>

        {/* Regulated */}
        <div>
          <Label>{t("pmStep1.regulated")}</Label>
          <div className="flex gap-4 mt-2">
            {([true, false] as const).map((v) => (
              <label key={String(v)} className="flex items-center gap-2 cursor-pointer text-sm">
                <input
                  type="radio"
                  name="regulated"
                  checked={ci.isRegulated === v}
                  onChange={() => up("isRegulated", v)}
                  className="accent-brand-gold"
                />
                {v ? t("pmStep1.yesUC") : t("pmStep1.noUC")}
              </label>
            ))}
          </div>
          {ci.isRegulated && (
            <Input
              value={ci.regulator}
              onChange={(e) => up("regulator", e.target.value)}
              className="mt-2"
              placeholder={t("pmStep1.regulatorPlaceholder")}
            />
          )}
        </div>

        {/* Listed */}
        <div>
          <Label>{t("pmStep1.listed")}</Label>
          <div className="flex gap-4 mt-2">
            {([true, false] as const).map((v) => (
              <label key={String(v)} className="flex items-center gap-2 cursor-pointer text-sm">
                <input
                  type="radio"
                  name="listed"
                  checked={ci.isListed === v}
                  onChange={() => up("isListed", v)}
                  className="accent-brand-gold"
                />
                {v ? t("pmStep1.yesUC") : t("pmStep1.noUC")}
              </label>
            ))}
          </div>
          {ci.isListed && (
            <Input
              value={ci.markets}
              onChange={(e) => up("markets", e.target.value)}
              className="mt-2"
              placeholder={t("pmStep1.marketsPlaceholder")}
            />
          )}
        </div>
      </div>

      {/* Representatives */}
      <div className="space-y-6">
        <h3 className="font-semibold text-brand-dark text-sm border-b border-brand-grayLight pb-2">
          {t("pmStep1.representativesTitle")}
        </h3>
        <RepForm
          label={t("pmStep1.rep1Label")}
          data={ci.representative}
          onChange={(d) => up("representative", { ...ci.representative, ...d })}
          required
          t={t}
        />
        <RepForm
          label={t("pmStep1.rep2Label")}
          data={ci.associate2}
          onChange={(d) => up("associate2", { ...ci.associate2, ...d })}
          t={t}
        />
      </div>

      {/* FATCA */}
      <div>
        <Label>{t("pmStep1.fatca")}</Label>
        <div className="flex gap-4 mt-2">
          {([true, false] as const).map((v) => (
            <label key={String(v)} className="flex items-center gap-2 cursor-pointer text-sm">
              <input
                type="radio"
                name="fatca-pm"
                checked={ci.hasUSPerson === v}
                onChange={() => up("hasUSPerson", v)}
                className="accent-brand-gold"
              />
              {v ? t("pmStep1.yesUC") : t("pmStep1.noUC")}
            </label>
          ))}
        </div>
      </div>

      {error && <p className="text-sm text-red-600 font-medium">{error}</p>}
      <Button variant="primary" size="lg" className="w-full" onClick={handleNext}>
        {t("pmStep1.nextBtn")}
      </Button>
    </div>
  );
}
