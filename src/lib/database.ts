import { supabase, supabaseAdmin } from './supabase';
import { 
  Product, 
  Client, 
  Order, 
  OrderItem, 
  Payment, 
  Return,
  Deal,
  DashboardStats,
  CreateProductData,
  CreateClientData,
  CreateOrderData,
  CreatePaymentData,
  CreateDealData
} from '@/types/database';

// Products
export async function getProducts(): Promise<Product[]> {
  try {
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .order('is_runner', { ascending: false })      // Runners first
      .order('is_best_seller', { ascending: false }) // Best sellers second
      .order('is_promotion', { ascending: false })   // Promotions third
      .order('total_stock', { ascending: false })    // In-stock items next
      .order('created_at', { ascending: false });    // Newest last
    
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
  let dbUpdates: any = updates;
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
  try {
    // Get the current order with items to understand stock changes
    const currentOrder = await getOrder(id);
    if (!currentOrder) {
      throw new Error('Order not found');
    }

    // Start a transaction-like operation
    // First, get the current order items
    const { data: orderItems, error: itemsError } = await supabase
      .from('order_items')
      .select('product_id, quantity')
      .eq('order_id', id);

    if (itemsError) throw itemsError;

    // Handle stock changes based on status transitions
    if (currentOrder.status !== status) {
      for (const item of orderItems || []) {
        // Get current product stock
        const { data: product, error: productError } = await supabase
          .from('products')
          .select('total_stock, reserved_stock')
          .eq('id', item.product_id)
          .single();

        if (productError) throw productError;

        let newTotalStock = product.total_stock;
        let newReservedStock = product.reserved_stock;

        // Status transition logic
        if (currentOrder.status === 'draft' && status === 'reserved') {
          // Reserve stock: move from total to reserved
          newReservedStock += item.quantity;
        } else if (currentOrder.status === 'reserved' && status === 'delivered') {
          // Deliver order: remove from both total and reserved
          newTotalStock -= item.quantity;
          newReservedStock -= item.quantity;
        } else if (currentOrder.status === 'delivered' && status === 'reserved') {
          // Reverse delivery: add back to total and reserve
          newTotalStock += item.quantity;
          newReservedStock += item.quantity;
        } else if (currentOrder.status === 'reserved' && status === 'draft') {
          // Unreserve: move from reserved back to total (no change to total)
          newReservedStock -= item.quantity;
        } else if (currentOrder.status === 'draft' && status === 'delivered') {
          // Direct delivery from draft: remove from total only
          newTotalStock -= item.quantity;
        } else if (currentOrder.status === 'delivered' && status === 'draft') {
          // Reverse direct delivery: add back to total
          newTotalStock += item.quantity;
        } else if (currentOrder.status === 'delivered' && status === 'closed') {
          // Close order: no stock changes, just status change
          // Stock was already deducted when delivered
        } else if (currentOrder.status === 'closed' && status === 'delivered') {
          // Reopen closed order: no stock changes
          // Stock should already be deducted from when it was delivered
        }

        // Ensure stock doesn't go negative
        newTotalStock = Math.max(0, newTotalStock);
        newReservedStock = Math.max(0, newReservedStock);

        // Update product stock
        const { error: updateError } = await supabase
          .from('products')
          .update({
            total_stock: newTotalStock,
            reserved_stock: newReservedStock
          })
          .eq('id', item.product_id);

        if (updateError) throw updateError;
      }
    }

    // Update the order status
    const { data, error } = await supabase
      .from('orders')
      .update({ 
        status,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    
    // Return the complete updated order
    return getOrder(id) as Promise<Order>;
  } catch (error) {
    console.error('Error updating order status:', error);
    throw error;
  }
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

// Deals
export async function getDeals(activeOnly: boolean = false): Promise<Deal[]> {
  try {
    let query = supabase
      .from('deals')
      .select(`
        *,
        product:products(*)
      `)
      .order('priority', { ascending: false })
      .order('created_at', { ascending: false });
    
    if (activeOnly) {
      query = query.eq('is_active', true);
    }
    
    const { data, error } = await query;
    
    if (error) throw error;
    return data || [];
  } catch (error) {
    console.warn('Database not available, returning empty deals array:', error);
    return [];
  }
}

export async function getDeal(id: string): Promise<Deal | null> {
  try {
    const { data, error } = await supabase
      .from('deals')
      .select(`
        *,
        product:products(*)
      `)
      .eq('id', id)
      .single();
    
    if (error) throw error;
    return data;
  } catch (error) {
    console.warn('Database not available, returning null deal:', error);
    return null;
  }
}

export async function getDealsByProduct(productId: string): Promise<Deal[]> {
  try {
    const { data, error } = await supabase
      .from('deals')
      .select(`
        *,
        product:products(*)
      `)
      .eq('product_id', productId)
      .eq('is_active', true)
      .order('priority', { ascending: false });
    
    if (error) throw error;
    return data || [];
  } catch (error) {
    console.warn('Database not available, returning empty deals array:', error);
    return [];
  }
}

export async function createDeal(dealData: CreateDealData): Promise<Deal> {
  try {
    const { data, error } = await supabase
      .from('deals')
      .insert({
        title: dealData.title,
        description: dealData.description || null,
        product_id: dealData.product_id,
        priority: dealData.priority || 0,
        tier_1_qty: dealData.tier_1_qty || 1,
        tier_1_price: dealData.tier_1_price,
        tier_2_qty: dealData.tier_2_qty || null,
        tier_2_price: dealData.tier_2_price || null,
        tier_3_qty: dealData.tier_3_qty || null,
        tier_3_price: dealData.tier_3_price || null,
        expiration_type: dealData.expiration_type || 'none',
        expires_at: dealData.expires_at || null,
        max_quantity: dealData.max_quantity || null,
        sold_quantity: 0,
        payment_methods: dealData.payment_methods || ['cash'],
        payment_surcharge_check_month: dealData.payment_surcharge_check_month || 0,
        payment_surcharge_check_week: dealData.payment_surcharge_check_week || 0,
        payment_notes: dealData.payment_notes || null,
        allowed_colors: dealData.allowed_colors || null,
        required_importer: dealData.required_importer || null,
        is_esim: dealData.is_esim || null,
        additional_specs: dealData.additional_specs || null,
        notes: dealData.notes || null,
        internal_notes: dealData.internal_notes || null,
        is_active: true,
      })
      .select(`
        *,
        product:products(*)
      `)
      .single();
    
    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Failed to create deal:', error);
    throw error;
  }
}

export async function updateDeal(id: string, updates: Partial<CreateDealData> & { is_active?: boolean; sold_quantity?: number }): Promise<Deal> {
  try {
    const { data, error } = await supabase
      .from('deals')
      .update(updates)
      .eq('id', id)
      .select(`
        *,
        product:products(*)
      `)
      .single();
    
    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Failed to update deal:', error);
    throw error;
  }
}

export async function deleteDeal(id: string): Promise<void> {
  const { error } = await supabase
    .from('deals')
    .delete()
    .eq('id', id);
  
  if (error) throw error;
}

export async function incrementDealSoldQuantity(id: string, quantity: number = 1): Promise<Deal> {
  try {
    // Get current deal
    const deal = await getDeal(id);
    if (!deal) {
      throw new Error('Deal not found');
    }
    
    // Increment sold quantity
    const newSoldQuantity = deal.sold_quantity + quantity;
    
    // Check if deal should be deactivated
    let shouldDeactivate = false;
    if (deal.max_quantity && newSoldQuantity >= deal.max_quantity) {
      shouldDeactivate = true;
    }
    
    // Update deal
    return await updateDeal(id, {
      sold_quantity: newSoldQuantity,
      is_active: shouldDeactivate ? false : deal.is_active,
    });
  } catch (error) {
    console.error('Failed to increment deal sold quantity:', error);
    throw error;
  }
}
