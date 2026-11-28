---
name: admin-member-spreadsheet-view
description: B2B 플랫폼 운영관리자가 구매자(식당) 및 공급업체(유통사)의 회원가입 데이터를 고밀도 엑셀 스프레드시트 형태로 조회, 필터링, 정렬 및 XLSX 파일로 내보내는 UI/UX 및 데이터 처리 가이드
---

# Admin Member Spreadsheet View (운영관리자 엑셀형 회원명부 스킬)

## 1. 개요 (Overview)
B2B 역경매 및 식자재 직거래 플랫폼 `selfbuyer`에서 운영관리자가 플랫폼에 입점한 **BUYER(외식업 매장 사장님)**와 **SUPPLIER(식자재 공급·유통사)**의 등록 정보 전체를 엑셀(스프레드시트) 형태로 한눈에 감시, 검증, 관리하고 XLSX 파일로 안전하게 추출할 수 있도록 돕는 전문 스킬입니다.

---

## 2. 수집 및 관리 대상 회원 필수 정보 항목 (Data Schema Specification)

### 2.1 BUYER (외식업 매장 사장님 / 구매자)
| 필드명 | 영문 키 | 데이터 타입 | 설명 및 예시 |
|---|---|---|---|
| **회원 고유 ID** | `id` | UUID / String | 플랫폼 내 불변 식별자 |
| **로그인 이메일/ID** | `email` | String (Unique) | 본인인증 완료된 계정 이메일 |
| **매장명 / 상호명** | `company_name` | String | 사업자등록증 상의 매장 상호명 (예: 살롱순라) |
| **대표자명** | `representative` | String | 매장 대표자 실명 |
| **사업자등록번호** | `business_number` | String | 10자리 사업자등록번호 (예: 222-32-16745) |
| **대표 연락처** | `phone` | String | 사장님 핸드폰 또는 매장 유선번호 |
| **매장 소재지 주소** | `address` | String | 식자재를 납품받을 매장 실주소 (도로명) |
| **영업 권역** | `region` | String | 소속 권역 (예: 서울 종로구 익선동) |
| **업태 / 요리 분류** | `cuisine_category` | String | 주력 메뉴 (양식/와인바, 한식/고깃집, 일식 등) |
| **월 식자재 매입액** | `monthly_spend` | String / Number | 월 예상 식자재 소비 규모 (예: 500만~1,000만원) |
| **선호 결제 방식** | `payment_terms` | String | 월말정산, 선결제, 카드결제 등 |
| **회원 상태** | `status` | Enum | `ACTIVE`(정상), `PENDING`(심사중), `DORMANT`(휴면) |
| **가입 일시** | `created_at` | Timestamp | 회원가입 완료 일시 |

### 2.2 SUPPLIER (식자재 공급·유통업체 / 판매자)
| 필드명 | 영문 키 | 데이터 타입 | 설명 및 예시 |
|---|---|---|---|
| **업체 고유 ID** | `id` | UUID / String | 플랫폼 내 불변 식별자 |
| **로그인 이메일/ID** | `email` | String (Unique) | 유통사 공식 담당자 이메일 |
| **기업명 / 상호명** | `company_name` | String | 유통사 법인/개인 상호명 (예: 벨엘미트) |
| **대표자명** | `representative` | String | 대표자 성명 |
| **사업자등록번호** | `business_number` | String | 10자리 사업자등록번호 |
| **영업 담당 연락처** | `phone` | String | 발주/배송 직통 연락처 |
| **물류센터/본사 주소** | `address` | String | 물류 거점 소재지 (예: 서울 성동구 마장로27길) |
| **취급 전문 품목군** | `supply_categories` | Array[String] | 취급 품목 (축산/육류, 채소/농산, 공산품 등) |
| **배송 가능 권역** | `delivery_regions` | Array[String] | 납품 커버리지 (서울 전역, 종로/중구, 경기 등) |
| **냉장/냉동 탑차 수** | `refrigerated_trucks` | Number | 콜드체인 물류 역량 (예: 6대) |
| **기본 MOQ(최소주문)**| `moq_amount` | Number / String | 1회 배송 최소 주문금액 (예: 100,000원) |
| **신뢰도 점수 (평점)** | `trust_score` | Number | 납품 이행률 및 단가 준수 점수 (예: 99.5점) |
| **HACCP 인증 여부** | `is_haccp` | Boolean | 위생 및 해썹 인증 보유 여부 |
| **회원 승인 상태** | `status` | Enum | `ACTIVE`(승인완료), `REVIEW`(사업자검증중) |
| **가입 일시** | `created_at` | Timestamp | 회원가입 완료 일시 |

---

## 3. UI/UX 스프레드시트 뷰 원칙 (High-Density Spreadsheet Rules)

1. **테이블 레이아웃 (Excel-like Grid)**
   - 셀 패딩을 조밀하게(`py-2 px-3`) 유지하고 가로/세로 얇은 그리드 테두리(`border-gray-200`)를 적용합니다.
   - 숫자(사업자번호, 탑차 수, 금액, 날짜)는 `font-mono tabular-nums text-right`로 정렬합니다.
2. **역할별 탭 분리 (Role Tab Switching)**
   - `전체 회원 (All)`, `구매자 (BUYER)`, `공급사 (SUPPLIER)` 탭을 제공하여 클릭 한 번으로 필터링합니다.
3. **다차원 실시간 검색 (Instant Multi-Field Search)**
   - 상호명, 대표자명, 사업자번호, 권역, 취급 품목 중 어느 것을 입력해도 100ms 이내에 즉각 행을 필터링합니다.
4. **실제 XLSX 파일 내보내기 (Export to Excel via SheetJS)**
   - `xlsx` 라이브러리를 사용하여 브라우저 메모리 상에서 워크북을 생성하고 `회원명부_YYYY-MM-DD.xlsx` 파일로 즉시 다운로드합니다.
   - 한글 헤더 컬럼 및 통화/날짜 포맷이 엑셀에서 깨지지 않도록 UTF-8 인코딩을 보장합니다.
