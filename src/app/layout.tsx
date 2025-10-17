import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

import { cn } from "@/lib/utils";
import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Trợ Lý Bếp - Hôm nay ăn gì?",
  description: "Ứng dụng gợi ý món ăn từ những nguyên liệu bạn có.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    // "Tấm biển" này ra lệnh cho React: "Hãy bỏ qua các lỗi bất đối xứng
    // về thuộc tính trên thẻ html này. Tôi biết có thể có tiện ích mở rộng
    // đang can thiệp và tôi chấp nhận điều đó."
    <html lang="en" suppressHydrationWarning>
      <body
        className={cn(
          "min-h-screen bg-background font-sans antialiased",
          inter.className
        )}
      >
        <div className="relative flex min-h-screen flex-col">
          <Navbar />
          <main className="flex-1">{children}</main>
          <Footer />
        </div>
      </body>
    </html>
  );
}
