"use client";

import { useEffect, useState, useMemo } from "react";
import { useParams, useRouter } from "next/navigation";
import { useAuthStore } from "@/lib/store";
import apiFetch from "@/lib/api"; // SỬ DỤNG "NGƯỜI GIAO HÀNG" CHUYÊN NGHIỆP
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Clock, ChefHat, User, CheckCircle2, ShoppingCart } from "lucide-react";
import { cn } from "@/lib/utils";

// Định nghĩa các kiểu dữ liệu cần thiết
interface RecipeIngredient {
  id: number;
  name: string;
  quantity: string;
  unit: string;
}
interface RecipeDetail {
  id: number;
  title: string;
  description: string;
  instructions: string;
  difficulty: 'easy' | 'medium' | 'hard';
  cooking_time_minutes: number;
  author_name: string;
  ingredients: RecipeIngredient[];
}
interface PantryItem {
  ingredient_id: number;
  ingredient_name: string;
}

const difficultyMap = { easy: 'Dễ', medium: 'Trung bình', hard: 'Khó' };

export default function RecipeDetailPage() {
  const params = useParams();
  const { id } = params;
  const { accessToken } = useAuthStore();
  const router = useRouter();

  const [recipe, setRecipe] = useState<RecipeDetail | null>(null);
  const [pantryItems, setPantryItems] = useState<PantryItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isAdding, setIsAdding] = useState(false);

  useEffect(() => {
    if (!id) return;
    const fetchData = async () => {
      try {
        // SỬ DỤNG Promise.all VỚI apiFetch
        const [recipeRes, pantryRes] = await Promise.all([
          apiFetch(`/recipes/${id}/`), // Dùng apiFetch ở đây
          accessToken ? apiFetch("/pantry/") : Promise.resolve(null)
        ]);

        if (!recipeRes.ok) throw new Error("Không tìm thấy công thức.");
        const recipeData = await recipeRes.json();
        setRecipe(recipeData);

        if (pantryRes && pantryRes.ok) {
          const pantryData = await pantryRes.json();
          setPantryItems(pantryData);
        }
      } catch (err: any) {
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, [id, accessToken]);

  const missingIngredients = useMemo(() => {
    if (!recipe) return [];
    const pantryIngredientIds = new Set(pantryItems.map(item => item.ingredient_id));
    return recipe.ingredients.filter(ing => !pantryIngredientIds.has(ing.id));
  }, [recipe, pantryItems]);
  
  const handleAddMissingToCart = async () => {
      if(missingIngredients.length === 0) return;
      setIsAdding(true);
      try {
        await Promise.all(
            missingIngredients.map(ing => apiFetch('/shopping-list/', {
                method: 'POST',
                body: JSON.stringify({ ingredient: ing.id, quantity: `${ing.quantity} ${ing.unit}` })
            }))
        );
        router.push('/shopping-list');
      } catch (error) {
          console.error("Không thể thêm vào giỏ hàng:", error);
          setError("Đã có lỗi xảy ra khi thêm vào giỏ hàng.");
      } finally {
          setIsAdding(false);
      }
  }

  if (isLoading) return <div className="container py-10">Đang tải công thức...</div>;
  if (error || !recipe) return <div className="container py-10 text-red-500">Lỗi: {error || "Không thể tải công thức."}</div>;
  
  const pantryIngredientIds = new Set(pantryItems.map(item => item.ingredient_id));

  return (
    <section className="container py-10">
      {/* Phần tiêu đề */}
      <div className="space-y-2 mb-8">
        <h1 className="text-4xl font-bold tracking-tight">{recipe.title}</h1>
        <p className="text-lg text-muted-foreground">{recipe.description}</p>
      </div>

      {/* Phần thông tin meta */}
      <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-muted-foreground mb-8">
        <div className="flex items-center"><User className="mr-1 h-4 w-4" /> Tác giả: {recipe.author_name}</div>
        <div className="flex items-center"><Clock className="mr-1 h-4 w-4" /> {recipe.cooking_time_minutes} phút</div>
        <div className="flex items-center"><ChefHat className="mr-1 h-4 w-4" /><Badge variant="outline">{difficultyMap[recipe.difficulty]}</Badge></div>
      </div>

      <div className="grid gap-8 md:grid-cols-3">
        {/* Cột nguyên liệu */}
        <div className="md:col-span-1 flex flex-col gap-4">
          <Card>
            <CardHeader><CardTitle>Nguyên liệu cần chuẩn bị</CardTitle></CardHeader>
            <CardContent>
              <Table>
                <TableHeader><TableRow><TableHead>Tên</TableHead><TableHead>Số lượng</TableHead></TableRow></TableHeader>
                <TableBody>
                  {recipe.ingredients.map((ing) => (
                    <TableRow key={ing.id} className={cn(pantryIngredientIds.has(ing.id) && "bg-green-50 dark:bg-green-950")}>
                      <TableCell className="font-medium flex items-center">
                        {pantryIngredientIds.has(ing.id) && <CheckCircle2 className="h-4 w-4 mr-2 text-green-500" />}
                        {ing.name}
                      </TableCell>
                      <TableCell>{ing.quantity} {ing.unit}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
          
          {accessToken && missingIngredients.length > 0 && (
            <Button onClick={handleAddMissingToCart} disabled={isAdding}>
                <ShoppingCart className="mr-2 h-4 w-4" />
                {isAdding ? "Đang thêm..." : `Thêm ${missingIngredients.length} món còn thiếu vào giỏ`}
            </Button>
          )}

        </div>

        {/* Cột hướng dẫn */}
        <div className="md:col-span-2">
           <Card>
            <CardHeader><CardTitle>Các bước thực hiện</CardTitle></CardHeader>
            <CardContent className="prose max-w-none">
              <p style={{ whiteSpace: "pre-wrap" }}>{recipe.instructions}</p>
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  );
}