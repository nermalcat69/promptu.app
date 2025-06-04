import { NextRequest, NextResponse } from "next/server";

const protectedRoutes = ["/dashboard"];
const authRoutes = ["/sign-in", "/sign-up"];
const onboardingRoute = "/onboarding";

// ONBOARDING TEMPORARILY DISABLED - Uncomment sections below to re-enable
const ONBOARDING_ENABLED = false;

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
    // Check for session cookie to determine auth status
    const sessionCookie = request.cookies.get('better-auth.session_token');
    const hasSession = !!sessionCookie?.value;
    
    // If user is not authenticated and trying to access protected route
    if (!hasSession && protectedRoutes.some(route => pathname.startsWith(route))) {
      return NextResponse.redirect(new URL("/sign-in", request.url));
    }
    
    // If user is authenticated but trying to access auth routes
    if (hasSession && authRoutes.some(route => pathname.startsWith(route))) {
      // ONBOARDING DISABLED: Skip onboarding check for now
      /* 
      if (ONBOARDING_ENABLED) {
        // Check if user needs onboarding before redirecting to dashboard
        try {
          const profileResponse = await fetch(new URL('/api/user/profile', request.url), {
            headers: {
              'Cookie': request.headers.get('cookie') || '',
            },
          });

          if (profileResponse.ok) {
            const profile = await profileResponse.json();
            // If user doesn't have a username, redirect to onboarding
            if (!profile.username) {
              return NextResponse.redirect(new URL(onboardingRoute, request.url));
            }
          }
        } catch (error) {
          console.error("Error checking user profile for auth route redirect:", error);
        }
      }
      */
      
      return NextResponse.redirect(new URL("/dashboard", request.url));
    }

    // ONBOARDING DISABLED: Skip onboarding redirect logic
    /*
    if (ONBOARDING_ENABLED) {
      // Check if authenticated user needs onboarding (excluding onboarding page itself)
      if (hasSession && pathname !== onboardingRoute && !pathname.startsWith('/api/') && protectedRoutes.some(route => pathname.startsWith(route))) {
        try {
          // Only check for onboarding on protected routes to avoid excessive API calls
          const profileResponse = await fetch(new URL('/api/user/profile', request.url), {
            headers: {
              'Cookie': request.headers.get('cookie') || '',
            },
          });

          if (profileResponse.ok) {
            const profile = await profileResponse.json();
            // If user doesn't have a username, redirect to onboarding
            if (!profile.username) {
              return NextResponse.redirect(new URL(onboardingRoute, request.url));
            }
          } else if (profileResponse.status === 401) {
            // If unauthorized, redirect to sign-in
            return NextResponse.redirect(new URL("/sign-in", request.url));
          }
        } catch (error) {
          console.error("Error checking user profile in middleware:", error);
          // If there's an error, don't redirect to avoid loops
        }
      }

      // If user has completed onboarding but is on onboarding page, redirect to dashboard
      if (hasSession && pathname === onboardingRoute) {
        try {
          const profileResponse = await fetch(new URL('/api/user/profile', request.url), {
            headers: {
              'Cookie': request.headers.get('cookie') || '',
            },
          });

          if (profileResponse.ok) {
            const profile = await profileResponse.json();
            if (profile.username) {
              return NextResponse.redirect(new URL("/dashboard", request.url));
            }
          }
        } catch (error) {
          console.error("Error checking profile on onboarding page:", error);
          // If there's an error, allow access to onboarding page
        }
      }
    }
    */
 
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
