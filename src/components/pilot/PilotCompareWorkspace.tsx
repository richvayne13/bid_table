"use client";

import React, { useCallback, useMemo, useState, useTransition } from "react";
import Link from "next/link";
import {
  useReactTable,
  getCoreRowModel,
  flexRender,
  type ColumnDef,
} from "@tanstack/react-table";
import {
  AlertTriangle,
  Check,
  Database,
  Minus,
  Plus,
  RefreshCw,
  RotateCcw,
  ShieldCheck,
  SlidersHorizontal,
} from "lucide-react";
import {
  computeBestSingleSupplier,
  computeOptimalTwoSupplierSplit,
  DELIVERIES_PER_MONTH_FOR_MOQ,
  evaluateSelection,
  type CompareBid,
  type CompareRfqItem,
  type SelectionMap,
  type SupplierSelectionStats,
} from "@/lib/compare-engine";
import {
  DEFAULT_PILOT_DATASET,
  fetchPilotLiveSnapshot,
  type PilotDataset,
} from "@/lib/pilot-data";

type StrategyMode = "single" | "two-split" | "custom";

interface SkillAuditItem {
  skillName: string;
  repo: string;
  appliedRule: string;
  evidence: string;
}

// Hoisted static audit ledger (rendering-hoist-jsx / zero per-render allocation)
const APPLIED_SKILL_AUDIT: SkillAuditItem[] = [
  {
    skillName: "frontend-design",
    repo: "anthropics/skills",
    appliedRule: "도메인 중심 원장(Ledger) 미학 · 숫자 정렬 · 장식 최소화",
    evidence:
      "일반 SaaS 카드 나열과 과한 그라데이션을 배제하고, 식자재 도매 원장 톤(#F7F8FA / #131B24 / #9E2A2B)과 tabular-nums 매트릭스에 시선을 집중시켰습니다.",
  },
  {
    skillName: "react-best-practices",
    repo: "vercel-labs/agent-skills",
    appliedRule: "파생 상태 렌더 계산 · 함수형 setState · O(1) Map 조회 · 병렬 로딩",
    evidence:
      "useEffect 기반 상태 동기화를 제거하고 useMemo로 1사·2사·MOQ 평가를 즉시 계산하며, useTransition으로 비동기 조회 중 입력 응답성을 유지합니다.",
  },
  {
    skillName: "supabase-postgres-best-practices",
    repo: "supabase/agent-skills",
    appliedRule: "N+1 제거 배치 조회 · 명시적 컬럼 프로젝션 · 읽기 전용 RLS 검증",
    evidence:
      "select('*') 대신 필요 컬럼만 지정해 Promise.all로 3회 이내 배치 조회하며, 기존 운영 테이블을 변경하지 않는 읽기 전용 검증 모드로 동작합니다.",
  },
];

const POSTGRES_HARDENING_NOTES = [
  {
    rule: "security-rls-performance",
    summary: "RLS 정책에서 auth.uid()를 (select auth.uid())로 감싸 행마다 반복 호출을 방지합니다.",
  },
  {
    rule: "schema-foreign-key-indexes",
    summary: "rfq_items(rfq_id), bids(rfq_id, supplier_id), bid_items(bid_id, rfq_item_id) 복합 인덱스를 유지합니다.",
  },
  {
    rule: "data-n-plus-one",
    summary: "품목별·업체별 루프 쿼리 대신 관계 조인 + Promise.all 1회 배치 로드로 왕복 횟수를 최소화합니다.",
  },
];

function formatWon(value: number): string {
  return `${Math.round(value).toLocaleString("ko-KR")}원`;
}

function buildInitialQtyMap(items: CompareRfqItem[]): Record<string, number> {
  const map: Record<string, number> = {};
  for (const item of items) {
    map[item.id] = item.monthly_qty;
  }
  return map;
}

const SupplierMoqLedger = React.memo(function SupplierMoqLedger({
  stats,
}: {
  stats: SupplierSelectionStats[];
}) {
  if (stats.length === 0) {
    return (
      <p className="text-sm text-[#5A6775]">
        비교표에서 각 품목의 공급사를 선택하면 업체별 최소주문금액(MOQ) 충족 여부가 계산됩니다.
      </p>
    );
  }

  return (
    <div className="divide-y divide-[#E3E8EE]">
      {stats.map((stat) => (
        <div
          key={stat.supplierId}
          className="py-3.5 first:pt-0 last:pb-0 flex flex-col sm:flex-row sm:items-center justify-between gap-2"
        >
          <div className="min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="font-semibold text-[#131B24] text-sm">{stat.supplierName}</span>
              <span className="text-xs text-[#5A6775] tabular-nums">
                배정 {stat.assignedItemCount}품목
              </span>
              <span className="text-xs px-2 py-0.5 rounded bg-[#EFF3F7] text-[#3B4856] font-medium">
                {stat.priceLockType === "FIXED" ? "단가고정" : "시세연동"}
              </span>
            </div>
            <p className="text-xs text-[#5A6775] mt-1 tabular-nums">
              월 합계 {formatWon(stat.monthlyTotal)} / 1회 발주 예상{" "}
              {formatWon(stat.perDeliveryAmount)} (기준 MOQ {formatWon(stat.moqAmount)})
            </p>
          </div>

          <div className="shrink-0">
            {stat.isMoqMet ? (
              <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#1B6B4A] bg-[#EAF6F0] border border-[#CBE7D8] px-2.5 py-1 rounded">
                <Check className="w-3.5 h-3.5" />
                MOQ 충족
              </span>
            ) : (
              <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#9E2A2B] bg-[#FDEEEF] border border-[#F5C6C8] px-2.5 py-1 rounded tabular-nums">
                <AlertTriangle className="w-3.5 h-3.5" />
                회당 {formatWon(stat.moqShortfall)} 부족
              </span>
            )}
          </div>
        </div>
      ))}
    </div>
  );
});

const SkillAuditDrawer = React.memo(function SkillAuditDrawer({
  dataset,
}: {
  dataset: PilotDataset;
}) {
  return (
    <section
      aria-labelledby="pilot-skill-audit-heading"
      className="mt-10 border-t border-[#D8E0E8] pt-8 grid grid-cols-1 lg:grid-cols-12 gap-8"
    >
      <div className="lg:col-span-7">
        <h2
          id="pilot-skill-audit-heading"
          className="text-base font-bold text-[#131B24] tracking-tight"
        >
          시범 페이지에 적용된 GitHub 스킬 3종
        </h2>
        <p className="text-sm text-[#5A6775] mt-1 leading-relaxed max-w-[68ch]">
          워크스페이스의 <code className="text-xs bg-[#EDF1F5] px-1.5 py-0.5 rounded">.agents/skills/</code>에
          설치된 공식 지침을 실제 비교표 구현에 반영했습니다. 메인 홈과 배포본은 수정하지 않았습니다.
        </p>

        <div className="mt-5 divide-y divide-[#E3E8EE] border-y border-[#E3E8EE]">
          {APPLIED_SKILL_AUDIT.map((entry) => (
            <div key={entry.skillName} className="py-4">
              <div className="flex flex-wrap items-baseline justify-between gap-2">
                <span className="font-semibold text-sm text-[#131B24]">{entry.skillName}</span>
                <span className="text-xs text-[#5A6775]">{entry.repo}</span>
              </div>
              <p className="text-xs font-medium text-[#9E2A2B] mt-1">{entry.appliedRule}</p>
              <p className="text-sm text-[#3B4856] mt-1.5 leading-relaxed max-w-[68ch]">
                {entry.evidence}
              </p>
            </div>
          ))}
        </div>
      </div>

      <div className="lg:col-span-5 bg-white border border-[#D8E0E8] rounded-md p-5 h-fit">
        <div className="flex items-center justify-between gap-2 pb-3 border-b border-[#E3E8EE]">
          <div className="flex items-center gap-2">
            <Database className="w-4 h-4 text-[#131B24]" />
            <h3 className="text-sm font-bold text-[#131B24]">Supabase 읽기 전용 점검</h3>
          </div>
          <span className="text-xs font-medium text-[#5A6775] tabular-nums">
            {dataset.source === "supabase-live"
              ? `실연동 · ${dataset.queryCount}회 / ${dataset.queryDurationMs}ms`
              : "로컬 시범 데이터"}
          </span>
        </div>

        <ul className="mt-4 space-y-3">
          {POSTGRES_HARDENING_NOTES.map((note) => (
            <li key={note.rule} className="text-sm text-[#3B4856] leading-relaxed">
              <span className="font-semibold text-[#131B24] block text-xs mb-0.5">
                {note.rule}
              </span>
              {note.summary}
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
});

export function PilotCompareWorkspace() {
  const [dataset, setDataset] = useState<PilotDataset>(DEFAULT_PILOT_DATASET);
  const [qtyMap, setQtyMap] = useState<Record<string, number>>(() =>
    buildInitialQtyMap(DEFAULT_PILOT_DATASET.items)
  );
  const [strategy, setStrategy] = useState<StrategyMode>("two-split");
  const [customSelection, setCustomSelection] = useState<SelectionMap>({});
  const [confirmedNote, setConfirmedNote] = useState<string | null>(null);
  const [isSyncing, startSyncTransition] = useTransition();

  // Derived items with user-adjusted monthly quantities (rerender-derived-state-no-effect)
  const effectiveItems = useMemo<CompareRfqItem[]>(
    () =>
      dataset.items.map((item) => ({
        ...item,
        monthly_qty: qtyMap[item.id] ?? item.monthly_qty,
      })),
    [dataset.items, qtyMap]
  );

  // Derived strategy computations
  const bestSingle = useMemo(
    () => computeBestSingleSupplier(effectiveItems, dataset.bids),
    [effectiveItems, dataset.bids]
  );

  const bestTwoSplit = useMemo(
    () => computeOptimalTwoSupplierSplit(effectiveItems, dataset.bids),
    [effectiveItems, dataset.bids]
  );

  const activeSelection = useMemo<SelectionMap>(() => {
    if (strategy === "single") return bestSingle.selection;
    if (strategy === "two-split") return bestTwoSplit.selection;
    return Object.keys(customSelection).length > 0 ? customSelection : bestTwoSplit.selection;
  }, [strategy, bestSingle.selection, bestTwoSplit.selection, customSelection]);

  const evaluation = useMemo(
    () => evaluateSelection(effectiveItems, dataset.bids, activeSelection),
    [effectiveItems, dataset.bids, activeSelection]
  );

  // js-index-maps: O(1) lowest unit price lookup per item
  const lowestPriceByItemId = useMemo(() => {
    const map = new Map<string, number>();
    for (const item of effectiveItems) {
      let minPrice = Number.POSITIVE_INFINITY;
      for (const bid of dataset.bids) {
        const bi = bid.itemsByRfqItemId[item.id];
        if (bi && bi.normalized_unit_price > 0 && bi.normalized_unit_price < minPrice) {
          minPrice = bi.normalized_unit_price;
        }
      }
      if (Number.isFinite(minPrice)) {
        map.set(item.id, minPrice);
      }
    }
    return map;
  }, [effectiveItems, dataset.bids]);

  // Stable callbacks using functional setState (rerender-functional-setstate)
  const handleQtyDelta = useCallback((itemId: string, delta: number) => {
    setConfirmedNote(null);
    setQtyMap((prev) => {
      const current = prev[itemId] ?? 0;
      const next = Math.max(10, Math.min(2000, current + delta));
      if (next === current) return prev;
      return { ...prev, [itemId]: next };
    });
  }, []);

  const handleQtyInput = useCallback((itemId: string, rawValue: string) => {
    setConfirmedNote(null);
    const parsed = Number.parseInt(rawValue, 10);
    if (Number.isNaN(parsed)) return;
    const clamped = Math.max(1, Math.min(5000, parsed));
    setQtyMap((prev) => (prev[itemId] === clamped ? prev : { ...prev, [itemId]: clamped }));
  }, []);

  const handleSelectCell = useCallback(
    (itemId: string, supplierId: string) => {
      setConfirmedNote(null);
      setCustomSelection((prev) => {
        const base = Object.keys(prev).length > 0 ? prev : activeSelection;
        return { ...base, [itemId]: supplierId };
      });
      setStrategy("custom");
    },
    [activeSelection]
  );

  const handleResetQuantities = useCallback(() => {
    setConfirmedNote(null);
    setQtyMap(buildInitialQtyMap(dataset.items));
    setStrategy("two-split");
    setCustomSelection({});
  }, [dataset.items]);

  const handleLoadSupabaseSnapshot = useCallback(() => {
    setConfirmedNote(null);
    startSyncTransition(() => {
      void fetchPilotLiveSnapshot().then((nextData) => {
        setDataset(nextData);
        setQtyMap(buildInitialQtyMap(nextData.items));
        setCustomSelection({});
        setStrategy("two-split");
      });
    });
  }, []);

  const handleSimulateConfirm = useCallback(() => {
    const names = evaluation.supplierStats.map((s) => s.supplierName).join(", ");
    setConfirmedNote(
      `시범 조합 저장 완료: ${names || "선택 업체 없음"} · 월 예상 ${formatWon(
        evaluation.totalMonthlyAmount
      )} (실제 DB에는 기록되지 않습니다)`
    );
  }, [evaluation.supplierStats, evaluation.totalMonthlyAmount]);

  const columns = useMemo<ColumnDef<CompareRfqItem>[]>(() => {
    const baseColumns: ColumnDef<CompareRfqItem>[] = [
      {
        id: "item",
        header: () => <span>품목 · 규격</span>,
        cell: ({ row }) => {
          const item = row.original;
          return (
            <div className="min-w-[210px]">
              <div className="font-semibold text-[#131B24] text-sm">{item.item_name}</div>
              <div className="text-xs text-[#5A6775] mt-0.5">{item.spec}</div>
              <span className="inline-block text-[11px] text-[#4B5866] mt-1">
                {item.category}
              </span>
            </div>
          );
        },
      },
      {
        id: "monthly_qty",
        header: () => <span className="block text-right">월 발주량</span>,
        cell: ({ row }) => {
          const item = row.original;
          return (
            <div className="flex items-center justify-end gap-1">
              <button
                type="button"
                onClick={() => handleQtyDelta(item.id, -10)}
                aria-label={`${item.item_name} 수량 10 감소`}
                className="w-7 h-7 inline-flex items-center justify-center rounded border border-[#CFD8E2] bg-white text-[#131B24] hover:bg-[#EFF3F7] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#9E2A2B]"
              >
                <Minus className="w-3.5 h-3.5" />
              </button>
              <input
                type="number"
                min={1}
                max={5000}
                value={item.monthly_qty}
                onChange={(e) => handleQtyInput(item.id, e.target.value)}
                aria-label={`${item.item_name} 월 발주 수량`}
                className="w-16 h-7 text-right text-sm font-semibold tabular-nums text-[#131B24] bg-white border border-[#CFD8E2] rounded px-1.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#9E2A2B]"
              />
              <button
                type="button"
                onClick={() => handleQtyDelta(item.id, 10)}
                aria-label={`${item.item_name} 수량 10 증가`}
                className="w-7 h-7 inline-flex items-center justify-center rounded border border-[#CFD8E2] bg-white text-[#131B24] hover:bg-[#EFF3F7] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#9E2A2B]"
              >
                <Plus className="w-3.5 h-3.5" />
              </button>
              <span className="text-xs text-[#5A6775] w-6 text-left">{item.base_unit}</span>
            </div>
          );
        },
      },
      {
        id: "baseline",
        header: () => <span className="block text-right">기존 단가</span>,
        cell: ({ row }) => {
          const item = row.original;
          return (
            <div className="text-right tabular-nums">
              <div className="text-sm text-[#4B5866]">
                {item.current_unit_price ? formatWon(item.current_unit_price) : "-"}
              </div>
              {item.current_unit_price ? (
                <div className="text-[11px] text-[#7A8794] mt-0.5">
                  월 {formatWon(item.current_unit_price * item.monthly_qty)}
                </div>
              ) : null}
            </div>
          );
        },
      },
    ];

    const supplierColumns: ColumnDef<CompareRfqItem>[] = dataset.bids.map((bid) => {
      const meta = dataset.supplierMeta[bid.supplier_id];
      return {
        id: `supplier-${bid.supplier_id}`,
        header: () => (
          <div className="text-right min-w-[144px]">
            <div className="font-bold text-[#131B24] text-sm">{bid.supplier_name}</div>
            <div className="text-[11px] font-normal text-[#5A6775] mt-0.5">
              {meta ? meta.trustBadge : `신뢰 ${bid.trust_score}점`}
            </div>
            <div className="text-[11px] font-normal text-[#6C7A89] tabular-nums">
              MOQ {formatWon(bid.moq_amount)}
            </div>
          </div>
        ),
        cell: ({ row }) => {
          const item = row.original;
          const bidItem = bid.itemsByRfqItemId[item.id];
          if (!bidItem) {
            return <div className="text-right text-xs text-[#9AA5B1]">미취급</div>;
          }

          const isSelected = activeSelection[item.id] === bid.supplier_id;
          const isLowest = lowestPriceByItemId.get(item.id) === bidItem.normalized_unit_price;
          const lineTotal = bidItem.normalized_unit_price * item.monthly_qty;
          const unitSavings =
            item.current_unit_price && item.current_unit_price > bidItem.normalized_unit_price
              ? item.current_unit_price - bidItem.normalized_unit_price
              : 0;

          return (
            <button
              type="button"
              onClick={() => handleSelectCell(item.id, bid.supplier_id)}
              aria-pressed={isSelected}
              className={`w-full text-right px-3 py-2 rounded border transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#9E2A2B] ${
                isSelected
                  ? "bg-[#9E2A2B] text-white border-[#9E2A2B]"
                  : "bg-white text-[#131B24] border-[#E3E8EE] hover:border-[#9E2A2B]/60 hover:bg-[#FCF7F7]"
              }`}
            >
              <div className="flex items-center justify-end gap-1.5 tabular-nums">
                {isLowest ? (
                  <span
                    className={`text-[10px] font-semibold px-1.5 py-0.5 rounded ${
                      isSelected
                        ? "bg-white/20 text-white"
                        : "bg-[#EAF6F0] text-[#1B6B4A]"
                    }`}
                  >
                    최저
                  </span>
                ) : null}
                <span className="font-bold text-sm">
                  {formatWon(bidItem.normalized_unit_price)}
                </span>
              </div>
              <div
                className={`text-[11px] mt-0.5 tabular-nums ${
                  isSelected ? "text-white/85" : "text-[#5A6775]"
                }`}
              >
                월 {formatWon(lineTotal)}
              </div>
              {unitSavings > 0 ? (
                <div
                  className={`text-[10px] mt-0.5 tabular-nums ${
                    isSelected ? "text-white/90" : "text-[#1B6B4A]"
                  }`}
                >
                  kg당 -{unitSavings.toLocaleString("ko-KR")}원
                </div>
              ) : null}
            </button>
          );
        },
      };
    });

    return [...baseColumns, ...supplierColumns];
  }, [
    dataset.bids,
    dataset.supplierMeta,
    activeSelection,
    lowestPriceByItemId,
    handleQtyDelta,
    handleQtyInput,
    handleSelectCell,
  ]);

  const table = useReactTable({
    data: effectiveItems,
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  const strategyNote =
    strategy === "single"
      ? bestSingle.note
      : strategy === "two-split"
        ? bestTwoSplit.note
        : "셀을 클릭해 품목별 공급사를 직접 배정한 상태입니다.";

  return (
    <div className="min-h-screen bg-[#F7F8FA] text-[#131B24]">
      {/* Pilot isolation banner */}
      <div className="bg-[#131B24] text-white border-b border-[#24303E]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-2.5 flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2.5">
            <span className="px-2 py-0.5 rounded bg-[#9E2A2B] text-white font-semibold">
              시범 사이트 /pilot
            </span>
            <span className="text-[#CBD5E1]">
              메인 사이트와 실배포본을 건드리지 않고 3종 SKILL.md를 시험 적용한 독립 환경입니다.
            </span>
          </div>
          <div className="flex items-center gap-4">
            <Link href="/prototypes" className="text-[#CBD5E1] hover:text-white underline underline-offset-4">
              도안 갤러리
            </Link>
            <Link href="/" className="text-white font-semibold hover:underline underline-offset-4">
              메인 홈으로 돌아가기
            </Link>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10">
        {/* Editorial header */}
        <header className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 pb-6 border-b border-[#D8E0E8]">
          <div>
            <p className="text-xs font-medium text-[#5A6775]">
              {dataset.restaurantName} · {dataset.region} · {dataset.deliverySchedule}
            </p>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-[#131B24] mt-1.5">
              {dataset.rfqTitle}
            </h1>
            <p className="text-sm text-[#4B5866] mt-2 max-w-[66ch] leading-relaxed">
              월간 발주량을 조정하거나 공급사 단가 셀을 클릭하면 단일 전담, 최적 2사 분할,
              회당 MOQ 충족 여부가 즉시 다시 계산됩니다.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={handleLoadSupabaseSnapshot}
              disabled={isSyncing}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded border border-[#CFD8E2] bg-white text-xs font-semibold text-[#131B24] hover:bg-[#EFF3F7] disabled:opacity-60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#9E2A2B]"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? "animate-spin" : ""}`} />
              {isSyncing ? "Supabase 조회 중" : "Supabase 실데이터 조회"}
            </button>
            <button
              type="button"
              onClick={handleResetQuantities}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded border border-[#CFD8E2] bg-white text-xs font-semibold text-[#3B4856] hover:bg-[#EFF3F7] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#9E2A2B]"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              수량 초기화
            </button>
          </div>
        </header>

        {dataset.notice ? (
          <div
            role="status"
            className="mt-4 px-4 py-2.5 rounded border border-[#D8E0E8] bg-white text-xs text-[#3B4856] flex items-center justify-between gap-2"
          >
            <span>{dataset.notice}</span>
            <span className="text-[#5A6775] shrink-0">읽기 전용</span>
          </div>
        ) : null}

        {/* Unified Ledger Summary Strip + Strategy Controls */}
        <section
          aria-label="조합 전략 및 월간 절감 요약"
          className="mt-6 bg-white border border-[#D8E0E8] rounded-md"
        >
          <div className="p-4 sm:p-5 flex flex-col lg:flex-row lg:items-center justify-between gap-5">
            <div>
              <div className="flex items-center gap-1.5 text-xs font-semibold text-[#5A6775] mb-2">
                <SlidersHorizontal className="w-3.5 h-3.5" />
                <span>조합 전략 선택</span>
              </div>
              <div className="inline-flex rounded border border-[#CFD8E2] bg-[#F7F8FA] p-0.5">
                <button
                  type="button"
                  onClick={() => {
                    setConfirmedNote(null);
                    setStrategy("single");
                  }}
                  className={`px-3.5 py-1.5 text-xs font-semibold rounded transition-colors ${
                    strategy === "single"
                      ? "bg-[#131B24] text-white"
                      : "text-[#3B4856] hover:text-[#131B24]"
                  }`}
                >
                  단일 최저가
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setConfirmedNote(null);
                    setStrategy("two-split");
                  }}
                  className={`px-3.5 py-1.5 text-xs font-semibold rounded transition-colors ${
                    strategy === "two-split"
                      ? "bg-[#9E2A2B] text-white"
                      : "text-[#3B4856] hover:text-[#131B24]"
                  }`}
                >
                  최적 2사 분할
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setConfirmedNote(null);
                    setStrategy("custom");
                  }}
                  className={`px-3.5 py-1.5 text-xs font-semibold rounded transition-colors ${
                    strategy === "custom"
                      ? "bg-[#131B24] text-white"
                      : "text-[#3B4856] hover:text-[#131B24]"
                  }`}
                >
                  직접 선택
                </button>
              </div>
              <p className="text-xs text-[#5A6775] mt-2">{strategyNote}</p>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-5 sm:gap-8 lg:border-l lg:border-[#E3E8EE] lg:pl-8">
              <div>
                <div className="text-xs text-[#5A6775]">선택 조합 월 총액</div>
                <div className="text-xl sm:text-2xl font-bold text-[#131B24] tabular-nums mt-0.5">
                  {formatWon(evaluation.totalMonthlyAmount)}
                </div>
                <div className="text-[11px] text-[#5A6775] tabular-nums mt-0.5">
                  기존 {formatWon(evaluation.baselineMonthlyAmount)}
                </div>
              </div>

              <div>
                <div className="text-xs text-[#5A6775]">월 예상 절감액</div>
                <div className="text-xl sm:text-2xl font-bold text-[#1B6B4A] tabular-nums mt-0.5">
                  {evaluation.monthlySavings > 0
                    ? `-${formatWon(evaluation.monthlySavings)}`
                    : "0원"}
                </div>
                <div className="text-[11px] text-[#1B6B4A] font-medium tabular-nums mt-0.5">
                  절감률 {evaluation.savingsRatePct.toFixed(1)}%
                </div>
              </div>

              <div className="col-span-2 sm:col-span-1 flex sm:flex-col justify-between sm:justify-center items-center sm:items-end gap-2">
                <div className="text-xs text-[#5A6775] tabular-nums">
                  배정 {evaluation.coveredCount}/{evaluation.totalItemCount}품목 ·{" "}
                  {evaluation.moqViolations.length === 0 ? (
                    <span className="text-[#1B6B4A] font-semibold">MOQ 이상 없음</span>
                  ) : (
                    <span className="text-[#9E2A2B] font-semibold">
                      MOQ 미달 {evaluation.moqViolations.length}곳
                    </span>
                  )}
                </div>
                <button
                  type="button"
                  onClick={handleSimulateConfirm}
                  className="px-4 py-2 rounded bg-[#9E2A2B] hover:bg-[#822021] text-white text-xs font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[#9E2A2B]"
                >
                  시범 조합 저장
                </button>
              </div>
            </div>
          </div>

          {confirmedNote ? (
            <div className="px-5 py-3 bg-[#EAF6F0] border-t border-[#CBE7D8] text-xs font-medium text-[#15573B] flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 shrink-0" />
              <span>{confirmedNote}</span>
            </div>
          ) : null}
        </section>

        {/* Primary Centerpiece: TanStack Table v8 Horizontal x Vertical Matrix */}
        <section aria-label="공급사 단가 매트릭스 비교표" className="mt-6">
          <div className="bg-white border border-[#D8E0E8] rounded-md overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full border-collapse text-left">
                <thead>
                  {table.getHeaderGroups().map((headerGroup) => (
                    <tr
                      key={headerGroup.id}
                      className="bg-[#F1F4F8] border-b border-[#D8E0E8] text-xs font-semibold text-[#3B4856]"
                    >
                      {headerGroup.headers.map((header) => (
                        <th key={header.id} className="px-4 py-3.5 align-bottom">
                          {header.isPlaceholder
                            ? null
                            : flexRender(header.column.columnDef.header, header.getContext())}
                        </th>
                      ))}
                    </tr>
                  ))}
                </thead>
                <tbody className="divide-y divide-[#E3E8EE]">
                  {table.getRowModel().rows.map((row) => (
                    <tr key={row.id} className="hover:bg-[#FAFBFD] transition-colors">
                      {row.getVisibleCells().map((cell) => (
                        <td key={cell.id} className="px-4 py-3.5 align-middle">
                          {flexRender(cell.column.columnDef.cell, cell.getContext())}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </section>

        {/* MOQ Validation Breakdown */}
        <section
          aria-labelledby="pilot-moq-heading"
          className="mt-6 bg-white border border-[#D8E0E8] rounded-md p-5"
        >
          <div className="flex flex-wrap items-baseline justify-between gap-2 pb-3 border-b border-[#E3E8EE]">
            <h2 id="pilot-moq-heading" className="text-sm font-bold text-[#131B24]">
              배정 업체별 최소주문금액(MOQ) 검증
            </h2>
            <span className="text-xs text-[#5A6775] tabular-nums">
              주 2회 발주(월 {DELIVERIES_PER_MONTH_FOR_MOQ}회) 기준 1회 예상 발주액
            </span>
          </div>
          <div className="mt-4">
            <SupplierMoqLedger stats={evaluation.supplierStats} />
          </div>
        </section>

        {/* Skill Audit & Supabase Optimization Reference */}
        <SkillAuditDrawer dataset={dataset} />
      </div>
    </div>
  );
}
