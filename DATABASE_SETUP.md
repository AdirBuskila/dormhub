# Database Setup Guide

This guide explains how to set up the database for the Mobile For You business management system.

## Prerequisites

- Supabase account and project
- Database access credentials

## Running Migrations

### 1. Alerts and Notifications System

To set up the alerts engine and WhatsApp notification system, run the following migration:

```sql
-- Run this in your Supabase SQL editor or via psql
\i database/alerts_and_outbound_messages.sql
```

Or copy and paste the contents of `database/alerts_and_outbound_messages.sql` into your Supabase SQL editor.

### 2. What this migration creates:

- **alerts table**: Stores system alerts for various business events
- **outbound_messages table**: Queue for WhatsApp notifications
- **Indexes**: Performance optimizations for queries
- **Columns**: Adds missing columns to existing tables (reserved_stock, min_stock_alert, phone)

### 3. Verify the setup:

After running the migration, verify the tables were created:

```sql
-- Check if tables exist
SELECT table_name FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN ('alerts', 'outbound_messages');

-- Check if columns were added
SELECT column_name FROM information_schema.columns 
WHERE table_name = 'products' 
AND column_name IN ('reserved_stock', 'min_stock_alert');

SELECT column_name FROM information_schema.columns 
WHERE table_name = 'clients' 
AND column_name = 'phone';
```

## Environment Variables

Make sure you have the following environment variables set:

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# Clerk Authentication
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=your_clerk_publishable_key
CLERK_SECRET_KEY=your_clerk_secret_key

# Admin Access
ADMIN_EMAILS=admin@example.com,another@example.com

# WhatsApp/Twilio
WHATSAPP_PROVIDER=twilio
WHATSAPP_TEST_MODE=true
TWILIO_ACCOUNT_SID=your_twilio_account_sid
TWILIO_AUTH_TOKEN=your_twilio_auth_token
TWILIO_WHATSAPP_FROM=whatsapp:+14155238886

# Alert Thresholds (optional)
ALERT_UNDELIVERED_DAYS=3
ALERT_OVERDUE_DAYS=14
ALERT_RESERVED_STALE_DAYS=3
```

## Testing the Setup

1. **Test alerts creation**:
   ```bash
   curl -X POST http://localhost:3000/api/run-alerts
   ```

2. **Test WhatsApp messaging**:
   ```bash
   curl -X POST http://localhost:3000/api/test-whatsapp \
     -H "Content-Type: application/json" \
     -d '{"to":"+972501234567","template":"order_confirmation","variables":{"orderId":"123","summary":"iPhone 15 Pro"}}'
   ```

3. **Test message dispatch**:
   ```bash
   curl -X POST http://localhost:3000/api/dispatch-messages
   ```

## Notes

- The migration is idempotent (safe to run multiple times)
- Test mode is enabled by default (`WHATSAPP_TEST_MODE=true`)
- Phone numbers must be in E.164 format (e.g., +972501234567)
- Admin access is required for most API endpoints
- Vercel cron jobs will automatically run alerts daily at 8 AM Jerusalem time
