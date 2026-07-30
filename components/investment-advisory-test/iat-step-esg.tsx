"use client";
import * as React from "react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Leaf } from "lucide-react";
import { useTranslations } from "next-intl";
import type { IATFormData, ESGData } from "./iat-types";
import { ESG_IMPACT_FACTORS } from "./iat-types";

interface Props {
  formData: IATFormData;
  onChange: (data: Partial<IATFormData>) => void;
  onNext: () => void;
  error: string;
  setError: (e: string) => void;
}

function PctGroup({
  label,
  name,
  value,
  onChange,
  pct5,
  pct25,
  pct50,
  pctNone,
}: {
  label: string;
  name: string;
  value: string;
  onChange: (v: string) => void;
  pct5: string;
  pct25: string;
  pct50: string;
  pctNone: string;
}) {
  return (
    <div className="space-y-2">
      <p className="text-sm font-medium text-brand-dark">{label}</p>
      <div className="flex flex-wrap gap-2">
        {([["5", pct5], ["25", pct25], ["50", pct50], ["none", pctNone]] as [string, string][]).map(([val, lbl]) => (
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

export function IATStepESG({ formData, onChange, onNext, error, setError }: Props) {
  const t = useTranslations("iat");
  const esg = formData.esg;
  const up = (field: keyof ESGData, val: unknown) =>
    onChange({ esg: { ...esg, [field]: val } });

  const handleNext = () => {
    if (esg.wantsESG === null) { setError(t("esg.errWantsESG")); return; }
    setError("");
    onNext();
  };

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
          {t("esg.disclaimer")}
        </p>
      </div>

      {/* Main ESG question */}
      <div className="space-y-3">
        <h3 className="font-bold text-red-600">
          {t("esg.mainQuestion")}
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
              {v ? t("esg.yes") : t("esg.no")}
            </label>
          ))}
        </div>
      </div>

      {esg.wantsESG && (
        <>
          {/* Taxonomy */}
          <PctGroup
            label={t("esg.taxonomyLabel")}
            name="taxonomy"
            value={esg.taxonomyPct}
            onChange={(v) => up("taxonomyPct", v)}
            pct5={t("esg.pct5")}
            pct25={t("esg.pct25")}
            pct50={t("esg.pct50")}
            pctNone={t("esg.pctNone")}
          />
          {esg.taxonomyPct && esg.taxonomyPct !== "none" && (
            <div className="rounded-xl bg-amber-50 border border-amber-200 px-4 py-3 text-xs text-amber-800">
              {t("esg.taxonomyWarning")}
            </div>
          )}

          {/* Sustainable investment % */}
          <PctGroup
            label={t("esg.sustainableLabel")}
            name="sustainable"
            value={esg.sustainablePct}
            onChange={(v) => up("sustainablePct", v)}
            pct5={t("esg.pct5")}
            pct25={t("esg.pct25")}
            pct50={t("esg.pct50")}
            pctNone={t("esg.pctNone")}
          />

          {/* Impact on factors */}
          <div className="space-y-3">
            <h3 className="font-bold text-red-600 text-sm">
              {t("esg.impactFactorsTitle")}
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
                  {v ? t("esg.yes") : t("esg.no")}
                </label>
              ))}
            </div>

            {esg.impactFactors && (
              <div className="space-y-2">
                <p className="text-xs text-brand-grayMed">
                  {t("esg.impactFactorsNote")}
                </p>
                <div className="grid grid-cols-1 gap-2">
                  {ESG_IMPACT_FACTORS.map(({ id }) => (
                    <label key={id} className="flex items-center gap-2 cursor-pointer text-sm">
                      <Checkbox
                        checked={esg.negativeImpacts.includes(id)}
                        onCheckedChange={() => toggleImpact(id)}
                      />
                      {t(`esg.impact.${id}` as any)}
                    </label>
                  ))}
                </div>
              </div>
            )}
          </div>
        </>
      )}

      {error && <p className="text-sm text-red-600 font-medium">{error}</p>}
      <Button variant="primary" size="lg" className="w-full" onClick={handleNext}>
        {t("esg.nextBtn")}
      </Button>
    </div>
  );
}
