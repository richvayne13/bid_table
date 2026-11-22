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
        {/* 1. 고기 위로 뾰족하게 뚫고 나온 포크 갈래 끝 3개 (Tine Tips) */}
        {/* 좌측 팁 */}
        <polygon points="41.5,41 43,30 44.5,41" fill="white" />
        {/* 중앙 팁 */}
        <polygon points="48.5,39 50,28 51.5,39" fill="white" />
        {/* 우측 팁 */}
        <polygon points="55.5,41 57,30 58.5,41" fill="white" />

        {/* 2. 뒷쪽 심플 뼈다귀 관절 (우측으로 깔끔하게 뻗은 뼈) */}
        <path
          d="M71 47 L79 43 C81 40 85 42 84 45 C86 47 84 50 81 50 L72 53 Z"
          fill="white"
          stroke="#1D4ED8"
          strokeWidth="1"
          strokeLinejoin="round"
        />

        {/* 3. 단순하고 슬림한 세로 두께의 통고기 몸통 (Slim & Clean Meat) */}
        {/* 고기 외곽 둥근 실루엣 (세로 높이 약 18px로 슬림하고 단정함) */}
        <path
          d="M32 55 C31 46 39 42 54 42 C67 42 75 45 74 54 C73 60 66 62 52 62 C38 62 33 60 32 55 Z"
          fill="white"
        />

        {/* 고기 상단 은은한 음영 하이라이트 */}
        <path
          d="M33 50 C34 45 42 43 54 43 C66 43 73 45 73 49 C66 46 54 45 41 47 C36 48 33 49 33 50 Z"
          fill="#EFF6FF"
          opacity="0.85"
        />

        {/* 앞쪽 타원형 단면 (깔끔하고 슬림한 살코기 링) */}
        <ellipse
          cx="33"
          cy="53"
          rx="9"
          ry="11"
          transform="rotate(-10 33 53)"
          fill="#DBEAFE"
          stroke="white"
          strokeWidth="1.8"
        />
        {/* 단면 속살 (소프트 블루 포인트 마블링) */}
        <ellipse
          cx="32.5"
          cy="53"
          rx="5"
          ry="6.8"
          transform="rotate(-10 32.5 53)"
          fill="#93C5FD"
          opacity="0.8"
        />

        {/* 앞쪽 심플 뼈다귀 (단면에서 좌측 하단으로 뻗은 깔끔한 관절) */}
        <g transform="rotate(-15 28 56)">
          <rect x="22" y="52" width="6" height="10" rx="2" fill="white" stroke="#1D4ED8" strokeWidth="0.8" />
          <circle cx="21.5" cy="63" r="3.2" fill="white" stroke="#1D4ED8" strokeWidth="0.8" />
          <circle cx="27.5" cy="63.5" r="3.2" fill="white" stroke="#1D4ED8" strokeWidth="0.8" />
        </g>

        {/* 4. 아래에서 위로 고기를 찌르고 받치고 있는 포크 (자루 및 베이스) */}
        {/* 포크 손잡이 (하단 수직 바디) */}
        <path
          d="M48.5 73 L48.5 94 C48.5 96.5 51.5 96.5 51.5 94 L51.5 73 Z"
          fill="white"
          stroke="#1D4ED8"
          strokeWidth="0.8"
        />

        {/* 포크 목(Neck)에서 어깨로 자연스러운 곡선 */}
        <path
          d="M48.5 74 C48.5 71 42 68 40.5 61 L59.5 61 C58 68 51.5 71 51.5 74 Z"
          fill="white"
          stroke="#1D4ED8"
          strokeWidth="0.8"
        />

        {/* 고기 밑면을 찌르는 3갈래 포크 살 (심살 사이 틈새 선명) */}
        {/* 좌측 갈래 */}
        <rect x="40" y="58" width="3" height="6.5" rx="1" fill="white" stroke="#1D4ED8" strokeWidth="0.8" />
        {/* 중앙 갈래 */}
        <rect x="48.5" y="58" width="3" height="6.5" rx="1" fill="white" stroke="#1D4ED8" strokeWidth="0.8" />
        {/* 우측 갈래 */}
        <rect x="57" y="58" width="3" height="6.5" rx="1" fill="white" stroke="#1D4ED8" strokeWidth="0.8" />

        {/* 포크 살 사이의 깊은 음각 홈 (시인성 극대화) */}
        <path d="M43.8 60.5 C43.8 63 47.8 63 47.8 60.5" stroke="#1D4ED8" strokeWidth="1" strokeLinecap="round" />
        <path d="M52.3 60.5 C52.3 63 56.3 63 56.3 60.5" stroke="#1D4ED8" strokeWidth="1" strokeLinecap="round" />

        {/* 깔끔한 미니 스파클 이펙트 */}
        <path
          d="M21 34 L22 31 L23 34 L26 35 L23 36 L22 39 L21 36 L18 35 Z"
          fill="white"
          opacity="0.9"
        />
        <path
          d="M77 26 L78 24 L79 26 L81 27 L79 28 L78 30 L77 28 L75 27 Z"
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
