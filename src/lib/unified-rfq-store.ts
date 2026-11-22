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
        standard_item_id: "a0000000-0000-0000-0000-000000000001",
        monthly_qty: 120,
        current_unit_price: 32000,
        standard_items: {
          item_name: "소고기 안심 (호주산 곡물비육 냉장/원육)",
          base_unit: "kg",
          category: "축산/육류",
          spec: "냉장 1kg 원육 진공포장",
        },
      },
      {
        id: "item-seed-2",
        rfq_id: "d0000000-0000-0000-0000-000000000002",
        standard_item_id: "a0000000-0000-0000-0000-000000000002",
        monthly_qty: 80,
        current_unit_price: 18000,
        standard_items: {
          item_name: "차돌박이 (미국산 초이스 냉동 슬라이스)",
          base_unit: "kg",
          category: "축산/육류",
          spec: "냉동 1kg 슬라이스팩",
        },
      },
      {
        id: "item-seed-3",
        rfq_id: "d0000000-0000-0000-0000-000000000003",
        standard_item_id: "a0000000-0000-0000-0000-000000000003",
        monthly_qty: 150,
        current_unit_price: 2500,
        standard_items: {
          item_name: "양파 (국산 특품 깐양파)",
          base_unit: "kg",
          category: "농산/채소",
          spec: "망/박스 단위 10kg 전처리",
        },
      },
      {
        id: "item-seed-4",
        rfq_id: "d0000000-0000-0000-0000-000000000004",
        standard_item_id: "a0000000-0000-0000-0000-000000000004",
        monthly_qty: 100,
        current_unit_price: 9000,
        standard_items: {
          item_name: "엑스트라 버진 올리브유 (이탈리아산)",
          base_unit: "L",
          category: "가공/오일",
          spec: "5L 캔 포장",
        },
      },
    ],
    bids: [
      {
        id: "bid-seed-1",
        rfq_id: "d0000000-0000-0000-0000-000000000001",
        supplier_id: "c0000000-0000-0000-0000-000000000001",
        status: "SUBMITTED",
        moq_amount: 150000,
        price_lock_type: "FIXED",
        created_at: "2026-11-21T09:30:00.000Z",
        profiles: {
          company_name: "(주)한결축산 유통",
          address: "서울 성동구 마장로 / 수도권 전역 직배송",
          business_number: "123-45-67890",
          phone: "010-1234-5678",
          rating: 4.9,
        },
        bid_items: [
          {
            id: "bi-1-1",
            bid_id: "bid-seed-1",
            rfq_item_id: "item-seed-1",
            package_weight: 1,
            package_price: 28500, // 기존 32000 -> 28500 (-11% 절감)
          },
          {
            id: "bi-1-2",
            bid_id: "bid-seed-1",
            rfq_item_id: "item-seed-2",
            package_weight: 1,
            package_price: 15800, // 기존 18000 -> 15800 (-12% 절감)
          },
        ],
      },
      {
        id: "bid-seed-2",
        rfq_id: "d0000000-0000-0000-0000-000000000001",
        supplier_id: "c0000000-0000-0000-0000-000000000002",
        status: "SUBMITTED",
        moq_amount: 100000,
        price_lock_type: "FIXED",
        created_at: "2026-11-21T11:15:00.000Z",
        profiles: {
          company_name: "가락농산 신선물류",
          address: "서울 송파구 양재대로 (가락시장 직송)",
          business_number: "234-56-78901",
          phone: "010-2345-6789",
          rating: 4.8,
        },
        bid_items: [
          {
            id: "bi-2-3",
            bid_id: "bid-seed-2",
            rfq_item_id: "item-seed-3",
            package_weight: 10,
            package_price: 21000, // 10kg당 21,000원 -> kg당 2,100원 (기존 2500 -> 2100)
          },
          {
            id: "bi-2-4",
            bid_id: "bid-seed-2",
            rfq_item_id: "item-seed-4",
            package_weight: 5,
            package_price: 41000, // 5L당 41,000원 -> L당 8,200원 (기존 9000 -> 8200)
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
