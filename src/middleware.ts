import { NextRequest, NextResponse } from "next/server";

const protectedRoutes = ["/dashboard"];
const authRoutes = ["/sign-in", "/sign-up"];

export async function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname;
  
  // Skip auth check for API routes, static files, and auth callbacks
  if (
    pathname.startsWith('/api/') || 
    pathname.startsWith('/_next/') ||
    pathname.startsWith('/favicon') ||
    pathname.includes('.')
  ) {
    return NextResponse.next();
  }

  try {
    // Check for Better Auth session cookie manually
    const allCookies = request.cookies.getAll();
    const sessionCookie = allCookies.find(cookie => 
      cookie.name === '__Secure-better-auth.session_token' || 
      cookie.name === 'better-auth.session_token' ||
      (cookie.name.includes('session') && cookie.name.includes('better-auth'))
    );
    const hasSession = !!sessionCookie?.value;
    
    // Debug logging
    console.log(`[Middleware] Path: ${pathname}`);
    console.log(`[Middleware] Session cookie exists: ${hasSession}`);
    
    // If user is not authenticated and trying to access protected route
    if (!hasSession && protectedRoutes.some(route => pathname.startsWith(route))) {
      console.log(`[Middleware] No session, redirecting to sign-in`);
      return NextResponse.redirect(new URL("/sign-in", request.url));
    }
    
    // If user is authenticated but trying to access auth routes, redirect to dashboard
    if (hasSession && authRoutes.some(route => pathname.startsWith(route))) {
      console.log(`[Middleware] Authenticated user on auth route, redirecting to dashboard`);
      return NextResponse.redirect(new URL("/dashboard", request.url));
    }
 
    console.log(`[Middleware] Allowing request to proceed`);
    return NextResponse.next();
  } catch (error) {
    // If there's an error checking session, allow access but log the error
    console.error("Auth middleware error:", error);
    return NextResponse.next();
  }
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
};
