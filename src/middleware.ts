import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server';
import createIntlMiddleware from 'next-intl/middleware';
import { locales, defaultLocale } from './i18n/config';
import { NextResponse } from 'next/server';

// Define public routes (no authentication required)
// Home page, sign-in, and tips guide are accessible to unauthenticated users
const isPublicRoute = createRouteMatcher([
  '/',
  '/en',
  '/he',
  '/en/sign-in(.*)',
  '/he/sign-in(.*)',
  '/en/tips/guide',
  '/he/tips/guide',
  '/tips/guide',
  '/api/health', // Health check endpoint
]);

const intlMiddleware = createIntlMiddleware({
  locales,
  defaultLocale,
  localePrefix: 'as-needed'
});

export default clerkMiddleware(async (auth, req) => {
  // For API routes, only run Clerk middleware (no i18n or protection)
  if (req.nextUrl.pathname.startsWith('/api/')) {
    // Let Clerk set up auth context but don't protect API routes here
    // API routes will handle their own authentication
    return NextResponse.next();
  }

  // Get the user ID from auth
  const { userId } = await auth();

  // Check if route requires authentication
  const isPublic = isPublicRoute(req);
  
  console.log('Middleware check:', {
    path: req.nextUrl.pathname,
    isPublic,
    userId,
    requiresAuth: !isPublic
  });

  // If not a public route and no user is authenticated, redirect to sign-in
  if (!isPublic && !userId) {
    const locale = req.nextUrl.pathname.startsWith('/he') ? 'he' : 'en';
    const signInUrl = new URL(`/${locale}/sign-in`, req.url);
    signInUrl.searchParams.set('redirect_url', req.url);
    console.log('Redirecting to sign-in:', signInUrl.toString());
    return NextResponse.redirect(signInUrl);
  }

  // Handle internationalization
  return intlMiddleware(req);
});

export const config = {
  matcher: [
    // Enable a redirect to a matching locale at the root
    '/',

    // Set a cookie to remember the previous locale for
    // all requests that have a locale prefix
    '/(he|en)/:path*',

    // API routes - need Clerk middleware for authentication
    '/api/:path*',

    // Enable redirects that add missing locales
    // (e.g. `/pathnames` -> `/en/pathnames`)
    '/((?!_next|_vercel|.*\\..*).*)'
  ],
};