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
    // Only run in Capacitor native environment
    if (typeof window === "undefined") return;
    const isCapacitor = !!(window as any).Capacitor?.isNativePlatform?.();
    if (!isCapacitor) return;

    async function initNative() {
      try {
        const { SplashScreen } = await import("@capacitor/splash-screen");
        const { StatusBar, Style } = await import("@capacitor/status-bar");

        // Hide splash screen with a smooth fade
        await SplashScreen.hide({ fadeOutDuration: 300 });

        // Set status bar style (light content = white icons, dark content = dark icons)
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
