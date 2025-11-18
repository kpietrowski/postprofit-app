# Creator Revenue Tracking Tool

A web application that helps content creators track which social media videos and posts drive sales through custom UTM tracking links and manual revenue tracking.

## Features

- **Custom UTM Tracking Links**: Generate tracking links for each video/post with automatic UTM parameter generation
- **Revenue Tracking**: Manually track revenue from each link
- **Analytics Dashboard**: View total revenue, top-performing content, and revenue breakdown by platform
- **Copy-to-Clipboard**: Easily copy links to use in Instagram, TikTok, YouTube descriptions
- **Mobile-Responsive Design**: Works seamlessly on desktop and mobile devices
- **Secure Authentication**: Sign up/login with Supabase Auth

## Tech Stack

- **Framework**: Next.js 15 (App Router)
- **Backend/Database**: Supabase (PostgreSQL + REST API)
- **Styling**: Tailwind CSS
- **Auth**: Supabase Auth
- **Language**: TypeScript

## Setup Instructions

### 1. Database Setup

1. Go to your Supabase project dashboard
2. Navigate to the SQL Editor
3. Copy and paste the contents of `supabase-schema.sql`
4. Run the SQL script to create all tables, policies, and triggers

### 2. Environment Variables

The environment variables are already configured in `.env.local`:
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`

### 3. Install Dependencies

Dependencies are already installed, but if needed:

```bash
npm install
```

### 4. Run the Development Server

```bash
npm run dev
```

The application will be available at [http://localhost:3000](http://localhost:3000)

## Usage Guide

### 1. Sign Up / Login

- Visit `/signup` to create a new account
- Or visit `/login` to sign in to an existing account

### 2. Create Tracking Links

1. Go to the Dashboard
2. Fill in the "Create Tracking Link" form:
   - **Content Title**: Name of your video/post (e.g., "Morning Routine Video")
   - **Platform**: Choose from Instagram, TikTok, YouTube, Twitter, or Other
   - **Destination URL**: Your product/landing page URL
   - **UTM Parameters** (optional): Auto-generated from platform and title, or customize
3. Click "Generate Tracking Link"
4. Copy the generated link and use it in your social media content

### 3. Track Revenue

1. When you make a sale, go to the "Track Revenue" section
2. Select the content that drove the sale
3. Enter the revenue amount
4. Add optional notes/description
5. Click "Add Revenue"

### 4. View Analytics

The dashboard shows:
- **Total Revenue**: Sum of all revenue tracked
- **Tracking Links**: Total number of links created
- **Top Performer**: Content that generated the most revenue
- **Top 5 Revenue Generators**: List of your best-performing content

### 5. Manage Links

- View all your tracking links in the "Your Tracking Links" section
- Copy any link to clipboard with one click
- Delete links you no longer need

## Database Schema

### Tables

1. **profiles**: User profiles (extends auth.users)
2. **tracking_links**: Custom tracking links with UTM parameters
3. **revenue_entries**: Revenue records linked to tracking links

### Key Features

- **Row Level Security (RLS)**: Users can only access their own data
- **Automatic Revenue Calculation**: Triggers update total_revenue when entries are added/modified
- **Automatic Profile Creation**: Profiles are created automatically on user signup

## API Endpoints

### Tracking Links

- `GET /api/tracking-links` - Get all links
- `POST /api/tracking-links` - Create new link
- `GET /api/tracking-links/[id]` - Get single link
- `PATCH /api/tracking-links/[id]` - Update link
- `DELETE /api/tracking-links/[id]` - Delete link

### Revenue Entries

- `GET /api/revenue-entries` - Get all entries (optionally filter by tracking_link_id)
- `POST /api/revenue-entries` - Create new entry
- `GET /api/revenue-entries/[id]` - Get single entry
- `PATCH /api/revenue-entries/[id]` - Update entry
- `DELETE /api/revenue-entries/[id]` - Delete entry

## Deployment

To deploy to Vercel:

1. Push your code to GitHub
2. Import the project in Vercel
3. Add environment variables in Vercel dashboard
4. Deploy

## Future Enhancements

- URL shortening integration
- Export data to CSV
- Charts and graphs for revenue trends
- Email notifications for sales milestones
- Integration with Google Analytics
- Automatic click tracking via redirect page
- Multi-currency support

## Support

For issues or questions, please contact support or refer to the documentation.
