import { supabaseAdmin } from './supabase';

export type AlertType = 'low_stock' | 'undelivered' | 'overdue_payment' | 'reserved_stale';
export type AlertSeverity = 'info' | 'warning' | 'danger';

export interface Alert {
  id: string;
  type: AlertType;
  ref_id: string | null;
  message: string;
  severity: AlertSeverity;
  delivered: boolean;
  created_at: string;
}

/**
 * Create low stock alerts for products under threshold
 * Idempotent within a day
 */
export async function createLowStockAlerts(): Promise<number> {
  try {
    // Use the database function for efficiency
    const { data, error } = await supabaseAdmin
      .rpc('check_low_stock_alerts');

    if (error) throw error;
    return data || 0;
  } catch (error) {
    console.error('Error creating low stock alerts:', error);
    return 0;
  }
}

/**
 * Create alerts for overdue payments
 * @param daysOverdue Number of days past order creation to consider overdue
 */
export async function createOverduePaymentAlerts(daysOverdue: number = 30): Promise<number> {
  try {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - daysOverdue);

    // Find clients with outstanding balances and old orders
    const { data: clients, error } = await supabaseAdmin
      .from('clients')
      .select(`
        id,
        name,
        email,
        orders!inner (
          id,
          total_price,
          created_at,
          status
        )
      `)
      .eq('orders.status', 'delivered')
      .lt('orders.created_at', cutoffDate.toISOString());

    if (error) throw error;

    let alertCount = 0;

    for (const client of clients || []) {
      // Calculate outstanding balance
      const { data: orderTotal } = await supabaseAdmin
        .from('orders')
        .select('total_price')
        .eq('client_id', client.id)
        .eq('status', 'delivered');

      const { data: paymentTotal } = await supabaseAdmin
        .from('payments')
        .select('amount')
        .eq('client_id', client.id);

      const totalOrders = orderTotal?.reduce((sum, o) => sum + Number(o.total_price), 0) || 0;
      const totalPayments = paymentTotal?.reduce((sum, p) => sum + Number(p.amount), 0) || 0;
      const balance = totalOrders - totalPayments;

      if (balance > 0) {
        // Check if alert already exists for today
        const { data: existingAlert } = await supabaseAdmin
          .from('alerts')
          .select('id')
          .eq('type', 'overdue_payment')
          .eq('ref_id', client.id)
          .gte('created_at', new Date().toISOString().split('T')[0]);

        if (!existingAlert || existingAlert.length === 0) {
          await supabaseAdmin
            .from('alerts')
            .insert({
              type: 'overdue_payment',
              ref_id: client.id,
              message: `Overdue payment: ${client.name} - Balance: $${balance.toFixed(2)} (${daysOverdue}+ days)`,
              severity: balance > 1000 ? 'danger' : 'warning'
            });

          alertCount++;
        }
      }
    }

    return alertCount;
  } catch (error) {
    console.error('Error creating overdue payment alerts:', error);
    return 0;
  }
}

/**
 * Create alerts for undelivered orders older than X days
 */
export async function createUndeliveredOrderAlerts(daysOld: number = 2): Promise<number> {
  try {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - daysOld);

    const { data: orders, error } = await supabaseAdmin
      .from('orders')
      .select(`
        id,
        created_at,
        status,
        client:clients (
          id,
          name
        )
      `)
      .in('status', ['draft', 'reserved'])
      .lt('created_at', cutoffDate.toISOString());

    if (error) throw error;

    let alertCount = 0;

    for (const order of orders || []) {
      // Check if alert already exists for today
      const { data: existingAlert } = await supabaseAdmin
        .from('alerts')
        .select('id')
        .eq('type', 'undelivered')
        .eq('ref_id', order.id)
        .gte('created_at', new Date().toISOString().split('T')[0]);

      if (!existingAlert || existingAlert.length === 0) {
        await supabaseAdmin
          .from('alerts')
          .insert({
            type: 'undelivered',
            ref_id: order.id,
            message: `Undelivered order: ${order.client?.name || 'Unknown'} - Order #${order.id.slice(0, 8)} (${daysOld}+ days old)`,
            severity: daysOld > 7 ? 'danger' : 'warning'
          });

        alertCount++;
      }
    }

    return alertCount;
  } catch (error) {
    console.error('Error creating undelivered order alerts:', error);
    return 0;
  }
}

/**
 * Create alerts for stale reserved orders (draft/reserved but not acted upon)
 */
export async function createReservedStaleAlerts(daysStale: number = 3): Promise<number> {
  try {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - daysStale);

    const { data: orders, error } = await supabaseAdmin
      .from('orders')
      .select(`
        id,
        created_at,
        status,
        client:clients (
          id,
          name
        )
      `)
      .eq('status', 'draft')
      .lt('created_at', cutoffDate.toISOString());

    if (error) throw error;

    let alertCount = 0;

    for (const order of orders || []) {
      // Check if alert already exists for today
      const { data: existingAlert } = await supabaseAdmin
        .from('alerts')
        .select('id')
        .eq('type', 'reserved_stale')
        .eq('ref_id', order.id)
        .gte('created_at', new Date().toISOString().split('T')[0]);

      if (!existingAlert || existingAlert.length === 0) {
        await supabaseAdmin
          .from('alerts')
          .insert({
            type: 'reserved_stale',
            ref_id: order.id,
            message: `Stale reserved order: ${order.client?.name || 'Unknown'} - Order #${order.id.slice(0, 8)} needs confirmation`,
            severity: 'info'
          });

        alertCount++;
      }
    }

    return alertCount;
  } catch (error) {
    console.error('Error creating stale reserved alerts:', error);
    return 0;
  }
}

/**
 * Run all daily alert checks
 */
export async function runDailyAlerts(): Promise<{
  lowStock: number;
  overduePayments: number;
  undelivered: number;
  reservedStale: number;
  total: number;
}> {
  const lowStock = await createLowStockAlerts();
  const overduePayments = await createOverduePaymentAlerts(30);
  const undelivered = await createUndeliveredOrderAlerts(2);
  const reservedStale = await createReservedStaleAlerts(3);

  return {
    lowStock,
    overduePayments,
    undelivered,
    reservedStale,
    total: lowStock + overduePayments + undelivered + reservedStale
  };
}

/**
 * Get all alerts with optional filters
 */
export async function getAlerts(filters?: {
  type?: AlertType;
  severity?: AlertSeverity;
  delivered?: boolean;
  limit?: number;
}): Promise<Alert[]> {
  try {
    let query = supabaseAdmin
      .from('alerts')
      .select('*')
      .order('created_at', { ascending: false });

    if (filters?.type) {
      query = query.eq('type', filters.type);
    }

    if (filters?.severity) {
      query = query.eq('severity', filters.severity);
    }

    if (filters?.delivered !== undefined) {
      query = query.eq('delivered', filters.delivered);
    }

    if (filters?.limit) {
      query = query.limit(filters.limit);
    }

    const { data, error } = await query;

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Error fetching alerts:', error);
    return [];
  }
}

/**
 * Mark alert as delivered/acknowledged
 */
export async function markAlertDelivered(alertId: string): Promise<boolean> {
  try {
    const { error } = await supabaseAdmin
      .from('alerts')
      .update({ delivered: true })
      .eq('id', alertId);

    if (error) throw error;
    return true;
  } catch (error) {
    console.error('Error marking alert as delivered:', error);
    return false;
  }
}
