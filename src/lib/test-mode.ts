/**
 * Test/Demo mode utilities
 * Allows users to try the app without authentication and without affecting database
 */

// Server-side test mode check
export function isServerTestMode(): boolean {
  return process.env.TEST_MODE === 'true';
}

// Client-side test mode check
export function isClientTestMode(): boolean {
  if (typeof window === 'undefined') return false;
  return localStorage.getItem('testMode') === 'true';
}

export function getTestModeUserId(): string | null {
  if (isServerTestMode()) {
    // Return a fake user ID that will be treated as a customer
    return 'test-customer-mode';
  }
  return null;
}

// Get test user data from localStorage
export function getTestUser(): { id: string; name: string; email: string; phone: string; city: string; shopName: string } | null {
  if (typeof window === 'undefined') return null;
  const testUserData = localStorage.getItem('testUser');
  if (!testUserData) return null;
  try {
    return JSON.parse(testUserData);
  } catch {
    return null;
  }
}

// Clear test mode
export function clearTestMode(): void {
  if (typeof window === 'undefined') return;
  localStorage.removeItem('testMode');
  localStorage.removeItem('testUser');
}

/**
 * Override admin check for testing
 */
export function overrideAdminCheck(userEmail: string | undefined, adminEmails: string[]): boolean {
  if (isServerTestMode()) {
    console.log('🧪 TEST MODE: Forcing customer mode');
    return false; // Always return false (not admin) in test mode
  }
  
  // Normal admin check
  return userEmail ? adminEmails.includes(userEmail) : false;
}
