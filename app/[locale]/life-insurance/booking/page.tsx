import { Suspense } from "react";
import LifeInsuranceBookingClient from "./LifeInsuranceBookingClient";

export default function LifeInsuranceBookingPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-solid border-brand-gold border-r-transparent" />
        </div>
      }
    >
      <LifeInsuranceBookingClient />
    </Suspense>
  );
}
