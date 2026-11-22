import React from "react";
import Link from "next/link";

interface BidTableLogoProps {
  size?: "sm" | "md" | "lg";
  showText?: boolean;
  className?: string;
}

export function BidTableLogoIcon({ size = "md", className = "" }: { size?: "sm" | "md" | "lg"; className?: string }) {
  // 로고 크기 큼직하게 확대 (sm: 40px, md: 50px, lg: 64px)
  const dim = size === "sm" ? 40 : size === "lg" ? 64 : 50;

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
        {/* 1. 고기 위의 훈연 향기 / 불꽃 (첫 번째 유첨 스타일) */}
        <path
          d="M44 13 C44 8 47 6 48 4 C50 7 49 10 47 12 C48 12 50 11 51 10 C51 13 49 16 45 16 C44 16 44 14 44 13 Z"
          fill="white"
          opacity="0.95"
        />
        <path
          d="M55 14 C55 10 58 8 59 6 C61 9 59 12 58 13 C59 13 61 12 62 11 C62 14 60 16 57 16 C55 16 55 15 55 14 Z"
          fill="white"
          opacity="0.85"
        />

        {/* 2. 단순하고 볼드한 스테이크 고기 (첫 번째 유첨 스타일) */}
        {/* 고기 덩어리 본체 */}
        <path
          d="M26 35 C20 31 22 21 32 18 C45 15 63 16 73 22 C81 27 80 36 72 41 C63 45 44 45 34 43 C28 42 24 39 26 35 Z"
          fill="white"
          stroke="white"
          strokeWidth="2"
          strokeLinejoin="round"
        />
        {/* 고기 표면 대각선 사선 그릴 빗금 3개 (선명한 파란색 대비) */}
        <line
          x1="37"
          y1="36"
          x2="46"
          y2="23"
          stroke="#1D4ED8"
          strokeWidth="3.5"
          strokeLinecap="round"
        />
        <line
          x1="48"
          y1="38"
          x2="57"
          y2="25"
          stroke="#1D4ED8"
          strokeWidth="3.5"
          strokeLinecap="round"
        />
        <line
          x1="59"
          y1="39"
          x2="67"
          y2="28"
          stroke="#1D4ED8"
          strokeWidth="3.5"
          strokeLinecap="round"
        />

        {/* 3. 하단 포크 (두 번째 유첨의 포크 실루엣 & 심살 사이사이 틈을 아주 선명하게 구현) */}
        {/* 포크 손잡이 (긴 원형 막대 -> 끝부분 둥근 캡) */}
        <rect x="47" y="69" width="6" height="23" rx="3" fill="white" />
        
        {/* 포크 목(Neck): 위로 올라가면서 U자형 어깨로 양옆으로 확 벌어짐 */}
        <path
          d="M47 70 C47 63 43 57 38 52 C35.5 49.5 35 48 35 47 L39 47 C39.5 48.5 41 51 44 54 C46.5 56.5 47 61 47 70 Z"
          fill="white"
        />
        <path
          d="M53 70 C53 63 57 57 62 52 C64.5 49.5 65 48 65 47 L61 47 C60.5 48.5 59 51 56 54 C53.5 56.5 53 61 53 70 Z"
          fill="white"
        />
        {/* 어깨 하단 연결 베이스 */}
        <path
          d="M38 52 C44 58 56 58 62 52 L61 48 C55 54 45 54 39 48 Z"
          fill="white"
        />

        {/* 포크 심살 3개 (Tines) - 사이사이 간격(Gap)을 널찍하고 깊숙하게 파내어 극도로 선명함! */}
        {/* [좌측 갈래] */}
        <path
          d="M36 48 L36 38 C36 36 39 36 39 38 L39 48 C39 50 36 50 36 48 Z"
          fill="white"
        />
        {/* [중앙 갈래] */}
        <path
          d="M48.5 48 L48.5 37 C48.5 35 51.5 35 51.5 37 L51.5 48 C51.5 50 48.5 50 48.5 48 Z"
          fill="white"
        />
        {/* [우측 갈래] */}
        <path
          d="M61 48 L61 38 C61 36 64 36 64 38 L64 48 C64 50 61 50 61 48 Z"
          fill="white"
        />

        {/* 심살 사이사이 깊은 U자형 슬롯(음각) 강조 라인 (배경 파란색과의 확실한 공간 분리) */}
        {/* 좌-중 갈래 사이 빈 공간 (x: 39 ~ 48.5) */}
        {/* 중-우 갈래 사이 빈 공간 (x: 51.5 ~ 61) */}
        {/* 고기와 포크가 만나는 접점의 입체감 그림자 라인 */}
        <path
          d="M35 44 C42 46 58 46 65 44"
          stroke="#1D4ED8"
          strokeWidth="1.8"
          strokeLinecap="round"
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
