# 🗄️ Database Setup Guide

## Current Issue
Your inventory is empty because the database isn't connected yet. You're using placeholder API keys.

## 🚀 Quick Setup (Choose One Option)

### Option 1: Use Supabase (Recommended)
1. **Go to [supabase.com](https://supabase.com)**
2. **Create a new project**
3. **Get your API keys:**
   - Go to Settings → API
   - Copy the Project URL and anon key
4. **Update your `.env.local` file:**
   ```bash
   NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
   SUPABASE_SERVICE_ROLE_KEY=your-service-role-key-here
   ```
5. **Run the database schema:**
   - Go to SQL Editor in Supabase
   - Copy and paste the contents of `database/schema.sql`
   - Click "Run"

### Option 2: Use Local Development Mode (No Database)
If you want to test without setting up a database:

1. **The app will work with mock data**
2. **Products won't persist between sessions**
3. **Perfect for testing the UI**

## 🔧 Current Status
- ✅ App is running at http://localhost:3000
- ✅ All 119 products are ready to import
- ❌ Database not connected (using placeholder keys)
- ❌ Products won't save without real database

## 📋 Next Steps
1. **Set up Supabase** (5 minutes)
2. **Update `.env.local`** with real keys
3. **Run the schema** in Supabase
4. **Click "Seed Products"** to add all 119 products
5. **Your inventory will be populated!**

## 🆘 Need Help?
- The app works fine without a database (shows mock data)
- But to save products permanently, you need Supabase
- All your 119 products are ready to import once database is connected
