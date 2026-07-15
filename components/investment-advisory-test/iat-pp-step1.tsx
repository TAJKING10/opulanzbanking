"use client";
import * as React from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { Plus, Minus } from "lucide-react";
import type { IATFormData, Titulaire, MaritalStatus } from "./iat-types";

interface Props {
  formData: IATFormData;
  onChange: (data: Partial<IATFormData>) => void;
  onNext: () => void;
  error: string;
  setError: (e: string) => void;
}

function RadioGroup({
  name,
  options,
  value,
  onChange,
}: {
  name: string;
  options: [string, string][];
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <div className="flex flex-wrap gap-4 mt-2">
      {options.map(([val, lbl]) => (
        <label key={val} className="flex items-center gap-2 cursor-pointer text-sm">
          <input
            type="radio"
            name={name}
            checked={value === val}
            onChange={() => onChange(val)}
            className="accent-brand-gold"
          />
          {lbl}
        </label>
      ))}
    </div>
  );
}

function TitulaireForm({
  id,
  label,
  data,
  onChange,
}: {
  id: string;
  label: string;
  data: Titulaire;
  onChange: (d: Partial<Titulaire>) => void;
}) {
  const up = (field: keyof Titulaire, val: unknown) =>
    onChange({ [field]: val } as Partial<Titulaire>);

  return (
    <div className="space-y-4">
      <h3 className="font-semibold text-brand-dark text-sm border-b border-brand-grayLight pb-2">
        {label}
      </h3>

      <div className="grid grid-cols-3 gap-3">
        <div>
          <Label>Civilité</Label>
          <select
            value={data.civility}
            onChange={(e) => up("civility", e.target.value)}
            className="mt-1 w-full rounded-xl border border-brand-grayLight px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-gold bg-white"
          >
            <option value="">—</option>
            <option value="M">M.</option>
            <option value="Mme">Mme</option>
          </select>
        </div>
        <div>
          <Label>Nom *</Label>
          <Input
            value={data.lastName}
            onChange={(e) => up("lastName", e.target.value)}
            className="mt-1"
            placeholder="NOM"
          />
        </div>
        <div>
          <Label>Prénom(s) *</Label>
          <Input
            value={data.firstName}
            onChange={(e) => up("firstName", e.target.value)}
            className="mt-1"
            placeholder="Prénom"
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <Label>Nom de jeune fille</Label>
          <Input
            value={data.maidenName}
            onChange={(e) => up("maidenName", e.target.value)}
            className="mt-1"
          />
        </div>
        <div>
          <Label>Nationalité *</Label>
          <Input
            value={data.nationality}
            onChange={(e) => up("nationality", e.target.value)}
            className="mt-1"
            placeholder="Ex. : Française"
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <Label>Date de naissance *</Label>
          <Input
            type="date"
            value={data.birthDate}
            onChange={(e) => up("birthDate", e.target.value)}
            className="mt-1"
          />
        </div>
        <div>
          <Label>Lieu de naissance</Label>
          <Input
            value={data.birthPlace}
            onChange={(e) => up("birthPlace", e.target.value)}
            className="mt-1"
          />
        </div>
      </div>

      <div>
        <Label>Adresse complète *</Label>
        <Input
          value={data.address}
          onChange={(e) => up("address", e.target.value)}
          className="mt-1"
          placeholder="N° rue, code postal, ville, pays"
        />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <Label>Email *</Label>
          <Input
            type="email"
            value={data.email}
            onChange={(e) => up("email", e.target.value)}
            className="mt-1"
          />
        </div>
        <div>
          <Label>Téléphone *</Label>
          <Input
            type="tel"
            value={data.phone}
            onChange={(e) => up("phone", e.target.value)}
            className="mt-1"
          />
        </div>
      </div>

      <div>
        <Label>Résidence fiscale</Label>
        <RadioGroup
          name={`fiscal-${id}`}
          options={[["France", "France"], ["Other", "Autre"]]}
          value={data.fiscalResidence}
          onChange={(v) => up("fiscalResidence", v)}
        />
        {data.fiscalResidence === "Other" && (
          <Input
            value={data.fiscalResidenceOther}
            onChange={(e) => up("fiscalResidenceOther", e.target.value)}
            className="mt-2"
            placeholder="Pays de résidence fiscale"
          />
        )}
      </div>

      <div>
        <Label>Êtes-vous une personne américaine (US Person) ?</Label>
        <RadioGroup
          name={`fatca-${id}`}
          options={[["true", "OUI"], ["false", "NON"]]}
          value={data.isUSPerson === null ? "" : String(data.isUSPerson)}
          onChange={(v) => up("isUSPerson", v === "true")}
        />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <Label>Profession</Label>
          <Input
            value={data.profession}
            onChange={(e) => up("profession", e.target.value)}
            className="mt-1"
          />
        </div>
        <div className="flex items-end pb-1">
          <label className="flex items-center gap-2 cursor-pointer text-sm">
            <Checkbox
              checked={data.isRetired}
              onCheckedChange={(v) => up("isRetired", !!v)}
            />
            Retraite / Chômage
          </label>
        </div>
      </div>
      {data.isRetired && (
        <div className="grid grid-cols-2 gap-3">
          <div>
            <Label>Depuis le</Label>
            <Input
              type="date"
              value={data.retiredSince}
              onChange={(e) => up("retiredSince", e.target.value)}
              className="mt-1"
            />
          </div>
          <div>
            <Label>Ancienne profession</Label>
            <Input
              value={data.formerProfession}
              onChange={(e) => up("formerProfession", e.target.value)}
              className="mt-1"
            />
          </div>
        </div>
      )}

      <div>
        <label className="flex items-center gap-2 cursor-pointer text-sm font-medium">
          <Checkbox
            checked={data.isBusinessOwner}
            onCheckedChange={(v) => up("isBusinessOwner", !!v)}
          />
          Chef d'entreprise
        </label>
        {data.isBusinessOwner && (
          <div className="mt-3 grid grid-cols-2 gap-3">
            <div>
              <Label>Dénomination</Label>
              <Input
                value={data.companyName}
                onChange={(e) => up("companyName", e.target.value)}
                className="mt-1"
              />
            </div>
            <div>
              <Label>Forme juridique</Label>
              <Input
                value={data.companyLegalForm}
                onChange={(e) => up("companyLegalForm", e.target.value)}
                className="mt-1"
              />
            </div>
            <div className="col-span-2">
              <Label>Adresse siège social</Label>
              <Input
                value={data.companySiege}
                onChange={(e) => up("companySiege", e.target.value)}
                className="mt-1"
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function MaritalForm({
  data,
  onChange,
}: {
  data: MaritalStatus;
  onChange: (d: Partial<MaritalStatus>) => void;
}) {
  const up = (field: keyof MaritalStatus, val: unknown) =>
    onChange({ [field]: val } as Partial<MaritalStatus>);

  return (
    <div className="space-y-4">
      <h3 className="font-semibold text-brand-dark text-sm border-b border-brand-grayLight pb-2">
        Situation matrimoniale
      </h3>

      <RadioGroup
        name="marital-status"
        options={[
          ["married", "Marié(e)"],
          ["pacs", "Pacsé(e)"],
          ["divorced", "Divorcé(e)"],
          ["widowed", "Veuf(ve)"],
          ["single", "Célibataire"],
          ["freeUnion", "Union libre"],
        ]}
        value={data.status}
        onChange={(v) => up("status", v)}
      />

      {data.status === "married" && (
        <div className="grid grid-cols-2 gap-3">
          <div>
            <Label>Date du mariage</Label>
            <Input
              type="date"
              value={data.marriageDate}
              onChange={(e) => up("marriageDate", e.target.value)}
              className="mt-1"
            />
          </div>
          <div>
            <Label>Contrat de mariage</Label>
            <RadioGroup
              name="marriage-contract"
              options={[["true", "Oui"], ["false", "Non"]]}
              value={data.marriageContract === null ? "" : String(data.marriageContract)}
              onChange={(v) => up("marriageContract", v === "true")}
            />
          </div>
          {data.marriageContract && (
            <div className="col-span-2">
              <Label>Régime matrimonial</Label>
              <Input
                value={data.marriageRegime}
                onChange={(e) => up("marriageRegime", e.target.value)}
                className="mt-1"
                placeholder="Ex. : Communauté réduite aux acquêts"
              />
            </div>
          )}
        </div>
      )}

      {data.status === "pacs" && (
        <div className="grid grid-cols-2 gap-3">
          <div>
            <Label>Date du PACS</Label>
            <Input
              type="date"
              value={data.pacsDate}
              onChange={(e) => up("pacsDate", e.target.value)}
              className="mt-1"
            />
          </div>
          <div>
            <Label>Convention de PACS</Label>
            <RadioGroup
              name="pacs-convention"
              options={[["true", "Oui"], ["false", "Non"]]}
              value={data.pacsConvention === null ? "" : String(data.pacsConvention)}
              onChange={(v) => up("pacsConvention", v === "true")}
            />
          </div>
        </div>
      )}

      {data.status === "divorced" && (
        <div>
          <Label>Date du divorce</Label>
          <Input
            type="date"
            value={data.divorceDate}
            onChange={(e) => up("divorceDate", e.target.value)}
            className="mt-1"
          />
        </div>
      )}

      <div className="grid grid-cols-2 gap-3">
        <div>
          <Label>Nombre d'enfant(s)</Label>
          <Input
            type="number"
            min={0}
            value={data.numberOfChildren}
            onChange={(e) => up("numberOfChildren", e.target.value)}
            className="mt-1"
          />
        </div>
        <div>
          <Label>Dont à charge fiscalement</Label>
          <Input
            type="number"
            min={0}
            value={data.childrenAtCharge}
            onChange={(e) => up("childrenAtCharge", e.target.value)}
            className="mt-1"
          />
        </div>
      </div>
    </div>
  );
}

export function IATppStep1({ formData, onChange, onNext, error, setError }: Props) {
  const handleNext = () => {
    const t1 = formData.titulaire1;
    if (!t1.lastName.trim()) {
      setError("Le nom du Titulaire 1 est requis.");
      return;
    }
    if (!t1.firstName.trim()) {
      setError("Le prénom du Titulaire 1 est requis.");
      return;
    }
    if (!t1.email.trim()) {
      setError("L'email du Titulaire 1 est requis.");
      return;
    }
    if (!t1.nationality.trim()) {
      setError("La nationalité est requise.");
      return;
    }
    setError("");
    onNext();
  };

  return (
    <div className="space-y-8">
      <div className="rounded-xl bg-amber-50 border border-amber-200 px-4 py-3 text-xs text-amber-800">
        <strong>Mise en garde.</strong> Ce questionnaire doit être renseigné de manière exhaustive et
        sincère. Toute modification de votre situation doit être signalée à votre conseiller.
      </div>

      <TitulaireForm
        id="t1"
        label="Titulaire 1"
        data={formData.titulaire1}
        onChange={(d) => onChange({ titulaire1: { ...formData.titulaire1, ...d } })}
      />

      <div>
        <button
          type="button"
          onClick={() => onChange({ hasTitulaire2: !formData.hasTitulaire2 })}
          className="flex items-center gap-2 text-sm text-brand-gold font-semibold hover:underline focus:outline-none"
        >
          {formData.hasTitulaire2 ? (
            <Minus className="h-4 w-4" />
          ) : (
            <Plus className="h-4 w-4" />
          )}
          {formData.hasTitulaire2
            ? "Supprimer le Titulaire 2"
            : "Ajouter un Titulaire 2 / mandataire"}
        </button>
        {formData.hasTitulaire2 && (
          <div className="mt-6">
            <TitulaireForm
              id="t2"
              label="Titulaire 2 / Mandataire"
              data={formData.titulaire2}
              onChange={(d) =>
                onChange({ titulaire2: { ...formData.titulaire2, ...d } })
              }
            />
          </div>
        )}
      </div>

      <MaritalForm
        data={formData.maritalStatus}
        onChange={(d) =>
          onChange({ maritalStatus: { ...formData.maritalStatus, ...d } })
        }
      />

      {error && <p className="text-sm text-red-600 font-medium">{error}</p>}

      <Button variant="primary" size="lg" className="w-full" onClick={handleNext}>
        Suivant — Situation financière
      </Button>
    </div>
  );
}
