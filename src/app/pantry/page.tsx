"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/lib/store";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { AddPantryItemForm } from "@/components/pantry/add-pantry-item-form";
import { PlusCircle } from "lucide-react";
import apiFetch from "@/lib/api"; // Import hàm fetch thông minh

// Định nghĩa "hình dáng" của một item trong tủ lạnh
interface PantryItem {
  id: number;
  ingredient_name: string;
  quantity: string;
}

export default function PantryPage() {
  const { accessToken } = useAuthStore();
  const router = useRouter();

  const [items, setItems] = useState<PantryItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isClient, setIsClient] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  const fetchPantryItems = async () => {
    // Không cần kiểm tra token ở đây nữa vì apiFetch sẽ lo
    try {
      setIsLoading(true);
      setError(null);
      // Dùng hàm fetch thông minh
      const response = await apiFetch("/pantry/");
      
      if (!response.ok) {
        // apiFetch sẽ tự xử lý lỗi 401, nhưng các lỗi khác (500) vẫn cần xử lý
        throw new Error("Không thể lấy dữ liệu từ tủ lạnh.");
      }
      const data: PantryItem[] = await response.json();
      setItems(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (!isClient) return;

    // Logic kiểm tra đăng nhập vẫn cần thiết để tránh gọi API vô ích
    if (!accessToken) {
      router.push("/login");
      return;
    }
    
    fetchPantryItems();
  }, [isClient, accessToken, router]);

  const handleItemAdded = () => {
    setIsDialogOpen(false);
    fetchPantryItems();
  };

  if (!isClient || isLoading) {
    return <div className="container py-10">Đang tải dữ liệu tủ lạnh...</div>;
  }

  if (error) {
    return <div className="container py-10 text-red-500">Lỗi: {error}</div>;
  }

  return (
    <section className="container grid items-center gap-6 pb-8 pt-6 md:py-10">
      <div className="flex items-center justify-between">
        <div className="flex max-w-[980px] flex-col items-start gap-2">
          <h1 className="text-3xl font-extrabold leading-tight tracking-tighter md:text-4xl">
            Tủ lạnh của bạn
          </h1>
          <p className="max-w-[700px] text-lg text-muted-foreground">
            Đây là những nguyên liệu bạn đang có.
          </p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <PlusCircle className="mr-2 h-4 w-4" />
              Thêm nguyên liệu
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Thêm nguyên liệu vào tủ lạnh</DialogTitle>
            </DialogHeader>
            <AddPantryItemForm onItemAdded={handleItemAdded} />
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Danh sách nguyên liệu</CardTitle>
        </CardHeader>
        <CardContent>
          {items.length > 0 ? (
            <ul>
              {items.map((item) => (
                <li key={item.id} className="flex justify-between items-center p-2 border-b">
                  <span>{item.ingredient_name}</span>
                  <span className="text-sm text-muted-foreground">{item.quantity}</span>
                </li>
              ))}
            </ul>
          ) : (
            <p>Tủ lạnh của bạn trống trơn. Hãy thêm nguyên liệu để bắt đầu!</p>
          )}
        </CardContent>
      </Card>
    </section>
  );
}