"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/lib/store";
import apiFetch from "@/lib/api";
import { RecipeCard, Recipe } from "@/components/recipes/recipe-card";

export default function FavoritesPage() {
  const { accessToken } = useAuthStore();
  const router = useRouter();
  const [isClient, setIsClient] = useState(false);
  const [favorites, setFavorites] = useState<Recipe[]>([]);
  const [initialLoading, setInitialLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setIsClient(true);
  }, []);

 // Tách hàm fetch ra để có thể gọi lại khi bỏ tim
  const fetchFavorites = useCallback(async () => {
    if (!accessToken) return;
    try {
      // Không cần setLoading ở đây để tránh giật màn hình khi tải lại
      const response = await apiFetch("/favorites/");
      if (!response.ok) {
        throw new Error("Không thể tải danh sách yêu thích của bạn.");
      }
      const data = await response.json();
      setFavorites(data);
      setError(null); // Xóa lỗi nếu có
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("Đã có lỗi không xác định xảy ra.");
      }
      // Trong trường hợp lỗi, không thay đổi danh sách favorites
    } finally {
      // Chỉ set initial loading là false ở lần đầu tiên
      setInitialLoading(false);
    }
  }, [accessToken]);


  useEffect(() => {
    if (isClient) {
      if (!accessToken) {
        router.push("/login");
      } else {
        fetchFavorites();
      }
    }
  }, [isClient, accessToken, router, fetchFavorites]);
  
  // Hàm để xóa một món khỏi danh sách yêu thích mà không cần fetch lại
  const removeFavorite = useCallback((recipeId: number) => {
    setFavorites(prev => prev.filter(recipe => recipe.id !== recipeId));
  }, []);
  
  if (!isClient || initialLoading) {
    return <div className="container py-10">Đang tải bộ sưu tập của bạn...</div>;
  }

  return (
    <section className="container py-10">
      <div className="space-y-2 mb-8">
        <h1 className="text-3xl font-bold tracking-tight">Món ăn Yêu thích</h1>
        <p className="text-muted-foreground">Bộ sưu tập những công thức tuyệt vời bạn đã lưu lại.</p>
      </div>
      
      {error && <p className="text-red-500">{error}</p>}
      
      {favorites.length > 0 ? (
         <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {favorites.map((recipe) => (
                <RecipeCard 
                    key={recipe.id} 
                    recipe={recipe} 
                    // Luôn đánh dấu là yêu thích vì đang ở trong trang yêu thích
                    isInitiallyFavorited={true}
                    // Khi toggle yêu thích, xóa món khỏi danh sách (vì không còn yêu thích nữa)
                    onFavoriteToggle={() => removeFavorite(recipe.id)}
                />
            ))}
        </div>
      ) : (
        <p>Bạn chưa 'thả tim' cho công thức nào cả. Hãy bắt đầu khám phá nhé!</p>
      )}
    </section>
  );
}
