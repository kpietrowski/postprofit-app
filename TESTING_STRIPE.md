# Testing Stripe Connect Integration

This guide will help you test the Stripe Connect OAuth integration.

## Prerequisites

Before testing, you need to set up a Stripe Connect account:

### 1. Create a Stripe Account (if you don't have one)
- Go to https://dashboard.stripe.com/register
- Sign up for a free account
- Verify your email

### 2. Enable Stripe Connect
1. Go to https://dashboard.stripe.com/settings/connect
2. Click **Get Started** with Connect
3. Choose **Platform or Marketplace** integration type
4. Complete the onboarding

### 3. Get Your Connect Credentials

**Client ID:**
1. Go to https://dashboard.stripe.com/settings/applications
2. Find your **Client ID** (starts with `ca_`)
3. Copy it

**API Keys:**
1. Go to https://dashboard.stripe.com/test/apikeys
2. Copy your **Secret key** (starts with `sk_test_`)
3. Copy your **Publishable key** (starts with `pk_test_`)

**Webhook Secret:**
We'll create this after setting up the basic integration.

### 4. Update Your Environment Variables

Edit `.env.local` and replace the placeholder values:

```env
# Replace these with your actual Stripe credentials
STRIPE_SECRET_KEY=sk_test_YOUR_SECRET_KEY_HERE
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_YOUR_PUBLISHABLE_KEY_HERE
STRIPE_CLIENT_ID=ca_YOUR_CLIENT_ID_HERE

# We'll generate this later
STRIPE_WEBHOOK_SECRET=whsec_YOUR_WEBHOOK_SECRET_HERE
```

### 5. Restart the Dev Server

After updating `.env.local`:
```bash
# Kill the current server (Ctrl+C or kill the process)
npm run dev
```

## Testing the Integration

### Step 1: Set Up the Database Schema

**IMPORTANT:** You must run the updated database schema first!

1. Open https://supabase.com/dashboard
2. Go to your project → **SQL Editor**
3. Open the file `supabase-schema.sql` from your project
4. Copy ALL the SQL code
5. Paste it into Supabase SQL Editor
6. Click **Run**
7. Wait for success confirmation

This creates the new tables:
- `payment_connections`
- `webhook_logs`
- Updated `revenue_entries` with new columns

### Step 2: Log Into Your App

1. Open http://localhost:3002
2. Sign up or log in to your account
3. You should see the dashboard

### Step 3: Connect Stripe

1. Click the **⚙️ Settings** button in the dashboard header
2. You'll see the Settings page with payment processor options
3. Click **Connect Stripe**
4. You'll be redirected to Stripe's OAuth page
5. Click **Connect** or **Skip this account form** (for testing)
6. You'll be redirected back to Settings
7. You should see a green "Successfully connected Stripe!" message

### Step 4: Verify the Connection

Check your database to see if the connection was stored:

1. Go to Supabase → **Table Editor** → `payment_connections`
2. You should see a row with:
   - Your user_id
   - provider: 'stripe'
   - account_id: Your Stripe account ID
   - encrypted access_token and refresh_token
   - status: 'active'

## Testing Automatic Revenue Tracking

### Option 1: Using Stripe Test Mode

1. Create a tracking link in your dashboard:
   - Title: "Test Instagram Post"
   - Platform: Instagram
   - Destination: https://yoursite.com
   - UTM Campaign: test_campaign

2. Note the UTM parameters from the generated link

3. Create a test Stripe Checkout Session:
```bash
# You'll need to use Stripe CLI or create a checkout page
stripe checkout sessions create \
  --mode payment \
  --success-url="http://localhost:3002/success" \
  --cancel-url="http://localhost:3002/cancel" \
  --line-items="price_1234,quantity=1" \
  --metadata[utm_source]=instagram \
  --metadata[utm_campaign]=test_campaign
```

4. Complete the test payment with test card: `4242 4242 4242 4242`

5. Check your dashboard - revenue should be automatically tracked!

### Option 2: Set Up Webhooks (for real-time testing)

1. Install Stripe CLI:
```bash
brew install stripe/stripe-cli/stripe
# or download from https://stripe.com/docs/stripe-cli
```

2. Login to Stripe CLI:
```bash
stripe login
```

3. Forward webhooks to your local server:
```bash
stripe listen --forward-to http://localhost:3002/api/webhooks/stripe
```

4. Copy the webhook signing secret that appears (starts with `whsec_`)

5. Update `.env.local`:
```env
STRIPE_WEBHOOK_SECRET=whsec_YOUR_WEBHOOK_SECRET_FROM_ABOVE
```

6. Restart your dev server

7. Create a test payment and watch the webhook logs in your terminal!

## Troubleshooting

### "Connection Error" when connecting Stripe
- Check that your `STRIPE_CLIENT_ID` is correct
- Make sure you enabled Stripe Connect in your dashboard
- Check browser console for errors

### Webhooks not working
- Verify `STRIPE_WEBHOOK_SECRET` is set correctly
- Check that Stripe CLI is running and forwarding
- Look at the `webhook_logs` table in Supabase for error messages

### No revenue entry created
- Check that your tracking link has matching UTM parameters
- Look at `webhook_logs` table to see webhook status
- Verify the checkout session had metadata with UTM parameters

### "No encryption key" error
- Make sure `ENCRYPTION_KEY` is set in `.env.local`
- It should be a 64-character hex string
- Generate one with: `openssl rand -hex 32`

## Next Steps

Once Stripe Connect is working:
1. Test the disconnect functionality
2. Create multiple tracking links
3. Test revenue attribution with different UTM parameters
4. View analytics to see automatic vs manual revenue

Then we can move on to:
- Shopify integration
- Enhanced analytics
- Onboarding wizard
