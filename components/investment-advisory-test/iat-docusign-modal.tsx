"use client";

import * as React from "react";
import { CheckCircle, X, Pen, FileText, Shield, Lock, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSigned: (envelopeId: string) => void;
  clientName: string;
  clientEmail: string;
  pdfBase64: string;
}

type Phase = "review" | "sign" | "done";

export function IATDocuSignModal({
  isOpen,
  onClose,
  onSigned,
  clientName,
  clientEmail,
  pdfBase64: _pdfBase64,
}: Props) {
  const [phase, setPhase] = React.useState<Phase>("review");
  const [typedName, setTypedName] = React.useState("");
  const [consented, setConsented] = React.useState(false);

  const signDate = new Date().toLocaleDateString("fr-FR", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });

  // Reset when modal opens
  React.useEffect(() => {
    if (isOpen) {
      setPhase("review");
      setTypedName("");
      setConsented(false);
    }
  }, [isOpen]);

  const handleSign = () => {
    if (!typedName.trim() || !consented) return;
    setPhase("done");
    setTimeout(() => onSigned(typedName.trim()), 2500);
  };

  const nameMatches =
    typedName.trim().toLowerCase() === clientName.trim().toLowerCase();

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="sig-modal-title"
    >
      <div className="relative w-full max-w-2xl max-h-[92vh] overflow-y-auto bg-white shadow-2xl rounded-2xl overflow-hidden">
        {/* Header */}
        <div className="sticky top-0 z-10 flex items-center justify-between border-b border-brand-grayLight bg-white px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#FFCC00]">
              <Pen className="h-4 w-4 text-[#005880]" />
            </div>
            <div>
              <p id="sig-modal-title" className="text-sm font-bold text-brand-dark">
                Signature Électronique — Advensys Insurance Finance
              </p>
              <div className="flex items-center gap-1.5 mt-0.5">
                <Lock className="h-3 w-3 text-green-600" />
                <p className="text-xs text-green-700 font-medium">
                  Signature électronique sécurisée
                </p>
              </div>
            </div>
          </div>
          {phase !== "done" && (
            <button
              type="button"
              onClick={onClose}
              aria-label="Fermer"
              className="rounded-lg p-2 text-brand-grayMed hover:bg-gray-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-gold"
            >
              <X className="h-5 w-5" />
            </button>
          )}
        </div>

        {/* ── REVIEW ────────────────────────────────────────────────── */}
        {phase === "review" && (
          <div className="p-6 space-y-6">
            <div className="rounded-xl border border-brand-grayLight bg-gray-50 p-5">
              <div className="flex items-center gap-2 mb-4">
                <FileText className="h-4 w-4 text-brand-gold flex-shrink-0" />
                <span className="text-sm font-semibold text-brand-dark">
                  Document à signer — QCC Advensys Insurance Finance
                </span>
              </div>
              <div className="space-y-2 text-xs">
                {[
                  ["Client", clientName || "—"],
                  ["Document", "Questionnaire MiFID II / DDA (PDF)"],
                  ["Émetteur", "Advensys Insurance Finance"],
                  ["Date", signDate],
                  ["Statut", "En attente de signature"],
                ].map(([label, value]) => (
                  <div
                    key={label}
                    className="flex justify-between border-b border-brand-grayLight pb-1.5 last:border-0 last:pb-0"
                  >
                    <span className="font-semibold text-brand-grayMed w-36">{label}</span>
                    <span
                      className={`text-right ${
                        label === "Statut" ? "text-amber-700 font-semibold" : "text-brand-dark"
                      }`}
                    >
                      {value}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-xl bg-blue-50 border border-blue-200 px-4 py-3 text-xs text-blue-900 leading-relaxed">
              <strong>Avant de signer :</strong> En apposant votre signature électronique,
              vous certifiez que les informations fournies dans ce questionnaire sont exactes
              et sincères, et vous consentez à leur traitement conformément à la réglementation
              MiFID II / DDA.
            </div>

            <div className="flex items-start gap-2 rounded-xl bg-green-50 border border-green-200 px-4 py-3">
              <Shield className="h-4 w-4 text-green-600 flex-shrink-0 mt-0.5" />
              <p className="text-xs text-green-800 leading-relaxed">
                Votre signature est horodatée et archivée. Un exemplaire signé vous sera
                envoyé par email à <strong>{clientEmail || "votre adresse"}</strong>.
              </p>
            </div>

            <Button variant="primary" size="lg" className="w-full" onClick={() => setPhase("sign")}>
              <Pen className="mr-2 h-4 w-4" />
              Procéder à la signature
            </Button>
          </div>
        )}

        {/* ── SIGN ──────────────────────────────────────────────────── */}
        {phase === "sign" && (
          <div className="p-6 space-y-6">
            <div className="space-y-2">
              <p className="text-sm font-semibold text-brand-dark">
                Signez en tapant votre nom complet
              </p>
              <p className="text-xs text-brand-grayMed">
                Saisissez votre nom exactement tel qu'il apparaît sur le document :{" "}
                <strong>{clientName}</strong>
              </p>
            </div>

            {/* Typed signature field */}
            <div className="space-y-2">
              <label className="text-xs font-semibold text-brand-dark" htmlFor="typed-sig">
                Votre nom complet *
              </label>
              <input
                id="typed-sig"
                type="text"
                value={typedName}
                onChange={(e) => setTypedName(e.target.value)}
                placeholder={clientName}
                autoComplete="off"
                className="w-full rounded-xl border border-brand-grayLight px-4 py-3 text-lg font-semibold italic text-brand-dark placeholder:text-gray-300 focus:outline-none focus:ring-2 focus:ring-brand-gold"
                style={{ fontFamily: "'Georgia', serif" }}
              />
              {typedName && !nameMatches && (
                <p className="text-xs text-amber-700 flex items-center gap-1">
                  <AlertCircle className="h-3 w-3 flex-shrink-0" />
                  Le nom doit correspondre exactement à : <strong>{clientName}</strong>
                </p>
              )}
              {typedName && nameMatches && (
                <p className="text-xs text-green-700 flex items-center gap-1">
                  <CheckCircle className="h-3 w-3 flex-shrink-0" />
                  Nom validé
                </p>
              )}
            </div>

            {/* Signature preview */}
            {nameMatches && (
              <div className="rounded-xl border-2 border-dashed border-brand-gold bg-amber-50 px-6 py-4 text-center">
                <p className="text-xs text-brand-grayMed mb-1">Aperçu de votre signature</p>
                <p
                  className="text-2xl text-brand-dark"
                  style={{ fontFamily: "'Georgia', serif", fontStyle: "italic" }}
                >
                  {typedName}
                </p>
                <p className="text-xs text-brand-grayMed mt-1">{signDate}</p>
              </div>
            )}

            {/* Consent checkbox */}
            <label className="flex items-start gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={consented}
                onChange={(e) => setConsented(e.target.checked)}
                className="mt-0.5 h-4 w-4 accent-brand-gold flex-shrink-0"
              />
              <span className="text-xs text-brand-dark leading-relaxed">
                Je soussigné(e) <strong>{clientName}</strong>, certifie avoir pris connaissance
                du Questionnaire de Connaissance Client (QCC) et en confirme l'exactitude. Je
                consens à la collecte et au traitement de mes données conformément à la
                réglementation MiFID II / DDA en vigueur.
              </span>
            </label>

            <div className="flex gap-3">
              <Button variant="outline" className="flex-1" onClick={() => setPhase("review")}>
                Retour
              </Button>
              <Button
                variant="primary"
                className="flex-1"
                onClick={handleSign}
                disabled={!nameMatches || !consented}
              >
                <Pen className="mr-2 h-4 w-4" />
                Signer le document
              </Button>
            </div>
          </div>
        )}

        {/* ── DONE ──────────────────────────────────────────────────── */}
        {phase === "done" && (
          <div className="p-8 text-center space-y-4">
            <div className="inline-flex h-20 w-20 items-center justify-center rounded-full bg-green-100">
              <CheckCircle className="h-10 w-10 text-green-600" />
            </div>
            <div>
              <p className="text-xl font-bold text-brand-dark mb-2">
                Document signé avec succès
              </p>
              <p className="text-sm text-brand-grayMed max-w-sm mx-auto leading-relaxed">
                Votre questionnaire QCC a été signé électroniquement le{" "}
                <strong>{signDate}</strong>. Un exemplaire vous sera envoyé par email.
              </p>
            </div>
            <div className="inline-flex items-center gap-2 rounded-full bg-green-50 border border-green-200 px-4 py-2 text-xs text-green-800 font-medium">
              <Lock className="h-3.5 w-3.5" />
              Signé · Horodaté · Archivé
            </div>
            <p className="text-xs text-brand-grayMed">Fermeture automatique…</p>
          </div>
        )}

      </div>
    </div>
  );
}
