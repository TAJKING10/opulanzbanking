"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

/**
 * Root page redirect
 * In static export (Capacitor mobile), uses client-side redirect.
 * Redirects / to /en (default locale)
 */
export default function RootPage() {
  const router = useRouter();

  useEffect(() => {
    router.replace("/en");
  }, [router]);

  return null;
}
