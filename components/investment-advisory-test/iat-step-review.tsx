"use client";
import * as React from "react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { CheckCircle, ChevronDown } from "lucide-react";
import type { IATFormData, Consents } from "./iat-types";
import { SECTOR_LABELS } from "./iat-types";

interface Props {
  formData: IATFormData;
  onSign: () => void;
  error: string;
  setError: (e: string) => void;
  onChange: (data: Partial<IATFormData>) => void;
}

function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  const [open, setOpen] = React.useState(true);
  return (
    <div className="rounded-xl border border-brand-grayLight overflow-hidden">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex w-full items-center justify-between px-4 py-3 bg-brand-dark/5 hover:bg-brand-dark/10 transition-colors focus:outline-none"
      >
        <span className="text-sm font-bold text-brand-dark">{title}</span>
        <ChevronDown className={`h-4 w-4 text-brand-gold transition-transform ${open ? "rotate-180" : ""}`} />
      </button>
      {open && <div className="px-4 py-4 space-y-2">{children}</div>}
    </div>
  );
}

function Row({ label, value }: { label: string; value: string | boolean | null | undefined }) {
  if (value === null || value === undefined || value === "") return null;
  return (
    <div className="flex items-start justify-between gap-4 py-1.5 border-b border-brand-grayLight/60 last:border-0">
      <span className="text-xs font-medium text-brand-grayMed flex-shrink-0 w-44">{label}</span>
      <span className="text-xs text-brand-dark text-right">
        {typeof value === "boolean" ? (value ? "Oui" : "Non") : value}
      </span>
    </div>
  );
}

const OBJECTIVE_LABELS: Record<string, string> = {
  capitalPreservation: "Préservation du capital",
  capitalGrowth: "Valorisation du capital",
  diversification: "Diversification des actifs",
  incomeSearch: "Recherche de revenus",
  transmission: "Transmission patrimoniale",
  taxOptimization: "Optimisation fiscale",
};

const HORIZON_LABELS: Record<string, string> = {
  "<1": "< 1 an",
  "1-3": "1 à 3 ans",
  "3-5": "3 à 5 ans",
  ">5": "> 5 ans",
};

const LOSS_LABELS: Record<string, string> = {
  none: "Aucune perte",
  "10": "Maximum 10 %",
  "25": "Maximum 25 %",
  "50": "Maximum 50 %",
  "100": "Jusqu'à 100 %",
};

const RISK_LABELS: Record<string, string> = {
  A: "Placement A — Risque faible",
  B: "Placement B — Risque moyen",
  C: "Placement C — Risque élevé",
};

export function IATStepReview({ formData, onSign, error, setError, onChange }: Props) {
  const { clientType, titulaire1, titulaire2, hasTitulaire2, maritalStatus,
    personalFinancial, companyIdentity, companyFinancial, productKnowledge,
    objectives, esg, consents } = formData;

  const upConsent = (field: keyof Consents, val: boolean) =>
    onChange({ consents: { ...consents, [field]: val } });

  const allConsents = consents.answersAccurate && consents.receivedInfo && consents.amlConsent && consents.gdprConsent;

  const handleSign = () => {
    if (!allConsents) {
      setError("Veuillez cocher toutes les cases de déclaration avant de signer.");
      return;
    }
    setError("");
    onSign();
  };

  const isPersonal = clientType === "personal";

  const selectedObjectives = Object.entries(OBJECTIVE_LABELS)
    .filter(([key]) => objectives[key as keyof typeof objectives])
    .map(([, lbl]) => lbl)
    .join(", ");

  return (
    <div className="space-y-4">
      <div className="rounded-xl bg-blue-50 border border-blue-200 px-4 py-3 text-xs text-blue-900">
        Veuillez vérifier les informations ci-dessous avant de signer. Vous pouvez revenir en
        arrière à tout moment pour corriger une réponse.
      </div>

      {/* Identity / Company */}
      {isPersonal ? (
        <Section title="Titulaire 1 — Identité">
          <Row label="Nom complet" value={`${titulaire1.civility} ${titulaire1.firstName} ${titulaire1.lastName}`.trim()} />
          <Row label="Date de naissance" value={titulaire1.birthDate} />
          <Row label="Nationalité" value={titulaire1.nationality} />
          <Row label="Email" value={titulaire1.email} />
          <Row label="Téléphone" value={titulaire1.phone} />
          <Row label="Adresse" value={titulaire1.address} />
          <Row label="Résidence fiscale" value={titulaire1.fiscalResidence === "France" ? "France" : titulaire1.fiscalResidenceOther} />
          <Row label="US Person" value={titulaire1.isUSPerson} />
          <Row label="Profession" value={titulaire1.profession} />
          <Row label="Situation" value={maritalStatus.status} />
          <Row label="Enfants" value={maritalStatus.numberOfChildren ? `${maritalStatus.numberOfChildren} (dont ${maritalStatus.childrenAtCharge} à charge)` : undefined} />
          {hasTitulaire2 && (
            <>
              <div className="pt-2 mt-2 border-t border-brand-grayLight">
                <p className="text-xs font-bold text-brand-grayMed uppercase">Titulaire 2</p>
              </div>
              <Row label="Nom complet" value={`${titulaire2.civility} ${titulaire2.firstName} ${titulaire2.lastName}`.trim()} />
              <Row label="Email" value={titulaire2.email} />
              <Row label="Profession" value={titulaire2.profession} />
            </>
          )}
        </Section>
      ) : (
        <Section title="Identification société">
          <Row label="Dénomination" value={companyIdentity.companyName} />
          <Row label="Forme juridique" value={companyIdentity.legalForm} />
          <Row label="RCS" value={companyIdentity.rcs} />
          <Row label="Adresse siège" value={companyIdentity.address} />
          <Row label="Pays" value={companyIdentity.country} />
          <Row label="Secteurs" value={companyIdentity.sectors.map((s) => SECTOR_LABELS[s]).join(", ")} />
          <Row label="Zone géographique" value={companyIdentity.geoZone} />
          <Row label="Activité réglementée" value={companyIdentity.isRegulated} />
          <Row label="Cotée" value={companyIdentity.isListed} />
          <Row label="Représentant légal" value={`${companyIdentity.representative.firstName} ${companyIdentity.representative.lastName} — ${companyIdentity.representative.function}`} />
          <Row label="Email représentant" value={companyIdentity.representative.email} />
          <Row label="US Person actionnaire" value={companyIdentity.hasUSPerson} />
        </Section>
      )}

      {/* Financial */}
      <Section title="Situation financière">
        {isPersonal ? (
          <>
            <Row label="Revenus annuels (T1)" value={personalFinancial.t1Income} />
            <Row label="Patrimoine estimé (T1)" value={personalFinancial.t1Patrimony} />
            <Row label="Montant à investir" value={personalFinancial.amountToInvest} />
            <Row label="Nature des avoirs" value={personalFinancial.fundNature} />
            <Row label="Origines des fonds" value={personalFinancial.fundOrigins.join(", ")} />
            <Row label="Banque d'origine" value={personalFinancial.bankOrigin} />
            <Row label="Imposition IR (T1)" value={personalFinancial.t1IR} />
            <Row label="Imposition IFI (T1)" value={personalFinancial.t1IFI} />
          </>
        ) : (
          <>
            <Row label="Total bilan" value={companyFinancial.totalBalance} />
            <Row label="Chiffre d'affaires" value={companyFinancial.revenue} />
            <Row label="Capitaux propres" value={companyFinancial.equity} />
            <Row label="Type d'imposition" value={companyFinancial.taxType} />
            <Row label="Montant à investir" value={companyFinancial.amountToInvest} />
            <Row label="Nature des avoirs" value={companyFinancial.fundNature} />
            <Row label="Modalité d'alimentation" value={companyFinancial.fundingModality} />
          </>
        )}
      </Section>

      {/* Knowledge summary */}
      <Section title="Connaissance & expérience">
        {[
          ["Produits monétaires", productKnowledge.monetary.held],
          ["Obligations", productKnowledge.bonds.held],
          ["Actions", productKnowledge.stocks.held],
          ["SCPI", productKnowledge.scpi.held],
          ["Private Equity", productKnowledge.privateEquity.held],
          ["ETF", productKnowledge.etf.held],
          ["Produits dérivés", productKnowledge.derivatives.held],
          ["Produits structurés", productKnowledge.structured.held],
        ].map(([lbl, val]) => (
          <Row key={lbl as string} label={lbl as string} value={val === null ? "Non renseigné" : val ? "Détenu" : "Non détenu"} />
        ))}
        <Row label="Portefeuille sous mandat" value={productKnowledge.managedPortfolio} />
        <Row label="Gestion en direct" value={productKnowledge.selfManaged} />
        <Row label="Expérience secteur financier" value={productKnowledge.financialSectorExp} />
      </Section>

      {/* Objectives */}
      <Section title="Objectifs & profil de risque">
        <Row label="Objectifs" value={selectedObjectives || "—"} />
        <Row label="Profil de risque" value={objectives.riskProfile ? RISK_LABELS[objectives.riskProfile] : "—"} />
        <Row label="Perte passée" value={objectives.pastLoss || "—"} />
        <Row label="Horizon" value={objectives.horizon ? HORIZON_LABELS[objectives.horizon] : "—"} />
        <Row label="Liquidité importante" value={objectives.liquidityNeeded} />
        <Row label="Perte maximale" value={objectives.maxLoss ? LOSS_LABELS[objectives.maxLoss] : "—"} />
        <Row label="% du patrimoine investi" value={objectives.percentOfPatrimony || "—"} />
      </Section>

      {/* ESG */}
      <Section title="Investissements durables">
        <Row label="Critères ESG souhaités" value={esg.wantsESG} />
        {esg.wantsESG && (
          <>
            <Row label="% Taxonomie UE" value={esg.taxonomyPct ? `≥ ${esg.taxonomyPct} %` : "Aucun"} />
            <Row label="% Investissements durables" value={esg.sustainablePct ? `≥ ${esg.sustainablePct} %` : "Aucun"} />
            <Row label="Facteurs d'impact" value={esg.impactFactors} />
            {esg.negativeImpacts.length > 0 && (
              <Row label="Incidences négatives" value={esg.negativeImpacts.join(", ")} />
            )}
          </>
        )}
      </Section>

      {/* Appointment */}
      <Section title="Rendez-vous">
        <Row label="Créneau confirmé" value={formData.appointment.booked ? "Oui — confirmation envoyée par email" : "Non confirmé"} />
      </Section>

      {/* Consents */}
      <div className="rounded-xl border-2 border-brand-grayLight p-5 space-y-4">
        <h3 className="font-bold text-brand-dark">Déclarations du client</h3>
        {[
          {
            field: "answersAccurate" as keyof Consents,
            label: "Je déclare que les réponses à ce questionnaire sont exactes et sincères, qu'elles correspondent à ma situation actuelle, et je m'engage à informer de toute modification significative pouvant intervenir dans le futur.",
          },
          {
            field: "receivedInfo" as keyof Consents,
            label: "J'ai reçu le document d'information préalable présentant le cabinet Advensys Insurance Finance.",
          },
          {
            field: "amlConsent" as keyof Consents,
            label: "Je suis pleinement informé(e) que le cabinet peut utiliser les informations demandées au titre de ses obligations légales en matière de lutte contre le blanchiment des capitaux et le financement du terrorisme.",
          },
          {
            field: "gdprConsent" as keyof Consents,
            label: "J'ai pris connaissance de la politique de protection des données personnelles (RGPD) et consens au traitement de mes données aux fins décrites dans ce questionnaire.",
          },
        ].map(({ field, label }) => (
          <div
            key={field}
            className={`rounded-xl border-2 p-3 transition-all ${consents[field] ? "border-brand-gold bg-brand-gold/5" : "border-brand-grayLight"}`}
          >
            <label className="flex items-start gap-3 cursor-pointer">
              <Checkbox
                checked={consents[field]}
                onCheckedChange={(v) => upConsent(field, !!v)}
                className="mt-0.5"
              />
              <span className="text-xs leading-snug text-brand-dark">
                {label} <span className="text-red-500">*</span>
              </span>
            </label>
          </div>
        ))}
      </div>

      {/* Sign CTA */}
      <div className="rounded-xl bg-brand-dark/5 border border-brand-grayLight p-4 text-center space-y-3">
        <div className="flex justify-center">
          <CheckCircle className="h-8 w-8 text-brand-gold" />
        </div>
        <p className="text-sm font-bold text-brand-dark">
          Prêt(e) à signer votre questionnaire ?
        </p>
        <p className="text-xs text-brand-grayMed">
          Votre signature électronique certifie l'exactitude des informations fournies. Le questionnaire
          complété sera transmis à votre conseiller Advensys Insurance Finance.
        </p>
      </div>

      {error && <p className="text-sm text-red-600 font-medium text-center">{error}</p>}

      <Button
        variant="primary"
        size="lg"
        className="w-full"
        onClick={handleSign}
        disabled={!allConsents}
      >
        Signer le questionnaire
      </Button>
    </div>
  );
}
