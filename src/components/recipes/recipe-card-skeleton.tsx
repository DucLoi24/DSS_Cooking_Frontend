import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export function RecipeCardSkeleton() {
  return (
    <Card className="flex flex-col">
      <CardHeader>
        {/* Giả lập dòng tiêu đề */}
        <Skeleton className="h-6 w-3/4" />
        {/* Giả lập 2 dòng mô tả */}
        <Skeleton className="h-4 w-full mt-2" />
        <Skeleton className="h-4 w-5/6" />
      </CardHeader>
      <CardContent className="flex-grow space-y-2">
        {/* Giả lập dòng thời gian */}
        <Skeleton className="h-4 w-1/2" />
        {/* Giả lập dòng độ khó */}
        <Skeleton className="h-4 w-1/3" />
      </CardContent>
      <CardFooter>
        {/* Giả lập nút bấm */}
        <Skeleton className="h-10 w-full" />
      </CardFooter>
    </Card>
  );
}