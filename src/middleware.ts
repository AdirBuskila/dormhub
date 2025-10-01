import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server';

// Define public routes (no authentication required)
const isPublicRoute = createRouteMatcher([
  '/',
  '/sign-in(.*)',
  '/sign-up(.*)',
  '/api/health',
  '/api/test-db'
]);

export default clerkMiddleware((auth, req) => {
  if (isPublicRoute(req)) return;
  
  console.log('Middleware protecting route:', req.nextUrl.pathname);
  auth.protect();
});

export const config = {
  matcher: [
    '/((?!.+\\.[\\w]+$|_next).*)',
    '/',
    '/(api|trpc)(.*)',
  ],
};