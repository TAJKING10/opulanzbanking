"use client";
import * as React from "react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { useTranslations } from "next-intl";
import type { IATFormData, ObjectivesData, RiskProfile, Horizon, MaxLoss, PatrimonyPct, PastLoss } from "./iat-types";

interface Props {
  formData: IATFormData;
  onChange: (data: Partial<IATFormData>) => void;
  onNext: () => void;
  error: string;
  setError: (e: string) => void;
}

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
  const t = useTranslations("iat");
  const obj = formData.objectives;
  const up = (field: keyof ObjectivesData, val: unknown) =>
    onChange({ objectives: { ...obj, [field]: val } });

  const RISK_PROFILES = [
    {
      value: "A" as RiskProfile,
      label: t("objectives.profileA"),
      desc: t("objectives.profileADesc"),
      color: "border-green-400 bg-green-50",
      active: "border-green-500 bg-green-100 ring-2 ring-green-400",
    },
    {
      value: "B" as RiskProfile,
      label: t("objectives.profileB"),
      desc: t("objectives.profileBDesc"),
      color: "border-amber-400 bg-amber-50",
      active: "border-amber-500 bg-amber-100 ring-2 ring-amber-400",
    },
    {
      value: "C" as RiskProfile,
      label: t("objectives.profileC"),
      desc: t("objectives.profileCDesc"),
      color: "border-red-400 bg-red-50",
      active: "border-red-500 bg-red-100 ring-2 ring-red-400",
    },
  ] as const;

  const handleNext = () => {
    if (!obj.riskProfile) { setError(t("objectives.errRiskProfile")); return; }
    if (!obj.horizon) { setError(t("objectives.errHorizon")); return; }
    if (!obj.maxLoss) { setError(t("objectives.errMaxLoss")); return; }
    setError("");
    onNext();
  };

  return (
    <div className="space-y-8">
      {/* Objectives */}
      <div className="space-y-3">
        <div>
          <h3 className="text-sm font-semibold text-brand-dark">
            {t("objectives.objectivesTitle")}
          </h3>
          <p className="text-xs text-brand-grayMed mt-0.5">{t("objectives.objectivesSubtext")}</p>
        </div>
        <div className="grid grid-cols-2 gap-2">
          {([
            ["capitalPreservation", t("objectives.capitalPreservation")],
            ["capitalGrowth", t("objectives.capitalGrowth")],
            ["diversification", t("objectives.diversification")],
            ["incomeSearch", t("objectives.incomeSearch")],
            ["transmission", t("objectives.transmission")],
            ["taxOptimization", t("objectives.taxOptimization")],
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
          <label className="text-xs text-brand-grayMed">{t("objectives.otherObjective")}</label>
          <input
            type="text"
            value={obj.other}
            onChange={(e) => up("other", e.target.value)}
            className="mt-1 w-full rounded-xl border border-brand-grayLight px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-gold"
            placeholder={t("objectives.otherPlaceholder")}
          />
        </div>
      </div>

      {/* Risk profile */}
      <div className="space-y-3">
        <div>
          <h3 className="text-sm font-semibold text-brand-dark">
            {t("objectives.riskTitle")}
          </h3>
          <p className="text-xs text-brand-grayMed mt-0.5">
            {t("objectives.riskSubtext")}
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
        <h3 className="text-sm font-semibold text-brand-dark">
          {t("objectives.pastLossTitle")}
        </h3>
        <RadioGrid
          name="past-loss"
          options={[
            ["none", t("objectives.pastLossNone")],
            ["<10", t("objectives.pastLossBelow10")],
            ["10-20", t("objectives.pastLoss10to20")],
            [">20", t("objectives.pastLossAbove20")],
          ] as [PastLoss, string][]}
          value={obj.pastLoss}
          onChange={(v) => up("pastLoss", v)}
        />
        {obj.pastLoss === "none" && (
          <div className="space-y-2">
            <p className="text-xs font-medium text-brand-grayMed">
              {t("objectives.reactionNoPriorLabel")}
            </p>
            <RadioGrid
              name="reaction-no-prior"
              options={[
                ["re-invest", t("objectives.reInvest")],
                ["sell-all", t("objectives.sellAll")],
                ["sell-partial", t("objectives.sellPartial")],
                ["nothing", t("objectives.nothing")],
              ]}
              value={obj.reactionNoPriorLoss}
              onChange={(v) => up("reactionNoPriorLoss", v)}
            />
          </div>
        )}
        {obj.pastLoss && obj.pastLoss !== "none" && (
          <div className="space-y-2">
            <p className="text-xs font-medium text-brand-grayMed">
              {t("objectives.reactionPriorLabel")}
            </p>
            <RadioGrid
              name="reaction-prior"
              options={[
                ["re-invest", t("objectives.reInvestPast")],
                ["sell-all", t("objectives.sellAllPast")],
                ["sell-partial", t("objectives.sellPartialPast")],
                ["nothing", t("objectives.nothingPast")],
              ]}
              value={obj.reactionPriorLoss}
              onChange={(v) => up("reactionPriorLoss", v)}
            />
          </div>
        )}
      </div>

      {/* Gain reaction */}
      <div className="space-y-3">
        <h3 className="text-sm font-semibold text-brand-dark">
          {t("objectives.gainReactionTitle")}
        </h3>
        <RadioGrid
          name="gain-reaction"
          options={[
            ["hold", t("objectives.hold")],
            ["reinvest-less", t("objectives.reinvestLess")],
            ["reinvest-more", t("objectives.reinvestMore")],
          ]}
          value={obj.reactionToGain}
          onChange={(v) => up("reactionToGain", v as ObjectivesData["reactionToGain"])}
        />
      </div>

      {/* Horizon */}
      <div className="space-y-3">
        <h3 className="text-sm font-semibold text-brand-dark">
          {t("objectives.horizonTitle")}
        </h3>
        <RadioGrid
          name="horizon"
          options={[
            ["<1", t("objectives.horizonBelow1")],
            ["1-3", t("objectives.horizon1to3")],
            ["3-5", t("objectives.horizon3to5")],
            [">5", t("objectives.horizonAbove5")],
          ] as [Horizon, string][]}
          value={obj.horizon}
          onChange={(v) => up("horizon", v)}
        />
      </div>

      {/* Liquidity */}
      <div className="space-y-3">
        <h3 className="text-sm font-semibold text-brand-dark">
          {t("objectives.liquidityTitle")}
        </h3>
        <RadioGrid
          name="liquidity"
          options={[
            ["true", t("objectives.liquidityYes")],
            ["false", t("objectives.liquidityNo")],
          ]}
          value={obj.liquidityNeeded === null ? "" : String(obj.liquidityNeeded)}
          onChange={(v) => up("liquidityNeeded", v === "true")}
        />
      </div>

      {/* Max loss */}
      <div className="space-y-3">
        <h3 className="text-sm font-semibold text-brand-dark">
          {t("objectives.maxLossTitle")}
        </h3>
        <RadioGrid
          name="max-loss"
          options={[
            ["none", t("objectives.maxLossNone")],
            ["10", t("objectives.maxLoss10")],
            ["25", t("objectives.maxLoss25")],
            ["50", t("objectives.maxLoss50")],
            ["100", t("objectives.maxLoss100")],
          ] as [MaxLoss, string][]}
          value={obj.maxLoss}
          onChange={(v) => up("maxLoss", v)}
        />
      </div>

      {/* % of patrimony */}
      <div className="space-y-3">
        <h3 className="text-sm font-semibold text-brand-dark">
          {t("objectives.patrimonyPctTitle")}
        </h3>
        <RadioGrid
          name="patrimony-pct"
          options={[
            ["<10", t("objectives.patrimonyBelow10")],
            ["10-25", t("objectives.patrimony10to25")],
            ["25-50", t("objectives.patrimony25to50")],
            ["50-75", t("objectives.patrimony50to75")],
            [">75", t("objectives.patrimonyAbove75")],
          ] as [PatrimonyPct, string][]}
          value={obj.percentOfPatrimony}
          onChange={(v) => up("percentOfPatrimony", v)}
        />
      </div>

      {error && <p className="text-sm text-red-600 font-medium">{error}</p>}
      <Button variant="primary" size="lg" className="w-full" onClick={handleNext}>
        {t("objectives.nextBtn")}
      </Button>
    </div>
  );
}
