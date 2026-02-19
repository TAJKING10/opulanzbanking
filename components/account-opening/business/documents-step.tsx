"use client";

import * as React from "react";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Upload, CheckCircle, XCircle, FileText, AlertCircle } from "lucide-react";

interface Document {
  id: string;
  name: string;
  required: boolean;
  uploaded: boolean;
  file?: File;
}

interface BusinessDocumentsStepProps {
  data: any;
  onUpdate: (data: any) => void;
  onNext: () => void;
}

export function BusinessDocumentsStep({ data, onUpdate, onNext }: BusinessDocumentsStepProps) {
  const t = useTranslations("accountForms.business.documents");
  const tc = useTranslations("accountForms.common");

  const [documents, setDocuments] = React.useState<Document[]>([
    {
      id: "company-registration",
      name: t("companyRegistration"),
      required: data.companyStatus === "existing",
      uploaded: false,
    },
    {
      id: "articles",
      name: t("articles"),
      required: data.companyStatus === "existing",
      uploaded: false,
    },
    {
      id: "ubo-register",
      name: t("uboRegister"),
      required: true,
      uploaded: false,
    },
    {
      id: "director-ids",
      name: t("directorIds"),
      required: true,
      uploaded: false,
    },
    {
      id: "ubo-ids",
      name: t("uboIds"),
      required: true,
      uploaded: false,
    },
    {
      id: "business-address",
      name: t("businessAddress"),
      required: true,
      uploaded: false,
    },
  ]);

  const [uploadLater, setUploadLater] = React.useState(data.uploadLater || false);

  const handleFileUpload = (documentId: string, event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const validTypes = ["application/pdf", "image/jpeg", "image/png"];
      if (!validTypes.includes(file.type)) {
        alert("Please upload a PDF, JPG, or PNG file");
        return;
      }

      if (file.size > 5 * 1024 * 1024) {
        alert("File size must be less than 5MB");
        return;
      }

      setDocuments((prev) =>
        prev.map((doc) =>
          doc.id === documentId ? { ...doc, uploaded: true, file } : doc
        )
      );

      console.log(`Uploading ${file.name}...`);
    }
  };

  const handleUploadLaterChange = (checked: boolean) => {
    setUploadLater(checked);
  };

  const requiredDocs = documents.filter((doc) => doc.required);
  const allRequiredUploaded = requiredDocs.every((doc) => doc.uploaded);
  const isDocumentsStepValid = allRequiredUploaded || uploadLater;

  // Update parent with validation status
  React.useEffect(() => {
    onUpdate({
      documents: documents.filter((doc) => doc.uploaded),
      uploadLater,
      isDocumentsStepValid,
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isDocumentsStepValid, uploadLater]);

  return (
    <div className="space-y-8">
      <div>
        <h2 className="mb-2 text-2xl font-bold text-brand-dark">{t("title")}</h2>
        <p className="text-brand-grayMed">
          {t("description")}
        </p>
      </div>

      <div className="space-y-6">
        {/* Document Checklist */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-brand-dark">{tc("requiredDocuments")}</h3>

          {documents.map((document) => (
            <div
              key={document.id}
              className={`rounded-lg border-2 p-4 transition-all ${
                document.uploaded
                  ? "border-green-200 bg-green-50"
                  : document.required
                  ? "border-gray-200 bg-white"
                  : "border-gray-100 bg-gray-50"
              }`}
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3">
                    {document.uploaded ? (
                      <CheckCircle className="h-5 w-5 flex-shrink-0 text-green-600" />
                    ) : (
                      <FileText className="h-5 w-5 flex-shrink-0 text-brand-gold" />
                    )}
                    <div>
                      <p className="font-semibold text-brand-dark">
                        {document.name}
                        {document.required && <span className="ml-1 text-red-500">*</span>}
                      </p>
                      {document.uploaded && document.file && (
                        <p className="mt-1 text-sm text-green-700">
                          {tc("uploaded")}: {document.file.name}
                        </p>
                      )}
                    </div>
                  </div>
                </div>

                <div>
                  {!document.uploaded ? (
                    <label htmlFor={`file-${document.id}`} className="cursor-pointer">
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        className="pointer-events-none"
                      >
                        <Upload className="mr-2 h-4 w-4" />
                        {tc("upload")}
                      </Button>
                      <input
                        id={`file-${document.id}`}
                        type="file"
                        accept=".pdf,.jpg,.jpeg,.png"
                        onChange={(e) => handleFileUpload(document.id, e)}
                        className="hidden"
                      />
                    </label>
                  ) : (
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() =>
                        setDocuments((prev) =>
                          prev.map((doc) =>
                            doc.id === document.id
                              ? { ...doc, uploaded: false, file: undefined }
                              : doc
                          )
                        )
                      }
                    >
                      <XCircle className="mr-2 h-4 w-4" />
                      {tc("remove")}
                    </Button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Upload Later Option */}
        <div className="rounded-lg border border-blue-200 bg-blue-50 p-4">
          <div className="flex items-start gap-3">
            <Checkbox
              id="upload-later"
              checked={uploadLater}
              onCheckedChange={handleUploadLaterChange}
              className="mt-1"
            />
            <div className="flex-1">
              <Label htmlFor="upload-later" className="cursor-pointer font-semibold text-blue-900">
                {tc("uploadLater")}
              </Label>
              <p className="mt-1 text-sm text-blue-800">{tc("uploadLaterDesc")}</p>
            </div>
          </div>
        </div>

        {/* File Requirements */}
        <div className="rounded-lg bg-gray-50 p-4">
          <h4 className="mb-2 text-sm font-semibold text-brand-dark">{tc("fileRequirements")}</h4>
          <ul className="space-y-1 text-sm text-brand-grayMed">
            <li>• {tc("fileReqFormats")}</li>
            <li>• {tc("fileReqSize")}</li>
            <li>• {tc("fileReqClear")}</li>
            <li>• {tc("fileReqValid")}</li>
          </ul>
        </div>

        {!isDocumentsStepValid && (
          <div className="flex items-start gap-3 rounded-lg border border-amber-200 bg-amber-50 p-4">
            <AlertCircle className="h-5 w-5 flex-shrink-0 text-amber-600" />
            <div className="text-sm text-amber-900">{tc("uploadRequired")}</div>
          </div>
        )}
      </div>
    </div>
  );
}
