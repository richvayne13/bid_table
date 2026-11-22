import { PriceLockType } from "@/types/database";

export interface CompareRfqItem {
  id: string;
  standard_item_id: string;
  item_name: string;
  category: string;
  spec: string;
  base_unit: string;
  monthly_qty: number;
  current_unit_price: number | null;
}

export interface CompareBidItem {
  rfq_item_id: string;
  package_weight: number;
  package_price: number;
  normalized_unit_price: number;
}

export interface CompareBid {
  id: string;
  rfq_id: string;
  supplier_id: string;
  supplier_name: string;
  moq_amount: number;
  price_lock_type: PriceLockType;
  trust_score: number;
  status: string;
  itemsByRfqItemId: Record<string, CompareBidItem>;
}

// rfq_item_id -> supplier_id
export type SelectionMap = Record<string, string>;

export interface SupplierSelectionStats {
  supplierId: string;
  supplierName: string;
  bidId: string;
  priceLockType: PriceLockType;
  trustScore: number;
  moqAmount: number;
  assignedItemCount: number;
  monthlyTotal: number;
  /** 주 2회 발주(월 8회) 기준 1회 예상 발주액 */
  perDeliveryAmount: number;
  isMoqMet: boolean;
  moqShortfall: number;
}

export interface SelectionEvaluation {
  totalMonthlyAmount: number;
  baselineMonthlyAmount: number;
  monthlySavings: number;
  savingsRatePct: number;
  coveredCount: number;
  totalItemCount: number;
  supplierStats: SupplierSelectionStats[];
  moqViolations: SupplierSelectionStats[];
}

export const DELIVERIES_PER_MONTH_FOR_MOQ = 8; // 주 2회 * 4주

export function evaluateSelection(
  items: CompareRfqItem[],
  bids: CompareBid[],
  selection: SelectionMap
): SelectionEvaluation {
  const bidBySupplier = new Map<string, CompareBid>();
  bids.forEach((b) => bidBySupplier.set(b.supplier_id, b));

  const accBySupplier = new Map<
    string,
    { assignedItemCount: number; monthlyTotal: number }
  >();

  let totalMonthlyAmount = 0;
  let baselineMonthlyAmount = 0;
  let coveredCount = 0;

  items.forEach((item) => {
    const qty = Number(item.monthly_qty) || 0;
    if (item.current_unit_price && item.current_unit_price > 0) {
      baselineMonthlyAmount += item.current_unit_price * qty;
    }

    const chosenSupplierId = selection[item.id];
    if (!chosenSupplierId) return;

    const bid = bidBySupplier.get(chosenSupplierId);
    const bi = bid?.itemsByRfqItemId[item.id];
    if (!bid || !bi) return;

    const lineTotal = bi.normalized_unit_price * qty;
    totalMonthlyAmount += lineTotal;
    coveredCount += 1;

    const prev = accBySupplier.get(chosenSupplierId) || {
      assignedItemCount: 0,
      monthlyTotal: 0,
    };
    prev.assignedItemCount += 1;
    prev.monthlyTotal += lineTotal;
    accBySupplier.set(chosenSupplierId, prev);
  });

  const supplierStats: SupplierSelectionStats[] = [];
  accBySupplier.forEach((acc, supplierId) => {
    const bid = bidBySupplier.get(supplierId)!;
    const perDeliveryAmount = acc.monthlyTotal / DELIVERIES_PER_MONTH_FOR_MOQ;
    const isMoqMet = perDeliveryAmount >= bid.moq_amount;
    supplierStats.push({
      supplierId,
      supplierName: bid.supplier_name,
      bidId: bid.id,
      priceLockType: bid.price_lock_type,
      trustScore: bid.trust_score,
      moqAmount: bid.moq_amount,
      assignedItemCount: acc.assignedItemCount,
      monthlyTotal: acc.monthlyTotal,
      perDeliveryAmount,
      isMoqMet,
      moqShortfall: isMoqMet ? 0 : Math.ceil(bid.moq_amount - perDeliveryAmount),
    });
  });

  const moqViolations = supplierStats.filter((s) => !s.isMoqMet);
  const monthlySavings =
    baselineMonthlyAmount > 0 && coveredCount > 0
      ? baselineMonthlyAmount - totalMonthlyAmount
      : 0;
  const savingsRatePct =
    baselineMonthlyAmount > 0 && monthlySavings > 0
      ? (monthlySavings / baselineMonthlyAmount) * 100
      : 0;

  return {
    totalMonthlyAmount,
    baselineMonthlyAmount,
    monthlySavings,
    savingsRatePct,
    coveredCount,
    totalItemCount: items.length,
    supplierStats,
    moqViolations,
  };
}

/**
 * [단일 업체 최저가]
 * 전체 요청 품목의 90% 이상을 취급하면서 월 예상 총액이 가장 낮은 1개 업체를 선택.
 * 90% 이상 취급 업체가 없으면 취급 품목 수가 가장 많고 월 총액이 낮은 업체를 선택.
 */
export function computeBestSingleSupplier(
  items: CompareRfqItem[],
  bids: CompareBid[]
): {
  supplierId: string | null;
  selection: SelectionMap;
  note: string;
} {
  if (items.length === 0 || bids.length === 0) {
    return { supplierId: null, selection: {}, note: "비교할 입찰 데이터가 없습니다." };
  }

  const candidates = bids.map((bid) => {
    const selection: SelectionMap = {};
    let covered = 0;
    let total = 0;

    items.forEach((item) => {
      const bi = bid.itemsByRfqItemId[item.id];
      if (bi) {
        selection[item.id] = bid.supplier_id;
        covered += 1;
        total += bi.normalized_unit_price * item.monthly_qty;
      }
    });

    const coverageRatio = items.length > 0 ? covered / items.length : 0;
    const perDelivery = total / DELIVERIES_PER_MONTH_FOR_MOQ;
    return {
      bid,
      selection,
      covered,
      coverageRatio,
      total,
      moqMet: perDelivery >= bid.moq_amount,
    };
  });

  const eligible90 = candidates.filter((c) => c.coverageRatio >= 0.9);
  const pool = eligible90.length > 0 ? eligible90 : candidates.filter((c) => c.covered > 0);

  if (pool.length === 0) {
    return { supplierId: null, selection: {}, note: "취급 가능한 품목이 있는 입찰사가 없습니다." };
  }

  pool.sort((a, b) => {
    if (eligible90.length === 0 && b.covered !== a.covered) {
      return b.covered - a.covered;
    }
    return a.total - b.total;
  });

  const winner = pool[0];
  return {
    supplierId: winner.bid.supplier_id,
    selection: winner.selection,
    note: `${winner.bid.supplier_name} 단일 전담 선택 (취급률 ${Math.round(
      winner.coverageRatio * 100
    )}%, 월 예상 ${Math.round(winner.total).toLocaleString("ko-KR")}원)`,
  };
}

/**
 * [최적 2사 분할 조합]
 * 모든 2개 업체 쌍(S1, S2)을 탐색하여 품목별 최저가를 우선 배정하되,
 * 주 2회 발주 기준 회당 발주액(월 발주액 / 8)이 양사 모두 moq_amount 이상이 되도록
 * 공통 취급 품목을 최소 추가비용 순으로 보정(rebalancing)하여 총액이 가장 낮은 조합을 반환.
 */
export function computeOptimalTwoSupplierSplit(
  items: CompareRfqItem[],
  bids: CompareBid[]
): {
  supplierIds: string[];
  selection: SelectionMap;
  moqRebalanced: boolean;
  note: string;
} {
  if (items.length === 0 || bids.length === 0) {
    return {
      supplierIds: [],
      selection: {},
      moqRebalanced: false,
      note: "비교할 입찰 데이터가 없습니다.",
    };
  }

  if (bids.length === 1) {
    const single = computeBestSingleSupplier(items, bids);
    return {
      supplierIds: single.supplierId ? [single.supplierId] : [],
      selection: single.selection,
      moqRebalanced: false,
      note: "입찰사가 1곳뿐이므로 단일 업체로 선택되었습니다.",
    };
  }

  interface PairCandidate {
    s1: CompareBid;
    s2: CompareBid;
    selection: SelectionMap;
    covered: number;
    total: number;
    bothActive: boolean;
    bothMoqMet: boolean;
    rebalanced: boolean;
  }

  const pairResults: PairCandidate[] = [];

  for (let i = 0; i < bids.length; i++) {
    for (let j = i + 1; j < bids.length; j++) {
      const s1 = bids[i];
      const s2 = bids[j];
      const selection: SelectionMap = {};
      let covered = 0;

      // 1. Greedy minimum per item among {s1, s2}
      items.forEach((item) => {
        const b1 = s1.itemsByRfqItemId[item.id];
        const b2 = s2.itemsByRfqItemId[item.id];
        if (b1 && b2) {
          selection[item.id] =
            b1.normalized_unit_price <= b2.normalized_unit_price
              ? s1.supplier_id
              : s2.supplier_id;
          covered += 1;
        } else if (b1) {
          selection[item.id] = s1.supplier_id;
          covered += 1;
        } else if (b2) {
          selection[item.id] = s2.supplier_id;
          covered += 1;
        }
      });

      const calcTotals = (sel: SelectionMap) => {
        let t1 = 0;
        let t2 = 0;
        let c1 = 0;
        let c2 = 0;
        items.forEach((item) => {
          const sid = sel[item.id];
          if (sid === s1.supplier_id && s1.itemsByRfqItemId[item.id]) {
            t1 += s1.itemsByRfqItemId[item.id].normalized_unit_price * item.monthly_qty;
            c1 += 1;
          } else if (sid === s2.supplier_id && s2.itemsByRfqItemId[item.id]) {
            t2 += s2.itemsByRfqItemId[item.id].normalized_unit_price * item.monthly_qty;
            c2 += 1;
          }
        });
        return { t1, t2, c1, c2 };
      };

      let { t1, t2, c1, c2 } = calcTotals(selection);
      let rebalanced = false;

      // 2. MOQ Rebalancing: if one supplier is under MOQ (perDelivery < moq_amount),
      // shift shared items from the other supplier in ascending order of extra cost.
      const tryRebalance = (under: CompareBid, over: CompareBid) => {
        const sharedOnOver = items
          .filter(
            (item) =>
              selection[item.id] === over.supplier_id &&
              Boolean(under.itemsByRfqItemId[item.id]) &&
              Boolean(over.itemsByRfqItemId[item.id])
          )
          .map((item) => {
            const underTotal =
              under.itemsByRfqItemId[item.id].normalized_unit_price * item.monthly_qty;
            const overTotal =
              over.itemsByRfqItemId[item.id].normalized_unit_price * item.monthly_qty;
            return {
              item,
              underTotal,
              overTotal,
              extraCost: underTotal - overTotal,
            };
          })
          .sort((a, b) => a.extraCost - b.extraCost);

        for (const shift of sharedOnOver) {
          const cur = calcTotals(selection);
          const underMonthly = under.supplier_id === s1.supplier_id ? cur.t1 : cur.t2;
          const overMonthly = over.supplier_id === s1.supplier_id ? cur.t1 : cur.t2;
          if (underMonthly / DELIVERIES_PER_MONTH_FOR_MOQ >= under.moq_amount) break;

          // Only shift if `over` still stays above its own MOQ
          const nextOverMonthly = overMonthly - shift.overTotal;
          if (nextOverMonthly / DELIVERIES_PER_MONTH_FOR_MOQ < over.moq_amount) {
            continue;
          }

          selection[shift.item.id] = under.supplier_id;
          rebalanced = true;
        }
      };

      if (c1 > 0 && t1 / DELIVERIES_PER_MONTH_FOR_MOQ < s1.moq_amount) {
        tryRebalance(s1, s2);
      }
      ({ t1, t2, c1, c2 } = calcTotals(selection));
      if (c2 > 0 && t2 / DELIVERIES_PER_MONTH_FOR_MOQ < s2.moq_amount) {
        tryRebalance(s2, s1);
      }
      ({ t1, t2, c1, c2 } = calcTotals(selection));

      const s1Ok = c1 === 0 || t1 / DELIVERIES_PER_MONTH_FOR_MOQ >= s1.moq_amount;
      const s2Ok = c2 === 0 || t2 / DELIVERIES_PER_MONTH_FOR_MOQ >= s2.moq_amount;

      pairResults.push({
        s1,
        s2,
        selection,
        covered,
        total: t1 + t2,
        bothActive: c1 > 0 && c2 > 0,
        bothMoqMet: s1Ok && s2Ok,
        rebalanced,
      });
    }
  }

  // Rank: 1) highest item coverage, 2) both MOQ met, 3) both suppliers active, 4) lowest total
  pairResults.sort((a, b) => {
    if (b.covered !== a.covered) return b.covered - a.covered;
    if (a.bothMoqMet !== b.bothMoqMet) return a.bothMoqMet ? -1 : 1;
    if (a.bothActive !== b.bothActive) return a.bothActive ? -1 : 1;
    return a.total - b.total;
  });

  const best = pairResults[0];
  if (!best) {
    return {
      supplierIds: [],
      selection: {},
      moqRebalanced: false,
      note: "유효한 2사 조합을 찾지 못했습니다.",
    };
  }

  return {
    supplierIds: [best.s1.supplier_id, best.s2.supplier_id],
    selection: best.selection,
    moqRebalanced: best.rebalanced,
    note: `${best.s1.supplier_name} + ${best.s2.supplier_name} 최적 2사 분할 (월 예상 ${Math.round(
      best.total
    ).toLocaleString("ko-KR")}원${best.bothMoqMet ? " · 양사 MOQ 충족" : " · MOQ 재검토 필요"}${
      best.rebalanced ? " · MOQ 자동 보정 적용" : ""
    })`,
  };
}

/**
 * 거래명세서 OCR 단가 대조 로직
 * - FIXED (고정단가형): 계약 단가보다 1원이라도 높으면 무단 인상
 * - INDEXED (시세연동 상한형): 계약 단가 대비 +10% 초과 시 무단 인상
 */
export interface AuditComparisonRow {
  item_name: string;
  base_unit: string;
  qty: number;
  contract_unit_price: number;
  invoiced_unit_price: number;
  diff: number;
  increase_rate_pct: number;
  overcharge_amount: number;
  is_violation: boolean;
  price_lock_type: PriceLockType;
  reason: string;
}

export function evaluateInvoiceAudit(
  contractItems: Array<{
    item_name: string;
    normalized_unit_price: number;
    base_unit: string;
    price_lock_type?: PriceLockType;
  }>,
  invoicedItems: Array<{
    item_name: string;
    invoiced_unit_price: number;
    qty: number;
  }>,
  defaultPriceLockType: PriceLockType = "FIXED"
): {
  rows: AuditComparisonRow[];
  violation_count: number;
  total_overcharge: number;
} {
  const norm = (s: string) => s.replace(/\s+/g, "").toLowerCase();

  const rows: AuditComparisonRow[] = invoicedItems.map((inv) => {
    const matched = contractItems.find((ci) => {
      const a = norm(ci.item_name);
      const b = norm(inv.item_name);
      return a === b || a.includes(b) || b.includes(a);
    });

    const contractPrice = matched ? Number(matched.normalized_unit_price) : 0;
    const lockType: PriceLockType =
      matched?.price_lock_type || defaultPriceLockType;
    const invoicedPrice = Number(inv.invoiced_unit_price) || 0;
    const qty = Number(inv.qty) || 1;
    const diff = Math.round((invoicedPrice - contractPrice) * 100) / 100;
    const increaseRatePct =
      contractPrice > 0 ? Math.round((diff / contractPrice) * 1000) / 10 : 0;

    let isViolation = false;
    let reason = "계약 단가 준수";

    if (matched) {
      if (lockType === "FIXED") {
        if (invoicedPrice > contractPrice) {
          isViolation = true;
          reason = `고정단가형 위반 (+${Math.round(diff).toLocaleString("ko-KR")}원 초과)`;
        }
      } else {
        // INDEXED: +10% 상한 초과 시 위반
        const allowedMax = contractPrice * 1.1;
        if (invoicedPrice > allowedMax + 0.01) {
          isViolation = true;
          reason = `시세연동 +10% 상한 초과 (+${increaseRatePct}%)`;
        } else if (invoicedPrice > contractPrice) {
          reason = `시세연동 허용 범위 내 (+${increaseRatePct}% ≤ 10%)`;
        }
      }
    } else {
      reason = "계약 외 품목";
    }

    const overchargeAmount = isViolation ? Math.max(0, Math.round(diff * qty)) : 0;

    return {
      item_name: matched?.item_name || inv.item_name,
      base_unit: matched?.base_unit || "kg",
      qty,
      contract_unit_price: contractPrice,
      invoiced_unit_price: invoicedPrice,
      diff,
      increase_rate_pct: increaseRatePct,
      overcharge_amount: overchargeAmount,
      is_violation: isViolation,
      price_lock_type: lockType,
      reason,
    };
  });

  const violation_count = rows.filter((r) => r.is_violation).length;
  const total_overcharge = rows.reduce((acc, r) => acc + r.overcharge_amount, 0);

  return { rows, violation_count, total_overcharge };
}
