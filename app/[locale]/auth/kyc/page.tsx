import { redirect } from "next/navigation";

export default function KycPage({ params: { locale } }: { params: { locale: string } }) {
  redirect(`/${locale}`);
}
