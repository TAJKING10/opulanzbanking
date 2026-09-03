"use client";
import * as React from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { useTranslations } from "next-intl";
import type { IATFormData, PersonalFinancial, IncomeRange, PatrimonyRange } from "./iat-types";

interface Props {
  formData: IATFormData;
  onChange: (data: Partial<IATFormData>) => void;
  onNext: () => void;
  error: string;
  setError: (e: string) => void;
}

function SelectRow({
  label,
  options,
  value,
  onChange,
  required,
}: {
  label: string;
  options: [string, string][];
  value: string;
  onChange: (v: string) => void;
  required?: boolean;
}) {
  return (
    <div>
      <Label>
        {label}{required && <span className="text-red-500"> *</span>}
      </Label>
      <div className="flex flex-wrap gap-2 mt-2">
        {options.map(([val, lbl]) => (
          <button
            key={val}
            type="button"
            onClick={() => onChange(val)}
            className={`rounded-lg border px-3 py-1.5 text-xs font-medium transition-colors ${
              value === val
                ? "border-brand-gold bg-brand-gold text-white"
                : "border-brand-grayLight bg-white text-brand-dark hover:border-brand-gold"
            }`}
          >
            {lbl}
          </button>
        ))}
      </div>
    </div>
  );
}

function YesNoRow({
  label,
  name,
  value,
  onChange,
}: {
  label: string;
  name: string;
  value: boolean | null;
  onChange: (v: boolean) => void;
}) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-sm">{label}</span>
      <div className="flex gap-3">
        {([true, false] as const).map((v) => (
          <label key={String(v)} className="flex items-center gap-1.5 cursor-pointer text-sm">
            <input
              type="radio"
              name={name}
              checked={value === v}
              onChange={() => onChange(v)}
              className="accent-brand-gold"
            />
            {v ? "Oui" : "Non"}
          </label>
        ))}
      </div>
    </div>
  );
}

export function IATppStep2({ formData, onChange, onNext, error, setError }: Props) {
  const t = useTranslations("iat");
  const fin = formData.personalFinancial;
  const up = (field: keyof PersonalFinancial, val: unknown) =>
    onChange({ personalFinancial: { ...fin, [field]: val } });

  const INCOME_OPTIONS: [IncomeRange, string][] = [
    ["<50k", t("ppStep2.incomeBelow50k")],
    ["50-100k", t("ppStep2.income50to100k")],
    ["100-150k", t("ppStep2.income100to150k")],
    ["150-500k", t("ppStep2.income150to500k")],
    [">500k", t("ppStep2.incomeAbove500k")],
  ];

  const PATRIMONY_OPTIONS: [PatrimonyRange, string][] = [
    ["<100k", t("ppStep2.patrimonyBelow100k")],
    ["100-300k", t("ppStep2.patrimony100to300k")],
    ["300-500k", t("ppStep2.patrimony300to500k")],
    ["500k-1m", t("ppStep2.patrimony500kto1m")],
    ["1-5m", t("ppStep2.patrimony1to5m")],
    [">5m", t("ppStep2.patrimonyAbove5m")],
  ];

  const FUND_ORIGINS: [string, string][] = [
    ["revenus_pro", t("ppStep2.fundOriginRevenusPro")],
    ["cession_actifs_pro", t("ppStep2.fundOriginCessionActifsPro")],
    ["cession_immo", t("ppStep2.fundOriginCessionImmo")],
    ["epargne", t("ppStep2.fundOriginEpargne")],
    ["cession_mob", t("ppStep2.fundOriginCessionMob")],
    ["assurance_vie", t("ppStep2.fundOriginAssuranceVie")],
    ["heritage", t("ppStep2.fundOriginHeritage")],
    ["jeux", t("ppStep2.fundOriginJeux")],
    ["autre", t("ppStep2.fundOriginAutre")],
  ];

  const toggleOrigin = (key: string) => {
    const prev = fin.fundOrigins;
    const next = prev.includes(key) ? prev.filter((x) => x !== key) : [...prev, key];
    up("fundOrigins", next);
  };

  const handleNext = () => {
    if (!fin.t1Income) { setError(t("ppStep2.errIncome")); return; }
    if (!fin.t1SavingsCapacity.trim()) { setError(t("ppStep2.errSavings")); return; }
    if (!fin.amountToInvest.trim()) { setError(t("ppStep2.errAmount")); return; }
    if (!fin.fundNature) { setError(t("ppStep2.errFundNature")); return; }
    if (fin.fundOrigins.length === 0) { setError(t("ppStep2.errFundOrigins")); return; }
    setError("");
    onNext();
  };

  return (
    <div className="space-y-8">
      {/* Flux financiers T1 */}
      <div className="space-y-4">
        <h3 className="font-semibold text-brand-dark text-sm border-b border-brand-grayLight pb-2">
          {t("ppStep2.t1Title")}
        </h3>
        <SelectRow
          label={t("ppStep2.t1Income")}
          options={INCOME_OPTIONS}
          value={fin.t1Income}
          onChange={(v) => up("t1Income", v)}
          required
        />
        <SelectRow
          label={t("ppStep2.t1Patrimony")}
          options={PATRIMONY_OPTIONS}
          value={fin.t1Patrimony}
          onChange={(v) => up("t1Patrimony", v)}
        />
        <div className="grid grid-cols-2 gap-3">
          <div>
            <Label>{t("ppStep2.t1Commitments")}</Label>
            <Input
              value={fin.t1Commitments}
              onChange={(e) => up("t1Commitments", e.target.value)}
              className="mt-1"
              placeholder={t("ppStep2.t1CommitmentsPlaceholder")}
            />
          </div>
          <div>
            <Label>{t("ppStep2.t1SavingsCapacity")} <span className="text-red-500">*</span></Label>
            <Input
              value={fin.t1SavingsCapacity}
              onChange={(e) => up("t1SavingsCapacity", e.target.value)}
              className="mt-1"
              placeholder={t("ppStep2.t1SavingsCapacityPlaceholder")}
            />
          </div>
        </div>
        <div className="grid grid-cols-4 gap-2">
          {[
            ["t1FinancialPct", t("ppStep2.t1FinancialPct")],
            ["t1RealEstatePct", t("ppStep2.t1RealEstatePct")],
            ["t1ProfessionalPct", t("ppStep2.t1ProfessionalPct")],
            ["t1OtherPct", t("ppStep2.t1OtherPct")],
          ].map(([field, lbl]) => (
            <div key={field}>
              <Label>{lbl}</Label>
              <Input
                value={fin[field as keyof PersonalFinancial] as string}
                onChange={(e) => up(field as keyof PersonalFinancial, e.target.value)}
                className="mt-1"
                placeholder="0"
              />
            </div>
          ))}
        </div>
        <div className="space-y-2">
          <YesNoRow label={t("ppStep2.t1IR")} name="t1-ir" value={fin.t1IR} onChange={(v) => up("t1IR", v)} />
          <YesNoRow label={t("ppStep2.t1IFI")} name="t1-ifi" value={fin.t1IFI} onChange={(v) => up("t1IFI", v)} />
        </div>
      </div>

      {/* Flux financiers T2 (optional) */}
      {formData.hasTitulaire2 && (
        <div className="space-y-4">
          <h3 className="font-semibold text-brand-dark text-sm border-b border-brand-grayLight pb-2">
            {t("ppStep2.t2Title")}
          </h3>
          <SelectRow
            label={t("ppStep2.t2Income")}
            options={INCOME_OPTIONS}
            value={fin.t2Income}
            onChange={(v) => up("t2Income", v)}
          />
          <SelectRow
            label={t("ppStep2.t2Patrimony")}
            options={PATRIMONY_OPTIONS}
            value={fin.t2Patrimony}
            onChange={(v) => up("t2Patrimony", v)}
          />
          <div className="space-y-2">
            <YesNoRow label={t("ppStep2.t2IR")} name="t2-ir" value={fin.t2IR} onChange={(v) => up("t2IR", v)} />
            <YesNoRow label={t("ppStep2.t2IFI")} name="t2-ifi" value={fin.t2IFI} onChange={(v) => up("t2IFI", v)} />
          </div>
        </div>
      )}

      {/* Fonds à investir */}
      <div className="space-y-4">
        <h3 className="font-semibold text-brand-dark text-sm border-b border-brand-grayLight pb-2">
          {t("ppStep2.fundsTitle")}
        </h3>
        <div>
          <Label>{t("ppStep2.fundNature")} <span className="text-red-500">*</span></Label>
          <div className="flex gap-4 mt-2">
            {[
              ["liquidities", t("ppStep2.liquidities")],
              ["financial_instruments", t("ppStep2.financialInstruments")],
              ["both", t("ppStep2.both")],
            ].map(([val, lbl]) => (
              <label key={val} className="flex items-center gap-2 cursor-pointer text-sm">
                <input
                  type="radio"
                  name="fund-nature"
                  checked={fin.fundNature === val}
                  onChange={() => up("fundNature", val)}
                  className="accent-brand-gold"
                />
                {lbl}
              </label>
            ))}
          </div>
        </div>
        <div>
          <Label>{t("ppStep2.amountToInvest")} <span className="text-red-500">*</span></Label>
          <Input
            value={fin.amountToInvest}
            onChange={(e) => up("amountToInvest", e.target.value)}
            className="mt-1"
            placeholder={t("ppStep2.amountToInvestPlaceholder")}
          />
        </div>
        <div>
          <Label>{t("ppStep2.fundOrigins")} <span className="text-red-500">*</span></Label>
          <div className="grid grid-cols-2 gap-2 mt-2">
            {FUND_ORIGINS.map(([key, lbl]) => (
              <label key={key} className="flex items-center gap-2 cursor-pointer text-sm">
                <Checkbox
                  checked={fin.fundOrigins.includes(key)}
                  onCheckedChange={() => toggleOrigin(key)}
                />
                {lbl}
              </label>
            ))}
          </div>
          {fin.fundOrigins.includes("autre") && (
            <Input
              value={fin.fundOriginOther}
              onChange={(e) => up("fundOriginOther", e.target.value)}
              className="mt-2"
              placeholder={t("ppStep2.fundOriginOtherPlaceholder")}
            />
          )}
        </div>
        <div>
          <Label>{t("ppStep2.bankOrigin")} <span className="text-red-500">*</span></Label>
          <Input
            value={fin.bankOrigin}
            onChange={(e) => up("bankOrigin", e.target.value)}
            className="mt-1"
            placeholder={t("ppStep2.bankOriginPlaceholder")}
          />
        </div>
        <div>
          <Label>{t("ppStep2.additionalInfo")}</Label>
          <textarea
            value={fin.additionalInfo}
            onChange={(e) => up("additionalInfo", e.target.value)}
            className="mt-1 w-full rounded-xl border border-brand-grayLight px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-gold resize-none"
            rows={3}
            placeholder={t("ppStep2.additionalInfoPlaceholder")}
          />
        </div>
      </div>

      {error && <p className="text-sm text-red-600 font-medium">{error}</p>}
      <Button variant="primary" size="lg" className="w-full" onClick={handleNext}>
        {t("ppStep2.nextBtn")}
      </Button>
    </div>
  );
}
