-- Migration: Add dashboard query functions
-- Date: 2024-10-08
-- Description: Add server functions for dashboard KPIs and data queries

-- Function to get orders to deliver count
CREATE OR REPLACE FUNCTION get_orders_to_deliver_count(tz_param TEXT DEFAULT 'Asia/Jerusalem')
RETURNS INTEGER AS $$
BEGIN
  RETURN (
    SELECT COUNT(*)
    FROM orders
    WHERE status IN ('draft', 'reserved')
    AND (
      promised_date::date = (CURRENT_DATE AT TIME ZONE tz_param)::date
      OR created_at >= NOW() - INTERVAL '48 hours'
    )
  );
END;
$$ LANGUAGE plpgsql;

-- Function to get total receivables
CREATE OR REPLACE FUNCTION get_total_receivables()
RETURNS NUMERIC AS $$
BEGIN
  RETURN GREATEST(0, 
    COALESCE((
      SELECT SUM(total_price)
      FROM orders
      WHERE status IN ('delivered', 'closed')
    ), 0) - COALESCE((
      SELECT SUM(amount)
      FROM payments
    ), 0)
  );
END;
$$ LANGUAGE plpgsql;

-- Function to get new orders today count
CREATE OR REPLACE FUNCTION get_new_orders_today_count(tz_param TEXT DEFAULT 'Asia/Jerusalem')
RETURNS INTEGER AS $$
BEGIN
  RETURN (
    SELECT COUNT(*)
    FROM orders
    WHERE created_at::date = (CURRENT_DATE AT TIME ZONE tz_param)::date
  );
END;
$$ LANGUAGE plpgsql;

-- Function to get payments yesterday sum
CREATE OR REPLACE FUNCTION get_payments_yesterday_sum(tz_param TEXT DEFAULT 'Asia/Jerusalem')
RETURNS NUMERIC AS $$
BEGIN
  RETURN COALESCE((
    SELECT SUM(amount)
    FROM payments
    WHERE date::date = ((CURRENT_DATE AT TIME ZONE tz_param) - INTERVAL '1 day')::date
  ), 0);
END;
$$ LANGUAGE plpgsql;

-- Function to get orders to deliver with details
CREATE OR REPLACE FUNCTION get_orders_to_deliver(limit_param INTEGER DEFAULT 15, offset_param INTEGER DEFAULT 0)
RETURNS TABLE(
  order_id UUID,
  client_name TEXT,
  items_count INTEGER,
  promised_date TIMESTAMP WITH TIME ZONE,
  status TEXT,
  balance_due NUMERIC,
  created_at TIMESTAMP WITH TIME ZONE
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    o.id,
    c.name,
    COALESCE((
      SELECT COUNT(*)
      FROM order_items oi
      WHERE oi.order_id = o.id
    ), 0)::INTEGER,
    o.promised_date,
    o.status,
    GREATEST(0, o.total_price - COALESCE((
      SELECT SUM(p.amount)
      FROM payments p
      WHERE p.client_id = o.client_id
    ), 0)),
    o.created_at
  FROM orders o
  JOIN clients c ON c.id = o.client_id
  WHERE o.status IN ('draft', 'reserved')
  AND (
    o.promised_date::date = CURRENT_DATE
    OR o.created_at >= NOW() - INTERVAL '48 hours'
  )
  ORDER BY 
    COALESCE(o.promised_date, o.created_at) ASC,
    o.created_at ASC
  LIMIT limit_param
  OFFSET offset_param;
END;
$$ LANGUAGE plpgsql;

-- Function to get top debtors
CREATE OR REPLACE FUNCTION get_top_debtors(limit_param INTEGER DEFAULT 10)
RETURNS TABLE(
  client_id UUID,
  client_name TEXT,
  outstanding NUMERIC,
  last_payment_at TIMESTAMP WITH TIME ZONE,
  days_overdue INTEGER
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    c.id,
    c.name,
    GREATEST(0, COALESCE((
      SELECT SUM(o.total_price)
      FROM orders o
      WHERE o.client_id = c.id
      AND o.status IN ('delivered', 'closed')
    ), 0) - COALESCE((
      SELECT SUM(p.amount)
      FROM payments p
      WHERE p.client_id = c.id
    ), 0)),
    (
      SELECT MAX(p.date)
      FROM payments p
      WHERE p.client_id = c.id
    ),
    COALESCE((
      SELECT EXTRACT(DAYS FROM (NOW() - MIN(o.created_at)))
      FROM orders o
      WHERE o.client_id = c.id
      AND o.status IN ('delivered', 'closed')
      AND o.total_price > COALESCE((
        SELECT SUM(p.amount)
        FROM payments p
        WHERE p.client_id = c.id
      ), 0)
    ), 0)::INTEGER
  FROM clients c
  WHERE (
    COALESCE((
      SELECT SUM(o.total_price)
      FROM orders o
      WHERE o.client_id = c.id
      AND o.status IN ('delivered', 'closed')
    ), 0) - COALESCE((
      SELECT SUM(p.amount)
      FROM payments p
      WHERE p.client_id = c.id
    ), 0)
  ) > 0
  ORDER BY outstanding DESC
  LIMIT limit_param;
END;
$$ LANGUAGE plpgsql;
