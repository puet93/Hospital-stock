"use client";

import Link from "next/link";
import { Package, Pill, LayoutDashboard, ArrowRightLeft, Bell, GitBranch, FileBarChart } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { LogoutButton } from "@/components/logout-button";
import { cn } from "@/lib/utils";

const nav = [
  { href: "/dashboard", label: "Panel", icon: LayoutDashboard },
  { href: "/medicamentos", label: "Medicamentos", icon: Pill },
  { href: "/lotes", label: "Lotes y stock", icon: Package },
  { href: "/movimientos", label: "Movimientos", icon: ArrowRightLeft },
  { href: "/alertas", label: "Alertas", icon: Bell },
  { href: "/equivalencias", label: "Equivalencias", icon: GitBranch },
  { href: "/reportes", label: "Reportes", icon: FileBarChart },
];

export function AppShell({
  children,
  subtitle,
}: {
  children: React.ReactNode;
  subtitle?: string;
}) {
  return (
    <div className="flex min-h-screen w-full">
      <aside className="hidden w-56 shrink-0 border-r bg-card md:flex md:flex-col">
        <div className="flex h-14 items-center border-b px-4">
          <Link href="/dashboard" className="font-semibold tracking-tight">
            Farmacia hospitalaria
          </Link>
        </div>
        <nav className="flex flex-1 flex-col gap-0.5 p-2">
          {nav.map(({ href, label, icon: Icon }) => (
            <Link
              key={href}
              href={href}
              className={cn(
                buttonVariants({ variant: "ghost" }),
                "justify-start gap-2"
              )}
            >
              <Icon className="size-4 opacity-70" />
              {label}
            </Link>
          ))}
        </nav>
        <Separator />
        <div className="p-2">
          <LogoutButton />
        </div>
      </aside>
      <div className="flex min-w-0 flex-1 flex-col">
        <header className="flex h-14 items-center justify-between border-b px-4 md:hidden">
          <span className="font-medium">Farmacia</span>
          <LogoutButton variant="outline" size="sm" />
        </header>
        <main className="flex-1 space-y-6 p-4 md:p-8">
          {subtitle ? (
            <p className="text-muted-foreground text-sm">{subtitle}</p>
          ) : null}
          {children}
        </main>
      </div>
    </div>
  );
}
