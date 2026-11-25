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
        background: "linear-gradient(135deg, #1E40AF 0%, #2563EB 50%, #3B82F6 100%)",
      }}
      title="셀프바이어 (selfbuyer)"
    >
      <svg
        viewBox="0 0 100 100"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="w-[88%] h-[88%]"
      >
        {/* 1. 포크 손잡이 (하단 수직 핸들) */}
        <path d="M 50 92 L 50 66" stroke="white" strokeWidth="6" strokeLinecap="round" />

        {/* 2. 포크 베이스 / 어깨 곡선 */}
        <path
          d="M 32 54 C 32 68, 68 68, 68 54"
          fill="none"
          stroke="white"
          strokeWidth="5.5"
          strokeLinecap="round"
        />

        {/* 3. 포크 갈래 3개 (하단 베이스에서 위로 뻗어나가는 살) */}
        {/* 좌측 갈래 바디 */}
        <path d="M 32 54 L 32 40" stroke="white" strokeWidth="5" strokeLinecap="round" />
        {/* 우측 갈래 바디 */}
        <path d="M 68 54 L 68 40" stroke="white" strokeWidth="5" strokeLinecap="round" />

        {/* 4. 90도 회전된 $ 기호 (가로로 누운 달러 기호) */}
        <g transform="translate(50, 41) rotate(90)">
          {/* $의 관통 중심 바 (회전되어 수평 가로 막대가 됨) */}
          <line
            x1="0"
            y1="-32"
            x2="0"
            y2="32"
            stroke="#FDE047"
            strokeWidth="6"
            strokeLinecap="round"
          />
          {/* $의 S 곡선 (회전되어 가로 S자 물결 형태) */}
          <path
            d="M 14 -18 C 14 -28, -14 -28, -14 -13 C -14 -1, 14 1, 14 13 C 14 28, -14 28, -14 18"
            fill="none"
            stroke="#FDE047"
            strokeWidth="7"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </g>

        {/* 5. $ 기호를 관통하여 위로 뾰족하게 뚫고 솟아나온 포크 갈래 팁 3개 (Tine Tips) */}
        {/* 좌측 팁 */}
        <path d="M 32 38 L 32 23" stroke="white" strokeWidth="5" strokeLinecap="round" />
        {/* 중앙 갈래 전체 (중심을 완전히 찌르고 솟구침) */}
        <path d="M 50 66 L 50 18" stroke="white" strokeWidth="5.5" strokeLinecap="round" />
        {/* 우측 팁 */}
        <path d="M 68 38 L 68 23" stroke="white" strokeWidth="5" strokeLinecap="round" />

        {/* 심플한 반짝임 스파클 (미니멀 포인트) */}
        <circle cx="20" cy="24" r="2" fill="#FDE047" />
        <circle cx="82" cy="22" r="2.5" fill="#FDE047" />
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
        <div className="flex flex-col leading-tight">
          <span className="font-black tracking-tight text-slate-900 group-hover:text-blue-600 transition-colors text-xl sm:text-2xl font-sans">
            selfbuyer
          </span>
          <span className="text-[11px] sm:text-xs text-slate-500 font-bold tracking-tight">
            거래처 발굴부터, 견적 비교까지
          </span>
        </div>
      )}
    </Link>
  );
}
