-- =========================================================================
-- 마이그레이션: 구매자(식당 사장님) 및 유통사 회원가입 종합 관리 레지스트리
-- =========================================================================

CREATE TABLE IF NOT EXISTS members_registry (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    role TEXT NOT NULL CHECK (role IN ('RESTAURANT', 'SUPPLIER', 'ADMIN')),
    email TEXT UNIQUE NOT NULL,
    company_name TEXT NOT NULL,
    representative TEXT,
    business_number TEXT,
    phone TEXT,
    address TEXT,
    region TEXT,
    
    -- 구매자(외식업 사장님) 전용 필드
    cuisine_category TEXT,
    monthly_spend TEXT,
    payment_terms TEXT DEFAULT '월말정산',
    
    -- 공급사(납품 유통업체) 전용 필드
    supply_categories TEXT[] DEFAULT '{}',
    delivery_regions TEXT[] DEFAULT '{}',
    refrigerated_trucks INTEGER DEFAULT 0,
    moq_amount INTEGER DEFAULT 0,
    trust_score NUMERIC DEFAULT 100.0,
    is_haccp BOOLEAN DEFAULT FALSE,
    
    status TEXT NOT NULL DEFAULT 'ACTIVE' CHECK (status IN ('ACTIVE', 'PENDING', 'SUSPENDED')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 인덱스 설정
CREATE INDEX IF NOT EXISTS idx_members_registry_role ON members_registry(role);
CREATE INDEX IF NOT EXISTS idx_members_registry_company ON members_registry(company_name);
CREATE INDEX IF NOT EXISTS idx_members_registry_biz_no ON members_registry(business_number);
CREATE INDEX IF NOT EXISTS idx_members_registry_status ON members_registry(status);

-- RLS 활성화
ALTER TABLE members_registry ENABLE ROW LEVEL SECURITY;

-- 관리자는 전체 조회/수정/삭제 가능
CREATE POLICY "Admins full access on members_registry"
ON members_registry
FOR ALL
USING (
    EXISTS (
        SELECT 1 FROM profiles
        WHERE profiles.id = auth.uid() AND profiles.role = 'ADMIN'
    )
    OR auth.role() = 'service_role'
);

-- 익명/일반 사용자 데모 환경 읽기 허용 (시범 사이트 데모용)
CREATE POLICY "Public read demo on members_registry"
ON members_registry
FOR SELECT
USING (true);

-- 초기 시드 데이터 삽입
INSERT INTO members_registry (
    id, role, email, company_name, representative, business_number, phone, address, region,
    cuisine_category, monthly_spend, supply_categories, delivery_regions, refrigerated_trucks, moq_amount, trust_score, is_haccp, status, created_at
) VALUES
(
    'b0000000-0000-0000-0000-000000000001', 'RESTAURANT', 'salon@soonra.com', '살롱순라', '살롱순라 대표', '222-32-16745', '010-8888-9999',
    '서울 종로구 율곡로 8길 75 (익선동)', '서울 종로/중구', '양식/파스타/와인바', '650만원',
    '{}', '{}', 0, 0, 100.0, false, 'ACTIVE', '2026-01-01T00:00:00Z'
),
(
    'b0000000-0000-0000-0000-000000000002', 'RESTAURANT', 'haengbok@bbq.com', '행복한 고깃집', '박대표', '118-81-99882', '010-3322-1144',
    '서울 강남구 역삼로 14길 8', '서울 강남/서초', '한식/고깃집/국밥', '1,200만원',
    '{}', '{}', 0, 0, 100.0, false, 'ACTIVE', '2026-02-10T09:30:00Z'
),
(
    'c0000000-0000-0000-0000-000000000001', 'SUPPLIER', 'belel@meat.com', '벨엘미트', '김지선', '258-40-00129', '010-7475-7410',
    '서울특별시 성동구 마장로27길 6 (마장동 1층)', '서울 성동/동대문', null, null,
    ARRAY['축산/육류', '수입육/한우'], ARRAY['서울 전역', '종로/중구', '성동구'], 6, 100000, 99.5, true, 'ACTIVE', '2026-01-01T00:00:00Z'
),
(
    'c0000000-0000-0000-0000-000000000002', 'SUPPLIER', 'garak@vege.co.kr', '가락농산', '이영훈', '109-86-54321', '010-4422-7711',
    '서울특별시 송파구 양재대로 932 (가락동 도매시장 청과동 12호)', '서울 송파/강남', null, null,
    ARRAY['채소/농산', '식자재 공산품'], ARRAY['서울 전역', '경기 성남/하남'], 12, 50000, 98.8, true, 'ACTIVE', '2026-01-15T11:00:00Z'
),
(
    'c0000000-0000-0000-0000-000000000003', 'SUPPLIER', 'jongro@fresh.com', '종로청과유통', '최상현', '101-82-77610', '010-9988-1234',
    '서울특별시 종로구 창경궁로 88 (광장시장 인근 1층)', '서울 종로/중구', null, null,
    ARRAY['채소/농산', '과일', '양념류'], ARRAY['종로구 익선동', '중구 명동', '성북구'], 4, 30000, 99.2, false, 'ACTIVE', '2026-02-01T14:20:00Z'
)
ON CONFLICT (email) DO NOTHING;
