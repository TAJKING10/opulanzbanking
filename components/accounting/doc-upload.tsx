"use client";

import * as React from "react";
import { Upload, X, FileText, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

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

export function DocUpload({
  label,
  documentType,
  uploadedDoc,
  onUpload,
  onRemove,
  accept = ".pdf,.png,.jpg,.jpeg",
  helpText,
}: DocUploadProps) {
  const [isDragging, setIsDragging] = React.useState(false);
  const [isUploading, setIsUploading] = React.useState(false);
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0) {
      handleFile(files[0]);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      handleFile(files[0]);
    }
  };

  const handleFile = async (file: File) => {
    setIsUploading(true);

    // Simulate file upload (in real app, upload to server/S3)
    await new Promise((resolve) => setTimeout(resolve, 1500));

    const fileId = `file_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    onUpload({
      type: documentType,
      fileId,
      fileName: file.name,
      fileSize: file.size,
    });

    setIsUploading(false);
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return bytes + " B";
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + " KB";
    return (bytes / (1024 * 1024)).toFixed(1) + " MB";
  };

  if (uploadedDoc) {
    return (
      <div className="space-y-2">
        <p className="text-sm font-medium text-brand-dark">{label}</p>
        <div className="flex items-center justify-between rounded-lg border-2 border-green-200 bg-green-50 p-4">
          <div className="flex items-center gap-3">
            <CheckCircle className="h-5 w-5 text-green-600" />
            <div>
              <p className="text-sm font-medium text-brand-dark">
                {uploadedDoc.fileName}
              </p>
              <p className="text-xs text-brand-grayMed">
                {formatFileSize(uploadedDoc.fileSize)}
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
    );
  }

  return (
    <div className="space-y-2">
      <p className="text-sm font-medium text-brand-dark">{label}</p>
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
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
