"use client";
import * as React from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { useTranslations } from "next-intl";
import type { IATFormData, CompanyFinancial } from "./iat-types";

interface Props {
  formData: IATFormData;
  onChange: (data: Partial<IATFormData>) => void;
  onNext: () => void;
  error: string;
  setError: (e: string) => void;
}

function AmountPct({
  amountLabel,
  pctLabel,
  amountField,
  pctField,
  fin,
  up,
}: {
  amountLabel: string;
  pctLabel: string;
  amountField: keyof CompanyFinancial;
  pctField: keyof CompanyFinancial;
  fin: CompanyFinancial;
  up: (field: keyof CompanyFinancial, val: string) => void;
}) {
  return (
    <div className="grid grid-cols-3 gap-3 items-end">
      <div className="col-span-2">
        <Label>{amountLabel}</Label>
        <Input
          value={fin[amountField] as string}
          onChange={(e) => up(amountField, e.target.value)}
          className="mt-1"
          placeholder="€"
        />
      </div>
      <div>
        <Label>{pctLabel}</Label>
        <Input
          value={fin[pctField] as string}
          onChange={(e) => up(pctField, e.target.value)}
          className="mt-1"
          placeholder="%"
        />
      </div>
    </div>
  );
}

export function IATpmStep2({ formData, onChange, onNext, error, setError }: Props) {
  const t = useTranslations("iat");
  const fin = formData.companyFinancial;
  const up = (field: keyof CompanyFinancial, val: unknown) =>
    onChange({ companyFinancial: { ...fin, [field]: val } });

  const FUND_ORIGINS: [string, string][] = [
    ["revenus_pro", t("pmStep2.fundOriginRevenusPro")],
    ["cession_actifs_pro", t("pmStep2.fundOriginCessionActifsPro")],
    ["cession_immo", t("pmStep2.fundOriginCessionImmo")],
    ["epargne", t("pmStep2.fundOriginEpargne")],
    ["cession_mob", t("pmStep2.fundOriginCessionMob")],
    ["assurance_vie", t("pmStep2.fundOriginAssuranceVie")],
    ["heritage", t("pmStep2.fundOriginHeritage")],
    ["autre", t("pmStep2.fundOriginAutre")],
  ];

  const toggleOrigin = (key: string) => {
    const prev = fin.fundOrigins;
    const next = prev.includes(key) ? prev.filter((x) => x !== key) : [...prev, key];
    up("fundOrigins", next);
  };

  const handleNext = () => {
    if (!fin.amountToInvest.trim()) { setError(t("pmStep2.errAmount")); return; }
    if (!fin.fundNature) { setError(t("pmStep2.errFundNature")); return; }
    if (fin.fundOrigins.length === 0) { setError(t("pmStep2.errFundOrigins")); return; }
    const hasComposition = [fin.bankingSavings, fin.financialSavings, fin.capitalizationContracts, fin.realEstate, fin.professional].some((v) => v?.trim());
    if (!hasComposition) { setError(t("pmStep2.errComposition")); return; }
    setError("");
    onNext();
  };

  return (
    <div className="space-y-8">
      {/* Données financières */}
      <div className="space-y-4">
        <h3 className="font-semibold text-brand-dark text-sm border-b border-brand-grayLight pb-2">
          {t("pmStep2.financialTitle")}
        </h3>
        <div>
          <Label>{t("pmStep2.fiscalYearEnd")}</Label>
          <Input
            type="date"
            value={fin.fiscalYearEnd}
            onChange={(e) => up("fiscalYearEnd", e.target.value)}
            className="mt-1"
          />
        </div>
        <div className="grid grid-cols-1 gap-3">
          <div>
            <Label>{t("pmStep2.totalBalance")}</Label>
            <Input value={fin.totalBalance} onChange={(e) => up("totalBalance", e.target.value)} className="mt-1" placeholder={t("pmStep2.totalBalancePlaceholder")} />
          </div>
          <div>
            <Label>{t("pmStep2.revenue")}</Label>
            <Input value={fin.revenue} onChange={(e) => up("revenue", e.target.value)} className="mt-1" placeholder={t("pmStep2.revenuePlaceholder")} />
          </div>
          <div>
            <Label>{t("pmStep2.equity")}</Label>
            <Input value={fin.equity} onChange={(e) => up("equity", e.target.value)} className="mt-1" placeholder={t("pmStep2.equityPlaceholder")} />
          </div>
          <div>
            <Label>{t("pmStep2.financialCommitments")}</Label>
            <Input value={fin.financialCommitments} onChange={(e) => up("financialCommitments", e.target.value)} className="mt-1" placeholder={t("pmStep2.financialCommitmentsPlaceholder")} />
          </div>
        </div>
        <div>
          <Label>{t("pmStep2.taxType")}</Label>
          <div className="flex gap-6 mt-2">
            {[["IS", t("pmStep2.taxIS")], ["IR", t("pmStep2.taxIR")]].map(([val, lbl]) => (
              <label key={val} className="flex items-center gap-2 cursor-pointer text-sm">
                <input
                  type="radio"
                  name="tax-type"
                  checked={fin.taxType === val}
                  onChange={() => up("taxType", val)}
                  className="accent-brand-gold"
                />
                {lbl}
              </label>
            ))}
          </div>
        </div>
      </div>

      {/* Patrimoine */}
      <div className="space-y-4">
        <h3 className="font-bold text-red-600 text-sm border-b border-brand-grayLight pb-2">
          {t("pmStep2.patrimoineTitle")}
        </h3>
        <AmountPct
          amountLabel={t("pmStep2.bankingSavings")}
          pctLabel={t("pmStep2.pctLabel")}
          amountField="bankingSavings"
          pctField="bankingSavingsPct"
          fin={fin}
          up={(f, v) => up(f, v)}
        />
        <AmountPct
          amountLabel={t("pmStep2.financialSavings")}
          pctLabel={t("pmStep2.pctLabel")}
          amountField="financialSavings"
          pctField="financialSavingsPct"
          fin={fin}
          up={(f, v) => up(f, v)}
        />
        <AmountPct
          amountLabel={t("pmStep2.capitalizationContracts")}
          pctLabel={t("pmStep2.pctLabel")}
          amountField="capitalizationContracts"
          pctField="capitalizationContractsPct"
          fin={fin}
          up={(f, v) => up(f, v)}
        />
        <AmountPct
          amountLabel={t("pmStep2.realEstate")}
          pctLabel={t("pmStep2.pctLabel")}
          amountField="realEstate"
          pctField="realEstatePct"
          fin={fin}
          up={(f, v) => up(f, v)}
        />
        <AmountPct
          amountLabel={t("pmStep2.professional")}
          pctLabel={t("pmStep2.pctLabel")}
          amountField="professional"
          pctField="professionalPct"
          fin={fin}
          up={(f, v) => up(f, v)}
        />
        <div className="grid grid-cols-3 gap-3 items-end">
          <div className="col-span-2">
            <Label>{t("pmStep2.otherDesc")}</Label>
            <Input
              value={fin.otherDesc}
              onChange={(e) => up("otherDesc", e.target.value)}
              className="mt-1"
              placeholder={t("pmStep2.otherDescPlaceholder")}
            />
          </div>
          <div>
            <Label>{t("pmStep2.pctLabel")}</Label>
            <Input
              value={fin.otherPct}
              onChange={(e) => up("otherPct", e.target.value)}
              className="mt-1"
              placeholder="%"
            />
          </div>
        </div>
      </div>

      {/* Fonds */}
      <div className="space-y-4">
        <h3 className="font-semibold text-brand-dark text-sm border-b border-brand-grayLight pb-2">
          {t("pmStep2.fundsTitle")}
        </h3>
        <div>
          <Label><span className="font-bold text-red-600">{t("pmStep2.fundNature")}</span></Label>
          <div className="flex gap-4 mt-2">
            {[["liquidities", t("pmStep2.liquidities")], ["financial_instruments", t("pmStep2.financialInstruments")], ["both", t("pmStep2.both")]].map(([val, lbl]) => (
              <label key={val} className="flex items-center gap-2 cursor-pointer text-sm">
                <input
                  type="radio"
                  name="fund-nature-pm"
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
          <Label><span className="font-bold text-red-600">{t("pmStep2.amountToInvest")}</span></Label>
          <Input
            value={fin.amountToInvest}
            onChange={(e) => up("amountToInvest", e.target.value)}
            className="mt-1"
            placeholder={t("pmStep2.amountToInvestPlaceholder")}
          />
        </div>
        <div>
          <Label><span className="font-bold text-red-600">{t("pmStep2.fundOrigins")}</span></Label>
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
              placeholder={t("pmStep2.fundOriginOtherPlaceholder")}
            />
          )}
        </div>
        <div>
          <Label><span className="font-bold text-red-600">{t("pmStep2.bankOrigin")}</span></Label>
          <Input value={fin.bankOrigin} onChange={(e) => up("bankOrigin", e.target.value)} className="mt-1" placeholder={t("pmStep2.bankOriginPlaceholder")} />
        </div>
        <div>
          <Label>{t("pmStep2.fundingModality")}</Label>
          <div className="flex gap-4 mt-2">
            {[["portfolio_transfer", t("pmStep2.portfolioTransfer")], ["check", t("pmStep2.check")], ["wire", t("pmStep2.wire")]].map(([val, lbl]) => (
              <label key={val} className="flex items-center gap-2 cursor-pointer text-sm">
                <input
                  type="radio"
                  name="funding-modality"
                  checked={fin.fundingModality === val}
                  onChange={() => up("fundingModality", val)}
                  className="accent-brand-gold"
                />
                {lbl}
              </label>
            ))}
          </div>
        </div>
      </div>

      {error && <p className="text-sm text-red-600 font-medium">{error}</p>}
      <Button variant="primary" size="lg" className="w-full" onClick={handleNext}>
        {t("pmStep2.nextBtn")}
      </Button>
    </div>
  );
}
