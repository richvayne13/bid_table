# PRD: B2B 식자재 역경매 및 단가방어 매칭 플랫폼 (BidPlate)

## 1. 프로젝트 개요
- **목적:** 식당 업주가 월간 식자재 품목·수량을 등록하면, 배송 권역이 일치하는 유통업체들이 표준화된 단위(kg/L/ea)로 입찰하고, 업주가 가로×세로 매트릭스 뷰에서 최적 업체(단일 또는 2사 조합)를 선택하며, 계약 후 거래명세서 OCR 대조를 통해 무단 단가 인상을 감시하는 B2B 웹 서비스. 운영자는 관리자 모드에서 표준 품목, 가상 유통업체, 단가표를 직접 등록·관리할 수 있다.
- **기술 스택:**
  - Frontend: Next.js 14+ (App Router), TypeScript, Tailwind CSS, Shadcn/UI, `@tanstack/react-table`, `lucide-react`
  - Backend & DB: Supabase (PostgreSQL, Auth, Storage)
  - AI / OCR: OpenAI API (`gpt-4o-mini` Vision & Structured Outputs)
  - Excel/CSV 파싱: `xlsx` (SheetJS)

## 2. 데이터베이스 스키마 (Supabase PostgreSQL)
1. `profiles`
   - `id` (uuid, PK, references auth.users)
   - `role` (text: `'RESTAURANT'` | `'SUPPLIER'` | `'ADMIN'`)
   - `company_name` (text)
   - `business_number` (text)
   - `address` (text)
   - `delivery_regions` (jsonb: 예 `["충북 청주시 흥덕구", "충북 청주시 서원구"]`)
   - `is_admin_managed` (boolean, default false)
   - `trust_score` (numeric, default 100.0 - 단가 준수율 %)
2. `standard_items`
   - `id` (uuid, PK)
   - `category` (text: `'육류'`, `'해산물'`, `'유제품'`, `'채소/과일'`, `'소스/공산품'`)
   - `item_name` (text: 예 `'소채끝등심'`, `'차돌박이'`, `'생모짜렐라'`, `'루꼴라'`)
   - `spec` (text: 예 `'미국산 초이스/냉장'`, `'국산/1kg팩'`)
   - `base_unit` (text: `'kg'` | `'L'` | `'ea'`)
3. `supplier_catalogs`
   - `id` (uuid, PK)
   - `supplier_id` (uuid, FK -> profiles.id)
   - `standard_item_id` (uuid, FK -> standard_items.id)
   - `package_weight` (numeric: 포장 단위 중량/용량, 예: 10)
   - `package_price` (numeric: 포장 단위 공급가)
4. `rfqs` (견적 요청서)
   - `id` (uuid, PK)
   - `restaurant_id` (uuid, FK -> profiles.id)
   - `title` (text)
   - `region` (text)
   - `contract_months` (int: 1, 3, 6)
   - `delivery_days` (jsonb: 예 `["월", "수", "금"]`)
   - `payment_terms` (text: `'선결제'` | `'월말정산'` | `'카드결제'`)
   - `deadline` (timestamptz)
   - `status` (text: `'OPEN'` | `'CLOSED'` | `'CONTRACTED'`)
5. `rfq_items` (요청 품목 상세)
   - `id` (uuid, PK)
   - `rfq_id` (uuid, FK -> rfqs.id)
   - `standard_item_id` (uuid, FK -> standard_items.id)
   - `monthly_qty` (numeric)
   - `current_unit_price` (numeric, nullable - 기존 매입 단가)
6. `bids` (유통사 입찰서)
   - `id` (uuid, PK)
   - `rfq_id` (uuid, FK -> rfqs.id)
   - `supplier_id` (uuid, FK -> profiles.id)
   - `moq_amount` (numeric: 1회 최소주문금액)
   - `price_lock_type` (text: `'FIXED'` | `'INDEXED'`)
   - `status` (text: `'SUBMITTED'` | `'WON'` | `'LOST'`)
7. `bid_items` (입찰 품목별 단가)
   - `id` (uuid, PK)
   - `bid_id` (uuid, FK -> bids.id)
   - `rfq_item_id` (uuid, FK -> rfq_items.id)
   - `package_weight` (numeric)
   - `package_price` (numeric)
   - `normalized_unit_price` (numeric: 자동 환산 기준단가 = package_price / package_weight)
8. `contracts` & `invoice_audits`
   - `contracts`: `id`, `rfq_id`, `supplier_id`, `contract_items` (jsonb: 품목별 확정 `normalized_unit_price` 스냅샷), `start_date`, `end_date`
   - `invoice_audits`: `id`, `contract_id`, `image_url`, `parsed_items` (jsonb), `violation_count` (int), `total_overcharge` (numeric), `created_at`

## 3. 핵심 비즈니스 로직
- **단위 정합화:** 모든 입찰가는 유통사가 입력한 `[포장규격(kg/L/ea) + 박스/팩 가격]`을 `base_unit` 기준 단가로 자동 환산하여 비교한다.
- **최적 조합 알고리즘 (1사 vs 2사 분할):**
  - 단일 최저가: 전체 요청 품목의 90% 이상을 취급하면서 월 예상 총액이 가장 낮은 1개 업체 선택.
  - 최적 2사 조합: 각 품목별 최저가 업체를 배정하되, 선택된 두 업체 각각의 월 예상 발주액(주 2회 기준 회당 발주액)이 해당 업체의 `moq_amount`를 충족하는지 검증하여 총액 최소 조합을 반환.
- **단가 인상 방어:** 계약 확정 후 업로드된 거래명세서 OCR 결과의 단가가 `contracts` 스냅샷 단가보다 높을 경우(시세연동형은 허용 오차 +10% 초과 시) 무단 인상으로 플래그 처리한다.
- **관리자(Admin) 모드:** 운영자가 웹 UI에서 표준 품목 단건/엑셀 등록, 가상 유통업체 생성 및 단가표 관리, 오픈된 RFQ에 가상 업체 대리 입찰 실행, 무단 단가 인상 신고 및 신뢰도 점수(`trust_score`) 관리를 수행한다.