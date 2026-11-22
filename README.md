# 견적식탁 (BidPlate)

B2B 식자재 역경매, 1사 vs 2사 최적 조합 매트릭스 비교, 사후 거래명세서 OCR 단가방어 감시 및 관리자 운영 콘솔 웹 플랫폼입니다.

## 기술 스택
- **Frontend:** Next.js 14 (App Router), TypeScript, Tailwind CSS, `@tanstack/react-table`, `lucide-react`
- **Backend & DB:** Supabase (PostgreSQL, Auth, Storage)
- **AI / OCR:** OpenAI API (`gpt-4o-mini` Vision & JSON Output — 미설정 시 Mock 모드 자동 동작)
- **Excel / CSV:** `xlsx` (SheetJS 서버 파싱)

## 구현된 주요 화면
| 역할 | 경로 | 기능 |
| :--- | :--- | :--- |
| 공통 | `/` | 서비스 소개, Supabase 연결 상태, 3대 모드 빠른 이동 대시보드 |
| 식당 업주 | `/rfq` | 내 견적 요청서 목록 (`OPEN`/`CLOSED`/`CONTRACTED`), 입찰 건수, 매트릭스·단가감시 이동 |
| 식당 업주 | `/rfq/new` | 3단계 견적 요청서 작성 (시/구/동 3단계 권역 · 서울 25개구/종로구 살롱순라 포함, 수동 검색 + AI 이미지 추출) |
| 식당 업주 | `/rfq/[id]/compare` | 가로×세로 매트릭스 견적 비교 (`@tanstack/react-table`), 단일/최적 2사 분할/수동 시뮬레이션, MOQ 경고, 계약 확정 |
| 식당 업주 | `/contracts/[id]/audit` | 계약 확정 단가 스냅샷 조회, 거래명세서 OCR/샘플 대조, 무단 인상 적발 및 이의제기(`invoice_audits`·`trust_score` 반영) |
| 유통사 | `/supplier/rfqs` | 배송 권역(`delivery_regions`) 일치 `OPEN` 공고 필터링 및 데모 유통사 3곳 전환 |
| 유통사 | `/supplier/rfqs/[id]/bid` | MOQ·단가유형 입력, 기준단위 자동 환산, 자사 표준 단가표 자동 매칭 & 엑셀/CSV 업로드 |
| 관리자 | `/admin` | 통합 운영 모니터링 KPI, 무단 단가 인상 신고 내역 및 `trust_score` 직접 조정 |
| 관리자 | `/admin/items` | 표준 품목 마스터 조회, 단건 추가/수정/삭제, 엑셀/CSV 일괄 Upsert |
| 관리자 | `/admin/suppliers` | 가상 유통업체(`is_admin_managed=true`) 등록, 배송 권역 설정, 단가표 웹 편집 및 엑셀 업로드 |
| 관리자 | `/admin/rfqs` | `OPEN` 공고에 가상 유통사 단가표 자동 매칭 원클릭 대리 입찰 |

---

## 다른 컴퓨터에서 이어서 세팅하기

### 1. 저장소 클론 및 패키지 설치
> 사전 요구사항: Node.js 20+ 및 Git 설치

```bash
git clone https://github.com/richvayne13/bid_table.git
cd bid_table
npm install
```

### 2. 환경변수(`.env.local`) 설정
`.env.example`을 복사하여 프로젝트 루트에 `.env.local`을 생성하고 Supabase 키를 입력합니다.
(키는 **Supabase Dashboard → Project Settings → API**에서 확인할 수 있습니다.)

```env
NEXT_PUBLIC_SUPABASE_URL=https://jkynjizmvnxszzafwvwe.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=<여기에_Supabase_Anon_Key_입력>

# 선택: 미설정 시 거래명세서/메뉴판 OCR이 Mock 모드로 자동 동작합니다.
OPENAI_API_KEY=
```

### 3. 개발 서버 실행
```bash
npm run dev
```
브라우저에서 `http://localhost:3000`에 접속하면 클라우드 Supabase DB의 모든 데이터(표준 품목 50종, 가상 유통사, RFQ, 입찰, 계약, 감시 이력)가 그대로 연동됩니다.

### 4. (선택) 다른 컴퓨터에서 Supabase DB 마이그레이션까지 이어서 할 때
```bash
npx supabase login
npx supabase link --project-ref jkynjizmvnxszzafwvwe
# 이후 마이그레이션 반영 시:
npx supabase db push --remote
```
