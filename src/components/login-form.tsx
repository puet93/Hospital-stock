"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { loginSchema, type LoginInput } from "@/lib/validations/auth";
import { createClient } from "@/lib/supabase/client";
import { Button, buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { DEFAULT_CURRENCY, DEFAULT_TIMEZONE } from "@/lib/constants";

export function LoginForm({ defaultNext }: { defaultNext: string }) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);

  const form = useForm<LoginInput>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: "", password: "" },
  });

  const hasSupabase = Boolean(
    process.env.NEXT_PUBLIC_SUPABASE_URL &&
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  );

  async function onSubmit(values: LoginInput) {
    setError(null);
    if (!hasSupabase) {
      router.push("/dashboard");
      return;
    }
    const supabase = createClient();
    const { error: signError } = await supabase.auth.signInWithPassword({
      email: values.email,
      password: values.password,
    });
    if (signError) {
      setError(signError.message);
      return;
    }
    router.push(defaultNext);
    router.refresh();
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-muted/40 p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Ingreso</CardTitle>
          <CardDescription>
            Inventario hospitalario · Moneda {DEFAULT_CURRENCY} ·{" "}
            {DEFAULT_TIMEZONE.replaceAll("_", " ")}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {!hasSupabase ? (
            <Alert className="mb-4">
              <AlertDescription>
                Variables de Supabase no configuradas. Podés explorar el panel
                en modo local sin autenticación o completar{" "}
                <code className="text-xs">.env</code>.
              </AlertDescription>
            </Alert>
          ) : null}
          <form
            className="space-y-4"
            onSubmit={form.handleSubmit((v) => void onSubmit(v))}
          >
            <div className="space-y-2">
              <Label htmlFor="email">Correo</Label>
              <Input
                id="email"
                type="email"
                autoComplete="email"
                {...form.register("email")}
              />
              {form.formState.errors.email ? (
                <p className="text-destructive text-sm">
                  {form.formState.errors.email.message}
                </p>
              ) : null}
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Contraseña</Label>
              <Input
                id="password"
                type="password"
                autoComplete="current-password"
                {...form.register("password")}
              />
              {form.formState.errors.password ? (
                <p className="text-destructive text-sm">
                  {form.formState.errors.password.message}
                </p>
              ) : null}
            </div>
            {error ? (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            ) : null}
            <div className="flex flex-col gap-2">
              <Button type="submit" disabled={form.formState.isSubmitting}>
                {form.formState.isSubmitting ? "Ingresando…" : "Ingresar"}
              </Button>
              {!hasSupabase ? (
                <Link
                  href="/dashboard"
                  className={cn(
                    buttonVariants({ variant: "outline" }),
                    "inline-flex h-8 w-full items-center justify-center"
                  )}
                >
                  Ir al panel sin Supabase
                </Link>
              ) : null}
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
