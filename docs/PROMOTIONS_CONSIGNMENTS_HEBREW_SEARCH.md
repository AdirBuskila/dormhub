# Promotions, Consignments & Hebrew Search Implementation

**Date:** October 16, 2025  
**Status:** ✅ Completed

## Overview

This document outlines the implementation of three major features for Mobile For You:
1. **Promotions System** - Time-limited promotional pricing with unit caps
2. **Consignments Tracking** - Device consignment management with IMEI/serial tracking
3. **Hebrew Search Support** - Bilingual search with automatic Hebrew-English translation

---

## 1. Promotions System

### Database Schema

**Table: `promotions`**

| Column | Type | Description |
|--------|------|-------------|
| `id` | uuid | Primary key |
| `product_id` | uuid | Foreign key to products |
| `title` | text | Promotion title (English) |
| `title_he` | text | Promotion title (Hebrew) |
| `description` | text | Promotion description (English) |
| `description_he` | text | Promotion description (Hebrew) |
| `promo_price` | numeric | Promotional price |
| `original_price` | numeric | Original price for reference |
| `starts_at` | timestamptz | Promotion start date/time |
| `ends_at` | timestamptz | Promotion end date/time |
| `max_units` | integer | Maximum units at promo price (NULL = unlimited) |
| `units_sold` | integer | Units sold at promo price |
| `active` | boolean | Admin toggle to enable/disable |
| `created_at` | timestamptz | Creation timestamp |
| `updated_at` | timestamptz | Last update timestamp |
| `created_by` | text | User who created the promotion |

### Features

- ✅ **Time-based promotions** with start and end dates
- ✅ **Unit limitations** - Cap promotional pricing to specific quantities
- ✅ **Bilingual support** - Hebrew and English titles/descriptions
- ✅ **Active/inactive toggle** - Admin can disable promotions manually
- ✅ **Helper functions**:
  - `has_active_promotion(product_uuid)` - Check if product has active promo
  - `get_promo_price(product_uuid)` - Get current promotional price
- ✅ **Helper views**:
  - `active_promotions` - All currently active promotions with product details

### API Endpoints

#### `GET /api/promotions`
Fetch all promotions or filter by criteria.

**Query Parameters:**
- `active=true` - Filter only active promotions
- `product_id={uuid}` - Filter by specific product

**Response:**
```json
[
  {
    "id": "uuid",
    "product_id": "uuid",
    "title": "iPhone 16 Launch Special",
    "title_he": "מבצע השקה iPhone 16",
    "promo_price": 3500,
    "original_price": 4000,
    "starts_at": "2025-01-01T00:00:00Z",
    "ends_at": "2025-01-31T23:59:59Z",
    "max_units": 100,
    "units_sold": 45,
    "status": "active",
    "has_units_available": true,
    "units_remaining": 55,
    "product": { ... }
  }
]
```

#### `POST /api/promotions`
Create a new promotion.

**Request Body:**
```json
{
  "product_id": "uuid",
  "title": "Black Friday Sale",
  "title_he": "מבצע סוף שבוע שחור",
  "promo_price": 2999,
  "starts_at": "2025-11-24T00:00:00Z",
  "ends_at": "2025-11-27T23:59:59Z",
  "max_units": 50,
  "active": true
}
```

#### `PATCH /api/promotions`
Update existing promotion.

**Request Body:**
```json
{
  "id": "uuid",
  "max_units": 100,
  "active": false
}
```

#### `DELETE /api/promotions?id={uuid}`
Delete a promotion.

### TypeScript Types

```typescript
interface Promotion {
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
  // Computed fields
  status?: 'active' | 'scheduled' | 'expired' | 'inactive';
  has_units_available?: boolean;
  units_remaining?: number;
}
```

---

## 2. Consignments System

### Database Schema

**Table: `consignments`**

| Column | Type | Description |
|--------|------|-------------|
| `id` | uuid | Primary key |
| `product_id` | uuid | Foreign key to products (device type) |
| `client_id` | uuid | Foreign key to clients (owner) |
| `serial_number` | text | Device serial number |
| `imei` | text | IMEI for phones |
| `condition` | product_condition | Device condition enum |
| `consigned_date` | timestamptz | Date device was consigned |
| `expected_price` | numeric | Expected sale price |
| `status` | text | pending \| sold \| returned \| expired |
| `notes` | text | Additional notes |
| `created_at` | timestamptz | Creation timestamp |
| `updated_at` | timestamptz | Last update timestamp |
| `sold_date` | timestamptz | Date device was sold |
| `sold_price` | numeric | Actual sale price |

### Features

- ✅ **Device tracking** with serial numbers and IMEI
- ✅ **Status management** - Track from consignment to sale/return
- ✅ **Price tracking** - Expected vs actual sale price
- ✅ **Client association** - Link devices to consigning customers
- ✅ **Helper view**: `pending_consignments` - All pending items with details

### API Endpoints

#### `GET /api/consignments`
Fetch consignments with optional filters.

**Query Parameters:**
- `client_id={uuid}` - Filter by client
- `status=pending` - Filter by status
- `product_id={uuid}` - Filter by product type

**Response:**
```json
[
  {
    "id": "uuid",
    "product_id": "uuid",
    "client_id": "uuid",
    "serial_number": "ABC123456",
    "imei": "123456789012345",
    "condition": "used",
    "consigned_date": "2025-01-15T10:00:00Z",
    "expected_price": 1500,
    "status": "pending",
    "product": {
      "brand": "Apple",
      "model": "iPhone 13",
      "storage": "128GB"
    },
    "client": {
      "name": "John's Mobile Shop",
      "phone": "+972501234567"
    }
  }
]
```

#### `POST /api/consignments`
Create a new consignment record.

**Request Body:**
```json
{
  "product_id": "uuid",
  "client_id": "uuid",
  "serial_number": "ABC123456",
  "imei": "123456789012345",
  "condition": "used",
  "expected_price": 1500,
  "notes": "Minor scratches on back"
}
```

#### `PATCH /api/consignments`
Update consignment (e.g., mark as sold).

**Request Body:**
```json
{
  "id": "uuid",
  "status": "sold",
  "sold_price": 1600
}
```

#### `DELETE /api/consignments?id={uuid}`
Delete a consignment record.

### TypeScript Types

```typescript
interface Consignment {
  id: string;
  product_id: string;
  client_id?: string;
  serial_number?: string;
  imei?: string;
  condition: ProductCondition;
  consigned_date: string;
  expected_price?: number;
  status: 'pending' | 'sold' | 'returned' | 'expired';
  notes?: string;
  created_at: string;
  updated_at: string;
  sold_date?: string;
  sold_price?: number;
  product?: Product;
  client?: Client;
}
```

---

## 3. Hebrew Search Support

### Overview

Enables customers and admins to search for products using Hebrew brand names like "אייפון" (iPhone) or "סמסונג" (Samsung). The system automatically translates Hebrew search terms to English equivalents and searches across both.

### Implementation

**File: `src/lib/hebrew-search.ts`**

#### Brand Mappings

The system includes comprehensive Hebrew-to-English mappings for:

- **Brands**: אייפון (iPhone), סמסונג (Samsung), שיאומי (Xiaomi), נוקיה (Nokia), etc.
- **Models**: פרו (Pro), מקס (Max), פלוס (Plus), מיני (Mini), אולטרה (Ultra)
- **Product Types**: אוזניות (earphones), מטען (charger), שעון חכם (smartwatch)
- **Aliases**: Multiple spelling variations (איפון, אייפון, אייפן)

#### Key Functions

##### `translateHebrewSearch(query: string): string[]`
Translates Hebrew search terms to English equivalents.

**Example:**
```typescript
translateHebrewSearch("אייפון 15 פרו")
// Returns: ["אייפון 15 פרו", "iphone 15 pro", "iphone 15 פרו", "אייפון 15 pro"]
```

##### `matchesHebrewSearch(query, product): boolean`
Client-side helper to filter products by Hebrew search terms.

##### `getHebrewSearchSuggestions(partialQuery): string[]`
Get autocomplete suggestions based on partial Hebrew input.

**Example:**
```typescript
getHebrewSearchSuggestions("אייפ")
// Returns: ["אייפון", "iPhone"]
```

### API Integration

The search API (`/api/search`) now automatically:

1. Takes the search query (Hebrew or English)
2. Generates all possible translations
3. Searches products across: `brand`, `model`, `storage`, `category`, `tags`
4. Searches clients across: `name`, `phone`, `shop_name`, `city`
5. Returns unique results (deduplicates products found by multiple terms)

**Example API Call:**
```
GET /api/search?q=אייפון
```

**Response includes:**
- Products matching "iPhone", "אייפון", and variations
- Debug field `searchTermsUsed` showing all terms searched

### Supported Brand Mappings

| Hebrew | English | Aliases |
|--------|---------|---------|
| אייפון | iPhone | איפון, אייפן, איפן |
| אפל | Apple | אייפל, אפול |
| סמסונג | Samsung | סמסאנג, סאמסונג |
| גלקסי | Galaxy | גלאקסי |
| שיאומי | Xiaomi | שאומי, סיאומי |
| נוקיה | Nokia | נוקיא |
| איירפודס | AirPods | אירפודס, איירפוד |
| איירטאג | AirTag | אירטאג, איירטג |

### Usage Examples

#### Admin Inventory Search
```
Search: "אייפון 16 פרו"
→ Finds all iPhone 16 Pro models
```

#### Customer Portal Search
```
Search: "סמסונג גלקסי"
→ Finds all Samsung Galaxy devices
```

#### Client Search
```
Search: "ירושלים" (Jerusalem)
→ Finds clients in Jerusalem
```

---

## Migration Instructions

### Step 1: Run the Database Migration

Execute the migration SQL file in your Supabase SQL Editor:

```bash
# File: database/migrations/007_add_promotions_and_consignments.sql
```

**What it creates:**
- `promotions` table with indexes and triggers
- `consignments` table with indexes and triggers
- Helper views: `active_promotions`, `pending_consignments`
- Helper functions: `has_active_promotion()`, `get_promo_price()`
- RLS policies (authenticated users only for now)

### Step 2: Verify Table Creation

In Supabase SQL Editor, run:

```sql
-- Check promotions table
SELECT * FROM promotions LIMIT 1;

-- Check consignments table
SELECT * FROM consignments LIMIT 1;

-- Check active promotions view
SELECT * FROM active_promotions;

-- Check pending consignments view
SELECT * FROM pending_consignments;

-- Test helper function
SELECT has_active_promotion('some-product-uuid');
```

### Step 3: Deploy Updated Code

The following files are new or updated:

**New Files:**
- `database/migrations/007_add_promotions_and_consignments.sql`
- `src/lib/hebrew-search.ts`
- `src/app/api/promotions/route.ts`
- `docs/PROMOTIONS_CONSIGNMENTS_HEBREW_SEARCH.md`

**Updated Files:**
- `src/types/database.ts` - Added types for Promotion, Consignment
- `src/app/api/search/route.ts` - Hebrew search integration
- `src/app/api/consignments/route.ts` - Updated schema

### Step 4: Test the Features

#### Test Hebrew Search
```bash
# Search for iPhone in Hebrew
curl "http://localhost:3001/api/search?q=אייפון"

# Search for Samsung in Hebrew
curl "http://localhost:3001/api/search?q=סמסונג"
```

#### Test Promotions API
```bash
# Create promotion
curl -X POST http://localhost:3001/api/promotions \
  -H "Content-Type: application/json" \
  -d '{
    "product_id": "your-product-uuid",
    "title": "New Year Sale",
    "title_he": "מבצע שנה חדשה",
    "promo_price": 2999,
    "starts_at": "2025-01-01T00:00:00Z",
    "ends_at": "2025-01-31T23:59:59Z",
    "max_units": 50
  }'

# Get active promotions
curl "http://localhost:3001/api/promotions?active=true"
```

#### Test Consignments API
```bash
# Create consignment
curl -X POST http://localhost:3001/api/consignments \
  -H "Content-Type: application/json" \
  -d '{
    "product_id": "your-product-uuid",
    "client_id": "your-client-uuid",
    "serial_number": "ABC123456",
    "imei": "123456789012345",
    "condition": "used",
    "expected_price": 1500
  }'

# Get pending consignments
curl "http://localhost:3001/api/consignments?status=pending"
```

---

## Next Steps

### UI Components Needed

1. **Admin: Promotions Management Page**
   - `/[locale]/promotions` (admin view)
   - Create/edit promotion form
   - List active/scheduled/expired promotions
   - Toggle promotion active status

2. **Customer: Promotions Page**
   - `/[locale]/customer/promotions`
   - Grid view of promotional products
   - Countdown timers for ending promotions
   - "Units remaining" badges

3. **Admin: Consignments Management**
   - `/[locale]/consignments`
   - List pending/sold/returned consignments
   - Quick status update buttons
   - IMEI/serial number search

4. **Product Cards Enhancement**
   - Show promotion badge on products
   - Display promo price with strikethrough original
   - Show "Limited units" warning
   - Add to "מבצעים" section

### Database Optimizations

Consider adding these later:
- Automatic promotion expiry (trigger to set `active=false` when `ends_at` passes)
- Automatic unit tracking (trigger to increment `units_sold` when order contains promo product)
- Consignment value tracking in client totals

### RLS Hardening (Before Production)

Update RLS policies for multi-tenant support:
```sql
-- Example: Clients can only view their own consignments
CREATE POLICY "Clients view own consignments"
ON consignments FOR SELECT
USING (
  client_id IN (
    SELECT id FROM clients WHERE clerk_user_id = auth.jwt() ->> 'sub'
  )
);
```

---

## Summary

✅ **Promotions System** - Fully implemented with bilingual support, time limits, and unit caps  
✅ **Consignments Tracking** - Complete device management with IMEI/serial tracking  
✅ **Hebrew Search** - Automatic translation with 20+ brand mappings and aliases  

All backend APIs are ready. Next step: Build UI components to expose these features to users.

**Total Files Changed:** 7  
**New API Endpoints:** 6  
**Database Tables Added:** 2  
**Helper Functions Added:** 2  
**Helper Views Added:** 2

---

**For questions or issues, refer to:**
- Database schema: `database/migrations/007_add_promotions_and_consignments.sql`
- TypeScript types: `src/types/database.ts`
- Hebrew mappings: `src/lib/hebrew-search.ts`

