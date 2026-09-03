"use client";
import * as React from "react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { CheckCircle, ChevronDown, Loader2 } from "lucide-react";
import { useTranslations } from "next-intl";
import type { IATFormData, Consents } from "./iat-types";
import { SECTOR_LABELS } from "./iat-types";

interface Props {
  formData: IATFormData;
  onSign: () => void;
  isGeneratingPdf?: boolean;
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

function makeRow(yesLabel: string, noLabel: string) {
  return function Row({ label, value }: { label: string; value: string | boolean | null | undefined }) {
    if (value === null || value === undefined || value === "") return null;
    return (
      <div className="flex items-start justify-between gap-4 py-1.5 border-b border-brand-grayLight/60 last:border-0">
        <span className="text-xs font-medium text-brand-grayMed flex-shrink-0 w-44">{label}</span>
        <span className="text-xs text-brand-dark text-right">
          {typeof value === "boolean" ? (value ? yesLabel : noLabel) : value}
        </span>
      </div>
    );
  };
}

export function IATStepReview({ formData, onSign, isGeneratingPdf, error, setError, onChange }: Props) {
  const t = useTranslations("iat");
  const Row = makeRow(t("review.yes"), t("review.no"));
  const { clientType, titulaire1, titulaire2, hasTitulaire2, maritalStatus,
    personalFinancial, companyIdentity, companyFinancial, productKnowledge,
    objectives, esg, consents } = formData;

  const OBJECTIVE_LABELS: Record<string, string> = {
    capitalPreservation: t("objectives.capitalPreservation"),
    capitalGrowth: t("objectives.capitalGrowth"),
    diversification: t("objectives.diversification"),
    incomeSearch: t("objectives.incomeSearch"),
    transmission: t("objectives.transmission"),
    taxOptimization: t("objectives.taxOptimization"),
  };

  const HORIZON_LABELS: Record<string, string> = {
    "<1": t("review.horizonBelow1"),
    "1-3": t("review.horizon1to3"),
    "3-5": t("review.horizon3to5"),
    ">5": t("review.horizonAbove5"),
  };

  const LOSS_LABELS: Record<string, string> = {
    none: t("review.maxLossNone"),
    "10": t("review.maxLoss10"),
    "25": t("review.maxLoss25"),
    "50": t("review.maxLoss50"),
    "100": t("review.maxLoss100"),
  };

  const RISK_LABELS: Record<string, string> = {
    A: t("review.riskA"),
    B: t("review.riskB"),
    C: t("review.riskC"),
  };

  const upConsent = (field: keyof Consents, val: boolean) =>
    onChange({ consents: { ...consents, [field]: val } });

  const allConsents = consents.answersAccurate && consents.receivedInfo && consents.amlConsent && consents.gdprConsent;

  const handleSign = () => {
    if (!allConsents) {
      setError(t("review.errConsents"));
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

  const getCivilityLabel = (civility?: string) => {
    if (civility === "M") return t("ppStep1.mr");
    if (civility === "Mme") return t("ppStep1.mrs");
    return civility || "";
  };

  return (
    <div className="space-y-4">
      <div className="rounded-xl bg-blue-50 border border-blue-200 px-4 py-3 text-xs text-blue-900">
        {t("review.infoBox")}
      </div>

      {/* Identity / Company */}
      {isPersonal ? (
        <Section title={t("review.sectionIdentityPP")}>
          <Row label={t("review.fullName")} value={`${getCivilityLabel(titulaire1.civility)} ${titulaire1.firstName} ${titulaire1.lastName}`.trim()} />
          <Row label={t("review.birthDate")} value={titulaire1.birthDate} />
          <Row label={t("review.nationality")} value={titulaire1.nationality} />
          <Row label={t("review.email")} value={titulaire1.email} />
          <Row label={t("review.phone")} value={titulaire1.phone} />
          <Row label={t("review.address")} value={titulaire1.address} />
          <Row label={t("review.fiscalResidence")} value={titulaire1.fiscalResidence === "France" ? "France" : titulaire1.fiscalResidenceOther} />
          <Row label={t("review.usPerson")} value={titulaire1.isUSPerson} />
          <Row label={t("review.profession")} value={titulaire1.profession} />
          <Row label={t("review.maritalStatus")} value={maritalStatus.status} />
          <Row label={t("review.children")} value={maritalStatus.numberOfChildren ? `${maritalStatus.numberOfChildren} (dont ${maritalStatus.childrenAtCharge} à charge)` : undefined} />
          {hasTitulaire2 && (
            <>
              <div className="pt-2 mt-2 border-t border-brand-grayLight">
                <p className="text-xs font-bold text-brand-grayMed uppercase">{t("review.titulaire2Label")}</p>
              </div>
              <Row label={t("review.fullName")} value={`${getCivilityLabel(titulaire2.civility)} ${titulaire2.firstName} ${titulaire2.lastName}`.trim()} />
              <Row label={t("review.email")} value={titulaire2.email} />
              <Row label={t("review.profession")} value={titulaire2.profession} />
            </>
          )}
        </Section>
      ) : (
        <Section title={t("review.sectionIdentityPM")}>
          <Row label={t("review.companyName")} value={companyIdentity.companyName} />
          <Row label={t("review.legalForm")} value={companyIdentity.legalForm} />
          <Row label={t("review.rcs")} value={companyIdentity.rcs} />
          <Row label={t("review.registeredOffice")} value={companyIdentity.address} />
          <Row label={t("review.country")} value={companyIdentity.country} />
          <Row label={t("review.sectors")} value={companyIdentity.sectors.map((s) => SECTOR_LABELS[s]).join(", ")} />
          <Row label={t("review.geoZone")} value={companyIdentity.geoZone} />
          <Row label={t("review.regulated")} value={companyIdentity.isRegulated} />
          <Row label={t("review.listed")} value={companyIdentity.isListed} />
          <Row label={t("review.legalRep")} value={`${companyIdentity.representative.firstName} ${companyIdentity.representative.lastName} — ${companyIdentity.representative.function}`} />
          <Row label={t("review.repEmail")} value={companyIdentity.representative.email} />
          <Row label={t("review.usPersonShareholder")} value={companyIdentity.hasUSPerson} />
        </Section>
      )}

      {/* Financial */}
      <Section title={t("review.sectionFinancial")}>
        {isPersonal ? (
          <>
            <Row label={t("review.annualIncome")} value={personalFinancial.t1Income} />
            <Row label={t("review.patrimony")} value={personalFinancial.t1Patrimony} />
            <Row label={t("review.amountToInvest")} value={personalFinancial.amountToInvest} />
            <Row label={t("review.fundNature")} value={personalFinancial.fundNature} />
            <Row label={t("review.fundOrigins")} value={personalFinancial.fundOrigins.join(", ")} />
            <Row label={t("review.bankOrigin")} value={personalFinancial.bankOrigin} />
            <Row label={t("review.taxIR")} value={personalFinancial.t1IR} />
            <Row label={t("review.taxIFI")} value={personalFinancial.t1IFI} />
          </>
        ) : (
          <>
            <Row label={t("review.totalBalance")} value={companyFinancial.totalBalance} />
            <Row label={t("review.revenue")} value={companyFinancial.revenue} />
            <Row label={t("review.equity")} value={companyFinancial.equity} />
            <Row label={t("review.taxType")} value={companyFinancial.taxType} />
            <Row label={t("review.amountToInvest")} value={companyFinancial.amountToInvest} />
            <Row label={t("review.fundNature")} value={companyFinancial.fundNature} />
            <Row label={t("review.fundingModality")} value={companyFinancial.fundingModality} />
          </>
        )}
      </Section>

      {/* Knowledge summary */}
      <Section title={t("review.sectionKnowledge")}>
        {[
          [t("review.productMonetary"), productKnowledge.monetary.held],
          [t("review.productBonds"), productKnowledge.bonds.held],
          [t("review.productStocks"), productKnowledge.stocks.held],
          [t("review.productScpi"), productKnowledge.scpi.held],
          [t("review.productPrivateEquity"), productKnowledge.privateEquity.held],
          [t("review.productEtf"), productKnowledge.etf.held],
          [t("review.productDerivatives"), productKnowledge.derivatives.held],
          [t("review.productStructured"), productKnowledge.structured.held],
        ].map(([lbl, val]) => (
          <Row key={lbl as string} label={lbl as string} value={val === null ? t("review.notFilled") : val ? t("review.held") : t("review.notHeld")} />
        ))}
        <Row label={t("review.managedPortfolio")} value={productKnowledge.managedPortfolio} />
        <Row label={t("review.selfManaged")} value={productKnowledge.selfManaged} />
        <Row label={t("review.financialSectorExp")} value={productKnowledge.financialSectorExp} />
      </Section>

      {/* Objectives */}
      <Section title={t("review.sectionObjectives")}>
        <Row label={t("review.objectives")} value={selectedObjectives || "—"} />
        <Row label={t("review.riskProfile")} value={objectives.riskProfile ? RISK_LABELS[objectives.riskProfile] : "—"} />
        <Row label={t("review.pastLoss")} value={objectives.pastLoss || "—"} />
        <Row label={t("review.horizon")} value={objectives.horizon ? HORIZON_LABELS[objectives.horizon] : "—"} />
        <Row label={t("review.liquidityNeeded")} value={objectives.liquidityNeeded} />
        <Row label={t("review.maxLoss")} value={objectives.maxLoss ? LOSS_LABELS[objectives.maxLoss] : "—"} />
        <Row label={t("review.patrimonyPct")} value={objectives.percentOfPatrimony || "—"} />
      </Section>

      {/* ESG */}
      <Section title={t("review.sectionESG")}>
        <Row label={t("review.esgWanted")} value={esg.wantsESG} />
        {esg.wantsESG && (
          <>
            <Row label={t("review.taxonomyPct")} value={esg.taxonomyPct ? `≥ ${esg.taxonomyPct} %` : t("review.maxLossNone")} />
            <Row label={t("review.sustainablePct")} value={esg.sustainablePct ? `≥ ${esg.sustainablePct} %` : t("review.maxLossNone")} />
            <Row label={t("review.impactFactors")} value={esg.impactFactors} />
            {esg.negativeImpacts.length > 0 && (
              <Row label={t("review.negativeImpacts")} value={esg.negativeImpacts.join(", ")} />
            )}
          </>
        )}
      </Section>

      {/* Appointment */}
      <Section title={t("review.sectionAppointment")}>
        <Row label={t("review.appointmentBooked")} value={formData.appointment.booked ? t("review.appointmentBookedYes") : t("review.appointmentBookedNo")} />
      </Section>

      {/* Consents */}
      <div className="rounded-xl border-2 border-brand-grayLight p-5 space-y-4">
        <h3 className="font-bold text-brand-dark">{t("review.consentsTitle")}</h3>
        {([
          { field: "answersAccurate" as keyof Consents, label: t("review.consent1") },
          { field: "receivedInfo" as keyof Consents, label: t("review.consent2") },
          { field: "amlConsent" as keyof Consents, label: t("review.consent3") },
          { field: "gdprConsent" as keyof Consents, label: t("review.consent4") },
        ]).map(({ field, label }) => (
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
          {t("review.readyToSign")}
        </p>
        <p className="text-xs text-brand-grayMed">
          {t("review.signInfo")}
        </p>
      </div>

      {error && <p className="text-sm text-red-600 font-medium text-center">{error}</p>}

      <Button
        variant="primary"
        size="lg"
        className="w-full"
        onClick={handleSign}
        disabled={!allConsents || isGeneratingPdf}
      >
        {isGeneratingPdf ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            {t("review.generating")}
          </>
        ) : (
          t("review.signBtn")
        )}
      </Button>
    </div>
  );
}
