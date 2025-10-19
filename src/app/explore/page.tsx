"use client";

import { useEffect, useState, useCallback } from "react";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { RecipeCard, Recipe } from "@/components/recipes/recipe-card";
import { RecipeCardSkeleton } from "@/components/recipes/recipe-card-skeleton";
import { Search } from "lucide-react";
import { useDebouncedCallback } from 'use-debounce';
import apiFetch from "@/lib/api";
import { useAuthStore } from "@/lib/store"; // Import store để kiểm tra đăng nhập

export default function ExplorePage() {
  const { accessToken } = useAuthStore(); // Lấy token để biết có cần fetch favorites không
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // State cho các bộ lọc
  const [searchTerm, setSearchTerm] = useState("");
  const [difficulty, setDifficulty] = useState("all");
  
  // SỬA ĐỔI #1: State mới để lưu ID các món yêu thích
  const [favoriteIds, setFavoriteIds] = useState<Set<number>>(new Set());

  // Hàm để lấy danh sách yêu thích
  const fetchFavorites = useCallback(async () => {
    if (!accessToken) return; // Chỉ chạy nếu đã đăng nhập
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


  const fetchRecipes = useCallback(async (search: string, diff: string) => {
    setIsLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams();
      if (search) params.append('search', search);
      if (diff && diff !== 'all') params.append('difficulty', diff);
      
      // SỬA ĐỔI #2: Gọi cả hai API song song để tăng tốc
      const [recipesRes, favoritesRes] = await Promise.all([
          apiFetch(`/recipes/?${params.toString()}`),
          accessToken ? apiFetch("/favorites/") : Promise.resolve(null)
      ]);
      
      if (!recipesRes.ok) throw new Error("Không thể tải công thức.");
      
      const recipesData = await recipesRes.json();
      setRecipes(recipesData);
      
      if(favoritesRes && favoritesRes.ok){
          const favoriteData = await favoritesRes.json();
          setFavoriteIds(new Set(favoriteData.map((r: Recipe) => r.id)));
      }

    } catch (err: unknown) {
      if (err instanceof Error) setError(err.message);
      else setError("Lỗi không xác định");
    } finally {
      setIsLoading(false);
    }
  }, [accessToken]); // Thêm accessToken vào dependency

  const debouncedFetch = useDebouncedCallback(fetchRecipes, 500);

  useEffect(() => {
    debouncedFetch(searchTerm, difficulty);
  }, [searchTerm, difficulty, debouncedFetch]);

  return (
    <section className="container py-10">
      <div className="space-y-2 mb-8">
        <h1 className="text-3xl font-bold tracking-tight">Khám phá Công thức</h1>
        <p className="text-muted-foreground">Tìm kiếm và lọc qua tất cả các món ăn đã được cộng đồng đóng góp.</p>
      </div>

      <div className="flex flex-col md:flex-row gap-4 mb-8">
        <div className="relative flex-grow">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
          <Input 
            placeholder="Tìm theo tên món ăn hoặc nguyên liệu (vd: bò, gà...)" 
            className="pl-10"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <Select value={difficulty} onValueChange={setDifficulty}>
          <SelectTrigger className="w-full md:w-[180px]">
            <SelectValue placeholder="Lọc theo độ khó" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tất cả độ khó</SelectItem>
            <SelectItem value="easy">Dễ</SelectItem>
            <SelectItem value="medium">Trung bình</SelectItem>
            <SelectItem value="hard">Khó</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {error && <p className="text-red-500">{error}</p>}
      
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {isLoading ? (
          <>
            <RecipeCardSkeleton />
            <RecipeCardSkeleton />
            <RecipeCardSkeleton />
          </>
        ) : recipes.length > 0 ? (
          recipes.map((recipe) => (
            <RecipeCard 
                key={recipe.id} 
                recipe={recipe} 
                // SỬA ĐỔI #3: Truyền trạng thái yêu thích ban đầu...
                isInitiallyFavorited={favoriteIds.has(recipe.id)}
                // ...và một hàm để "cấp trên" biết khi có thay đổi
                onFavoriteToggle={fetchFavorites}
            />
          ))
        ) : (
          <div className="col-span-full text-center py-10">
            <p className="text-muted-foreground">Không tìm thấy công thức nào phù hợp.</p>
          </div>
        )}
      </div>
    </section>
  );
}