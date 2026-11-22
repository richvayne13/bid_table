import React from "react";
import Link from "next/link";

interface BidTableLogoProps {
  size?: "sm" | "md" | "lg";
  showText?: boolean;
  className?: string;
}

export function BidTableLogoIcon({ size = "md", className = "" }: { size?: "sm" | "md" | "lg"; className?: string }) {
  const dim = size === "sm" ? 32 : size === "lg" ? 54 : 42;

  return (
    <div
      className={`relative flex items-center justify-center shrink-0 rounded-2xl shadow-md shadow-blue-500/25 ${className}`}
      style={{
        width: dim,
        height: dim,
        background: "linear-gradient(135deg, #3B82F6 0%, #1D4ED8 100%)",
      }}
      title="견적식탁 (BidTable)"
    >
      <svg
        viewBox="0 0 100 100"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="w-[84%] h-[84%]"
      >
        {/* 1. 도톰한 고기/스테이크 덩어리 베이스 (Juicy Meat Cut) */}
        {/* 고기 하단 두께감 음영 */}
        <path
          d="M22 66 C22 56 32 50 48 49 C65 48 80 54 80 65 C80 74 68 80 50 80 C32 80 22 75 22 66 Z"
          fill="white"
          fillOpacity="0.25"
        />
        {/* 고기 본체 (스테이크 단면 실루엣) */}
        <path
          d="M20 60 C18 48 30 42 46 41 C64 40 82 46 82 58 C82 70 68 76 50 76 C28 76 22 71 20 60 Z"
          fill="white"
        />
        {/* 고기 단면 안쪽 마블링/그릴 라인 (파란색 포인트 디테일) */}
        <path
          d="M32 54 Q44 50 58 52"
          stroke="#1D4ED8"
          strokeWidth="2.5"
          strokeLinecap="round"
        />
        <path
          d="M36 62 Q50 58 66 60"
          stroke="#1D4ED8"
          strokeWidth="2.5"
          strokeLinecap="round"
        />
        {/* 고기 측면 두께 입체감 라인 */}
        <path
          d="M20 60 C20 69 28 76 48 76 C68 76 82 69 82 58 L82 64 C82 73 68 80 48 80 C28 80 20 73 20 64 Z"
          fill="white"
          fillOpacity="0.85"
        />

        {/* 2. 고기에 비스듬히 콕 찔려있는 포크 (Fork stabbed into meat) */}
        <g transform="rotate(-18 52 46)">
          {/* 포크 손잡이 (Handle) */}
          <rect x="50" y="8" width="4.5" height="34" rx="2.25" fill="white" />
          {/* 포크 손잡이 상단 장식 원 */}
          <circle cx="52.25" cy="9" r="3.2" fill="white" />

          {/* 포크 숄더 / 넥 (Shoulder) */}
          <path
            d="M44 38 Q52.25 44 60.5 38 L58.5 44 Q52.25 49 46 44 Z"
            fill="white"
          />

          {/* 포크 3개 갈래 (Tines) - 고기 표면(y:46~56) 속으로 푹 들어간 형태 */}
          <rect x="44.5" y="38" width="2.5" height="18" rx="1" fill="white" />
          <rect x="51" y="38" width="2.5" height="19" rx="1" fill="white" />
          <rect x="57.5" y="38" width="2.5" height="18" rx="1" fill="white" />
        </g>

        {/* 3. 포크가 찔린 자리 맛있는 스파클 임팩트 (Impact Star / Freshness) */}
        <path
          d="M72 32 L74 27 L76 32 L81 34 L76 36 L74 41 L72 36 L67 34 Z"
          fill="white"
          opacity="0.9"
        />
        <circle cx="28" cy="30" r="2" fill="white" opacity="0.8" />
      </svg>
    </div>
  );
}

export default function BidTableLogo({
  size = "md",
  showText = true,
  className = "",
}: BidTableLogoProps) {
  return (
    <Link
      href="/"
      className={`inline-flex items-center space-x-2.5 group select-none transition-transform active:scale-95 ${className}`}
    >
      <BidTableLogoIcon size={size} />
      {showText && (
        <div className="flex flex-col">
          <div className="flex items-center space-x-1.5">
            <span className="font-black tracking-tight text-gray-900 group-hover:text-blue-600 transition-colors text-lg sm:text-xl">
              견적식탁
            </span>
            <span className="text-[10px] font-extrabold uppercase px-1.5 py-0.5 rounded-md bg-blue-50 text-blue-700 border border-blue-200 tracking-wider">
              BidTable
            </span>
          </div>
          <span className="text-[11px] text-gray-400 font-medium -mt-1 hidden sm:block">
            외식업 식자재 역경매 & 단가방어
          </span>
        </div>
      )}
    </Link>
  );
}
