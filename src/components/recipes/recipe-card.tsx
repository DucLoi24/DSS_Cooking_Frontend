"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Clock, ChefHat, Tag, Heart } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import apiFetch from "@/lib/api";
import { useAuthStore } from "@/lib/store";
// Import toast từ thư viện mới
import { toast } from "sonner";


export interface Recipe {
  id: number;
  title: string;
  description: string;
  difficulty: 'easy' | 'medium' | 'hard';
  cooking_time_minutes: number;
  status?: 'private' | 'pending_approval' | 'public' | 'rejected';
}

interface RecipeCardProps {
  recipe: Recipe;
  rank?: number;
  isInitiallyFavorited?: boolean;
  onFavoriteToggle?: () => void;
}

const difficultyMap = { easy: 'Dễ', medium: 'Trung bình', hard: 'Khó' };
const statusMap = {
  private: { text: 'Riêng tư', variant: 'secondary' as const },
  pending_approval: { text: 'Chờ duyệt', variant: 'outline' as const },
  public: { text: 'Công khai', variant: 'default' as const },
  rejected: { text: 'Bị từ chối', variant: 'destructive' as const },
};

export function RecipeCard({ recipe, rank, isInitiallyFavorited = false, onFavoriteToggle }: RecipeCardProps) {
  const { accessToken } = useAuthStore();
  const [isFavorited, setIsFavorited] = useState(isInitiallyFavorited);
  const [isToggling, setIsToggling] = useState(false);

  const handleFavoriteClick = async () => {
    if (!accessToken) {
        toast.error("Vui lòng đăng nhập", {
            description: "Bạn cần đăng nhập để yêu thích công thức.",
        });
        return;
    }

    setIsToggling(true);
    const newFavoriteState = !isFavorited;
    setIsFavorited(newFavoriteState);

    try {
        const method = newFavoriteState ? 'POST' : 'DELETE';
        const response = await apiFetch(`/recipes/${recipe.id}/favorite/`, { method });

        if (!response.ok) {
            setIsFavorited(!newFavoriteState); // Hoàn tác
            throw new Error("Thao tác thất bại.");
        }
        
        const successMessage = newFavoriteState 
            ? `Đã thêm "${recipe.title}" vào danh sách yêu thích.` 
            : `Đã xóa "${recipe.title}" khỏi danh sách yêu thích.`;
        toast.success("Thành công!", { description: successMessage });
        
        if(onFavoriteToggle) onFavoriteToggle();

    } catch (error) {
        toast.error("Lỗi", { description: "Đã có lỗi xảy ra, vui lòng thử lại." });
    } finally {
        setIsToggling(false);
    }
  };

  const statusInfo = recipe.status ? statusMap[recipe.status] : null;

  return (
    <Card className="flex flex-col relative">
      {accessToken && (
        <Button 
            variant="ghost" 
            size="icon" 
            className="absolute top-2 right-2 h-8 w-8 z-10"
            onClick={handleFavoriteClick}
            disabled={isToggling}
        >
            <Heart className={cn("h-5 w-5", isFavorited ? "fill-red-500 text-red-500" : "text-gray-400")} />
        </Button>
      )}

      <CardHeader>
        <div className="flex justify-between items-start gap-4">
          <div className="flex-grow pr-10">
            <CardTitle>{recipe.title}</CardTitle>
            <CardDescription className="mt-1">{recipe.description}</CardDescription>
          </div>
          {rank && (
            <div className="bg-primary text-primary-foreground h-9 w-9 rounded-full flex-shrink-0 flex items-center justify-center font-bold text-lg">
              {rank}
            </div>
          )}
        </div>
      </CardHeader>
      <CardContent className="flex-grow space-y-2">
        <div className="flex items-center text-sm text-muted-foreground">
          <Clock className="mr-1 h-4 w-4" />
          {recipe.cooking_time_minutes} phút
        </div>
        <div className="flex items-center text-sm text-muted-foreground">
          <ChefHat className="mr-1 h-4 w-4" />
          Độ khó: {difficultyMap[recipe.difficulty] || 'Không xác định'}
        </div>
        {statusInfo && (
            <div className="flex items-center text-sm text-muted-foreground">
                <Tag className="mr-1 h-4 w-4" />
                <Badge variant={statusInfo.variant}>{statusInfo.text}</Badge>
            </div>
        )}
      </CardContent>
      <CardFooter>
        <Link href={`/recipes/${recipe.id}`} className="w-full">
          <Button className="w-full">Xem chi tiết</Button>
        </Link>
      </CardFooter>
    </Card>
  );
}