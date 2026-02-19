
import { Suspense } from "react";

import AccountingConfirmationClient from "./AccountingConfirmationClient";

export default function Page({
    params : {locale},
} : {
    params: { locale : string };
}) {
    return (
        <Suspense fallback={null}>
            <AccountingConfirmationClient params={{ locale }} />
        </Suspense>
    )
}