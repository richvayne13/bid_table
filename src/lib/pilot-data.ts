import { createClient } from "@/lib/supabase/client";
import type { CompareBid, CompareRfqItem } from "@/lib/compare-engine";
import type { PriceLockType } from "@/types/database";

export interface PilotSupplierMeta {
  supplierId: string;
  regionLabel: string;
  deliveryWindow: string;
  shippingLabel: string;
  trustBadge: string;
}

export interface PilotDataset {
  source: "local-seed" | "supabase-live";
  rfqTitle: string;
  restaurantName: string;
  region: string;
  deliverySchedule: string;
  queryDurationMs: number;
  queryCount: number;
  items: CompareRfqItem[];
  bids: CompareBid[];
  supplierMeta: Record<string, PilotSupplierMeta>;
  notice?: string;
}

// Module-level hoisted seed dataset (prevents re-allocation on render)
export const PILOT_INITIAL_ITEMS: CompareRfqItem[] = [
  {
    id: "pilot-item-1",
    standard_item_id: "meat-item-001",
    item_name: "초이스 냉장 살치살",
    category: "우육 · 냉장",
    spec: "미국산 EXCEL CH / 스테이크용 1kg 진공",
    base_unit: "kg",
    monthly_qty: 150,
    current_unit_price: 35000,
  },
  {
    id: "pilot-item-2",
    standard_item_id: "meat-item-003",
    item_name: "프라임 냉장 알목심 (척아이롤)",
    category: "우육 · 냉장",
    spec: "미국산 EXCEL PR / 로스·스테이크 1kg",
    base_unit: "kg",
    monthly_qty: 200,
    current_unit_price: 28000,
  },
  {
    id: "pilot-item-3",
    standard_item_id: "meat-item-006",
    item_name: "AMH 냉장 S안심 (텐더로인)",
    category: "우육 · 냉장",
    spec: "호주산 AMH S등급 / 1kg 진공팩",
    base_unit: "kg",
    monthly_qty: 80,
    current_unit_price: 48000,
  },
  {
    id: "pilot-item-4",
    standard_item_id: "meat-item-011",
    item_name: "TEYS 동결 곡물 채끝",
    category: "우육 · 동결",
    spec: "호주산 TEYS GF 스트립로인 / 1kg",
    base_unit: "kg",
    monthly_qty: 100,
    current_unit_price: 33000,
  },
  {
    id: "pilot-item-5",
    standard_item_id: "meat-item-015",
    item_name: "초이스 차돌박이 (2mm 세절)",
    category: "세절육 · 급랭",
    spec: "미국산 CH 2mm 세절팩 / 1kg",
    base_unit: "kg",
    monthly_qty: 70,
    current_unit_price: 23500,
  },
];

export const PILOT_INITIAL_BIDS: CompareBid[] = [
  {
    id: "pilot-bid-1",
    rfq_id: "d0000000-0000-0000-0000-000000000001",
    supplier_id: "pilot-sup-1",
    supplier_name: "벨엘미트",
    moq_amount: 100000,
    price_lock_type: "FIXED",
    trust_score: 99,
    status: "SUBMITTED",
    itemsByRfqItemId: {
      "pilot-item-1": { rfq_item_id: "pilot-item-1", package_weight: 1, package_price: 32500, normalized_unit_price: 32500 },
      "pilot-item-2": { rfq_item_id: "pilot-item-2", package_weight: 1, package_price: 26300, normalized_unit_price: 26300 },
      "pilot-item-3": { rfq_item_id: "pilot-item-3", package_weight: 1, package_price: 44000, normalized_unit_price: 44000 },
      "pilot-item-4": { rfq_item_id: "pilot-item-4", package_weight: 1, package_price: 28500, normalized_unit_price: 28500 },
      "pilot-item-5": { rfq_item_id: "pilot-item-5", package_weight: 1, package_price: 20400, normalized_unit_price: 20400 },
    },
  },
  {
    id: "pilot-bid-2",
    rfq_id: "d0000000-0000-0000-0000-000000000001",
    supplier_id: "pilot-sup-2",
    supplier_name: "성동케이미트",
    moq_amount: 120000,
    price_lock_type: "FIXED",
    trust_score: 97,
    status: "SUBMITTED",
    itemsByRfqItemId: {
      "pilot-item-1": { rfq_item_id: "pilot-item-1", package_weight: 1, package_price: 33000, normalized_unit_price: 33000 },
      "pilot-item-2": { rfq_item_id: "pilot-item-2", package_weight: 1, package_price: 25600, normalized_unit_price: 25600 },
      "pilot-item-3": { rfq_item_id: "pilot-item-3", package_weight: 1, package_price: 44500, normalized_unit_price: 44500 },
      "pilot-item-4": { rfq_item_id: "pilot-item-4", package_weight: 1, package_price: 29400, normalized_unit_price: 29400 },
      "pilot-item-5": { rfq_item_id: "pilot-item-5", package_weight: 1, package_price: 19800, normalized_unit_price: 19800 },
    },
  },
  {
    id: "pilot-bid-3",
    rfq_id: "d0000000-0000-0000-0000-000000000001",
    supplier_id: "pilot-sup-3",
    supplier_name: "한결축산F&B",
    moq_amount: 200000,
    price_lock_type: "INDEXED",
    trust_score: 96,
    status: "SUBMITTED",
    itemsByRfqItemId: {
      "pilot-item-1": { rfq_item_id: "pilot-item-1", package_weight: 1, package_price: 32900, normalized_unit_price: 32900 },
      "pilot-item-2": { rfq_item_id: "pilot-item-2", package_weight: 1, package_price: 26100, normalized_unit_price: 26100 },
      "pilot-item-3": { rfq_item_id: "pilot-item-3", package_weight: 1, package_price: 43200, normalized_unit_price: 43200 },
      "pilot-item-4": { rfq_item_id: "pilot-item-4", package_weight: 1, package_price: 29800, normalized_unit_price: 29800 },
      "pilot-item-5": { rfq_item_id: "pilot-item-5", package_weight: 1, package_price: 20500, normalized_unit_price: 20500 },
    },
  },
  {
    id: "pilot-bid-4",
    rfq_id: "d0000000-0000-0000-0000-000000000001",
    supplier_id: "pilot-sup-4",
    supplier_name: "앤케이도축직송",
    moq_amount: 150000,
    price_lock_type: "FIXED",
    trust_score: 98,
    status: "SUBMITTED",
    itemsByRfqItemId: {
      "pilot-item-1": { rfq_item_id: "pilot-item-1", package_weight: 1, package_price: 33400, normalized_unit_price: 33400 },
      "pilot-item-2": { rfq_item_id: "pilot-item-2", package_weight: 1, package_price: 26800, normalized_unit_price: 26800 },
      "pilot-item-3": { rfq_item_id: "pilot-item-3", package_weight: 1, package_price: 43800, normalized_unit_price: 43800 },
      "pilot-item-4": { rfq_item_id: "pilot-item-4", package_weight: 1, package_price: 28100, normalized_unit_price: 28100 },
      "pilot-item-5": { rfq_item_id: "pilot-item-5", package_weight: 1, package_price: 21200, normalized_unit_price: 21200 },
    },
  },
];

export const PILOT_SUPPLIER_META: Record<string, PilotSupplierMeta> = {
  "pilot-sup-1": {
    supplierId: "pilot-sup-1",
    regionLabel: "마장동 직송",
    deliveryWindow: "익선동 새벽 05:00",
    shippingLabel: "무료배송",
    trustBadge: "단가고정 · 99점",
  },
  "pilot-sup-2": {
    supplierId: "pilot-sup-2",
    regionLabel: "성동구 축산",
    deliveryWindow: "종로구 오전 07:00",
    shippingLabel: "무료배송",
    trustBadge: "단가고정 · 97점",
  },
  "pilot-sup-3": {
    supplierId: "pilot-sup-3",
    regionLabel: "수도권 콜드체인",
    deliveryWindow: "종로구 오전 08:00",
    shippingLabel: "무료배송",
    trustBadge: "시세연동 · 96점",
  },
  "pilot-sup-4": {
    supplierId: "pilot-sup-4",
    regionLabel: "도축장 직송",
    deliveryWindow: "익일 새벽 직송",
    shippingLabel: "무료배송",
    trustBadge: "단가고정 · 98점",
  },
};

export const DEFAULT_PILOT_DATASET: PilotDataset = {
  source: "local-seed",
  rfqTitle: "살롱순라 정기 육류 역경매 견적 비교",
  restaurantName: "살롱순라",
  region: "서울 종로구 익선동",
  deliverySchedule: "월 · 수 · 금 새벽 배송 (MOQ 산정 주 2회 기준)",
  queryDurationMs: 0,
  queryCount: 0,
  items: PILOT_INITIAL_ITEMS,
  bids: PILOT_INITIAL_BIDS,
  supplierMeta: PILOT_SUPPLIER_META,
};

interface SupabaseRfqRow {
  id: string;
  title: string;
  region: string;
  delivery_days: string[] | null;
  restaurant: { company_name: string } | { company_name: string }[] | null;
}

interface SupabaseRfqItemRow {
  id: string;
  standard_item_id: string;
  monthly_qty: number;
  current_unit_price: number | null;
  standard_item:
    | { item_name: string; category: string; spec: string; base_unit: string }
    | { item_name: string; category: string; spec: string; base_unit: string }[]
    | null;
}

interface SupabaseBidRow {
  id: string;
  rfq_id: string;
  supplier_id: string;
  moq_amount: number;
  price_lock_type: PriceLockType;
  status: string;
  supplier: { company_name: string; trust_score: number } | { company_name: string; trust_score: number }[] | null;
  bid_items:
    | Array<{
        rfq_item_id: string;
        package_weight: number;
        package_price: number;
        normalized_unit_price: number;
      }>
    | null;
}

function unwrapSingle<T>(value: T | T[] | null | undefined): T | null {
  if (!value) return null;
  return Array.isArray(value) ? (value[0] ?? null) : value;
}

/**
 * Read-only Supabase batched loader following:
 * - supabase-postgres-best-practices (data-n-plus-one, explicit column projection)
 * - vercel-react-best-practices (async-parallel, async-cheap-condition-before-await)
 */
export async function fetchPilotLiveSnapshot(): Promise<PilotDataset> {
  const startedAt = performance.now();

  // async-cheap-condition-before-await: skip network call if anon key is missing/dummy
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!anonKey || anonKey.includes("dummy")) {
    return {
      ...DEFAULT_PILOT_DATASET,
      notice:
        "환경변수 NEXT_PUBLIC_SUPABASE_ANON_KEY가 설정되지 않아 로컬 시범 데이터로 유지합니다.",
    };
  }

  try {
    const supabase = createClient();

    // Step 1: Select minimal columns for the newest OPEN RFQ
    const { data: rfqData, error: rfqError } = await supabase
      .from("rfqs")
      .select("id, title, region, delivery_days, restaurant:profiles!rfqs_restaurant_id_fkey(company_name)")
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (rfqError || !rfqData) {
      return {
        ...DEFAULT_PILOT_DATASET,
        queryDurationMs: Math.round(performance.now() - startedAt),
        queryCount: 1,
        notice: "Supabase에 조회 가능한 공고가 없거나 접근 권한이 제한되어 로컬 시범 데이터를 표시합니다.",
      };
    }

    const rfqRow = rfqData as unknown as SupabaseRfqRow;

    // Step 2: Parallel batched queries (eliminates waterfall & N+1 per-item/per-bid loops)
    const [itemsRes, bidsRes] = await Promise.all([
      supabase
        .from("rfq_items")
        .select(
          "id, standard_item_id, monthly_qty, current_unit_price, standard_item:standard_items(item_name, category, spec, base_unit)"
        )
        .eq("rfq_id", rfqRow.id),
      supabase
        .from("bids")
        .select(
          "id, rfq_id, supplier_id, moq_amount, price_lock_type, status, supplier:profiles!bids_supplier_id_fkey(company_name, trust_score), bid_items(rfq_item_id, package_weight, package_price, normalized_unit_price)"
        )
        .eq("rfq_id", rfqRow.id),
    ]);

    const durationMs = Math.round(performance.now() - startedAt);
    const rawItems = (itemsRes.data ?? []) as unknown as SupabaseRfqItemRow[];
    const rawBids = (bidsRes.data ?? []) as unknown as SupabaseBidRow[];

    if (itemsRes.error || bidsRes.error || rawItems.length === 0 || rawBids.length === 0) {
      return {
        ...DEFAULT_PILOT_DATASET,
        queryDurationMs: durationMs,
        queryCount: 3,
        notice:
          "Supabase 공고의 품목 또는 입찰 데이터가 비어 있어 로컬 시범 데이터로 안전하게 대체했습니다.",
      };
    }

    const items: CompareRfqItem[] = rawItems.map((row) => {
      const std = unwrapSingle(row.standard_item);
      return {
        id: row.id,
        standard_item_id: row.standard_item_id,
        item_name: std?.item_name ?? "표준 품목",
        category: std?.category ?? "식자재",
        spec: std?.spec ?? "-",
        base_unit: std?.base_unit ?? "kg",
        monthly_qty: Number(row.monthly_qty) || 0,
        current_unit_price: row.current_unit_price ? Number(row.current_unit_price) : null,
      };
    });

    const supplierMeta: Record<string, PilotSupplierMeta> = {};
    const bids: CompareBid[] = rawBids.map((row) => {
      const sup = unwrapSingle(row.supplier);
      const trustScore = Number(sup?.trust_score ?? 95);
      const itemsByRfqItemId: CompareBid["itemsByRfqItemId"] = {};

      for (const bi of row.bid_items ?? []) {
        itemsByRfqItemId[bi.rfq_item_id] = {
          rfq_item_id: bi.rfq_item_id,
          package_weight: Number(bi.package_weight) || 1,
          package_price: Number(bi.package_price) || 0,
          normalized_unit_price: Number(bi.normalized_unit_price) || 0,
        };
      }

      supplierMeta[row.supplier_id] = {
        supplierId: row.supplier_id,
        regionLabel: "Supabase 연동 유통사",
        deliveryWindow: "정기 새벽 직송",
        shippingLabel: "조건부 무료",
        trustBadge: `${row.price_lock_type === "FIXED" ? "단가고정" : "시세연동"} · ${trustScore}점`,
      };

      return {
        id: row.id,
        rfq_id: row.rfq_id,
        supplier_id: row.supplier_id,
        supplier_name: sup?.company_name ?? "입찰 유통사",
        moq_amount: Number(row.moq_amount) || 0,
        price_lock_type: row.price_lock_type,
        trust_score: trustScore,
        status: row.status,
        itemsByRfqItemId,
      };
    });

    const restaurant = unwrapSingle(rfqRow.restaurant);
    const days = rfqRow.delivery_days?.length ? rfqRow.delivery_days.join(" · ") : "주 2회";

    return {
      source: "supabase-live",
      rfqTitle: rfqRow.title,
      restaurantName: restaurant?.company_name ?? "등록 식당",
      region: rfqRow.region,
      deliverySchedule: `${days} 배송 (MOQ 산정 주 2회 기준)`,
      queryDurationMs: durationMs,
      queryCount: 3,
      items,
      bids,
      supplierMeta,
      notice: `읽기 전용 배치 쿼리 3회(${durationMs}ms)로 Supabase 실데이터를 불러왔습니다.`,
    };
  } catch {
    return {
      ...DEFAULT_PILOT_DATASET,
      queryDurationMs: Math.round(performance.now() - startedAt),
      queryCount: 1,
      notice: "Supabase 연결에 실패하여 로컬 시범 데이터로 안전하게 폴백했습니다.",
    };
  }
}
