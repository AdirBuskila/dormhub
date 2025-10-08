import { supabaseAdmin } from './supabase';

export interface KpiData {
  toDeliver: number;
  lowStock: number;
  receivables: number;
  newOrders: number;
  paymentsYesterday: number;
}

export interface OrderToDeliver {
  order_id: string;
  client_name: string;
  items_count: number;
  promised_date: string | null;
  status: string;
  balance_due: number;
  created_at: string;
}

export interface LowStockItem {
  product_id: string;
  brand: string;
  model: string;
  storage: string;
  condition: string;
  total: number;
  reserved: number;
  available: number;
  min_alert: number;
}

export interface TopDebtor {
  client_id: string;
  client_name: string;
  outstanding: number;
  last_payment_at: string | null;
  days_overdue: number;
}

export interface RecentPayment {
  payment_id: string;
  client_name: string;
  amount: number;
  method: string;
  date: string;
}

export interface RecentAlert {
  id: string;
  type: string;
  message: string;
  severity: string;
  created_at: string;
  delivered: boolean;
}

/**
 * Get KPIs for dashboard
 */
export async function getKpis(tz: string = 'Asia/Jerusalem'): Promise<KpiData> {
  try {
    // To Deliver: orders with status in ('draft','reserved') and created within last 48 hours
    const { count: toDeliverCount, error: toDeliverError } = await supabaseAdmin
      .from('orders')
      .select('*', { count: 'exact', head: true })
      .in('status', ['draft', 'reserved'])
      .gte('created_at', new Date(Date.now() - 48 * 60 * 60 * 1000).toISOString());

    // Low-Stock SKUs: get all products and filter in JavaScript
    const { data: allProducts } = await supabaseAdmin
      .from('products')
      .select('total_stock, reserved_stock, min_stock_alert');
    
    const lowStockCount = allProducts?.filter(p => 
      p.total_stock <= (p.reserved_stock + p.min_stock_alert)
    ).length || 0;

    // Receivables: sum(orders.total_price for status in ('delivered','closed')) - sum(payments.amount)
    const { data: ordersData } = await supabaseAdmin
      .from('orders')
      .select('total_price')
      .in('status', ['delivered', 'closed']);
    
    const { data: paymentsData } = await supabaseAdmin
      .from('payments')
      .select('amount');

    const totalOrdersValue = ordersData?.reduce((sum, order) => sum + (order.total_price || 0), 0) || 0;
    const totalPayments = paymentsData?.reduce((sum, payment) => sum + (payment.amount || 0), 0) || 0;
    const receivables = Math.max(0, totalOrdersValue - totalPayments);

    // New Orders Today: count of orders created today
    const today = new Date().toISOString().split('T')[0];
    const { count: newOrdersCount, error: newOrdersError } = await supabaseAdmin
      .from('orders')
      .select('*', { count: 'exact', head: true })
      .gte('created_at', today);

    // Payments Yesterday: sum of payments dated yesterday
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayStr = yesterday.toISOString().split('T')[0];
    
    const { data: yesterdayPayments } = await supabaseAdmin
      .from('payments')
      .select('amount')
      .gte('date', yesterdayStr)
      .lt('date', new Date().toISOString().split('T')[0]);
    
    const paymentsYesterday = yesterdayPayments?.reduce((sum, payment) => sum + (payment.amount || 0), 0) || 0;

    return {
      toDeliver: toDeliverCount || 0,
      lowStock: lowStockCount,
      receivables,
      newOrders: newOrdersCount || 0,
      paymentsYesterday,
    };
  } catch (error) {
    console.error('Error fetching KPIs:', error);
    return {
      toDeliver: 0,
      lowStock: 0,
      receivables: 0,
      newOrders: 0,
      paymentsYesterday: 0,
    };
  }
}

/**
 * Get orders to deliver
 */
export async function getOrdersToDeliver({ 
  limit = 15, 
  offset = 0 
}: { 
  limit?: number; 
  offset?: number; 
} = {}): Promise<OrderToDeliver[]> {
  try {
    const { data, error } = await supabaseAdmin
      .from('orders')
      .select(`
        id,
        status,
        promised_date,
        created_at,
        total_price,
        client:clients(name)
      `)
      .in('status', ['draft', 'reserved'])
      .order('promised_date', { ascending: true, nullsFirst: false })
      .order('created_at', { ascending: true })
      .range(offset, offset + limit - 1);

    if (error) throw error;

    // Get payments for each client to calculate balance due
    const clientIds = data?.map(order => order.client_id).filter(Boolean) || [];
    const { data: paymentsData } = await supabaseAdmin
      .from('payments')
      .select('client_id, amount')
      .in('client_id', clientIds);

    // Get order items count for each order
    const orderIds = data?.map(order => order.id) || [];
    const { data: orderItemsData } = await supabaseAdmin
      .from('order_items')
      .select('order_id')
      .in('order_id', orderIds);

    return data?.map(order => {
      const clientPayments = paymentsData?.filter(p => p.client_id === order.client_id) || [];
      const totalPayments = clientPayments.reduce((sum, p) => sum + (p.amount || 0), 0);
      const itemsCount = orderItemsData?.filter(oi => oi.order_id === order.id).length || 0;
      
      return {
        order_id: order.id,
        client_name: 'Unknown Client', // TODO: Get client name from separate query
        items_count: itemsCount,
        promised_date: order.promised_date,
        status: order.status,
        balance_due: Math.max(0, (order.total_price || 0) - totalPayments),
        created_at: order.created_at,
      };
    }) || [];
  } catch (error) {
    console.error('Error fetching orders to deliver:', error);
    return [];
  }
}

/**
 * Get low stock items
 */
export async function getLowStock({ 
  limit = 15, 
  offset = 0 
}: { 
  limit?: number; 
  offset?: number; 
} = {}): Promise<LowStockItem[]> {
  try {
    // Get all products and filter in JavaScript
    const { data: allProducts, error } = await supabaseAdmin
      .from('products')
      .select(`
        id,
        brand,
        model,
        storage,
        condition,
        total_stock,
        reserved_stock,
        min_stock_alert
      `);

    if (error) throw error;

    // Filter for low stock items
    const lowStockProducts = allProducts?.filter(product => 
      product.total_stock <= (product.reserved_stock + product.min_stock_alert)
    ) || [];

    // Sort by available stock (ascending) and apply pagination
    const sortedProducts = lowStockProducts
      .sort((a, b) => (a.total_stock - a.reserved_stock) - (b.total_stock - b.reserved_stock))
      .slice(offset, offset + limit);

    return sortedProducts.map(product => ({
      product_id: product.id,
      brand: product.brand,
      model: product.model,
      storage: product.storage,
      condition: product.condition,
      total: product.total_stock,
      reserved: product.reserved_stock,
      available: product.total_stock - product.reserved_stock,
      min_alert: product.min_stock_alert,
    }));
  } catch (error) {
    console.error('Error fetching low stock items:', error);
    return [];
  }
}

/**
 * Get top debtors
 */
export async function getTopDebtors({ 
  limit = 10 
}: { 
  limit?: number; 
} = {}): Promise<TopDebtor[]> {
  try {
    // Get all clients
    const { data: clients, error: clientsError } = await supabaseAdmin
      .from('clients')
      .select('id, name');

    if (clientsError) throw clientsError;

    // Get orders and payments for all clients
    const clientIds = clients?.map(c => c.id) || [];
    
    const { data: ordersData } = await supabaseAdmin
      .from('orders')
      .select('client_id, total_price, created_at')
      .in('client_id', clientIds)
      .in('status', ['delivered', 'closed']);

    const { data: paymentsData } = await supabaseAdmin
      .from('payments')
      .select('client_id, amount, date')
      .in('client_id', clientIds);

    // Calculate outstanding amounts for each client
    const debtors: TopDebtor[] = clients?.map(client => {
      const clientOrders = ordersData?.filter(o => o.client_id === client.id) || [];
      const clientPayments = paymentsData?.filter(p => p.client_id === client.id) || [];
      
      const totalOrderValue = clientOrders.reduce((sum, order) => sum + (order.total_price || 0), 0);
      const totalPayments = clientPayments.reduce((sum, payment) => sum + (payment.amount || 0), 0);
      const outstanding = Math.max(0, totalOrderValue - totalPayments);
      
      const lastPayment = clientPayments.sort((a, b) => 
        new Date(b.date).getTime() - new Date(a.date).getTime()
      )[0];
      
      const oldestUnpaidOrder = clientOrders
        .filter(order => (order.total_price || 0) > 0)
        .sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime())[0];
      
      const daysOverdue = oldestUnpaidOrder ? 
        Math.floor((new Date().getTime() - new Date(oldestUnpaidOrder.created_at).getTime()) / (1000 * 60 * 60 * 24)) : 0;

      return {
        client_id: client.id,
        client_name: client.name,
        outstanding,
        last_payment_at: lastPayment?.date || null,
        days_overdue: daysOverdue,
      };
    }).filter(debtor => debtor.outstanding > 0) || [];

    // Sort by outstanding amount and limit
    return debtors
      .sort((a, b) => b.outstanding - a.outstanding)
      .slice(0, limit);
  } catch (error) {
    console.error('Error fetching top debtors:', error);
    return [];
  }
}

/**
 * Get recent payments
 */
export async function getRecentPayments({ 
  limit = 10 
}: { 
  limit?: number; 
} = {}): Promise<RecentPayment[]> {
  try {
    const { data, error } = await supabaseAdmin
      .from('payments')
      .select(`
        id,
        amount,
        method,
        date,
        client:clients(name)
      `)
      .order('date', { ascending: false })
      .limit(limit);

    if (error) throw error;

    return data.map(payment => ({
      payment_id: payment.id,
      client_name: Array.isArray(payment.client) ? payment.client[0]?.name || 'Unknown Client' : 'Unknown Client',
      amount: payment.amount,
      method: payment.method,
      date: payment.date,
    }));
  } catch (error) {
    console.error('Error fetching recent payments:', error);
    return [];
  }
}

/**
 * Get recent alerts
 */
export async function getRecentAlerts({ 
  limit = 20 
}: { 
  limit?: number; 
} = {}): Promise<RecentAlert[]> {
  try {
    const { data, error } = await supabaseAdmin
      .from('alerts')
      .select('id, type, message, severity, created_at, delivered')
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Error fetching recent alerts:', error);
    return [];
  }
}
