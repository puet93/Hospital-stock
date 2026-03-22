import { createServerClient } from "@supabase/ssr";
import { type NextRequest, NextResponse } from "next/server";

const PUBLIC_PATHS = new Set([
  "/login",
  "/auth/callback",
  "/auth/confirm",
]);

/**
 * Middleware Edge (Vercel): no usar `request.cookies.set` — en Edge suele romper
 * y dispara MIDDLEWARE_INVOCATION_FAILED. Solo escribir cookies en la Response.
 */
export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (
    !process.env.NEXT_PUBLIC_SUPABASE_URL ||
    !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  ) {
    return NextResponse.next();
  }

  let response = NextResponse.next({
    request: { headers: request.headers },
  });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          response = NextResponse.next({
            request: { headers: request.headers },
          });
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  try {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (
      pathname.startsWith("/_next") ||
      pathname.startsWith("/favicon") ||
      pathname.match(/\.(svg|png|jpg|jpeg|gif|webp|ico)$/)
    ) {
      return response;
    }

    if (PUBLIC_PATHS.has(pathname) || pathname.startsWith("/api/cron")) {
      return response;
    }

    if (!user && pathname !== "/") {
      const url = request.nextUrl.clone();
      url.pathname = "/login";
      url.searchParams.set("next", pathname);
      const redirect = NextResponse.redirect(url);
      for (const c of response.headers.getSetCookie()) {
        redirect.headers.append("Set-Cookie", c);
      }
      return redirect;
    }

    if (user && pathname === "/login") {
      const url = request.nextUrl.clone();
      url.pathname = "/dashboard";
      const redirect = NextResponse.redirect(url);
      for (const c of response.headers.getSetCookie()) {
        redirect.headers.append("Set-Cookie", c);
      }
      return redirect;
    }

    return response;
  } catch {
    return NextResponse.next();
  }
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
