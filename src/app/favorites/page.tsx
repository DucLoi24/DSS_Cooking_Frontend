"use client";

import { useEffect, useState } from "react";
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

  useEffect(() => {
    if (!isClient) return;

    if (!accessToken) {
      router.push("/login");
      return;
    }

    const fetchFavorites = async () => {
      try {
        const response = await apiFetch("/favorites/");
        if (!response.ok) {
          throw new Error("Không thể tải danh sách yêu thích của bạn.");
        }
        const data = await response.json();
        setFavorites(data);
      } catch (err: unknown) { // SỬA LỖI #2: Dùng 'unknown'
        if (err instanceof Error) {
            setError(err.message);
        } else {
            setError("Đã có lỗi không xác định xảy ra.")
        }
      } finally {
        setIsLoading(false);
      }
    };

    fetchFavorites();
  }, [isClient, accessToken, router]);
  
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
                <RecipeCard key={recipe.id} recipe={recipe} />
            ))}
        </div>
      ) : (
        // SỬA LỖI #3: Dùng nháy đơn để tránh lỗi
        <p>Bạn chưa 'thả tim' cho công thức nào cả. Hãy bắt đầu khám phá nhé!</p>
      )}
    </section>
  );
}