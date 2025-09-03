import { NextRequest, NextResponse } from 'next/server';

export function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname;
  
  // Redirect root to Korean projects page
  if (pathname === '/') {
    return NextResponse.redirect(new URL('/ko/projects', request.url));
  }
  
  // Redirect locale root to projects (e.g., /ko -> /ko/projects)
  if (pathname === '/ko' || pathname === '/en') {
    return NextResponse.redirect(new URL(`${pathname}/projects`, request.url));
  }
  
  // Check if there is any supported locale in the pathname
  const pathnameIsMissingLocale = ['/ko', '/en'].every(
    (locale) => !pathname.startsWith(`${locale}/`) && pathname !== locale
  );

  // Redirect if there is no locale
  if (pathnameIsMissingLocale) {
    return NextResponse.redirect(
      new URL(`/ko${pathname}`, request.url)
    );
  }
}

export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ]
};