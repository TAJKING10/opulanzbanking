/**
 * Safe Storage Utilities
 * Handles localStorage with quota management and fallbacks
 */

const STORAGE_QUOTA_MB = 5;
const STORAGE_QUOTA_BYTES = STORAGE_QUOTA_MB * 1024 * 1024;

export type StorageResult<T> = 
  | { success: true; data: T }
  | { success: false; error: string };

/**
 * Safely set item in localStorage with quota checking
 */
export function safeSetItem(key: string, value: unknown): StorageResult<void> {
  try {
    const serialized = JSON.stringify(value);
    const sizeInBytes = new Blob([serialized]).size;

    if (sizeInBytes > STORAGE_QUOTA_BYTES) {
      return {
        success: false,
        error: `Data size (${(sizeInBytes / 1024 / 1024).toFixed(2)}MB) exceeds ${STORAGE_QUOTA_MB}MB limit`,
      };
    }

    localStorage.setItem(key, serialized);
    return { success: true, data: undefined };
  } catch (error) {
    if (error instanceof Error && error.name === "QuotaExceededError") {
      return {
        success: false,
        error: "Storage quota exceeded. Please try removing old data or uploading files separately.",
      };
    }
    return {
      success: false,
      error: error instanceof Error ? error.message : "Storage write failed",
    };
  }
}

/**
 * Safely get item from localStorage
 */
export function safeGetItem<T>(key: string, defaultValue: T): T {
  try {
    const item = localStorage.getItem(key);
    if (!item) return defaultValue;
    return JSON.parse(item) as T;
  } catch (error) {
    console.warn(`Failed to parse localStorage item "${key}":`, error);
    return defaultValue;
  }
}

/**
 * Remove item from localStorage
 */
export function safeRemoveItem(key: string): void {
  try {
    localStorage.removeItem(key);
  } catch (error) {
    console.warn(`Failed to remove localStorage item "${key}":`, error);
  }
}

/**
 * Get current storage usage
 */
export function getStorageUsage(): { used: number; available: number } {
  try {
    let total = 0;
    for (let key in localStorage) {
      if (localStorage.hasOwnProperty(key)) {
        const item = localStorage.getItem(key);
        if (item) {
          total += new Blob([item]).size;
        }
      }
    }
    return {
      used: total,
      available: STORAGE_QUOTA_BYTES - total,
    };
  } catch {
    return { used: 0, available: STORAGE_QUOTA_BYTES };
  }
}

/**
 * Check if storage is available (handles private mode)
 */
export function isStorageAvailable(): boolean {
  try {
    const test = "__storage_test__";
    localStorage.setItem(test, test);
    localStorage.removeItem(test);
    return true;
  } catch {
    return false;
  }
}

/**
 * Store application metadata only (without heavy documents)
 */
export type ApplicationMetadata = {
  id: string;
  type: "personal" | "business" | "formation";
  submittedAt: string;
  status: "pending" | "submitted" | "completed";
  summary: Record<string, any>;
};

export function saveApplicationMetadata(
  metadata: ApplicationMetadata
): StorageResult<void> {
  const applications = safeGetItem<ApplicationMetadata[]>("opulanz_applications", []);
  
  // Keep only last 10 applications
  const updatedApplications = [...applications, metadata].slice(-10);
  
  return safeSetItem("opulanz_applications", updatedApplications);
}

export function getApplicationMetadata(): ApplicationMetadata[] {
  return safeGetItem<ApplicationMetadata[]>("opulanz_applications", []);
}
