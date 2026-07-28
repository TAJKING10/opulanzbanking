"use client";

import * as React from "react";
import { CheckCircle, X, Pen, AlertCircle, Loader2, Lock, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSigned: (envelopeId: string) => void;
  clientName: string;
  clientEmail: string;
  pdfBase64: string;
  pdfPageCount?: number;
}

type Phase = "loading" | "signing" | "done" | "error";

export function IATDocuSignModal({
  isOpen,
  onClose,
  onSigned,
  clientName,
  clientEmail,
  pdfBase64,
  pdfPageCount = 1,
}: Props) {
  const [phase, setPhase] = React.useState<Phase>("loading");
  const [signingUrl, setSigningUrl] = React.useState("");
  const [envelopeId, setEnvelopeId] = React.useState("");
  const [errorMsg, setErrorMsg] = React.useState("");
  const popupRef = React.useRef<Window | null>(null);

  // When the modal opens and we have a PDF, create the DocuSign envelope
  React.useEffect(() => {
    if (!isOpen || !pdfBase64) return;
    setPhase("loading");
    setSigningUrl("");
    setEnvelopeId("");
    setErrorMsg("");

    const appUrl = typeof window !== "undefined" ? window.location.origin : "http://localhost:3000";
    const returnUrl = `${appUrl}/api/docusign/return`;

    fetch("/api/docusign/sign", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ pdfBase64, clientName, clientEmail, returnUrl, pdfPageCount }),
    })
      .then((r) => r.json())
      .then((data) => {
        if (data.success && data.signingUrl) {
          setSigningUrl(data.signingUrl);
          setEnvelopeId(data.envelopeId);
          setPhase("signing");
        } else if (data.error === "consent_required" && data.consentUrl) {
          // First-time setup: DocuSign needs OAuth consent
          setErrorMsg(
            `DocuSign requires one-time authorization. Please open this URL in your browser, grant consent, then come back:\n\n${data.consentUrl}`
          );
          setPhase("error");
        } else {
          setErrorMsg(data.error || "Failed to initialize DocuSign signing session.");
          setPhase("error");
        }
      })
      .catch((err) => {
        setErrorMsg(String(err));
        setPhase("error");
      });
  }, [isOpen, pdfBase64, clientName, clientEmail]);

  // Open popup when signing URL is ready
  React.useEffect(() => {
    if (phase !== "signing" || !signingUrl) return;
    const w = 900, h = 700;
    const left = Math.max(0, (window.screen.width - w) / 2);
    const top = Math.max(0, (window.screen.height - h) / 2);
    const popup = window.open(
      signingUrl,
      "docusign_signing",
      `width=${w},height=${h},left=${left},top=${top},resizable=yes,scrollbars=yes`
    );
    popupRef.current = popup;
  }, [phase, signingUrl]);

  // Close popup if modal is closed externally
  React.useEffect(() => {
    if (!isOpen && popupRef.current && !popupRef.current.closed) {
      popupRef.current.close();
      popupRef.current = null;
    }
  }, [isOpen]);

  // Listen for postMessage from the DocuSign return page (/api/docusign/return)
  React.useEffect(() => {
    if (!isOpen) return;
    const handler = (event: MessageEvent) => {
      if (event.data?.type !== "docusign_event") return;
      const ev: string = event.data.event ?? "";
      if (ev === "signing_complete") {
        popupRef.current = null;
        setPhase("done");
        setTimeout(() => onSigned(envelopeId), 2000);
      } else if (ev === "cancel" || ev === "decline") {
        popupRef.current = null;
        onClose();
      }
    };
    window.addEventListener("message", handler);
    return () => window.removeEventListener("message", handler);
  }, [isOpen, envelopeId, onSigned, onClose]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex flex-col bg-black/80"
      role="dialog"
      aria-modal="true"
      aria-labelledby="ds-modal-title"
    >
      {/* Header bar */}
      <div className="flex items-center justify-between bg-white px-5 py-3 shadow-md flex-shrink-0">
        <div className="flex items-center gap-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#FFCC00]">
            <Pen className="h-4 w-4 text-[#005880]" />
          </div>
          <div>
            <p id="ds-modal-title" className="text-sm font-bold text-gray-900">
              Signature Électronique — Advensys Insurance Finance
            </p>
            <div className="flex items-center gap-1 mt-0.5">
              <Lock className="h-3 w-3 text-green-600" />
              <span className="text-xs text-green-700 font-medium">
                Powered by DocuSign
              </span>
            </div>
          </div>
        </div>
        {phase !== "done" && (
          <button
            type="button"
            onClick={onClose}
            aria-label="Fermer"
            className="rounded-lg p-2 text-gray-400 hover:bg-gray-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-gold"
          >
            <X className="h-5 w-5" />
          </button>
        )}
      </div>

      {/* Content */}
      <div className="flex-1 overflow-hidden">

        {/* Loading */}
        {phase === "loading" && (
          <div className="flex h-full items-center justify-center bg-white">
            <div className="text-center space-y-4">
              <Loader2 className="h-12 w-12 animate-spin text-brand-gold mx-auto" />
              <p className="text-sm font-semibold text-gray-700">
                Préparation du document DocuSign…
              </p>
              <p className="text-xs text-gray-400">
                Génération de la session de signature en cours
              </p>
            </div>
          </div>
        )}

        {/* Waiting for popup signing */}
        {phase === "signing" && (
          <div className="flex h-full items-center justify-center bg-white">
            <div className="text-center space-y-6 px-6 max-w-md">
              <div className="inline-flex h-20 w-20 items-center justify-center rounded-full bg-[#FFCC00]/20 mx-auto">
                <ExternalLink className="h-10 w-10 text-[#005880]" />
              </div>
              <div className="space-y-2">
                <h2 className="text-xl font-bold text-gray-900">
                  Fenêtre DocuSign ouverte
                </h2>
                <p className="text-sm text-gray-500">
                  Une fenêtre DocuSign s'est ouverte pour signer votre document.
                  Veuillez compléter la signature dans cette fenêtre.
                </p>
              </div>
              <div className="flex items-center justify-center gap-2">
                <Loader2 className="h-4 w-4 animate-spin text-brand-gold" />
                <span className="text-xs text-gray-400">En attente de la signature…</span>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  if (signingUrl) {
                    const w = 900, h = 700;
                    const left = Math.max(0, (window.screen.width - w) / 2);
                    const top = Math.max(0, (window.screen.height - h) / 2);
                    const popup = window.open(
                      signingUrl,
                      "docusign_signing",
                      `width=${w},height=${h},left=${left},top=${top},resizable=yes,scrollbars=yes`
                    );
                    popupRef.current = popup;
                  }
                }}
                className="text-xs"
              >
                Rouvrir la fenêtre DocuSign
              </Button>
            </div>
          </div>
        )}

        {/* Done */}
        {phase === "done" && (
          <div className="flex h-full items-center justify-center bg-white">
            <div className="text-center space-y-4 px-6">
              <div className="inline-flex h-20 w-20 items-center justify-center rounded-full bg-green-100 mx-auto">
                <CheckCircle className="h-10 w-10 text-green-600" />
              </div>
              <h2 className="text-xl font-bold text-gray-900">
                Document signé avec succès
              </h2>
              <p className="text-sm text-gray-500 max-w-sm mx-auto">
                Votre questionnaire QCC a été signé électroniquement via DocuSign.
                Génération du PDF et envoi par email en cours…
              </p>
              <div className="inline-flex items-center gap-2 rounded-full bg-green-50 border border-green-200 px-4 py-2 text-xs text-green-800 font-medium">
                <Lock className="h-3.5 w-3.5" />
                Signé · Horodaté · Archivé par DocuSign
              </div>
            </div>
          </div>
        )}

        {/* Error */}
        {phase === "error" && (
          <div className="flex h-full items-center justify-center bg-white p-6">
            <div className="max-w-lg w-full space-y-4">
              <div className="flex items-center gap-3">
                <AlertCircle className="h-8 w-8 text-red-500 flex-shrink-0" />
                <h2 className="text-lg font-bold text-gray-900">
                  Erreur DocuSign
                </h2>
              </div>
              <div className="rounded-xl border border-red-200 bg-red-50 p-4">
                <pre className="text-xs text-red-800 whitespace-pre-wrap break-all font-mono leading-relaxed">
                  {errorMsg}
                </pre>
              </div>
              <Button variant="outline" onClick={onClose} className="w-full">
                Fermer
              </Button>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
