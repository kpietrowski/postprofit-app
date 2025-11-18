# Quick Setup Guide

Follow these steps to get your Creator Revenue Tracker up and running.

## Step 1: Set Up Supabase Database

**IMPORTANT**: You must run the SQL schema before using the application.

1. Open your Supabase project dashboard at [https://supabase.com](https://supabase.com)
2. Navigate to **SQL Editor** (in the left sidebar)
3. Click **New query**
4. Open the file `supabase-schema.sql` from this project
5. Copy all the SQL code
6. Paste it into the SQL Editor
7. Click **Run** (or press Cmd/Ctrl + Enter)
8. Wait for the success message confirming all tables and triggers were created

The schema creates:
- ✅ `profiles` table for user profiles
- ✅ `tracking_links` table for your tracking links
- ✅ `revenue_entries` table for revenue records
- ✅ Row Level Security (RLS) policies
- ✅ Automatic triggers for revenue calculation
- ✅ Indexes for better performance

## Step 2: Verify Environment Variables

Your environment variables are already configured in `.env.local`:
- ✅ `NEXT_PUBLIC_SUPABASE_URL`
- ✅ `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- ✅ `SUPABASE_SERVICE_ROLE_KEY`

## Step 3: Start the Development Server

```bash
npm run dev
```

The application will start on [http://localhost:3000](http://localhost:3000) (or another port if 3000 is in use)

## Step 4: Create Your Account

1. Open the application in your browser
2. Click **Get Started** or navigate to `/signup`
3. Fill in your details:
   - Full Name
   - Email
   - Password (minimum 6 characters)
4. Click **Create Account**

**Note**: If email confirmation is enabled in Supabase, check your email to verify your account. Otherwise, you'll be logged in automatically.

## Step 5: Start Tracking

Once logged in, you can:

1. **Create a Tracking Link**:
   - Fill in the content title (e.g., "Morning Routine Video")
   - Select the platform (Instagram, TikTok, YouTube, etc.)
   - Enter your destination URL
   - Customize UTM parameters if needed
   - Click "Generate Tracking Link"
   - Copy the link and use it in your social media content

2. **Track Revenue**:
   - When you make a sale, select the content that drove it
   - Enter the revenue amount
   - Add optional notes
   - Click "Add Revenue"

3. **View Analytics**:
   - See your total revenue
   - Identify your top-performing content
   - Track revenue by platform

## Troubleshooting

### "Unauthorized" Error
- Make sure you've run the SQL schema in Supabase
- Check that RLS policies were created correctly
- Try logging out and logging back in

### Pages Not Loading
- Verify your Supabase URL and keys in `.env.local`
- Check the browser console for errors
- Make sure the development server is running

### Can't Create Links or Revenue
- Confirm the database tables were created
- Check that you're logged in
- Verify the API routes are working by checking the Network tab in browser DevTools

## Next Steps

- Customize the styling in `tailwind.config.ts` and component files
- Add more platforms to the platform dropdown
- Deploy to Vercel for production use
- Set up email confirmation in Supabase Auth settings

## Support

If you encounter issues:
1. Check the browser console for error messages
2. Check the terminal where the dev server is running
3. Verify all SQL tables and policies were created in Supabase
4. Make sure your Supabase project has the authentication provider enabled

Enjoy tracking your creator revenue! 🚀
