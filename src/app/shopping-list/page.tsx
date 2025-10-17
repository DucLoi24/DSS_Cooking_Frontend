"use client";

import { useEffect, useState, useMemo } from "react"; // Import thêm useMemo
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/lib/store";
import apiFetch from "@/lib/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { AddShoppingListItemForm } from "@/components/shopping-list/add-shopping-list-item-form";
import { Check, Trash, PlusCircle } from "lucide-react";
import { cn } from "@/lib/utils";

// Cập nhật interface để có cả quantity
interface ShoppingListItem {
  id: number;
  ingredient_name: string;
  is_checked: boolean;
  quantity: string | null;
}

export default function ShoppingListPage() {
  const { accessToken } = useAuthStore();
  const router = useRouter();

  const [items, setItems] = useState<ShoppingListItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isClient, setIsClient] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  const fetchItems = async () => {
    if (!accessToken) return;
    try {
      const response = await apiFetch("/shopping-list/");
      if (!response.ok) throw new Error("Không thể tải danh sách mua sắm.");
      const data = await response.json();
      setItems(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (isClient) {
      if (!accessToken) {
        router.push("/login");
      } else {
        fetchItems();
      }
    }
  }, [isClient, accessToken, router]);
  
  // SỬA ĐỔI #1: Sắp xếp lại danh sách một cách thông minh
  const sortedItems = useMemo(() => {
    return [...items].sort((a, b) => {
      // So sánh dựa trên is_checked (false đứng trước true)
      if (a.is_checked === b.is_checked) return 0;
      return a.is_checked ? 1 : -1;
    });
  }, [items]); // Chỉ tính toán lại khi `items` thay đổi

  const handleToggleCheck = async (item: ShoppingListItem) => {
    try {
      await apiFetch(`/shopping-list/${item.id}/`, {
        method: "PATCH",
        body: JSON.stringify({ is_checked: !item.is_checked }),
      });
      setItems(items.map(i => i.id === item.id ? { ...i, is_checked: !i.is_checked } : i));
    } catch (error) {
      console.error("Failed to toggle item:", error);
    }
  };

  const handleDelete = async (itemId: number) => {
    try {
      await apiFetch(`/shopping-list/${itemId}/`, {
        method: "DELETE",
      });
      setItems(items.filter(i => i.id !== itemId));
    } catch (error) {
      console.error("Failed to delete item:", error);
    }
  };

  const handleItemAdded = () => {
    setIsDialogOpen(false);
    fetchItems();
  };

  if (!isClient || isLoading) {
    return <div className="container py-10">Đang tải danh sách mua sắm...</div>;
  }

  return (
    <section className="container py-10">
      <div className="flex items-center justify-between mb-8">
        <div className="space-y-2">
          <h1 className="text-3xl font-bold tracking-tight">Danh sách Mua sắm</h1>
          <p className="text-muted-foreground">Những thứ bạn cần mua cho các món ăn sắp tới.</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <PlusCircle className="mr-2 h-4 w-4" />
              Thêm vào giỏ
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Thêm đồ cần mua</DialogTitle>
            </DialogHeader>
            <AddShoppingListItemForm onItemAdded={handleItemAdded} />
          </DialogContent>
        </Dialog>
      </div>
      
      {error && <p className="text-red-500">{error}</p>}
      
      <Card>
        <CardHeader>
          <CardTitle>Cần mua</CardTitle>
        </CardHeader>
        <CardContent>
          {sortedItems.length > 0 ? ( // SỬA ĐỔI #2: Dùng danh sách đã sắp xếp
            <ul>
              {sortedItems.map((item) => (
                <li key={item.id} className="flex justify-between items-center p-4 border-b">
                  <div className="flex flex-col">
                    <span className={cn("font-medium", item.is_checked && "line-through text-muted-foreground")}>
                      {item.ingredient_name}
                    </span>
                     {/* Hiển thị số lượng */}
                    {item.quantity && (
                      <span className="text-sm text-muted-foreground">{item.quantity}</span>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <Button variant={item.is_checked ? "secondary" : "outline"} size="icon" onClick={() => handleToggleCheck(item)}>
                      <Check className="h-4 w-4" />
                    </Button>
                     <Button variant="destructive" size="icon" onClick={() => handleDelete(item.id)}>
                      <Trash className="h-4 w-4" />
                    </Button>
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-muted-foreground">Giỏ hàng của bạn đang trống!</p>
          )}
        </CardContent>
      </Card>
    </section>
  );
}