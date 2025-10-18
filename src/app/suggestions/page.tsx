"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/lib/store";
import apiFetch from "@/lib/api";
import { Button } from "@/components/ui/button";
import { RecipeCard, Recipe } from "@/components/recipes/recipe-card";
import { RecipeCardSkeleton } from "@/components/recipes/recipe-card-skeleton";

export default function SuggestionsPage() {
  const { accessToken } = useAuthStore();
  const router = useRouter();
  const [isClient, setIsClient] = useState(false);

  const [suggestions, setSuggestions] = useState<Recipe[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasSearched, setHasSearched] = useState(false);
  const [favoriteIds, setFavoriteIds] = useState<Set<number>>(new Set());

  useEffect(() => {
    setIsClient(true);
  }, []);

  const fetchFavorites = useCallback(async () => {
    if (!accessToken) return;
    try {
        const response = await apiFetch("/favorites/");
        if(response.ok) {
            const favoriteRecipes: Recipe[] = await response.json();
            setFavoriteIds(new Set(favoriteRecipes.map(r => r.id)));
        }
    } catch (error) {
        console.error("Failed to fetch favorites:", error);
    }
  }, [accessToken]);

  const handleFetchSuggestions = async () => {
    setIsLoading(true);
    setError(null);
    setSuggestions([]);
    setHasSearched(true);
    try {
      const [suggestionsRes, favoritesRes] = await Promise.all([
          apiFetch("/suggestions/"),
          apiFetch("/favorites/")
      ]);
      if (!suggestionsRes.ok) {
        throw new Error("Không thể lấy gợi ý món ăn.");
      }
      if (favoritesRes.ok) {
          const favoriteRecipes: Recipe[] = await favoritesRes.json();
          setFavoriteIds(new Set(favoriteRecipes.map(r => r.id)));
      }
      const data: Recipe[] = await suggestionsRes.json();
      setSuggestions(data);
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("Đã có lỗi không xác định xảy ra.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (isClient && !accessToken) {
      router.push("/login");
    }
  }, [isClient, accessToken, router]);
  
  if (!isClient) {
    return (
      <div className="container py-10">
        <div className="flex flex-col items-start gap-4">
          <h1 className="text-3xl font-extrabold leading-tight tracking-tighter md:text-4xl">
            Khám phá Món ăn
          </h1>
          <p className="max-w-[700px] text-lg text-muted-foreground">
            Dựa trên những gì bạn có trong tủ lạnh, đây là những gợi ý dành cho bạn.
          </p>
          <Button disabled>Đang tải...</Button>
        </div>
      </div>
    );
  }

  return (
    <section className="container grid items-center gap-6 pb-8 pt-6 md:py-10">
      <div className="flex flex-col items-start gap-4">
        <h1 className="text-3xl font-extrabold leading-tight tracking-tighter md:text-4xl">
          Khám phá Món ăn
        </h1>
        <p className="max-w-[700px] text-lg text-muted-foreground">
          Sẵn sàng nấu ăn? Bấm nút để bộ não AI của chúng tôi tìm món phù hợp nhất!
        </p>
        <Button onClick={handleFetchSuggestions} disabled={isLoading} size="lg">
          {isLoading ? "Đang suy nghĩ..." : "Tìm món ăn ngay!"}
        </Button>
      </div>

      {error && <p className="mt-4 text-red-500">Lỗi: {error}</p>}

      <div className="mt-8 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {isLoading ? (
          <>
            <RecipeCardSkeleton />
            <RecipeCardSkeleton />
            <RecipeCardSkeleton />
          </>
        ) : (
          suggestions.map((recipe, index) => (
            <RecipeCard 
              key={recipe.id} 
              recipe={recipe} 
              rank={index + 1}
              isInitiallyFavorited={favoriteIds.has(recipe.id)}
              onFavoriteToggle={fetchFavorites}
            />
          ))
        )}
      </div>
      
      {!isLoading && hasSearched && suggestions.length === 0 && (
         <div className="text-center py-10 border rounded-md col-span-full">
            <h3 className="font-semibold">Không tìm thấy món ăn phù hợp</h3>
            <p className="text-sm text-muted-foreground">Có vẻ như không có món nào khớp với nguyên liệu của bạn. Hãy thử thêm đồ vào tủ lạnh nhé!</p>
         </div>
      )}
    </section>
  );
}