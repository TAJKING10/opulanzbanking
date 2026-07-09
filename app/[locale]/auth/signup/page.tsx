import { redirect } from "next/navigation";

export default function SignupPage({ params: { locale } }: { params: { locale: string } }) {
  redirect(`/${locale}`);
}
