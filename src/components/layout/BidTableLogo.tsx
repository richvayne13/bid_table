import React from "react";
import Link from "next/link";

interface BidTableLogoProps {
  size?: "sm" | "md" | "lg";
  showText?: boolean;
  className?: string;
}

export function BidTableLogoIcon({ size = "md", className = "" }: { size?: "sm" | "md" | "lg"; className?: string }) {
  const dim = size === "sm" ? 42 : size === "lg" ? 64 : 50;

  return (
    <div
      className={`relative flex items-center justify-center shrink-0 rounded-2xl shadow-lg shadow-blue-600/30 transition-transform hover:scale-105 ${className}`}
      style={{
        width: dim,
        height: dim,
        background: "linear-gradient(135deg, #2563EB 0%, #1D4ED8 100%)",
      }}
      title="견적식탁 (BidTable)"
    >
      <svg
        viewBox="0 0 100 100"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="w-[90%] h-[90%]"
      >
        {/* 1. 뒤쪽 뼈다귀 관절 (우측 상단으로 튀어나온 뼈) */}
        <path
          d="M74 38 L84 28 C87 25 90 28 88 31 C89 33 87 37 84 37 L77 43 Z"
          fill="white"
          stroke="#1D4ED8"
          strokeWidth="1.5"
          strokeLinejoin="round"
        />

        {/* 2. 도톰한 만화 통고기 몸통 (Manga Bone Meat Body) */}
        <path
          d="M32 55 C32 46 44 38 62 38 C75 38 80 44 80 54 C80 65 72 73 54 75 C38 75 32 68 32 55 Z"
          fill="white"
        />
        {/* 고기 옆면 두께 및 입체감 음영 */}
        <path
          d="M32 55 C32 46 44 38 62 38 L72 44 C54 44 36 50 32 55 Z"
          fill="white"
          opacity="0.8"
        />

        {/* 고기 앞쪽 원형 단면 (살코기 링) */}
        <ellipse
          cx="34"
          cy="58"
          rx="14"
          ry="19"
          transform="rotate(-15 34 58)"
          fill="#DBEAFE"
          stroke="white"
          strokeWidth="2.5"
        />
        {/* 고기 단면 안쪽 붉은 살코기 나이테/마블링 링 */}
        <ellipse
          cx="33"
          cy="58"
          rx="8.5"
          ry="12.5"
          transform="rotate(-15 33 58)"
          fill="#93C5FD"
          opacity="0.75"
        />

        {/* 3. 앞쪽 뼈다귀 (단면 중앙에서 쑥 튀어나온 하얀 뼈 관절) */}
        <g transform="rotate(-15 28 62)">
          {/* 뼈 기둥 */}
          <rect x="22" y="55" width="8" height="18" rx="3" fill="white" stroke="#1D4ED8" strokeWidth="1.2" />
          {/* 뼈 양갈래 끝부분 (Bone Knobs) */}
          <circle cx="21" cy="74" r="5" fill="white" stroke="#1D4ED8" strokeWidth="1.2" />
          <circle cx="29" cy="75" r="5" fill="white" stroke="#1D4ED8" strokeWidth="1.2" />
        </g>

        {/* 고기 표면 디테일 빗금 (유첨 이미지의 결 무늬) */}
        <line x1="56" y1="44" x2="58" y2="47" stroke="#1D4ED8" strokeWidth="2.2" strokeLinecap="round" />
        <line x1="68" y1="48" x2="70" y2="52" stroke="#1D4ED8" strokeWidth="2.2" strokeLinecap="round" />
        <line x1="60" y1="62" x2="63" y2="65" stroke="#1D4ED8" strokeWidth="2.2" strokeLinecap="round" />

        {/* 4. 고기 등짝에 비스듬히 콕! 꽂혀 있는 3갈래 포크 (심살 사이 틈새를 아주 선명하게 구현) */}
        <g transform="rotate(22 56 32)">
          {/* 포크 손잡이 (Handle) */}
          <rect x="54" y="2" width="5.5" height="24" rx="2.75" fill="white" stroke="#1D4ED8" strokeWidth="1.2" />
          
          {/* 포크 목(Neck)에서 어깨로 넓어지는 베이스 */}
          <path
            d="M51 28 C51 23 53 22 54 22 L59 22 C60 22 62 23 62 28 Z"
            fill="white"
          />

          {/* 포크 3개 갈래 (Tines) - 사이사이 틈새(Gap)가 파란색으로 뻥 뚫려 선명함 */}
          {/* 좌측 갈래 */}
          <rect x="47" y="27" width="2.8" height="12" rx="1.2" fill="white" stroke="#1D4ED8" strokeWidth="0.8" />
          {/* 중앙 갈래 */}
          <rect x="55" y="27" width="2.8" height="13" rx="1.2" fill="white" stroke="#1D4ED8" strokeWidth="0.8" />
          {/* 우측 갈래 */}
          <rect x="63" y="27" width="2.8" height="12" rx="1.2" fill="white" stroke="#1D4ED8" strokeWidth="0.8" />
        </g>

        {/* 포크가 꽂힌 부위 스파클 임팩트 (신선함) */}
        <path
          d="M66 22 L67.5 18 L69 22 L73 23.5 L69 25 L67.5 29 L66 25 L62 23.5 Z"
          fill="white"
          opacity="0.95"
        />
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
      className={`inline-flex items-center space-x-3 group select-none transition-transform active:scale-95 ${className}`}
    >
      <BidTableLogoIcon size={size} />
      {showText && (
        <div className="flex flex-col">
          <div className="flex items-center space-x-2">
            <span className="font-black tracking-tight text-gray-900 group-hover:text-blue-600 transition-colors text-xl sm:text-2xl">
              견적식탁
            </span>
            <span className="text-[11px] font-black uppercase px-2 py-0.5 rounded-lg bg-blue-50 text-blue-700 border border-blue-200 tracking-wider shadow-2xs">
              BidTable
            </span>
          </div>
          <span className="text-xs text-gray-400 font-bold -mt-0.5 hidden sm:block">
            외식업 식자재 역경매 & 단가방어
          </span>
        </div>
      )}
    </Link>
  );
}
