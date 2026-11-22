import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { RoleProvider } from "@/contexts/RoleContext";
import { Navbar } from "@/components/layout/Navbar";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "견적식탁 (BidPlate) - B2B 식자재 역경매 & 단가방어 플랫폼",
  description:
    "식자재 견적 요청, 최적 1사/2사 조합 매트릭스 뷰, 계약 단가 스냅샷 및 OCR 거래명세서 단가 방어 감시 플랫폼",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko">
      <body className={inter.className}>
        <RoleProvider>
          <div className="min-h-screen bg-slate-50/60 flex flex-col">
            <Navbar />
            <main className="flex-1">{children}</main>
            <footer className="border-t border-gray-200 bg-white py-6 mt-12 text-center text-xs text-gray-500">
              <div className="max-w-7xl mx-auto px-4">
                © 2026 견적식탁 (BidPlate). B2B 식자재 역경매 및 단가방어 매칭 플랫폼. All rights reserved.
              </div>
            </footer>
          </div>
        </RoleProvider>
      </body>
    </html>
  );
}
