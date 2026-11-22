import React from "react";
import Link from "next/link";

interface BidTableLogoProps {
  size?: "sm" | "md" | "lg";
  showText?: boolean;
  className?: string;
}

export function BidTableLogoIcon({ size = "md", className = "" }: { size?: "sm" | "md" | "lg"; className?: string }) {
  const dim = size === "sm" ? 34 : size === "lg" ? 56 : 44;

  return (
    <div
      className={`relative flex items-center justify-center shrink-0 rounded-2xl shadow-md shadow-blue-500/25 ${className}`}
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
        className="w-[88%] h-[88%]"
      >
        {/* 1. 고기 위의 귀여운 불꽃 / 훈연 향기 (첫 번째 유첨 스타일) */}
        <path
          d="M44 14 C44 9 48 7 49 5 C51 8 50 11 48 13 C49 13 51 12 52 11 C52 14 50 17 46 17 C44 17 44 15 44 14 Z"
          fill="white"
          opacity="0.95"
        />
        <path
          d="M55 15 C55 11 58 9 59 7 C61 10 59 13 58 14 C59 14 61 13 62 12 C62 15 60 17 57 17 C55 17 55 16 55 15 Z"
          fill="white"
          opacity="0.85"
        />

        {/* 2. 단순하고 귀여운 스테이크 고기 (첫 번째 유첨 스타일, 소시지 위치에 배치) */}
        {/* 고기 덩어리 외곽 라인 및 면 */}
        <path
          d="M29 36 C24 33 26 23 35 20 C46 17 62 18 71 24 C78 29 77 37 70 41 C62 45 44 45 35 43 C30 42 27 39 29 36 Z"
          fill="white"
          stroke="white"
          strokeWidth="2.5"
          strokeLinejoin="round"
        />
        {/* 고기 표면 대각선 사선 그릴 자국 (첫 번째 이미지의 시그니처 빗금 3개) */}
        <line
          x1="39"
          y1="37"
          x2="48"
          y2="24"
          stroke="#1D4ED8"
          strokeWidth="3.2"
          strokeLinecap="round"
        />
        <line
          x1="49"
          y1="39"
          x2="58"
          y2="26"
          stroke="#1D4ED8"
          strokeWidth="3.2"
          strokeLinecap="round"
        />
        <line
          x1="59"
          y1="40"
          x2="67"
          y2="29"
          stroke="#1D4ED8"
          strokeWidth="3.2"
          strokeLinecap="round"
        />

        {/* 3. 하단에서 고기를 콕 찍고 있는 포크 (두 번째 유첨의 포크 100% 동일한 형태) */}
        {/* 포크 손잡이 (Handle): 아래쪽이 둥글고 도톰하다가 위로 가면서 부드럽게 잘록해짐 */}
        <path
          d="M48 68 L48 88 C48 91 52 91 52 88 L52 68 C52 62 50 60 48 68 Z"
          fill="white"
        />
        {/* 포크 손잡이 하단 바디 둥근 캡 */}
        <rect x="47" y="68" width="6" height="23" rx="3" fill="white" />

        {/* 포크 목(Neck) 및 어깨(Shoulder): 잘록하게 좁아졌다가 3갈래로 넓어지는 유려한 곡선 */}
        <path
          d="M47 70 C47 62 45 56 40 50 C38 48 40 45 42 45 C44 45 45 47 47 50 L47 42 C47 40.5 49 40.5 49 42 L49 48 L51 48 L51 42 C51 40.5 53 40.5 53 42 L53 50 C55 47 56 45 58 45 C60 45 62 48 60 50 C55 56 53 62 53 70 Z"
          fill="white"
          stroke="white"
          strokeWidth="1.5"
          strokeLinejoin="round"
        />

        {/* 포크 갈래 3개 (Tines) - 고기 밑면(y:42~44)에 콕 박혀있는 디테일 */}
        {/* 좌측 갈래 */}
        <line x1="42" y1="46" x2="42" y2="39" stroke="white" strokeWidth="2.8" strokeLinecap="round" />
        {/* 중앙 갈래 */}
        <line x1="50" y1="46" x2="50" y2="38" stroke="white" strokeWidth="2.8" strokeLinecap="round" />
        {/* 우측 갈래 */}
        <line x1="58" y1="46" x2="58" y2="39" stroke="white" strokeWidth="2.8" strokeLinecap="round" />
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
