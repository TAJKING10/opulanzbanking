"use client";
import * as React from "react";
import { ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { IATFormData, ProductKnowledge, ProductEntry, TrueFalseNS, OpsPerYear, VolumeOps } from "./iat-types";
import { defaultProductEntry } from "./iat-types";

interface Props {
  formData: IATFormData;
  onChange: (data: Partial<IATFormData>) => void;
  onNext: () => void;
  error: string;
  setError: (e: string) => void;
}

type ProductKey = keyof Omit<
  ProductKnowledge,
  "managedPortfolio" | "selfManaged" | "advisedPortfolio" | "financialSectorExp" | "readsPress" | "followsMarkets" | "checksMonthly"
>;

interface ProductConfig {
  key: ProductKey;
  label: string;
  holdingOptions: [string, string][];
  q1: string;
  q2: string;
}

const PRODUCTS: ProductConfig[] = [
  {
    key: "monetary",
    label: "Produits monétaires et fonds euros (Livret A, PEL, fonds euros, assurance vie)",
    holdingOptions: [["<4", "< 4 ans"], ["+4", "+ 4 ans"]],
    q1: "A moyen et long terme, les produits monétaires offrent une espérance de rendement inférieure à celle de certains actifs risqués.",
    q2: "A moyen et long terme, les produits monétaires font courir un risque de perte en capital plus limité que celui des actifs risqués.",
  },
  {
    key: "bonds",
    label: "Obligations et fonds obligataires (titres de créance, OPC obligataires)",
    holdingOptions: [["<4", "< 4 ans"], ["+4", "+ 4 ans"]],
    q1: "Plus la santé financière d'un émetteur est saine, plus le coupon versé sera élevé.",
    q2: "Un investissement sur ce type de placement présente un risque de perte en capital en raison du risque de défaut de l'émetteur.",
  },
  {
    key: "stocks",
    label: "Actions et fonds actions admis à la négociation sur marchés réglementés",
    holdingOptions: [["<4", "< 4 ans"], ["+4", "+ 4 ans"]],
    q1: "La valeur d'une action peut chuter à 0 EUR.",
    q2: "Un investissement sur ce type de placement présente un risque de perte en capital en raison du risque de défaut de l'émetteur.",
  },
  {
    key: "scpi",
    label: "SCPI (Société Civile de Placement Immobilier)",
    holdingOptions: [["<10", "< 10 ans"], ["+10", "+ 10 ans"]],
    q1: "L'investissement en SCPI permet de mutualiser les risques.",
    q2: "Les investisseurs qui souhaitent vendre leurs parts de SCPI doivent eux-mêmes trouver un nouvel acquéreur.",
  },
  {
    key: "privateEquity",
    label: "Private Equity (FCPI, FCPR, FIP)",
    holdingOptions: [["<8", "< 8 ans"], ["+8", "+ 8 ans"]],
    q1: "Investir dans ce type de produits est risqué et nécessite de conserver les parts pendant plus de 8 ans.",
    q2: "Un investissement sur ce type de placement présente un risque de perte en capital en raison du risque de défaut de l'émetteur.",
  },
  {
    key: "etf",
    label: "Fonds indiciels négociables en bourse (Trackers / ETF)",
    holdingOptions: [["<4", "< 4 ans"], ["+4", "+ 4 ans"]],
    q1: "Ce type d'instrument réplique exactement l'indice sur lequel il est adossé.",
    q2: "Je peux acheter ou vendre ce type d'instrument à tout moment de la journée, comme une action cotée.",
  },
  {
    key: "derivatives",
    label: "Produits dérivés (Options, futures, Warrants, Certificats)",
    holdingOptions: [["<4", "< 4 ans"], ["+4", "+ 4 ans"]],
    q1: "L'utilisation de ce type d'instrument peut augmenter mon risque de perte en capital.",
    q2: "Il est possible d'utiliser ce type d'instrument pour couvrir un risque spécifique dans un portefeuille.",
  },
  {
    key: "structured",
    label: "Produits structurés",
    holdingOptions: [["<4", "< 4 ans"], ["+4", "+ 4 ans"]],
    q1: "La valeur d'un produit structuré est-elle garantie en cas de rachat avant son échéance ?",
    q2: "Un produit structuré présente-t-il un risque de perte en capital au cours de vie et à l'échéance ?",
  },
];

function TFNGroup({
  name,
  question,
  value,
  onChange,
}: {
  name: string;
  question: string;
  value: TrueFalseNS;
  onChange: (v: TrueFalseNS) => void;
}) {
  return (
    <div className="space-y-1.5">
      <p className="text-xs text-brand-grayMed italic">{question}</p>
      <div className="flex gap-4">
        {(["vrai", "faux", "ne_sais_pas"] as TrueFalseNS[]).map((v) => (
          <label key={v} className="flex items-center gap-1.5 cursor-pointer text-xs">
            <input
              type="radio"
              name={name}
              checked={value === v}
              onChange={() => onChange(v)}
              className="accent-brand-gold"
            />
            {v === "vrai" ? "Vrai" : v === "faux" ? "Faux" : "Je ne sais pas"}
          </label>
        ))}
      </div>
    </div>
  );
}

function ProductCard({
  config,
  entry,
  onChange,
}: {
  config: ProductConfig;
  entry: ProductEntry;
  onChange: (d: Partial<ProductEntry>) => void;
}) {
  const [open, setOpen] = React.useState(false);
  const up = (field: keyof ProductEntry, val: unknown) =>
    onChange({ [field]: val } as Partial<ProductEntry>);

  return (
    <div className="rounded-xl border border-brand-grayLight overflow-hidden">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex w-full items-center justify-between gap-4 px-4 py-3 text-left hover:bg-gray-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-gold transition-colors"
      >
        <div className="flex items-center gap-3">
          <div className={`h-2.5 w-2.5 flex-shrink-0 rounded-full ${entry.held !== null ? "bg-brand-gold" : "bg-gray-300"}`} />
          <span className="text-sm font-medium text-brand-dark">{config.label}</span>
        </div>
        <ChevronDown
          className={`h-4 w-4 flex-shrink-0 text-brand-gold transition-transform ${open ? "rotate-180" : ""}`}
        />
      </button>

      {open && (
        <div className="border-t border-brand-grayLight px-4 py-4 space-y-4 bg-gray-50/50">
          {/* Held */}
          <div>
            <p className="text-xs font-semibold text-brand-grayMed mb-2">Avez-vous déjà détenu ce type de produit ?</p>
            <div className="flex gap-4">
              {([true, false] as const).map((v) => (
                <label key={String(v)} className="flex items-center gap-1.5 cursor-pointer text-sm">
                  <input
                    type="radio"
                    name={`held-${config.key}`}
                    checked={entry.held === v}
                    onChange={() => up("held", v)}
                    className="accent-brand-gold"
                  />
                  {v ? "Oui" : "Non"}
                </label>
              ))}
            </div>
          </div>

          {entry.held && (
            <>
              {/* Holding period */}
              <div>
                <p className="text-xs font-semibold text-brand-grayMed mb-2">Durée de détention</p>
                <div className="flex gap-4">
                  {config.holdingOptions.map(([val, lbl]) => (
                    <label key={val} className="flex items-center gap-1.5 cursor-pointer text-sm">
                      <input
                        type="radio"
                        name={`holding-${config.key}`}
                        checked={entry.holdingPeriod === val}
                        onChange={() => up("holdingPeriod", val)}
                        className="accent-brand-gold"
                      />
                      {lbl}
                    </label>
                  ))}
                </div>
              </div>

              {/* Operations per year */}
              <div>
                <p className="text-xs font-semibold text-brand-grayMed mb-2">Nombre d'opérations réalisées par an</p>
                <div className="flex gap-4">
                  {([["<1", "< 1 par an"], ["1-5", "1 à 5 par an"], ["6+", "Plus de 6 par an"]] as [OpsPerYear, string][]).map(([val, lbl]) => (
                    <label key={val} className="flex items-center gap-1.5 cursor-pointer text-sm">
                      <input
                        type="radio"
                        name={`ops-${config.key}`}
                        checked={entry.opsPerYear === val}
                        onChange={() => up("opsPerYear", val)}
                        className="accent-brand-gold"
                      />
                      {lbl}
                    </label>
                  ))}
                </div>
              </div>

              {/* Volume */}
              <div>
                <p className="text-xs font-semibold text-brand-grayMed mb-2">Volume des opérations en cours d'année</p>
                <div className="flex flex-wrap gap-3">
                  {([["<5k", "< 5 000 €"], ["5-10k", "5 000 – 10 000 €"], ["10-50k", "10 000 – 50 000 €"], [">50k", "> 50 000 €"]] as [VolumeOps, string][]).map(([val, lbl]) => (
                    <label key={val} className="flex items-center gap-1.5 cursor-pointer text-sm">
                      <input
                        type="radio"
                        name={`vol-${config.key}`}
                        checked={entry.volume === val}
                        onChange={() => up("volume", val)}
                        className="accent-brand-gold"
                      />
                      {lbl}
                    </label>
                  ))}
                </div>
              </div>
            </>
          )}

          {/* Knowledge questions */}
          <div className="space-y-3 pt-2 border-t border-brand-grayLight">
            <TFNGroup
              name={`q1-${config.key}`}
              question={config.q1}
              value={entry.q1}
              onChange={(v) => up("q1", v)}
            />
            <TFNGroup
              name={`q2-${config.key}`}
              question={config.q2}
              value={entry.q2}
              onChange={(v) => up("q2", v)}
            />
          </div>
        </div>
      )}
    </div>
  );
}

function YNRow({
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
    <div className="flex items-center justify-between py-2 border-b border-brand-grayLight last:border-0">
      <span className="text-sm">{label}</span>
      <div className="flex gap-4">
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

export function IATStepKnowledge({ formData, onChange, onNext, error, setError }: Props) {
  const pk = formData.productKnowledge;

  const updateProduct = (key: ProductKey, d: Partial<ProductEntry>) => {
    onChange({
      productKnowledge: {
        ...pk,
        [key]: { ...(pk[key] as ProductEntry), ...d },
      },
    });
  };

  const upPK = (field: keyof ProductKnowledge, val: unknown) =>
    onChange({ productKnowledge: { ...pk, [field]: val } });

  return (
    <div className="space-y-6">
      <div>
        <p className="text-xs text-brand-grayMed">
          Déroulez chaque produit pour indiquer votre expérience et répondre aux questions de
          connaissance. La mise en place de votre profil de risque dépend de vos réponses.
        </p>
      </div>

      {/* Product cards */}
      <div className="space-y-2">
        {PRODUCTS.map((config) => (
          <ProductCard
            key={config.key}
            config={config}
            entry={pk[config.key] as ProductEntry}
            onChange={(d) => updateProduct(config.key, d)}
          />
        ))}
      </div>

      {/* Portfolio management */}
      <div className="rounded-xl border border-brand-grayLight overflow-hidden">
        <div className="bg-brand-dark/5 px-4 py-2.5">
          <p className="text-xs font-bold text-brand-dark uppercase tracking-wide">Gestion du portefeuille</p>
        </div>
        <div className="px-4 py-3">
          <YNRow label="Avez-vous (ou avez-vous déjà eu) un portefeuille géré sous mandat ?" name="managed" value={pk.managedPortfolio} onChange={(v) => upPK("managedPortfolio", v)} />
          <YNRow label="Gérez-vous (ou avez-vous géré) vous-même votre portefeuille ?" name="self-managed" value={pk.selfManaged} onChange={(v) => upPK("selfManaged", v)} />
          <YNRow label="Gérez-vous votre portefeuille avec l'aide d'un conseiller ?" name="advised" value={pk.advisedPortfolio} onChange={(v) => upPK("advisedPortfolio", v)} />
          <YNRow label="Avez-vous exercé pendant au moins un an dans le secteur financier une position professionnelle exigeant une connaissance des investissements ?" name="fin-sector" value={pk.financialSectorExp} onChange={(v) => upPK("financialSectorExp", v)} />
        </div>
      </div>

      {/* Financial culture */}
      <div className="rounded-xl border border-brand-grayLight overflow-hidden">
        <div className="bg-brand-dark/5 px-4 py-2.5">
          <p className="text-xs font-bold text-brand-dark uppercase tracking-wide">Culture financière</p>
        </div>
        <div className="px-4 py-3">
          <YNRow label="Lisez-vous la presse ou l'actualité financière spécialisée ?" name="reads-press" value={pk.readsPress} onChange={(v) => upPK("readsPress", v)} />
          <YNRow label="Regardez-vous régulièrement les cours de la Bourse ?" name="follows-markets" value={pk.followsMarkets} onChange={(v) => upPK("followsMarkets", v)} />
          <YNRow label="Regardez-vous au moins tous les mois vos relevés bancaires ?" name="checks-monthly" value={pk.checksMonthly} onChange={(v) => upPK("checksMonthly", v)} />
        </div>
      </div>

      {error && <p className="text-sm text-red-600 font-medium">{error}</p>}
      <Button variant="primary" size="lg" className="w-full" onClick={onNext}>
        Suivant — Objectifs & risque
      </Button>
    </div>
  );
}
