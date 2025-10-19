"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { useAuthStore } from "@/lib/store";
import { Sparkles, Refrigerator } from "lucide-react";

export default function HomePage() {
  const { accessToken, user } = useAuthStore();

  return (
    <section className="container grid items-center gap-6 pb-8 pt-6 md:py-10">
      {accessToken && user ? (
        <div className="flex max-w-[980px] flex-col items-start gap-4">
          <h1 className="text-3xl font-extrabold leading-tight tracking-tighter md:text-4xl">
            Chào mừng trở lại, {user.username}!
          </h1>
          <p className="max-w-[700px] text-lg text-muted-foreground">
            Tủ lạnh của bạn đã sẵn sàng. Bạn muốn làm gì tiếp theo?
          </p>
          <div className="flex gap-4 mt-4">
            <Link href="/suggestions">
              <Button size="lg">
                <Sparkles className="mr-2 h-5 w-5" />
                Tìm món ăn ngay
              </Button>
            </Link>
            <Link href="/pantry">
              <Button variant="outline" size="lg">
                <Refrigerator className="mr-2 h-5 w-5" />
                Kiểm tra tủ lạnh
              </Button>
            </Link>
          </div>
        </div>
      ) : (
        <>
          <div className="flex max-w-[980px] flex-col items-start gap-2">
            {/* SỬA LỖI UNESCAPED ENTITIES */}
            <h1 className="text-3xl font-extrabold leading-tight tracking-tighter md:text-4xl">
              Hết băn khoăn &quot;Hôm nay ăn gì?&quot;
            </h1>
            <p className="max-w-[700px] text-lg text-muted-foreground">
              Chỉ cần nhập những nguyên liệu bạn đang có, Trợ Lý Bếp sẽ gợi ý
              những món ăn phù hợp nhất. Nhanh chóng, thông minh và chống lãng phí.
            </p>
          </div>
          <div className="flex gap-4">
            <Link href="/login">
              <Button variant="default" size="lg">
                Bắt đầu ngay
              </Button>
            </Link>
          </div>
        </>
      )}
    </section>
  );
}