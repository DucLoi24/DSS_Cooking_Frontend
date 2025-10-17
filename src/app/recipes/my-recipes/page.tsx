"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/lib/store";
import apiFetch from "@/lib/api";
import { RecipeCard, Recipe } from "@/components/recipes/recipe-card";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function MyRecipesPage() {
  const { accessToken } = useAuthStore();
  const router = useRouter();
  const [isClient, setIsClient] = useState(false);
  const [recipes, setRecipes] = useState<Recipe[]>([]);
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

    const fetchMyRecipes = async () => {
      try {
        const response = await apiFetch("/recipes/my-recipes/");
        if (!response.ok) {
          throw new Error("Không thể tải danh sách công thức của bạn.");
        }
        const data = await response.json();
        setRecipes(data);
      } catch (err: unknown) { // SỬA LỖI: Dùng `unknown` thay cho `any`
        if (err instanceof Error) {
          setError(err.message);
        } else {
          setError("Đã có lỗi không xác định xảy ra.");
        }
      } finally {
        setIsLoading(false);
      }
    };

    fetchMyRecipes();
  }, [isClient, accessToken, router]);
  
  if (!isClient || isLoading) {
    return <div className="container py-10">Đang tải công thức của bạn...</div>;
  }

  return (
    <section className="container py-10">
      <div className="flex items-center justify-between mb-8">
        <div className="space-y-2">
          <h1 className="text-3xl font-bold tracking-tight">Công thức của tôi</h1>
          <p className="text-muted-foreground">Quản lý tất cả các công thức bạn đã tạo.</p>
        </div>
        <Link href="/recipes/new">
            <Button>Viết công thức mới</Button>
        </Link>
      </div>
      
      {error && <p className="text-red-500">{error}</p>}
      
      {recipes.length > 0 ? (
         <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {recipes.map((recipe) => (
                <RecipeCard key={recipe.id} recipe={recipe} />
            ))}
        </div>
      ) : (
        <p>Bạn chưa tạo công thức nào. Hãy bắt đầu chia sẻ món ăn của bạn!</p>
      )}
    </section>
  );
}