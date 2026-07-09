import { redirect } from "next/navigation";

export default function SigninPage({ params: { locale } }: { params: { locale: string } }) {
  redirect(`/${locale}`);
}
