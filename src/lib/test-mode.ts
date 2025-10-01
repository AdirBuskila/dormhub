/**
 * Temporary testing utility to override admin status
 * Set TEST_MODE=true in .env.local to force customer mode
 */

export function isTestMode(): boolean {
  return process.env.TEST_MODE === 'true';
}

export function getTestModeUserId(): string | null {
  if (isTestMode()) {
    // Return a fake user ID that will be treated as a customer
    return 'test-customer-mode';
  }
  return null;
}

/**
 * Override admin check for testing
 */
export function overrideAdminCheck(userEmail: string | undefined, adminEmails: string[]): boolean {
  if (isTestMode()) {
    console.log('🧪 TEST MODE: Forcing customer mode');
    return false; // Always return false (not admin) in test mode
  }
  
  // Normal admin check
  return userEmail ? adminEmails.includes(userEmail) : false;
}
