-- ============================================================
-- BidPlate (견적식탁) Seed Data
-- ============================================================

-- 1. Standard Items (표준 품목 목록)
INSERT INTO public.standard_items (id, category, item_name, spec, base_unit)
VALUES
  -- 육류
  ('10000000-0000-0000-0000-000000000001', '육류', '소채끝등심', '미국산 초이스/냉장', 'kg'),
  ('10000000-0000-0000-0000-000000000002', '육류', '차돌박이', '미국산/냉동 1kg팩', 'kg'),
  ('10000000-0000-0000-0000-000000000003', '육류', '삼겹살', '국산 1등급/냉장 보쌈용', 'kg'),
  -- 해산물
  ('10000000-0000-0000-0000-000000000004', '해산물', '흰다리새우', '베트남산/냉동 30/40미', 'kg'),
  ('10000000-0000-0000-0000-000000000005', '해산물', '손질 오징어', '원양산/급랭 1kg', 'kg'),
  -- 유제품
  ('10000000-0000-0000-0000-000000000006', '유제품', '생모짜렐라', '이탈리아산/1kg 블록', 'kg'),
  ('10000000-0000-0000-0000-000000000007', '유제품', '서울우유', '국산원유 100%/1000ml', 'L'),
  -- 채소/과일
  ('10000000-0000-0000-0000-000000000008', '채소/과일', '루꼴라', '국산/무농약 500g팩', 'kg'),
  ('10000000-0000-0000-0000-000000000009', '채소/과일', '양파', '국산 햇양파/특 20kg망', 'kg'),
  ('10000000-0000-0000-0000-000000000010', '채소/과일', '깐마늘', '국산 대서종/특 1kg봉', 'kg'),
  -- 소스/공산품
  ('10000000-0000-0000-0000-000000000011', '소스/공산품', '엑스트라버진 올리브오일', '스페인산/5L 캔', 'L'),
  ('10000000-0000-0000-0000-000000000012', '소스/공산품', '파스타면 스파게티', '이탈리아산 No.5/5kg', 'kg')
ON CONFLICT (id) DO UPDATE SET
  category = EXCLUDED.category,
  item_name = EXCLUDED.item_name,
  spec = EXCLUDED.spec,
  base_unit = EXCLUDED.base_unit;

-- 2. Auth Users (인증 사용자 계정)
INSERT INTO auth.users (
  id,
  instance_id,
  aud,
  role,
  email,
  encrypted_password,
  email_confirmed_at,
  raw_app_meta_data,
  raw_user_meta_data,
  created_at,
  updated_at
) VALUES
  -- 관리자
  ('a0000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'admin@bidplate.com', extensions.crypt('password123', extensions.gen_salt('bf')), now(), '{"provider":"email","providers":["email"]}'::jsonb, '{"role":"ADMIN","company_name":"견적식탁 운영팀"}'::jsonb, now(), now()),
  -- 식당 1: 청주 파스타공방
  ('b0000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'bistro@bidplate.com', extensions.crypt('password123', extensions.gen_salt('bf')), now(), '{"provider":"email","providers":["email"]}'::jsonb, '{"role":"RESTAURANT","company_name":"청주 파스타공방"}'::jsonb, now(), now()),
  -- 식당 2: 오송 한우명가
  ('b0000000-0000-0000-0000-000000000002', '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'meat@bidplate.com', extensions.crypt('password123', extensions.gen_salt('bf')), now(), '{"provider":"email","providers":["email"]}'::jsonb, '{"role":"RESTAURANT","company_name":"오송 한우명가"}'::jsonb, now(), now()),
  -- 유통사 1: 대성푸드 유통
  ('c0000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'supplier1@bidplate.com', extensions.crypt('password123', extensions.gen_salt('bf')), now(), '{"provider":"email","providers":["email"]}'::jsonb, '{"role":"SUPPLIER","company_name":"대성푸드 유통"}'::jsonb, now(), now()),
  -- 유통사 2: 하나미트
  ('c0000000-0000-0000-0000-000000000002', '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'supplier2@bidplate.com', extensions.crypt('password123', extensions.gen_salt('bf')), now(), '{"provider":"email","providers":["email"]}'::jsonb, '{"role":"SUPPLIER","company_name":"하나미트"}'::jsonb, now(), now()),
  -- 유통사 3: 청주 프레시원 (관리자 위탁 운영 가상 유통사)
  ('c0000000-0000-0000-0000-000000000003', '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'supplier3@bidplate.com', extensions.crypt('password123', extensions.gen_salt('bf')), now(), '{"provider":"email","providers":["email"]}'::jsonb, '{"role":"SUPPLIER","company_name":"청주 프레시원","is_admin_managed":true}'::jsonb, now(), now())
ON CONFLICT (id) DO UPDATE SET
  email = EXCLUDED.email,
  raw_user_meta_data = EXCLUDED.raw_user_meta_data;

-- 3. Profiles (프로필 상세 정보 갱신)
INSERT INTO public.profiles (
  id,
  role,
  company_name,
  business_number,
  address,
  delivery_regions,
  is_admin_managed,
  trust_score
) VALUES
  ('a0000000-0000-0000-0000-000000000001', 'ADMIN', '견적식탁 운영팀', '101-81-00001', '서울시 강남구 테헤란로 123', '[]'::jsonb, false, 100.0),
  ('b0000000-0000-0000-0000-000000000001', 'RESTAURANT', '청주 파스타공방', '301-81-11111', '충북 청주시 흥덕구 복대동 123', '[]'::jsonb, false, 100.0),
  ('b0000000-0000-0000-0000-000000000002', 'RESTAURANT', '오송 한우명가', '301-81-22222', '충북 청주시 흥덕구 오송읍 456', '[]'::jsonb, false, 100.0),
  ('c0000000-0000-0000-0000-000000000001', 'SUPPLIER', '대성푸드 유통', '201-81-33333', '충북 청주시 서원구 남이면 789', '["충북 청주시 흥덕구", "충북 청주시 서원구", "충북 청주시 상당구"]'::jsonb, false, 98.5),
  ('c0000000-0000-0000-0000-000000000002', 'SUPPLIER', '하나미트', '201-81-44444', '충북 청주시 청원구 오창읍 101', '["충북 청주시 흥덕구", "충북 청주시 청원구"]'::jsonb, false, 100.0),
  ('c0000000-0000-0000-0000-000000000003', 'SUPPLIER', '청주 프레시원', '201-81-55555', '충북 청주시 흥덕구 직지대로 202', '["충북 청주시 흥덕구", "충북 청주시 서원구"]'::jsonb, true, 95.0)
ON CONFLICT (id) DO UPDATE SET
  role = EXCLUDED.role,
  company_name = EXCLUDED.company_name,
  business_number = EXCLUDED.business_number,
  address = EXCLUDED.address,
  delivery_regions = EXCLUDED.delivery_regions,
  is_admin_managed = EXCLUDED.is_admin_managed,
  trust_score = EXCLUDED.trust_score;

-- 4. Supplier Catalogs (유통사 기본 공급 단가표)
INSERT INTO public.supplier_catalogs (supplier_id, standard_item_id, package_weight, package_price)
VALUES
  -- Supplier 1 (대성푸드 유통): 공산품/유제품/채소
  ('c0000000-0000-0000-0000-000000000001', '10000000-0000-0000-0000-000000000006', 1, 16500),  -- 생모짜렐라 1kg -> 16,500원/kg
  ('c0000000-0000-0000-0000-000000000001', '10000000-0000-0000-0000-000000000007', 1, 2800),   -- 서울우유 1L -> 2,800원/L
  ('c0000000-0000-0000-0000-000000000001', '10000000-0000-0000-0000-000000000008', 0.5, 11000), -- 루꼴라 0.5kg -> 22,000원/kg
  ('c0000000-0000-0000-0000-000000000001', '10000000-0000-0000-0000-000000000011', 5, 95000),  -- 올리브오일 5L -> 19,000원/L
  ('c0000000-0000-0000-0000-000000000001', '10000000-0000-0000-0000-000000000012', 5, 19500),  -- 파스타면 5kg -> 3,900원/kg

  -- Supplier 2 (하나미트): 육류 전문
  ('c0000000-0000-0000-0000-000000000002', '10000000-0000-0000-0000-000000000001', 5, 170000), -- 소채끝등심 5kg팩 -> 34,000원/kg
  ('c0000000-0000-0000-0000-000000000002', '10000000-0000-0000-0000-000000000002', 1, 19500),  -- 차돌박이 1kg -> 19,500원/kg
  ('c0000000-0000-0000-0000-000000000002', '10000000-0000-0000-0000-000000000003', 10, 185000), -- 삼겹살 10kg -> 18,500원/kg

  -- Supplier 3 (청주 프레시원): 신선 채소 및 해산물
  ('c0000000-0000-0000-0000-000000000003', '10000000-0000-0000-0000-000000000004', 1, 14500),  -- 흰다리새우 1kg -> 14,500원/kg
  ('c0000000-0000-0000-0000-000000000003', '10000000-0000-0000-0000-000000000005', 1, 12000),  -- 손질 오징어 1kg -> 12,000원/kg
  ('c0000000-0000-0000-0000-000000000003', '10000000-0000-0000-0000-000000000008', 0.5, 10500), -- 루꼴라 0.5kg -> 21,000원/kg
  ('c0000000-0000-0000-0000-000000000003', '10000000-0000-0000-0000-000000000009', 20, 24000), -- 양파 20kg -> 1,200원/kg
  ('c0000000-0000-0000-0000-000000000003', '10000000-0000-0000-0000-000000000010', 1, 8500)    -- 깐마늘 1kg -> 8,500원/kg
ON CONFLICT (supplier_id, standard_item_id) DO UPDATE SET
  package_weight = EXCLUDED.package_weight,
  package_price = EXCLUDED.package_price;

-- 5. Sample RFQ 1 (오픈 견적 요청서: 청주 파스타공방)
INSERT INTO public.rfqs (
  id,
  restaurant_id,
  title,
  region,
  contract_months,
  delivery_days,
  payment_terms,
  deadline,
  status
) VALUES (
  '20000000-0000-0000-0000-000000000001',
  'b0000000-0000-0000-0000-000000000001',
  '청주 파스타공방 6월 정기 식자재 견적 요청',
  '충북 청주시 흥덕구',
  3,
  '["월", "수", "금"]'::jsonb,
  '월말정산',
  now() + interval '7 days',
  'OPEN'
) ON CONFLICT (id) DO UPDATE SET
  title = EXCLUDED.title,
  status = EXCLUDED.status;

-- RFQ 1 Items
INSERT INTO public.rfq_items (
  id,
  rfq_id,
  standard_item_id,
  monthly_qty,
  current_unit_price
) VALUES
  ('21000000-0000-0000-0000-000000000001', '20000000-0000-0000-0000-000000000001', '10000000-0000-0000-0000-000000000001', 50, 38000), -- 소채끝등심 50kg
  ('21000000-0000-0000-0000-000000000002', '20000000-0000-0000-0000-000000000001', '10000000-0000-0000-0000-000000000006', 30, 18000), -- 생모짜렐라 30kg
  ('21000000-0000-0000-0000-000000000003', '20000000-0000-0000-0000-000000000001', '10000000-0000-0000-0000-000000000008', 10, 24000), -- 루꼴라 10kg
  ('21000000-0000-0000-0000-000000000004', '20000000-0000-0000-0000-000000000001', '10000000-0000-0000-0000-000000000011', 20, 22000), -- 올리브오일 20L
  ('21000000-0000-0000-0000-000000000005', '20000000-0000-0000-0000-000000000001', '10000000-0000-0000-0000-000000000012', 40, 4500)   -- 파스타면 40kg
ON CONFLICT (id) DO UPDATE SET
  monthly_qty = EXCLUDED.monthly_qty,
  current_unit_price = EXCLUDED.current_unit_price;

-- 6. Sample Bids on RFQ 1 (입찰서)
-- Bid 1: 대성푸드 유통
INSERT INTO public.bids (
  id,
  rfq_id,
  supplier_id,
  moq_amount,
  price_lock_type,
  status
) VALUES (
  '30000000-0000-0000-0000-000000000001',
  '20000000-0000-0000-0000-000000000001',
  'c0000000-0000-0000-0000-000000000001',
  150000,
  'FIXED',
  'SUBMITTED'
) ON CONFLICT (rfq_id, supplier_id) DO UPDATE SET
  moq_amount = EXCLUDED.moq_amount,
  price_lock_type = EXCLUDED.price_lock_type;

-- Bid 1 Items
INSERT INTO public.bid_items (bid_id, rfq_item_id, package_weight, package_price)
VALUES
  ('30000000-0000-0000-0000-000000000001', '21000000-0000-0000-0000-000000000002', 1, 16500),  -- 생모짜렐라 (16,500원/kg)
  ('30000000-0000-0000-0000-000000000001', '21000000-0000-0000-0000-000000000003', 0.5, 11000), -- 루꼴라 (22,000원/kg)
  ('30000000-0000-0000-0000-000000000001', '21000000-0000-0000-0000-000000000004', 5, 95000),  -- 올리브오일 (19,000원/L)
  ('30000000-0000-0000-0000-000000000001', '21000000-0000-0000-0000-000000000005', 5, 19500)   -- 파스타면 (3,900원/kg)
ON CONFLICT (bid_id, rfq_item_id) DO UPDATE SET
  package_weight = EXCLUDED.package_weight,
  package_price = EXCLUDED.package_price;

-- Bid 2: 하나미트
INSERT INTO public.bids (
  id,
  rfq_id,
  supplier_id,
  moq_amount,
  price_lock_type,
  status
) VALUES (
  '30000000-0000-0000-0000-000000000002',
  '20000000-0000-0000-0000-000000000001',
  'c0000000-0000-0000-0000-000000000002',
  200000,
  'INDEXED',
  'SUBMITTED'
) ON CONFLICT (rfq_id, supplier_id) DO UPDATE SET
  moq_amount = EXCLUDED.moq_amount,
  price_lock_type = EXCLUDED.price_lock_type;

-- Bid 2 Items (소채끝등심 단독 최저가)
INSERT INTO public.bid_items (bid_id, rfq_item_id, package_weight, package_price)
VALUES
  ('30000000-0000-0000-0000-000000000002', '21000000-0000-0000-0000-000000000001', 5, 170000) -- 소채끝등심 (34,000원/kg)
ON CONFLICT (bid_id, rfq_item_id) DO UPDATE SET
  package_weight = EXCLUDED.package_weight,
  package_price = EXCLUDED.package_price;

-- 7. Sample RFQ 2 (계약 완료 건: 오송 한우명가 & 계약/검수 이력)
INSERT INTO public.rfqs (
  id,
  restaurant_id,
  title,
  region,
  contract_months,
  delivery_days,
  payment_terms,
  deadline,
  status
) VALUES (
  '20000000-0000-0000-0000-000000000002',
  'b0000000-0000-0000-0000-000000000002',
  '오송 한우명가 5월 육류 정기 납품 입찰',
  '충북 청주시 흥덕구',
  1,
  '["화", "목"]'::jsonb,
  '카드결제',
  now() - interval '10 days',
  'CONTRACTED'
) ON CONFLICT (id) DO UPDATE SET
  status = EXCLUDED.status;

-- Contract 1
INSERT INTO public.contracts (
  id,
  rfq_id,
  supplier_id,
  contract_items,
  start_date,
  end_date
) VALUES (
  '40000000-0000-0000-0000-000000000001',
  '20000000-0000-0000-0000-000000000002',
  'c0000000-0000-0000-0000-000000000002',
  '[
    {"item_name": "차돌박이", "normalized_unit_price": 19500, "base_unit": "kg"},
    {"item_name": "삼겹살", "normalized_unit_price": 18500, "base_unit": "kg"}
  ]'::jsonb,
  CURRENT_DATE - interval '15 days',
  CURRENT_DATE + interval '15 days'
) ON CONFLICT (id) DO NOTHING;

-- Invoice Audit 1 (단가 인상 감시 적발 샘플)
INSERT INTO public.invoice_audits (
  id,
  contract_id,
  image_url,
  parsed_items,
  violation_count,
  total_overcharge
) VALUES (
  '50000000-0000-0000-0000-000000000001',
  '40000000-0000-0000-0000-000000000001',
  'https://images.unsplash.com/photo-1554415707-9e49016a3507?auto=format&fit=crop&w=800&q=80',
  '[
    {"item_name": "차돌박이", "invoiced_unit_price": 21000, "contract_unit_price": 19500, "qty": 10, "is_violation": true, "diff": 1500},
    {"item_name": "삼겹살", "invoiced_unit_price": 18500, "contract_unit_price": 18500, "qty": 20, "is_violation": false, "diff": 0}
  ]'::jsonb,
  1,
  15000
) ON CONFLICT (id) DO NOTHING;
