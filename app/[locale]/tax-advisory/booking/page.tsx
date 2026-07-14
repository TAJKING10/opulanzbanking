import type { Metadata } from 'next';
import { Suspense } from "react";
import BookingClient from "./BookingClient";

export const metadata: Metadata = {
  robots: { index: false, follow: false },
};

export default function BookingPage() {
  return (
    <Suspense fallback={
      <div className="flex min-h-screen items-center justify-center">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-brand-gold border-r-transparent" />
      </div>
    }>
      <BookingClient />
    </Suspense>
  );
}
