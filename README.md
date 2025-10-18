# DormHub

**Your Community Platform for Dorm Life**

DormHub is a Next.js-powered community platform designed specifically for dorm residents. It features two main modules:

1. **Marketplace** - Buy, sell, swap, or give away items with fellow residents
2. **Tips & Info** - Share and discover helpful advice and curated guides for dorm life

## Features

### Marketplace
- 🏪 Create listings for items you want to sell, buy, swap, or give away
- 📸 Upload multiple images per listing
- 🔍 Filter and search by category, condition, price range, and more
- ❤️ Favorite listings to save for later
- 👤 View owner profiles and contact information

### Tips & Info
- 💡 Submit helpful tips for fellow residents
- ✅ Moderation system for tip approval
- 🏷️ Tag-based filtering and discovery
- 👍 Vote tips as helpful
- 📚 Curated static guides (e.g., Moving In Guide)

## Tech Stack

- **Framework:** Next.js 15 (App Router)
- **Language:** TypeScript (strict mode)
- **Authentication:** Clerk
- **Database:** Supabase (PostgreSQL)
- **Storage:** Supabase Storage
- **Styling:** Tailwind CSS
- **Internationalization:** next-intl (English & Hebrew with RTL support)
- **Validation:** Zod

## Getting Started

### Prerequisites

- Node.js 18+ and npm
- Supabase account and project
- Clerk account and application
- Git

### Installation

1. **Clone the repository**
   ```bash
   git clone <your-repo-url>
   cd dormhub-new
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**

   Create a `.env.local` file in the root directory:

   ```env
   # Clerk
   NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...
   CLERK_SECRET_KEY=sk_test_...
   CLERK_SIGN_IN_URL=/sign-in
   CLERK_SIGN_UP_URL=/sign-up

   # Supabase
   NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbG...
   SUPABASE_SERVICE_ROLE_KEY=eyJhbG...

   # App Configuration
   ADMIN_EMAILS=admin@example.com,partner@example.com
   NEXT_PUBLIC_SITE_NAME=DormHub
   NEXT_PUBLIC_DEFAULT_LOCALE=en
   ```

4. **Run database migrations**

   Apply the schema to your Supabase database:

   ```bash
   npm run migrate
   ```

   Or manually run the migration file:
   ```bash
   psql <your-connection-string> < supabase/migrations/20250118000000_create_dormhub_schema.sql
   ```

5. **Seed the database (optional)**

   Populate with sample data for testing:

   ```bash
   npm run seed
   ```

6. **Run the development server**

   ```bash
   npm run dev
   ```

   Open [http://localhost:3000](http://localhost:3000) in your browser.

## Project Structure

```
dormhub-new/
├── src/
│   ├── app/
│   │   ├── [locale]/
│   │   │   ├── marketplace/        # Marketplace pages
│   │   │   ├── tips/               # Tips pages
│   │   │   ├── sign-in/            # Auth pages
│   │   │   ├── sign-up/
│   │   │   └── page.tsx            # Home page
│   │   └── api/
│   │       ├── marketplace/        # Marketplace API routes
│   │       └── tips/               # Tips API routes
│   ├── components/
│   │   ├── marketplace/            # Marketplace components
│   │   └── tips/                   # Tips components
│   ├── lib/
│   │   ├── auth.ts                 # Clerk integration
│   │   ├── supabase.ts             # Supabase clients
│   │   ├── validators.ts           # Zod schemas
│   │   └── db/                     # Database helpers
│   ├── types/
│   │   └── database.ts             # TypeScript types
│   └── i18n/
│       └── messages/               # Translations (en, he)
├── supabase/
│   └── migrations/                 # Database migrations
├── scripts/
│   └── utilities/
│       ├── seed-dormhub.js         # Seed script
│       └── run-migrations.js       # Migration runner
└── public/
    └── images/                     # Static assets
```

## Available Scripts

- `npm run dev` - Start development server with Turbopack
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint
- `npm run typecheck` - Run TypeScript type checking
- `npm run seed` - Seed database with sample data
- `npm run migrate` - Run database migrations

## Database Schema

### Tables

- **profiles** - User profiles linked to Clerk accounts
- **listings** - Marketplace listings
- **favorites** - User favorites
- **tips** - User-submitted tips
- **tip_votes** - Helpful votes on tips
- **info_pages** - Curated static content (guides)

### Row Level Security (RLS)

All tables have RLS enabled with policies that:
- Allow public read access to published content
- Restrict write operations to authenticated users
- Ensure users can only modify their own content
- Grant admin privileges via service role

## Authentication

DormHub uses Clerk for authentication with Supabase for data storage. When a user signs in:

1. Clerk handles the authentication
2. A profile is created/retrieved in Supabase
3. The profile ID is used for all data operations

Admin users are determined by the `ADMIN_EMAILS` environment variable.

## Internationalization

The app supports English (en) and Hebrew (he) with automatic RTL layout for Hebrew. Translations are managed via `next-intl`.

To add a new language:
1. Create a new message file in `src/i18n/messages/`
2. Update `src/i18n/config.ts`

## Storage

Listing images are stored in Supabase Storage bucket named `listings`. Images are publicly accessible and automatically cleaned up when listings are deleted.

## API Reference

### Marketplace API

- `GET /api/marketplace/listings` - List listings with filters
- `POST /api/marketplace/listings` - Create listing (auth)
- `GET /api/marketplace/listings/[id]` - Get listing details
- `PATCH /api/marketplace/listings/[id]` - Update listing (owner)
- `DELETE /api/marketplace/listings/[id]` - Delete listing (owner)
- `GET /api/marketplace/favorites` - Get user favorites (auth)
- `POST /api/marketplace/favorites` - Toggle favorite (auth)
- `POST /api/marketplace/search` - Advanced search

### Tips API

- `GET /api/tips` - List approved tips
- `POST /api/tips/submit` - Submit tip (auth)
- `PATCH /api/tips/approve/[id]` - Approve/reject tip (admin)
- `POST /api/tips/vote/[id]` - Vote tip as helpful (auth)

## Development

### Type Safety

All API routes use Zod for validation and TypeScript for type safety. The database types in `src/types/database.ts` should match the Supabase schema.

### Adding New Features

1. Update database schema via migration
2. Update TypeScript types
3. Create/update validators
4. Implement API routes
5. Create UI components
6. Add translations

## Deployment

### Vercel (Recommended)

1. Push your code to GitHub
2. Import project in Vercel
3. Add environment variables
4. Deploy

### Other Platforms

The app is a standard Next.js app and can be deployed to any platform that supports Next.js 15.

## Contributing

This is a private project, but contributions are welcome:

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

Private - All rights reserved

## Support

For issues or questions, please contact the development team or create an issue in the repository.

---

Built with ❤️ for dorm communities
