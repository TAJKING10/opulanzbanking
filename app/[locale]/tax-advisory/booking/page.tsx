
import { Suspense } from "react";

import BookingClient from "./BookingClient";

export default function Page({
    params : {locale},
} : {
    params: { locale : string };
}) {
    return (
        <Suspense fallback={null}>
            <BookingClient params={{ locale }} />
        </Suspense>
    )
}