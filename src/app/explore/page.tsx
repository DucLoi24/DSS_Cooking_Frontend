"use client";

import { useEffect, useState, useCallback } from "react";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { RecipeCard, Recipe } from "@/components/recipes/recipe-card";
import { RecipeCardSkeleton } from "@/components/recipes/recipe-card-skeleton";
import { Search } from "lucide-react";
import { useDebouncedCallback } from 'use-debounce';
// SỬ DỤNG "NGƯỜI GIAO HÀNG" CHUYÊN NGHIỆP
import apiFetch from "@/lib/api";

export default function ExplorePage() {
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [searchTerm, setSearchTerm] = useState("");
  const [difficulty, setDifficulty] = useState("all");

  const fetchRecipes = useCallback(async (search: string, diff: string) => {
    setIsLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams();
      if (search) params.append('search', search);
      if (diff && diff !== 'all') params.append('difficulty', diff);
      
      // SỬA LỖI Ở ĐÂY: Dùng apiFetch và endpoint tương đối
      const response = await apiFetch(`/recipes/?${params.toString()}`);
      
      if (!response.ok) throw new Error("Không thể tải công thức.");
      
      const data = await response.json();
      setRecipes(data);
    } catch (err: unknown) {
      if (err instanceof Error) setError(err.message);
      else setError("Lỗi không xác định");
    } finally {
      setIsLoading(false);
    }
  }, []);

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

      {/* Thanh công cụ tìm kiếm và lọc */}
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
      
      {/* Lưới hiển thị kết quả */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {isLoading ? (
          <>
            <RecipeCardSkeleton />
            <RecipeCardSkeleton />
            <RecipeCardSkeleton />
          </>
        ) : recipes.length > 0 ? (
          recipes.map((recipe) => (
            <RecipeCard key={recipe.id} recipe={recipe} />
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