export type ProductCondition = 'new' | 'refurbished' | 'used' | 'activated' | 'open_box';
export type ProductCategory = 'phone' | 'tablet' | 'earphones' | 'accessories';
export type OrderStatus = 'draft' | 'reserved' | 'delivered' | 'closed';
export type PaymentMethod = 'cash' | 'transfer' | 'check' | 'credit';
export type OrderSource = 'whatsapp' | 'phone' | 'portal';
export type ReturnStatus = 'pending' | 'inspected' | 'restocked' | 'refurbish' | 'scrap';
export type AlertType = 'low_stock' | 'undelivered' | 'overdue_payment' | 'reserved_stale';
export type AlertSeverity = 'info' | 'warning' | 'danger';
export type OutboundChannel = 'whatsapp';
export type ReturnReason = 'defective' | 'unsold' | 'trade_in';
export type ReturnCondition = 'returned' | 'refurbish' | 'restocked';

export interface Product {
  id: string;
  brand: string;
  model: string;
  storage: string;
  condition: ProductCondition;
  category: ProductCategory;
  total_stock: number;
  reserved_stock: number;
  min_stock_alert: number;
  image_url?: string;
  created_at: string;
  updated_at?: string;
  available_stock?: number; // Computed field from view
}

export interface Client {
  id: string;
  name: string;
  phone: string;
  address: string;
  payment_terms: string;
  custom_pricing: Record<string, number> | null;
  total_spent: number;
  total_debt: number;
  created_at: string;
  updated_at: string;
}

export interface Order {
  id: string;
  client_id: string;
  created_at: string;
  updated_at?: string;
  status: OrderStatus;
  total_price: number;
  promised_date?: string | null;
  source?: OrderSource | null;
  notes: string | null;
  client?: Client;
  order_items?: OrderItem[];
}

export interface OrderItem {
  id: string;
  order_id: string;
  product_id: string;
  quantity: number;
  price: number;
  product?: Product;
}

export interface Payment {
  id: string;
  client_id: string;
  order_id: string | null;
  amount: number;
  method: PaymentMethod;
  reference?: string | null;
  date: string;
  created_at: string;
  client?: Client;
  order?: Order;
}

export interface Return {
  id: string;
  product_id: string;
  client_id: string | null;
  reason: ReturnReason;
  condition: ReturnCondition;
  status: ReturnStatus;
  created_at: string;
  product?: Product;
  client?: Client;
}

export interface DashboardStats {
  ordersToDeliverToday: number;
  lowStockItems: number;
  outstandingDebts: number;
  totalRevenue: number;
  totalProfit: number;
  recentOrders: Order[];
  lowStockProducts: Product[];
  overduePayments: Payment[];
}

export interface CreateProductData {
  brand: string;
  model: string;
  storage: string;
  condition: ProductCondition;
  category: ProductCategory;
  stock: number;
  min_stock_alert: number;
  image_url?: string;
}

export interface CreateClientData {
  name: string;
  phone: string;
  address: string;
  payment_terms: string;
  custom_pricing?: Record<string, number>;
}

export interface CreateOrderData {
  client_id: string;
  notes?: string;
  items: {
    product_id: string;
    quantity: number;
    price: number;
  }[];
}

export interface CreatePaymentData {
  client_id: string;
  order_id?: string;
  amount: number;
  method: PaymentMethod;
  reference?: string;
  date: string;
}

export interface Alert {
  id: string;
  type: AlertType;
  ref_id: string | null;
  message: string;
  severity: AlertSeverity;
  delivered: boolean;
  created_at: string;
}

export interface Alert {
  id: string;
  type: AlertType;
  ref_id: string | null;
  message: string;
  severity: AlertSeverity;
  delivered: boolean;
  created_at: string;
}

export interface OutboundMessage {
  id: string;
  channel: OutboundChannel;
  to_client_id: string | null;
  to_phone: string;
  template: string;
  payload: Record<string, any>;
  sent: boolean;
  sent_at: string | null;
  error: string | null;
  created_at: string;
}
