# 🗄️ Database Workflow Guide

## 📚 **Understanding the Files:**

### 1. `database/schema.sql` - **Source of Truth**
- **Purpose**: Complete database schema definition
- **What it is**: The "blueprint" of your entire database
- **When to update**: Whenever you add/modify/remove tables
- **Think of it as**: Your backup/documentation that can rebuild the entire database

### 2. `src/lib/database.ts` - **Access Layer**
- **Purpose**: Functions to interact with database from your app
- **What it is**: JavaScript/TypeScript functions that read/write data
- **When to update**: When you need to query new tables or perform new operations
- **Think of it as**: Your app's "hands" that touch the database

### 3. `src/types/database.ts` - **TypeScript Definitions**
- **Purpose**: Type safety for your database entities
- **What it is**: Interfaces defining the shape of your data
- **When to update**: Whenever you add/modify columns or create new tables
- **Think of it as**: Your app's "vocabulary" for database entities

---

## 🔄 **When to Update Each File:**

### **Scenario: Adding a New Table (like `deals`)**

1. **First**: Run SQL in Supabase
   ```sql
   CREATE TABLE deals (...);
   ```

2. **Then**: Update `database/schema.sql`
   - Add the new table definition
   - Add indexes
   - Add triggers
   - Add RLS policies

3. **Then**: Update `src/types/database.ts`
   - Add interface for the entity (`Deal`)
   - Add interface for creating the entity (`CreateDealData`)
   - Export any custom types

4. **Finally**: Update `src/lib/database.ts`
   - Add CRUD functions:
     - `getDeals()`
     - `getDeal(id)`
     - `createDeal(data)`
     - `updateDeal(id, data)`
     - `deleteDeal(id)`

---

### **Scenario: Removing a Table (like `promotions`)**

1. **First**: Run SQL in Supabase
   ```sql
   DROP TABLE promotions CASCADE;
   ```

2. **Then**: Update `database/schema.sql`
   - Remove table definition
   - Remove related indexes
   - Remove related triggers
   - Remove related RLS policies

3. **Then**: Update `src/types/database.ts`
   - Remove interfaces (`Promotion`, `CreatePromotionData`)
   - Remove custom types

4. **Finally**: Update `src/lib/database.ts`
   - Remove all related functions
   - **Also**: Delete API routes (`src/app/api/promotions/`)
   - **Also**: Remove from UI components if used

---

### **Scenario: Adding a Column to Existing Table**

1. **First**: Run SQL in Supabase
   ```sql
   ALTER TABLE products ADD COLUMN is_featured BOOLEAN DEFAULT false;
   ```

2. **Then**: Update `database/schema.sql`
   - Add the new column to the CREATE TABLE statement

3. **Then**: Update `src/types/database.ts`
   - Add the new field to the interface
   ```typescript
   export interface Product {
     // ... existing fields
     is_featured: boolean;
   }
   ```

4. **Finally**: Update `src/lib/database.ts` (if needed)
   - Update any functions that need to handle the new field

---

## ✅ **What We Just Did:**

### Removed:
- ❌ `promotions` table (unused, replaced by `deals`)
- ❌ `src/app/api/promotions/route.ts`
- ❌ `Promotion` types from `database.ts`

### Kept:
- ✅ `outbound_messages` table (actively used for WhatsApp)

### Added:
- ✅ `deals` table in `schema.sql`
- ✅ `Deal` and `CreateDealData` types in `database.ts`
- ✅ Deal CRUD functions in `src/lib/database.ts`
- ✅ Deal API routes (`/api/deals`, `/api/deals/[id]`)
- ✅ Deal utility functions (`src/lib/deals.ts`)

---

## 🚀 **Next Steps - Run This SQL:**

1. Open Supabase SQL Editor
2. Copy contents from `RUN_THIS_IN_SUPABASE.sql`
3. Run it

This will:
- Drop `promotions` table
- Create `deals` table with all features
- Set up indexes, functions, triggers, and RLS policies

---

## 💡 **Pro Tips:**

### 1. **Always update schema.sql**
Even if you run SQL directly in Supabase, always copy it to `schema.sql` so you have a backup and documentation.

### 2. **Keep types in sync**
Whenever you modify a table, update the TypeScript interface immediately to avoid runtime errors.

### 3. **Test in Supabase first**
Run new SQL in Supabase SQL Editor first, make sure it works, then add to `schema.sql`.

### 4. **Version your migrations**
For production databases, use numbered migration files:
- `001_initial_schema.sql`
- `002_add_deals_table.sql`
- `003_remove_promotions.sql`

### 5. **Document big changes**
Leave comments in SQL and code explaining why changes were made.

---

## 🔍 **Quick Reference:**

| File | Purpose | Update When |
|------|---------|-------------|
| `RUN_THIS_IN_SUPABASE.sql` | One-time script | Running migrations |
| `database/schema.sql` | Full schema | Adding/modifying/removing tables |
| `src/types/database.ts` | TypeScript types | Schema changes |
| `src/lib/database.ts` | CRUD functions | Need new queries |
| `src/app/api/*/route.ts` | API endpoints | Creating APIs for tables |

---

**Remember:** Your database schema is the foundation. Keep these three files synchronized:
1. Real database (Supabase)
2. `database/schema.sql` (documentation)
3. `src/types/database.ts` (TypeScript types)

