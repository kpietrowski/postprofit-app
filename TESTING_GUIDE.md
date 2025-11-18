# Complete Testing Guide - API-First Attribution Platform

This guide will walk you through testing your creator revenue tracking tool end-to-end.

## Prerequisites

Before testing, you need to complete the database setup.

### Step 1: Update Database Schema

**CRITICAL**: Run the updated schema in Supabase!

1. Open https://supabase.com/dashboard
2. Go to your project → **SQL Editor**
3. Click **New query**
4. Open `supabase-schema.sql` from your project
5. Copy ALL the SQL code (it's been updated with api_keys table)
6. Paste into Supabase SQL Editor
7. Click **Run**
8. Verify success

This creates:
- ✅ `api_keys` table (for JavaScript SDK authentication)
- ✅ Updated `revenue_entries` with processor fields
- ✅ `payment_connections` and `webhook_logs` tables
- ✅ Automatic API key generation on signup

---

## Your Use Case: Testing the Full Flow

### Scenario: ManyChat + Stripe Checkout

**What you're building:**
1. Instagram video → ManyChat auto-reply with tracking link
2. Customer clicks → goes to your Stripe checkout
3. Customer purchases → revenue automatically attributed to video

---

## Testing Flow

### Part 1: Initial Setup (One Time)

**1. Sign Up / Login**
```
Visit: http://localhost:3002
Create account or login
```

**2. Get Your Setup Info**
```
Click: 🚀 Setup button in dashboard
You'll see:
- Your API Key (sk_live_...)
- JavaScript tracking snippet
```

**3. Install Tracking Snippet on Your Site**

Add this to your website (before `</body>`):
```html
<script src="http://localhost:3002/track.js" data-api-key="YOUR_API_KEY_HERE"></script>
```

**Where to add it:**
- **Local testing**: Add to your HTML file
- **WordPress**: Use "Insert Headers and Footers" plugin
- **Custom site**: In your HTML template footer

**4. Connect Stripe**
```
Dashboard → ⚙️ Settings → Connect Stripe
Follow OAuth flow
```

---

### Part 2: Create a Campaign

**1. Create Your First Tracking Link**
```
Dashboard → "Create Campaign Link"

Fill in:
- Campaign Title: "Wedding Reel Nov 18"
- Platform: Instagram
- Your Website URL: https://weddings.chatoptimized.io
  (or http://localhost:3000 if testing locally)

Click: Generate Tracking Link
```

**2. Copy the Generated Link**
```
You'll get something like:
https://weddings.chatoptimized.io?utm_campaign=camp_abc123

Copy this link!
```

---

### Part 3: Test with ManyChat

**Option A: ManyChat Auto-Reply**
1. Go to ManyChat → Automation
2. Create "DM Reply" automation
3. Add text message with your tracking link
4. Test by DMing yourself on Instagram

**Option B: Boosted Post Button**
1. Instagram → Boost post
2. Add CTA button
3. Paste your tracking link as button URL
4. (Don't actually boost, just test the flow)

---

### Part 4: Test the Purchase Flow

**Method 1: Direct Testing (Easiest)**

1. **Open the tracking link in browser**
   ```
   Paste your generated link:
   https://weddings.chatoptimized.io?utm_campaign=camp_abc123
   ```

2. **Check JavaScript console**
   ```
   Open browser DevTools → Console
   You should see:
   "[RevenueTracker] Campaign parameters captured: {utm_campaign: 'camp_abc123'}"
   ```

3. **Go to your Stripe checkout page**
   - The JavaScript SDK should have captured the campaign
   - Proceed to checkout

4. **Complete test purchase**
   ```
   Use Stripe test card: 4242 4242 4242 4242
   Any future expiry date
   Any CVC
   ```

5. **Check your dashboard**
   ```
   Refresh dashboard
   You should see revenue attributed to "Wedding Reel Nov 18"
   ```

**Method 2: Manual API Test**

If you want to test without actual Stripe checkout:

```bash
curl -X POST http://localhost:3002/api/v1/track/purchase \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_API_KEY" \
  -d '{
    "utm_campaign": "camp_abc123",
    "amount": 99.00,
    "customer_id": "test_customer",
    "metadata": {
      "description": "Test purchase"
    }
  }'
```

---

### Part 5: Verify Everything Works

**Check 1: API Key Generated**
```
Supabase Dashboard → Table Editor → api_keys
Should see one row with your user_id
```

**Check 2: Campaign Created**
```
Supabase Dashboard → Table Editor → tracking_links
Should see your "Wedding Reel Nov 18" campaign
```

**Check 3: Revenue Entry Created**
```
Supabase Dashboard → Table Editor → revenue_entries
Should see entry with:
- tracking_link_id matching your campaign
- amount = your test purchase amount
- source = 'automatic'
- processor = 'api' or 'stripe'
```

**Check 4: Dashboard Shows Revenue**
```
Your Dashboard → Analytics
Should show:
- Total Revenue updated
- Campaign listed with revenue amount
```

---

## Troubleshooting

### "No campaign data found in cookie"

**Problem**: JavaScript SDK didn't capture UTM parameters

**Solution**:
1. Make sure you opened the link with `?utm_campaign=camp_xyz` in URL
2. Check browser console for SDK messages
3. Verify snippet is installed correctly (view page source)
4. Try in incognito window (clear cookies)

### "No matching campaign found"

**Problem**: UTM parameter doesn't match any campaign

**Solution**:
1. Check the utm_campaign value in Supabase `tracking_links` table
2. Make sure it matches what's in your URL
3. Campaign IDs are auto-generated (like `camp_abc123`)

### "Invalid API key"

**Problem**: API key not found or incorrect

**Solution**:
1. Check `api_keys` table in Supabase has a row
2. Copy the full `key_prefix` value
3. Make sure it starts with `sk_live_`
4. If missing, sign up a new test account

### Revenue not showing in dashboard

**Problem**: Entry created but dashboard not updating

**Solution**:
1. Hard refresh the page (Cmd+Shift+R)
2. Check `revenue_entries` table has the entry
3. Check `tracking_link_id` matches your campaign
4. Look at browser console for errors

### Stripe webhook not working

**Problem**: Purchases through Stripe aren't being tracked

**Solution**:
1. Make sure you connected Stripe via OAuth
2. Check `payment_connections` table has active connection
3. For local testing, use Stripe CLI to forward webhooks:
   ```bash
   stripe listen --forward-to http://localhost:3002/api/webhooks/stripe
   ```
4. Update `STRIPE_WEBHOOK_SECRET` in `.env.local`

---

## Testing Checklist

- [ ] Database schema updated in Supabase
- [ ] Can login to app
- [ ] API key visible in Setup page
- [ ] JavaScript snippet copied
- [ ] Snippet installed on website
- [ ] Stripe connected via OAuth
- [ ] Campaign created successfully
- [ ] Tracking link copied
- [ ] Tracking link captures UTM in browser
- [ ] Test purchase completes
- [ ] Revenue appears in dashboard
- [ ] Can see entry in Supabase

---

## Next Steps After Testing

Once everything works:

1. **Deploy to Production**
   - Push to GitHub
   - Deploy to Vercel
   - Update tracking snippet URL to production domain

2. **Update Environment Variables**
   - Use production Stripe keys
   - Update `NEXT_PUBLIC_APP_URL`

3. **Real Usage**
   - Create campaigns for actual videos
   - Use links in real ManyChat flows
   - Track actual revenue!

---

## Support

If you encounter issues:
- Check browser console for JavaScript errors
- Check Supabase logs for database errors
- Check `webhook_logs` table for webhook failures
- Verify all environment variables are set

Good luck! 🚀
