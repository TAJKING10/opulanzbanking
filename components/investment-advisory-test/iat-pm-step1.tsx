"use client";
import * as React from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import type {
  IATFormData,
  CompanyIdentity,
  LegalRepresentative,
  CompanySector,
  SECTOR_LABELS,
} from "./iat-types";
import { SECTOR_LABELS as SECTORS } from "./iat-types";

interface Props {
  formData: IATFormData;
  onChange: (data: Partial<IATFormData>) => void;
  onNext: () => void;
  error: string;
  setError: (e: string) => void;
}

function RepForm({
  label,
  data,
  onChange,
}: {
  label: string;
  data: LegalRepresentative;
  onChange: (d: Partial<LegalRepresentative>) => void;
}) {
  const up = (field: keyof LegalRepresentative, val: unknown) =>
    onChange({ [field]: val } as Partial<LegalRepresentative>);

  return (
    <div className="space-y-3">
      <h4 className="text-xs font-bold text-brand-grayMed uppercase tracking-wide">{label}</h4>
      <div className="grid grid-cols-3 gap-3">
        <div>
          <Label>Nom</Label>
          <Input value={data.lastName} onChange={(e) => up("lastName", e.target.value)} className="mt-1" />
        </div>
        <div>
          <Label>Prénom</Label>
          <Input value={data.firstName} onChange={(e) => up("firstName", e.target.value)} className="mt-1" />
        </div>
        <div>
          <Label>Fonction</Label>
          <Input value={data.function} onChange={(e) => up("function", e.target.value)} className="mt-1" />
        </div>
        <div>
          <Label>Téléphone</Label>
          <Input type="tel" value={data.phone} onChange={(e) => up("phone", e.target.value)} className="mt-1" />
        </div>
        <div>
          <Label>Email</Label>
          <Input type="email" value={data.email} onChange={(e) => up("email", e.target.value)} className="mt-1" />
        </div>
        <div>
          <Label>PPE ?</Label>
          <div className="flex gap-3 mt-2">
            {([true, false] as const).map((v) => (
              <label key={String(v)} className="flex items-center gap-1.5 cursor-pointer text-sm">
                <input
                  type="radio"
                  name={`pep-${label}`}
                  checked={data.isPEP === v}
                  onChange={() => up("isPEP", v)}
                  className="accent-brand-gold"
                />
                {v ? "Oui" : "Non"}
              </label>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export function IATpmStep1({ formData, onChange, onNext, error, setError }: Props) {
  const ci = formData.companyIdentity;
  const up = (field: keyof CompanyIdentity, val: unknown) =>
    onChange({ companyIdentity: { ...ci, [field]: val } });

  const toggleSector = (s: CompanySector) => {
    const prev = ci.sectors;
    const next = prev.includes(s) ? prev.filter((x) => x !== s) : [...prev, s];
    up("sectors", next);
  };

  const handleNext = () => {
    if (!ci.companyName.trim()) { setError("La dénomination de la société est requise."); return; }
    if (!ci.legalForm.trim()) { setError("La forme juridique est requise."); return; }
    if (!ci.rcs.trim()) { setError("Le numéro d'identification (RCS) est requis."); return; }
    if (!ci.representative.lastName.trim()) { setError("Le nom du représentant légal est requis."); return; }
    if (!ci.representative.email.trim()) { setError("L'email du représentant légal est requis."); return; }
    setError("");
    onNext();
  };

  return (
    <div className="space-y-8">
      <div className="rounded-xl bg-amber-50 border border-amber-200 px-4 py-3 text-xs text-amber-800">
        <strong>Mise en garde.</strong> Ce questionnaire doit être renseigné et signé par le représentant
        légal de la personne morale, disposant de l'intégralité des autorisations nécessaires.
      </div>

      {/* Company info */}
      <div className="space-y-4">
        <h3 className="font-semibold text-brand-dark text-sm border-b border-brand-grayLight pb-2">
          Présentation de la personne morale
        </h3>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <Label>Dénomination *</Label>
            <Input value={ci.companyName} onChange={(e) => up("companyName", e.target.value)} className="mt-1" />
          </div>
          <div>
            <Label>Forme juridique *</Label>
            <Input value={ci.legalForm} onChange={(e) => up("legalForm", e.target.value)} className="mt-1" placeholder="SAS, SARL, SA, SCI…" />
          </div>
        </div>
        <div>
          <Label>Adresse / Siège social</Label>
          <Input value={ci.address} onChange={(e) => up("address", e.target.value)} className="mt-1" />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <Label>Pays</Label>
            <Input value={ci.country} onChange={(e) => up("country", e.target.value)} className="mt-1" placeholder="France" />
          </div>
          <div>
            <Label>N° d'identification (RCS) *</Label>
            <Input value={ci.rcs} onChange={(e) => up("rcs", e.target.value)} className="mt-1" placeholder="123 456 789" />
          </div>
        </div>

        {/* Sectors */}
        <div>
          <Label>Secteur(s) d'activité</Label>
          <div className="mt-2 grid grid-cols-2 gap-2">
            {(Object.entries(SECTORS) as [CompanySector, string][]).map(([key, lbl]) => (
              <label key={key} className="flex items-center gap-2 cursor-pointer text-sm">
                <Checkbox
                  checked={ci.sectors.includes(key)}
                  onCheckedChange={() => toggleSector(key)}
                />
                {lbl}
              </label>
            ))}
          </div>
          {ci.sectors.includes("autre") && (
            <Input
              value={ci.sectorOther}
              onChange={(e) => up("sectorOther", e.target.value)}
              className="mt-2"
              placeholder="Précisez le secteur"
            />
          )}
        </div>

        {/* Geo zone */}
        <div>
          <Label>Zone géographique de l'activité</Label>
          <div className="flex gap-4 mt-2">
            {[["EU", "Union européenne"], ["Non-EU", "Hors UE"], ["Both", "Les deux"]].map(([val, lbl]) => (
              <label key={val} className="flex items-center gap-2 cursor-pointer text-sm">
                <input
                  type="radio"
                  name="geo-zone"
                  checked={ci.geoZone === val}
                  onChange={() => up("geoZone", val)}
                  className="accent-brand-gold"
                />
                {lbl}
              </label>
            ))}
          </div>
          {(ci.geoZone === "Non-EU" || ci.geoZone === "Both") && (
            <Input
              value={ci.geoZoneOther}
              onChange={(e) => up("geoZoneOther", e.target.value)}
              className="mt-2"
              placeholder="Précisez les pays"
            />
          )}
        </div>

        {/* Regulated */}
        <div>
          <Label>L'activité est-elle réglementée ?</Label>
          <div className="flex gap-4 mt-2">
            {([true, false] as const).map((v) => (
              <label key={String(v)} className="flex items-center gap-2 cursor-pointer text-sm">
                <input
                  type="radio"
                  name="regulated"
                  checked={ci.isRegulated === v}
                  onChange={() => up("isRegulated", v)}
                  className="accent-brand-gold"
                />
                {v ? "Oui" : "Non"}
              </label>
            ))}
          </div>
          {ci.isRegulated && (
            <Input
              value={ci.regulator}
              onChange={(e) => up("regulator", e.target.value)}
              className="mt-2"
              placeholder="Régulateur / Autorité de tutelle"
            />
          )}
        </div>

        {/* Listed */}
        <div>
          <Label>La société est-elle cotée ?</Label>
          <div className="flex gap-4 mt-2">
            {([true, false] as const).map((v) => (
              <label key={String(v)} className="flex items-center gap-2 cursor-pointer text-sm">
                <input
                  type="radio"
                  name="listed"
                  checked={ci.isListed === v}
                  onChange={() => up("isListed", v)}
                  className="accent-brand-gold"
                />
                {v ? "Oui" : "Non"}
              </label>
            ))}
          </div>
          {ci.isListed && (
            <Input
              value={ci.markets}
              onChange={(e) => up("markets", e.target.value)}
              className="mt-2"
              placeholder="Marché(s) de cotation"
            />
          )}
        </div>
      </div>

      {/* Representatives */}
      <div className="space-y-6">
        <h3 className="font-semibold text-brand-dark text-sm border-b border-brand-grayLight pb-2">
          Personnes habilitées
        </h3>
        <RepForm
          label="Représentant légal / Signataire *"
          data={ci.representative}
          onChange={(d) => up("representative", { ...ci.representative, ...d })}
        />
        <RepForm
          label="Associé / Second signataire (optionnel)"
          data={ci.associate2}
          onChange={(d) => up("associate2", { ...ci.associate2, ...d })}
        />
      </div>

      {/* FATCA */}
      <div>
        <Label>Un des actionnaires de la société est-il américain (US Person) ?</Label>
        <div className="flex gap-4 mt-2">
          {([true, false] as const).map((v) => (
            <label key={String(v)} className="flex items-center gap-2 cursor-pointer text-sm">
              <input
                type="radio"
                name="fatca-pm"
                checked={ci.hasUSPerson === v}
                onChange={() => up("hasUSPerson", v)}
                className="accent-brand-gold"
              />
              {v ? "OUI" : "NON"}
            </label>
          ))}
        </div>
      </div>

      {error && <p className="text-sm text-red-600 font-medium">{error}</p>}
      <Button variant="primary" size="lg" className="w-full" onClick={handleNext}>
        Suivant — Situation financière
      </Button>
    </div>
  );
}
