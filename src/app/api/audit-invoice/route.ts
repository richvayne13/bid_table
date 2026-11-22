import { NextRequest, NextResponse } from "next/server";
import { evaluateInvoiceAudit } from "@/lib/compare-engine";
import { PriceLockType } from "@/types/database";

interface ContractItemInput {
  item_name: string;
  normalized_unit_price: number;
  base_unit: string;
  monthly_qty?: number;
  price_lock_type?: PriceLockType;
}

export async function POST(req: NextRequest) {
  try {
    const contentType = req.headers.get("content-type") || "";
    let file: File | null = null;
    let forceMock = false;
    let contractItems: ContractItemInput[] = [];
    let defaultPriceLockType: PriceLockType = "FIXED";

    if (contentType.includes("application/json")) {
      const body = await req.json();
      forceMock = Boolean(body?.mock);
      contractItems = Array.isArray(body?.contractItems) ? body.contractItems : [];
      defaultPriceLockType =
        body?.priceLockType === "INDEXED" ? "INDEXED" : "FIXED";
    } else {
      const formData = await req.formData();
      file = formData.get("file") as File | null;
      forceMock = formData.get("mock") === "true";
      const rawContractItems = formData.get("contractItems") as string | null;
      if (rawContractItems) {
        try {
          contractItems = JSON.parse(rawContractItems);
        } catch {
          contractItems = [];
        }
      }
      const rawLock = formData.get("priceLockType") as string | null;
      defaultPriceLockType = rawLock === "INDEXED" ? "INDEXED" : "FIXED";
    }

    if (contractItems.length === 0) {
      return NextResponse.json(
        { error: "대조할 계약 확정 단가 품목이 없습니다." },
        { status: 400 }
      );
    }

    const openAiApiKey = process.env.OPENAI_API_KEY?.trim();
    let invoicedItems: Array<{
      item_name: string;
      invoiced_unit_price: number;
      qty: number;
    }> | null = null;
    let isMock = true;

    // OpenAI API Key가 있고 실제 거래명세서 이미지가 업로드된 경우 Vision OCR 실행
    if (openAiApiKey && file && !forceMock) {
      try {
        const bytes = await file.arrayBuffer();
        const base64 = Buffer.from(bytes).toString("base64");
        const mimeType = file.type || "image/jpeg";
        const itemNamesHint = contractItems.map((c) => c.item_name).join(", ");

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
                content: `당신은 B2B 식자재 납품 거래명세서 OCR 감사 AI입니다.
이미지에서 납품된 각 식자재의 품목명(item_name), 기준단위 환산 청구 단가(invoiced_unit_price: 원화 숫자), 납품 수량(qty: 숫자)을 추출해 JSON으로 반환하세요.
계약 품목 목록 참고: ${itemNamesHint}
반환 형식:
{
  "items": [
    { "item_name": "소채끝등심", "invoiced_unit_price": 35500, "qty": 10 }
  ]
}`,
              },
              {
                role: "user",
                content: [
                  {
                    type: "text",
                    text: "이 거래명세서 이미지에서 각 품목명, 청구 단가, 납품 수량을 추출해 주세요.",
                  },
                  {
                    type: "image_url",
                    image_url: { url: `data:${mimeType};base64,${base64}` },
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
          if (Array.isArray(parsed.items) && parsed.items.length > 0) {
            invoicedItems = parsed.items.map((it: any) => ({
              item_name: String(it.item_name || "").trim(),
              invoiced_unit_price: Number(it.invoiced_unit_price) || 0,
              qty: Number(it.qty) > 0 ? Number(it.qty) : 1,
            }));
            isMock = false;
          }
        }
      } catch (err) {
        console.warn("OpenAI Vision invoice audit failed, using mock sample:", err);
      }
    }

    // Mock 모드: 계약 품목 기반 현실적인 단가 인상 포함 샘플 명세서 생성
    if (!invoicedItems) {
      isMock = true;
      invoicedItems = contractItems.map((ci, index) => {
        const basePrice = Number(ci.normalized_unit_price) || 10000;
        const lockType = ci.price_lock_type || defaultPriceLockType;
        const deliveryQty = ci.monthly_qty
          ? Math.max(2, Math.round(ci.monthly_qty / 4))
          : 10;

        // 첫 번째 품목(및 품목이 3개 이상일 경우 3번째 품목)에 무단 단가 인상 시뮬레이션 적용
        const shouldViolate = index === 0 || (contractItems.length >= 3 && index === 2);
        let invoicedPrice = basePrice;

        if (shouldViolate) {
          // FIXED는 +8% 인상, INDEXED는 +15% 인상(+10% 상한 명백 초과)
          const hikeRate = lockType === "INDEXED" ? 1.15 : 1.08;
          invoicedPrice = Math.round((basePrice * hikeRate) / 100) * 100;
          if (invoicedPrice <= basePrice) invoicedPrice = basePrice + 500;
        } else if (index === 1 && lockType === "INDEXED") {
          // INDEXED 허용 범위 내 소폭 변동 (+4% <= 10%)
          invoicedPrice = Math.round((basePrice * 1.04) / 100) * 100;
        }

        return {
          item_name: ci.item_name,
          invoiced_unit_price: invoicedPrice,
          qty: deliveryQty,
        };
      });
    }

    const auditResult = evaluateInvoiceAudit(
      contractItems,
      invoicedItems,
      defaultPriceLockType
    );

    return NextResponse.json({
      success: true,
      isMock,
      message: isMock
        ? `단가 인상 포함 샘플 거래명세서 대조 완료 (${auditResult.violation_count}건 무단 인상 적발)`
        : `GPT-4o-mini Vision 거래명세서 OCR 대조 완료 (${auditResult.violation_count}건 무단 인상 적발)`,
      ...auditResult,
    });
  } catch (err) {
    console.error("Audit invoice API error:", err);
    return NextResponse.json(
      { error: "거래명세서 대조 분석 중 오류가 발생했습니다." },
      { status: 500 }
    );
  }
}
