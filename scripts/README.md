# Scripts Directory

This directory contains organized scripts for the Mobile4U project.

## 📁 Directory Structure

```
scripts/
├── images/           # Image processing and management
├── testing/          # Testing and validation scripts
├── utilities/        # General utility scripts
└── database/         # Database management scripts
```

## 🖼️ Image Scripts (`images/`)

### `map-product-images.js`
Maps product names to image files in `/public/images/products/`
- Handles various naming conventions
- Generates SQL for database updates
- Validates image file existence

### `update-database-images.js`
Updates product `image_url` field in database
- Converts HTTPS URLs to local paths
- Generates batch update SQL
- Handles missing images gracefully

### `validate-images.js`
Validates image URLs and file existence
- Checks all product images
- Reports missing or broken links
- Generates validation reports

## 🧪 Testing Scripts (`testing/`)

### `test-api-endpoints.js`
Tests all API endpoints for functionality
- Validates authentication
- Tests data flow
- Checks error handling

### `test-database-schema.js`
Validates database schema integrity
- Checks tables and columns
- Validates constraints
- Reports schema issues

### `test-onboarding-flow.js`
Tests client onboarding process
- Validates form submission
- Tests data persistence
- Checks error handling

## 🔧 Utility Scripts (`utilities/`)

### `run-migrations.js`
Runs database migrations in sequence
- Handles rollback
- Error recovery
- Migration validation

### `seed-products.js`
Seeds database with initial product data
- Bulk inserts
- Data validation
- Error handling

## 🗄️ Database Scripts (`database/`)

### Migration Scripts
- `001_add_business_features.sql` - Core business features
- `003_update_enums_and_features.sql` - Enum updates
- `004_add_new_order_alert_type.sql` - Alert system
- `005_add_new_product_categories.sql` - Product categories
- `006_add_dashboard_functions.sql` - Dashboard functions
- `007_add_product_enhancements.sql` - B2B product fields
- `008_add_consignments_table.sql` - Consignment tracking
- `009_enhance_existing_fields.sql` - Client profile fields

### Fix Scripts (`database/fixes/`)
- `batch_fix_image_urls.sql` - Batch fix for image URLs
- `comprehensive_fix_image_urls.sql` - Complete image URL fix
- `final_fix_image_urls.sql` - Final image URL cleanup
- `fix_image_urls.sql` - Individual image URL fixes

### Update Scripts (`database/updates/`)
- `batch_update_product_images.sql` - Batch product image updates
- `update_all_product_images.sql` - Complete product image update
- `update_iphone17_images.sql` - iPhone 17 specific updates
- `update_product_images.sql` - General product image updates

## 🚀 Quick Start

### Image Management
```bash
# Map products to images
node scripts/images/map-product-images.js

# Update database with local paths
node scripts/images/update-database-images.js

# Validate all images
node scripts/images/validate-images.js
```

### Testing
```bash
# Test API endpoints
node scripts/testing/test-api-endpoints.js

# Test database schema
node scripts/testing/test-database-schema.js

# Test onboarding flow
node scripts/testing/test-onboarding-flow.js
```

### Database Management
```bash
# Run migrations
node scripts/utilities/run-migrations.js

# Seed products
node scripts/utilities/seed-products.js
```

## 📝 Notes

- All scripts use environment variables for database connection
- Image scripts assume images are in `/public/images/products/`
- Migration scripts are idempotent and safe to run multiple times
- Test scripts can be run in any order
- Always backup database before running migration scripts

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
