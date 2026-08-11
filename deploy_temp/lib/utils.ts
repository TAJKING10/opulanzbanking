import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDate(date: Date, locale: string): string {
  return new Intl.DateTimeFormat(locale, {
    year: "numeric",
    month: "long",
    day: "numeric",
  }).format(date);
}

export function formatIBAN(iban: string, locale: string): string {
  // Format IBAN with spaces for readability
  return iban.replace(/(.{4})/g, "$1 ").trim();
}

export function generateRedirectUrl(partner: string, data: Record<string, unknown>): string {
  // Mock function - in production, this would call a secure API endpoint
  const params = new URLSearchParams(data as Record<string, string>);
  return `/api/redirect/${partner}?${params.toString()}`;
}
