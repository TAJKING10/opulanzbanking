"use client";

import { useEffect } from "react";

/**
 * Initializes Capacitor native plugins when running as a mobile app.
 * - Hides the splash screen after the app loads
 * - Configures the status bar style and color
 *
 * Safe to include in all builds — checks for Capacitor environment before running.
 */
export function CapacitorInit() {
  useEffect(() => {
    if (typeof window === "undefined") return;

    // Register PWA service worker (web browsers only, not Capacitor native)
    const isCapacitor = !!(window as any).Capacitor?.isNativePlatform?.();
    if (!isCapacitor && "serviceWorker" in navigator) {
      navigator.serviceWorker
        .register("/sw.js")
        .catch(() => {/* fail silently */});
    }

    // Init Capacitor native plugins
    if (!isCapacitor) return;

    async function initNative() {
      try {
        const { SplashScreen } = await import("@capacitor/splash-screen");
        const { StatusBar, Style } = await import("@capacitor/status-bar");

        await SplashScreen.hide({ fadeOutDuration: 300 });
        await StatusBar.setStyle({ style: Style.Default });
        await StatusBar.setBackgroundColor({ color: "#ffffff" });
      } catch {
        // Plugins may not be available in web preview — fail silently
      }
    }

    initNative();
  }, []);

  return null;
}
