"use client";

import * as React from "react";
import { useTranslations } from "next-intl";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { DocUpload, UploadedDocument } from "./doc-upload";

interface DocumentsStepProps {
  data: any;
  onUpdate: (data: any) => void;
  onNext: () => void;
}

export function DocumentsStep({
  data,
  onUpdate,
  onNext,
}: DocumentsStepProps) {
  const t = useTranslations();
  const [documents, setDocuments] = React.useState<UploadedDocument[]>(
    data.documents || []
  );
  const [uploadLater, setUploadLater] = React.useState(
    data.uploadLater || false
  );

  // Documents step is always valid (documents are optional / can upload later)
  React.useEffect(() => {
    onUpdate({ isStep5Valid: true });
  }, []);

  const handleDocumentUpload = (documentType: string, doc: UploadedDocument) => {
    const newDocuments = [
      ...documents.filter((d) => d.type !== documentType),
      doc,
    ];
    setDocuments(newDocuments);
    onUpdate({ documents: newDocuments });
  };

  const handleDocumentRemove = (documentType: string) => {
    const newDocuments = documents.filter((d) => d.type !== documentType);
    setDocuments(newDocuments);
    onUpdate({ documents: newDocuments });
  };

  const getDocument = (type: string) => documents.find((d) => d.type === type);

  const handleUploadLaterChange = (checked: boolean) => {
    setUploadLater(checked);
    onUpdate({ uploadLater: checked });
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="mb-2 text-2xl font-bold text-brand-dark">{t('accounting.documents.title')}</h2>
        <p className="text-brand-grayMed">
          {t('accounting.documents.subtitle')}
        </p>
      </div>

      {!uploadLater && (
        <div className="space-y-4">
          {/* Certificate of Incorporation */}
          <DocUpload
            label={t('accounting.documents.types.incorporation')}
            documentType="incorporation_certificate"
            uploadedDoc={getDocument("incorporation_certificate")}
            onUpload={(doc) => handleDocumentUpload("incorporation_certificate", doc)}
            onRemove={() => handleDocumentRemove("incorporation_certificate")}
            helpText={t('accounting.documents.hints.incorporation')}
          />

          {/* Articles / Statuts */}
          <DocUpload
            label={t('accounting.documents.types.articles')}
            documentType="articles"
            uploadedDoc={getDocument("articles")}
            onUpload={(doc) => handleDocumentUpload("articles", doc)}
            onRemove={() => handleDocumentRemove("articles")}
            helpText={t('accounting.documents.hints.articles')}
          />

          {/* VAT Certificate */}
          <DocUpload
            label={t('accounting.documents.types.vat')}
            documentType="vat_certificate"
            uploadedDoc={getDocument("vat_certificate")}
            onUpload={(doc) => handleDocumentUpload("vat_certificate", doc)}
            onRemove={() => handleDocumentRemove("vat_certificate")}
            helpText={t('accounting.documents.hints.vat')}
          />

          {/* ID/Passport of Director */}
          <DocUpload
            label={t('accounting.documents.types.directorId')}
            documentType="director_id"
            uploadedDoc={getDocument("director_id")}
            onUpload={(doc) => handleDocumentUpload("director_id", doc)}
            onRemove={() => handleDocumentRemove("director_id")}
            helpText={t('accounting.documents.hints.directorId')}
          />
        </div>
      )}

      {uploadLater && (
        <div className="rounded-lg border border-amber-200 bg-amber-50 p-4">
          <p className="text-sm text-amber-800">
            <strong>Documents skipped.</strong> You can upload your documents after submission from the confirmation page.
          </p>
        </div>
      )}

      {/* Upload later checkbox */}
      <div className="flex items-center space-x-2 rounded-lg border border-brand-grayLight p-4">
        <Checkbox
          id="uploadLater"
          checked={uploadLater}
          onCheckedChange={handleUploadLaterChange}
        />
        <Label
          htmlFor="uploadLater"
          className="cursor-pointer text-sm font-medium text-brand-dark"
        >
          I'll upload my documents later
        </Label>
      </div>

      <div className="rounded-lg bg-blue-50 p-4">
        <p className="text-sm text-blue-900">
          <strong>{t('accounting.documents.note.title')}</strong> {t('accounting.documents.note.text')}
        </p>
      </div>
    </div>
  );
}
