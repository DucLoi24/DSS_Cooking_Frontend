"use client";

    import { useEffect, useState, useCallback } from "react";
    import { useRouter } from "next/navigation";
    import { useAuthStore } from "@/lib/store";
    import apiFetch from "@/lib/api";
    import { Button } from "@/components/ui/button";
    import { RecipeCard, Recipe } from "@/components/recipes/recipe-card";
    import { RecipeCardSkeleton } from "@/components/recipes/recipe-card-skeleton";
    // Import component Tabs
    import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

    export default function SuggestionsPage() {
      const { accessToken } = useAuthStore();
      const router = useRouter();
      const [isClient, setIsClient] = useState(false);

      const [suggestions, setSuggestions] = useState<Recipe[]>([]);
      const [isLoading, setIsLoading] = useState(false);
      const [error, setError] = useState<string | null>(null);
      // State mới để quản lý chế độ đang chọn
      const [mode, setMode] = useState<'strict' | 'flexible'>('strict');

      useEffect(() => { setIsClient(true); }, []);

      // Nâng cấp hàm gọi API để gửi kèm "chế độ"
      const fetchSuggestions = useCallback(async (currentMode: string) => {
        setIsLoading(true);
        setError(null);
        try {
          const response = await apiFetch(`/suggestions/?mode=${currentMode}`);
          if (!response.ok) throw new Error("Không thể lấy gợi ý món ăn.");
          const data: Recipe[] = await response.json();
          setSuggestions(data);
        } catch (err: unknown) {
          if (err instanceof Error) setError(err.message);
          else setError("Lỗi không xác định");
        } finally {
          setIsLoading(false);
        }
      }, []);

      useEffect(() => {
        if (isClient && !accessToken) {
          router.push("/login");
        } else if (isClient) {
          // Tự động tìm kiếm ở chế độ "Nấu Ngay" khi vào trang
          fetchSuggestions('strict');
        }
      }, [isClient, accessToken, router, fetchSuggestions]);

      const handleTabChange = (newMode: string) => {
        setMode(newMode as 'strict' | 'flexible');
        fetchSuggestions(newMode);
      };
      
      if (!isClient) return <div className="container py-10">Đang tải...</div>;

      return (
        <section className="container py-10">
          <div className="space-y-2 mb-8">
            <h1 className="text-3xl font-bold tracking-tight">Gợi ý cho bạn</h1>
            <p className="text-muted-foreground">"Bộ não" AI sẽ tìm những món ăn phù hợp nhất từ tủ lạnh của bạn.</p>
          </div>

          {/* Giao diện Tabs */}
          <Tabs value={mode} onValueChange={handleTabChange} className="w-full">
            <TabsList className="grid w-full grid-cols-2 md:w-[400px]">
              <TabsTrigger value="strict">Nấu Ngay</TabsTrigger>
              <TabsTrigger value="flexible">Thêm Chút Nữa</TabsTrigger>
            </TabsList>
            <TabsContent value="strict">
              {renderSuggestions("Bạn có đủ nguyên liệu để nấu những món này ngay lập tức!")}
            </TabsContent>
            <TabsContent value="flexible">
              {renderSuggestions("Chỉ cần mua thêm 1-2 món, bạn có thể thử những món này!")}
            </TabsContent>
          </Tabs>
        </section>
      );
      
      // Hàm phụ để tránh lặp code hiển thị
      function renderSuggestions(description: string) {
        if (isLoading) {
          return (
            <div className="mt-8 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              <RecipeCardSkeleton /><RecipeCardSkeleton /><RecipeCardSkeleton />
            </div>
          );
        }
        if (error) {
          return <p className="mt-4 text-red-500">Lỗi: {error}</p>;
        }
        if (suggestions.length === 0) {
            return (
                <div className="text-center py-10 mt-4 border rounded-md col-span-full">
                   <h3 className="font-semibold">Không tìm thấy gợi ý nào</h3>
                   <p className="text-sm text-muted-foreground">{mode === 'strict' ? "Có vẻ như bạn chưa đủ đồ cho món nào cả." : "Không có món nào gần khớp với nguyên liệu của bạn."}</p>
                </div>
            );
        }
        return (
            <>
                <p className="text-muted-foreground mt-4">{description}</p>
                <div className="mt-4 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    {suggestions.map((recipe, index) => (
                        <RecipeCard key={recipe.id} recipe={recipe} rank={index + 1} />
                    ))}
                </div>
            </>
        );
      }
    }