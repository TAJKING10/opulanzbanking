/**
 * Reusable Document Uploader Component
 * Consolidates file upload UI and logic
 */

import * as React from "react";
import { Button } from "@/components/ui/button";
import { Upload, FileText, X, CheckCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  validateFile,
  processFileUpload,
  formatFileSize,
  type UploadedDocument,
} from "@/shared/lib/file-upload";

export interface DocumentUploaderProps {
  category: string;
  label: string;
  description?: string;
  isUploaded?: boolean;
  onUpload: (document: UploadedDocument, file: File) => void;
  required?: boolean;
  className?: string;
}

export function DocumentUploader({
  category,
  label,
  description,
  isUploaded,
  onUpload,
  required,
  className,
}: DocumentUploaderProps) {
  const inputRef = React.useRef<HTMLInputElement>(null);
  const [error, setError] = React.useState<string>();

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setError(undefined);
    const files = event.target.files;
    if (!files || files.length === 0) return;

    const file = files[0];
    const validation = validateFile(file);

    if (!validation.valid) {
      setError(validation.error);
      return;
    }

    const result = processFileUpload(file, category);
    if (result.success) {
      onUpload(result.document, file);
    } else {
      setError(result.error);
    }

    // Reset input
    if (inputRef.current) {
      inputRef.current.value = "";
    }
  };

  return (
    <div className={cn("p-4 bg-brand-goldLight/10 rounded-lg space-y-3", className)}>
      <div className="flex items-start gap-3">
        <CheckCircle className="h-5 w-5 text-brand-gold mt-0.5 flex-shrink-0" />
        <div className="flex-1">
          <p className="font-medium text-brand-dark">
            {label}
            {required && <span className="text-red-500 ml-1">*</span>}
          </p>
          {description && (
            <p className="text-sm text-brand-grayMed">{description}</p>
          )}
        </div>
      </div>
      <div className="pl-8">
        <input
          ref={inputRef}
          type="file"
          accept="image/*,.pdf"
          onChange={handleFileChange}
          className="hidden"
          id={`upload-${category}`}
        />
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => inputRef.current?.click()}
          className="w-full sm:w-auto"
        >
          <Upload className="mr-2 h-4 w-4" />
          {isUploaded ? "✓ Uploaded" : `Upload ${label}`}
        </Button>
        {error && (
          <p className="mt-2 text-sm text-red-500" role="alert">
            {error}
          </p>
        )}
      </div>
    </div>
  );
}

export interface DocumentListProps {
  documents: UploadedDocument[];
  onRemove: (id: string) => void;
}

export function DocumentList({ documents, onRemove }: DocumentListProps) {
  if (documents.length === 0) return null;

  return (
    <div className="space-y-2 pt-6 border-t border-gray-200 mt-6">
      <p className="text-sm font-semibold text-brand-dark">
        Uploaded Documents ({documents.length})
      </p>
      <div className="space-y-2">
        {documents.map((doc) => (
          <div
            key={doc.id}
            className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
          >
            <div className="flex items-center gap-3 flex-1 min-w-0">
              <FileText className="h-5 w-5 text-brand-gold flex-shrink-0" />
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium text-brand-dark truncate">
                  {doc.name}
                </p>
                <p className="text-xs text-brand-grayMed">
                  {doc.category.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase())} •{" "}
                  {formatFileSize(doc.size)}
                </p>
              </div>
            </div>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => onRemove(doc.id)}
              className="flex-shrink-0"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        ))}
      </div>
    </div>
  );
}
