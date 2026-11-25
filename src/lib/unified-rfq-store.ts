"use client";

export interface UnifiedRfqItem {
  id: string;
  rfq_id: string;
  standard_item_id: string;
  monthly_qty: number;
  current_unit_price: number | null;
  standard_items: {
    item_name: string;
    base_unit: string;
    category?: string;
    spec?: string;
  };
}

export interface UnifiedBidItem {
  id: string;
  bid_id: string;
  rfq_item_id: string;
  package_weight: number;
  package_price: number;
}

export interface UnifiedBid {
  id: string;
  rfq_id: string;
  supplier_id: string;
  status: "SUBMITTED" | "ACCEPTED" | "REJECTED";
  moq_amount: number;
  price_lock_type: "FIXED" | "INDEXED";
  created_at: string;
  profiles: {
    company_name: string;
    address?: string;
    business_number?: string;
    phone?: string;
    rating?: number;
  };
  bid_items: UnifiedBidItem[];
}

export interface UnifiedRfq {
  id: string;
  restaurant_id: string;
  title: string;
  region: string;
  contract_months: number;
  delivery_days: string[];
  payment_terms: string;
  deadline: string;
  status: "OPEN" | "CLOSED" | "CONTRACTED";
  created_at: string;
  profiles: {
    company_name: string;
    address?: string;
    business_number?: string;
    representative?: string;
    phone?: string;
  };
  rfq_items: UnifiedRfqItem[];
  bids: UnifiedBid[];
  contracts?: Array<any>;
}

const STORAGE_KEY = "bidplate_unified_rfqs_v3";

// 살롱순라 기본 정기 식자재 공고 (기본 탑재)
export const SEED_RFQS: UnifiedRfq[] = [
  {
    id: "d0000000-0000-0000-0000-000000000001",
    restaurant_id: "b0000000-0000-0000-0000-000000000001",
    title: "살롱순라 정기 식자재 역경매 공고 (양식/파스타/스테이크류)",
    region: "서울 종로구 율곡로 8길 75 (익선동)",
    contract_months: 3,
    delivery_days: ["월", "수", "금"],
    payment_terms: "월말정산",
    deadline: "2026-12-15T23:59:59.000Z",
    status: "OPEN",
    created_at: "2026-11-20T10:00:00.000Z",
    profiles: {
      company_name: "살롱순라",
      address: "서울 종로구 율곡로 8길 75",
      business_number: "222-32-16745",
      representative: "살롱순라 대표",
      phone: "010-8888-9999",
    },
    rfq_items: [
      {
        id: "item-seed-1",
        rfq_id: "d0000000-0000-0000-0000-000000000001",
        standard_item_id: "meat-item-001",
        monthly_qty: 150,
        current_unit_price: 35000,
        standard_items: {
          item_name: "초이스 냉장 살치살",
          base_unit: "kg",
          category: "육류",
          spec: "미국산 EXCEL 초이스(CH) / 냉장 스테이크용",
        },
      },
      {
        id: "item-seed-2",
        rfq_id: "d0000000-0000-0000-0000-000000000001",
        standard_item_id: "meat-item-003",
        monthly_qty: 200,
        current_unit_price: 28000,
        standard_items: {
          item_name: "프라임 냉장 알목심 (척아이롤)",
          base_unit: "kg",
          category: "육류",
          spec: "미국산 EXCEL 프라임(PR) / 냉장 로스구이·스테이크",
        },
      },
      {
        id: "item-seed-3",
        rfq_id: "d0000000-0000-0000-0000-000000000001",
        standard_item_id: "meat-item-006",
        monthly_qty: 80,
        current_unit_price: 48000,
        standard_items: {
          item_name: "AMH 냉장 S안심 (텐더로인)",
          base_unit: "kg",
          category: "육류",
          spec: "호주산 AMH S등급 / 냉장 1kg 진공포장",
        },
      },
      {
        id: "item-seed-4",
        rfq_id: "d0000000-0000-0000-0000-000000000001",
        standard_item_id: "meat-item-011",
        monthly_qty: 100,
        current_unit_price: 33000,
        standard_items: {
          item_name: "동결 곡물 채끝 (스트립로인)",
          base_unit: "kg",
          category: "육류",
          spec: "호주산 TEYS GF / 동결 스테이크용",
        },
      },
    ],
    bids: [
      {
        id: "bid-seed-1",
        rfq_id: "d0000000-0000-0000-0000-000000000001",
        supplier_id: "c0000000-0000-0000-0000-000000000001",
        status: "SUBMITTED",
        moq_amount: 100000,
        price_lock_type: "FIXED",
        created_at: "2026-11-21T09:30:00.000Z",
        profiles: {
          company_name: "벨엘미트 (마장동 축산 도소매)",
          address: "서울특별시 성동구 마장로27길 6 (마장동 1층)",
          business_number: "258-40-00129",
          phone: "010-7475-7410",
          rating: 5.0,
        },
        bid_items: [
          {
            id: "bi-1-1",
            bid_id: "bid-seed-1",
            rfq_item_id: "item-seed-1",
            package_weight: 1,
            package_price: 32500, // 초이스 냉장 살치 실견적가
          },
          {
            id: "bi-1-2",
            bid_id: "bid-seed-1",
            rfq_item_id: "item-seed-2",
            package_weight: 1,
            package_price: 25900, // 프라임 냉장 알목심 실견적가
          },
          {
            id: "bi-1-3",
            bid_id: "bid-seed-1",
            rfq_item_id: "item-seed-3",
            package_weight: 1,
            package_price: 44000, // AMH 냉장 S안심 실견적가
          },
          {
            id: "bi-1-4",
            bid_id: "bid-seed-1",
            rfq_item_id: "item-seed-4",
            package_weight: 1,
            package_price: 28500, // TEYS 동결 채끝 실납품단가
          },
        ],
      },
    ],
  },
];

// 통합 스토어 읽기
export function getUnifiedRfqs(): UnifiedRfq[] {
  if (typeof window === "undefined") return SEED_RFQS;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(SEED_RFQS));
      return SEED_RFQS;
    }
    const parsed = JSON.parse(raw) as UnifiedRfq[];
    // 만약 시드 공고가 없으면 앞에 보장
    if (!parsed.some((r) => r.id === SEED_RFQS[0].id)) {
      parsed.unshift(SEED_RFQS[0]);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(parsed));
    }
    return parsed;
  } catch (e) {
    console.error("Failed to load unified rfqs:", e);
    return SEED_RFQS;
  }
}

// 특정 RFQ 단건 조회 (demo, 1 등 alias 지원)
export function getUnifiedRfqById(id: string): UnifiedRfq | null {
  const rfqs = getUnifiedRfqs();
  if (id === "demo" || id === "1") {
    return rfqs[0] || null;
  }
  return rfqs.find((r) => r.id === id) || rfqs[0] || null;
}

// 1. 구매자: 새 견적 요청서 등록 -> 스토어에 즉시 저장
export function createUnifiedRfq(
  rfqInput: {
    restaurant_id: string;
    title: string;
    region: string;
    contract_months: number;
    delivery_days: string[];
    payment_terms: string;
    deadline: string;
  },
  restaurantProfile: {
    company_name: string;
    address?: string;
    business_number?: string;
    representative?: string;
    phone?: string;
  },
  items: Array<{
    standard_item_id: string;
    item_name: string;
    category?: string;
    spec?: string;
    base_unit?: string;
    monthly_qty: number;
    current_unit_price: number | null;
  }>
): UnifiedRfq {
  const rfqId = `rfq-${Date.now()}`;
  const now = new Date().toISOString();

  const rfq_items: UnifiedRfqItem[] = items.map((item, idx) => ({
    id: `item-${Date.now()}-${idx}`,
    rfq_id: rfqId,
    standard_item_id: item.standard_item_id || `std-${idx}`,
    monthly_qty: item.monthly_qty,
    current_unit_price: item.current_unit_price,
    standard_items: {
      item_name: item.item_name,
      base_unit: item.base_unit || "kg",
      category: item.category || "기타",
      spec: item.spec || "표준 규격",
    },
  }));

  const newRfq: UnifiedRfq = {
    id: rfqId,
    restaurant_id: rfqInput.restaurant_id,
    title: rfqInput.title,
    region: rfqInput.region,
    contract_months: rfqInput.contract_months,
    delivery_days: rfqInput.delivery_days,
    payment_terms: rfqInput.payment_terms,
    deadline: rfqInput.deadline,
    status: "OPEN",
    created_at: now,
    profiles: restaurantProfile,
    rfq_items,
    bids: [], // 신규 공고이므로 초기 입찰은 0건
  };

  const list = getUnifiedRfqs();
  const next = [newRfq, ...list];
  if (typeof window !== "undefined") {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  }

  return newRfq;
}

// 2. 판매자: 특정 RFQ에 입찰서 제출 -> 해당 RFQ의 bids에 저장
export function submitUnifiedBid(
  rfqId: string,
  supplierUser: {
    id: string;
    name: string;
    businessNumber?: string;
    phone?: string;
    description?: string;
  },
  bidData: {
    moq_amount: number;
    price_lock_type: "FIXED" | "INDEXED";
    items: Array<{
      rfq_item_id: string;
      package_weight: number;
      package_price: number;
    }>;
  }
): { success: boolean; bidId?: string; error?: string } {
  const rfqs = getUnifiedRfqs();
  const targetIdx = rfqs.findIndex((r) => r.id === rfqId || (rfqId === "demo" && r.id === SEED_RFQS[0].id));
  if (targetIdx === -1) {
    return { success: false, error: "공고를 찾을 수 없습니다." };
  }

  const targetRfq = rfqs[targetIdx];
  const bidId = `bid-${supplierUser.id}-${Date.now()}`;

  const bid_items: UnifiedBidItem[] = bidData.items.map((bi, idx) => ({
    id: `bi-${Date.now()}-${idx}`,
    bid_id: bidId,
    rfq_item_id: bi.rfq_item_id,
    package_weight: bi.package_weight,
    package_price: bi.package_price,
  }));

  const newBid: UnifiedBid = {
    id: bidId,
    rfq_id: targetRfq.id,
    supplier_id: supplierUser.id,
    status: "SUBMITTED",
    moq_amount: bidData.moq_amount,
    price_lock_type: bidData.price_lock_type,
    created_at: new Date().toISOString(),
    profiles: {
      company_name: supplierUser.name,
      business_number: supplierUser.businessNumber || "123-45-67890",
      phone: supplierUser.phone || "010-0000-0000",
      address: supplierUser.description || "수도권 전역 배송",
      rating: 5.0,
    },
    bid_items,
  };

  // 동일 공급사의 기존 입찰이 있다면 교체, 없으면 추가
  const existingBidIdx = targetRfq.bids.findIndex((b) => b.supplier_id === supplierUser.id);
  if (existingBidIdx >= 0) {
    targetRfq.bids[existingBidIdx] = newBid;
  } else {
    targetRfq.bids.push(newBid);
  }

  rfqs[targetIdx] = { ...targetRfq };

  if (typeof window !== "undefined") {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(rfqs));
  }

  return { success: true, bidId };
}

// 3. 관리자: 전체 공고 및 입찰 현황 관제 데이터 추출
export function getAdminUnifiedStats() {
  const rfqs = getUnifiedRfqs();
  const totalRfqs = rfqs.length;
  const openRfqs = rfqs.filter((r) => r.status === "OPEN").length;
  const totalBids = rfqs.reduce((acc, r) => acc + (r.bids?.length || 0), 0);

  let totalMonthlyVolume = 0;
  rfqs.forEach((r) => {
    (r.rfq_items || []).forEach((item) => {
      if (item.current_unit_price && item.monthly_qty) {
        totalMonthlyVolume += item.current_unit_price * item.monthly_qty;
      }
    });
  });

  return {
    rfqs,
    totalRfqs,
    openRfqs,
    totalBids,
    totalMonthlyVolume,
  };
}
