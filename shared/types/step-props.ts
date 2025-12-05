/**
 * Common Types for Form Steps
 * Eliminates 'any' types across step components
 */

/**
 * Generic step props for multi-step forms
 */
export interface StepProps<T = Record<string, unknown>> {
  data: T;
  onUpdate: (data: Partial<T>) => void;
  onNext: () => void;
}

/**
 * Step props with optional onBack
 */
export interface NavigableStepProps<T = Record<string, unknown>> extends StepProps<T> {
  onBack?: () => void;
}

/**
 * Welcome step props (typically no data)
 */
export interface WelcomeStepProps {
  data?: Record<string, unknown>;
  onUpdate: (data: Record<string, unknown>) => void;
  onNext: () => void;
}

/**
 * Submission step props with application ID
 */
export interface SubmissionStepProps<T = Record<string, unknown>> {
  data: T;
  onUpdate: (data: Partial<T>) => void;
  applicationId: string;
}

/**
 * Review step props with form data
 */
export interface ReviewStepProps<T = Record<string, unknown>> {
  data: T;
  onUpdate: (data: Partial<T>) => void;
  onNext: () => void;
  onBack?: () => void;
}
