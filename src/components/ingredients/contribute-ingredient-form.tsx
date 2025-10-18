// src/components/ingredients/contribute-ingredient-form.tsx

"use client";

import { useState } from "react";
import apiFetch from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { DialogFooter, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
// Import các component cho ô Select
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface NewIngredient {
  id: number;
  name: string;
  description: string | null;
  category: string;
}

interface ContributeIngredientFormProps {
  onSuccess: (newIngredient: NewIngredient) => void;
}

// "Từ điển" để dịch category sang tiếng Việt
const categoryMap = [
    { value: 'protein', label: 'Đạm (Thịt, cá, trứng...)' },
    { value: 'vegetable', label: 'Rau củ quả' },
    { value: 'carb', label: 'Tinh bột (Gạo, bún...)' },
    { value: 'spice', label: 'Gia vị (Hành, tỏi...)' },
    { value: 'staple', label: 'Gia vị cơ bản (Dầu, muối...)' },
    { value: 'other', label: 'Khác' },
];

export function ContributeIngredientForm({ onSuccess }: ContributeIngredientFormProps) {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  // State mới cho category, mặc định là 'other'
  const [category, setCategory] = useState("other");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError("");
    setIsSubmitting(true);

    if (!name.trim()) {
      setError("Tên nguyên liệu không được để trống.");
      setIsSubmitting(false);
      return;
    }

    try {
      const response = await apiFetch("/ingredients/", {
        method: "POST",
        // Gửi cả category lên backend
        body: JSON.stringify({ name, description, category }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        const specificError = errorData.name?.[0] || "Đã có lỗi không xác định xảy ra.";
        if (specificError.includes("already exists")) {
            throw new Error(`Nguyên liệu "${name}" đã tồn tại trong hệ thống.`);
        }
        throw new Error(specificError);
      }

      const newIngredient = await response.json();
      onSuccess(newIngredient);

    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("Đã có lỗi không xác định xảy ra.");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <DialogHeader>
        <DialogTitle>Đóng góp Nguyên liệu mới</DialogTitle>
        <DialogDescription>
          Phân loại chính xác sẽ giúp hệ thống gợi ý món ăn thông minh hơn.
        </DialogDescription>
      </DialogHeader>
      <form onSubmit={handleSubmit} className="grid gap-4 py-4">
        <div className="grid gap-2">
          <Label htmlFor="name">Tên nguyên liệu</Label>
          <Input id="name" value={name} onChange={(e) => setName(e.target.value)} placeholder="Ví dụ: Lá é" required />
        </div>
        
        {/* Ô CHỌN CATEGORY MỚI */}
        <div className="grid gap-2">
          <Label htmlFor="category">Phân loại</Label>
          <Select value={category} onValueChange={setCategory}>
            <SelectTrigger id="category">
                <SelectValue placeholder="Chọn phân loại..." />
            </SelectTrigger>
            <SelectContent>
                {categoryMap.map(cat => (
                    <SelectItem key={cat.value} value={cat.value}>{cat.label}</SelectItem>
                ))}
            </SelectContent>
          </Select>
        </div>

        <div className="grid gap-2">
          <Label htmlFor="description">Mô tả (tùy chọn)</Label>
          <Textarea id="description" value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Mô tả ngắn về nguyên liệu này..." />
        </div>
        {error && <p className="text-sm text-red-500">{error}</p>}
        <DialogFooter>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? "Đang gửi..." : "Gửi đi duyệt"}
          </Button>
        </DialogFooter>
      </form>
    </>
  );
}

