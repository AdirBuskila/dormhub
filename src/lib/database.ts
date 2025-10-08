import { supabase, supabaseAdmin } from './supabase';
import { 
  Product, 
  Client, 
  Order, 
  OrderItem, 
  Payment, 
  Return,
  DashboardStats,
  CreateProductData,
  CreateClientData,
  CreateOrderData,
  CreatePaymentData
} from '@/types/database';

// Products
export async function getProducts(): Promise<Product[]> {
  try {
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    return data || [];
  } catch (error) {
    console.warn('Database not available, returning empty products array:', error);
    return [];
  }
}

export async function getProduct(id: string): Promise<Product | null> {
  try {
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .eq('id', id)
      .single();
    
    if (error) throw error;
    return data;
  } catch (error) {
    console.warn('Database not available, returning null product:', error);
    return null;
  }
}

export async function createProduct(product: CreateProductData): Promise<Product> {
  try {
    // Map stock to total_stock for database
    const { stock, ...rest } = product;
    const dbProduct = { ...rest, total_stock: stock };
    
    const { data, error } = await supabase
      .from('products')
      .insert(dbProduct)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  } catch (error) {
    console.warn('Database not available, cannot create product:', error);
    // Return a mock product for development
    return {
      id: Math.random().toString(36).substr(2, 9),
      ...product,
      total_stock: product.stock,
      reserved_stock: 0,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    } as Product;
  }
}

export async function updateProduct(id: string, updates: Partial<CreateProductData>): Promise<Product> {
  // Map stock to total_stock for database if present
  let dbUpdates = updates;
  if (updates.stock !== undefined) {
    const { stock, ...rest } = updates;
    dbUpdates = { ...rest, total_stock: stock };
  }
  
  const { data, error } = await supabase
    .from('products')
    .update(dbUpdates)
    .eq('id', id)
    .select()
    .single();
  
  if (error) throw error;
  return data;
}

export async function deleteProduct(id: string): Promise<void> {
  const { error } = await supabase
    .from('products')
    .delete()
    .eq('id', id);
  
  if (error) throw error;
}

export async function getLowStockProducts(): Promise<Product[]> {
  const { data, error } = await supabase
    .from('products')
    .select('*')
    .lte('total_stock', supabase.raw('min_stock_alert'))
    .order('total_stock', { ascending: true });
  
  if (error) throw error;
  return data || [];
}

// Clients
export async function getClients(): Promise<Client[]> {
  try {
    const { data, error } = await supabase
      .from('clients')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    return data || [];
  } catch (error) {
    console.warn('Database not available, returning empty clients array:', error);
    return [];
  }
}

export async function getClient(id: string): Promise<Client | null> {
  const { data, error } = await supabase
    .from('clients')
    .select('*')
    .eq('id', id)
    .single();
  
  if (error) throw error;
  return data;
}

export async function createClient(client: CreateClientData): Promise<Client> {
  const { data, error } = await supabase
    .from('clients')
    .insert(client)
    .select()
    .single();
  
  if (error) throw error;
  return data;
}

export async function updateClient(id: string, updates: Partial<CreateClientData>): Promise<Client> {
  const { data, error } = await supabase
    .from('clients')
    .update(updates)
    .eq('id', id)
    .select()
    .single();
  
  if (error) throw error;
  return data;
}

export async function deleteClient(id: string): Promise<void> {
  const { error } = await supabase
    .from('clients')
    .delete()
    .eq('id', id);
  
  if (error) throw error;
}

// Orders
export async function getOrders(): Promise<Order[]> {
  try {
    const { data, error } = await supabase
      .from('orders')
      .select(`
        *,
        client:clients(*),
        order_items:order_items(
          *,
          product:products(*)
        )
      `)
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    return data || [];
  } catch (error) {
    console.warn('Database not available, returning empty orders array:', error);
    return [];
  }
}

export async function getOrder(id: string): Promise<Order | null> {
  const { data, error } = await supabase
    .from('orders')
    .select(`
      *,
      client:clients(*),
      order_items:order_items(
        *,
        product:products(*)
      )
    `)
    .eq('id', id)
    .single();
  
  if (error) throw error;
  return data;
}

export async function createOrder(orderData: CreateOrderData): Promise<Order> {
  try {
    const { client_id, notes, items } = orderData;
    
    // Calculate total price
    const total_price = items.reduce((sum, item) => sum + (item.quantity * item.price), 0);
    
    // Create the order
    const { data: order, error: orderError } = await supabase
      .from('orders')
      .insert({
        client_id,
        notes,
        status: 'draft',
        total_price
      })
      .select()
      .single();
    
    if (orderError) throw orderError;
    
    // Create order items
    const orderItems = items.map(item => ({
      order_id: order.id,
      product_id: item.product_id,
      quantity: item.quantity,
      price: item.price
    }));
    
    const { error: itemsError } = await supabase
      .from('order_items')
      .insert(orderItems);
    
    if (itemsError) throw itemsError;
    
    // Return the complete order
    return getOrder(order.id) as Promise<Order>;
  } catch (error) {
    console.warn('Database not available, cannot create order:', error);
    // Return a mock order for development
    return {
      id: Math.random().toString(36).substr(2, 9),
      client_id: orderData.client_id,
      notes: orderData.notes || '',
      status: 'draft',
      total_price: orderData.items.reduce((sum, item) => sum + (item.quantity * item.price), 0),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      order_items: orderData.items.map(item => ({
        id: Math.random().toString(36).substr(2, 9),
        order_id: Math.random().toString(36).substr(2, 9),
        product_id: item.product_id,
        quantity: item.quantity,
        price: item.price,
        created_at: new Date().toISOString()
      }))
    } as Order;
  }
}

export async function updateOrderStatus(id: string, status: string): Promise<Order> {
  const { data, error } = await supabase
    .from('orders')
    .update({ status })
    .eq('id', id)
    .select()
    .single();
  
  if (error) throw error;
  return data;
}

export async function getOrdersToDeliverToday(): Promise<Order[]> {
  const today = new Date().toISOString().split('T')[0];
  
  const { data, error } = await supabase
    .from('orders')
    .select(`
      *,
      client:clients(*),
      order_items:order_items(
        *,
        product:products(*)
      )
    `)
    .eq('status', 'reserved')
    .gte('created_at', today)
    .order('created_at', { ascending: true });
  
  if (error) throw error;
  return data || [];
}

// Payments
export async function getPayments(): Promise<Payment[]> {
  const { data, error } = await supabase
    .from('payments')
    .select(`
      *,
      client:clients(*),
      order:orders(*)
    `)
    .order('date', { ascending: false });
  
  if (error) throw error;
  return data || [];
}

export async function createPayment(payment: CreatePaymentData): Promise<Payment> {
  const { data, error } = await supabase
    .from('payments')
    .insert(payment)
    .select(`
      *,
      client:clients(*),
      order:orders(*)
    `)
    .single();
  
  if (error) throw error;
  return data;
}

export async function getOverduePayments(): Promise<Payment[]> {
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
  
  const { data, error } = await supabase
    .from('payments')
    .select(`
      *,
      client:clients(*),
      order:orders(*)
    `)
    .lt('date', thirtyDaysAgo.toISOString())
    .order('date', { ascending: true });
  
  if (error) throw error;
  return data || [];
}

// Dashboard Stats
export async function getDashboardStats(): Promise<DashboardStats> {
  try {
    const [
      ordersToDeliver,
      lowStockProducts,
      overduePayments,
      recentOrders
    ] = await Promise.all([
      getOrdersToDeliverToday(),
      getLowStockProducts(),
      getOverduePayments(),
      getOrders()
    ]);

    // Calculate totals
    const totalRevenue = recentOrders
      .filter(order => order.status === 'delivered')
      .reduce((sum, order) => sum + order.total_price, 0);

    // For now, we'll estimate profit as 20% of revenue
    // In a real app, you'd track cost prices
    const totalProfit = totalRevenue * 0.2;

    const outstandingDebts = recentOrders
      .filter(order => order.status === 'delivered')
      .reduce((sum, order) => {
        const client = order.client;
        return sum + (client?.total_debt || 0);
      }, 0);

    return {
      ordersToDeliverToday: ordersToDeliver.length,
      lowStockItems: lowStockProducts.length,
      outstandingDebts,
      totalRevenue,
      totalProfit,
      recentOrders: recentOrders.slice(0, 5),
      lowStockProducts,
      overduePayments
    };
  } catch (error) {
    // Return mock data when database is not available
    console.warn('Database not available, returning mock data:', error);
    return {
      ordersToDeliverToday: 0,
      lowStockItems: 0,
      outstandingDebts: 0,
      totalRevenue: 0,
      totalProfit: 0,
      recentOrders: [],
      lowStockProducts: [],
      overduePayments: []
    };
  }
}

// Returns
export async function getReturns(): Promise<Return[]> {
  const { data, error } = await supabase
    .from('returns')
    .select(`
      *,
      product:products(*),
      client:clients(*)
    `)
    .order('created_at', { ascending: false });
  
  if (error) throw error;
  return data || [];
}

export async function createReturn(returnData: {
  product_id: string;
  client_id?: string;
  reason: string;
  condition: string;
}): Promise<Return> {
  const { data, error } = await supabase
    .from('returns')
    .insert(returnData)
    .select(`
      *,
      product:products(*),
      client:clients(*)
    `)
    .single();
  
  if (error) throw error;
  return data;
}
