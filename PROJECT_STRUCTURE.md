# Project Structure

```
OrganicSocialRevenueTracking/
├── app/                          # Next.js App Router
│   ├── api/                      # API Routes
│   │   ├── tracking-links/       # Tracking links endpoints
│   │   │   ├── route.ts         # GET all, POST create
│   │   │   └── [id]/
│   │   │       └── route.ts     # GET, PATCH, DELETE by ID
│   │   └── revenue-entries/      # Revenue entries endpoints
│   │       ├── route.ts         # GET all, POST create
│   │       └── [id]/
│   │           └── route.ts     # GET, PATCH, DELETE by ID
│   ├── dashboard/                # Dashboard page
│   │   └── page.tsx             # Main dashboard with analytics
│   ├── login/                    # Login page
│   │   └── page.tsx             # Sign in form
│   ├── signup/                   # Signup page
│   │   └── page.tsx             # Registration form
│   ├── globals.css              # Global styles & Tailwind
│   ├── layout.tsx               # Root layout
│   └── page.tsx                 # Homepage
│
├── components/                   # React Components
│   ├── Analytics.tsx            # Dashboard analytics & stats
│   ├── LinkGenerator.tsx        # Create tracking links form
│   ├── LinksList.tsx            # Display all tracking links
│   └── RevenueTracker.tsx       # Manual revenue entry form
│
├── lib/                         # Utility functions
│   └── supabase/                # Supabase client setup
│       ├── client.ts            # Browser client
│       ├── server.ts            # Server-side client
│       └── middleware.ts        # Auth middleware helper
│
├── middleware.ts                # Next.js middleware (auth refresh)
├── next.config.js              # Next.js configuration
├── tailwind.config.ts          # Tailwind CSS configuration
├── tsconfig.json               # TypeScript configuration
├── postcss.config.mjs          # PostCSS configuration
├── package.json                # Dependencies & scripts
├── .env.local                  # Environment variables
├── .eslintrc.json             # ESLint configuration
├── .gitignore                  # Git ignore rules
│
├── supabase-schema.sql         # Database schema & migrations
├── README.md                   # Project documentation
├── SETUP.md                    # Quick setup guide
└── PROJECT_STRUCTURE.md        # This file
```

## Key Files Explained

### App Directory (`/app`)

- **`page.tsx`**: Landing page with CTAs to login/dashboard
- **`layout.tsx`**: Root layout with global styles and metadata
- **`globals.css`**: Tailwind directives and custom CSS
- **`login/page.tsx`**: Authentication page for existing users
- **`signup/page.tsx`**: Registration page for new users
- **`dashboard/page.tsx`**: Main app dashboard (protected route)

### API Routes (`/app/api`)

All API routes are protected and require authentication. They use Supabase server client for secure database access.

- **Tracking Links**:
  - `GET /api/tracking-links` - Fetch all user's links
  - `POST /api/tracking-links` - Create new tracking link
  - `GET /api/tracking-links/[id]` - Get specific link
  - `PATCH /api/tracking-links/[id]` - Update link
  - `DELETE /api/tracking-links/[id]` - Delete link

- **Revenue Entries**:
  - `GET /api/revenue-entries` - Fetch all entries (with optional filter)
  - `POST /api/revenue-entries` - Create new revenue entry
  - `GET /api/revenue-entries/[id]` - Get specific entry
  - `PATCH /api/revenue-entries/[id]` - Update entry
  - `DELETE /api/revenue-entries/[id]` - Delete entry

### Components (`/components`)

- **`LinkGenerator.tsx`**: Form to create new tracking links with UTM parameters
- **`RevenueTracker.tsx`**: Form to manually add revenue entries
- **`LinksList.tsx`**: Display all tracking links with copy and delete actions
- **`Analytics.tsx`**: Dashboard showing total revenue, top performers, and stats

### Supabase Setup (`/lib/supabase`)

- **`client.ts`**: Browser-side Supabase client for client components
- **`server.ts`**: Server-side Supabase client for API routes and server components
- **`middleware.ts`**: Helper for refreshing auth tokens in middleware

### Database (`supabase-schema.sql`)

Complete database schema with:
- Tables: `profiles`, `tracking_links`, `revenue_entries`
- Row Level Security (RLS) policies for data isolation
- Triggers for automatic revenue calculation
- Indexes for query performance
- Function to auto-create profiles on signup

## Data Flow

1. **User Authentication**:
   - User signs up/logs in → Supabase Auth
   - Auth state managed by middleware
   - Protected routes redirect to login if unauthenticated

2. **Creating Tracking Links**:
   - User fills form → `LinkGenerator` component
   - POST to `/api/tracking-links`
   - Server validates & saves to `tracking_links` table
   - Link displayed in `LinksList`

3. **Tracking Revenue**:
   - User selects link & enters amount → `RevenueTracker` component
   - POST to `/api/revenue-entries`
   - Server saves to `revenue_entries` table
   - Database trigger updates `total_revenue` in `tracking_links`
   - Analytics auto-updates

4. **Viewing Analytics**:
   - Dashboard loads → `Analytics` component
   - GET from `/api/tracking-links`
   - Client calculates totals and top performers
   - Displays stats and top 5 revenue generators

## Environment Variables

- `NEXT_PUBLIC_SUPABASE_URL`: Supabase project URL (public)
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`: Supabase anonymous key (public)
- `SUPABASE_SERVICE_ROLE_KEY`: Service role key (server-side only, secret)

## Authentication Flow

1. User signs up → Profile auto-created via trigger
2. Email confirmation (optional, configurable in Supabase)
3. User logs in → Session stored in cookies
4. Middleware refreshes session on each request
5. Protected routes check for valid session

## Database Security

- **Row Level Security (RLS)** enabled on all tables
- Users can only access their own data
- Policies enforce user_id checks on all operations
- Service role key only used server-side for admin operations
