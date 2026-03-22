import { type NextRequest, NextResponse } from "next/server";

/**
 * Passthrough en Edge (sin Supabase): evita bundles con `__dirname` en Vercel.
 * La auth vive en `src/app/(main)/layout.tsx`.
 */
export function middleware(_request: NextRequest) {
  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico)$).*)",
  ],
};
