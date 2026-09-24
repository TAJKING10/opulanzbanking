// SPV Authentication & Token Storage Service
// Handles client-side tokens, cookies, and session state for SPV Investors and Admins

import type { AdminProfile, Investor } from "./investment-api";

const INVESTOR_TOKEN_KEY = "spv_investor_token";
const INVESTOR_DATA_KEY = "spv-investor-data";
const INVESTOR_ACCESS_KEY = "spv-access";
const INVESTOR_TIMESTAMP_KEY = "spv-timestamp";

const ADMIN_TOKEN_KEY = "spv_admin_token";
const ADMIN_DATA_KEY = "spv-admin-data";
const ADMIN_ACCESS_KEY = "spv-admin-access";
const ADMIN_TIMESTAMP_KEY = "spv-admin-timestamp";

// Token expiration period: 7 days in milliseconds
const SESSION_MAX_AGE_MS = 7 * 24 * 60 * 60 * 1000;

// Helper to set cookie readable by Next.js middleware and server requests
function setCookie(name: string, value: string, maxAgeSec: number = 7 * 24 * 60 * 60) {
  if (typeof document === "undefined") return;
  const isSecure = typeof window !== "undefined" && window.location.protocol === "https:";
  document.cookie = `${name}=${encodeURIComponent(value)}; path=/; max-age=${maxAgeSec}; SameSite=Lax${isSecure ? "; Secure" : ""}`;
}

// Helper to clear cookie
function clearCookie(name: string) {
  if (typeof document === "undefined") return;
  document.cookie = `${name}=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT; SameSite=Lax`;
}

// Helper to read cookie by name
export function getCookie(name: string): string | null {
  if (typeof document === "undefined") return null;
  const match = document.cookie.match(new RegExp(`(^|;\\s*)(${name})=([^;]*)`));
  return match ? decodeURIComponent(match[3]) : null;
}

// ============ INVESTOR AUTH ============

export function setSpvInvestorSession(token: string, investor: Investor): void {
  if (typeof window === "undefined") return;

  try {
    localStorage.setItem(INVESTOR_TOKEN_KEY, token);
    sessionStorage.setItem(INVESTOR_TOKEN_KEY, token);
    sessionStorage.setItem(INVESTOR_DATA_KEY, JSON.stringify(investor));
    sessionStorage.setItem(INVESTOR_ACCESS_KEY, "granted");
    sessionStorage.setItem(INVESTOR_TIMESTAMP_KEY, Date.now().toString());

    // Sync cookie for Next.js middleware edge verification
    setCookie("spv_investor_token", token);
  } catch (error) {
    console.error("Error setting SPV investor session:", error);
  }
}

export function getSpvInvestorToken(): string | null {
  if (typeof window === "undefined") return null;
  return (
    sessionStorage.getItem(INVESTOR_TOKEN_KEY) ||
    localStorage.getItem(INVESTOR_TOKEN_KEY) ||
    getCookie("spv_investor_token")
  );
}

export function getSpvInvestor(): Investor | null {
  if (typeof window === "undefined") return null;

  const dataStr = sessionStorage.getItem(INVESTOR_DATA_KEY);
  if (!dataStr) return null;

  const timestamp = sessionStorage.getItem(INVESTOR_TIMESTAMP_KEY);
  if (timestamp && Date.now() - parseInt(timestamp, 10) > SESSION_MAX_AGE_MS) {
    clearSpvInvestorSession();
    return null;
  }

  try {
    return JSON.parse(dataStr);
  } catch {
    return null;
  }
}

export function isSpvInvestorAuthenticated(): boolean {
  if (typeof window === "undefined") return false;
  const token = getSpvInvestorToken();
  const investor = getSpvInvestor();
  return Boolean(token && investor);
}

export function clearSpvInvestorSession(): void {
  if (typeof window === "undefined") return;

  try {
    localStorage.removeItem(INVESTOR_TOKEN_KEY);
    sessionStorage.removeItem(INVESTOR_TOKEN_KEY);
    sessionStorage.removeItem(INVESTOR_DATA_KEY);
    sessionStorage.removeItem(INVESTOR_ACCESS_KEY);
    sessionStorage.removeItem(INVESTOR_TIMESTAMP_KEY);
    clearCookie("spv_investor_token");
  } catch (error) {
    console.error("Error clearing SPV investor session:", error);
  }
}

// ============ ADMIN AUTH ============

export function setSpvAdminSession(token: string, admin: AdminProfile): void {
  if (typeof window === "undefined") return;

  try {
    localStorage.setItem(ADMIN_TOKEN_KEY, token);
    sessionStorage.setItem(ADMIN_TOKEN_KEY, token);
    sessionStorage.setItem(ADMIN_DATA_KEY, JSON.stringify(admin));
    sessionStorage.setItem(ADMIN_ACCESS_KEY, "granted");
    sessionStorage.setItem(ADMIN_TIMESTAMP_KEY, Date.now().toString());

    // Sync cookie for Next.js middleware edge verification
    setCookie("spv_admin_token", token);
  } catch (error) {
    console.error("Error setting SPV admin session:", error);
  }
}

export function getSpvAdminToken(): string | null {
  if (typeof window === "undefined") return null;
  return (
    sessionStorage.getItem(ADMIN_TOKEN_KEY) ||
    localStorage.getItem(ADMIN_TOKEN_KEY) ||
    getCookie("spv_admin_token")
  );
}

export function getSpvAdmin(): AdminProfile | null {
  if (typeof window === "undefined") return null;

  const dataStr = sessionStorage.getItem(ADMIN_DATA_KEY);
  if (!dataStr) return null;

  const timestamp = sessionStorage.getItem(ADMIN_TIMESTAMP_KEY);
  if (timestamp && Date.now() - parseInt(timestamp, 10) > SESSION_MAX_AGE_MS) {
    clearSpvAdminSession();
    return null;
  }

  try {
    return JSON.parse(dataStr);
  } catch {
    return null;
  }
}

export function isSpvAdminAuthenticated(): boolean {
  if (typeof window === "undefined") return false;
  const token = getSpvAdminToken();
  const admin = getSpvAdmin();
  return Boolean(token && admin);
}

export function clearSpvAdminSession(): void {
  if (typeof window === "undefined") return;

  try {
    localStorage.removeItem(ADMIN_TOKEN_KEY);
    sessionStorage.removeItem(ADMIN_TOKEN_KEY);
    sessionStorage.removeItem(ADMIN_DATA_KEY);
    sessionStorage.removeItem(ADMIN_ACCESS_KEY);
    sessionStorage.removeItem(ADMIN_TIMESTAMP_KEY);
    clearCookie("spv_admin_token");
  } catch (error) {
    console.error("Error clearing SPV admin session:", error);
  }
}
