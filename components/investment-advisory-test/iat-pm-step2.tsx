"use client";
import * as React from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import type { IATFormData, CompanyFinancial } from "./iat-types";

interface Props {
  formData: IATFormData;
  onChange: (data: Partial<IATFormData>) => void;
  onNext: () => void;
  error: string;
  setError: (e: string) => void;
}

const FUND_ORIGINS = [
  ["revenus_pro", "Revenus professionnels"],
  ["cession_actifs_pro", "Cession(s) d'actifs professionnels"],
  ["cession_immo", "Cession(s) immobilière(s)"],
  ["epargne", "Épargne constituée"],
  ["cession_mob", "Cession(s) mobilière(s)"],
  ["assurance_vie", "Assurance-vie"],
  ["heritage", "Héritage – Donation – Succession"],
  ["autre", "Autres"],
] as const;

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
  const fin = formData.companyFinancial;
  const up = (field: keyof CompanyFinancial, val: unknown) =>
    onChange({ companyFinancial: { ...fin, [field]: val } });

  const toggleOrigin = (key: string) => {
    const prev = fin.fundOrigins;
    const next = prev.includes(key) ? prev.filter((x) => x !== key) : [...prev, key];
    up("fundOrigins", next);
  };

  const handleNext = () => {
    if (!fin.amountToInvest.trim()) {
      setError("Veuillez indiquer le montant prévu à investir.");
      return;
    }
    setError("");
    onNext();
  };

  return (
    <div className="space-y-8">
      {/* Données financières */}
      <div className="space-y-4">
        <h3 className="font-semibold text-brand-dark text-sm border-b border-brand-grayLight pb-2">
          Données financières (dernier exercice clos)
        </h3>
        <div>
          <Label>Date de clôture de l'exercice</Label>
          <Input
            type="date"
            value={fin.fiscalYearEnd}
            onChange={(e) => up("fiscalYearEnd", e.target.value)}
            className="mt-1"
          />
        </div>
        <div className="grid grid-cols-1 gap-3">
          <div>
            <Label>Montant total du bilan (€)</Label>
            <Input value={fin.totalBalance} onChange={(e) => up("totalBalance", e.target.value)} className="mt-1" placeholder="Ex. : 2 500 000 €" />
          </div>
          <div>
            <Label>Chiffre d'affaires net ou résultat net (€)</Label>
            <Input value={fin.revenue} onChange={(e) => up("revenue", e.target.value)} className="mt-1" placeholder="Ex. : 800 000 €" />
          </div>
          <div>
            <Label>Capitaux propres (€)</Label>
            <Input value={fin.equity} onChange={(e) => up("equity", e.target.value)} className="mt-1" placeholder="Ex. : 1 200 000 €" />
          </div>
          <div>
            <Label>Engagements financiers (% des revenus annuels)</Label>
            <Input value={fin.financialCommitments} onChange={(e) => up("financialCommitments", e.target.value)} className="mt-1" placeholder="Ex. : 25 %" />
          </div>
        </div>
        <div>
          <Label>Type d'imposition</Label>
          <div className="flex gap-6 mt-2">
            {[["IS", "Impôt sur les sociétés (IS)"], ["IR", "Impôt sur le revenu (IR)"]].map(([val, lbl]) => (
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
        <h3 className="font-semibold text-brand-dark text-sm border-b border-brand-grayLight pb-2">
          Composition du patrimoine de la structure
        </h3>
        <AmountPct
          amountLabel="Épargne bancaire"
          pctLabel="% du patrimoine"
          amountField="bankingSavings"
          pctField="bankingSavingsPct"
          fin={fin}
          up={(f, v) => up(f, v)}
        />
        <AmountPct
          amountLabel="Épargne financière"
          pctLabel="% du patrimoine"
          amountField="financialSavings"
          pctField="financialSavingsPct"
          fin={fin}
          up={(f, v) => up(f, v)}
        />
        <AmountPct
          amountLabel="Contrats de capitalisation"
          pctLabel="% du patrimoine"
          amountField="capitalizationContracts"
          pctField="capitalizationContractsPct"
          fin={fin}
          up={(f, v) => up(f, v)}
        />
        <AmountPct
          amountLabel="Patrimoine immobilier"
          pctLabel="% du patrimoine"
          amountField="realEstate"
          pctField="realEstatePct"
          fin={fin}
          up={(f, v) => up(f, v)}
        />
        <AmountPct
          amountLabel="Patrimoine professionnel"
          pctLabel="% du patrimoine"
          amountField="professional"
          pctField="professionalPct"
          fin={fin}
          up={(f, v) => up(f, v)}
        />
        <div className="grid grid-cols-3 gap-3 items-end">
          <div className="col-span-2">
            <Label>Autres (précisez)</Label>
            <Input
              value={fin.otherDesc}
              onChange={(e) => up("otherDesc", e.target.value)}
              className="mt-1"
              placeholder="Nature des autres actifs"
            />
          </div>
          <div>
            <Label>% du patrimoine</Label>
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
          Origine des fonds affectés au mandat
        </h3>
        <div>
          <Label>Nature des avoirs à investir</Label>
          <div className="flex gap-4 mt-2">
            {[["liquidities", "Liquidités"], ["financial_instruments", "Instruments financiers"], ["both", "Les deux"]].map(([val, lbl]) => (
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
          <Label>Montant prévu des avoirs à investir *</Label>
          <Input
            value={fin.amountToInvest}
            onChange={(e) => up("amountToInvest", e.target.value)}
            className="mt-1"
            placeholder="Ex. : 200 000 €"
          />
        </div>
        <div>
          <Label>Origine économique des avoirs</Label>
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
              placeholder="Précisez l'origine"
            />
          )}
        </div>
        <div>
          <Label>Établissement bancaire d'origine</Label>
          <Input value={fin.bankOrigin} onChange={(e) => up("bankOrigin", e.target.value)} className="mt-1" placeholder="Nom de la banque" />
        </div>
        <div>
          <Label>Modalités d'alimentation du mandat</Label>
          <div className="flex gap-4 mt-2">
            {[["portfolio_transfer", "Transfert de portefeuille"], ["check", "Chèque"], ["wire", "Virement"]].map(([val, lbl]) => (
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
        Suivant — Documents
      </Button>
    </div>
  );
}
