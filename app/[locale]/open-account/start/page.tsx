import { redirect } from "next/navigation";

export default function AccountOpeningStartPage({
  params: { locale },
  searchParams,
}: {
  params: { locale: string };
  searchParams: { mode?: string };
}) {
  const mode = searchParams.mode || "personal";
  if (mode === "business") {
    redirect(`/${locale}/open-account/business`);
  } else {
    redirect(`/${locale}/open-account/personal`);
  }
}
