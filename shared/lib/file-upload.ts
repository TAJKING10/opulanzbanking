/**
 * Shared File Upload Utilities
 * Centralized document handling with validation
 */

export type UploadedDocument = {
  id: string;
  name: string;
  type: string;
  size: number;
  category: string;
  uploadedAt: string;
  // Do NOT store base64 data - send to server or use FormData
};

export type FileUploadResult = 
  | { success: true; document: UploadedDocument }
  | { success: false; error: string };

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const ALLOWED_TYPES = [
  "image/jpeg",
  "image/jpg", 
  "image/png",
  "image/webp",
  "application/pdf",
];

/**
 * Validate file before upload
 */
export function validateFile(file: File): { valid: boolean; error?: string } {
  if (file.size > MAX_FILE_SIZE) {
    return {
      valid: false,
      error: `File "${file.name}" is too large. Maximum size is 5MB.`,
    };
  }

  if (!ALLOWED_TYPES.includes(file.type)) {
    return {
      valid: false,
      error: `File type "${file.type}" is not supported. Please upload JPG, PNG, or PDF.`,
    };
  }

  return { valid: true };
}

/**
 * Process file upload (metadata only, not base64)
 */
export function processFileUpload(
  file: File,
  category: string
): FileUploadResult {
  const validation = validateFile(file);
  
  if (!validation.valid) {
    return { success: false, error: validation.error! };
  }

  const document: UploadedDocument = {
    id: crypto.randomUUID(),
    name: file.name,
    type: file.type,
    size: file.size,
    category,
    uploadedAt: new Date().toISOString(),
  };

  return { success: true, document };
}

/**
 * Create FormData for API upload
 */
export function createUploadFormData(
  file: File,
  additionalData?: Record<string, string>
): FormData {
  const formData = new FormData();
  formData.append("file", file);
  
  if (additionalData) {
    Object.entries(additionalData).forEach(([key, value]) => {
      formData.append(key, value);
    });
  }
  
  return formData;
}

/**
 * Format file size for display
 */
export function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}

/**
 * Get file extension
 */
export function getFileExtension(filename: string): string {
  return filename.slice(((filename.lastIndexOf(".") - 1) >>> 0) + 2);
}
