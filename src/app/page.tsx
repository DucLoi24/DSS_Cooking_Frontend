// Import component Link từ Next.js để điều hướng
import Link from "next/link";
// Import component Button chúng ta vừa thêm
import { Button } from "@/components/ui/button";

export default function Home() {
  return (
    // Chúng ta dùng flexbox để căn giữa nội dung
    <section className="container grid items-center gap-6 pb-8 pt-6 md:py-10">
      <div className="flex max-w-[980px] flex-col items-start gap-2">
        {/* Tiêu đề chính của trang */}
        <h1 className="text-3xl font-extrabold leading-tight tracking-tighter md:text-4xl">
          Hết băn khoăn "Hôm nay ăn gì?"
        </h1>
        {/* Đoạn mô tả ngắn gọn, hấp dẫn */}
        <p className="max-w-[700px] text-lg text-muted-foreground">
          Chỉ cần nhập những nguyên liệu bạn đang có, Trợ Lý Bếp sẽ gợi ý
          những món ăn phù hợp nhất. Nhanh chóng, thông minh và chống lãng phí.
        </p>
      </div>
      <div className="flex gap-4">
        {/* Nút Call to Action chính */}
        {/* Bọc nút trong component Link để khi click sẽ điều hướng */}
        <Link href="/login">
          <Button variant="default" size="lg">
            Bắt đầu ngay
          </Button>
        </Link>
        {/* Nút phụ (ví dụ: xem thêm về tính năng) */}
        <Link href="/features">
          <Button variant="outline" size="lg">
            Tìm hiểu thêm
          </Button>
        </Link>
      </div>
    </section>
  );
}