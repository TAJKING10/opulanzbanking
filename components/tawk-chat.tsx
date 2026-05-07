"use client";

import { useEffect } from "react";

// To enable live chat:
// 1. Create a free account at https://www.tawk.to
// 2. Copy your Property ID and Widget ID from the widget code
// 3. Add to your .env:  NEXT_PUBLIC_TAWK_PROPERTY_ID=XXXXX  NEXT_PUBLIC_TAWK_WIDGET_ID=default
export function TawkChat() {
  const propertyId = process.env.NEXT_PUBLIC_TAWK_PROPERTY_ID;
  const widgetId = process.env.NEXT_PUBLIC_TAWK_WIDGET_ID || "default";

  useEffect(() => {
    if (!propertyId) return;

    const s1 = document.createElement("script");
    s1.async = true;
    s1.src = `https://embed.tawk.to/${propertyId}/${widgetId}`;
    s1.charset = "UTF-8";
    s1.setAttribute("crossorigin", "*");

    const s0 = document.getElementsByTagName("script")[0];
    s0.parentNode?.insertBefore(s1, s0);
  }, [propertyId, widgetId]);

  return null;
}
