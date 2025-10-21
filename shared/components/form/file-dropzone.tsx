"use client";

import * as React from "react";
import { Upload, X, FileText, AlertCircle, CheckCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

interface FileDropzoneProps {
  maxSize?: number; // in MB
  acceptedTypes?: string[];
  multiple?: boolean;
  onFilesChange: (files: File[]) => void;
  error?: string;
  className?: string;
}

interface FileWithProgress {
  file: File;
  progress: number;
  status: "uploading" | "success" | "error";
  error?: string;
}

export function FileDropzone({
  maxSize = 15,
  acceptedTypes = [".pdf", ".jpg", ".jpeg", ".png", ".doc", ".docx"],
  multiple = true,
  onFilesChange,
  error,
  className,
}: FileDropzoneProps) {
  const [files, setFiles] = React.useState<FileWithProgress[]>([]);
  const [isDragging, setIsDragging] = React.useState(false);
  const inputRef = React.useRef<HTMLInputElement>(null);

  const validateFile = (file: File): string | null => {
    // Size validation
    if (file.size > maxSize * 1024 * 1024) {
      return `File size exceeds ${maxSize}MB`;
    }

    // Type validation
    const fileExtension = `.${file.name.split(".").pop()?.toLowerCase()}`;
    if (!acceptedTypes.includes(fileExtension)) {
      return `File type not accepted. Accepted types: ${acceptedTypes.join(", ")}`;
    }

    return null;
  };

  const handleFiles = (newFiles: FileList | null) => {
    if (!newFiles) return;

    const validFiles: FileWithProgress[] = [];
    Array.from(newFiles).forEach((file) => {
      const validationError = validateFile(file);
      validFiles.push({
        file,
        progress: 0,
        status: validationError ? "error" : "uploading",
        error: validationError || undefined,
      });
    });

    const updatedFiles = multiple ? [...files, ...validFiles] : validFiles;
    setFiles(updatedFiles);

    // Simulate upload progress
    validFiles.forEach((fileWithProgress, index) => {
      if (fileWithProgress.status === "error") return;

      let progress = 0;
      const interval = setInterval(() => {
        progress += 10;
        if (progress >= 100) {
          clearInterval(interval);
          setFiles((prev) =>
            prev.map((f) =>
              f.file === fileWithProgress.file
                ? { ...f, progress: 100, status: "success" }
                : f
            )
          );
        } else {
          setFiles((prev) =>
            prev.map((f) =>
              f.file === fileWithProgress.file ? { ...f, progress } : f
            )
          );
        }
      }, 200);
    });

    const successfulFiles = validFiles
      .filter((f) => !f.error)
      .map((f) => f.file);
    onFilesChange(successfulFiles);
  };

  const removeFile = (fileToRemove: File) => {
    const updatedFiles = files.filter((f) => f.file !== fileToRemove);
    setFiles(updatedFiles);
    onFilesChange(updatedFiles.filter((f) => f.status === "success").map((f) => f.file));
  };

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
    handleFiles(e.dataTransfer.files);
  };

  return (
    <div className={cn("space-y-4", className)}>
      {/* Dropzone */}
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => inputRef.current?.click()}
        className={cn(
          "flex cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed bg-white px-6 py-12 transition-colors",
          isDragging
            ? "border-brand-gold bg-brand-goldLight/20"
            : "border-brand-grayLight hover:border-brand-gold hover:bg-brand-off",
          error && "border-red-300 bg-red-50"
        )}
      >
        <Upload
          className={cn(
            "mb-4 h-10 w-10",
            isDragging ? "text-brand-gold" : "text-brand-grayMed"
          )}
        />
        <p className="mb-1 text-sm font-semibold text-brand-dark">
          Click to upload or drag and drop
        </p>
        <p className="text-xs text-brand-grayMed">
          {acceptedTypes.join(", ")} (max {maxSize}MB)
        </p>
      </div>

      <input
        ref={inputRef}
        type="file"
        className="hidden"
        multiple={multiple}
        accept={acceptedTypes.join(",")}
        onChange={(e) => handleFiles(e.target.files)}
      />

      {/* Error Message */}
      {error && (
        <div className="flex items-center gap-2 rounded-lg bg-red-50 p-3 text-sm text-red-700">
          <AlertCircle className="h-4 w-4 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Files List */}
      {files.length > 0 && (
        <div className="space-y-2">
          {files.map((fileWithProgress, index) => (
            <div
              key={`${fileWithProgress.file.name}-${index}`}
              className="flex items-center gap-3 rounded-lg border border-brand-grayLight bg-white p-3"
            >
              <FileText className="h-5 w-5 flex-shrink-0 text-brand-grayMed" />
              <div className="flex-1 overflow-hidden">
                <p className="truncate text-sm font-medium text-brand-dark">
                  {fileWithProgress.file.name}
                </p>
                <p className="text-xs text-brand-grayMed">
                  {(fileWithProgress.file.size / 1024 / 1024).toFixed(2)} MB
                </p>
                {fileWithProgress.status === "uploading" && (
                  <div className="mt-2 h-1 w-full overflow-hidden rounded-full bg-brand-grayLight">
                    <div
                      className="h-full bg-brand-gold transition-all duration-300"
                      style={{ width: `${fileWithProgress.progress}%` }}
                    />
                  </div>
                )}
                {fileWithProgress.error && (
                  <p className="mt-1 text-xs text-red-600">
                    {fileWithProgress.error}
                  </p>
                )}
              </div>
              {fileWithProgress.status === "success" && (
                <CheckCircle className="h-5 w-5 flex-shrink-0 text-green-600" />
              )}
              {fileWithProgress.status === "error" && (
                <AlertCircle className="h-5 w-5 flex-shrink-0 text-red-600" />
              )}
              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={(e) => {
                  e.stopPropagation();
                  removeFile(fileWithProgress.file);
                }}
                className="flex-shrink-0"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
