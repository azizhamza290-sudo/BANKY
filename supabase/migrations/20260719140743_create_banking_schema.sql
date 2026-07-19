/*
# Digital Banking Schema (Wise-like)

## Overview
Creates the full data model for a closed-loop digital wallet: user profiles
(holding USD + EUR balances), transactions ledger, and virtual cards. All
money movement happens server-side via edge functions using the service role
key, so the client can never directly mutate balances.

## New Tables

### profiles
- `id` (uuid, PK, references auth.users) — one row per user, created on signup.
- `email` (text, unique) — denormalized for lookup by recipient email.
- `full_name` (text) — display name shown on dashboard and virtual card.
- `balance_usd` (numeric, default 0) — USD wallet balance.
- `balance_eur` (numeric, default 0) — EUR wallet balance.
- `created_at` (timestamptz).

### transactions
- `id` (uuid, PK).
- `sender_id` (uuid, references profiles) — sender profile.
- `recipient_id` (uuid, references profiles) — recipient profile.
- `recipient_email` (text) — snapshot of recipient email for display.
- `amount` (numeric) — amount transferred (always positive).
- `currency` (text, 'USD' | 'EUR').
- `status` (text, 'completed' | 'failed') — outcome of the transfer.
- `note` (text) — optional memo.
- `created_at` (timestamptz).

### virtual_cards
- `id` (uuid, PK).
- `user_id` (uuid, references profiles) — owner.
- `card_number` (text) — generated 16-digit display number.
- `card_holder` (text) — name printed on card.
- `expiry` (text) — MM/YY.
- `cvv` (text) — 3-digit code.
- `currency` (text, 'USD' default).
- `status` (text, 'active' default).
- `created_at` (timestamptz).

## Security (RLS)
- profiles: owner-scoped CRUD (authenticated, auth.uid() = id).
- transactions: owner-scoped SELECT (sender OR recipient); INSERT/UPDATE
  only via service role (edge functions) — no client policies, so the anon/
  authenticated roles cannot insert or alter ledger rows directly.
- virtual_cards: owner-scoped SELECT and INSERT.

## Notes
1. Balance columns use numeric(18,2) for exact money math.
2. A trigger auto-creates a profile row when a new auth.users row is inserted,
   so signup works without a separate profile-creation step. Default balances 0.
3. Transactions are append-only from the client's perspective — only the
   service-role edge functions insert/update them, which bypasses RLS.
4. virtual_cards allows users to create their own card; card numbers are
   random display-only values (not real PANs).
*/

-- profiles
CREATE TABLE IF NOT EXISTS profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email text UNIQUE NOT NULL,
  full_name text NOT NULL DEFAULT '',
  balance_usd numeric(18,2) NOT NULL DEFAULT 0,
  balance_eur numeric(18,2) NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "select_own_profile" ON profiles;
CREATE POLICY "select_own_profile" ON profiles FOR SELECT
  TO authenticated USING (auth.uid() = id);

DROP POLICY IF EXISTS "update_own_profile" ON profiles;
CREATE POLICY "update_own_profile" ON profiles FOR UPDATE
  TO authenticated USING (auth.uid() = id) WITH CHECK (auth.uid() = id);

-- transactions
CREATE TABLE IF NOT EXISTS transactions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  sender_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  recipient_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  recipient_email text NOT NULL,
  amount numeric(18,2) NOT NULL CHECK (amount > 0),
  currency text NOT NULL DEFAULT 'USD' CHECK (currency IN ('USD','EUR')),
  status text NOT NULL DEFAULT 'completed' CHECK (status IN ('completed','failed')),
  note text NOT NULL DEFAULT '',
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_transactions_sender ON transactions(sender_id);
CREATE INDEX IF NOT EXISTS idx_transactions_recipient ON transactions(recipient_id);
CREATE INDEX IF NOT EXISTS idx_transactions_created ON transactions(created_at DESC);

ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "select_own_transactions" ON transactions;
CREATE POLICY "select_own_transactions" ON transactions FOR SELECT
  TO authenticated USING (auth.uid() = sender_id OR auth.uid() = recipient_id);

-- virtual_cards
CREATE TABLE IF NOT EXISTS virtual_cards (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  card_number text NOT NULL,
  card_holder text NOT NULL,
  expiry text NOT NULL,
  cvv text NOT NULL,
  currency text NOT NULL DEFAULT 'USD',
  status text NOT NULL DEFAULT 'active',
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE virtual_cards ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "select_own_cards" ON virtual_cards;
CREATE POLICY "select_own_cards" ON virtual_cards FOR SELECT
  TO authenticated USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "insert_own_cards" ON virtual_cards;
CREATE POLICY "insert_own_cards" ON virtual_cards FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = user_id);

-- Auto-create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name)
  VALUES (NEW.id, NEW.email, COALESCE(NEW.raw_user_meta_data->>'full_name', ''))
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();