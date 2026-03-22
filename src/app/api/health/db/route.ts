import { NextResponse } from "next/server";
import { sql } from "drizzle-orm";
import { db } from "@/db";
import { inventoryLots } from "@/db/schema";

export const dynamic = "force-dynamic";

function classify(e: unknown): { code: string; hint: string } {
  const msg = e instanceof Error ? e.message : String(e);
  const cause = e instanceof Error ? e.cause : undefined;
  const errno =
    cause && typeof cause === "object" && "code" in cause
      ? String((cause as { code: unknown }).code)
      : "";

  if (errno === "ENOTFOUND") {
    return {
      code: "ENOTFOUND",
      hint: "DNS del host: usá Transaction pooler :6543 (aws-0-….pooler.supabase.com), no db.….supabase.co:5432.",
    };
  }
  if (errno === "ECONNREFUSED") {
    return { code: "ECONNREFUSED", hint: "Puerto o host incorrecto." };
  }
  if (
    msg.includes("password authentication failed") ||
    msg.includes("28P01") ||
    msg.includes("SASL")
  ) {
    return {
      code: "AUTH",
      hint: "En pooler el usuario es postgres.TUREF (con punto). Contraseña = Database password del panel.",
    };
  }
  if (msg.includes("does not exist") || msg.includes("42P01")) {
    return {
      code: "MISSING_SCHEMA",
      hint: "Ejecutá supabase/APPLY_IN_SQL_EDITOR.sql (y migraciones) en Supabase SQL Editor.",
    };
  }
  if (msg.includes("SSL") || msg.includes("certificate")) {
    return { code: "SSL", hint: "Copiá la URI tal cual la muestra Supabase (sslmode)." };
  }
  return { code: "UNKNOWN", hint: "Mirá Vercel → Deployment → Logs (Functions)." };
}

export async function GET() {
  if (!db) {
    return NextResponse.json(
      {
        ok: false,
        step: "env",
        code: "NO_DATABASE_URL",
        hint: "Definí DATABASE_URL en Vercel y redeploy.",
      },
      { status: 503 }
    );
  }

  try {
    await db.execute(sql`select 1`);
  } catch (e) {
    const c = classify(e);
    return NextResponse.json(
      { ok: false, step: "connect", ...c },
      { status: 503 }
    );
  }

  try {
    await db.select().from(inventoryLots).limit(1);
  } catch (e) {
    const c = classify(e);
    return NextResponse.json(
      { ok: false, step: "schema", ...c },
      { status: 503 }
    );
  }

  return NextResponse.json({
    ok: true,
    step: "ready",
    hint: "Conexión y tabla inventory_lots accesibles.",
  });
}
