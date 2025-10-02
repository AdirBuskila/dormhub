import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server';
import createIntlMiddleware from 'next-intl/middleware';
import { locales, defaultLocale } from './i18n/config';

// Define public routes (no authentication required)
const isPublicRoute = createRouteMatcher([
  '/',
  '/en',
  '/he',
  '/en/sign-in(.*)',
  '/he/sign-in(.*)',
  '/en/sign-up(.*)',
  '/he/sign-up(.*)',
  '/api/health',
  '/api/test-db'
]);

const intlMiddleware = createIntlMiddleware({
  locales,
  defaultLocale,
  localePrefix: 'as-needed'
});

export default clerkMiddleware((auth, req) => {
  // Handle internationalization first
  const intlResponse = intlMiddleware(req);
  if (intlResponse) {
    return intlResponse;
  }

  // Allow public routes without authentication
  if (isPublicRoute(req)) return;
  
  console.log('Middleware protecting route:', req.nextUrl.pathname);
  
  // Protect all other routes
  auth.protect();
});

export const config = {
  matcher: [
    // Enable a redirect to a matching locale at the root
    '/',

    // Set a cookie to remember the previous locale for
    // all requests that have a locale prefix
    '/(he|en)/:path*',

    // Enable redirects that add missing locales
    // (e.g. `/pathnames` -> `/en/pathnames`)
    '/((?!_next|_vercel|.*\\..*).*)'
  ],
};