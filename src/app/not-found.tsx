import React from "react";
import Link from "next/link";

export default function NotFound() {
  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center p-6 text-center">
      <h2 className="text-3xl font-black text-gray-900 mb-2">페이지를 찾을 수 없습니다</h2>
      <p className="text-sm text-gray-500 mb-6">요청하신 페이지가 존재하지 않거나 이동되었습니다.</p>
      <Link
        href="/"
        className="px-6 py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm shadow-md transition-all"
      >
        홈으로 돌아가기
      </Link>
    </div>
  );
}
