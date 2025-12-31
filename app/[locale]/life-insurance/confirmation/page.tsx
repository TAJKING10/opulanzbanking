
import { Suspense } from "react";

import ConfirmationClient from "./ConfirmationClient";

export default function Page({
    params : {locale},
} : {
    params: { locale : string };
}) {
    return (
        <Suspense fallback={null}>
            <ConfirmationClient params={{ locale }} />
        </Suspense>
    )
}