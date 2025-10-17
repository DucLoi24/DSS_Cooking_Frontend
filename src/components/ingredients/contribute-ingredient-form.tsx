"use client";

import { useState } from "react";
import apiFetch from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { DialogFooter, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";

interface NewIngredient {
  id: number;
  name: string;
  description: string | null;
}

interface ContributeIngredientFormProps {
  onSuccess: (newIngredient: NewIngredient) => void;
}

export function ContributeIngredientForm({ onSuccess }: ContributeIngredientFormProps) {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
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
        body: JSON.stringify({ name, description }),
      });

      // --- NÂNG CẤP LOGIC XỬ LÝ LỖI ---
      if (!response.ok) {
        // Nếu có lỗi, hãy đọc nội dung JSON của lỗi đó
        const errorData = await response.json();
        
        // Lấy thông báo lỗi chi tiết từ backend
        // Lỗi validation của Django REST Framework thường có dạng { "field_name": ["error message"] }
        const specificError = errorData.name?.[0] || "Đã có lỗi không xác định xảy ra.";
        
        // Dịch thông báo lỗi của Django sang tiếng Việt cho thân thiện
        if (specificError.includes("already exists")) {
            throw new Error(`Nguyên liệu "${name}" đã tồn tại trong hệ thống.`);
        }

        throw new Error(specificError);
      }

      const newIngredient = await response.json();
      onSuccess(newIngredient);

    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <DialogHeader>
        <DialogTitle>Đóng góp Nguyên liệu mới</DialogTitle>
        <DialogDescription>
          Không tìm thấy nguyên liệu bạn cần? Hãy thêm nó vào hệ thống. Nguyên liệu sẽ được admin duyệt trước khi hiển thị công khai.
        </DialogDescription>
      </DialogHeader>
      <form onSubmit={handleSubmit} className="grid gap-4 py-4">
        <div className="grid gap-2">
          <Label htmlFor="name">Tên nguyên liệu</Label>
          <Input
            id="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Ví dụ: Lá é"
            required
          />
        </div>
        <div className="grid gap-2">
          <Label htmlFor="description">Mô tả (tùy chọn)</Label>
          <Textarea
            id="description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Mô tả ngắn về nguyên liệu này..."
          />
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