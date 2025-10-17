# 🔥 Deals System Implementation

## ✅ Phase 1 Complete: Foundation & API

### 📁 Files Created:

1. **Database Schema**
   - `supabase/migrations/20250117000000_create_deals_table.sql`
   - Full-featured deals table with:
     - Tiered pricing (up to 3 tiers)
     - Multiple expiration types (date, quantity, both, none)
     - Payment method restrictions
     - Product specifications (colors, importer, eSIM)
     - Helper functions for validation and price calculation

2. **Seed Data**
   - `supabase/seeds/deals_seed.sql`
   - 11 real deals based on Ofir's WhatsApp messages:
     - iPhone 16 Pro Max 256 (4 units, tiered pricing)
     - iPhone 13/14 128 (volume discounts)
     - iPhone 17 Pro/Air (time-limited deals)
     - iPhone 17 Pro/Max single units
     - Samsung Galaxy S24 Ultra flash sale
     - AirPods Pro 2 bundle
     - iPhone 15 Pro Max clearance

3. **TypeScript Types**
   - `src/types/deals.ts`
   - Complete type definitions for:
     - Deal entity
     - DealWithProduct (with product info)
     - CreateDealData / UpdateDealData
     - DealValidation / DealPriceCalculation

4. **API Routes**
   - `src/app/api/deals/route.ts` - List & Create deals
   - `src/app/api/deals/[id]/route.ts` - Get, Update, Delete single deal
   
   **Endpoints:**
   - `GET /api/deals` - List all deals (filter by active, product_id)
   - `GET /api/deals/:id` - Get single deal with product info
   - `POST /api/deals` - Create new deal
   - `PATCH /api/deals/:id` - Update deal (partial updates)
   - `DELETE /api/deals/:id` - Delete deal

5. **Utility Functions**
   - `src/lib/deals.ts`
   - Helper functions:
     - `validateDeal()` - Check if deal is valid
     - `calculateDealPrice()` - Get price for quantity
     - `formatDealForWhatsApp()` - Generate WhatsApp message
     - `getTimeRemaining()` - Calculate countdown
     - `getDealStatus()` - Get deal status
     - `getDealBadgeColor()` - UI helper

---

## 🗄️ Database Schema Highlights:

### **Pricing Tiers:**
- Supports 1-3 price tiers based on quantity
- Example: 1pc = 4800₪, 2pc = 4750₪

### **Expiration Types:**
- **Date**: Expires at specific time
- **Quantity**: Limited stock (e.g., 4 units only)
- **Both**: Whichever comes first
- **None**: No expiration

### **Payment Methods:**
- Cash, Bank Transfer
- Check (week or month) with optional surcharge
- Example: +50₪ for check payment

### **Product Specs:**
- Allowed colors restriction
- Importer requirement (official/parallel)
- eSIM flag
- Additional specs (JSON)

---

## 📊 Real Deals Included:

```sql
1. iPhone 16 Pro Max 256 - 4800₪/4750₪
   - 4 units max
   - Natural/Desert/Black
   - +50₪ for check payment

2. iPhone 13 128 - 1900₪/1850₪
   - Black only
   - Official importer

3. iPhone 14 128 - 2250₪/2200₪/2150₪
   - Black only
   - 3-tier pricing

4. iPhone 17 Pro 256 eSIM - 4950₪/4850₪
   - Expires Thursday 18:00
   - Blue only
   - Cash/Transfer only

5. iPhone 17 Air 256 - 4300₪/4200₪
   - Expires Sunday 18:00
   - Black/White/Gold

6-8. Single unit deals (iPhone 17 Pro/Max)
9. Samsung Galaxy S24 Ultra flash sale
10. AirPods Pro 2 bundle
11. iPhone 15 Pro Max clearance
```

---

## 🚀 Next Steps:

### **Option A: Run Migration & Seed**
```bash
# Apply database schema
npm run db:push

# Seed with deals
npm run db:seed
```

### **Option B: Build Admin Interface**
- Create `/deals` page for admins
- Deal list with filters
- Create/Edit deal form
- WhatsApp message generator

### **Option C: Add to Customer Portal**
- Show deals on dashboard
- Deal badges on product cards
- Deal details in cart
- Auto-apply deal pricing

---

## 🎯 Features Ready to Use:

### **API is Live:**
```typescript
// Get all active deals
const response = await fetch('/api/deals?active=true');
const { deals } = await response.json();

// Get deals for specific product
const response = await fetch(`/api/deals?product_id=${productId}`);

// Create new deal
const response = await fetch('/api/deals', {
  method: 'POST',
  body: JSON.stringify({
    title: 'מבצע מיוחד iPhone 16',
    product_id: '...',
    tier_1_qty: 1,
    tier_1_price: 4800,
    tier_2_qty: 2,
    tier_2_price: 4750,
    expiration_type: 'quantity',
    max_quantity: 4,
    payment_methods: ['cash', 'bank_transfer', 'check_month'],
  }),
});
```

### **Utilities Available:**
```typescript
import { validateDeal, calculateDealPrice, formatDealForWhatsApp } from '@/lib/deals';

// Check if deal is valid
const validation = validateDeal(deal);
if (!validation.isValid) {
  console.log(validation.reason);
}

// Calculate price
const pricing = calculateDealPrice(deal, 2, 'check_month');
console.log(pricing.totalPrice + pricing.paymentSurcharge);

// Generate WhatsApp message
const message = formatDealForWhatsApp(deal, 'iPhone 16 Pro Max');
navigator.clipboard.writeText(message);
```

---

## 💡 What's Next?

Let me know which direction you want to go:

1. **🗄️ Database First** - Apply migration and seed the deals
2. **🎨 Admin UI First** - Build the deals management interface
3. **👥 Customer UI First** - Show deals in the customer portal
4. **🔍 Review & Adjust** - Review the schema/deals and make changes

Which would you like to tackle next? 🚀

