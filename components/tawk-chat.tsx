"use client";

import Script from "next/script";

// To enable live chat:
// 1. Create a free account at https://www.tawk.to
// 2. Copy your Property ID and Widget ID from the widget code
// 3. Add to your .env:  NEXT_PUBLIC_TAWK_PROPERTY_ID=XXXXX  NEXT_PUBLIC_TAWK_WIDGET_ID=default
export function TawkChat() {
  const propertyId = process.env.NEXT_PUBLIC_TAWK_PROPERTY_ID;
  const widgetId = process.env.NEXT_PUBLIC_TAWK_WIDGET_ID || "default";

  if (!propertyId) return null;

  // strategy="lazyOnload" defers this until the page is fully interactive,
  // keeping it out of the critical-path chunk list and reducing initial TBT.
  return (
    <Script
      id="tawk-chat"
      src={`https://embed.tawk.to/${propertyId}/${widgetId}`}
      strategy="lazyOnload"
      crossOrigin="anonymous"
    />
  );
}
