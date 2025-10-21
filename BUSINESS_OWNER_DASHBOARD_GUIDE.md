# 🏪 Business Owner Dashboard Guide

## Overview
The Business Owner Dashboard allows local business owners to manage their store information on DormHub, including opening hours and student discounts.

---

## 🎯 Features

### ✅ **What Business Owners Can Do:**
1. **View Business Information**
   - See all business details (name, category, description, contact info)
   - Check business status (active/inactive)

2. **Manage Opening Hours**
   - Set hours for each day of the week
   - Mark days as closed
   - Add special notes (e.g., "Delivery only after 8 PM")
   - Different hours for different days

3. **Manage Student Discounts**
   - Add new discounts
   - Edit existing discounts
   - Activate/deactivate discounts
   - Delete discounts
   - Set discount types: percentage, fixed amount, buy-one-get-one, other
   - Add terms and conditions
   - Mark if student ID is required

---

## 🚀 Setup Instructions

### 1. **Run the Database Migration**

First, you need to run the migration to add the `owner_clerk_id` field to the businesses table:

```bash
# In Supabase SQL Editor, run:
supabase/migrations/20250121000000_add_business_owners.sql
```

This migration:
- Adds `owner_clerk_id` column to businesses table
- Creates RLS policies so business owners can only edit their own business
- Adds indexes for performance

### 2. **Assign Businesses to Owners**

After a business owner signs up, link their business to their account:

```sql
-- Replace 'user_xxx' with the actual Clerk user ID
-- Replace 'Business Name' with the actual business name

UPDATE public.businesses 
SET owner_clerk_id = 'user_2xyz...' 
WHERE name = 'Tuvia''s Pizza';
```

**To get a user's Clerk ID:**
1. User signs up on DormHub
2. Go to Clerk Dashboard → Users
3. Find the user and copy their User ID (starts with `user_`)
4. Run the UPDATE query above

---

## 📱 How Business Owners Use It

### **Access the Dashboard:**
1. Business owner signs in to DormHub
2. Navigate to: `/[locale]/business-dashboard`
   - Example: `https://yourdomain.com/en/business-dashboard`
3. If they don't own a business, they'll see a message to contact support

### **Dashboard Tabs:**

#### **1. Business Info Tab**
- **Read-only** display of all business information
- Shows: name, category, description, phone, address, website, WhatsApp, status
- Contact info provided to request changes to basic info

#### **2. Opening Hours Tab**
- **Editable** schedule for each day of the week
- For each day:
  - Check "Closed" if not open
  - Set opening time (HH:MM format)
  - Set closing time (HH:MM format)
  - Add optional notes
- "Save Hours" button updates all days at once

#### **3. Student Discounts Tab**
- **Add New Discount Section:**
  - Title (required): e.g., "10% Student Discount"
  - Description: Explain the discount
  - Discount Type: percentage, fixed amount, BOGO, other
  - Discount Value (required): e.g., "10%", "5 ILS"
  - Terms & Conditions
  - Checkboxes: Requires Student ID, Active

- **Current Discounts List:**
  - View all discounts
  - Edit button: inline editing
  - Activate/Deactivate toggle
  - Delete button (with confirmation)

---

## 🔒 Security

### **Row Level Security (RLS) Policies:**

1. **Business Owners Can:**
   - View only their own business (`SELECT` on businesses)
   - Update only their own business (`UPDATE` on businesses)
   - Full control over their business hours (`ALL` on business_hours)
   - Full control over their discounts (`ALL` on student_discounts)

2. **Business Owners Cannot:**
   - View other businesses' private data
   - Edit other businesses
   - Delete their business (contact admin)
   - Change ownership
   - Edit basic info (name, category) - requires admin approval

3. **Students Can Still:**
   - View all active businesses
   - See opening hours
   - See active discounts

### **API Security:**
- All API routes verify Clerk authentication
- Business ownership verified before any update
- No way to access/edit other businesses' data

---

## 🛠️ Technical Architecture

### **Files Created:**

#### **Database:**
- `supabase/migrations/20250121000000_add_business_owners.sql`
  - Adds owner_clerk_id field
  - Updates RLS policies

#### **Pages:**
- `src/app/[locale]/business-dashboard/page.tsx`
  - Server component
  - Fetches business data
  - Redirects if not a business owner

#### **Components:**
- `src/components/business/BusinessDashboard.tsx`
  - Main dashboard with tabs
  - Client component

- `src/components/business/BusinessHoursEditor.tsx`
  - Interactive hours editing
  - Day-by-day configuration
  - Save to API

- `src/components/business/DiscountsEditor.tsx`
  - Add/edit/delete discounts
  - Inline editing mode
  - Status toggles

#### **API Routes:**
- `src/app/api/business/hours/route.ts`
  - `PUT` - Update all hours at once
  - Deletes old hours, inserts new ones
  - Verifies ownership

- `src/app/api/business/discounts/route.ts`
  - `POST` - Create new discount
  - `PUT` - Update existing discount
  - `DELETE` - Remove discount
  - All verify ownership

---

## 📝 Example Business Owner Flow

### **First Time Setup:**

1. **Admin assigns business:**
   ```sql
   UPDATE businesses 
   SET owner_clerk_id = 'user_2abc123xyz' 
   WHERE name = 'Tuvia''s Pizza';
   ```

2. **Business owner visits dashboard:**
   - Goes to `/en/business-dashboard`
   - Sees their business info

3. **Sets opening hours:**
   - Clicks "Opening Hours" tab
   - For Monday-Thursday: 11:00 AM - 11:00 PM
   - For Friday: 11:00 AM - 3:00 PM
   - For Saturday: 8:00 PM - 11:59 PM (after Shabbat)
   - For Sunday: 11:00 AM - 11:00 PM
   - Clicks "Save Hours"

4. **Adds student discount:**
   - Clicks "Student Discounts" tab
   - Fills in:
     - Title: "10% Student Discount"
     - Description: "Show your student ID and get 10% off your entire order!"
     - Type: Percentage
     - Value: "10%"
     - Requires Student ID: ✓
     - Active: ✓
   - Clicks "Add Discount"

5. **Students see updates immediately:**
   - Opening hours show correctly on `/businesses` page
   - Discount appears in the discounts section

---

## 🎨 UI/UX Features

### **Responsive Design:**
- Desktop: Full layout with side-by-side fields
- Mobile: Stacked fields, touch-friendly buttons
- Tablets: Hybrid layout

### **User Feedback:**
- Success messages (green): "Hours updated successfully!"
- Error messages (red): "Failed to save. Please try again."
- Loading states: "Saving..." on buttons
- Confirmation dialogs: "Are you sure you want to delete this discount?"

### **Accessibility:**
- Proper labels on all form fields
- Focus management
- Keyboard navigation
- Screen reader friendly

---

## 🐛 Troubleshooting

### **Business Owner Can't Access Dashboard:**
**Problem:** "No Business Found" message

**Solution:**
1. Verify business is assigned to them:
   ```sql
   SELECT id, name, owner_clerk_id FROM businesses 
   WHERE owner_clerk_id = 'user_xxx';
   ```
2. If empty, run the UPDATE query to assign business
3. Make sure you're using the correct Clerk User ID

### **Hours Not Saving:**
**Problem:** Changes don't persist

**Solutions:**
1. Check browser console for errors
2. Verify RLS policies are created:
   ```sql
   SELECT * FROM pg_policies 
   WHERE tablename = 'business_hours';
   ```
3. Make sure migration was run in production Supabase

### **Can't Add Discounts:**
**Problem:** "Failed to create discount" error

**Solutions:**
1. Check all required fields are filled
2. Verify `student_discounts` table exists
3. Check RLS policies on `student_discounts`

---

## 🔄 Future Enhancements (Optional)

### **Could Add Later:**
1. **Upload Logo:**
   - Allow business owners to upload/change their logo
   - Image upload to Supabase Storage

2. **Analytics:**
   - Track how many students viewed their discounts
   - Popular hours/days

3. **Notifications:**
   - Email business owner when they get new reviews (future feature)
   - Notify when discount is about to expire

4. **Advanced Scheduling:**
   - Set different hours for holidays
   - Seasonal hours
   - Temporary closures

5. **Multiple Locations:**
   - If business expands to multiple spots
   - Different hours per location

6. **Discount Expiry:**
   - Auto-deactivate after end date
   - Reminder before expiry

---

## 📊 Database Schema Reference

```sql
-- businesses table
CREATE TABLE public.businesses (
  id uuid PRIMARY KEY,
  name text NOT NULL,
  category business_category NOT NULL,
  description text,
  phone text,
  address text,
  logo_url text,
  website text,
  whatsapp text,
  is_active boolean DEFAULT true,
  display_order int DEFAULT 0,
  owner_clerk_id text,  -- NEW FIELD
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- business_hours table
CREATE TABLE public.business_hours (
  id uuid PRIMARY KEY,
  business_id uuid REFERENCES businesses(id) ON DELETE CASCADE,
  day_of_week day_of_week NOT NULL,
  opens_at time,
  closes_at time,
  is_closed boolean DEFAULT false,
  notes text,
  created_at timestamptz DEFAULT now()
);

-- student_discounts table
CREATE TABLE public.student_discounts (
  id uuid PRIMARY KEY,
  business_id uuid REFERENCES businesses(id) ON DELETE CASCADE,
  title text NOT NULL,
  description text,
  discount_type text,
  discount_value text,
  terms text,
  valid_days day_of_week[],
  valid_from time,
  valid_until time,
  requires_student_id boolean DEFAULT true,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);
```

---

## ✅ Testing Checklist

Before launching to business owners:

- [ ] Migration run successfully in production
- [ ] Test business assigned to a user
- [ ] Business owner can log in and see dashboard
- [ ] Can update opening hours
- [ ] Can add new discount
- [ ] Can edit existing discount
- [ ] Can deactivate discount
- [ ] Can delete discount
- [ ] Changes appear immediately on `/businesses` page
- [ ] Cannot access other businesses' data
- [ ] Mobile responsive
- [ ] Error messages display correctly
- [ ] Success messages display correctly

---

## 🎉 You're Ready!

The Business Owner Dashboard is now complete and ready for use. Business owners can independently manage their hours and discounts, reducing admin workload and keeping information up-to-date! 

**Quick Start for Business Owners:**
1. Sign up on DormHub
2. Wait for admin to assign their business
3. Visit `/business-dashboard`
4. Start managing their store! 🏪

