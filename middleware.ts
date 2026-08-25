import { auth } from '@/lib/auth';

export default auth((req) => {
  const isLoggedIn = !!req.auth;
  const { pathname } = req.nextUrl;

  const isAuthPage = pathname.startsWith('/login') ||
    pathname.startsWith('/registro') ||
    pathname.startsWith('/esqueci-senha') ||
    pathname.startsWith('/recuperar-senha');
  const isPublicPage =
    pathname === '/' ||
    pathname.startsWith('/api/auth') ||
    pathname.startsWith('/_next') ||
    !!pathname.match(/\.(svg|png|jpg|jpeg|gif|webp|ico)$/);

  if (isPublicPage) return;

  if (isAuthPage) {
    if (isLoggedIn) {
      return Response.redirect(new URL('/dashboard', req.nextUrl));
    }
    return;
  }

  if (!isLoggedIn) {
    return Response.redirect(new URL('/login', req.nextUrl));
  }
});

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)'],
};
