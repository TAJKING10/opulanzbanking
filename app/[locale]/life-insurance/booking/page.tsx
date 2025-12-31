
import { Suspense } from "react";

import LifeInsuranceBookingClient from "./LifeInsuranceBookingClient";

export default function Page({
    params : {locale},
} : {
    params: { locale : string };
}) {
    return (
        <Suspense fallback={null}>
            <LifeInsuranceBookingClient params={{ locale }} />
        </Suspense>
    )
}