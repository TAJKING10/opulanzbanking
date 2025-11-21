/**
 * Lot 0.1 - Warm Referral Routing Logic
 *
 * This module handles partner selection and signed redirect URL generation.
 *
 * IMPORTANT: This is a front-end implementation for demo purposes.
 * In production, the HMAC signing and partner routing should be moved to
 * a secure backend API to protect signing keys and business logic.
 */

import type {
  Application,
  ReferralRouting,
  ReferralConfig,
  PartnerName,
  Jurisdiction,
} from "@/types/account-opening";

/**
 * Referral configuration
 * TODO: Move to environment variables and backend
 */
const REFERRAL_CONFIG: ReferralConfig = {
  // Demo keys - NEVER use in production
  narviKey: "demo_narvi_key_replace_me",
  olkyKey: "demo_olky_key_replace_me",
  narviBaseUrl: "https://narvi-demo.example.com/onboarding",
  olkyBaseUrl: "https://olky-demo.example.com/onboarding",
};

/**
 * Determine partner based on application data
 */
export function determinePartner(application: Application): PartnerName {
  let jurisdictions: Jurisdiction[] = [];

  if (application.mode === "personal") {
    jurisdictions = application.intent.preferredJurisdictions;
  } else {
    jurisdictions = application.intent.jurisdictions;
  }

  // Simple routing rules for Lot 0.1
  if (jurisdictions.includes("finland")) {
    return "narvi";
  }

  if (
    jurisdictions.includes("luxembourg") ||
    jurisdictions.includes("france")
  ) {
    return "olky";
  }

  // Default to manual review
  return "manual_review";
}

/**
 * Simple HMAC-SHA256 implementation for browser
 * TODO: Replace with backend signing in production
 */
async function simpleHmac(key: string, message: string): Promise<string> {
  const encoder = new TextEncoder();
  const keyData = encoder.encode(key);
  const messageData = encoder.encode(message);

  // Import key for HMAC
  const cryptoKey = await crypto.subtle.importKey(
    "raw",
    keyData,
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  );

  // Sign the message
  const signature = await crypto.subtle.sign("HMAC", cryptoKey, messageData);

  // Convert to hex string
  return Array.from(new Uint8Array(signature))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

/**
 * Generate signed redirect URL for partner
 */
export async function generateReferralRouting(
  application: Application
): Promise<ReferralRouting> {
  const partner = determinePartner(application);

  // If manual review, return placeholder
  if (partner === "manual_review") {
    return {
      partner,
      redirectUrl: "",
      signedPayload: {
        ref: "OPZ",
        partner,
        user_ref: application.userRef,
        ts: Date.now(),
        scope: "open_account",
        sig: "",
      },
    };
  }

  // Build base URL
  const baseUrl =
    partner === "narvi"
      ? REFERRAL_CONFIG.narviBaseUrl
      : REFERRAL_CONFIG.olkyBaseUrl;

  const key =
    partner === "narvi" ? REFERRAL_CONFIG.narviKey : REFERRAL_CONFIG.olkyKey;

  // Build query parameters
  const ts = Date.now();
  const params = {
    ref: "OPZ",
    partner,
    user_ref: application.userRef,
    ts: ts,
    scope: "open_account",
  };

  // Create signing message (sorted params)
  const signingMessage = `${params.ref}|${params.partner}|${params.user_ref}|${params.ts}|${params.scope}`;

  // Generate HMAC signature
  const sig = await simpleHmac(key, signingMessage);

  // Build final URL
  const url = new URL(baseUrl);
  url.searchParams.set("ref", params.ref);
  url.searchParams.set("partner", params.partner);
  url.searchParams.set("user_ref", params.user_ref);
  url.searchParams.set("ts", params.ts.toString());
  url.searchParams.set("scope", params.scope);
  url.searchParams.set("sig", sig);

  return {
    partner,
    redirectUrl: url.toString(),
    signedPayload: {
      ref: params.ref,
      partner: params.partner,
      user_ref: params.user_ref,
      ts: ts,
      scope: params.scope,
      sig,
    },
  };
}

/**
 * Get partner display name
 */
export function getPartnerDisplayName(partner: PartnerName): string {
  switch (partner) {
    case "narvi":
      return "Opulanz Partner Bank";
    case "olky":
      return "Opulanz Partner Bank";
    case "manual_review":
      return "Opulanz Banking";
  }
}

/**
 * Get partner explanation text
 */
export function getPartnerExplanation(partner: PartnerName): string {
  if (partner === "manual_review") {
    return "Your application requires manual review. Our team will match you with the best banking partner and contact you within 24-72 hours.";
  }

  return "Your account will be opened by an Opulanz Partner Bank. Opulanz remains your point of contact throughout the process.";
}

/**
 * Store referral in localStorage
 */
export function saveReferralEntry(
  application: Application,
  partner: PartnerName,
  status: "CLICKED" | "COMPLETED" | "FAILED" = "CLICKED"
): void {
  const entry = {
    userRef: application.userRef,
    partner,
    mode: application.mode,
    status,
    timestamp: new Date().toISOString(),
    application,
  };

  // Get existing entries
  const stored = localStorage.getItem("opulanz_applications");
  const entries = stored ? JSON.parse(stored) : [];

  // Add new entry
  entries.push(entry);

  // Save back
  localStorage.setItem("opulanz_applications", JSON.stringify(entries));

  // Also log to console for demo
  console.log("🏦 Opulanz Referral Entry:", entry);
}
