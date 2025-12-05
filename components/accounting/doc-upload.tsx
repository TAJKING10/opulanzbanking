"use client";

import * as React from "react";
import { Upload, X, FileText, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { formatFileSize } from "@/shared/lib/file-upload";
import { useDragAndDrop } from "@/shared/hooks/use-drag-and-drop";

// Constants
const UPLOAD_DELAY_MS = 1500;

// Types
export interface UploadedDocument {
  type: string;
  fileId: string;
  fileName: string;
  fileSize: number;
}

interface DocUploadProps {
  label: string;
  documentType: string;
  uploadedDoc?: UploadedDocument;
  onUpload: (doc: UploadedDocument) => void;
  onRemove: () => void;
  accept?: string;
  helpText?: string;
}

// Helper function
const generateFileId = (): string => {
  return `file_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
};

// Uploaded Document Card Component
interface UploadedDocCardProps {
  document: UploadedDocument;
  label: string;
  helpText?: string;
  onRemove: () => void;
}

const UploadedDocCard = React.memo(
  ({ document, label, helpText, onRemove }: UploadedDocCardProps) => (
    <div className="space-y-2">
      <p className="text-sm font-medium text-brand-dark">{label}</p>
      <div className="flex items-center justify-between rounded-lg border-2 border-green-200 bg-green-50 p-4">
        <div className="flex items-center gap-3">
          <CheckCircle className="h-5 w-5 text-green-600" />
          <div>
            <p className="text-sm font-medium text-brand-dark">
              {document.fileName}
            </p>
            <p className="text-xs text-brand-grayMed">
              {formatFileSize(document.fileSize)}
            </p>
          </div>
        </div>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={onRemove}
          className="text-red-500 hover:text-red-700"
        >
          <X className="h-4 w-4" />
        </Button>
      </div>
      {helpText && <p className="text-xs text-brand-grayMed">{helpText}</p>}
    </div>
  )
);

UploadedDocCard.displayName = "UploadedDocCard";

// Main Component
export function DocUpload({
  label,
  documentType,
  uploadedDoc,
  onUpload,
  onRemove,
  accept = ".pdf,.png,.jpg,.jpeg",
  helpText,
}: DocUploadProps) {
  const [isUploading, setIsUploading] = React.useState(false);
  const fileInputRef = React.useRef<HTMLInputElement>(null);
  const { isDragging, handleDragOver, handleDragLeave, handleDrop } =
    useDragAndDrop();

  const handleFile = React.useCallback(
    async (file: File) => {
      setIsUploading(true);

      // Simulate file upload (in real app, upload to server/S3)
      await new Promise((resolve) => setTimeout(resolve, UPLOAD_DELAY_MS));

      onUpload({
        type: documentType,
        fileId: generateFileId(),
        fileName: file.name,
        fileSize: file.size,
      });

      setIsUploading(false);
    },
    [documentType, onUpload]
  );

  const handleFileSelect = React.useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const files = e.target.files;
      if (files && files.length > 0) {
        handleFile(files[0]);
      }
    },
    [handleFile]
  );

  if (uploadedDoc) {
    return (
      <UploadedDocCard
        document={uploadedDoc}
        label={label}
        helpText={helpText}
        onRemove={onRemove}
      />
    );
  }

  return (
    <div className="space-y-2">
      <p className="text-sm font-medium text-brand-dark">{label}</p>
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={(e) => handleDrop(e, handleFile)}
        onClick={() => fileInputRef.current?.click()}
        className={`cursor-pointer rounded-lg border-2 border-dashed p-8 text-center transition-all ${
          isDragging
            ? "border-brand-gold bg-brand-gold/10"
            : "border-brand-grayLight hover:border-brand-gold hover:bg-brand-gold/5"
        } ${isUploading ? "pointer-events-none opacity-50" : ""}`}
      >
        <input
          ref={fileInputRef}
          type="file"
          className="hidden"
          accept={accept}
          onChange={handleFileSelect}
          disabled={isUploading}
        />
        <div className="flex flex-col items-center gap-2">
          {isUploading ? (
            <>
              <div className="h-10 w-10 animate-spin rounded-full border-4 border-brand-grayLight border-t-brand-gold"></div>
              <p className="text-sm text-brand-dark">Uploading...</p>
            </>
          ) : (
            <>
              <Upload className="h-10 w-10 text-brand-gold" />
              <p className="text-sm font-medium text-brand-dark">
                Drop file here or click to browse
              </p>
              <p className="text-xs text-brand-grayMed">
                PDF, PNG, JPG (max 10MB)
              </p>
            </>
          )}
        </div>
      </div>
      {helpText && <p className="text-xs text-brand-grayMed">{helpText}</p>}
    </div>
  );
}
