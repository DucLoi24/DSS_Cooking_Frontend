import { RecipeForm } from "@/components/recipes/recipe-form";

export default function NewRecipePage() {
  return (
    <section className="container py-10">
      <div className="max-w-3xl mx-auto">
        <div className="space-y-2 mb-8">
          <h1 className="text-3xl font-bold tracking-tight">Viết công thức mới</h1>
          <p className="text-muted-foreground">
            Chia sẻ món ăn tuyệt vời của bạn với cộng đồng.
          </p>
        </div>
        <RecipeForm />
      </div>
    </section>
  );
}