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
        {/* 1. 고기 위로 뾰족하게 뚫고 솟아나온 포크 갈래 팁 3개 (Tine Tips) */}
        {/* 좌측 팁 */}
        <polygon points="41,39 42.5,27 44,39" fill="white" />
        {/* 중앙 팁 */}
        <polygon points="48.5,38 50,25 51.5,38" fill="white" />
        {/* 우측 팁 */}
        <polygon points="56,39 57.5,27 59,39" fill="white" />

        {/* 2. 좌우 수평 관통 뼈다귀 (Horizontal Manga Bone) */}
        {/* 왼쪽 뼈다귀 샤프트 & 관절 노브 2개 */}
        <g>
          {/* 뼈 기둥 */}
          <rect x="11" y="44" width="13" height="6.5" rx="2" fill="white" stroke="#1D4ED8" strokeWidth="0.8" />
          {/* 뼈 끝 상단 관절 */}
          <circle cx="10" cy="43.5" r="4.2" fill="white" stroke="#1D4ED8" strokeWidth="0.8" />
          {/* 뼈 끝 하단 관절 */}
          <circle cx="10" cy="50.5" r="4.2" fill="white" stroke="#1D4ED8" strokeWidth="0.8" />
        </g>

        {/* 오른쪽 뼈다귀 샤프트 & 관절 노브 2개 */}
        <g>
          {/* 뼈 기둥 */}
          <rect x="76" y="44" width="13" height="6.5" rx="2" fill="white" stroke="#1D4ED8" strokeWidth="0.8" />
          {/* 뼈 끝 상단 관절 */}
          <circle cx="90" cy="43.5" r="4.2" fill="white" stroke="#1D4ED8" strokeWidth="0.8" />
          {/* 뼈 끝 하단 관절 */}
          <circle cx="90" cy="50.5" r="4.2" fill="white" stroke="#1D4ED8" strokeWidth="0.8" />
        </g>

        {/* 3. 가로로 똑바로 누운 땅콩 모양 만화 통고기 몸통 (Horizontal Peanut Bone Meat) */}
        {/* 유첨 이미지의 가운데가 잘록하게 들어간 부드러운 땅콩 실루엣 그대로 재현 */}
        <path
          d="M 21 47 C 21 37.5 29 34 37 34 C 44 34 46 38.5 50 38.5 C 54 38.5 56 34 63 34 C 71 34 79 37.5 79 47 C 79 56.5 71 60 63 60 C 56 60 54 55.5 50 55.5 C 46 55.5 44 60 37 60 C 29 60 21 56.5 21 47 Z"
          fill="white"
        />

        {/* 고기 상단 은은한 볼륨 하이라이트 띠 */}
        <path
          d="M 23 45 C 23 39 30 36 37 36 C 44 36 46 39.5 50 39.5 C 54 39.5 56 36 63 36 C 70 36 77 39 77 45 C 73 42 66 40 63 40 C 56 40 54 43 50 43 C 46 43 44 40 37 40 C 34 40 27 42 23 45 Z"
          fill="#EFF6FF"
          opacity="0.85"
        />

        {/* 4. 아래에서 위로 수직으로 찌르고 받치고 있는 포크 (자루 및 베이스) */}
        {/* 포크 손잡이 (하단 수직 바디) */}
        <path
          d="M48.5 73 L48.5 94 C48.5 96.5 51.5 96.5 51.5 94 L51.5 73 Z"
          fill="white"
          stroke="#1D4ED8"
          strokeWidth="0.8"
        />

        {/* 포크 목(Neck)에서 어깨로 자연스러운 곡선 베이스 */}
        <path
          d="M48.5 74 C48.5 71 42 68 40.5 61 L59.5 61 C58 68 51.5 71 51.5 74 Z"
          fill="white"
          stroke="#1D4ED8"
          strokeWidth="0.8"
        />

        {/* 고기 밑면(잘록한 허리 부분)을 받쳐 찌르는 3갈래 포크 살 */}
        {/* 좌측 갈래 */}
        <rect x="40.5" y="56" width="3" height="7.5" rx="1" fill="white" stroke="#1D4ED8" strokeWidth="0.8" />
        {/* 중앙 갈래 */}
        <rect x="48.5" y="54" width="3" height="9.5" rx="1" fill="white" stroke="#1D4ED8" strokeWidth="0.8" />
        {/* 우측 갈래 */}
        <rect x="56.5" y="56" width="3" height="7.5" rx="1" fill="white" stroke="#1D4ED8" strokeWidth="0.8" />

        {/* 포크 살 사이의 깊은 음각 홈 (심살 사이 분리 선명화) */}
        <path d="M44 59.5 C44 62.5 48 62.5 48 59.5" stroke="#1D4ED8" strokeWidth="1" strokeLinecap="round" />
        <path d="M52 59.5 C52 62.5 56 62.5 56 59.5" stroke="#1D4ED8" strokeWidth="1" strokeLinecap="round" />

        {/* 깔끔한 반짝임 스파클 이펙트 */}
        <path
          d="M20 28 L21.5 24 L23 28 L27 29.5 L23 31 L21.5 35 L20 31 L16 29.5 Z"
          fill="white"
          opacity="0.9"
        />
        <path
          d="M78 22 L79 19 L80 22 L83 23 L80 24 L79 27 L78 24 L75 23 Z"
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
