-- ============================================================
-- Supplier Bidding RLS (UPDATE/DELETE) & 3-Supplier Demo Seed
-- A종합유통: 전 품목 취급 (공산품/오일/파스타 최저가)
-- B미트 육류전문: 육류 최저가
-- C프레시 신선/유제품 전문: 채소/유제품 최저가
-- ============================================================

-- 1. Demo RLS for updating/replacing bids and bid_items
DROP POLICY IF EXISTS "Demo anon can update bids" ON public.bids;
CREATE POLICY "Demo anon can update bids"
  ON public.bids FOR UPDATE
  TO anon, authenticated
  USING (true)
  WITH CHECK (true);

DROP POLICY IF EXISTS "Demo anon can delete bids" ON public.bids;
CREATE POLICY "Demo anon can delete bids"
  ON public.bids FOR DELETE
  TO anon, authenticated
  USING (true);

DROP POLICY IF EXISTS "Demo anon can update bid_items" ON public.bid_items;
CREATE POLICY "Demo anon can update bid_items"
  ON public.bid_items FOR UPDATE
  TO anon, authenticated
  USING (true)
  WITH CHECK (true);

DROP POLICY IF EXISTS "Demo anon can delete bid_items" ON public.bid_items;
CREATE POLICY "Demo anon can delete bid_items"
  ON public.bid_items FOR DELETE
  TO anon, authenticated
  USING (true);

-- 2. Include 서울특별시 종로구 in demo suppliers' delivery_regions alongside distinct 청주 regions
UPDATE public.profiles
SET delivery_regions = '["충북 청주시 흥덕구", "충북 청주시 서원구", "충북 청주시 상당구", "서울특별시 종로구"]'::jsonb
WHERE id = 'c0000000-0000-0000-0000-000000000001';

UPDATE public.profiles
SET delivery_regions = '["충북 청주시 흥덕구", "충북 청주시 청원구", "서울특별시 종로구"]'::jsonb
WHERE id = 'c0000000-0000-0000-0000-000000000002';

UPDATE public.profiles
SET delivery_regions = '["충북 청주시 흥덕구", "충북 청주시 서원구", "서울특별시 종로구"]'::jsonb
WHERE id = 'c0000000-0000-0000-0000-000000000003';

-- 3. Ensure A종합유통 catalog covers all 5 RFQ 1 items (전 품목 취급)
INSERT INTO public.supplier_catalogs (supplier_id, standard_item_id, package_weight, package_price)
VALUES
  ('c0000000-0000-0000-0000-000000000001', '10000000-0000-0000-0000-000000000001', 5, 177500), -- 소채끝등심 5kg -> 35,500원/kg (B미트 33,000원보다 높지만 전 품목 취급)
  ('c0000000-0000-0000-0000-000000000001', '10000000-0000-0000-0000-000000000034', 0.5, 10750),-- 와일드 루꼴라 0.5kg -> 21,500원/kg (C프레시 19,000원보다 높지만 전 품목 취급)
  ('c0000000-0000-0000-0000-000000000001', '10000000-0000-0000-0000-000000000002', 1, 20500)   -- 차돌박이 1kg -> 20,500원/kg
ON CONFLICT (supplier_id, standard_item_id) DO UPDATE SET
  package_weight = EXCLUDED.package_weight,
  package_price = EXCLUDED.package_price;

-- 4. Update RFQ 1 bids so all 3 demo suppliers show their distinct strengths
-- A종합유통: 전 품목 (5/5) 취급 + 올리브오일(18,400/L) & 스파게티(3,700/kg) 최저가
INSERT INTO public.bid_items (bid_id, rfq_item_id, package_weight, package_price)
VALUES
  ('30000000-0000-0000-0000-000000000001', '21000000-0000-0000-0000-000000000001', 5, 177500), -- 소채끝등심 35,500/kg
  ('30000000-0000-0000-0000-000000000001', '21000000-0000-0000-0000-000000000002', 1, 16500),  -- 생모짜렐라 16,500/kg
  ('30000000-0000-0000-0000-000000000001', '21000000-0000-0000-0000-000000000003', 0.5, 10750),-- 와일드 루꼴라 21,500/kg
  ('30000000-0000-0000-0000-000000000001', '21000000-0000-0000-0000-000000000004', 5, 92000),  -- 올리브오일 18,400/L (최저가)
  ('30000000-0000-0000-0000-000000000001', '21000000-0000-0000-0000-000000000005', 5, 18500)   -- 스파게티 3,700/kg (최저가)
ON CONFLICT (bid_id, rfq_item_id) DO UPDATE SET
  package_weight = EXCLUDED.package_weight,
  package_price = EXCLUDED.package_price;

-- B미트 육류전문: 육류 최저가 (소채끝등심 33,000/kg)
INSERT INTO public.bid_items (bid_id, rfq_item_id, package_weight, package_price)
VALUES
  ('30000000-0000-0000-0000-000000000002', '21000000-0000-0000-0000-000000000001', 5, 165000) -- 소채끝등심 33,000/kg (최저가)
ON CONFLICT (bid_id, rfq_item_id) DO UPDATE SET
  package_weight = EXCLUDED.package_weight,
  package_price = EXCLUDED.package_price;

-- C프레시 신선/유제품 전문: 채소/유제품 최저가 (생모짜렐라 16,200/kg, 루꼴라 19,000/kg)
INSERT INTO public.bid_items (bid_id, rfq_item_id, package_weight, package_price)
VALUES
  ('30000000-0000-0000-0000-000000000003', '21000000-0000-0000-0000-000000000002', 1, 16200),  -- 생모짜렐라 16,200/kg (최저가)
  ('30000000-0000-0000-0000-000000000003', '21000000-0000-0000-0000-000000000003', 0.5, 9500)  -- 와일드 루꼴라 19,000/kg (최저가)
ON CONFLICT (bid_id, rfq_item_id) DO UPDATE SET
  package_weight = EXCLUDED.package_weight,
  package_price = EXCLUDED.package_price;
