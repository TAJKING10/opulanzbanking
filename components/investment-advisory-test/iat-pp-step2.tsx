"use client";
import * as React from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import type { IATFormData, PersonalFinancial, IncomeRange, PatrimonyRange } from "./iat-types";

interface Props {
  formData: IATFormData;
  onChange: (data: Partial<IATFormData>) => void;
  onNext: () => void;
  error: string;
  setError: (e: string) => void;
}

const INCOME_OPTIONS: [IncomeRange, string][] = [
  ["<50k", "< 50 000 €"],
  ["50-100k", "50 000 € – 100 000 €"],
  ["100-150k", "100 001 € – 150 000 €"],
  ["150-500k", "150 000 € – 500 000 €"],
  [">500k", "> 500 000 €"],
];

const PATRIMONY_OPTIONS: [PatrimonyRange, string][] = [
  ["<100k", "< 100 000 €"],
  ["100-300k", "100 001 € – 300 000 €"],
  ["300-500k", "300 001 € – 500 000 €"],
  ["500k-1m", "500 001 € – 1 000 000 €"],
  ["1-5m", "1 000 001 € – 5 000 000 €"],
  [">5m", "> 5 000 000 €"],
];

const FUND_ORIGINS = [
  ["revenus_pro", "Revenus professionnels"],
  ["cession_actifs_pro", "Cession(s) d'actifs professionnels"],
  ["cession_immo", "Cession(s) immobilière(s)"],
  ["epargne", "Épargne constituée"],
  ["cession_mob", "Cession(s) mobilière(s)"],
  ["assurance_vie", "Assurance-vie"],
  ["heritage", "Héritage – Donation – Succession"],
  ["jeux", "Gains de jeu"],
  ["autre", "Autres"],
] as const;

function SelectRow({
  label,
  options,
  value,
  onChange,
}: {
  label: string;
  options: [string, string][];
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <div>
      <Label>{label}</Label>
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
  const fin = formData.personalFinancial;
  const up = (field: keyof PersonalFinancial, val: unknown) =>
    onChange({ personalFinancial: { ...fin, [field]: val } });

  const toggleOrigin = (key: string) => {
    const prev = fin.fundOrigins;
    const next = prev.includes(key) ? prev.filter((x) => x !== key) : [...prev, key];
    up("fundOrigins", next);
  };

  const handleNext = () => {
    if (!fin.t1Income) { setError("Veuillez indiquer les revenus du Titulaire 1."); return; }
    if (!fin.amountToInvest.trim()) { setError("Veuillez indiquer le montant prévu à investir."); return; }
    setError("");
    onNext();
  };

  return (
    <div className="space-y-8">
      {/* Flux financiers T1 */}
      <div className="space-y-4">
        <h3 className="font-semibold text-brand-dark text-sm border-b border-brand-grayLight pb-2">
          Flux financiers — Titulaire 1
        </h3>
        <SelectRow
          label="Revenus moyens annuels globaux du foyer fiscal *"
          options={INCOME_OPTIONS}
          value={fin.t1Income}
          onChange={(v) => up("t1Income", v)}
        />
        <SelectRow
          label="Estimation globale du patrimoine (dettes exclues)"
          options={PATRIMONY_OPTIONS}
          value={fin.t1Patrimony}
          onChange={(v) => up("t1Patrimony", v)}
        />
        <div className="grid grid-cols-2 gap-3">
          <div>
            <Label>Engagements financiers (% des revenus)</Label>
            <Input
              value={fin.t1Commitments}
              onChange={(e) => up("t1Commitments", e.target.value)}
              className="mt-1"
              placeholder="Ex. : 30 %"
            />
          </div>
          <div>
            <Label>Capacité d'épargne estimée (€)</Label>
            <Input
              value={fin.t1SavingsCapacity}
              onChange={(e) => up("t1SavingsCapacity", e.target.value)}
              className="mt-1"
              placeholder="Ex. : 1 000 €/mois"
            />
          </div>
        </div>
        <div className="grid grid-cols-4 gap-2">
          {[
            ["t1FinancialPct", "Actifs financiers %"],
            ["t1RealEstatePct", "Actifs immobiliers %"],
            ["t1ProfessionalPct", "Actifs professionnels %"],
            ["t1OtherPct", "Autres %"],
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
          <YesNoRow label="Imposition IR" name="t1-ir" value={fin.t1IR} onChange={(v) => up("t1IR", v)} />
          <YesNoRow label="Imposition IFI" name="t1-ifi" value={fin.t1IFI} onChange={(v) => up("t1IFI", v)} />
        </div>
      </div>

      {/* Flux financiers T2 (optional) */}
      {formData.hasTitulaire2 && (
        <div className="space-y-4">
          <h3 className="font-semibold text-brand-dark text-sm border-b border-brand-grayLight pb-2">
            Flux financiers — Titulaire 2
          </h3>
          <SelectRow
            label="Revenus moyens annuels globaux"
            options={INCOME_OPTIONS}
            value={fin.t2Income}
            onChange={(v) => up("t2Income", v)}
          />
          <SelectRow
            label="Estimation globale du patrimoine"
            options={PATRIMONY_OPTIONS}
            value={fin.t2Patrimony}
            onChange={(v) => up("t2Patrimony", v)}
          />
          <div className="space-y-2">
            <YesNoRow label="Imposition IR" name="t2-ir" value={fin.t2IR} onChange={(v) => up("t2IR", v)} />
            <YesNoRow label="Imposition IFI" name="t2-ifi" value={fin.t2IFI} onChange={(v) => up("t2IFI", v)} />
          </div>
        </div>
      )}

      {/* Fonds à investir */}
      <div className="space-y-4">
        <h3 className="font-semibold text-brand-dark text-sm border-b border-brand-grayLight pb-2">
          Origine des fonds à investir
        </h3>
        <div>
          <Label>Nature des avoirs</Label>
          <div className="flex gap-4 mt-2">
            {[
              ["liquidities", "Liquidités"],
              ["financial_instruments", "Instruments financiers"],
              ["both", "Les deux"],
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
          <Label>Montant prévu des avoirs à investir *</Label>
          <Input
            value={fin.amountToInvest}
            onChange={(e) => up("amountToInvest", e.target.value)}
            className="mt-1"
            placeholder="Ex. : 50 000 €"
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
          <Input
            value={fin.bankOrigin}
            onChange={(e) => up("bankOrigin", e.target.value)}
            className="mt-1"
            placeholder="Nom de la banque"
          />
        </div>
        <div>
          <Label>Informations complémentaires</Label>
          <textarea
            value={fin.additionalInfo}
            onChange={(e) => up("additionalInfo", e.target.value)}
            className="mt-1 w-full rounded-xl border border-brand-grayLight px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-gold resize-none"
            rows={3}
            placeholder="Évolution professionnelle, projets, informations utiles..."
          />
        </div>
      </div>

      {error && <p className="text-sm text-red-600 font-medium">{error}</p>}
      <Button variant="primary" size="lg" className="w-full" onClick={handleNext}>
        Suivant — Documents
      </Button>
    </div>
  );
}
