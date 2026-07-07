import type { Metadata } from 'next';
import { Suspense } from "react";
import ConfirmationClient from "./ConfirmationClient";

export const metadata: Metadata = {
  robots: { index: false, follow: false },
};

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