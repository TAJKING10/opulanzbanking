import { redirect } from "next/navigation";

export default function VerifyPhonePage({ params: { locale } }: { params: { locale: string } }) {
  redirect(`/${locale}`);
}
