import { redirect } from "next/navigation";
import { AppShell } from "@/components/app-shell";
import { isAuthRequired } from "@/lib/auth-mode";
import { createClient } from "@/lib/supabase/server";

/** Evita pre-render en build (Vercel no debe abrir Postgres durante `next build`). */
export const dynamic = "force-dynamic";

export default async function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const authOff = !isAuthRequired();

  if (
    !authOff &&
    process.env.NEXT_PUBLIC_SUPABASE_URL &&
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  ) {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      redirect("/login");
    }
  }

  return <AppShell authDisabled={authOff}>{children}</AppShell>;
}
