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
        {/* 1. 고기 위로 뾰족하게 뚫고 솟아나온 포크 갈래 끝 3개 (Fork Tine Tips penetrating upward) */}
        {/* 좌측 팁 */}
        <polygon points="41,35 43,23 44.5,35" fill="white" />
        {/* 중앙 팁 */}
        <polygon points="48.5,33 50.5,21 52.5,33" fill="white" />
        {/* 우측 팁 */}
        <polygon points="56.5,35 58,23 59.5,35" fill="white" />

        {/* 2. 뒷쪽 뼈다귀 관절 (우측 상단으로 튀어나온 하얀 뼈) */}
        <g>
          <path
            d="M68 39 L78 30 C81 27 85 30 83 33 C85 35 83 39 79 39 L73 44 Z"
            fill="white"
            stroke="#1D4ED8"
            strokeWidth="1.2"
            strokeLinejoin="round"
          />
        </g>

        {/* 3. 뼈다귀 통고기 몸통 (Manga Bone Meat - 도톰한 볼륨감) */}
        {/* 고기 외곽 둥근 실루엣 */}
        <path
          d="M32 58 C30 46 42 37 62 38 C75 39 79 47 77 57 C75 66 65 71 50 71 C36 71 33 67 32 58 Z"
          fill="white"
        />

        {/* 고기 상단 하이라이트 & 볼륨 입체감 띠 */}
        <path
          d="M33 53 C34 43 45 38 62 38 C72 38 77 44 77 51 C71 45 56 42 38 46 C35 48 33 51 33 53 Z"
          fill="#EFF6FF"
          opacity="0.9"
        />

        {/* 고기 표면 만화풍 스팟 디테일 */}
        <circle cx="56" cy="46" r="1.8" fill="#1D4ED8" />
        <circle cx="67" cy="51" r="1.6" fill="#1D4ED8" />
        <circle cx="58" cy="62" r="1.5" fill="#1D4ED8" />
        <circle cx="65" cy="61" r="1.2" fill="#1D4ED8" />

        {/* 앞쪽 타원형 단면 (살코기 링) */}
        <ellipse
          cx="33"
          cy="57"
          rx="12"
          ry="16"
          transform="rotate(-15 33 57)"
          fill="#DBEAFE"
          stroke="white"
          strokeWidth="2.2"
        />
        {/* 단면 속살 (핑크/소프트 블루 마블링) */}
        <ellipse
          cx="32"
          cy="57"
          rx="7.5"
          ry="10.5"
          transform="rotate(-15 32 57)"
          fill="#93C5FD"
          opacity="0.8"
        />

        {/* 앞쪽 뼈다귀 (단면 중심에서 좌측 하단으로 튀어나온 뼈 관절) */}
        <g transform="rotate(-20 28 62)">
          {/* 뼈 샤프트 */}
          <rect x="21" y="55" width="7" height="15" rx="3" fill="white" stroke="#1D4ED8" strokeWidth="1" />
          {/* 뼈 끝 양쪽 돌기 */}
          <circle cx="21" cy="71" r="4.2" fill="white" stroke="#1D4ED8" strokeWidth="1" />
          <circle cx="28" cy="72" r="4.2" fill="white" stroke="#1D4ED8" strokeWidth="1" />
        </g>

        {/* 4. 아래에서 위로 고기를 찌르고 받치고 있는 포크 (아래쪽 손잡이 및 포크 베이스) */}
        {/* 포크 손잡이 (하단으로 길게 뻗은 바디) */}
        <path
          d="M48.5 76 L48.5 94 C48.5 96.5 52.5 96.5 52.5 94 L52.5 76 Z"
          fill="white"
          stroke="#1D4ED8"
          strokeWidth="0.8"
        />

        {/* 포크 목(Neck)에서 어깨(Shoulder)로 곡선 확장 */}
        <path
          d="M48.5 77 C48.5 74 42 71 40 65 L61 65 C59 71 52.5 74 52.5 77 Z"
          fill="white"
          stroke="#1D4ED8"
          strokeWidth="0.8"
        />

        {/* 고기 밑면을 받쳐 찌르는 3갈래 포크 살 (심살 사이의 틈새가 아주 선명함) */}
        {/* 좌측 갈래 */}
        <rect x="39.5" y="62" width="3.2" height="7" rx="1" fill="white" stroke="#1D4ED8" strokeWidth="0.8" />
        {/* 중앙 갈래 */}
        <rect x="48.9" y="62" width="3.2" height="7" rx="1" fill="white" stroke="#1D4ED8" strokeWidth="0.8" />
        {/* 우측 갈래 */}
        <rect x="58.2" y="62" width="3.2" height="7" rx="1" fill="white" stroke="#1D4ED8" strokeWidth="0.8" />

        {/* 포크 살 사이의 깊은 U자 홈 (음각 효과로 포크 살 분리 극대화) */}
        <path d="M43.5 64 C43.5 67 47.5 67 47.5 64" stroke="#1D4ED8" strokeWidth="1.2" strokeLinecap="round" />
        <path d="M53.5 64 C53.5 67 57.5 67 57.5 64" stroke="#1D4ED8" strokeWidth="1.2" strokeLinecap="round" />

        {/* 신선/강조 스파클 이펙트 */}
        <path
          d="M20 28 L21.5 24 L23 28 L27 29.5 L23 31 L21.5 35 L20 31 L16 29.5 Z"
          fill="white"
          opacity="0.9"
        />
        <path
          d="M78 20 L79 17 L80 20 L83 21 L80 22 L79 25 L78 22 L75 21 Z"
          fill="white"
          opacity="0.8"
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
