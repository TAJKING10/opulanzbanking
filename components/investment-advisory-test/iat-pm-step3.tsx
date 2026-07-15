"use client";
import * as React from "react";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { FileText, Info } from "lucide-react";
import type { IATFormData, CompanyDocuments } from "./iat-types";

interface Props {
  formData: IATFormData;
  onChange: (data: Partial<IATFormData>) => void;
  onNext: () => void;
}

const COMPANY_DOCS = [
  { key: "kbis", label: "Extrait K-bis original de moins de 3 mois" },
  { key: "signatoryList", label: "Liste des signataires autorisés" },
  { key: "financialStatements", label: "Derniers états financiers disponibles certifiés conformes" },
  {
    key: "shareholdersList",
    label:
      "Liste des actionnaires avec noms complets et pourcentage de détention, et des dirigeants (document avec en-tête, daté et signé)",
  },
  {
    key: "uboList",
    label:
      "Bénéficiaires économiques ultimes (BEO) détenant plus de 25 % de la société (si différents des propriétaires)",
  },
  { key: "statutes", label: "Statuts à jour, certifiés conformes" },
  {
    key: "representativeId",
    label:
      "Pièce d'identité certifiée conforme des personnes ayant un pouvoir de signature et des propriétaires détenant plus de 25 %",
  },
  { key: "fundsOriginDeclaration", label: "Déclaration d'origine des fonds" },
];

export function IATpmStep3({ formData, onChange, onNext }: Props) {
  const docs = formData.companyDocuments;
  const up = (field: keyof CompanyDocuments, val: boolean) =>
    onChange({ companyDocuments: { ...docs, [field]: val } });

  const checkedCount = Object.values(docs).filter(Boolean).length;
  const total = COMPANY_DOCS.length;

  return (
    <div className="space-y-6">
      <div className="rounded-xl bg-blue-50 border border-blue-200 px-4 py-3 text-xs text-blue-900">
        <div className="flex items-start gap-2">
          <Info className="h-4 w-4 flex-shrink-0 mt-0.5" />
          <div>
            <strong>Documents requis — Personne Morale.</strong> Veuillez cocher les documents dont
            vous disposez. Ces pièces doivent être remises à votre conseiller lors de l'entrée en
            relation ou transmises par voie sécurisée.
          </div>
        </div>
      </div>

      <div className="flex items-center justify-between text-sm">
        <span className="text-brand-grayMed">Documents cochés</span>
        <span className="font-bold text-brand-dark">
          {checkedCount} / {total}
        </span>
      </div>

      <div className="rounded-xl border border-brand-grayLight overflow-hidden">
        <div className="flex items-center gap-2 bg-brand-dark px-4 py-2.5">
          <FileText className="h-4 w-4 text-brand-gold" />
          <span className="text-xs font-bold text-white uppercase tracking-wide">
            Pièces justificatives — Société
          </span>
        </div>
        <div className="divide-y divide-brand-grayLight">
          {COMPANY_DOCS.map(({ key, label }) => (
            <label
              key={key}
              className="flex items-start gap-3 px-4 py-3 cursor-pointer hover:bg-gray-50 transition-colors"
            >
              <Checkbox
                checked={docs[key as keyof CompanyDocuments]}
                onCheckedChange={(v) => up(key as keyof CompanyDocuments, !!v)}
                className="mt-0.5"
              />
              <span className="text-sm text-brand-dark">{label}</span>
            </label>
          ))}
        </div>
      </div>

      <p className="text-xs text-brand-grayMed text-center">
        Vous pouvez continuer sans cocher tous les documents. Votre conseiller vous contactera pour
        les pièces manquantes.
      </p>

      <Button variant="primary" size="lg" className="w-full" onClick={onNext}>
        Suivant — Connaissance & expérience
      </Button>
    </div>
  );
}
