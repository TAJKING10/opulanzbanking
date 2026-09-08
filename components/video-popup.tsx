"use client";

import * as React from "react";
import { Play, X, Volume2, Maximize2 } from "lucide-react";

interface VideoPopupProps {
  locale?: string;
  enVideoUrl?: string;
  frVideoUrl?: string;
  className?: string;
}

export function VideoPopup({
  locale = "en",
  enVideoUrl = "https://opulanzrgstorage.blob.core.windows.net/opulanz-documents/1788860571210-EN.mp4?sv=2026-06-06&se=2031-09-07T09%3A46%3A16Z&sr=b&sp=r&sig=4D5NPUcSlWyzIRFBqJn2TVz9eeMF12H%2F%2BQU37hi8Fyw%3D",
  frVideoUrl = "https://opulanzrgstorage.blob.core.windows.net/opulanz-documents/1788860584974-FR.mp4?sv=2026-06-06&se=2031-09-07T09%3A46%3A16Z&sr=b&sp=r&sig=KSp0aiLVbERgBIoPJYSl6rHKLioY0t6%2BPRWy9U5FlK8%3D",
  className = "",
}: VideoPopupProps) {
  const [isMounted, setIsMounted] = React.useState(false);
  const [isDismissed, setIsDismissed] = React.useState(true);
  const [isOpen, setIsOpen] = React.useState(false);
  const [activeVideoSrc, setActiveVideoSrc] = React.useState<string>("");
  const triggerRef = React.useRef<HTMLButtonElement>(null);
  const modalVideoRef = React.useRef<HTMLVideoElement>(null);
  const previewVideoRef = React.useRef<HTMLVideoElement>(null);

  const initialVideoSrc = locale === "fr" ? frVideoUrl : enVideoUrl;
  const fallbackVideoSrc = locale === "fr" ? "/videos/FR.mp4" : "/videos/EN.mp4";

  // Hydration safety & check localStorage & start autoplay on load
  React.useEffect(() => {
    setIsMounted(true);
    setActiveVideoSrc(initialVideoSrc);
    const dismissed = localStorage.getItem("support_video_dismissed") === "true";
    setIsDismissed(dismissed);

    if (!dismissed && previewVideoRef.current) {
      previewVideoRef.current.play().catch(() => {});
    }
  }, [initialVideoSrc]);

  // Lock body scroll when modal is open & add ESC key listener
  React.useEffect(() => {
    if (!isOpen) return;

    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    // Auto-play modal video when opened
    if (modalVideoRef.current) {
      modalVideoRef.current.play().catch(() => {});
    }

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        handleClose();
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.style.overflow = originalOverflow;
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen]);

  const handleDismiss = (e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setIsDismissed(true);
    setIsOpen(false);
    localStorage.setItem("support_video_dismissed", "true");
    if (triggerRef.current) {
      triggerRef.current.focus();
    }
  };

  const handleOpen = () => {
    if (previewVideoRef.current) {
      previewVideoRef.current.pause();
    }
    setIsOpen(true);
  };

  const handleClose = () => {
    if (modalVideoRef.current) {
      modalVideoRef.current.pause();
    }
    handleDismiss();
  };

  // Prevent SSR hydration mismatches or if user already dismissed
  if (!isMounted || isDismissed) {
    return null;
  }

  return (
    <>
      {/* ── 1. Independent Floating Mini Video Player Widget (Bottom-Left like Chat Button) ── */}
      <div className={`fixed bottom-6 left-6 z-40 md:bottom-8 md:left-8 ${className}`}>
        <div className="relative overflow-hidden rounded-2xl border-2 border-brand-gold/60 bg-black shadow-2xl transition-all duration-300 hover:border-brand-gold hover:shadow-brand-gold/30 hover:scale-[1.03] w-64 sm:w-72 md:w-80 aspect-video group">
          {/* Dismiss X Button on Floating Widget */}
          <button
            type="button"
            onClick={handleDismiss}
            aria-label="Dismiss video widget"
            className="absolute top-2 right-2 z-20 flex h-7 w-7 items-center justify-center rounded-full bg-black/75 text-white/90 backdrop-blur-md transition-all hover:bg-black hover:text-brand-gold focus:outline-none focus:ring-2 focus:ring-brand-gold cursor-pointer"
          >
            <X className="h-4 w-4" />
          </button>

          {/* Mini Video Element (Looping Muted Video Preview) */}
          <div
            ref={triggerRef as any}
            role="button"
            tabIndex={0}
            onClick={handleOpen}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") handleOpen();
            }}
            aria-label="Click to expand video presentation"
            className="relative h-full w-full cursor-pointer"
          >
            <video
              ref={previewVideoRef}
              src={activeVideoSrc}
              muted
              autoPlay
              loop
              playsInline
              preload="auto"
              className="h-full w-full object-cover rounded-xl transition-transform duration-500 group-hover:scale-105"
            />

            {/* Dark Overlay & Play Button Badge */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/30 to-black/20 flex flex-col justify-between p-3">
              {/* Top Tag */}
              <div className="flex items-center justify-between">
                <span className="inline-flex items-center gap-1.5 rounded-full bg-brand-gold px-2.5 py-0.5 text-[11px] font-bold text-brand-dark shadow-md backdrop-blur-sm">
                  <Volume2 className="h-3 w-3" />
                  {locale === "fr" ? "Vidéo Présentation" : "Video Overview"}
                </span>
              </div>

              {/* Center Animated Play Icon */}
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <div className="relative flex h-12 w-12 items-center justify-center rounded-full bg-brand-gold text-brand-dark shadow-xl transition-transform duration-300 group-hover:scale-110 group-hover:bg-brand-goldLight">
                  <span className="absolute inset-0 rounded-full bg-brand-gold/40 animate-ping" />
                  <Play className="h-6 w-6 fill-brand-dark text-brand-dark ml-0.5 relative z-10" />
                </div>
              </div>

              {/* Bottom Caption & Expand Icon */}
              <div className="flex items-center justify-between text-white pt-1">
                <div>
                  <h4 className="text-xs font-bold text-white group-hover:text-brand-gold transition-colors">
                    {locale === "fr" ? "Opulanz Banking Overview" : "Opulanz Banking Overview"}
                  </h4>
                  <p className="text-[10px] text-white/80 line-clamp-1">
                    {locale === "fr" ? "Cliquez pour agrandir la vidéo" : "Click to expand & play full video"}
                  </p>
                </div>
                <div className="flex h-6 w-6 items-center justify-center rounded-lg bg-white/20 backdrop-blur-md text-white group-hover:bg-brand-gold group-hover:text-brand-dark transition-all">
                  <Maximize2 className="h-3.5 w-3.5" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── 2. Full-Screen Centered Video Popup Overlay ── */}
      {isOpen && (
        <div
          tabIndex={-1}
          role="dialog"
          aria-modal="true"
          aria-label={locale === "fr" ? "Lecteur Vidéo Opulanz" : "Opulanz Video Presentation"}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-4 sm:p-6 md:p-10 animate-in fade-in duration-200"
          onClick={handleClose}
        >
          {/* Modal Container */}
          <div
            className="relative w-full max-w-4xl overflow-hidden rounded-2xl border border-brand-gold/40 bg-black shadow-2xl transition-all"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header Bar */}
            <div className="flex items-center justify-between border-b border-white/10 bg-gradient-to-r from-brand-dark via-[#1e1912] to-brand-dark px-5 py-3.5">
              <div className="flex items-center gap-2">
                <span className="h-2.5 w-2.5 rounded-full bg-brand-gold animate-pulse" />
                <span className="text-sm font-bold text-white">
                  {locale === "fr" ? "Présentation Opulanz Banking" : "Opulanz Banking Presentation"}
                </span>
              </div>
              <button
                type="button"
                onClick={handleClose}
                aria-label="Close video player"
                className="group flex h-9 w-9 items-center justify-center rounded-full bg-white/10 text-white/80 transition-all hover:bg-brand-gold hover:text-brand-dark focus:outline-none focus:ring-2 focus:ring-brand-gold cursor-pointer"
              >
                <X className="h-5 w-5 transition-transform group-hover:scale-110" />
              </button>
            </div>

            {/* Main Video Player */}
            <div className="relative aspect-video w-full bg-black">
              <video
                ref={modalVideoRef}
                src={activeVideoSrc}
                controls
                autoPlay
                className="h-full w-full object-contain"
                onEnded={handleClose}
              >
                <track kind="captions" />
                Your browser does not support HTML5 video playback.
              </video>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export const SupportVideoPopup = VideoPopup;
