/**
 * Alerts engine for business notifications
 */

import { createClient } from '@supabase/supabase-js';
import { Product, AlertType, AlertSeverity } from '@/types/database';
import { sendWhatsApp } from './whatsapp';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

/**
 * Calculate available stock for a product
 */
function availableStock(product: Product): number {
  return product.total_stock - product.reserved_stock;
}

/**
 * Create low stock alerts
 */
export async function createLowStockAlerts(): Promise<number> {
  try {
    // Find products with low stock
    const { data: products, error } = await supabase
      .from('products')
      .select('*')
      .not('min_stock_alert', 'is', null);

    if (error) {
      console.error('Error fetching products for low stock alerts:', error);
      return 0;
    }

    if (!products) return 0;

    let alertCount = 0;
    const today = new Date();
    today.setHours(0, 0, 0, 0); // Start of today

    for (const product of products) {
      const stock = availableStock(product);
      
      if (stock <= product.min_stock_alert) {
        // Check if alert already exists for this product today
        const { data: existingAlert } = await supabase
          .from('alerts')
          .select('id')
          .eq('type', 'low_stock')
          .eq('ref_id', product.id)
          .gte('created_at', today.toISOString())
          .limit(1)
          .single();

        if (!existingAlert) {
          const severity: AlertSeverity = stock === 0 ? 'danger' : 'warning';
          
          const { error: insertError } = await supabase
            .from('alerts')
            .insert({
              type: 'low_stock',
              ref_id: product.id,
              message: `${product.brand} ${product.model} has low stock: ${stock} remaining (min: ${product.min_stock_alert})`,
              severity
            });

          if (!insertError) {
            alertCount++;
          } else {
            console.error('Error creating low stock alert:', insertError);
          }
        }
      }
    }

    return alertCount;
  } catch (error) {
    console.error('Error in createLowStockAlerts:', error);
    return 0;
  }
}

/**
 * Create undelivered order alerts
 */
export async function createUndeliveredOrderAlerts(days: number = parseInt(process.env.ALERT_UNDELIVERED_DAYS || '3')): Promise<number> {
  try {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - days);

    // Find undelivered orders
    const { data: orders, error } = await supabase
      .from('orders')
      .select('id, created_at')
      .in('status', ['draft', 'reserved'])
      .lt('created_at', cutoffDate.toISOString());

    if (error) {
      console.error('Error fetching undelivered orders:', error);
      return 0;
    }

    if (!orders) return 0;

    let alertCount = 0;
    const today = new Date();
    today.setHours(0, 0, 0, 0); // Start of today

    for (const order of orders) {
      // Check if alert already exists for this order today
      const { data: existingAlert } = await supabase
        .from('alerts')
        .select('id')
        .eq('type', 'undelivered')
        .eq('ref_id', order.id)
        .gte('created_at', today.toISOString())
        .limit(1)
        .single();

      if (!existingAlert) {
        const { error: insertError } = await supabase
          .from('alerts')
          .insert({
            type: 'undelivered',
            ref_id: order.id,
            message: `Order #${order.id.slice(0, 8)} has been undelivered for ${days} days`,
            severity: 'warning'
          });

        if (!insertError) {
          alertCount++;
        } else {
          console.error('Error creating undelivered order alert:', insertError);
        }
      }
    }

    return alertCount;
  } catch (error) {
    console.error('Error in createUndeliveredOrderAlerts:', error);
    return 0;
  }
}

/**
 * Create overdue payment alerts
 */
export async function createOverduePaymentAlerts(days: number = parseInt(process.env.ALERT_OVERDUE_DAYS || '14')): Promise<number> {
  try {
    // Get all clients
    const { data: clients, error: clientsError } = await supabase
      .from('clients')
      .select('id, name, phone');

    if (clientsError) {
      console.error('Error fetching clients for overdue payments:', clientsError);
      return 0;
    }

    if (!clients) return 0;

    let alertCount = 0;
    const thisWeek = new Date();
    thisWeek.setDate(thisWeek.getDate() - thisWeek.getDay()); // Start of week
    thisWeek.setHours(0, 0, 0, 0);

    for (const client of clients) {
      // Calculate unpaid amount
      const { data: orders, error: ordersError } = await supabase
        .from('orders')
        .select('total_price, created_at')
        .eq('client_id', client.id)
        .in('status', ['delivered', 'closed']);

      if (ordersError) {
        console.error('Error fetching orders for client:', client.id, ordersError);
        continue;
      }

      const { data: payments, error: paymentsError } = await supabase
        .from('payments')
        .select('amount')
        .eq('client_id', client.id);

      if (paymentsError) {
        console.error('Error fetching payments for client:', client.id, paymentsError);
        continue;
      }

      const totalOrders = orders?.reduce((sum, order) => sum + order.total_price, 0) || 0;
      const totalPayments = payments?.reduce((sum, payment) => sum + payment.amount, 0) || 0;
      const unpaidAmount = totalOrders - totalPayments;

      if (unpaidAmount > 0) {
        // Find oldest unpaid order
        const oldestOrder = orders?.sort((a, b) => 
          new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
        )[0];

        if (oldestOrder && new Date(oldestOrder.created_at) < new Date(Date.now() - days * 24 * 60 * 60 * 1000)) {
          // Check if alert already exists for this client this week
          const { data: existingAlert } = await supabase
            .from('alerts')
            .select('id')
            .eq('type', 'overdue_payment')
            .eq('ref_id', client.id)
            .gte('created_at', thisWeek.toISOString())
            .limit(1)
            .single();

          if (!existingAlert) {
            const { error: insertError } = await supabase
              .from('alerts')
              .insert({
                type: 'overdue_payment',
                ref_id: client.id,
                message: `Client ${client.name} has overdue payment: $${unpaidAmount.toFixed(2)} (${days}+ days)`,
                severity: 'danger'
              });

            if (!insertError) {
              alertCount++;
              
              // Send WhatsApp payment reminder if client has phone
              if (client.phone) {
                const dueDate = new Date(oldestOrder.created_at);
                dueDate.setDate(dueDate.getDate() + 30); // Assume 30-day payment terms
                
                await sendWhatsApp({
                  to: client.phone,
                  template: 'payment_reminder',
                  variables: {
                    invoiceId: 'N/A',
                    amount: unpaidAmount.toFixed(2),
                    dueDate: dueDate.toLocaleDateString()
                  },
                  toClientId: client.id
                });
              }
            } else {
              console.error('Error creating overdue payment alert:', insertError);
            }
          }
        }
      }
    }

    return alertCount;
  } catch (error) {
    console.error('Error in createOverduePaymentAlerts:', error);
    return 0;
  }
}

/**
 * Create reserved stale alerts
 */
export async function createReservedStaleAlerts(days: number = parseInt(process.env.ALERT_RESERVED_STALE_DAYS || '3')): Promise<number> {
  try {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - days);

    // Find stale reserved orders
    const { data: orders, error } = await supabase
      .from('orders')
      .select(`
        id, 
        created_at, 
        client_id,
        clients!inner(phone, name)
      `)
      .eq('status', 'draft')
      .lt('created_at', cutoffDate.toISOString());

    if (error) {
      console.error('Error fetching stale reserved orders:', error);
      return 0;
    }

    if (!orders) return 0;

    let alertCount = 0;
    const today = new Date();
    today.setHours(0, 0, 0, 0); // Start of today

    for (const order of orders) {
      // Check if alert already exists for this order today
      const { data: existingAlert } = await supabase
        .from('alerts')
        .select('id')
        .eq('type', 'reserved_stale')
        .eq('ref_id', order.id)
        .gte('created_at', today.toISOString())
        .limit(1)
        .single();

      if (!existingAlert) {
        const { error: insertError } = await supabase
          .from('alerts')
          .insert({
            type: 'reserved_stale',
            ref_id: order.id,
            message: `Order #${order.id.slice(0, 8)} has been in draft status for ${days} days`,
            severity: 'warning'
          });

        if (!insertError) {
          alertCount++;
          
          // Send WhatsApp nudge if client has phone
          const client = Array.isArray(order.clients) ? order.clients[0] : order.clients;
          if (client?.phone) {
            await sendWhatsApp({
              to: client.phone,
              template: 'reserved_nudge',
              variables: {
                orderId: order.id.slice(0, 8)
              },
              toClientId: order.client_id
            });
          }
        } else {
          console.error('Error creating reserved stale alert:', insertError);
        }
      }
    }

    return alertCount;
  } catch (error) {
    console.error('Error in createReservedStaleAlerts:', error);
    return 0;
  }
}

/**
 * Create new order alert for admin
 */
export async function createNewOrderAlert(orderId: string, clientName: string, itemCount: number): Promise<boolean> {
  try {
    const adminPhone = process.env.ADMIN_PHONE || '+972546093624';
    
    // Create alert in database
    const { error: alertError } = await supabase
      .from('alerts')
      .insert({
        type: 'new_order',
        ref_id: orderId,
        message: `New order #${orderId.slice(0, 8)} from ${clientName} with ${itemCount} items`,
        severity: 'info'
      });

    if (alertError) {
      console.error('Error creating new order alert:', alertError);
      return false;
    }

    // Send WhatsApp notification to admin
    await sendWhatsApp({
      to: adminPhone,
      template: 'admin_new_order',
      variables: {
        orderId: orderId.slice(0, 8),
        clientName,
        itemCount
      }
    });

    return true;
  } catch (error) {
    console.error('Error in createNewOrderAlert:', error);
    return false;
  }
}

/**
 * Run all daily alerts
 */
export async function runDailyAlerts() {
  try {
    console.log('Running daily alerts...');
    
    const [lowStock, undelivered, overdue, reservedStale] = await Promise.all([
      createLowStockAlerts(),
      createUndeliveredOrderAlerts(),
      createOverduePaymentAlerts(),
      createReservedStaleAlerts()
    ]);

    const result = {
      lowStock,
      undelivered,
      overdue,
      reservedStale,
      total: lowStock + undelivered + overdue + reservedStale
    };

    console.log('Daily alerts completed:', result);
    return result;
  } catch (error) {
    console.error('Error running daily alerts:', error);
    return {
      lowStock: 0,
      undelivered: 0,
      overdue: 0,
      reservedStale: 0,
      total: 0,
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
}