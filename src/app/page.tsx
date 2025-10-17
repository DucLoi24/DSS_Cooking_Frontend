import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function Home() {
  return (
    <section className="container grid items-center gap-6 pb-8 pt-6 md:py-10">
      <div className="flex max-w-[980px] flex-col items-start gap-2">
        {/* SỬA LỖI: Dùng dấu nháy đơn hoặc &quot; để tránh lỗi unescaped entities */}
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
        {/* Tạm thời vô hiệu hóa link này vì trang /features chưa tồn tại */}
        {/* <Link href="/features">
          <Button variant="outline" size="lg">
            Tìm hiểu thêm
          </Button>
        </Link> */}
      </div>
      <p className="text-red-500 font-bold">
          DEBUG: API URL is: {process.env.NEXT_PUBLIC_API_BASE_URL || "BIẾN MÔI TRƯỜNG CHƯA ĐƯỢC SET!"}
      </p>
    </section>
  );
}