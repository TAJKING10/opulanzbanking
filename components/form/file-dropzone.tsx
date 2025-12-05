"use client";

import * as React from "react";
import { Upload, X, FileText, AlertCircle, CheckCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { formatFileSize } from "@/shared/lib/file-upload";
import { useDragAndDropMultiple } from "@/shared/hooks/use-drag-and-drop";

// Constants
const BYTES_PER_MB = 1024 * 1024;
const PROGRESS_INCREMENT = 10;
const PROGRESS_INTERVAL = 200;

// Types
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

// Helper functions
const validateFile = (
  file: File,
  maxSize: number,
  acceptedTypes: string[]
): string | null => {
  if (file.size > maxSize * BYTES_PER_MB) {
    return `File size exceeds ${maxSize}MB`;
  }

  const fileExtension = `.${file.name.split(".").pop()?.toLowerCase()}`;
  if (!acceptedTypes.includes(fileExtension)) {
    return `File type not accepted. Accepted types: ${acceptedTypes.join(", ")}`;
  }

  return null;
};

// File Item Component
interface FileItemProps {
  fileWithProgress: FileWithProgress;
  onRemove: (file: File) => void;
}

const FileItem = React.memo(({ fileWithProgress, onRemove }: FileItemProps) => {
  const { file, progress, status, error } = fileWithProgress;

  return (
    <div className="flex items-center gap-3 rounded-lg border border-brand-grayLight bg-white p-3">
      <FileText className="h-5 w-5 flex-shrink-0 text-brand-grayMed" />
      <div className="flex-1 overflow-hidden">
        <p className="truncate text-sm font-medium text-brand-dark">{file.name}</p>
        <p className="text-xs text-brand-grayMed">{formatFileSize(file.size)}</p>
        {status === "uploading" && (
          <div className="mt-2 h-1 w-full overflow-hidden rounded-full bg-brand-grayLight">
            <div
              className="h-full bg-brand-gold transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
        )}
        {error && <p className="mt-1 text-xs text-red-600">{error}</p>}
      </div>
      {status === "success" && (
        <CheckCircle className="h-5 w-5 flex-shrink-0 text-green-600" />
      )}
      {status === "error" && (
        <AlertCircle className="h-5 w-5 flex-shrink-0 text-red-600" />
      )}
      <Button
        type="button"
        variant="ghost"
        size="icon"
        onClick={(e) => {
          e.stopPropagation();
          onRemove(file);
        }}
        className="flex-shrink-0"
      >
        <X className="h-4 w-4" />
      </Button>
    </div>
  );
});

FileItem.displayName = "FileItem";

// Custom hook for file upload simulation
const useFileUploadSimulation = (
  setFiles: React.Dispatch<React.SetStateAction<FileWithProgress[]>>
) => {
  const simulateUpload = React.useCallback(
    (fileWithProgress: FileWithProgress) => {
      if (fileWithProgress.status === "error") return;

      let progress = 0;
      const interval = setInterval(() => {
        progress += PROGRESS_INCREMENT;
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
      }, PROGRESS_INTERVAL);
    },
    [setFiles]
  );

  return { simulateUpload };
};

// Main component
export function FileDropzone({
  maxSize = 15,
  acceptedTypes = [".pdf", ".jpg", ".jpeg", ".png", ".doc", ".docx"],
  multiple = true,
  onFilesChange,
  error,
  className,
}: FileDropzoneProps) {
  const [files, setFiles] = React.useState<FileWithProgress[]>([]);
  const inputRef = React.useRef<HTMLInputElement>(null);
  const { simulateUpload } = useFileUploadSimulation(setFiles);
  const { isDragging, handleDragOver, handleDragLeave, handleDrop } =
    useDragAndDropMultiple();

  const handleFiles = React.useCallback(
    (newFiles: FileList | null) => {
      if (!newFiles) return;

      const validFiles: FileWithProgress[] = Array.from(newFiles).map((file) => {
        const validationError = validateFile(file, maxSize, acceptedTypes);
        return {
          file,
          progress: 0,
          status: validationError ? "error" : "uploading",
          error: validationError || undefined,
        } as FileWithProgress;
      });

      const updatedFiles = multiple ? [...files, ...validFiles] : validFiles;
      setFiles(updatedFiles);

      validFiles.forEach(simulateUpload);

      const successfulFiles = validFiles
        .filter((f) => !f.error)
        .map((f) => f.file);
      onFilesChange(successfulFiles);
    },
    [files, maxSize, acceptedTypes, multiple, onFilesChange, simulateUpload]
  );

  const removeFile = React.useCallback(
    (fileToRemove: File) => {
      const updatedFiles = files.filter((f) => f.file !== fileToRemove);
      setFiles(updatedFiles);
      onFilesChange(
        updatedFiles.filter((f) => f.status === "success").map((f) => f.file)
      );
    },
    [files, onFilesChange]
  );

  return (
    <div className={cn("space-y-4", className)}>
      {/* Dropzone */}
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={(e) => handleDrop(e, handleFiles)}
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
            <FileItem
              key={`${fileWithProgress.file.name}-${index}`}
              fileWithProgress={fileWithProgress}
              onRemove={removeFile}
            />
          ))}
        </div>
      )}
    </div>
  );
}
