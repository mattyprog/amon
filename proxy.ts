import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { SESSION_COOKIE, verifySessionToken } from "@/lib/auth";

// In Next.js 16 il file "middleware" è stato rinominato "proxy".
// Qui proteggiamo l'area riservata del barbiere: ogni richiesta sotto /admin
// (tranne la pagina di login) deve avere un cookie di sessione valido.
export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const isLogin = pathname === "/admin/login";

  const token = request.cookies.get(SESSION_COOKIE)?.value;
  const valid = await verifySessionToken(token);

  // Non autenticato su una pagina protetta → manda al login.
  if (!valid && !isLogin) {
    const url = request.nextUrl.clone();
    url.pathname = "/admin/login";
    return NextResponse.redirect(url);
  }

  // Già autenticato ma sulla pagina di login → manda alla dashboard.
  if (valid && isLogin) {
    const url = request.nextUrl.clone();
    url.pathname = "/admin";
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*"],
};
