/**
 * Shared Form Utilities
 * Reusable form helpers and patterns
 */

import type { FieldError } from "react-hook-form";

/**
 * Format form error message
 */
export function getErrorMessage(error?: FieldError): string | undefined {
  return error?.message;
}

/**
 * Check if field has error
 */
export function hasError(error?: FieldError): boolean {
  return !!error;
}

/**
 * Generate form field ID
 */
export function getFieldId(name: string, prefix?: string): string {
  return prefix ? `${prefix}-${name}` : name;
}

/**
 * Scroll to first error in form
 */
export function scrollToFirstError(formElement: HTMLFormElement): void {
  const firstError = formElement.querySelector('[aria-invalid="true"]');
  if (firstError) {
    firstError.scrollIntoView({ behavior: "smooth", block: "center" });
    (firstError as HTMLElement).focus();
  }
}

/**
 * Common validation messages
 */
export const VALIDATION_MESSAGES = {
  required: (field: string) => `${field} is required`,
  email: "Please enter a valid email address",
  phone: "Please enter a valid phone number",
  minLength: (field: string, min: number) => 
    `${field} must be at least ${min} characters`,
  maxLength: (field: string, max: number) => 
    `${field} must not exceed ${max} characters`,
  min: (field: string, min: number) => 
    `${field} must be at least ${min}`,
  max: (field: string, max: number) => 
    `${field} must not exceed ${max}`,
} as const;

/**
 * Format phone number for display
 */
export function formatPhoneNumber(
  countryCode: string,
  number: string
): string {
  return `${countryCode} ${number}`;
}

/**
 * Parse date for form input
 */
export function formatDateForInput(date: Date | string): string {
  const d = typeof date === "string" ? new Date(date) : date;
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

/**
 * Calculate age from date of birth
 */
export function calculateAge(dateOfBirth: string): number {
  const today = new Date();
  const birthDate = new Date(dateOfBirth);
  let age = today.getFullYear() - birthDate.getFullYear();
  const monthDiff = today.getMonth() - birthDate.getMonth();
  
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
    age--;
  }
  
  return age;
}
