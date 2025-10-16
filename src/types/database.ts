export type ProductCondition = 'new' | 'refurbished' | 'used' | 'activated' | 'open_box';
export type ProductCategory = 'iphone' | 'samsung' | 'android_phone' | 'tablet' | 'smartwatch' | 'earphones' | 'chargers' | 'cases' | 'accessories';
export type OrderStatus = 'draft' | 'reserved' | 'delivered' | 'closed';
export type PaymentMethod = 'cash' | 'transfer' | 'check' | 'credit';
export type OrderSource = 'whatsapp' | 'phone' | 'portal';
export type ReturnStatus = 'pending' | 'inspected' | 'restocked' | 'refurbish' | 'scrap';
export type AlertType = 'low_stock' | 'undelivered' | 'overdue_payment' | 'reserved_stale' | 'new_order';
export type AlertSeverity = 'info' | 'warning' | 'danger';
export type OutboundChannel = 'whatsapp';
export type ReturnReason = 'defective' | 'unsold' | 'trade_in';
export type ReturnCondition = 'returned' | 'refurbish' | 'restocked';
export type ImporterType = 'official' | 'parallel';

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
  // New B2B fields
  purchase_price: number;
  sale_price_default: number;
  alert_threshold: number;
  importer: ImporterType;
  warranty_provider?: string;
  warranty_months: number;
  is_promotion: boolean;
  is_runner: boolean;
  is_best_seller: boolean;
  tags: string[];
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
  stock: number; // This is used for form data, will be mapped to total_stock in database
  min_stock_alert: number;
  image_url?: string;
  // New B2B fields
  purchase_price: number;
  sale_price_default: number;
  alert_threshold: number;
  importer: ImporterType;
  warranty_provider?: string;
  warranty_months: number;
  is_promotion: boolean;
  is_runner: boolean;
  is_best_seller: boolean;
  tags: string[];
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

// New interfaces for B2B improvements
export interface DailyKpis {
  unitsSold: number;
  revenue: number;
  cost: number;
  profit: number;
}

export interface ProfitByClient {
  client_id: string;
  client_name: string;
  orders: number;
  revenue: number;
  cost: number;
  profit: number;
  profit_percentage: number;
}

export interface BestSeller {
  product_id: string;
  brand: string;
  model: string;
  storage: string;
  quantity_sold: number;
  revenue: number;
}

export interface LowStockItem {
  product_id: string;
  brand: string;
  model: string;
  storage: string;
  available_stock: number;
  alert_threshold: number;
}

// Promotions
export type PromotionStatus = 'active' | 'scheduled' | 'expired' | 'inactive';

export interface Promotion {
  id: string;
  product_id: string;
  title: string;
  title_he?: string;
  description?: string;
  description_he?: string;
  promo_price: number;
  original_price?: number;
  starts_at: string;
  ends_at: string;
  max_units?: number;
  units_sold: number;
  active: boolean;
  created_at: string;
  updated_at: string;
  created_by?: string;
  product?: Product;
  // Computed fields
  has_units_available?: boolean;
  units_remaining?: number;
  status?: PromotionStatus;
}

export interface CreatePromotionData {
  product_id: string;
  title: string;
  title_he?: string;
  description?: string;
  description_he?: string;
  promo_price: number;
  original_price?: number;
  starts_at: string;
  ends_at: string;
  max_units?: number;
  active?: boolean;
}

// Consignments
export type ConsignmentStatus = 'pending' | 'sold' | 'returned' | 'expired';

export interface Consignment {
  id: string;
  product_id: string;
  client_id?: string;
  serial_number?: string;
  imei?: string;
  condition: ProductCondition;
  consigned_date: string;
  expected_price?: number;
  status: ConsignmentStatus;
  notes?: string;
  created_at: string;
  updated_at: string;
  sold_date?: string;
  sold_price?: number;
  product?: Product;
  client?: Client;
  // Computed fields
  client_name?: string;
  client_phone?: string;
}

export interface CreateConsignmentData {
  product_id: string;
  client_id?: string;
  serial_number?: string;
  imei?: string;
  condition: ProductCondition;
  expected_price?: number;
  notes?: string;
}

// Legacy interface for backwards compatibility
export interface ConsignmentItem {
  id: string;
  client_id: string;
  product_id: string;
  quantity: number;
  notes?: string;
  created_at: string;
  updated_at: string;
  product?: Product;
  client?: Client;
}

export interface SearchResult {
  products: Product[];
  clients: Client[];
}

// Hebrew search mapping
export interface HebrewSearchMapping {
  hebrew: string;
  english: string;
  aliases?: string[];
}
