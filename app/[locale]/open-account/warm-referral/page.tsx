import { redirect } from "next/navigation";

export default function WarmReferralPage({
  params: { locale },
}: {
  params: { locale: string };
}) {
  redirect(`/${locale}/open-account`);
}
