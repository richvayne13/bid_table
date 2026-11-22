import { NextRequest, NextResponse } from "next/server";
import * as XLSX from "xlsx";

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
    const firstSheetName = workbook.SheetNames[0];

    if (!firstSheetName) {
      return NextResponse.json(
        { error: "시트가 비어 있습니다." },
        { status: 400 }
      );
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

    return NextResponse.json({
      success: true,
      fileName: file.name,
      totalRows: records.length,
      items: parsedCatalog,
    });
  } catch (err) {
    console.error("Catalog parse error:", err);
    return NextResponse.json(
      { error: "엑셀/CSV 단가표 파싱 중 오류가 발생했습니다." },
      { status: 500 }
    );
  }
}
