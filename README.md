# Mobile4U Business Management System

A comprehensive business management system for phone distribution companies, built with Next.js, TypeScript, and Supabase.

## Features

### 🏠 Dashboard
- Real-time business overview with key metrics
- Quick action buttons for common tasks
- Recent orders and low stock alerts
- Revenue and profit tracking

### 📦 Inventory Management
- Complete product catalog with brands, models, storage, and conditions
- Stock level tracking with low stock alerts
- Reserved stock management for pending orders
- Category-based organization (phones, tablets, earphones, accessories)

### 👥 Client Management
- Client database with contact information
- Payment terms and custom pricing
- Purchase history and outstanding debt tracking
- Client performance analytics

### 🛒 Order Management
- Order creation and lifecycle management (draft → reserved → delivered → closed)
- Multi-item orders with automatic pricing
- Order status tracking and updates
- Client-specific order history

### 💰 Payment Tracking
- Payment recording with multiple methods (cash, transfer, check)
- Debt management and overdue payment alerts
- Payment history and analytics
- Order-linked payment tracking

### 🔄 Returns & Trade-ins
- Return processing with reason tracking
- Trade-in management
- Refurbishment workflow
- Inventory restocking from returns

### 🔔 Alerts & Notifications
- Low stock alerts
- Orders pending delivery
- Overdue payment notifications
- Outstanding debt tracking

## Tech Stack

- **Frontend**: Next.js 15, React 18, TypeScript
- **Styling**: Tailwind CSS
- **Database**: Supabase (PostgreSQL)
- **Authentication**: Clerk
- **Icons**: Lucide React
- **Charts**: Recharts

## Getting Started

### Prerequisites

- Node.js 18+ 
- npm or yarn
- Supabase account
- Clerk account

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd mobile4u
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   Create a `.env.local` file in the root directory:
   ```env
   # Clerk Authentication
   NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=your_clerk_publishable_key_here
   CLERK_SECRET_KEY=your_clerk_secret_key_here

   # Supabase
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_url_here
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key_here
   SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key_here

   # App Configuration
   NEXT_PUBLIC_APP_URL=http://localhost:3000
   ```

4. **Set up Supabase database**
   - Create a new Supabase project
   - Run the SQL schema from `database/schema.sql` in your Supabase SQL editor
   - Enable Row Level Security (RLS) policies

5. **Set up Clerk authentication**
   - Create a new Clerk application
   - Configure the authentication settings
   - Add your domain to the allowed origins

6. **Start the development server**
   ```bash
   npm run dev
   ```

7. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

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