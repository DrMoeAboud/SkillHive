/*
# Add listings, swaps tables and auto-profile creation trigger

1. New Tables
- `listings` — skill listings (offer/want/course) with title, description, tags, price, featured flag, online flag
- `swaps` — skill swap requests between two users with status tracking

2. New Functions
- `handle_new_user()` — SECURITY DEFINER trigger function that auto-creates a profile row when a new auth.users row is inserted, pulling name from user_metadata
- `get_listing_count(user_uuid)` — returns the number of listings a user has created

3. New Triggers
- `on_auth_user_created` — fires after INSERT on auth.users, calls handle_new_user()

4. Security
- RLS enabled on listings and swaps
- listings: anyone can view (SELECT to anon+authenticated), owner can INSERT/UPDATE/DELETE
- swaps: participants can view/update, initiator can insert
- handle_new_user is SECURITY DEFINER with search_path set, EXECUTE revoked from PUBLIC/anon, granted to authenticated

5. Notes
- The profiles table already exists from a prior migration; this adds the auto-creation trigger
- Listings table uses gen_random_uuid() for IDs (no sequence grant needed)
- Tags stored as text[] array
*/

-- =====================
-- LISTINGS TABLE
-- =====================
CREATE TABLE IF NOT EXISTS listings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL DEFAULT auth.uid() REFERENCES profiles(id) ON DELETE CASCADE,
  kind text NOT NULL DEFAULT 'offer' CHECK (kind IN ('offer', 'want', 'course')),
  title text NOT NULL,
  description text NOT NULL DEFAULT '',
  tags text[] NOT NULL DEFAULT '{}',
  price numeric NOT NULL DEFAULT 0,
  is_featured boolean NOT NULL DEFAULT false,
  is_online boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE listings ENABLE ROW LEVEL SECURITY;

GRANT SELECT ON listings TO authenticated;
GRANT INSERT, UPDATE, DELETE ON listings TO authenticated;

DROP POLICY IF EXISTS "Anyone can view listings" ON listings;
CREATE POLICY "Anyone can view listings"
  ON listings FOR SELECT TO authenticated USING (true);

DROP POLICY IF EXISTS "Users can insert own listings" ON listings;
CREATE POLICY "Users can insert own listings"
  ON listings FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own listings" ON listings;
CREATE POLICY "Users can update own listings"
  ON listings FOR UPDATE TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete own listings" ON listings;
CREATE POLICY "Users can delete own listings"
  ON listings FOR DELETE TO authenticated USING (auth.uid() = user_id);

CREATE INDEX IF NOT EXISTS idx_listings_user_id ON listings(user_id);
CREATE INDEX IF NOT EXISTS idx_listings_kind ON listings(kind);
CREATE INDEX IF NOT EXISTS idx_listings_featured ON listings(is_featured);

-- =====================
-- SWAPS TABLE
-- =====================
CREATE TABLE IF NOT EXISTS swaps (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_a_id uuid NOT NULL DEFAULT auth.uid() REFERENCES profiles(id) ON DELETE CASCADE,
  user_b_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  listing_a_id uuid REFERENCES listings(id) ON DELETE SET NULL,
  listing_b_id uuid REFERENCES listings(id) ON DELETE SET NULL,
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'completed', 'rejected')),
  price numeric NOT NULL DEFAULT 0,
  platform_fee numeric NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  completed_at timestamptz
);

ALTER TABLE swaps ENABLE ROW LEVEL SECURITY;

GRANT SELECT, INSERT, UPDATE ON swaps TO authenticated;

DROP POLICY IF EXISTS "Users can view own swaps" ON swaps;
CREATE POLICY "Users can view own swaps"
  ON swaps FOR SELECT TO authenticated
  USING (auth.uid() = user_a_id OR auth.uid() = user_b_id);

DROP POLICY IF EXISTS "Users can insert own swaps" ON swaps;
CREATE POLICY "Users can insert own swaps"
  ON swaps FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_a_id);

DROP POLICY IF EXISTS "Users can update own swaps" ON swaps;
CREATE POLICY "Users can update own swaps"
  ON swaps FOR UPDATE TO authenticated
  USING (auth.uid() = user_a_id OR auth.uid() = user_b_id)
  WITH CHECK (auth.uid() = user_a_id OR auth.uid() = user_b_id);

CREATE INDEX IF NOT EXISTS idx_swaps_user_a_id ON swaps(user_a_id);
CREATE INDEX IF NOT EXISTS idx_swaps_user_b_id ON swaps(user_b_id);
CREATE INDEX IF NOT EXISTS idx_swaps_status ON swaps(status);

-- =====================
-- AUTO-PROFILE CREATION TRIGGER
-- =====================
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, username, bio, location)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'name', ''),
    COALESCE(NEW.raw_user_meta_data->>'username', split_part(NEW.email, '@', 1)),
    '',
    ''
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$;

REVOKE EXECUTE ON FUNCTION public.handle_new_user() FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.handle_new_user() TO authenticated;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- =====================
-- LISTING COUNT HELPER
-- =====================
CREATE OR REPLACE FUNCTION public.get_listing_count(user_uuid uuid)
RETURNS integer
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT count(*)::integer FROM listings WHERE listings.user_id = user_uuid;
$$;

REVOKE EXECUTE ON FUNCTION public.get_listing_count(uuid) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.get_listing_count(uuid) TO authenticated;

-- =====================
-- GRANT anon SELECT on public-read tables
-- The frontend anon-key client needs SELECT on public tables for browse listings, feed, profiles
-- =====================
GRANT SELECT ON profiles TO anon;
GRANT SELECT ON user_skills TO anon;
GRANT SELECT ON wanted_skills TO anon;
GRANT SELECT ON listings TO anon;
GRANT SELECT ON feed_posts TO anon;
GRANT SELECT ON ratings TO anon;
GRANT SELECT ON badges TO anon;

DROP POLICY IF EXISTS "Anyone can view profiles" ON profiles;
CREATE POLICY "Anyone can view profiles"
  ON profiles FOR SELECT TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "Anyone can view user skills" ON user_skills;
CREATE POLICY "Anyone can view user skills"
  ON user_skills FOR SELECT TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "Anyone can view wanted skills" ON wanted_skills;
CREATE POLICY "Anyone can view wanted skills"
  ON wanted_skills FOR SELECT TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "Anyone can view listings (anon)" ON listings;
CREATE POLICY "Anyone can view listings (anon)"
  ON listings FOR SELECT TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "Anyone can view feed posts (anon)" ON feed_posts;
CREATE POLICY "Anyone can view feed posts (anon)"
  ON feed_posts FOR SELECT TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "Anyone can view ratings (anon)" ON ratings;
CREATE POLICY "Anyone can view ratings (anon)"
  ON ratings FOR SELECT TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "Anyone can view badges (anon)" ON badges;
CREATE POLICY "Anyone can view badges (anon)"
  ON badges FOR SELECT TO anon, authenticated USING (true);
