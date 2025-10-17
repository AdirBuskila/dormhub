import { Deal, DealPaymentMethod } from '@/types/database';

export interface DealValidation {
  isValid: boolean;
  reason?: string;
  remainingQuantity?: number;
  timeRemaining?: number;
}

export interface DealPriceCalculation {
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  originalPrice?: number;
  savings?: number;
  appliedTier: 1 | 2 | 3;
  paymentSurcharge?: number;
}

/**
 * Check if a deal is currently valid (not expired, has stock)
 */
export function validateDeal(deal: Deal): DealValidation {
  // Check if deal is active
  if (!deal.is_active) {
    return {
      isValid: false,
      reason: 'Deal is not active',
    };
  }
  
  // Check expiration by date
  if (
    (deal.expiration_type === 'date' || deal.expiration_type === 'both') &&
    deal.expires_at
  ) {
    const now = new Date();
    const expiresAt = new Date(deal.expires_at);
    
    if (now > expiresAt) {
      return {
        isValid: false,
        reason: 'Deal has expired',
      };
    }
    
    // Calculate time remaining in milliseconds
    const timeRemaining = expiresAt.getTime() - now.getTime();
    
    return {
      isValid: true,
      timeRemaining,
    };
  }
  
  // Check expiration by quantity
  if (
    (deal.expiration_type === 'quantity' || deal.expiration_type === 'both') &&
    deal.max_quantity !== null
  ) {
    if (deal.sold_quantity >= deal.max_quantity) {
      return {
        isValid: false,
        reason: 'Deal is sold out',
      };
    }
    
    return {
      isValid: true,
      remainingQuantity: deal.max_quantity - deal.sold_quantity,
    };
  }
  
  return { isValid: true };
}

/**
 * Calculate price for a quantity based on deal tiers
 */
export function calculateDealPrice(
  deal: Deal,
  quantity: number,
  paymentMethod?: DealPaymentMethod
): DealPriceCalculation {
  let unitPrice = deal.tier_1_price;
  let appliedTier: 1 | 2 | 3 = 1;
  
  // Determine which tier applies
  if (deal.tier_3_qty && deal.tier_3_price && quantity >= deal.tier_3_qty) {
    unitPrice = deal.tier_3_price;
    appliedTier = 3;
  } else if (deal.tier_2_qty && deal.tier_2_price && quantity >= deal.tier_2_qty) {
    unitPrice = deal.tier_2_price;
    appliedTier = 2;
  }
  
  const totalPrice = unitPrice * quantity;
  
  // Calculate payment surcharge if applicable
  let paymentSurcharge = 0;
  if (paymentMethod === 'check_month' && deal.payment_surcharge_check_month) {
    paymentSurcharge = deal.payment_surcharge_check_month * quantity;
  } else if (paymentMethod === 'check_week' && deal.payment_surcharge_check_week) {
    paymentSurcharge = deal.payment_surcharge_check_week * quantity;
  }
  
  return {
    quantity,
    unitPrice,
    totalPrice,
    appliedTier,
    paymentSurcharge,
  };
}

/**
 * Format deal message for WhatsApp (Hebrew)
 */
export function formatDealForWhatsApp(deal: Deal, productName: string): string {
  const lines: string[] = [];
  
  // Title with emoji
  if (deal.priority >= 10) {
    lines.push(`🔥 ${deal.title} 🔥`);
  } else {
    lines.push(deal.title);
  }
  
  lines.push('');
  
  // Description
  if (deal.description) {
    lines.push(deal.description);
    lines.push('');
  }
  
  // Pricing tiers
  lines.push('📊 מחירים:');
  lines.push(`${deal.tier_1_qty} יח׳ - ${formatPrice(deal.tier_1_price)}₪`);
  
  if (deal.tier_2_qty && deal.tier_2_price) {
    lines.push(`${deal.tier_2_qty} יח׳ - ${formatPrice(deal.tier_2_price)}₪ ליח׳`);
  }
  
  if (deal.tier_3_qty && deal.tier_3_price) {
    lines.push(`${deal.tier_3_qty} יח׳ - ${formatPrice(deal.tier_3_price)}₪ ליח׳`);
  }
  
  lines.push('');
  
  // Expiration info
  if (deal.expiration_type === 'date' && deal.expires_at) {
    const expiresAt = new Date(deal.expires_at);
    const formatted = formatHebrewDateTime(expiresAt);
    lines.push(`⏳ בתוקף עד: ${formatted}`);
  }
  
  if (
    (deal.expiration_type === 'quantity' || deal.expiration_type === 'both') &&
    deal.max_quantity
  ) {
    const remaining = deal.max_quantity - deal.sold_quantity;
    lines.push(`📦 ${remaining} יחידות נותרו במלאי!`);
  }
  
  if (deal.expiration_type !== 'none') {
    lines.push('');
  }
  
  // Payment methods
  if (deal.payment_methods && deal.payment_methods.length > 0) {
    const methods = deal.payment_methods.map(m => translatePaymentMethod(m)).join(' / ');
    lines.push(`💳 אמצעי תשלום: ${methods}`);
    
    if (deal.payment_notes) {
      lines.push(`   ${deal.payment_notes}`);
    }
    lines.push('');
  }
  
  // Product specs
  if (deal.allowed_colors && deal.allowed_colors.length > 0) {
    lines.push(`🎨 צבעים: ${deal.allowed_colors.join(' / ')}`);
  }
  
  if (deal.is_esim) {
    lines.push('📱 eSIM בלבד');
  }
  
  if (deal.required_importer) {
    lines.push(`✅ יבואן ${deal.required_importer === 'official' ? 'רשמי' : 'מקביל'}`);
  }
  
  if (deal.notes) {
    lines.push('');
    lines.push(`ℹ️ ${deal.notes}`);
  }
  
  return lines.join('\n');
}

/**
 * Format price with thousands separator
 */
function formatPrice(price: number): string {
  return price.toLocaleString('he-IL', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  });
}

/**
 * Format date/time in Hebrew
 */
function formatHebrewDateTime(date: Date): string {
  const days = ['ראשון', 'שני', 'שלישי', 'רביעי', 'חמישי', 'שישי', 'שבת'];
  const dayName = days[date.getDay()];
  
  const time = date.toLocaleTimeString('he-IL', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  });
  
  return `יום ${dayName} בשעה ${time}`;
}

/**
 * Translate payment method to Hebrew
 */
function translatePaymentMethod(method: DealPaymentMethod): string {
  const translations: Record<DealPaymentMethod, string> = {
    cash: 'מזומן',
    bank_transfer: 'העברה',
    check_week: 'צ׳ק שבוע',
    check_month: 'צ׳ק עד חודש',
  };
  
  return translations[method] || method;
}

/**
 * Calculate time remaining until deal expires
 */
export function getTimeRemaining(expiresAt: string): {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
  totalSeconds: number;
} {
  const now = new Date();
  const expires = new Date(expiresAt);
  const diff = expires.getTime() - now.getTime();
  
  if (diff <= 0) {
    return { days: 0, hours: 0, minutes: 0, seconds: 0, totalSeconds: 0 };
  }
  
  const totalSeconds = Math.floor(diff / 1000);
  const days = Math.floor(totalSeconds / (24 * 60 * 60));
  const hours = Math.floor((totalSeconds % (24 * 60 * 60)) / (60 * 60));
  const minutes = Math.floor((totalSeconds % (60 * 60)) / 60);
  const seconds = totalSeconds % 60;
  
  return { days, hours, minutes, seconds, totalSeconds };
}

/**
 * Check if user can access this deal based on payment method
 */
export function canAccessDeal(deal: Deal, paymentMethod: DealPaymentMethod): boolean {
  if (!deal.payment_methods || deal.payment_methods.length === 0) {
    return true; // No restrictions
  }
  
  return deal.payment_methods.includes(paymentMethod);
}

/**
 * Get deal badge color based on priority
 */
export function getDealBadgeColor(priority: number): string {
  if (priority >= 15) return 'bg-red-100 text-red-800 border-red-200';
  if (priority >= 10) return 'bg-orange-100 text-orange-800 border-orange-200';
  if (priority >= 5) return 'bg-yellow-100 text-yellow-800 border-yellow-200';
  return 'bg-green-100 text-green-800 border-green-200';
}

/**
 * Get deal status text
 */
export function getDealStatus(deal: Deal): 'active' | 'expired' | 'sold_out' | 'inactive' {
  if (!deal.is_active) return 'inactive';
  
  const validation = validateDeal(deal);
  if (!validation.isValid) {
    if (validation.reason?.includes('expired')) return 'expired';
    if (validation.reason?.includes('sold out')) return 'sold_out';
    return 'inactive';
  }
  
  return 'active';
}

