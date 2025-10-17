// src/components/recipes/recipe-card.tsx

import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Clock, ChefHat, Tag } from "lucide-react";
import { Badge } from "../ui/badge"; // Import Badge

// Mở rộng interface để nhận thêm trường 'status' (tùy chọn)
export interface Recipe {
  id: number;
  title: string;
  description: string;
  difficulty: 'easy' | 'medium' | 'hard';
  cooking_time_minutes: number;
  status?: 'private' | 'pending_approval' | 'public' | 'rejected'; // Thêm status
}

interface RecipeCardProps {
  recipe: Recipe;
}

const difficultyMap = { easy: 'Dễ', medium: 'Trung bình', hard: 'Khó' };

// Tạo map cho status
const statusMap = {
  private: { text: 'Riêng tư', variant: 'secondary' as const },
  pending_approval: { text: 'Chờ duyệt', variant: 'outline' as const },
  public: { text: 'Công khai', variant: 'default' as const },
  rejected: { text: 'Bị từ chối', variant: 'destructive' as const },
};

export function RecipeCard({ recipe }: RecipeCardProps) {
  const statusInfo = recipe.status ? statusMap[recipe.status] : null;

  return (
    <Card className="flex flex-col">
      <CardHeader>
        <CardTitle>{recipe.title}</CardTitle>
        <CardDescription>{recipe.description}</CardDescription>
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
        {/* Chỉ hiển thị Badge status nếu có */}
        {statusInfo && (
            <div className="flex items-center text-sm text-muted-foreground">
                <Tag className="mr-1 h-4 w-4" />
                <Badge variant={statusInfo.variant}>{statusInfo.text}</Badge>
            </div>
        )}
      </CardContent>
      <CardFooter>
        <Link href={`/recipes/${recipe.id}`} className="w-full">
          <Button className="w-full">Xem & Sửa</Button>
        </Link>
      </CardFooter>
    </Card>
  );
}