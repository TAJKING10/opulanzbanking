import * as React from "react";
import { Suspense } from "react";
import BookingClient from "./BookingClient";

export default function TaxAdvisoryBookingPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-solid border-brand-gold border-r-transparent" />
        </div>
      }
    >
      <BookingClient />
    </Suspense>
  );
}
