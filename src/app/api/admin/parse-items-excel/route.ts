import { NextRequest, NextResponse } from "next/server";
import * as XLSX from "xlsx";

const VALID_CATEGORIES = new Set([
  "육류",
  "해산물",
  "유제품",
  "채소/과일",
  "소스/공산품",
]);

const VALID_UNITS = new Set(["kg", "L", "ea"]);

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return NextResponse.json(
        { error: "엑셀(.xlsx, .xls) 또는 CSV 파일이 필요합니다." },
        { status: 400 }
      );
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const workbook = XLSX.read(buffer, { type: "buffer" });
    const firstSheet = workbook.SheetNames[0];
    if (!firstSheet) {
      return NextResponse.json({ error: "시트가 비어 있습니다." }, { status: 400 });
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
        const unitNormalized =
          rawUnit.toLowerCase() === "l"
            ? "L"
            : rawUnit.toLowerCase() === "ea"
            ? "ea"
            : "kg";
        const base_unit = VALID_UNITS.has(unitNormalized) ? unitNormalized : "kg";

        return {
          category,
          item_name: rawName,
          spec: rawSpec || "표준 규격",
          base_unit,
        };
      })
      .filter(
        (
          x
        ): x is {
          category: string;
          item_name: string;
          spec: string;
          base_unit: string;
        } => x !== null
      );

    return NextResponse.json({
      success: true,
      fileName: file.name,
      totalRows: records.length,
      items: parsedItems,
    });
  } catch (err) {
    console.error("Admin items excel parse error:", err);
    return NextResponse.json(
      { error: "표준 품목 엑셀/CSV 파싱 중 오류가 발생했습니다." },
      { status: 500 }
    );
  }
}
