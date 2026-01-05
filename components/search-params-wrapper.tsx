"use client";

import * as React from "react";

/**
 * Wrapper component that provides a Suspense boundary for components using useSearchParams()
 * This is required by Next.js 14+ to prevent build-time errors
 */
export function SearchParamsWrapper({ children }: { children: React.ReactNode }) {
  return (
    <React.Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-brand-gold border-r-transparent"></div>
      </div>
    }>
      {children}
    </React.Suspense>
  );
}
