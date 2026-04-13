"use client";

import { useEffect } from "react";
import { useParams, useRouter } from "next/navigation";

export default function SignupRedirect() {
  const params = useParams();
  const router = useRouter();
  const locale = params.locale as string;

  useEffect(() => {
    router.replace(`/${locale}/auth/signup`);
  }, [locale, router]);

  return null;
}
