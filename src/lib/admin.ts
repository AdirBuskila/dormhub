/**
 * Admin utility functions
 */

/**
 * Check if an email is in the admin emails list
 * @param email - Email to check
 * @returns true if email is admin, false otherwise
 */
export function isAdminEmail(email?: string | null): boolean {
  if (!email) return false;
  
  const adminEmails = process.env.ADMIN_EMAILS?.split(',')
    .map(email => email.trim().toLowerCase()) || [];
  
  return adminEmails.includes(email.toLowerCase());
}

/**
 * Get list of admin emails
 * @returns Array of admin email addresses
 */
export function getAdminEmails(): string[] {
  return process.env.ADMIN_EMAILS?.split(',')
    .map(email => email.trim())
    .filter(email => email.length > 0) || [];
}