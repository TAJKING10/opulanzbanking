import { redirect } from "next/navigation";

export default function VerifyEmailPage({ params: { locale } }: { params: { locale: string } }) {
  redirect(`/${locale}`);
}
