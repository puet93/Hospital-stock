import { redirect } from "next/navigation";
import { LoginForm } from "@/components/login-form";
import { isAuthRequired } from "@/lib/auth-mode";
import { createClient } from "@/lib/supabase/server";

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string }>;
}) {
  if (!isAuthRequired()) {
    redirect("/dashboard");
  }

  if (
    process.env.NEXT_PUBLIC_SUPABASE_URL &&
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  ) {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (user) {
      redirect("/dashboard");
    }
  }

  const sp = await searchParams;
  return <LoginForm defaultNext={sp.next ?? "/dashboard"} />;
}
