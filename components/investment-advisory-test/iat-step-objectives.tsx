"use client";
import * as React from "react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import type { IATFormData, ObjectivesData, RiskProfile, Horizon, MaxLoss, PatrimonyPct, PastLoss } from "./iat-types";

interface Props {
  formData: IATFormData;
  onChange: (data: Partial<IATFormData>) => void;
  onNext: () => void;
  error: string;
  setError: (e: string) => void;
}

const RISK_PROFILES = [
  {
    value: "A" as RiskProfile,
    label: "Placement A — Risque faible",
    desc: "Tout en privilégiant la protection de votre capital sur la durée, vous acceptez une diversification partielle de vos investissements sur des actifs plus volatils et donc plus risqués.",
    color: "border-green-400 bg-green-50",
    active: "border-green-500 bg-green-100 ring-2 ring-green-400",
  },
  {
    value: "B" as RiskProfile,
    label: "Placement B — Risque moyen",
    desc: "En acceptant de diversifier significativement vos actifs sur des supports à forte volatilité pouvant entraîner une perte en capital, vous êtes à la recherche d'une valorisation importante de votre investissement.",
    color: "border-amber-400 bg-amber-50",
    active: "border-amber-500 bg-amber-100 ring-2 ring-amber-400",
  },
  {
    value: "C" as RiskProfile,
    label: "Placement C — Risque élevé",
    desc: "En contrepartie d'une perte potentielle partielle, voire totale, de votre épargne, vous cherchez avant tout à maximiser la performance de votre investissement.",
    color: "border-red-400 bg-red-50",
    active: "border-red-500 bg-red-100 ring-2 ring-red-400",
  },
] as const;

function RadioGrid<T extends string>({
  name,
  options,
  value,
  onChange,
}: {
  name: string;
  options: [T, string][];
  value: T | "";
  onChange: (v: T) => void;
}) {
  return (
    <div className="flex flex-wrap gap-2">
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
  );
}

export function IATStepObjectives({ formData, onChange, onNext, error, setError }: Props) {
  const obj = formData.objectives;
  const up = (field: keyof ObjectivesData, val: unknown) =>
    onChange({ objectives: { ...obj, [field]: val } });

  const handleNext = () => {
    if (!obj.riskProfile) { setError("Veuillez sélectionner votre profil de risque (A, B ou C)."); return; }
    if (!obj.horizon) { setError("Veuillez indiquer votre horizon d'investissement."); return; }
    if (!obj.maxLoss) { setError("Veuillez indiquer le niveau de perte maximale acceptable."); return; }
    setError("");
    onNext();
  };

  return (
    <div className="space-y-8">
      {/* Objectives */}
      <div className="space-y-3">
        <div>
          <h3 className="font-semibold text-brand-dark text-sm">
            Quels sont vos objectifs d'investissement ?
          </h3>
          <p className="text-xs text-brand-grayMed mt-0.5">Cochez tous ceux qui s'appliquent</p>
        </div>
        <div className="grid grid-cols-2 gap-2">
          {([
            ["capitalPreservation", "Préservation du capital"],
            ["capitalGrowth", "Valorisation du capital"],
            ["diversification", "Diversification des actifs"],
            ["incomeSearch", "Recherche de revenus"],
            ["transmission", "Transmission patrimoniale"],
            ["taxOptimization", "Optimisation fiscale"],
          ] as [keyof ObjectivesData, string][]).map(([field, lbl]) => (
            <label key={field} className="flex items-center gap-2 cursor-pointer text-sm">
              <Checkbox
                checked={obj[field] as boolean}
                onCheckedChange={(v) => up(field, !!v)}
              />
              {lbl}
            </label>
          ))}
        </div>
        <div>
          <label className="text-xs text-brand-grayMed">Autre objectif</label>
          <input
            type="text"
            value={obj.other}
            onChange={(e) => up("other", e.target.value)}
            className="mt-1 w-full rounded-xl border border-brand-grayLight px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-gold"
            placeholder="Précisez..."
          />
        </div>
      </div>

      {/* Risk profile */}
      <div className="space-y-3">
        <div>
          <h3 className="font-semibold text-brand-dark text-sm">
            Quelle est votre tolérance au risque ? *
          </h3>
          <p className="text-xs text-brand-grayMed mt-0.5">
            Choisissez le profil avec lequel vous vous sentiez le plus à l'aise
          </p>
        </div>
        <div className="space-y-3">
          {RISK_PROFILES.map(({ value, label, desc, color, active }) => (
            <button
              key={value}
              type="button"
              onClick={() => up("riskProfile", value)}
              className={`w-full rounded-xl border-2 p-4 text-left transition-all ${
                obj.riskProfile === value ? active : color
              }`}
            >
              <p className="font-bold text-sm text-brand-dark">{label}</p>
              <p className="text-xs text-brand-grayMed mt-1">{desc}</p>
            </button>
          ))}
        </div>
      </div>

      {/* Past loss experience */}
      <div className="space-y-3">
        <h3 className="font-semibold text-brand-dark text-sm">
          Avez-vous déjà effectué un investissement qui a connu une baisse de valeur ?
        </h3>
        <RadioGrid
          name="past-loss"
          options={[
            ["none", "Non"],
            ["<10", "Oui, < 10 %"],
            ["10-20", "Oui, 10 – 20 %"],
            [">20", "Oui, > 20 %"],
          ] as [PastLoss, string][]}
          value={obj.pastLoss}
          onChange={(v) => up("pastLoss", v)}
        />
        {obj.pastLoss === "none" && (
          <div className="space-y-2">
            <p className="text-xs font-medium text-brand-grayMed">
              Si cela arrivait, quelle serait votre réaction ?
            </p>
            <RadioGrid
              name="reaction-no-prior"
              options={[
                ["re-invest", "Je réinvestis pour profiter des opportunités"],
                ["sell-all", "Je vends tout pour réinvestir sur des supports moins risqués"],
                ["sell-partial", "Je vends une partie seulement"],
                ["nothing", "Je ne change rien"],
              ]}
              value={obj.reactionNoPriorLoss}
              onChange={(v) => up("reactionNoPriorLoss", v)}
            />
          </div>
        )}
        {obj.pastLoss && obj.pastLoss !== "none" && (
          <div className="space-y-2">
            <p className="text-xs font-medium text-brand-grayMed">
              Quelle a été votre réaction face à cette baisse ?
            </p>
            <RadioGrid
              name="reaction-prior"
              options={[
                ["re-invest", "J'ai réinvesti pour profiter des opportunités"],
                ["sell-all", "J'ai tout vendu pour réinvestir sur des supports moins risqués"],
                ["sell-partial", "J'ai vendu une partie seulement"],
                ["nothing", "Je n'ai rien changé"],
              ]}
              value={obj.reactionPriorLoss}
              onChange={(v) => up("reactionPriorLoss", v)}
            />
          </div>
        )}
      </div>

      {/* Gain reaction */}
      <div className="space-y-3">
        <h3 className="font-semibold text-brand-dark text-sm">
          La valeur de votre investissement augmente de 20 %. Comment réagissez-vous ?
        </h3>
        <RadioGrid
          name="gain-reaction"
          options={[
            ["hold", "Je conserve ma position"],
            ["reinvest-less", "Je réinvestis un montant inférieur ou égal au montant initial"],
            ["reinvest-more", "Je réinvestis un montant supérieur au montant initial"],
          ]}
          value={obj.reactionToGain}
          onChange={(v) => up("reactionToGain", v as ObjectivesData["reactionToGain"])}
        />
      </div>

      {/* Horizon */}
      <div className="space-y-3">
        <h3 className="font-semibold text-brand-dark text-sm">
          Sur quel horizon souhaitez-vous réaliser ce placement ? *
        </h3>
        <RadioGrid
          name="horizon"
          options={[
            ["<1", "< 1 an"],
            ["1-3", "1 à 3 ans"],
            ["3-5", "3 à 5 ans"],
            [">5", "> 5 ans"],
          ] as [Horizon, string][]}
          value={obj.horizon}
          onChange={(v) => up("horizon", v)}
        />
      </div>

      {/* Liquidity */}
      <div className="space-y-3">
        <h3 className="font-semibold text-brand-dark text-sm">
          Le critère de liquidité est-il important dans le cadre de ce placement ?
        </h3>
        <RadioGrid
          name="liquidity"
          options={[
            ["true", "Oui — je dois pouvoir disposer de mon argent à tout moment"],
            ["false", "Non — je dispose de liquidités accessibles rapidement par ailleurs"],
          ]}
          value={obj.liquidityNeeded === null ? "" : String(obj.liquidityNeeded)}
          onChange={(v) => up("liquidityNeeded", v === "true")}
        />
      </div>

      {/* Max loss */}
      <div className="space-y-3">
        <h3 className="font-semibold text-brand-dark text-sm">
          Quel niveau de perte maximale êtes-vous prêt(e) à subir sur ce placement ? *
        </h3>
        <RadioGrid
          name="max-loss"
          options={[
            ["none", "Aucune perte"],
            ["10", "Maximum 10 %"],
            ["25", "Maximum 25 %"],
            ["50", "Maximum 50 %"],
            ["100", "Jusqu'à 100 %"],
          ] as [MaxLoss, string][]}
          value={obj.maxLoss}
          onChange={(v) => up("maxLoss", v)}
        />
      </div>

      {/* % of patrimony */}
      <div className="space-y-3">
        <h3 className="font-semibold text-brand-dark text-sm">
          Quel pourcentage de votre patrimoine total représente le montant que vous envisagez d'investir ?
        </h3>
        <RadioGrid
          name="patrimony-pct"
          options={[
            ["<10", "Moins de 10 %"],
            ["10-25", "10 % – 25 %"],
            ["25-50", "25 % – 50 %"],
            ["50-75", "50 % – 75 %"],
            [">75", "Plus de 75 %"],
          ] as [PatrimonyPct, string][]}
          value={obj.percentOfPatrimony}
          onChange={(v) => up("percentOfPatrimony", v)}
        />
      </div>

      {error && <p className="text-sm text-red-600 font-medium">{error}</p>}
      <Button variant="primary" size="lg" className="w-full" onClick={handleNext}>
        Suivant — Investissements durables
      </Button>
    </div>
  );
}
