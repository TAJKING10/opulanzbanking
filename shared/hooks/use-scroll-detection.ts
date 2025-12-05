/**
 * Custom hook for detecting scroll position
 * Useful for sticky headers, scroll-to-top buttons, etc.
 */

import * as React from "react";

interface UseScrollDetectionOptions {
  threshold?: number;
  onScroll?: (isScrolled: boolean) => void;
}

/**
 * Hook to detect if user has scrolled past a threshold
 * @param threshold - Scroll position threshold in pixels (default: 20)
 * @param onScroll - Optional callback when scroll state changes
 * @returns boolean indicating if scrolled past threshold
 */
export function useScrollDetection(
  options: UseScrollDetectionOptions = {}
): boolean {
  const { threshold = 20, onScroll } = options;
  const [isScrolled, setIsScrolled] = React.useState(false);

  React.useEffect(() => {
    const handleScroll = () => {
      const scrolled = window.scrollY > threshold;
      setIsScrolled((prev) => {
        if (prev !== scrolled) {
          onScroll?.(scrolled);
          return scrolled;
        }
        return prev;
      });
    };

    // Check initial state
    handleScroll();

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, [threshold, onScroll]);

  return isScrolled;
}

/**
 * Hook to get current scroll position
 * @returns Current scroll Y position
 */
export function useScrollPosition(): number {
  const [scrollY, setScrollY] = React.useState(0);

  React.useEffect(() => {
    const handleScroll = () => {
      setScrollY(window.scrollY);
    };

    handleScroll(); // Get initial position
    
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return scrollY;
}
