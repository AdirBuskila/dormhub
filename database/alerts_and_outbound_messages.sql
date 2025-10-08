-- Migration: Alerts and Outbound Messages
-- This migration creates tables for the alerts engine and WhatsApp notification system

-- Create alerts table
CREATE TABLE IF NOT EXISTS alerts (
    id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
    type text NOT NULL CHECK (type IN ('low_stock', 'undelivered', 'overdue_payment', 'reserved_stale', 'new_order')),
    ref_id uuid NULL,
    message text NOT NULL,
    severity text NOT NULL DEFAULT 'warning' CHECK (severity IN ('info', 'warning', 'danger')),
    delivered boolean NOT NULL DEFAULT false,
    created_at timestamptz NOT NULL DEFAULT now()
);

-- Create outbound_messages table
CREATE TABLE IF NOT EXISTS outbound_messages (
    id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
    channel text NOT NULL DEFAULT 'whatsapp' CHECK (channel IN ('whatsapp')),
    to_client_id uuid NULL REFERENCES clients(id) ON DELETE SET NULL,
    to_phone text NOT NULL,
    template text NOT NULL,
    payload jsonb NOT NULL,
    sent boolean NOT NULL DEFAULT false,
    sent_at timestamptz NULL,
    error text NULL,
    created_at timestamptz NOT NULL DEFAULT now()
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_alerts_type_created_at ON alerts(type, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_alerts_delivered ON alerts(delivered);
CREATE INDEX IF NOT EXISTS idx_alerts_type_ref_id_created_at ON alerts(type, ref_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_outbound_messages_sent_created_at ON outbound_messages(sent, created_at);
CREATE INDEX IF NOT EXISTS idx_outbound_messages_to_client_id ON outbound_messages(to_client_id);

-- Add columns to existing tables if they don't exist
-- Products table - ensure stock-related columns exist
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'products' AND column_name = 'reserved_stock') THEN
        ALTER TABLE products ADD COLUMN reserved_stock integer NOT NULL DEFAULT 0;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'products' AND column_name = 'min_stock_alert') THEN
        ALTER TABLE products ADD COLUMN min_stock_alert integer NOT NULL DEFAULT 5;
    END IF;
END $$;

-- Clients table - ensure phone column exists
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'clients' AND column_name = 'phone') THEN
        ALTER TABLE clients ADD COLUMN phone text NULL;
    END IF;
END $$;

-- Note: Duplicate prevention is handled in application logic
-- PostgreSQL doesn't allow date functions in unique index expressions
-- The alerts engine checks for existing alerts before creating new ones

-- Add comments for documentation
COMMENT ON TABLE alerts IS 'System alerts for various business events';
COMMENT ON TABLE outbound_messages IS 'Outbound messages queue for WhatsApp notifications';
COMMENT ON COLUMN alerts.type IS 'Type of alert: low_stock, undelivered, overdue_payment, reserved_stale';
COMMENT ON COLUMN alerts.ref_id IS 'Reference ID to the related entity (product_id, order_id, client_id)';
COMMENT ON COLUMN alerts.severity IS 'Alert severity: info, warning, danger';
COMMENT ON COLUMN outbound_messages.channel IS 'Communication channel (currently only whatsapp)';
COMMENT ON COLUMN outbound_messages.template IS 'Message template name';
COMMENT ON COLUMN outbound_messages.payload IS 'Template variables and metadata';
