import * as XLSX from "xlsx";
import { evaluateInvoiceAudit } from "@/lib/compare-engine";
import { PriceLockType } from "@/types/database";

export interface ExtractedItem {
  item_name: string;
  monthly_qty: number;
  base_unit: "kg" | "L" | "ea";
  current_unit_price: number | null;
  category: "육류" | "해산물" | "유제품" | "채소/과일" | "소스/공산품";
  matched_spec?: string;
}

const VALID_CATEGORIES = new Set([
  "육류",
  "해산물",
  "유제품",
  "채소/과일",
  "소스/공산품",
]);

const VALID_UNITS = new Set(["kg", "L", "ea"]);

const MOCK_EXTRACTED_ITEMS: ExtractedItem[] = [
  {
    item_name: "소채끝등심",
    monthly_qty: 60,
    base_unit: "kg",
    current_unit_price: 37000,
    category: "육류",
    matched_spec: "미국산 초이스/냉장",
  },
  {
    item_name: "생모짜렐라",
    monthly_qty: 40,
    base_unit: "kg",
    current_unit_price: 18000,
    category: "유제품",
    matched_spec: "이탈리아산 갈바니 1kg 블록",
  },
  {
    item_name: "와일드 루꼴라",
    monthly_qty: 15,
    base_unit: "kg",
    current_unit_price: 23000,
    category: "채소/과일",
    matched_spec: "국산/무농약 500g팩",
  },
  {
    item_name: "엑스트라버진 올리브오일",
    monthly_qty: 25,
    base_unit: "L",
    current_unit_price: 21000,
    category: "소스/공산품",
    matched_spec: "스페인산 보르게스 5L 캔",
  },
  {
    item_name: "파스타면 스파게티",
    monthly_qty: 50,
    base_unit: "kg",
    current_unit_price: 4300,
    category: "소스/공산품",
    matched_spec: "이탈리아산 데체코 No.12 5kg",
  },
  {
    item_name: "차돌박이",
    monthly_qty: 20,
    base_unit: "kg",
    current_unit_price: 21000,
    category: "육류",
    matched_spec: "미국산/냉동 1kg팩",
  },
];

/**
 * 엑셀/CSV 관리자 표준 품목 일괄 파싱 (Client-side)
 */
export async function parseItemsExcel(file: File) {
  const buffer = await file.arrayBuffer();
  const workbook = XLSX.read(buffer, { type: "array" });
  const firstSheet = workbook.SheetNames[0];
  if (!firstSheet) {
    throw new Error("시트가 비어 있습니다.");
  }

  const sheet = workbook.Sheets[firstSheet];
  const records = XLSX.utils.sheet_to_json<Record<string, any>>(sheet, {
    defval: "",
  });

  const parsedItems = records
    .map((rec) => {
      const keys = Object.keys(rec);
      const findVal = (candidates: string[]) => {
        const matchedKey = keys.find((k) =>
          candidates.some((c) => k.replace(/\s+/g, "").toLowerCase().includes(c))
        );
        return matchedKey ? rec[matchedKey] : undefined;
      };

      const rawCategory = String(
        findVal(["카테고리", "분류", "category"]) ?? ""
      ).trim();
      const rawName = String(
        findVal(["품목명", "상품명", "item_name", "name", "품목"]) ?? ""
      ).trim();
      const rawSpec = String(
        findVal(["규격", "세부규격", "원산지", "spec"]) ?? ""
      ).trim();
      const rawUnit = String(
        findVal(["기준단위", "단위", "base_unit", "unit"]) ?? "kg"
      ).trim();

      if (!rawName) return null;

      const category = VALID_CATEGORIES.has(rawCategory)
        ? rawCategory
        : "소스/공산품";
      const base_unit = VALID_UNITS.has(rawUnit) ? rawUnit : "kg";

      return {
        category,
        item_name: rawName,
        spec: rawSpec || "표준규격",
        base_unit,
      };
    })
    .filter((x): x is { category: string; item_name: string; spec: string; base_unit: string } => x !== null);

  return {
    success: true,
    fileName: file.name,
    totalRows: records.length,
    validRows: parsedItems.length,
    items: parsedItems,
  };
}

/**
 * 엑셀/CSV 유통사 단가표 일괄 파싱 (Client-side)
 */
export async function parseCatalogExcel(file: File) {
  const buffer = await file.arrayBuffer();
  const workbook = XLSX.read(buffer, { type: "array" });
  const firstSheetName = workbook.SheetNames[0];

  if (!firstSheetName) {
    throw new Error("시트가 비어 있습니다.");
  }

  const sheet = workbook.Sheets[firstSheetName];
  const records = XLSX.utils.sheet_to_json<Record<string, any>>(sheet, {
    defval: "",
  });

  const parsedCatalog = records
    .map((rec) => {
      const keys = Object.keys(rec);
      const findVal = (candidates: string[]) => {
        const matchedKey = keys.find((k) =>
          candidates.some((c) => k.replace(/\s+/g, "").toLowerCase().includes(c))
        );
        return matchedKey ? rec[matchedKey] : undefined;
      };

      const rawName = String(
        findVal(["품목명", "상품명", "식자재", "item_name", "name", "품목"]) ?? ""
      ).trim();
      const rawWeight = Number(
        String(
          findVal([
            "포장단위",
            "포장중량",
            "중량",
            "규격중량",
            "package_weight",
            "weight",
          ]) ?? ""
        ).replace(/[^0-9.]/g, "")
      );
      const rawPrice = Number(
        String(
          findVal([
            "포장공급가",
            "공급가",
            "박스단가",
            "단가",
            "가격",
            "package_price",
            "price",
          ]) ?? ""
        ).replace(/[^0-9.]/g, "")
      );

      if (
        !rawName ||
        !Number.isFinite(rawWeight) ||
        rawWeight <= 0 ||
        !Number.isFinite(rawPrice) ||
        rawPrice <= 0
      ) {
        return null;
      }
      return {
        name: rawName,
        weight: rawWeight,
        price: Math.round(rawPrice),
      };
    })
    .filter(
      (x): x is { name: string; weight: number; price: number } => x !== null
    );

  return {
    success: true,
    fileName: file.name,
    totalRows: records.length,
    items: parsedCatalog,
  };
}

/**
 * 거래명세서/메뉴판 이미지 품목 추출 (Client-side / Mock fallback)
 */
export async function parseItemsFromImage(file: File | null, forceMock = false) {
  // 클라이언트 브라우저 환경에서는 안전하게 Mock 품목 세트를 즉시 제공
  return {
    success: true,
    mode: "mock",
    isMock: true,
    message: "식자재 거래명세서 샘플 품목 추출 완료",
    fileName: file?.name ?? "demo_sample.png",
    count: MOCK_EXTRACTED_ITEMS.length,
    items: MOCK_EXTRACTED_ITEMS,
  };
}

/**
 * 거래명세서 단가 감사 (Client-side / Mock fallback)
 */
export async function auditInvoiceFromImage(
  file: File | null,
  contractItems: Array<{
    item_name: string;
    normalized_unit_price: number;
    base_unit: string;
    monthly_qty?: number;
    price_lock_type?: PriceLockType;
  }>,
  priceLockType: PriceLockType = "FIXED",
  forceMock = false
) {
  if (!contractItems || contractItems.length === 0) {
    throw new Error("대조할 계약 확정 단가 품목이 없습니다.");
  }

  const invoicedItems = contractItems.map((ci, index) => {
    const basePrice = Number(ci.normalized_unit_price) || 10000;
    const lockType = ci.price_lock_type || priceLockType;
    const deliveryQty = ci.monthly_qty
      ? Math.max(2, Math.round(ci.monthly_qty / 4))
      : 10;

    const shouldViolate = index === 0 || (contractItems.length >= 3 && index === 2);
    let invoicedPrice = basePrice;

    if (shouldViolate) {
      const hikeRate = lockType === "INDEXED" ? 1.15 : 1.08;
      invoicedPrice = Math.round((basePrice * hikeRate) / 100) * 100;
      if (invoicedPrice <= basePrice) invoicedPrice = basePrice + 500;
    } else if (index === 1 && lockType === "INDEXED") {
      invoicedPrice = Math.round((basePrice * 1.04) / 100) * 100;
    }

    return {
      item_name: ci.item_name,
      invoiced_unit_price: invoicedPrice,
      qty: deliveryQty,
    };
  });

  const auditResult = evaluateInvoiceAudit(
    contractItems.map((c) => ({
      item_name: c.item_name,
      normalized_unit_price: c.normalized_unit_price,
      base_unit: c.base_unit,
      monthly_qty: c.monthly_qty,
      price_lock_type: c.price_lock_type || priceLockType,
    })),
    invoicedItems,
    priceLockType
  );

  return {
    success: true,
    isMock: true,
    message: `단가 인상 포함 샘플 거래명세서 대조 완료 (${auditResult.violation_count}건 무단 인상 적발)`,
    rows: auditResult.rows,
    violation_count: auditResult.violation_count,
    total_overcharge: auditResult.total_overcharge,
  };
}
