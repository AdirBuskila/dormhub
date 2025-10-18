# Mobile For You - מובייל פור יו

A comprehensive, modern B2B management system designed specifically for mobile device distribution companies. Built with Next.js 15, TypeScript, and Supabase, this system streamlines inventory management, order processing, client relationships, deals & promotions, and automated notifications with full Hebrew/English bilingual support.

[![Next.js](https://img.shields.io/badge/Next.js-15-black?style=flat-square&logo=next.js)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue?style=flat-square&logo=typescript)](https://www.typescriptlang.org/)
[![Supabase](https://img.shields.io/badge/Supabase-Database-green?style=flat-square&logo=supabase)](https://supabase.com/)
[![Clerk](https://img.shields.io/badge/Clerk-Authentication-purple?style=flat-square)](https://clerk.com/)
[![Next-Intl](https://img.shields.io/badge/Next--Intl-i18n-orange?style=flat-square)](https://next-intl-docs.vercel.app/)

## 🌟 What's New - Latest Updates

### 🔥 **Deals & Promotions System**
- **Tiered Pricing**: Multi-tier deals (1x, 2x, 5x) with per-unit pricing
- **Deal Cards**: Eye-catching carousel with gradient animations and hot deal badges
- **Deal Modal**: Interactive tier selection with savings calculations
- **Priority System**: Hot deals (15+), High priority (10+), Normal deals
- **Expiration Options**: Time-based, quantity-based, or combined expiration
- **Payment Methods**: Flexible payment options per deal (cash, bank transfer, checks)
- **Admin Management**: Full CRUD operations for deals with real-time updates
- **Customer Integration**: Deals integrated seamlessly into order flow with special cart badges

### 🧪 **Demo Mode (Test User)**
- **No Authentication Required**: Visit `/test-user` for instant access
- **Full Functionality**: Browse, add to cart, complete orders (not saved to DB)
- **Demo Banner**: Clear visual indicator with "Exit Demo" button
- **24-Hour Session**: Automatic expiration for security
- **Perfect for**: Sales demos, customer previews, testing features

### ⚡ **Performance & Caching**
- **API Route Caching**: 5-minute cache for products, 2-minute for deals
- **CDN Optimization**: Public cache headers with stale-while-revalidate
- **Faster Load Times**: < 50ms response for cached data
- **Reduced DB Load**: Significantly fewer database queries
- **Smart Invalidation**: Automatic cache refresh on intervals

### 📄 **Legal & Compliance Pages**
- **Privacy Policy**: Comprehensive data protection information
- **Terms of Service**: Clear terms and conditions
- **Accessibility Declaration**: IS 5568 compliance information
- **About Page**: Company information and contact details
- **Contact Page**: Multiple contact methods
- **Delivery & Returns**: Clear policies and procedures
- **Bilingual Footer**: Compact, mobile-optimized with all legal links

### 💳 **Enhanced Order Flow**
- **Payment Method Selection**: Choose before completing orders
  - 💵 Cash
  - 💳 Credit Card
  - 📃 Checks
  - ✏️ Other (with text input)
- **Order Details Enhancement**: Full date/time, sequential numbering (latest = highest)
- **Clickable Rows**: Entire order row opens details (not just eye icon)
- **Payment Method Column**: Dedicated database field for payment tracking

### 🎨 **UI/UX Improvements**
- **Accessibility**: Skip-to-content, enhanced focus states, screen reader support
- **Responsive Footer**: Compact mobile view with bullet separators
- **Product Sorting**: Runners and best sellers displayed first
- **Deal Badges**: Special indicators in cart for deal items
- **Mobile Optimization**: Smooth horizontal scrolling, snap-to-grid
- **Animations**: Subtle bounce, gradient shifts, scale transitions

## 🚀 Key Features

### 🔥 **Deals & Promotions Management**
- **Tiered Pricing System**: Multi-level pricing (1x @ ₪4300, 2x @ ₪4200/unit, 5x @ ₪4100/unit)
- **Visual Deal Cards**: Animated gradient borders, hot deal badges, low stock warnings
- **Deal Modal**: Interactive tier selection with savings calculations and quantity controls
- **Expiration Management**: Time-based, quantity-based, or combined expiration strategies
- **Priority Levels**: Hot deals (🔥), high priority, and normal deals with visual differentiation
- **Payment Flexibility**: Multiple payment methods per deal with custom notes
- **Admin Controls**: Full CRUD operations, toggle active/inactive, real-time deal management
- **Customer Integration**: Seamless cart integration with special deal badges and pricing

### 📊 **Advanced Admin Dashboard**
- **Real-time KPIs**: Live business metrics including revenue, cost, profit, and orders
- **Interactive Charts**: Sales trends and profit distribution with Recharts
- **Top Performers**: Best-selling products and top clients with detailed analytics
- **Smart Alerts**: Low stock alerts and system notifications
- **Quick Actions**: One-click access to all major functions
- **Responsive Design**: Optimized for desktop and mobile viewing

### 📱 **Comprehensive Inventory Management**
- **Enhanced Product Model**: B2B features with purchase prices, profit margins, and supplier info
- **Product Images**: Full image support with local storage and optimization
- **Multi-Category Support**: iPhone, Samsung, Android phones, tablets, smartwatches, earphones, chargers, cases, accessories
- **Condition Tracking**: New, refurbished, used, activated, and open-box items
- **Advanced Stock Management**: Real-time stock levels with reservation system
- **Smart Filtering**: Search by brand, model, category, condition, and stock levels
- **Bulk Operations**: Efficient inventory updates and mass operations
- **Automated Alerts**: Low stock notifications with configurable thresholds
- **Promotional Products**: Special handling and highlighting for promotional items
- **Runner & Best Seller Flags**: Priority display for high-demand products

### 👥 **Complete Client Management**
- **Smart Onboarding**: Automatic profile completion for new clients
- **Enhanced Profiles**: Extended client information with business details
- **Self-Service Updates**: Clients can manage their own profile information
- **Integrated Authentication**: Seamless Clerk integration for client accounts
- **Purchase History**: Detailed transaction records with order analytics
- **Debt Management**: Outstanding balance tracking with automated reminders
- **Performance Metrics**: Client profitability analysis and engagement tracking

### 🛒 **Streamlined Order Processing**
- **Multi-language Interface**: Fully translated order management in Hebrew and English
- **Multi-Step Workflow**: Draft → Reserved → Delivered → Closed status progression
- **Payment Method Tracking**: Dedicated field for payment method selection
- **Real-time Updates**: Live order status tracking with instant notifications
- **Multi-Item Orders**: Complex order management with item-specific pricing
- **Stock Reservation**: Automatic stock reservation during order processing
- **Order History**: Complete audit trail with detailed item breakdowns
- **Sequential Numbering**: Latest orders have highest numbers for easy tracking
- **Full Date/Time**: Order timestamps include hour and minute
- **Clickable Rows**: Entire row opens order details for better UX

### 🛍️ **Enhanced Customer Portal**
- **Demo Mode**: Test the system without authentication via `/test-user`
- **Self-Service Ordering**: Customers can browse inventory and place orders independently
- **Deals Integration**: Eye-catching deals carousel at top of order page
- **Product Catalog**: Full inventory browsing with advanced filtering
- **Product Images**: Visual product display with image optimization
- **Availability Badges**: Customer-friendly stock indicators (In Stock, Last Few, Out of Stock)
- **Shopping Cart**: Add/remove items with quantity management and stock validation
- **Deal Cart Items**: Special badges showing deal pricing (🔥 Hot Deal • 5x @ ₪4100)
- **Payment Selection**: Choose payment method before completing order
- **Order Tracking**: View order history, status updates, and order details
- **Mobile-Optimized**: Responsive design with floating actions and horizontal scrolling

### 💰 **Financial Management**
- **Enhanced Profit Tracking**: Detailed cost and profit analysis per product and client
- **Payment Method Tracking**: Database field for payment method per order
- **Flexible Payment Options**: Cash, credit, checks, or custom payment methods
- **Debt Monitoring**: Automated overdue payment detection with configurable thresholds
- **Receivables Dashboard**: Top debtors with outstanding amounts and days overdue
- **Financial Reports**: Revenue tracking and profit analysis

### 🔔 **Smart Notifications System**
- **WhatsApp Integration**: Automated customer communications via Twilio
- **Multi-Channel Alerts**: Low stock, overdue payments, pending deliveries, new orders
- **Scheduled Automation**: Daily alerts and message dispatch via Vercel cron jobs
- **Template System**: Customizable message templates for different scenarios
- **Real-time Monitoring**: Live alert dashboard with severity levels
- **Alert Management**: Manual alert running and message dispatch controls

### 🔍 **Global Search System**
- **Unified Search**: Search across products and clients with intelligent matching
- **Hebrew-Friendly**: Optimized search for Hebrew text and transliterations
- **Smart Results**: Grouped search results with relevance scoring
- **Real-time Search**: Instant search suggestions and results
- **Multi-language Support**: Search works in both Hebrew and English

### 📄 **Legal & Compliance**
- **Privacy Policy**: GDPR-compliant data protection information (Hebrew & English)
- **Terms of Service**: Clear legal terms and conditions
- **Accessibility Declaration**: Israeli Standard 5568 compliance
- **About Page**: Company information and mission
- **Contact Page**: Multiple contact methods with WhatsApp integration
- **Delivery & Returns Policy**: Clear shipping and return procedures
- **Compact Footer**: Mobile-optimized footer with all legal links

### ⚡ **Performance Optimization**
- **Server-Side Caching**: API routes cached for optimal performance
  - Products: 5-minute cache (300s)
  - Deals: 2-minute cache (120s)
- **CDN Optimization**: Public cache headers with stale-while-revalidate
- **Image Optimization**: Next.js automatic image optimization with AVIF/WebP
- **Code Splitting**: Automatic code splitting for optimal loading
- **Database Indexing**: Optimized queries with proper indexes
- **Edge Runtime**: Global performance optimization

## 🛠️ Technology Stack

### **Frontend & UI**
- **Next.js 15** - React framework with App Router and server components
- **TypeScript 5.0** - Full type safety throughout the application
- **Tailwind CSS** - Utility-first CSS framework for responsive design
- **Lucide React** - Beautiful, customizable icons
- **Next-Intl** - Complete internationalization support for Hebrew/English
- **Recharts** - Interactive charts and data visualization

### **Backend & Database**
- **Supabase** - PostgreSQL database with real-time subscriptions and RLS
- **Row Level Security (RLS)** - Database-level security policies
- **Server Actions** - Secure server-side operations with automatic revalidation
- **Edge Runtime** - Optimized performance with global edge deployment
- **API Route Caching** - Smart caching strategy for optimal performance

### **Authentication & Security**
- **Clerk** - Complete authentication solution with admin role management
- **Middleware Protection** - Route-level security with automatic redirects
- **Admin Access Control** - Email-based admin permissions
- **Client Auto-Creation** - Automatic client records from customer portal
- **Demo Mode** - Secure test environment without authentication

### **Communication & Notifications**
- **Twilio WhatsApp API** - Business messaging platform with sandbox support
- **Vercel Cron Jobs** - Scheduled task automation for alerts and messaging
- **Template Engine** - Dynamic message generation with variables
- **Outbound Message Tracking** - Complete message delivery and status tracking

### **Deployment & Infrastructure**
- **Vercel** - Optimized hosting platform with edge functions
- **Environment Management** - Secure configuration handling
- **Database Migrations** - Version-controlled database schema updates
- **Performance Monitoring** - Built-in analytics and error tracking

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
Run the database schema in your Supabase SQL editor:

1. **Main Schema**: Run `database/schema.sql` (includes all tables, triggers, and RLS policies)
2. **Deals Migration**: Run `database/migrations/020_create_deals_table.sql`
3. **Payment Method**: Run `database/migrations/010_add_payment_method_to_orders.sql`

### 4. **Start Development Server**
```bash
npm run dev
```

### 5. **Access the Application**
- **English**: [http://localhost:3001/en](http://localhost:3001/en)
- **Hebrew**: [http://localhost:3001/he](http://localhost:3001/he)
- **Demo Mode**: [http://localhost:3001/test-user](http://localhost:3001/test-user)

## 🧪 Demo Mode (Test User)

Experience the full app without authentication:

### **How to Access**
1. Visit: `https://www.mobileforyou.co.il/test-user` (or `/test-user` locally)
2. No login required - instant access!
3. Browse products, add to cart, complete orders
4. Orders appear to complete but aren't saved to database
5. Click "Exit Demo" when done

### **Features**
✅ Full product browsing  
✅ View deals and promotions  
✅ Add items to cart  
✅ Select payment methods  
✅ "Complete" orders (simulated)  
✅ 24-hour session  
✅ Easy exit with one click  

### **Perfect For**
- 🎯 Sales demonstrations
- 👀 Customer previews
- 🧪 Testing new features
- 📱 Showcasing the platform

See [TEST_MODE_GUIDE.md](TEST_MODE_GUIDE.md) for detailed documentation.

## 🔥 Deals System

Create and manage special offers with tiered pricing:

### **Features**
- **Multi-Tier Pricing**: 1x, 2x, 5x (or any quantity) with different per-unit prices
- **Example**: Buy 1 @ ₪4300, Buy 2 @ ₪4200/each (save ₪100/unit)
- **Priority Levels**: Hot (15+), High (10+), Normal (0-4)
- **Expiration Options**: By date, by quantity, both, or never
- **Payment Methods**: Flexible per-deal payment options
- **Visual Appeal**: Animated gradients, hot badges, countdown timers

### **Admin Management**
1. Navigate to `/deals`
2. Click "Create New Deal"
3. Select product and set priority
4. Configure pricing tiers (remember: prices are per unit!)
5. Set expiration and payment methods
6. Save and activate

### **Customer Experience**
- Deals appear in carousel at top of `/customer/new-order`
- Click deal card to open detailed modal
- Select tier, choose quantity
- Add to cart with special deal badge
- Mixed cart: regular products + deals

## ⚡ Caching Strategy

The application implements smart caching for optimal performance:

### **Current Implementation**
- **Products API**: 5-minute cache (rarely changes)
- **Deals API**: 2-minute cache (time-sensitive)
- **Orders/Clients**: No cache (real-time data)

### **Cache Headers**
```javascript
'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=600'
```

### **Benefits**
- ⚡ Instant page loads (< 50ms for cached data)
- 💰 Reduced database costs
- 🚀 Better user experience
- 📉 Lower server load

See [CACHING_STRATEGY.md](CACHING_STRATEGY.md) for detailed documentation.

## 🌍 Internationalization (i18n)

Complete bilingual support with RTL optimization:

### **Supported Languages**
- **English** (en) - Default language
- **Hebrew** (he) - Right-to-left (RTL) layout optimized

### **Language Features**
- **Dynamic Switching**: Seamless language switching with persistent preferences
- **RTL Support**: Complete right-to-left layout for Hebrew
- **Localized Content**: 400+ translation keys covering all UI elements
- **Search Optimization**: Hebrew-friendly search with transliteration support
- **Date/Time Formatting**: Locale-specific date and time formatting

## 📁 Project Structure

```
src/
├── app/                           # Next.js app router pages
│   ├── [locale]/                  # Internationalized routes
│   │   ├── inventory/             # Inventory management
│   │   ├── clients/               # Client management
│   │   ├── orders/                # Order management
│   │   ├── deals/                 # Deals management
│   │   ├── alerts/                # Alerts and notifications
│   │   ├── promotions/            # Promotions page
│   │   ├── search/                # Global search
│   │   ├── test-user/             # Demo mode entry
│   │   ├── customer/              # Customer portal
│   │   │   ├── new-order/         # New order creation
│   │   │   └── orders/            # Order history
│   │   ├── privacy/               # Privacy policy
│   │   ├── terms/                 # Terms of service
│   │   ├── accessibility/         # Accessibility declaration
│   │   ├── about/                 # About page
│   │   ├── contact/               # Contact page
│   │   ├── delivery-returns/      # Delivery & returns policy
│   │   └── page.tsx               # Main dashboard
│   ├── api/                       # API routes
│   │   ├── orders/                # Order CRUD (with caching)
│   │   ├── products/              # Product management (cached 5min)
│   │   ├── deals/                 # Deals CRUD (cached 2min)
│   │   ├── alerts/                # Alert management
│   │   ├── search/                # Global search API
│   │   ├── clients/               # Client management
│   │   ├── run-alerts/            # Manual alert execution
│   │   └── dispatch-messages/     # WhatsApp dispatch
│   └── globals.css                # Global styles with animations
├── components/                    # React components
│   ├── Layout.tsx                 # App layout with sidebar
│   ├── Footer.tsx                 # Compact bilingual footer
│   ├── EnhancedDashboard.tsx      # Admin dashboard
│   ├── DealCard.tsx               # Individual deal card
│   ├── DealsManagement.tsx        # Deals CRUD interface
│   ├── InventoryManagement.tsx    # Inventory operations
│   ├── OrderManagement.tsx        # Order processing
│   ├── ClientsManagement.tsx      # Client management
│   └── customer/                  # Customer portal components
│       ├── DealsCarousel.tsx      # Horizontal deals carousel
│       ├── DealModal.tsx          # Deal selection modal
│       ├── CustomerDashboard.tsx  # Customer home
│       ├── NewOrderPage.tsx       # Order creation
│       ├── CartSidebar.tsx        # Shopping cart
│       ├── CartModal.tsx          # Mobile cart
│       └── OrderConfirmation.tsx  # Order confirmation
├── lib/                           # Utility functions
│   ├── database.ts                # Database operations (with caching)
│   ├── dashboard.ts               # Dashboard analytics
│   ├── supabase.ts                # Supabase config
│   ├── alerts.ts                  # Alert system
│   ├── deals.ts                   # Deals logic
│   ├── test-mode.ts               # Demo mode utilities
│   └── utils.ts                   # Helper functions
├── types/                         # TypeScript definitions
│   └── database.ts                # Database schema types
└── i18n/                          # Internationalization
    ├── messages/                  # Translation files
    │   ├── en.json                # English (400+ keys)
    │   └── he.json                # Hebrew (400+ keys)
    └── config.ts                  # i18n configuration
```

## 📊 Database Schema

### **Core Tables**
- **products**: Enhanced inventory with B2B features, images, and flags
- **clients**: Client information with extended profile fields
- **orders**: Order management with payment_method field
- **order_items**: Individual items within orders
- **deals**: Tiered pricing deals with expiration and payment options
- **payments**: Payment records and debt tracking
- **returns**: Return and trade-in processing

### **System Tables**
- **alerts**: System alerts with severity levels
- **outbound_messages**: WhatsApp message tracking

### **Key Features**
- **Automatic Timestamps**: Created/updated on all records
- **UUID Primary Keys**: Secure identifiers
- **Foreign Key Constraints**: Data integrity
- **Row Level Security**: Database-level access control
- **Enum Types**: Controlled vocabularies
- **B2B Enhancements**: Extended business features

## 📱 API Endpoints

### **Core Operations**
- `POST /api/orders` - Create new order (with payment_method)
- `PATCH /api/orders` - Update order status
- `GET /api/products` - Fetch products (cached 5min)
- `PATCH /api/products` - Update product

### **Deals**
- `GET /api/deals` - Fetch deals (cached 2min)
- `POST /api/deals` - Create deal
- `PATCH /api/deals/[id]` - Update deal
- `DELETE /api/deals/[id]` - Delete deal

### **Search & Discovery**
- `GET /api/search` - Global search across products and clients

### **Client Management**
- `POST /api/clients/upsert-self` - Update profile
- `GET /api/clients/[id]` - Fetch client info

### **Alert System**
- `POST /api/run-alerts` - Execute alert checks
- `POST /api/dispatch-messages` - Send WhatsApp messages
- `POST /api/alerts/mark-delivered` - Acknowledge alert
- `GET /api/alerts/count` - Get unread count

## 🔒 Security Features

- **Row Level Security (RLS)**: Database-level access control
- **Admin Role Management**: Email-based admin permissions
- **Middleware Protection**: Route-level authentication
- **Demo Mode Security**: Isolated test environment without DB writes
- **Server Actions**: Secure server-side operations
- **Environment Variables**: Secure configuration management

## 📈 Performance Optimizations

- **Server-Side Caching**: API routes cached with stale-while-revalidate
- **Server Components**: Server-side rendering for optimal performance
- **Parallel Data Fetching**: Concurrent database queries
- **Edge Runtime**: Global performance optimization
- **Image Optimization**: Automatic AVIF/WebP conversion
- **Database Indexing**: Optimized queries with proper indexes
- **Code Splitting**: Automatic code splitting for optimal loading

## 🚀 Deployment

### **Vercel (Recommended)**
1. Connect GitHub repository to Vercel
2. Add environment variables in Vercel dashboard
3. Run database schema in Supabase
4. Deploy automatically

### **Environment Variables for Production**
```env
# Required
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_live_...
CLERK_SECRET_KEY=sk_live_...
ADMIN_EMAILS=admin@yourcompany.com
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
SUPABASE_SERVICE_ROLE_KEY=...
NEXT_PUBLIC_APP_URL=https://your-domain.com

# Optional (WhatsApp)
WHATSAPP_PROVIDER=twilio
WHATSAPP_TEST_MODE=false
TWILIO_ACCOUNT_SID=AC...
TWILIO_AUTH_TOKEN=...
TWILIO_WHATSAPP_FROM=whatsapp:+...
```

## 📚 Documentation

- **[TEST_MODE_GUIDE.md](TEST_MODE_GUIDE.md)** - Demo mode implementation and usage
- **[CACHING_STRATEGY.md](CACHING_STRATEGY.md)** - Performance caching details
- **[PROJECT_COMPREHENSIVE_REVIEW.md](PROJECT_COMPREHENSIVE_REVIEW.md)** - Detailed project analysis

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
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

### **Completed ✅**
- [x] Core inventory, orders, clients
- [x] Customer portal with self-service
- [x] Deals & promotions system
- [x] Demo mode / test user
- [x] Performance caching
- [x] Legal & compliance pages
- [x] Payment method tracking
- [x] Bilingual support (Hebrew/English)

### **Phase 2 Features** 🚧
- [ ] Advanced Analytics Dashboard
- [ ] Barcode Scanner Integration
- [ ] Mobile App (React Native)
- [ ] Advanced Reporting
- [ ] Multi-location Support
- [ ] Delivery Route Optimization
- [ ] AI-powered Inventory Suggestions

### **Phase 3 Features** 🔮
- [ ] Multi-tenant Support
- [ ] Custom Workflow Automation
- [ ] Serial Number Tracking
- [ ] White-label Solution
- [ ] Third-party Integrations (Accounting, Shipping)

---

**Built with ❤️ for mobile device distribution businesses**

*Mobile For You - מובייל פור יו* - Your complete B2B management solution

**Live Demo**: [www.mobileforyou.co.il/test-user](https://www.mobileforyou.co.il/test-user)
