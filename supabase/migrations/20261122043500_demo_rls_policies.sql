-- ============================================================
-- Demo Mode RLS Policies & Auth Seed Compatibility Fix
-- Enables seamless end-to-end RFQ creation/listing in Demo Mode
-- while keeping all schema constraints intact.
-- ============================================================

-- 1. Ensure seeded auth.users have empty strings (not NULL) for GoTrue token columns
UPDATE auth.users
SET
  confirmation_token = COALESCE(confirmation_token, ''),
  recovery_token = COALESCE(recovery_token, ''),
  email_change_token_new = COALESCE(email_change_token_new, ''),
  email_change = COALESCE(email_change, '')
WHERE email LIKE '%@bidplate.com';

-- 2. Demo-friendly RLS policies for anon & authenticated clients
-- Profiles
DROP POLICY IF EXISTS "Demo anon can view profiles" ON public.profiles;
CREATE POLICY "Demo anon can view profiles"
  ON public.profiles FOR SELECT
  TO anon, authenticated
  USING (true);

-- Supplier Catalogs
DROP POLICY IF EXISTS "Demo anon can view supplier catalogs" ON public.supplier_catalogs;
CREATE POLICY "Demo anon can view supplier catalogs"
  ON public.supplier_catalogs FOR SELECT
  TO anon, authenticated
  USING (true);

-- RFQs (View, Create, Update, Delete in Demo Mode)
DROP POLICY IF EXISTS "Demo anon can view rfqs" ON public.rfqs;
CREATE POLICY "Demo anon can view rfqs"
  ON public.rfqs FOR SELECT
  TO anon, authenticated
  USING (true);

DROP POLICY IF EXISTS "Demo anon can insert rfqs" ON public.rfqs;
CREATE POLICY "Demo anon can insert rfqs"
  ON public.rfqs FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

DROP POLICY IF EXISTS "Demo anon can update rfqs" ON public.rfqs;
CREATE POLICY "Demo anon can update rfqs"
  ON public.rfqs FOR UPDATE
  TO anon, authenticated
  USING (true)
  WITH CHECK (true);

-- RFQ Items (View, Create, Update, Delete in Demo Mode)
DROP POLICY IF EXISTS "Demo anon can view rfq_items" ON public.rfq_items;
CREATE POLICY "Demo anon can view rfq_items"
  ON public.rfq_items FOR SELECT
  TO anon, authenticated
  USING (true);

DROP POLICY IF EXISTS "Demo anon can insert rfq_items" ON public.rfq_items;
CREATE POLICY "Demo anon can insert rfq_items"
  ON public.rfq_items FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

DROP POLICY IF EXISTS "Demo anon can update rfq_items" ON public.rfq_items;
CREATE POLICY "Demo anon can update rfq_items"
  ON public.rfq_items FOR UPDATE
  TO anon, authenticated
  USING (true)
  WITH CHECK (true);

-- Bids & Bid Items
DROP POLICY IF EXISTS "Demo anon can view bids" ON public.bids;
CREATE POLICY "Demo anon can view bids"
  ON public.bids FOR SELECT
  TO anon, authenticated
  USING (true);

DROP POLICY IF EXISTS "Demo anon can insert bids" ON public.bids;
CREATE POLICY "Demo anon can insert bids"
  ON public.bids FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

DROP POLICY IF EXISTS "Demo anon can view bid_items" ON public.bid_items;
CREATE POLICY "Demo anon can view bid_items"
  ON public.bid_items FOR SELECT
  TO anon, authenticated
  USING (true);

DROP POLICY IF EXISTS "Demo anon can insert bid_items" ON public.bid_items;
CREATE POLICY "Demo anon can insert bid_items"
  ON public.bid_items FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

-- Contracts & Invoice Audits
DROP POLICY IF EXISTS "Demo anon can view contracts" ON public.contracts;
CREATE POLICY "Demo anon can view contracts"
  ON public.contracts FOR SELECT
  TO anon, authenticated
  USING (true);

DROP POLICY IF EXISTS "Demo anon can view invoice_audits" ON public.invoice_audits;
CREATE POLICY "Demo anon can view invoice_audits"
  ON public.invoice_audits FOR SELECT
  TO anon, authenticated
  USING (true);
