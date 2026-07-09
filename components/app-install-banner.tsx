"use client";

import { useEffect, useState } from "react";
import { Smartphone, Apple, X, Share, Plus } from "lucide-react";

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

export function AppInstallBanner() {
  const [installPrompt, setInstallPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isIOS, setIsIOS] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);
  const [showIOSGuide, setShowIOSGuide] = useState(false);

  useEffect(() => {
    // Detect iOS
    const ios = /iphone|ipad|ipod/i.test(navigator.userAgent);
    setIsIOS(ios);

    // Detect if already installed as PWA
    const installed =
      window.matchMedia("(display-mode: standalone)").matches ||
      (navigator as any).standalone === true;
    setIsInstalled(installed);

    // Capture Android install prompt
    const handler = (e: Event) => {
      e.preventDefault();
      setInstallPrompt(e as BeforeInstallPromptEvent);
    };
    window.addEventListener("beforeinstallprompt", handler);
    return () => window.removeEventListener("beforeinstallprompt", handler);
  }, []);

  // Don't show if already installed as PWA
  if (isInstalled) return null;

  const handleAndroidInstall = async () => {
    if (!installPrompt) return;
    await installPrompt.prompt();
    const { outcome } = await installPrompt.userChoice;
    if (outcome === "accepted") setInstallPrompt(null);
  };

  return (
    <>
      <section className="bg-gradient-to-r from-brand-dark to-[#3a3a30] py-10 md:py-14">
        <div className="container mx-auto max-w-7xl px-6">
          <div className="flex flex-col items-center gap-6 text-center md:flex-row md:justify-between md:text-left">
            <div className="text-white">
              <p className="text-xs font-semibold uppercase tracking-widest text-brand-gold mb-1">
                Mobile App
              </p>
              <h2 className="text-2xl font-bold md:text-3xl">
                Download Opulanz on your phone
              </h2>
              <p className="mt-2 text-sm text-white/70 max-w-md">
                Access your banking, investments and tax services anywhere — free, no App Store required.
              </p>
            </div>

            <div className="flex flex-col gap-3 sm:flex-row">
              {/* Android button */}
              <button
                onClick={handleAndroidInstall}
                disabled={!installPrompt}
                className="flex items-center gap-3 rounded-xl bg-white px-5 py-3 text-brand-dark shadow-lg transition hover:shadow-xl hover:scale-105 disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:scale-100 disabled:hover:shadow-lg"
                title={!installPrompt ? "Open in Chrome on Android to install" : "Install on Android"}
              >
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#3ddc84]/10">
                  <Smartphone className="h-5 w-5 text-[#3ddc84]" />
                </div>
                <div className="text-left">
                  <p className="text-[10px] font-medium text-gray-500 uppercase tracking-wide">Get it on</p>
                  <p className="text-sm font-bold leading-tight">Android</p>
                </div>
              </button>

              {/* iPhone button */}
              <button
                onClick={() => setShowIOSGuide(true)}
                className="flex items-center gap-3 rounded-xl bg-white px-5 py-3 text-brand-dark shadow-lg transition hover:shadow-xl hover:scale-105"
              >
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-black/5">
                  <Apple className="h-5 w-5 text-black" />
                </div>
                <div className="text-left">
                  <p className="text-[10px] font-medium text-gray-500 uppercase tracking-wide">Add to</p>
                  <p className="text-sm font-bold leading-tight">iPhone / iPad</p>
                </div>
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* iOS Install Guide Modal */}
      {showIOSGuide && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/60 backdrop-blur-sm sm:items-center">
          <div className="relative w-full max-w-sm rounded-t-2xl bg-white p-6 shadow-2xl sm:rounded-2xl">
            <button
              onClick={() => setShowIOSGuide(false)}
              className="absolute right-4 top-4 rounded-full p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-600"
            >
              <X className="h-5 w-5" />
            </button>

            <div className="flex items-center gap-3 mb-5">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-black">
                <Apple className="h-6 w-6 text-white" />
              </div>
              <div>
                <h3 className="font-bold text-brand-dark">Install on iPhone</h3>
                <p className="text-xs text-gray-500">Add to your Home Screen in 3 steps</p>
              </div>
            </div>

            <ol className="space-y-4">
              <li className="flex items-start gap-3">
                <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-brand-gold text-white text-xs font-bold">1</span>
                <div>
                  <p className="text-sm font-semibold text-brand-dark">Open in Safari</p>
                  <p className="text-xs text-gray-500">This must be opened in Safari (not Chrome)</p>
                </div>
              </li>
              <li className="flex items-start gap-3">
                <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-brand-gold text-white text-xs font-bold">2</span>
                <div>
                  <p className="text-sm font-semibold text-brand-dark flex items-center gap-1">
                    Tap the Share button <Share className="h-3.5 w-3.5 inline" />
                  </p>
                  <p className="text-xs text-gray-500">The box with an arrow at the bottom of your screen</p>
                </div>
              </li>
              <li className="flex items-start gap-3">
                <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-brand-gold text-white text-xs font-bold">3</span>
                <div>
                  <p className="text-sm font-semibold text-brand-dark flex items-center gap-1">
                    Tap "Add to Home Screen" <Plus className="h-3.5 w-3.5 inline" />
                  </p>
                  <p className="text-xs text-gray-500">Scroll down in the share menu and tap Add</p>
                </div>
              </li>
            </ol>

            <button
              onClick={() => setShowIOSGuide(false)}
              className="mt-6 w-full rounded-xl bg-brand-dark py-3 text-sm font-semibold text-white transition hover:bg-brand-dark/90"
            >
              Got it
            </button>
          </div>
        </div>
      )}
    </>
  );
}
