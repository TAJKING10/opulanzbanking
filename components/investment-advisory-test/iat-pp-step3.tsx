"use client";
import * as React from "react";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { FileText, Info } from "lucide-react";
import type { IATFormData, PersonalDocuments } from "./iat-types";

interface Props {
  formData: IATFormData;
  onChange: (data: Partial<IATFormData>) => void;
  onNext: () => void;
}

const DOCUMENT_GROUPS = [
  {
    title: "Situation familiale",
    docs: [
      { key: "idCard", label: "Carte d'identité (recto/verso) ou passeport — Titulaire 1" },
      { key: "spouseId", label: "Carte d'identité (recto/verso) ou passeport — Conjoint/Partenaire" },
      { key: "marriageContract", label: "Contrat de mariage / PACS / Jugement de divorce" },
      { key: "familyRecord", label: "Livret de famille" },
      { key: "donationActs", label: "Actes de donation" },
      { key: "testament", label: "Testament" },
      { key: "proofOfAddress", label: "Justificatif de domicile (moins de 3 mois)" },
    ],
  },
  {
    title: "Fiscalité & patrimoine",
    docs: [
      { key: "lastTaxReturn", label: "Dernière déclaration de revenus (avis d'imposition)" },
      { key: "lastIFIReturn", label: "Dernière déclaration IFI" },
      { key: "loanAmortization", label: "Tableaux d'amortissement des prêts personnels en cours" },
      { key: "payslips", label: "Derniers bulletins de salaire / avis de pension" },
    ],
  },
];

export function IATppStep3({ formData, onChange, onNext }: Props) {
  const docs = formData.personalDocuments;
  const up = (field: keyof PersonalDocuments, val: boolean) =>
    onChange({ personalDocuments: { ...docs, [field]: val } });

  const checkedCount = Object.values(docs).filter(Boolean).length;
  const total = Object.keys(docs).length;

  return (
    <div className="space-y-6">
      <div className="rounded-xl bg-blue-50 border border-blue-200 px-4 py-3 text-xs text-blue-900">
        <div className="flex items-start gap-2">
          <Info className="h-4 w-4 flex-shrink-0 mt-0.5" />
          <div>
            <strong>Documents requis.</strong> Veuillez cocher les documents dont vous disposez et que
            vous êtes prêt(e) à transmettre à votre conseiller. Ces pièces ne sont pas téléversées ici —
            elles seront remises lors de votre rendez-vous ou transmises par voie sécurisée.
          </div>
        </div>
      </div>

      <div className="flex items-center justify-between text-sm">
        <span className="text-brand-grayMed">Documents cochés</span>
        <span className="font-bold text-brand-dark">
          {checkedCount} / {total}
        </span>
      </div>

      <div className="space-y-6">
        {DOCUMENT_GROUPS.map((group) => (
          <div key={group.title} className="rounded-xl border border-brand-grayLight overflow-hidden">
            <div className="flex items-center gap-2 bg-brand-dark px-4 py-2.5">
              <FileText className="h-4 w-4 text-brand-gold" />
              <span className="text-xs font-bold text-white uppercase tracking-wide">
                {group.title}
              </span>
            </div>
            <div className="divide-y divide-brand-grayLight">
              {group.docs.map(({ key, label }) => (
                <label
                  key={key}
                  className="flex items-center gap-3 px-4 py-3 cursor-pointer hover:bg-gray-50 transition-colors"
                >
                  <Checkbox
                    checked={docs[key as keyof PersonalDocuments]}
                    onCheckedChange={(v) => up(key as keyof PersonalDocuments, !!v)}
                  />
                  <span className="text-sm text-brand-dark">{label}</span>
                </label>
              ))}
            </div>
          </div>
        ))}
      </div>

      <p className="text-xs text-brand-grayMed text-center">
        Vous pouvez continuer même si tous les documents ne sont pas encore disponibles.
        Votre conseiller vous contactera pour les pièces manquantes.
      </p>

      <Button variant="primary" size="lg" className="w-full" onClick={onNext}>
        Suivant — Connaissance & expérience
      </Button>
    </div>
  );
}
