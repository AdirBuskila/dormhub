# Admin Panel Guide

## Overview

The DormHub Admin Panel provides administrators with tools to manage the platform's content and users. The panel is accessible at `/[locale]/admin` (e.g., `/en/admin` or `/he/admin`).

## Access Control

Admin access is controlled via the `ADMIN_EMAILS` environment variable. Only users whose email addresses are listed in this environment variable can access the admin panel.

To add admin users, update your `.env.local` file:

```env
ADMIN_EMAILS=admin@example.com,another-admin@example.com
```

## Features

### 1. Approve Tips

**Purpose**: Review and approve or reject tips submitted by users before they appear publicly.

**Features**:
- View all tips with filtering by status (All, Pending, Approved, Rejected)
- See tip content, images, tags, author information, and helpful count
- Approve or reject pending tips with a single click
- Tips are only visible to the public once approved

**Workflow**:
1. Navigate to the "Approve Tips" tab
2. Review pending tips
3. Click "Approve" to make the tip visible to all users
4. Click "Reject" to decline the tip

### 2. Manage Listings

**Purpose**: Monitor and manage marketplace listings, including the ability to change listing status.

**Features**:
- View all listings with filtering by status (All, Active, Reserved, Sold, Removed)
- See listing details, images, owner information, and view count
- Change listing status (Active, Reserved, Sold, Removed)
- Override owner's listing status for moderation purposes

**Workflow**:
1. Navigate to the "Manage Listings" tab
2. Browse or filter listings
3. Use the dropdown to change a listing's status
4. Changes are saved immediately

### 3. Add Business

**Purpose**: Add new local businesses to the platform.

**Features**:
- Create new business entries with comprehensive information:
  - Name (required)
  - Category (Restaurant, Minimarket, Bakery, Supermarket, Other)
  - Description
  - Contact information (Phone, WhatsApp)
  - Address
  - Website URL
  - Logo URL
  - Active/Inactive status

**Workflow**:
1. Navigate to the "Add Business" tab
2. Fill in the business information form
3. Check "Active" to make the business visible immediately
4. Click "Create Business"
5. Success message will confirm creation

### 4. Assign Owners

**Purpose**: Connect existing businesses to user accounts, allowing business owners to manage their own business information.

**Features**:
- View all businesses with current owner status
- Assign a user as the owner of a business
- Remove owner assignments
- Users become business owners and gain access to the business dashboard

**Workflow**:
1. Navigate to the "Assign Owners" tab
2. Find the business you want to assign an owner to
3. Select a user from the dropdown menu
4. Confirm the assignment
5. The user will now be able to manage their business via `/business-dashboard`

## Navigation

The admin panel link appears in the navbar (with a purple gear icon) for users with admin access. It's visible on both desktop and mobile views.

## API Endpoints

The admin panel uses the following API endpoints:

### Tips Management
- `GET /api/admin/tips` - Get all tips with optional status filter
- `PATCH /api/tips/approve/[id]` - Approve or reject a tip

### Listings Management
- `GET /api/admin/listings` - Get all listings with optional status filter
- `PATCH /api/admin/listings` - Update listing status

### Business Management
- `GET /api/admin/businesses` - Get all businesses
- `POST /api/admin/businesses` - Create a new business
- `PATCH /api/admin/businesses` - Assign business owner

### User Management
- `GET /api/admin/users` - Get all users for owner assignment

## Security

All admin endpoints are protected with the `requireAdmin()` function, which:
1. Verifies the user is authenticated via Clerk
2. Checks if the user's email is in the `ADMIN_EMAILS` list
3. Returns a 403 Forbidden error if the user is not an admin

## Components

The admin panel is built with the following components:

- `AdminPanel.tsx` - Main admin panel with tab navigation
- `TipApproval.tsx` - Tip approval interface
- `ListingManagement.tsx` - Listing management interface
- `BusinessForm.tsx` - Business creation form
- `BusinessOwnerAssignment.tsx` - Owner assignment interface

## Styling

The admin panel uses Tailwind CSS for styling and follows the same design system as the rest of the application. The admin link in the navbar uses purple colors to distinguish it from regular navigation items.

## Future Enhancements

Potential features to add:
- Bulk tip approval/rejection
- Business hours and discount management from admin panel
- User management (ban, promote to admin, etc.)
- Analytics dashboard
- Flagged content review
- Listing image moderation

