-- ============================================================
-- Demo RLS Policies for Contracts confirmation, Invoice Audits,
-- and Supplier trust_score updates.
-- ============================================================

-- Contracts: allow INSERT & UPDATE in Demo Mode
DROP POLICY IF EXISTS "Demo anon can insert contracts" ON public.contracts;
CREATE POLICY "Demo anon can insert contracts"
  ON public.contracts FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

DROP POLICY IF EXISTS "Demo anon can update contracts" ON public.contracts;
CREATE POLICY "Demo anon can update contracts"
  ON public.contracts FOR UPDATE
  TO anon, authenticated
  USING (true)
  WITH CHECK (true);

-- Invoice Audits: allow INSERT & UPDATE in Demo Mode
DROP POLICY IF EXISTS "Demo anon can insert invoice_audits" ON public.invoice_audits;
CREATE POLICY "Demo anon can insert invoice_audits"
  ON public.invoice_audits FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

DROP POLICY IF EXISTS "Demo anon can update invoice_audits" ON public.invoice_audits;
CREATE POLICY "Demo anon can update invoice_audits"
  ON public.invoice_audits FOR UPDATE
  TO anon, authenticated
  USING (true)
  WITH CHECK (true);

-- Profiles: allow trust_score UPDATE in Demo Mode
DROP POLICY IF EXISTS "Demo anon can update profiles" ON public.profiles;
CREATE POLICY "Demo anon can update profiles"
  ON public.profiles FOR UPDATE
  TO anon, authenticated
  USING (true)
  WITH CHECK (true);
