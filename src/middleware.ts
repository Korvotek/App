import { NextResponse, type NextRequest } from "next/server";

export async function middleware(request: NextRequest) {
  // Middleware simplificado para evitar erros no Vercel
  const pathname = request.nextUrl.pathname;

  // Permitir acesso a arquivos estáticos e APIs
  if (
    pathname.startsWith("/_next/") ||
    pathname.startsWith("/api/") ||
    pathname.includes(".") ||
    pathname === "/favicon.ico"
  ) {
    return NextResponse.next();
  }

  // Para rotas protegidas, redirecionar para login se não autenticado
  if (pathname.startsWith("/dashboard")) {
    // Verificar se há token de sessão nos cookies
    const sessionCookie = request.cookies.get("sb-access-token") || 
                         request.cookies.get("supabase-auth-token");
    
    if (!sessionCookie) {
      const redirectUrl = request.nextUrl.clone();
      redirectUrl.pathname = "/login";
      redirectUrl.searchParams.set("redirectedFrom", pathname);
      return NextResponse.redirect(redirectUrl);
    }
  }

  // Se já está logado e tenta acessar login, redirecionar para dashboard
  if (pathname.startsWith("/login")) {
    const sessionCookie = request.cookies.get("sb-access-token") || 
                         request.cookies.get("supabase-auth-token");
    
    if (sessionCookie) {
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
