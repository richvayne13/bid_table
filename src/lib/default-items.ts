import { StandardItem } from "@/types/database";

// [육류 전용 표준 품목 마스터]
// 살롱순라 실제 납품 및 마장동 벨엘미트 견적서 기반 우육/돈육 스펙
export const DEFAULT_STANDARD_ITEMS: StandardItem[] = [
  // ==========================================
  // [1] 살롱순라 실제 소싱 & 마장동 견적서 품목 (핵심 우육)
  // ==========================================
  {
    id: "meat-item-001",
    category: "육류",
    item_name: "초이스 냉장 살치살",
    spec: "미국산 EXCEL 초이스(CH) / 냉장 스테이크용",
    base_unit: "kg",
  },
  {
    id: "meat-item-002",
    category: "육류",
    item_name: "초이스 냉동 살치살",
    spec: "미국산 EXCEL 초이스(CH) / 냉동 슬라이스/블록",
    base_unit: "kg",
  },
  {
    id: "meat-item-003",
    category: "육류",
    item_name: "프라임 냉장 알목심 (척아이롤)",
    spec: "미국산 EXCEL 프라임(PR) / 냉장 로스구이·스테이크",
    base_unit: "kg",
  },
  {
    id: "meat-item-004",
    category: "육류",
    item_name: "프라임 냉동 알목심 (척아이롤)",
    spec: "미국산 EXCEL 프라임(PR) / 냉동 벌크팩",
    base_unit: "kg",
  },
  {
    id: "meat-item-005",
    category: "육류",
    item_name: "초이스 냉동 알목심 (척아이롤)",
    spec: "미국산 EXCEL 초이스(CH) / 냉동 슬라이스/블록",
    base_unit: "kg",
  },
  {
    id: "meat-item-006",
    category: "육류",
    item_name: "AMH 냉장 S안심 (텐더로인)",
    spec: "호주산 AMH S등급 / 냉장 스테이크용 1kg 진공팩",
    base_unit: "kg",
  },
  {
    id: "meat-item-007",
    category: "육류",
    item_name: "AMH 냉장 A안심 (텐더로인)",
    spec: "호주산 AMH A등급 / 냉장 원육",
    base_unit: "kg",
  },
  {
    id: "meat-item-008",
    category: "육류",
    item_name: "TEYS 냉장 S안심 (텐더로인)",
    spec: "호주산 TEYS S등급 / 냉장 곡물비육(GF) 고급육",
    base_unit: "kg",
  },
  {
    id: "meat-item-009",
    category: "육류",
    item_name: "TEYS 냉장 A안심 (텐더로인)",
    spec: "호주산 TEYS A등급 / 냉장",
    base_unit: "kg",
  },
  {
    id: "meat-item-010",
    category: "육류",
    item_name: "EXCEL CAB 동결 안심",
    spec: "미국산 EXCEL CAB(블랙앵거스) / 동결 고급육",
    base_unit: "kg",
  },
  {
    id: "meat-item-011",
    category: "육류",
    item_name: "동결 곡물 채끝 (스트립로인)",
    spec: "호주산 TEYS GF(곡물비육) / 동결 스테이크용",
    base_unit: "kg",
  },
  {
    id: "meat-item-012",
    category: "육류",
    item_name: "냉장 곡물 채끝 (스트립로인)",
    spec: "호주산 곡물비육(GF) / 냉장 프리미엄 스테이크컷",
    base_unit: "kg",
  },
  {
    id: "meat-item-013",
    category: "육류",
    item_name: "초이스 차돌백이작업",
    spec: "미국산 초이스(CH) / 세절 가공 1kg팩 (동결)",
    base_unit: "kg",
  },
  {
    id: "meat-item-014",
    category: "육류",
    item_name: "국내산 젖소 냉장 안심",
    spec: "국내산 젖소 / 냉장 살배기 작업육",
    base_unit: "kg",
  },
  // ==========================================
  // [2] 추가 확장용 대표 우육 & 돈육 스펙
  // ==========================================
  {
    id: "meat-item-015",
    category: "육류",
    item_name: "소꽃등심 (립아이)",
    spec: "미국산 초이스 / 냉장 10kg박스 진공원육",
    base_unit: "kg",
  },
  {
    id: "meat-item-016",
    category: "육류",
    item_name: "소부채살 (탑블레이드)",
    spec: "미국산 초이스 / 냉장 1kg 슬라이스/원육",
    base_unit: "kg",
  },
  {
    id: "meat-item-017",
    category: "육류",
    item_name: "우삼겹 (업진살)",
    spec: "미국산 / 급속냉동 슬라이스 1kg",
    base_unit: "kg",
  },
  {
    id: "meat-item-018",
    category: "육류",
    item_name: "한돈 삼겹살",
    spec: "국산 1등급 암퇘지 / 냉장 구이용 2kg팩",
    base_unit: "kg",
  },
  {
    id: "meat-item-019",
    category: "육류",
    item_name: "한돈 돼지목살",
    spec: "국산 1등급 / 냉장 스테이크·구이용 2kg팩",
    base_unit: "kg",
  },
  {
    id: "meat-item-020",
    category: "육류",
    item_name: "이베리코 베요타 목살",
    spec: "스페인산 베요타 100% / 냉동 1kg 스테이크컷",
    base_unit: "kg",
  },
];
