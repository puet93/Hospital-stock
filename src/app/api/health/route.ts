import { NextResponse } from "next/server";

/** Diagnóstico deploy: debe responder 200 en producción (no 404). */
export const dynamic = "force-dynamic";

export async function GET() {
  const hasDb = Boolean(process.env.DATABASE_URL);
  const hasSupabase =
    Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL) &&
    Boolean(process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);

  return NextResponse.json({
    ok: true,
    env: {
      databaseUrlSet: hasDb,
      supabasePublicSet: hasSupabase,
    },
  });
}
