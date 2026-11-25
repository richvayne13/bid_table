import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { RoleProvider } from "@/contexts/RoleContext";
import { Navbar } from "@/components/layout/Navbar";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "셀프바이어 (selfbuyer) - 거래처 발굴부터, 견적 비교까지",
  description:
    "거래처 발굴부터 견적 비교까지! B2B 외식업 식자재 역제안 & 단가방어 플랫폼",
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
                © 2026 셀프바이어 (selfbuyer). 거래처 발굴부터, 견적 비교까지. All rights reserved.
              </div>
            </footer>
          </div>
        </RoleProvider>
      </body>
    </html>
  );
}
