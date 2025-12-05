"use client";

import * as React from "react";
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
  const [documents, setDocuments] = React.useState<UploadedDocument[]>(
    data.documents || []
  );

  const handleDocumentUpload = (
    documentType: string,
    doc: UploadedDocument
  ) => {
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

  const getDocument = (type: string) => {
    return documents.find((d) => d.type === type);
  };

  const handleContinue = () => {
    // Documents are optional, so no validation needed
    onNext();
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="mb-2 text-2xl font-bold text-brand-dark">Documents</h2>
        <p className="text-brand-grayMed">
          Upload your company documents. These are optional at this stage and
          can be provided later.
        </p>
      </div>

      <div className="space-y-4">
        {/* Certificate of Incorporation */}
        <DocUpload
          label="Certificate of Incorporation"
          documentType="incorporation_certificate"
          uploadedDoc={getDocument("incorporation_certificate")}
          onUpload={(doc) =>
            handleDocumentUpload("incorporation_certificate", doc)
          }
          onRemove={() => handleDocumentRemove("incorporation_certificate")}
          helpText="Official document confirming company registration"
        />

        {/* Articles / Statuts */}
        <DocUpload
          label="Articles of Association / Statuts"
          documentType="articles"
          uploadedDoc={getDocument("articles")}
          onUpload={(doc) => handleDocumentUpload("articles", doc)}
          onRemove={() => handleDocumentRemove("articles")}
          helpText="Company articles or statuts document"
        />

        {/* VAT Certificate */}
        <DocUpload
          label="VAT Certificate"
          documentType="vat_certificate"
          uploadedDoc={getDocument("vat_certificate")}
          onUpload={(doc) => handleDocumentUpload("vat_certificate", doc)}
          onRemove={() => handleDocumentRemove("vat_certificate")}
          helpText="VAT registration certificate (if applicable)"
        />

        {/* ID/Passport of Director */}
        <DocUpload
          label="ID/Passport of Director(s)"
          documentType="director_id"
          uploadedDoc={getDocument("director_id")}
          onUpload={(doc) => handleDocumentUpload("director_id", doc)}
          onRemove={() => handleDocumentRemove("director_id")}
          helpText="ID or passport of directors and shareholders over 25%"
        />
      </div>

      <div className="rounded-lg bg-blue-50 p-4">
        <p className="text-sm text-blue-900">
          <strong>Note:</strong> You can skip document uploads for now and
          provide them later. However, submitting documents now will speed up
          your onboarding process.
        </p>
      </div>
    </div>
  );
}
