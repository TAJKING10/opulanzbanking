"use client";

import * as React from "react";
import { useTranslations } from "next-intl";
import { Upload, X, CheckCircle, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

export interface UploadedDocument {
  type: string;
  fileId: string;
  fileName: string;
  fileSize: number;
  fileUrl?: string;
  blobName?: string;
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

export function DocUpload({
  label,
  documentType,
  uploadedDoc,
  onUpload,
  onRemove,
  accept = ".pdf,.png,.jpg,.jpeg",
  helpText,
}: DocUploadProps) {
  const t = useTranslations("accounting.documents.upload");
  const [isDragging, setIsDragging] = React.useState(false);
  const [isUploading, setIsUploading] = React.useState(false);
  const [uploadError, setUploadError] = React.useState<string | null>(null);
  const [progress, setProgress] = React.useState(0);
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => setIsDragging(false);

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0) handleFile(files[0]);
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) handleFile(e.target.files[0]);
  };

  const handleFile = async (file: File) => {
    // Client-side validation
    const allowed = ["application/pdf", "image/png", "image/jpeg", "image/jpg"];
    if (!allowed.includes(file.type)) {
      setUploadError("Only PDF, PNG, and JPG files are allowed.");
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      setUploadError("File is too large. Maximum size is 10 MB.");
      return;
    }

    setIsUploading(true);
    setUploadError(null);
    setProgress(10);

    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("type", documentType);

      // Animate progress while waiting for server
      const progressTimer = setInterval(() => {
        setProgress((p) => (p < 85 ? p + 5 : p));
      }, 300);

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000"}/api/upload`,
        {
          method: "POST",
          body: formData,
          // No Content-Type header — browser sets it automatically with boundary
        }
      );

      clearInterval(progressTimer);

      if (!response.ok) {
        const err = await response.json().catch(() => ({}));
        throw new Error(err.error || `Upload failed (${response.status})`);
      }

      const result = await response.json();
      const { fileId, fileName, fileSize, fileUrl, blobName } = result.data;

      setProgress(100);

      onUpload({
        type: documentType,
        fileId,
        fileName,
        fileSize,
        fileUrl,
        blobName,
      });
    } catch (err: any) {
      setUploadError(err.message || "Upload failed. Please try again.");
    } finally {
      setIsUploading(false);
      setProgress(0);
      // Reset input so the same file can be re-selected after removal
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return bytes + " B";
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + " KB";
    return (bytes / (1024 * 1024)).toFixed(1) + " MB";
  };

  // ── Uploaded state ───────────────────────────────────────────────────────
  if (uploadedDoc) {
    return (
      <div className="space-y-2">
        <p className="text-sm font-medium text-brand-dark">{label}</p>
        <div className="flex items-center justify-between rounded-lg border-2 border-green-200 bg-green-50 p-4">
          <div className="flex items-center gap-3">
            <CheckCircle className="h-5 w-5 flex-shrink-0 text-green-600" />
            <div className="min-w-0">
              <p className="truncate text-sm font-medium text-brand-dark">
                {uploadedDoc.fileName}
              </p>
              <p className="text-xs text-brand-grayMed">
                {formatFileSize(uploadedDoc.fileSize)}
                {uploadedDoc.fileUrl && (
                  <span className="ml-2 text-green-600">• Saved to Azure</span>
                )}
              </p>
            </div>
          </div>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={onRemove}
            className="ml-2 flex-shrink-0 text-red-500 hover:text-red-700"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
        {helpText && <p className="text-xs text-brand-grayMed">{helpText}</p>}
      </div>
    );
  }

  // ── Upload zone ──────────────────────────────────────────────────────────
  return (
    <div className="space-y-2">
      <p className="text-sm font-medium text-brand-dark">{label}</p>

      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => !isUploading && fileInputRef.current?.click()}
        className={`relative cursor-pointer overflow-hidden rounded-lg border-2 border-dashed p-8 text-center transition-all ${
          isDragging
            ? "border-brand-gold bg-brand-gold/10"
            : "border-brand-grayLight hover:border-brand-gold hover:bg-brand-gold/5"
        } ${isUploading ? "pointer-events-none" : ""}`}
      >
        <input
          ref={fileInputRef}
          type="file"
          className="hidden"
          accept={accept}
          onChange={handleFileSelect}
          disabled={isUploading}
        />

        {/* Progress bar */}
        {isUploading && progress > 0 && (
          <div className="absolute inset-x-0 top-0 h-1 bg-brand-grayLight">
            <div
              className="h-full bg-brand-gold transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
        )}

        <div className="flex flex-col items-center gap-2">
          {isUploading ? (
            <>
              <div className="h-10 w-10 animate-spin rounded-full border-4 border-brand-grayLight border-t-brand-gold" />
              <p className="text-sm font-medium text-brand-dark">
                Uploading to Azure… {progress}%
              </p>
            </>
          ) : (
            <>
              <Upload className="h-10 w-10 text-brand-gold" />
              <p className="text-sm font-medium text-brand-dark">
                {t("dropOrClick")}
              </p>
              <p className="text-xs text-brand-grayMed">PDF, PNG, JPG — max 10 MB</p>
            </>
          )}
        </div>
      </div>

      {/* Error message */}
      {uploadError && (
        <div className="flex items-start gap-2 rounded-lg border border-red-200 bg-red-50 p-3">
          <AlertCircle className="mt-0.5 h-4 w-4 flex-shrink-0 text-red-500" />
          <p className="text-sm text-red-700">{uploadError}</p>
        </div>
      )}

      {helpText && <p className="text-xs text-brand-grayMed">{helpText}</p>}
    </div>
  );
}
