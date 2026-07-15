"use client";
import * as React from "react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Leaf } from "lucide-react";
import type { IATFormData, ESGData } from "./iat-types";
import { ESG_IMPACT_FACTORS } from "./iat-types";

interface Props {
  formData: IATFormData;
  onChange: (data: Partial<IATFormData>) => void;
  onNext: () => void;
}

function PctGroup({
  label,
  name,
  value,
  onChange,
}: {
  label: string;
  name: string;
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <div className="space-y-2">
      <p className="text-sm font-medium text-brand-dark">{label}</p>
      <div className="flex flex-wrap gap-2">
        {([["5", "≥ 5 %"], ["25", "≥ 25 %"], ["50", "≥ 50 %"], ["none", "Aucun"]] as [string, string][]).map(([val, lbl]) => (
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

export function IATStepESG({ formData, onChange, onNext }: Props) {
  const esg = formData.esg;
  const up = (field: keyof ESGData, val: unknown) =>
    onChange({ esg: { ...esg, [field]: val } });

  const toggleImpact = (id: string) => {
    const prev = esg.negativeImpacts;
    const next = prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id];
    up("negativeImpacts", next);
  };

  return (
    <div className="space-y-8">
      <div className="flex items-start gap-3 rounded-xl bg-green-50 border border-green-200 px-4 py-3">
        <Leaf className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
        <p className="text-xs text-green-900">
          Les préférences en matière de durabilité sont recueillies conformément aux exigences
          MiFID II (règlement SFDR / Taxonomie européenne). Elles permettent d'orienter la sélection
          des instruments financiers lorsque des produits ESG adaptés sont disponibles.
        </p>
      </div>

      {/* Main ESG question */}
      <div className="space-y-3">
        <h3 className="font-semibold text-brand-dark">
          Souhaitez-vous intégrer des critères de durabilité dans vos choix d'investissements ?
        </h3>
        <div className="flex gap-6">
          {([true, false] as const).map((v) => (
            <label key={String(v)} className="flex items-center gap-2 cursor-pointer text-sm font-medium">
              <input
                type="radio"
                name="wants-esg"
                checked={esg.wantsESG === v}
                onChange={() => up("wantsESG", v)}
                className="accent-brand-gold"
              />
              {v ? "Oui" : "Non"}
            </label>
          ))}
        </div>
      </div>

      {esg.wantsESG && (
        <>
          {/* Taxonomy */}
          <PctGroup
            label="1. Préférences en matière d'intégration de supports alignés avec la Taxonomie Européenne"
            name="taxonomy"
            value={esg.taxonomyPct}
            onChange={(v) => up("taxonomyPct", v)}
          />
          {esg.taxonomyPct && esg.taxonomyPct !== "none" && (
            <div className="rounded-xl bg-amber-50 border border-amber-200 px-4 py-3 text-xs text-amber-800">
              Actuellement, peu de produits financiers ESG ont une part significative
              d'investissements durables alignée avec la Taxonomie européenne. Si vous sélectionnez
              ce critère, l'offre disponible peut être limitée, mais s'améliorera progressivement.
            </div>
          )}

          {/* Sustainable investment % */}
          <PctGroup
            label="2. Souhaits en termes d'intégration d'investissements durables au sein de votre placement"
            name="sustainable"
            value={esg.sustainablePct}
            onChange={(v) => up("sustainablePct", v)}
          />

          {/* Impact on factors */}
          <div className="space-y-3">
            <h3 className="font-semibold text-brand-dark text-sm">
              3. Souhaitez-vous sélectionner vos investissements en fonction de leur impact sur les
              facteurs de durabilité ?
            </h3>
            <div className="flex gap-6">
              {([true, false] as const).map((v) => (
                <label key={String(v)} className="flex items-center gap-2 cursor-pointer text-sm">
                  <input
                    type="radio"
                    name="impact-factors"
                    checked={esg.impactFactors === v}
                    onChange={() => up("impactFactors", v)}
                    className="accent-brand-gold"
                  />
                  {v ? "Oui" : "Non"}
                </label>
              ))}
            </div>

            {esg.impactFactors && (
              <div className="space-y-2">
                <p className="text-xs text-brand-grayMed">
                  Précisez les effets sur lesquels vous souhaitez minimiser les incidences négatives :
                </p>
                <div className="grid grid-cols-1 gap-2">
                  {ESG_IMPACT_FACTORS.map(({ id, label }) => (
                    <label key={id} className="flex items-center gap-2 cursor-pointer text-sm">
                      <Checkbox
                        checked={esg.negativeImpacts.includes(id)}
                        onCheckedChange={() => toggleImpact(id)}
                      />
                      {label}
                    </label>
                  ))}
                </div>
              </div>
            )}
          </div>
        </>
      )}

      <Button variant="primary" size="lg" className="w-full" onClick={onNext}>
        Suivant — Prise de rendez-vous
      </Button>
    </div>
  );
}
