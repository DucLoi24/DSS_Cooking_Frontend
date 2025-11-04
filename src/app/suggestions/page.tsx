"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/lib/store";
import apiFetch from "@/lib/api";
import { RecipeCard, Recipe } from "@/components/recipes/recipe-card";
import { RecipeCardSkeleton } from "@/components/recipes/recipe-card-skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
// Import "Bộ lọc Kiêng cữ" mới
import { ExclusionFilter } from "@/components/suggestions/exclusion-filter";

export default function SuggestionsPage() {
  const { accessToken } = useAuthStore();
  const router = useRouter();
  const [isClient, setIsClient] = useState(false);

  const [suggestions, setSuggestions] = useState<Recipe[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [mode, setMode] = useState<'strict' | 'flexible'>('strict');
  const [favoriteIds, setFavoriteIds] = useState<Set<number>>(new Set());
  // State mới cho "Danh sách đen"
  const [excludedIds, setExcludedIds] = useState<Set<number>>(new Set());

  useEffect(() => { setIsClient(true); }, []);

  const fetchFavorites = useCallback(async () => {
    if (!accessToken) return;
    try {
        const response = await apiFetch("/favorites/");
        if(response.ok) {
            const favoriteRecipes: Recipe[] = await response.json();
            setFavoriteIds(new Set(favoriteRecipes.map(r => r.id)));
        }
    } catch (error) { console.error("Failed to fetch favorites:", error); }
  }, [accessToken]);

  // Nâng cấp hàm gọi API
  const fetchSuggestions = useCallback(async (currentMode: string, currentExclusions: Set<number>) => {
    setIsLoading(true);
    setError(null);
    try {
      // Xây dựng query params
      const params = new URLSearchParams();
      params.append('mode', currentMode);
      currentExclusions.forEach(id => {
        params.append('exclude', id.toString());
      });

      const [suggestionsRes, favoritesRes] = await Promise.all([
        apiFetch(`/suggestions/?${params.toString()}`),
        apiFetch("/favorites/")
      ]);

      if (!suggestionsRes.ok) throw new Error("Không thể lấy gợi ý món ăn.");
      
      const suggestionsData = await suggestionsRes.json();
      setSuggestions(suggestionsData);

      if (favoritesRes.ok) {
        const favoriteData = await favoritesRes.json();
        setFavoriteIds(new Set(favoriteData.map((r: Recipe) => r.id)));
      }
      
    } catch (err: unknown) {
      if (err instanceof Error) setError(err.message);
      else setError("Lỗi không xác định");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (isClient) {
      if (!accessToken) {
        router.push("/login");
      } else {
        // Tự động tìm kiếm khi vào trang
        fetchSuggestions('strict', excludedIds);
      }
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isClient, accessToken, router]); // Bỏ dependency 'fetchSuggestions' và 'excludedIds' để tránh gọi lại vô tận

  const handleTabChange = (newMode: string) => {
    setMode(newMode as 'strict' | 'flexible');
    fetchSuggestions(newMode, excludedIds);
  };
  
  const handleExclusionChange = (newIds: Set<number>) => {
    setExcludedIds(newIds);
    // Tự động tìm kiếm lại ngay khi danh sách đen thay đổi
    fetchSuggestions(mode, newIds);
  }
  
  if (!isClient) return <div className="container py-10">Đang tải...</div>;

  return (
    <section className="container py-10">
      <div className="space-y-2 mb-8">
        <h1 className="text-3xl font-bold tracking-tight">Gợi ý cho bạn</h1>
        <p className="text-muted-foreground">&quot;Bộ não&quot; AI sẽ tìm những món ăn phù hợp nhất từ tủ lạnh của bạn.</p>
      </div>

      {/* Sửa lại cấu trúc <Tabs> cho đúng */}
      <Tabs value={mode} onValueChange={handleTabChange} className="w-full">
        <div className="flex flex-col md:flex-row gap-4 mb-4">
          <TabsList className="grid w-full grid-cols-2 md:w-[400px]">
            <TabsTrigger value="strict">Nấu Ngay</TabsTrigger>
            <TabsTrigger value="flexible">Thêm Chút Nữa</TabsTrigger>
          </TabsList>
          {/* Thêm "Bộ lọc Kiêng cữ" vào đây */}
          <ExclusionFilter selectedIds={excludedIds} onChange={handleExclusionChange} />
        </div>

        {/* Đặt TabsContent BÊN TRONG <Tabs> */}
        <TabsContent value="strict">
          {renderSuggestions("Bạn có đủ nguyên liệu (trừ gia vị cơ bản) để nấu những món này!")}
        </TabsContent>
        <TabsContent value="flexible">
          {renderSuggestions("Chỉ cần mua thêm 1-2 món, bạn có thể thử những món này!")}
        </TabsContent>
      </Tabs>
    </section>
  );
  
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
                    <RecipeCard 
                        key={recipe.id} 
                        recipe={recipe} 
                        rank={index + 1}
                        isInitiallyFavorited={favoriteIds.has(recipe.id)}
                        onFavoriteToggle={fetchFavorites}
                    />
                ))}
            </div>
        </>
    );
  }
}
