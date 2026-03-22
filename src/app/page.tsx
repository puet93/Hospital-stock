import { redirect } from "next/navigation";
import { isAuthRequired } from "@/lib/auth-mode";
import { createClient } from "@/lib/supabase/server";

export default async function Home() {
  if (!isAuthRequired()) {
    redirect("/dashboard");
  }

  if (
    !process.env.NEXT_PUBLIC_SUPABASE_URL ||
    !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  ) {
    redirect("/dashboard");
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (user) {
    redirect("/dashboard");
  }

  redirect("/login");
}
