import { redirect } from "next/navigation";

export default function InsurancePage({
  params: { locale },
}: {
  params: { locale: string };
}) {
  redirect(`/${locale}/life-insurance`);
}
