import React from "react";
import Link from "next/link";

interface BidTableLogoProps {
  size?: "sm" | "md" | "lg";
  showText?: boolean;
  className?: string;
}

export function BidTableLogoIcon({ size = "md", className = "" }: { size?: "sm" | "md" | "lg"; className?: string }) {
  const dim = size === "sm" ? 30 : size === "lg" ? 52 : 40;

  return (
    <div
      className={`relative flex items-center justify-center shrink-0 rounded-full shadow-sm ${className}`}
      style={{
        width: dim,
        height: dim,
        background: "linear-gradient(135deg, #FF6B00 0%, #FF8A00 100%)",
      }}
      title="견적식탁"
    >
      <svg
        viewBox="0 0 100 100"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="w-[84%] h-[84%]"
      >
        {/* 1. 원형 식탁 외곽 림 (Round Dining Table Outer) */}
        <circle
          cx="50"
          cy="50"
          r="46"
          stroke="white"
          strokeWidth="3.5"
          opacity="0.9"
        />
        {/* 2. 원형 식탁 내부 접시 림 (Table Inner Plate Border) */}
        <circle
          cx="50"
          cy="50"
          r="34"
          fill="white"
          fillOpacity="0.2"
          stroke="white"
          strokeWidth="2"
          strokeDasharray="2 3"
          opacity="0.85"
        />

        {/* 3. 좌측 포크 (Fork) */}
        <g fill="white">
          {/* 포크 몸체/갈래 4개 */}
          <rect x="36" y="27" width="2" height="15" rx="1" />
          <rect x="40" y="27" width="2" height="15" rx="1" />
          <rect x="44" y="27" width="2" height="15" rx="1" />
          {/* 포크 연결부 */}
          <path
            d="M36 38 Q40 44 44 38 L44 45 Q40 47 36 45 Z"
            fill="white"
          />
          {/* 포크 손잡이 */}
          <rect x="39" y="44" width="2.5" height="29" rx="1.25" />
          <circle cx="40.25" cy="73" r="2.2" />
        </g>

        {/* 4. 우측 수저 (Spoon) */}
        <g fill="white">
          {/* 스푼 머리 (타원형) */}
          <ellipse cx="60" cy="35" rx="6.5" ry="9.5" />
          {/* 스푼 손잡이 */}
          <rect x="58.75" y="43" width="2.5" height="30" rx="1.25" />
          <circle cx="60" cy="73" r="2.2" />
        </g>

        {/* 5. 은은한 광택 스파클 (신선함) */}
        <circle cx="50" cy="22" r="1.5" fill="white" opacity="0.9" />
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
            <span className="font-black tracking-tight text-gray-900 group-hover:text-orange-600 transition-colors text-lg sm:text-xl">
              견적식탁
            </span>
            <span className="text-[10px] font-extrabold uppercase px-1.5 py-0.5 rounded-md bg-orange-100 text-orange-700 tracking-wider">
              BidPlate
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
