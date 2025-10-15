# Scripts and Migrations Documentation

This document contains all the scripts and migrations used in the Mobile4U project, organized by category.

## 📁 Directory Structure

```
scripts/
├── database/           # Database management scripts
├── images/            # Image processing scripts  
├── testing/           # Testing and validation scripts
└── utilities/         # General utility scripts

database/
├── migrations/        # Database migration files
├── fixes/            # Database fix scripts
└── updates/          # Database update scripts
```

## 🗄️ Database Schema

### Current Schema
- `schema.sql` - Complete, up-to-date database schema matching Supabase production

### Schema Features
- **Alerts system** - Low stock, undelivered orders, overdue payments
- **B2B enhancements** - Purchase prices, sale prices, alert thresholds, importers
- **Client profiles** - Phone, city, shop name, Clerk integration
- **Product images** - Local image URL support
- **WhatsApp integration** - Outbound message templates
- **Comprehensive indexing** - Optimized for performance
- **Row Level Security** - Secure data access

## 🖼️ Image Management Scripts

### Current Image Processing Workflow

#### 1. Image Mapping Scripts
```javascript
// scripts/images/map-product-images.js
// Maps product names to image files in /public/images/products/
// Handles various naming conventions and variations
```

#### 2. Database Image URL Updates
```javascript
// scripts/images/update-database-images.js
// Generates SQL to update product.image_url in database
// Converts HTTPS URLs to local paths
```

#### 3. Image Validation
```javascript
// scripts/images/validate-images.js
// Checks if image files exist and URLs are correct
// Reports missing or broken image links
```

### Image Management Commands

```bash
# Map products to images
node scripts/images/map-product-images.js

# Update database with local image paths
node scripts/images/update-database-images.js

# Validate all image URLs
node scripts/images/validate-images.js
```

## 🧪 Testing Scripts

### API Testing
```javascript
// scripts/testing/test-api-endpoints.js
// Tests all API endpoints for functionality
// Validates authentication and data flow
```

### Database Testing
```javascript
// scripts/testing/test-database-schema.js
// Validates database schema integrity
// Checks for missing tables, columns, and constraints
```

### Onboarding Testing
```javascript
// scripts/testing/test-onboarding-flow.js
// Tests client onboarding process
// Validates form submission and data persistence
```

## 🔧 Utility Scripts

### Database Management
```javascript
// scripts/utilities/run-migrations.js
// Runs database migrations in sequence
// Handles rollback and error recovery
```

### Data Seeding
```javascript
// scripts/utilities/seed-products.js
// Seeds database with initial product data
// Handles bulk inserts and updates
```

## 📋 Migration History

### Phase 1: Core Features
- Business features and user management
- Product catalog and inventory
- Order management system

### Phase 2: B2B Enhancements
- Product enhancements (purchase price, alerts, etc.)
- Client profile fields
- Dashboard improvements

### Phase 3: Image Integration
- Product image management
- Local image path conversion
- Image validation and cleanup

## 🚀 Quick Start

### Running Migrations
```bash
# Run all pending migrations
node scripts/utilities/run-migrations.js

# Run specific migration
node scripts/utilities/run-migrations.js --migration=007
```

### Image Management
```bash
# Process all product images
node scripts/images/map-product-images.js
node scripts/images/update-database-images.js
```

### Testing
```bash
# Run all tests
node scripts/testing/test-api-endpoints.js
node scripts/testing/test-database-schema.js
```

## 📝 Notes

- All scripts use environment variables for database connection
- Image scripts assume images are in `/public/images/products/`
- Migration scripts are idempotent and safe to run multiple times
- Test scripts can be run in any order

## 🔄 Maintenance

### Regular Tasks
1. Run image validation monthly
2. Test API endpoints after deployments
3. Validate database schema after migrations
4. Clean up old test data

### Before Production
1. Run all migrations
2. Validate all images
3. Test all API endpoints
4. Verify database integrity
