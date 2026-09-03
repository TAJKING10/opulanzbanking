"use client";
import * as React from "react";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { FileText, Info, Upload, X } from "lucide-react";
import { useTranslations } from "next-intl";
import type { IATFormData, PersonalDocuments } from "./iat-types";

interface Props {
  formData: IATFormData;
  onChange: (data: Partial<IATFormData>) => void;
  onNext: () => void;
  error: string;
  setError: (e: string) => void;
}

export function IATppStep3({ formData, onChange, onNext, error, setError }: Props) {
  const t = useTranslations("iat");
  const docs = formData.personalDocuments;
  const up = (field: keyof PersonalDocuments, val: boolean) =>
    onChange({ personalDocuments: { ...docs, [field]: val } });

  // Document groups defined inside component to use translations
  const DOCUMENT_GROUPS = [
    {
      title: t("ppStep3.groupFamilial"),
      docs: [
        { key: "idCard", label: t("ppStep3.docIdCard"), required: true },
        { key: "spouseId", label: t("ppStep3.docSpouseId"), required: false },
        { key: "marriageContract", label: t("ppStep3.docMarriageContract"), required: false },
        { key: "familyRecord", label: t("ppStep3.docFamilyRecord"), required: false },
        { key: "donationActs", label: t("ppStep3.docDonationActs"), required: false },
        { key: "testament", label: t("ppStep3.docTestament"), required: false },
        { key: "proofOfAddress", label: t("ppStep3.docProofOfAddress"), required: true },
      ],
    },
    {
      title: t("ppStep3.groupFiscalite"),
      docs: [
        { key: "lastTaxReturn", label: t("ppStep3.docLastTaxReturn"), required: true },
        { key: "lastIFIReturn", label: t("ppStep3.docLastIFIReturn"), required: false },
        { key: "loanAmortization", label: t("ppStep3.docLoanAmortization"), required: false },
        { key: "payslips", label: t("ppStep3.docPayslips"), required: false },
      ],
    },
  ];

  const [uploadedFiles, setUploadedFiles] = React.useState<Record<string, File[]>>({});
  const fileInputRefs = React.useRef<Record<string, HTMLInputElement | null>>({});

  const handleFileChange = (key: string, e: React.ChangeEvent<HTMLInputElement>) => {
    const newFiles = Array.from(e.target.files || []);
    if (newFiles.length === 0) return;
    setUploadedFiles((prev) => ({ ...prev, [key]: [...(prev[key] || []), ...newFiles] }));
    up(key as keyof PersonalDocuments, true);
    e.target.value = "";
  };

  const removeFile = (key: string, idx: number) => {
    setUploadedFiles((prev) => {
      const updated = (prev[key] || []).filter((_, i) => i !== idx);
      return { ...prev, [key]: updated };
    });
  };

  const checkedCount = Object.values(docs).filter(Boolean).length;
  const total = Object.keys(docs).length;

  const handleNext = () => {
    if (!docs.idCard) { setError(t("ppStep3.errIdCard")); return; }
    if (!docs.proofOfAddress) { setError(t("ppStep3.errProofOfAddress")); return; }
    if (!docs.lastTaxReturn) { setError(t("ppStep3.errLastTaxReturn")); return; }
    setError("");
    onNext();
  };

  return (
    <div className="space-y-6">
      <div className="rounded-xl bg-blue-50 border border-blue-200 px-4 py-3 text-xs text-blue-900">
        <div className="flex items-start gap-2">
          <Info className="h-4 w-4 flex-shrink-0 mt-0.5" />
          <div>
            <strong>{t("ppStep3.infoBox")}</strong>
          </div>
        </div>
      </div>

      <div className="flex items-center justify-between text-sm">
        <span className="text-brand-grayMed">{t("ppStep3.checkedCount")}</span>
        <span className="font-bold text-brand-dark">{checkedCount} / {total}</span>
      </div>

      <div className="space-y-6">
        {DOCUMENT_GROUPS.map((group) => (
          <div key={group.title} className="rounded-xl border border-brand-grayLight overflow-hidden">
            <div className="flex items-center gap-2 bg-brand-dark px-4 py-2.5">
              <FileText className="h-4 w-4 text-brand-gold" />
              <span className="text-xs font-bold text-white uppercase tracking-wide">{group.title}</span>
            </div>
            <div className="divide-y divide-brand-grayLight">
              {group.docs.map(({ key, label, required }) => {
                const docFiles = uploadedFiles[key] || [];
                return (
                  <div key={key} className="px-4 py-3 hover:bg-gray-50 transition-colors">
                    <div className="flex items-start gap-3">
                      <Checkbox
                        checked={docs[key as keyof PersonalDocuments]}
                        onCheckedChange={(v) => up(key as keyof PersonalDocuments, !!v)}
                        className="mt-0.5"
                      />
                      <div className="flex-1 min-w-0">
                        <span className="text-sm text-brand-dark">
                          {label}{required && <span className="text-red-500"> *</span>}
                        </span>

                        <div className="mt-2 flex items-center gap-2 flex-wrap">
                          <button
                            type="button"
                            onClick={() => fileInputRefs.current[key]?.click()}
                            className="inline-flex items-center gap-1.5 rounded-lg border border-brand-grayLight bg-white px-2.5 py-1 text-xs font-medium text-brand-dark hover:border-brand-gold hover:text-brand-gold transition-colors"
                          >
                            <Upload className="h-3 w-3" />
                            {t("ppStep3.uploadBtn")}
                          </button>
                          <input
                            ref={(el) => { fileInputRefs.current[key] = el; }}
                            type="file"
                            accept="image/*,.pdf"
                            multiple
                            className="hidden"
                            onChange={(e) => handleFileChange(key, e)}
                          />
                        </div>

                        {docFiles.length > 0 && (
                          <ul className="mt-2 space-y-1">
                            {docFiles.map((file, idx) => (
                              <li key={idx} className="flex items-center gap-2 text-xs text-brand-dark bg-brand-gold/10 rounded-lg px-2.5 py-1">
                                <FileText className="h-3 w-3 text-brand-gold flex-shrink-0" />
                                <span className="truncate max-w-[200px]">{file.name}</span>
                                <button
                                  type="button"
                                  onClick={() => removeFile(key, idx)}
                                  className="ml-auto text-red-400 hover:text-red-600"
                                >
                                  <X className="h-3 w-3" />
                                </button>
                              </li>
                            ))}
                          </ul>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      <p className="text-xs text-brand-grayMed text-center">
        {t("ppStep3.requiredNote")}
      </p>

      {error && <p className="text-sm text-red-600 font-medium">{error}</p>}
      <Button variant="primary" size="lg" className="w-full" onClick={handleNext}>
        {t("ppStep3.nextBtn")}
      </Button>
    </div>
  );
}
