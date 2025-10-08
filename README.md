# Mobile For You Business Management System

A comprehensive, modern business management system designed specifically for mobile device distribution companies. Built with Next.js 15, TypeScript, and Supabase, this system streamlines inventory management, order processing, client relationships, and automated notifications.

[![Next.js](https://img.shields.io/badge/Next.js-15-black?style=flat-square&logo=next.js)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue?style=flat-square&logo=typescript)](https://www.typescriptlang.org/)
[![Supabase](https://img.shields.io/badge/Supabase-Database-green?style=flat-square&logo=supabase)](https://supabase.com/)
[![Clerk](https://img.shields.io/badge/Clerk-Authentication-purple?style=flat-square)](https://clerk.com/)
[![Twilio](https://img.shields.io/badge/Twilio-WhatsApp-red?style=flat-square&logo=twilio)](https://www.twilio.com/)

## 🚀 Key Features

### 📊 **Advanced Admin Dashboard**
- **Real-time KPIs**: Live business metrics including orders to deliver, low stock alerts, receivables, and daily sales
- **Actionable Tables**: Orders to deliver with quick actions (mark delivered, log payment, view order)
- **Inventory Alerts**: Low stock management with inline editing of minimum stock thresholds
- **Financial Overview**: Top debtors tracking with WhatsApp payment reminders
- **Recent Activity**: Live alerts sidebar with acknowledgment system
- **Quick Actions**: One-click alert running and message dispatch

### 📱 **Comprehensive Inventory Management**
- **Multi-Category Support**: iPhone, Samsung, Android phones, tablets, smartwatches, earphones, chargers, cases, accessories
- **Condition Tracking**: New, refurbished, used, activated, and open-box items
- **Advanced Stock Management**: Real-time stock levels with reservation system for orders
- **Smart Filtering**: Search by brand, model, category, condition, and stock levels
- **Bulk Operations**: Efficient inventory updates, bulk stock adjustments, and category management
- **Automated Alerts**: Low stock notifications with configurable thresholds per product
- **Image Support**: Product images with fallback icons

### 👥 **Complete Client Management**
- **Integrated Authentication**: Seamless Clerk integration for client accounts
- **Client Database**: Complete contact information, business details, and payment terms
- **Purchase History**: Detailed transaction records with order analytics
- **Debt Management**: Outstanding balance tracking with automated payment reminders
- **Performance Metrics**: Client profitability analysis and engagement tracking
- **Auto-Sync**: Automatic client creation from customer portal orders

### 🛒 **Streamlined Order Processing**
- **Multi-Step Workflow**: Draft → Reserved → Delivered → Closed status progression
- **Real-time Updates**: Live order status tracking with instant notifications
- **Multi-Item Orders**: Complex order management with item-specific pricing and quantities
- **Stock Reservation**: Automatic stock reservation during order processing
- **Order History**: Complete audit trail with detailed item breakdowns
- **Admin Actions**: Quick order status updates, payment logging, and order management

### 🛍️ **Customer Portal**
- **Self-Service Ordering**: Customers can browse inventory and place orders independently
- **Product Catalog**: Full inventory browsing with advanced filtering (brand, category, condition)
- **Shopping Cart**: Add/remove items with quantity management and stock validation
- **Order Tracking**: View order history, status updates, and order details
- **Mobile-Optimized**: Floating checkout button and responsive design
- **Real-time Stock**: Live stock levels with availability indicators
- **Order Confirmation**: WhatsApp notifications for order confirmations

### 💰 **Financial Management**
- **Payment Tracking**: Multiple payment methods (cash, credit card, bank transfer, check)
- **Debt Monitoring**: Automated overdue payment detection with configurable thresholds
- **Receivables Dashboard**: Top debtors with outstanding amounts and days overdue
- **Payment History**: Comprehensive payment records with client associations
- **Financial Reports**: Revenue tracking and profit analysis
- **WhatsApp Reminders**: Automated payment reminder messages

### 🔔 **Smart Notifications System**
- **WhatsApp Integration**: Automated customer communications via Twilio
- **Multi-Channel Alerts**: Low stock, overdue payments, pending deliveries, new orders
- **Scheduled Automation**: Daily alerts and message dispatch via Vercel cron jobs
- **Template System**: Customizable message templates for different scenarios
- **Real-time Monitoring**: Live alert dashboard with severity levels and acknowledgment
- **Alert Management**: Manual alert running and message dispatch controls

### 🔄 **Returns Management**
- **Return Processing**: Handle product returns and trade-ins
- **Status Tracking**: Return workflow with approval and processing steps
- **Inventory Integration**: Automatic stock adjustments for returned items
- **Client Communication**: Automated notifications for return status updates

## 🛠️ Technology Stack

### **Frontend & UI**
- **Next.js 15** - React framework with App Router and server components
- **TypeScript 5.0** - Full type safety throughout the application
- **Tailwind CSS** - Utility-first CSS framework for responsive design
- **Lucide React** - Beautiful, customizable icons
- **Next-Intl** - Internationalization support for multiple languages

### **Backend & Database**
- **Supabase** - PostgreSQL database with real-time subscriptions and RLS
- **Row Level Security (RLS)** - Database-level security policies
- **Server Actions** - Secure server-side operations with automatic revalidation
- **Edge Runtime** - Optimized performance with global edge deployment

### **Authentication & Security**
- **Clerk** - Complete authentication solution with admin role management
- **Middleware Protection** - Route-level security with automatic redirects
- **Admin Access Control** - Email-based admin permissions
- **Client Auto-Creation** - Automatic client records from customer portal

### **Communication & Notifications**
- **Twilio WhatsApp API** - Business messaging platform with sandbox support
- **Vercel Cron Jobs** - Scheduled task automation for alerts and messaging
- **Template Engine** - Dynamic message generation with variables
- **Outbound Message Tracking** - Complete message delivery and status tracking

### **Deployment & Infrastructure**
- **Vercel** - Optimized hosting platform with edge functions
- **Environment Management** - Secure configuration handling
- **Database Migrations** - Version-controlled database schema updates

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
Run the database migrations in your Supabase SQL editor in this order:

1. **Main Schema**: Copy and paste `database/alerts_and_outbound_messages.sql`
2. **Additional Features**: Run `database/migrations/001_add_business_features.sql`
3. **Enum Updates**: Run `database/migrations/003_update_enums_and_features.sql`
4. **Alert Types**: Run `database/migrations/004_add_new_order_alert_type.sql`
5. **Product Categories**: Run `database/migrations/005_add_new_product_categories.sql`
6. **Dashboard Functions**: Run `database/migrations/006_add_dashboard_functions.sql`

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
3. Run the database migrations in **SQL Editor** in the order listed above
4. Enable Row Level Security (RLS) policies (included in migrations)

### **Clerk Authentication Setup**
1. Create a new Clerk application at [clerk.com](https://clerk.com)
2. Configure authentication providers (Google, email, etc.)
3. Add your domain to allowed origins
4. Copy your publishable and secret keys
5. Set up admin emails in the `ADMIN_EMAILS` environment variable

### **Twilio WhatsApp Setup** (Optional)
1. Create a Twilio account at [twilio.com](https://twilio.com)
2. Enable WhatsApp sandbox in the Twilio console
3. Join the sandbox by sending "join <sandbox-code>" to the Twilio WhatsApp number
4. Use E.164 phone format (e.g., +972501234567)
5. Set `WHATSAPP_TEST_MODE=true` for development

## 📊 Database Schema

The application uses the following main tables:

### **Core Tables**
- **products**: Product inventory with stock levels, categories, and conditions
- **clients**: Client information, payment terms, and contact details
- **orders**: Order management with status tracking and total pricing
- **order_items**: Individual items within orders with quantities and pricing
- **payments**: Payment records and debt tracking by client
- **returns**: Return and trade-in processing

### **System Tables**
- **alerts**: System alerts with severity levels and acknowledgment tracking
- **outbound_messages**: WhatsApp message tracking and delivery status

### **Key Features**
- **Automatic Timestamps**: Created/updated timestamps on all records
- **UUID Primary Keys**: Secure, non-sequential identifiers
- **Foreign Key Constraints**: Data integrity and referential consistency
- **Row Level Security**: Database-level access control
- **Enum Types**: Controlled vocabularies for statuses, categories, and conditions

## 📁 Project Structure

```
src/
├── app/                           # Next.js app router pages
│   ├── [locale]/                  # Internationalized routes
│   │   ├── inventory/             # Inventory management page
│   │   ├── clients/               # Client management page
│   │   ├── orders/                # Order management page
│   │   ├── returns/               # Returns management page
│   │   ├── alerts/                # Alerts and notifications page
│   │   ├── customer/              # Customer portal pages
│   │   │   ├── new-order/         # New order creation
│   │   │   └── orders/            # Order history and tracking
│   │   └── page.tsx               # Main dashboard
│   ├── api/                       # API routes
│   │   ├── orders/                # Order CRUD operations
│   │   ├── products/              # Product management
│   │   ├── alerts/                # Alert management
│   │   ├── run-alerts/            # Manual alert execution
│   │   └── dispatch-messages/     # WhatsApp message dispatch
│   └── globals.css                # Global styles
├── components/                    # React components
│   ├── Layout.tsx                 # App layout with sidebar
│   ├── KpiCard.tsx                # Dashboard KPI cards
│   ├── OrdersToDeliverTable.tsx   # Orders management table
│   ├── LowStockTable.tsx          # Low stock inventory table
│   ├── ReceivablesAndPayments.tsx # Financial overview panel
│   ├── AlertsSidebar.tsx          # Recent alerts sidebar
│   ├── InventoryManagement.tsx    # Inventory CRUD operations
│   ├── ClientManagement.tsx       # Client management
│   ├── OrderManagement.tsx        # Order processing
│   ├── ReturnManagement.tsx       # Returns handling
│   ├── AlertsManagement.tsx       # Alert management
│   └── customer/                  # Customer portal components
│       ├── CustomerDashboard.tsx  # Customer home page
│       ├── NewOrderPage.tsx       # Order creation interface
│       ├── NewOrderProductList.tsx # Product catalog
│       ├── CartSidebar.tsx        # Shopping cart
│       └── OrderConfirmation.tsx  # Order confirmation
├── lib/                           # Utility functions
│   ├── database.ts                # Database operations and queries
│   ├── dashboard.ts               # Dashboard-specific queries
│   ├── supabase.ts                # Supabase configuration
│   ├── alerts.ts                  # Alert system logic
│   ├── whatsapp.ts                # WhatsApp integration
│   └── utils.ts                   # Helper functions
├── types/                         # TypeScript type definitions
│   └── database.ts                # Database schema types
└── i18n/                          # Internationalization
    ├── messages/                  # Translation files
    └── config.ts                  # i18n configuration
```

## 🎯 Key Features Implementation

### **Admin Dashboard**
- **Real-time KPIs**: Orders to deliver, low stock count, receivables, new orders today, payments yesterday
- **Interactive Tables**: Orders with quick actions, low stock with inline editing
- **Financial Overview**: Top debtors with WhatsApp reminders, recent payments
- **Alert Management**: Recent alerts with acknowledgment, manual alert running
- **Server-side Rendering**: All data fetched server-side for optimal performance

### **Inventory Management**
- **CRUD Operations**: Full product lifecycle management
- **Advanced Filtering**: Multi-criteria search and filtering
- **Stock Management**: Real-time stock tracking with reservations
- **Category System**: Hierarchical product categorization
- **Bulk Operations**: Efficient mass updates and imports
- **Low Stock Alerts**: Configurable thresholds with automated notifications

### **Order Processing**
- **Multi-step Workflow**: Status progression with validation
- **Stock Reservation**: Automatic inventory allocation
- **Client Integration**: Seamless customer portal integration
- **Payment Tracking**: Integrated payment logging and debt management
- **Order History**: Complete audit trail and analytics

### **Customer Portal**
- **Self-Service**: Independent order placement and tracking
- **Product Catalog**: Full inventory browsing with real-time stock
- **Shopping Cart**: Advanced cart management with stock validation
- **Order Tracking**: Real-time status updates and history
- **Mobile Optimization**: Responsive design with floating actions
- **WhatsApp Integration**: Order confirmations and updates

### **Financial Management**
- **Payment Processing**: Multiple payment methods and tracking
- **Debt Management**: Automated overdue detection and reminders
- **Receivables Dashboard**: Top debtors with outstanding amounts
- **Financial Reports**: Revenue and profit analytics
- **WhatsApp Reminders**: Automated payment reminder messages

### **Alert System**
- **Multi-Channel Alerts**: Low stock, overdue payments, pending deliveries
- **WhatsApp Integration**: Automated customer notifications
- **Scheduled Automation**: Daily alerts via Vercel cron jobs
- **Manual Controls**: On-demand alert running and message dispatch
- **Alert Management**: Acknowledgment system and severity tracking

## 🚀 Deployment

### **Vercel (Recommended)**

1. **Connect Repository**: Link your GitHub repository to Vercel
2. **Environment Variables**: Add all required environment variables in Vercel dashboard
3. **Database Setup**: Run all database migrations in Supabase
4. **Deploy**: Vercel will automatically build and deploy

### **Environment Variables for Production**

```env
# Required
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_live_...
CLERK_SECRET_KEY=sk_live_...
ADMIN_EMAILS=admin@yourcompany.com,owner@yourcompany.com
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
NEXT_PUBLIC_APP_URL=https://your-domain.com

# Optional (for WhatsApp notifications)
WHATSAPP_PROVIDER=twilio
WHATSAPP_TEST_MODE=false
TWILIO_ACCOUNT_SID=AC...
TWILIO_AUTH_TOKEN=your_auth_token
TWILIO_WHATSAPP_FROM=whatsapp:+14155238886
```

### **Other Platforms**

The application can be deployed to any platform that supports Next.js:
- Netlify
- Railway
- DigitalOcean App Platform
- AWS Amplify

## 📱 API Endpoints

### **Core Operations**
- `POST /api/orders` - Create new order
- `PATCH /api/orders` - Update order status
- `GET /api/products` - Fetch product catalog
- `PATCH /api/products` - Update product information

### **Alert System**
- `POST /api/run-alerts` - Execute alert checks
- `POST /api/dispatch-messages` - Send queued WhatsApp messages
- `POST /api/alerts/mark-delivered` - Acknowledge alert

### **Testing & Debug**
- `POST /api/test-whatsapp` - Test WhatsApp message sending
- `GET /api/health` - System health check

## 🧪 Testing

### **Manual Testing Commands**

```bash
# Test alert system
curl -X POST http://localhost:3000/api/run-alerts

# Test message dispatch
curl -X POST http://localhost:3000/api/dispatch-messages

# Test WhatsApp message
curl -X POST http://localhost:3000/api/test-whatsapp \
  -H "Content-Type: application/json" \
  -d '{"to":"+972501234567","template":"order_confirmation","variables":{"orderId":"123","summary":"iPhone 15 Pro"}}'
```

### **Database Testing Scripts**

```bash
# Test database connection
node scripts/check-db-structure.js

# Test order creation
node scripts/test-db-insert.js

# Test alert system
node scripts/test-new-order-alert.js
```

## 🔧 Configuration

### **Alert Thresholds**
```env
ALERT_UNDELIVERED_DAYS=3      # Days before undelivered order alert
ALERT_OVERDUE_DAYS=14         # Days before overdue payment alert
ALERT_RESERVED_STALE_DAYS=3   # Days before stale reservation alert
```

### **WhatsApp Configuration**
```env
WHATSAPP_PROVIDER=twilio      # Currently only Twilio supported
WHATSAPP_TEST_MODE=true       # Use sandbox for testing
```

## 🌍 Internationalization

The application supports multiple languages through Next-Intl:
- English (default)
- Hebrew (עברית)
- Additional languages can be added by extending the translation files

## 🔒 Security Features

- **Row Level Security (RLS)**: Database-level access control
- **Admin Role Management**: Email-based admin permissions
- **Middleware Protection**: Route-level authentication
- **Server Actions**: Secure server-side operations
- **Environment Variables**: Secure configuration management

## 📈 Performance Optimizations

- **Server Components**: Server-side rendering for optimal performance
- **Parallel Data Fetching**: Concurrent database queries
- **Edge Runtime**: Global performance optimization
- **Image Optimization**: Next.js automatic image optimization
- **Database Indexing**: Optimized queries with proper indexes

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

For support and questions:
1. Check the [Issues](https://github.com/AdirBuskila/mobileforyou/issues) page
2. Create a new issue with detailed description
3. Include error logs and environment information

## 🗺️ Roadmap

### **Phase 2 Features**
- **Advanced Analytics**: Detailed business intelligence and reporting
- **Multi-location Support**: Multiple warehouse/office management
- **Barcode Integration**: Product scanning and inventory management
- **Delivery Route Optimization**: GPS-based delivery planning
- **Advanced WhatsApp Features**: Rich media messages and interactive buttons
- **Mobile App**: Native mobile application for field operations
- **API Documentation**: Comprehensive API documentation with examples
- **Advanced Permissions**: Role-based access control beyond admin/client
- **Automated Reordering**: AI-powered inventory replenishment suggestions
- **Integration APIs**: Third-party service integrations (accounting, shipping)

### **Phase 3 Features**
- **Multi-tenant Support**: Multiple business management
- **Advanced Reporting**: Custom report builder and analytics
- **Workflow Automation**: Custom business process automation
- **Advanced Inventory**: Serial number tracking and batch management
- **Customer Portal Enhancements**: Advanced customer features and self-service
- **White-label Solution**: Customizable branding and deployment

---

**Built with ❤️ for mobile device distribution businesses**