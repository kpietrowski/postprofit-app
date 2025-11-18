-- Creator Revenue Tracking Tool Database Schema
-- Run this in your Supabase SQL Editor

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Profiles table (extends Supabase auth.users)
CREATE TABLE IF NOT EXISTS profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  email TEXT,
  full_name TEXT,
  avatar_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Profiles policies
CREATE POLICY "Users can view their own profile"
  ON profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile"
  ON profiles FOR UPDATE
  USING (auth.uid() = id);

CREATE POLICY "Users can insert their own profile"
  ON profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

-- Tracking Links table
CREATE TABLE IF NOT EXISTS tracking_links (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  platform TEXT NOT NULL CHECK (platform IN ('instagram', 'tiktok', 'youtube', 'twitter', 'other')),
  destination_url TEXT NOT NULL,
  utm_source TEXT,
  utm_medium TEXT,
  utm_campaign TEXT,
  utm_term TEXT,
  utm_content TEXT,
  short_code TEXT UNIQUE,
  full_tracking_url TEXT NOT NULL,
  clicks INTEGER DEFAULT 0,
  total_revenue DECIMAL(10, 2) DEFAULT 0.00,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE tracking_links ENABLE ROW LEVEL SECURITY;

-- Tracking Links policies
CREATE POLICY "Users can view their own tracking links"
  ON tracking_links FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own tracking links"
  ON tracking_links FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own tracking links"
  ON tracking_links FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own tracking links"
  ON tracking_links FOR DELETE
  USING (auth.uid() = user_id);

-- Payment Connections table (for multi-tenant payment processor connections)
CREATE TABLE IF NOT EXISTS payment_connections (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  provider TEXT NOT NULL CHECK (provider IN ('stripe', 'shopify', 'paypal', 'square')),
  account_id TEXT NOT NULL,
  access_token TEXT, -- Encrypted
  refresh_token TEXT, -- Encrypted
  scope TEXT,
  token_type TEXT,
  expires_at TIMESTAMP WITH TIME ZONE,
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'error')),
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, provider, account_id)
);

-- Enable Row Level Security
ALTER TABLE payment_connections ENABLE ROW LEVEL SECURITY;

-- Payment Connections policies
CREATE POLICY "Users can view their own payment connections"
  ON payment_connections FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own payment connections"
  ON payment_connections FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own payment connections"
  ON payment_connections FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own payment connections"
  ON payment_connections FOR DELETE
  USING (auth.uid() = user_id);

-- Webhook Logs table (for debugging and monitoring)
CREATE TABLE IF NOT EXISTS webhook_logs (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  connection_id UUID REFERENCES payment_connections(id) ON DELETE CASCADE,
  provider TEXT NOT NULL,
  event_type TEXT NOT NULL,
  event_id TEXT,
  payload JSONB,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'processed', 'failed', 'ignored')),
  error_message TEXT,
  revenue_entry_id UUID REFERENCES revenue_entries(id),
  processed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE webhook_logs ENABLE ROW LEVEL SECURITY;

-- Webhook Logs policies (users can view logs for their connections)
CREATE POLICY "Users can view their own webhook logs"
  ON webhook_logs FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM payment_connections
      WHERE payment_connections.id = webhook_logs.connection_id
      AND payment_connections.user_id = auth.uid()
    )
  );

-- Revenue Entries table (updated with payment processor fields)
CREATE TABLE IF NOT EXISTS revenue_entries (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  tracking_link_id UUID REFERENCES tracking_links(id) ON DELETE CASCADE NOT NULL,
  amount DECIMAL(10, 2) NOT NULL CHECK (amount >= 0),
  description TEXT,
  source TEXT DEFAULT 'manual' CHECK (source IN ('manual', 'automatic')),
  processor TEXT CHECK (processor IN ('stripe', 'shopify', 'paypal', 'square', 'manual')),
  stripe_payment_id TEXT,
  shopify_order_id TEXT,
  paypal_transaction_id TEXT,
  payment_connection_id UUID REFERENCES payment_connections(id) ON DELETE SET NULL,
  entry_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(stripe_payment_id),
  UNIQUE(shopify_order_id)
);

-- Enable Row Level Security
ALTER TABLE revenue_entries ENABLE ROW LEVEL SECURITY;

-- Revenue Entries policies
CREATE POLICY "Users can view their own revenue entries"
  ON revenue_entries FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own revenue entries"
  ON revenue_entries FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own revenue entries"
  ON revenue_entries FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own revenue entries"
  ON revenue_entries FOR DELETE
  USING (auth.uid() = user_id);

-- Function to update tracking_links total_revenue
CREATE OR REPLACE FUNCTION update_tracking_link_revenue()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE tracking_links
  SET total_revenue = (
    SELECT COALESCE(SUM(amount), 0)
    FROM revenue_entries
    WHERE tracking_link_id = NEW.tracking_link_id
  ),
  updated_at = NOW()
  WHERE id = NEW.tracking_link_id;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to update total_revenue when revenue_entry is added/updated
CREATE TRIGGER update_link_revenue_on_insert
  AFTER INSERT ON revenue_entries
  FOR EACH ROW
  EXECUTE FUNCTION update_tracking_link_revenue();

CREATE TRIGGER update_link_revenue_on_update
  AFTER UPDATE ON revenue_entries
  FOR EACH ROW
  EXECUTE FUNCTION update_tracking_link_revenue();

-- Function to update total_revenue when revenue_entry is deleted
CREATE OR REPLACE FUNCTION update_tracking_link_revenue_on_delete()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE tracking_links
  SET total_revenue = (
    SELECT COALESCE(SUM(amount), 0)
    FROM revenue_entries
    WHERE tracking_link_id = OLD.tracking_link_id
  ),
  updated_at = NOW()
  WHERE id = OLD.tracking_link_id;

  RETURN OLD;
END;
$$ LANGUAGE plpgsql;

-- Trigger to update total_revenue when revenue_entry is deleted
CREATE TRIGGER update_link_revenue_on_delete
  AFTER DELETE ON revenue_entries
  FOR EACH ROW
  EXECUTE FUNCTION update_tracking_link_revenue_on_delete();

-- Function to automatically create profile on user signup
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO profiles (id, email, full_name)
  VALUES (NEW.id, NEW.email, NEW.raw_user_meta_data->>'full_name');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to create profile on signup
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION handle_new_user();

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_tracking_links_user_id ON tracking_links(user_id);
CREATE INDEX IF NOT EXISTS idx_tracking_links_created_at ON tracking_links(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_revenue_entries_user_id ON revenue_entries(user_id);
CREATE INDEX IF NOT EXISTS idx_revenue_entries_tracking_link_id ON revenue_entries(tracking_link_id);
CREATE INDEX IF NOT EXISTS idx_revenue_entries_entry_date ON revenue_entries(entry_date DESC);
CREATE INDEX IF NOT EXISTS idx_revenue_entries_stripe_payment_id ON revenue_entries(stripe_payment_id);
CREATE INDEX IF NOT EXISTS idx_revenue_entries_shopify_order_id ON revenue_entries(shopify_order_id);
CREATE INDEX IF NOT EXISTS idx_revenue_entries_source ON revenue_entries(source);
CREATE INDEX IF NOT EXISTS idx_payment_connections_user_id ON payment_connections(user_id);
CREATE INDEX IF NOT EXISTS idx_payment_connections_provider ON payment_connections(provider);
CREATE INDEX IF NOT EXISTS idx_payment_connections_status ON payment_connections(status);
CREATE INDEX IF NOT EXISTS idx_webhook_logs_connection_id ON webhook_logs(connection_id);
CREATE INDEX IF NOT EXISTS idx_webhook_logs_status ON webhook_logs(status);
CREATE INDEX IF NOT EXISTS idx_webhook_logs_created_at ON webhook_logs(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_webhook_logs_event_id ON webhook_logs(event_id);
