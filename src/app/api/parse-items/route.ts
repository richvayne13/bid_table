import { NextRequest, NextResponse } from "next/server";

export interface ExtractedItem {
  item_name: string;
  monthly_qty: number;
  base_unit: "kg" | "L" | "ea";
  current_unit_price: number | null;
  category: "육류" | "해산물" | "유제품" | "채소/과일" | "소스/공산품";
  matched_spec?: string;
}

const VALID_UNITS = new Set(["kg", "L", "ea"]);
const VALID_CATEGORIES = new Set([
  "육류",
  "해산물",
  "유제품",
  "채소/과일",
  "소스/공산품",
]);

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

function sanitizeExtractedItems(rawItems: unknown): ExtractedItem[] {
  if (!Array.isArray(rawItems)) return [];
  return rawItems
    .map((raw: any): ExtractedItem | null => {
      const name = typeof raw?.item_name === "string" ? raw.item_name.trim() : "";
      if (!name) return null;

      const qtyNum = Number(raw?.monthly_qty);
      const priceNum =
        raw?.current_unit_price === null || raw?.current_unit_price === "" || raw?.current_unit_price === undefined
          ? null
          : Number(raw.current_unit_price);

      const baseUnit = VALID_UNITS.has(raw?.base_unit) ? raw.base_unit : "kg";
      const category = VALID_CATEGORIES.has(raw?.category)
        ? raw.category
        : "소스/공산품";

      return {
        item_name: name,
        monthly_qty: Number.isFinite(qtyNum) && qtyNum > 0 ? qtyNum : 10,
        base_unit: baseUnit,
        current_unit_price:
          priceNum !== null && Number.isFinite(priceNum) && priceNum >= 0
            ? Math.round(priceNum)
            : null,
        category,
      };
    })
    .filter((item): item is ExtractedItem => item !== null);
}

export async function POST(req: NextRequest) {
  try {
    const contentType = req.headers.get("content-type") || "";
    let file: File | null = null;
    let forceMock = false;

    if (contentType.includes("application/json")) {
      const body = await req.json();
      forceMock = Boolean(body?.mock);
    } else {
      const formData = await req.formData();
      file = formData.get("file") as File | null;
      forceMock = formData.get("mock") === "true";
    }

    if (!file && !forceMock) {
      return NextResponse.json(
        { error: "거래명세서 또는 메뉴판 이미지 파일이 필요합니다." },
        { status: 400 }
      );
    }

    const openAiApiKey = process.env.OPENAI_API_KEY?.trim();

    // OpenAI API Key가 설정되어 있고 실제 파일이 업로드된 경우 gpt-4o-mini Vision 호출
    if (openAiApiKey && file && !forceMock) {
      try {
        const bytes = await file.arrayBuffer();
        const base64 = Buffer.from(bytes).toString("base64");
        const mimeType = file.type || "image/jpeg";

        const response = await fetch("https://api.openai.com/v1/chat/completions", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${openAiApiKey}`,
          },
          body: JSON.stringify({
            model: "gpt-4o-mini",
            response_format: { type: "json_object" },
            messages: [
              {
                role: "system",
                content: `당신은 B2B 식자재 거래명세서 및 식당 메뉴판 전문 OCR 분석 AI입니다.
이미지에서 식자재 품목명(item_name), 월간 예상 소요 수량(monthly_qty: 양수 숫자), 기준 단위(base_unit: "kg" | "L" | "ea"), 현재 매입 단가(current_unit_price: 원화 숫자 또는 null), 카테고리(category: "육류" | "해산물" | "유제품" | "채소/과일" | "소스/공산품")를 추출해 JSON 객체로 반환하세요.
거래명세서의 1회 납품 수량이라면 월 4~8회 납품 기준으로 월간 예상 소요량을 추정하거나, 메뉴판이라면 대표 식자재의 월간 소요량을 합리적으로 추정하세요.
반환 형식:
{
  "items": [
    {
      "item_name": "소채끝등심",
      "monthly_qty": 60,
      "base_unit": "kg",
      "current_unit_price": 37000,
      "category": "육류"
    }
  ]
}`,
              },
              {
                role: "user",
                content: [
                  {
                    type: "text",
                    text: "이 거래명세서(또는 메뉴판) 이미지에서 식자재 품목, 월 예상 소요량, 기준 단위, 현재 매입 단가를 JSON으로 추출해 주세요.",
                  },
                  {
                    type: "image_url",
                    image_url: {
                      url: `data:${mimeType};base64,${base64}`,
                    },
                  },
                ],
              },
            ],
            max_tokens: 1500,
          }),
        });

        if (response.ok) {
          const result = await response.json();
          const rawContent = result.choices?.[0]?.message?.content || "{}";
          const cleaned = rawContent
            .replace(/^```json\s*/i, "")
            .replace(/^```\s*/i, "")
            .replace(/```\s*$/i, "")
            .trim();
          const parsed = JSON.parse(cleaned);
          const sanitized = sanitizeExtractedItems(parsed.items);

          if (sanitized.length > 0) {
            return NextResponse.json({
              success: true,
              isMock: false,
              model: "gpt-4o-mini",
              message: `OpenAI gpt-4o-mini Vision으로 이미지에서 ${sanitized.length}개 품목을 추출했습니다.`,
              items: sanitized,
            });
          }
        } else {
          console.warn("OpenAI API returned non-OK status:", response.status);
        }
      } catch (openAiError) {
        console.warn("OpenAI API call failed, falling back to mock mode:", openAiError);
      }
    }

    // OpenAI API 키가 없거나 Mock 요청/호출 실패 시 샘플 파싱 결과 반환
    return NextResponse.json({
      success: true,
      isMock: true,
      model: "mock-ocr-parser",
      message: openAiApiKey
        ? "샘플 거래명세서 Mock 모드로 6개 식자재 품목을 추출했습니다."
        : "OPENAI_API_KEY가 설정되지 않아 Mock 모드로 샘플 거래명세서 6개 품목을 추출했습니다.",
      items: MOCK_EXTRACTED_ITEMS,
    });
  } catch (error) {
    console.error("Parse items API error:", error);
    return NextResponse.json(
      { error: "이미지 분석 중 오류가 발생했습니다." },
      { status: 500 }
    );
  }
}
