import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Development middleware - allows all routes
// Replace with Clerk middleware when you have real API keys
export function middleware(request: NextRequest) {
  return NextResponse.next();
}

export const config = {
  matcher: [
    '/((?!.+\\.[\\w]+$|_next).*)',
    '/',
    '/(api|trpc)(.*)',
  ],
};