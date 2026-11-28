import React, { Suspense } from "react";
import BidClient from "./BidClient";

export function generateStaticParams() {
  return [
    { id: "d0000000-0000-0000-0000-000000000001" },
    { id: "demo" },
    { id: "1" },
  ];
}

export default function BidPage() {
  return (
    <Suspense fallback={<div className="p-12 text-center text-zinc-400">입찰 페이지 로딩 중...</div>}>
      <BidClient />
    </Suspense>
  );
}
