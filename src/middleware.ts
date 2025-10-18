import { NextResponse, type NextRequest } from "next/server";

export async function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname;

  // Permitir acesso a páginas de debug e teste
  if (pathname.startsWith("/debug-") || pathname.startsWith("/test-")) {
    return NextResponse.next();
  }

  if (
    pathname.startsWith("/_next/") ||
    pathname.startsWith("/api/") ||
    pathname.includes(".") ||
    pathname === "/favicon.ico"
  ) {
    return NextResponse.next();
  }

  if (pathname.startsWith("/login")) {
    const hasSupabaseCookie = Array.from(request.cookies.getAll()).some(cookie => 
      cookie.name.includes('supabase') || 
      cookie.name.includes('sb-') ||
      cookie.name.includes('auth')
    );
    
    if (hasSupabaseCookie) {
      const redirectUrl = request.nextUrl.clone();
      redirectUrl.pathname = "/dashboard";
      return NextResponse.redirect(redirectUrl);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
