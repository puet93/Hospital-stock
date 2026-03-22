import { AppShell } from "@/components/app-shell";

/** Evita pre-render en build (Vercel no debe abrir Postgres durante `next build`). */
export const dynamic = "force-dynamic";

export default function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <AppShell>{children}</AppShell>;
}
