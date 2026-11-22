-- ============================================================
-- Admin Mode RLS Policies, Virtual Supplier Creation RPC,
-- and Seeded Virtual Suppliers (is_admin_managed = true)
-- ============================================================

-- 1. Demo RLS Policies for standard_items & supplier_catalogs (Admin CRUD)
DROP POLICY IF EXISTS "Demo anon can manage standard_items" ON public.standard_items;
CREATE POLICY "Demo anon can manage standard_items"
  ON public.standard_items FOR ALL
  TO anon, authenticated
  USING (true)
  WITH CHECK (true);

DROP POLICY IF EXISTS "Demo anon can manage supplier_catalogs" ON public.supplier_catalogs;
CREATE POLICY "Demo anon can manage supplier_catalogs"
  ON public.supplier_catalogs FOR ALL
  TO anon, authenticated
  USING (true)
  WITH CHECK (true);

-- 2. SECURITY DEFINER RPC to create virtual suppliers (is_admin_managed = true)
-- Safely creates matching auth.users row so profiles.id FK constraint is satisfied.
CREATE OR REPLACE FUNCTION public.create_virtual_supplier(
  p_company_name text,
  p_business_number text DEFAULT '',
  p_address text DEFAULT '',
  p_delivery_regions jsonb DEFAULT '[]'::jsonb,
  p_trust_score numeric DEFAULT 100.0
)
RETURNS public.profiles
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, auth, extensions
AS $$
DECLARE
  v_id uuid := gen_random_uuid();
  v_email text;
  v_profile public.profiles;
BEGIN
  v_email := 'virtual_' || replace(v_id::text, '-', '') || '@bidplate.local';

  INSERT INTO auth.users (
    id,
    instance_id,
    aud,
    role,
    email,
    encrypted_password,
    email_confirmed_at,
    confirmation_token,
    recovery_token,
    email_change_token_new,
    email_change,
    raw_app_meta_data,
    raw_user_meta_data,
    created_at,
    updated_at
  ) VALUES (
    v_id,
    '00000000-0000-0000-0000-000000000000',
    'authenticated',
    'authenticated',
    v_email,
    extensions.crypt('virtual-managed-only', extensions.gen_salt('bf')),
    now(),
    '',
    '',
    '',
    '',
    '{"provider":"email","providers":["email"]}'::jsonb,
    jsonb_build_object(
      'role', 'SUPPLIER',
      'company_name', p_company_name,
      'is_admin_managed', true
    ),
    now(),
    now()
  );

  INSERT INTO public.profiles (
    id,
    role,
    company_name,
    business_number,
    address,
    delivery_regions,
    is_admin_managed,
    trust_score
  ) VALUES (
    v_id,
    'SUPPLIER',
    p_company_name,
    NULLIF(p_business_number, ''),
    NULLIF(p_address, ''),
    COALESCE(p_delivery_regions, '[]'::jsonb),
    true,
    COALESCE(p_trust_score, 100.0)
  )
  ON CONFLICT (id) DO UPDATE SET
    role = 'SUPPLIER',
    company_name = EXCLUDED.company_name,
    business_number = EXCLUDED.business_number,
    address = EXCLUDED.address,
    delivery_regions = EXCLUDED.delivery_regions,
    is_admin_managed = true,
    trust_score = EXCLUDED.trust_score
  RETURNING * INTO v_profile;

  RETURN v_profile;
END;
$$;

GRANT EXECUTE ON FUNCTION public.create_virtual_supplier(text, text, text, jsonb, numeric)
  TO anon, authenticated;

-- 3. Seed 2 ready-to-use Admin-managed Virtual Suppliers for immediate demo testing
INSERT INTO auth.users (
  id, instance_id, aud, role, email, encrypted_password, email_confirmed_at,
  confirmation_token, recovery_token, email_change_token_new, email_change,
  raw_app_meta_data, raw_user_meta_data, created_at, updated_at
) VALUES
  (
    'd0000000-0000-0000-0000-000000000001',
    '00000000-0000-0000-0000-000000000000',
    'authenticated', 'authenticated',
    'virtual_cheongju_local@bidplate.local',
    extensions.crypt('virtual-managed-only', extensions.gen_salt('bf')),
    now(), '', '', '', '',
    '{"provider":"email","providers":["email"]}'::jsonb,
    '{"role":"SUPPLIER","company_name":"청주 로컬도매 A","is_admin_managed":true}'::jsonb,
    now(), now()
  ),
  (
    'd0000000-0000-0000-0000-000000000002',
    '00000000-0000-0000-0000-000000000000',
    'authenticated', 'authenticated',
    'virtual_online_bench@bidplate.local',
    extensions.crypt('virtual-managed-only', extensions.gen_salt('bf')),
    now(), '', '', '', '',
    '{"provider":"email","providers":["email"]}'::jsonb,
    '{"role":"SUPPLIER","company_name":"온라인 도매몰 기준가","is_admin_managed":true}'::jsonb,
    now(), now()
  )
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.profiles (
  id, role, company_name, business_number, address, delivery_regions, is_admin_managed, trust_score
) VALUES
  (
    'd0000000-0000-0000-0000-000000000001',
    'SUPPLIER',
    '청주 로컬도매 A',
    '301-99-00001',
    '충북 청주시 흥덕구 농수산물도매시장 1동',
    '["충북 청주시 흥덕구", "충북 청주시 서원구", "충북 청주시 상당구", "충북 청주시 청원구", "서울특별시 종로구"]'::jsonb,
    true,
    99.5
  ),
  (
    'd0000000-0000-0000-0000-000000000002',
    'SUPPLIER',
    '온라인 도매몰 기준가',
    '100-99-00002',
    '전국 콜드체인 택배 기준가 (운영자 관리)',
    '["충북 청주시 흥덕구", "서울특별시 종로구", "서울특별시 강남구", "서울특별시 마포구"]'::jsonb,
    true,
    100.0
  )
ON CONFLICT (id) DO UPDATE SET
  company_name = EXCLUDED.company_name,
  delivery_regions = EXCLUDED.delivery_regions,
  is_admin_managed = true;

-- Initial catalogs for the 2 virtual suppliers (ready for 1-click proxy bidding)
INSERT INTO public.supplier_catalogs (supplier_id, standard_item_id, package_weight, package_price)
VALUES
  -- 청주 로컬도매 A
  ('d0000000-0000-0000-0000-000000000001', '10000000-0000-0000-0000-000000000001', 5, 172000),  -- 소채끝등심 34,400/kg
  ('d0000000-0000-0000-0000-000000000001', '10000000-0000-0000-0000-000000000023', 1, 16800),   -- 생모짜렐라 16,800/kg
  ('d0000000-0000-0000-0000-000000000001', '10000000-0000-0000-0000-000000000034', 0.5, 9200),  -- 와일드 루꼴라 18,400/kg
  ('d0000000-0000-0000-0000-000000000001', '10000000-0000-0000-0000-000000000044', 5, 94500),   -- 올리브오일 18,900/L
  ('d0000000-0000-0000-0000-000000000001', '10000000-0000-0000-0000-000000000048', 5, 19000),   -- 스파게티 3,800/kg
  -- 온라인 도매몰 기준가
  ('d0000000-0000-0000-0000-000000000002', '10000000-0000-0000-0000-000000000001', 5, 175000),  -- 소채끝등심 35,000/kg
  ('d0000000-0000-0000-0000-000000000002', '10000000-0000-0000-0000-000000000023', 1, 16400),   -- 생모짜렐라 16,400/kg
  ('d0000000-0000-0000-0000-000000000002', '10000000-0000-0000-0000-000000000034', 0.5, 10200), -- 와일드 루꼴라 20,400/kg
  ('d0000000-0000-0000-0000-000000000002', '10000000-0000-0000-0000-000000000044', 5, 91000),   -- 올리브오일 18,200/L
  ('d0000000-0000-0000-0000-000000000002', '10000000-0000-0000-0000-000000000048', 5, 18000)    -- 스파게티 3,600/kg
ON CONFLICT (supplier_id, standard_item_id) DO UPDATE SET
  package_weight = EXCLUDED.package_weight,
  package_price = EXCLUDED.package_price;
