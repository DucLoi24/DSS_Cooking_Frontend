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
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setIsClient(true);
  }, []);

  // Tách hàm fetch ra để có thể gọi lại khi bỏ tim
  const fetchFavorites = useCallback(async () => {
    if (!accessToken) return;
    try {
      // Không cần setIsLoading ở đây để tránh giật màn hình khi tải lại
      const response = await apiFetch("/favorites/");
      if (!response.ok) {
        throw new Error("Không thể tải danh sách yêu thích của bạn.");
      }
      const data = await response.json();
      setFavorites(data);
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("Đã có lỗi không xác định xảy ra.");
      }
    } finally {
      // Chỉ set isLoading false ở lần tải đầu tiên
      if(isLoading) setIsLoading(false);
    }
  }, [accessToken, isLoading]);


  useEffect(() => {
    if (isClient) {
      if (!accessToken) {
        router.push("/login");
      } else {
        fetchFavorites();
      }
    }
  }, [isClient, accessToken, router, fetchFavorites]);
  
  if (!isClient || isLoading) {
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
                    // SỬA ĐỔI #1: Luôn luôn là true trên trang này
                    isInitiallyFavorited={true}
                    // SỬA ĐỔI #2: Khi người dùng bỏ tim, hãy tải lại danh sách
                    onFavoriteToggle={fetchFavorites}
                />
            ))}
        </div>
      ) : (
        <p>Bạn chưa &apos;thả tim&apos; cho công thức nào cả. Hãy bắt đầu khám phá nhé!</p>
      )}
    </section>
  );
}