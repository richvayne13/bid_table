export interface DemoStoredRfq {
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
  rfq_items: Array<{
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
  }>;
  bids: Array<{
    id: string;
    supplier_id: string;
    status: string;
    moq_amount: number;
    price_lock_type: string;
    profiles?: {
      company_name: string;
    };
  }>;
  contracts?: Array<any>;
}

const STORAGE_KEY = "bidplate_demo_rfqs_v1";

export function getStoredDemoRfqs(): DemoStoredRfq[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    return JSON.parse(raw);
  } catch (e) {
    console.error("Failed to load demo rfqs from localStorage:", e);
    return [];
  }
}

export function saveDemoRfq(
  rfqInput: {
    restaurant_id: string;
    title: string;
    region: string;
    contract_months: number;
    delivery_days: string[];
    payment_terms: string;
    deadline: string;
  },
  selectedItems: Array<{
    standard_item_id: string;
    item_name: string;
    category: string;
    spec: string;
    base_unit: string;
    monthly_qty: number;
    current_unit_price: number | null;
  }>
): DemoStoredRfq {
  const rfqId = `demo-rfq-${Date.now()}`;
  const now = new Date().toISOString();

  // 1. RFQ Items 생성
  const rfq_items = selectedItems.map((item, idx) => ({
    id: `item-${Date.now()}-${idx}`,
    rfq_id: rfqId,
    standard_item_id: item.standard_item_id,
    monthly_qty: item.monthly_qty,
    current_unit_price: item.current_unit_price,
    standard_items: {
      item_name: item.item_name,
      base_unit: item.base_unit,
      category: item.category,
      spec: item.spec,
    },
  }));

  // 2. 가상 입찰 3곳 생성 (A종합유통, B미트, C프레시)
  const bids = [
    {
      id: `bid-a-${Date.now()}`,
      supplier_id: "c0000000-0000-0000-0000-000000000001",
      status: "SUBMITTED",
      moq_amount: 150000,
      price_lock_type: "FIXED",
      profiles: {
        company_name: "A종합유통 (대성푸드)",
      },
    },
    {
      id: `bid-b-${Date.now()}`,
      supplier_id: "c0000000-0000-0000-0000-000000000002",
      status: "SUBMITTED",
      moq_amount: 200000,
      price_lock_type: "FIXED",
      profiles: {
        company_name: "B미트 육류전문 (하나미트)",
      },
    },
    {
      id: `bid-c-${Date.now()}`,
      supplier_id: "c0000000-0000-0000-0000-000000000003",
      status: "SUBMITTED",
      moq_amount: 100000,
      price_lock_type: "INDEXED",
      profiles: {
        company_name: "C프레시 신선/유제품 (청주 프레시원)",
      },
    },
  ];

  const newDemoRfq: DemoStoredRfq = {
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
    rfq_items,
    bids,
    contracts: [],
  };

  const existing = getStoredDemoRfqs();
  const next = [newDemoRfq, ...existing];

  if (typeof window !== "undefined") {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  }

  return newDemoRfq;
}
