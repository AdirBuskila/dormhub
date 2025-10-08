# Mobile For You Business Management System

A comprehensive, modern business management system designed specifically for mobile device distribution companies. Built with Next.js 15, TypeScript, and Supabase, this system streamlines inventory management, order processing, client relationships, and automated notifications.

[![Next.js](https://img.shields.io/badge/Next.js-15-black?style=flat-square&logo=next.js)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue?style=flat-square&logo=typescript)](https://www.typescriptlang.org/)
[![Supabase](https://img.shields.io/badge/Supabase-Database-green?style=flat-square&logo=supabase)](https://supabase.com/)
[![Clerk](https://img.shields.io/badge/Clerk-Authentication-purple?style=flat-square)](https://clerk.com/)
[![Twilio](https://img.shields.io/badge/Twilio-WhatsApp-red?style=flat-square&logo=twilio)](https://www.twilio.com/)

## 🚀 Key Features

### 📊 **Business Intelligence Dashboard**
- **Real-time Metrics**: Live business overview with key performance indicators
- **Revenue Tracking**: Comprehensive profit and loss analysis
- **Quick Actions**: Streamlined access to common business operations
- **Visual Analytics**: Charts and graphs for data-driven decision making

### 📱 **Advanced Inventory Management**
- **Multi-Category Support**: Phones, tablets, earphones, and accessories
- **Condition Tracking**: New, refurbished, used, activated, and open-box items
- **Stock Management**: Real-time stock levels with reservation system
- **Automated Alerts**: Low stock notifications with configurable thresholds
- **Bulk Operations**: Efficient inventory updates and management

### 👥 **Comprehensive Client Management**
- **Client Database**: Complete contact information and business details
- **Payment Terms**: Flexible payment arrangements and custom pricing
- **Purchase History**: Detailed transaction records and analytics
- **Debt Management**: Outstanding balance tracking and payment reminders
- **Performance Metrics**: Client profitability and engagement analysis

### 🛒 **Streamlined Order Processing**
- **Multi-Step Workflow**: Draft → Reserved → Delivered → Closed
- **Real-time Updates**: Live order status tracking and notifications
- **Multi-Item Orders**: Complex order management with item-specific pricing
- **Client Integration**: Seamless customer portal for order placement
- **Order History**: Complete audit trail and historical data

### 💰 **Financial Management**
- **Payment Tracking**: Multiple payment methods (cash, transfer, check, credit)
- **Debt Monitoring**: Automated overdue payment detection
- **Financial Reports**: Comprehensive revenue and profit analysis
- **Invoice Management**: Automated invoice generation and tracking

### 🔔 **Smart Notifications System**
- **WhatsApp Integration**: Automated customer communications via Twilio
- **Multi-Channel Alerts**: Low stock, overdue payments, pending deliveries
- **Scheduled Automation**: Daily alerts and message dispatch via Vercel cron
- **Template System**: Customizable message templates for different scenarios
- **Real-time Monitoring**: Live alert dashboard with severity levels

## 🛠️ Technology Stack

### **Frontend & UI**
- **Next.js 15** - React framework with App Router
- **TypeScript 5.0** - Type-safe development
- **Tailwind CSS** - Utility-first CSS framework
- **Lucide React** - Beautiful, customizable icons
- **Recharts** - Composable charting library

### **Backend & Database**
- **Supabase** - PostgreSQL database with real-time subscriptions
- **Row Level Security (RLS)** - Database-level security policies
- **Server Actions** - Secure server-side operations

### **Authentication & Security**
- **Clerk** - Complete authentication solution
- **Middleware Protection** - Route-level security
- **Admin Role Management** - Email-based admin access control

### **Communication & Notifications**
- **Twilio WhatsApp API** - Business messaging platform
- **Vercel Cron Jobs** - Scheduled task automation
- **Template Engine** - Dynamic message generation

### **Deployment & Infrastructure**
- **Vercel** - Optimized hosting platform
- **Edge Runtime** - Global performance optimization
- **Environment Management** - Secure configuration handling

## 📋 Prerequisites

Before you begin, ensure you have the following installed and configured:

- **Node.js 18+** - JavaScript runtime environment
- **npm or yarn** - Package manager
- **Git** - Version control system
- **Supabase Account** - Database and backend services
- **Clerk Account** - Authentication services
- **Twilio Account** - WhatsApp messaging (optional for notifications)

## ⚡ Quick Start

### 1. **Clone & Install**
```bash
# Clone the repository
git clone https://github.com/AdirBuskila/mobileforyou.git
cd mobileforyou

# Install dependencies
npm install
```

### 2. **Environment Configuration**
Create a `.env.local` file in the root directory:

```env
# Clerk Authentication (Required)
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...
CLERK_SECRET_KEY=sk_test_...
ADMIN_EMAILS=admin@yourcompany.com,owner@yourcompany.com

# Supabase Database (Required)
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# Application Configuration
NEXT_PUBLIC_APP_URL=http://localhost:3001

# WhatsApp/Twilio Notifications (Optional)
WHATSAPP_PROVIDER=twilio
WHATSAPP_TEST_MODE=true
TWILIO_ACCOUNT_SID=AC...
TWILIO_AUTH_TOKEN=your_auth_token
TWILIO_WHATSAPP_FROM=whatsapp:+14155238886

# Alert Configuration (Optional)
ALERT_UNDELIVERED_DAYS=3
ALERT_OVERDUE_DAYS=14
ALERT_RESERVED_STALE_DAYS=3

# Admin Notifications (Optional)
ADMIN_PHONE=+972546093624
```

### 3. **Database Setup**
```bash
# Run the database migration in your Supabase SQL editor
# Copy and paste the contents of: database/alerts_and_outbound_messages.sql
```

### 4. **Start Development Server**
```bash
npm run dev
```

### 5. **Access the Application**
Open your browser and navigate to [http://localhost:3001](http://localhost:3001)

## 🔧 Detailed Setup Guide

### **Supabase Configuration**
1. Create a new Supabase project at [supabase.com](https://supabase.com)
2. Navigate to **Settings → API** to get your project URL and keys
3. Run the database migration in **SQL Editor**
4. Enable Row Level Security (RLS) policies

### **Clerk Authentication Setup**
1. Create a new Clerk application at [clerk.com](https://clerk.com)
2. Configure authentication providers (Google, email, etc.)
3. Add your domain to allowed origins
4. Copy your publishable and secret keys

### **Twilio WhatsApp Setup** (Optional)
1. Create a Twilio account at [twilio.com](https://twilio.com)
2. Enable WhatsApp sandbox in the Twilio console
3. Join the sandbox by sending "join <sandbox-code>" to the Twilio WhatsApp number
4. Use E.164 phone format (e.g., +972501234567)

## Database Schema

The application uses the following main tables:

- **products**: Product inventory with stock levels
- **clients**: Client information and payment terms
- **orders**: Order management with status tracking
- **order_items**: Individual items within orders
- **payments**: Payment records and debt tracking
- **returns**: Return and trade-in processing

## Project Structure

```
src/
├── app/                    # Next.js app router pages
│   ├── inventory/         # Inventory management page
│   ├── clients/           # Client management page
│   ├── orders/            # Order management page
│   ├── payments/          # Payment tracking page
│   ├── returns/           # Returns management page
│   ├── alerts/            # Alerts and notifications page
│   └── sign-in/           # Authentication pages
├── components/            # React components
│   ├── Dashboard.tsx      # Main dashboard
│   ├── Layout.tsx         # App layout with sidebar
│   ├── InventoryManagement.tsx
│   ├── ClientManagement.tsx
│   ├── OrderManagement.tsx
│   ├── PaymentManagement.tsx
│   ├── ReturnManagement.tsx
│   └── AlertsManagement.tsx
├── lib/                   # Utility functions
│   ├── database.ts        # Database operations
│   ├── supabase.ts        # Supabase configuration
│   └── utils.ts           # Helper functions
└── types/                 # TypeScript type definitions
    └── database.ts        # Database types
```

## Key Features Implementation

### Inventory Management
- CRUD operations for products
- Stock level monitoring
- Low stock alerts
- Category and condition filtering

### Order Processing
- Multi-step order creation
- Stock reservation system
- Order status workflow
- Client-specific pricing

### Payment Tracking
- Multiple payment methods
- Debt calculation and tracking
- Payment history
- Overdue payment alerts

### Business Intelligence
- Real-time dashboard metrics
- Revenue and profit tracking
- Client performance analytics
- Inventory turnover insights

## Deployment

### Vercel (Recommended)

1. **Connect your repository to Vercel**
2. **Add environment variables** in Vercel dashboard
3. **Deploy** - Vercel will automatically build and deploy

### Other Platforms

The application can be deployed to any platform that supports Next.js:
- Netlify
- Railway
- DigitalOcean App Platform
- AWS Amplify

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

This project is licensed under the MIT License.

## Alerts & WhatsApp Notifications

### Environment Variables

The alerts and WhatsApp notification system requires the following environment variables:

```env
# WhatsApp/Twilio Configuration
WHATSAPP_PROVIDER=twilio
WHATSAPP_TEST_MODE=true
TWILIO_ACCOUNT_SID=your_twilio_account_sid
TWILIO_AUTH_TOKEN=your_twilio_auth_token
TWILIO_WHATSAPP_FROM=whatsapp:+14155238886

# Alert Thresholds (optional)
ALERT_UNDELIVERED_DAYS=3
ALERT_OVERDUE_DAYS=14
ALERT_RESERVED_STALE_DAYS=3
```

### Manual Testing

Test the alerts and WhatsApp system with these API endpoints:

```bash
# Run alerts manually
curl -X POST http://localhost:3000/api/run-alerts

# Dispatch queued WhatsApp messages
curl -X POST http://localhost:3000/api/dispatch-messages

# Test WhatsApp message
curl -X POST http://localhost:3000/api/test-whatsapp \
  -H "Content-Type: application/json" \
  -d '{"to":"+972501234567","template":"order_confirmation","variables":{"orderId":"123","summary":"iPhone 15 Pro"}}'

# Test new order alert system
node scripts/test-new-order-alert.js
```

### Twilio Setup

1. **Create Twilio Account**: Sign up at [twilio.com](https://www.twilio.com)
2. **Get WhatsApp Sandbox**: Enable WhatsApp sandbox in Twilio console
3. **Join Sandbox**: Send "join <sandbox-code>" to the Twilio WhatsApp number
4. **Phone Format**: Use E.164 format (e.g., +972501234567)

### Test Mode vs Production

- **Test Mode** (`WHATSAPP_TEST_MODE=true`): Messages are logged to console and queued in database
- **Production Mode** (`WHATSAPP_TEST_MODE=false`): Messages are sent via Twilio API

### Automated Scheduling

Vercel cron jobs automatically run:
- **Daily Alerts**: 8:00 AM Jerusalem time (`/api/run-alerts`)
- **Message Dispatch**: Every 5 minutes (`/api/dispatch-messages`)

## Support

For support and questions, please open an issue in the repository.

## Roadmap

### Phase 2 Features
- Online client portal for stores
- Delivery route optimization
- WhatsApp integration for orders
- Advanced analytics and reporting
- Multi-user support with role-based access
- Mobile app for field operations
- Barcode scanning for inventory
- Automated reorder suggestions