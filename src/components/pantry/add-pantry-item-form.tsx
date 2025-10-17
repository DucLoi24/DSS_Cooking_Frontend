"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem } from "@/components/ui/command";
import { Check, ChevronsUpDown } from "lucide-react";
import { cn } from "@/lib/utils";
import apiFetch from "@/lib/api"; // Import hàm fetch thông minh

// Định nghĩa hình dáng của một nguyên liệu trong Master List
interface Ingredient {
  id: number;
  name: string;
}

// Props mà component này nhận vào: một hàm để gọi sau khi thêm thành công
interface AddPantryItemFormProps {
  onItemAdded: () => void;
}

export function AddPantryItemForm({ onItemAdded }: AddPantryItemFormProps) {
  const [masterIngredients, setMasterIngredients] = useState<Ingredient[]>([]);
  const [selectedIngredient, setSelectedIngredient] = useState<number | null>(null);
  const [quantity, setQuantity] = useState("");
  const [error, setError] = useState("");
  const [openCombobox, setOpenCombobox] = useState(false);

  // Lấy Master List các nguyên liệu khi component được tải
  useEffect(() => {
    const fetchMasterIngredients = async () => {
      // Dùng fetch thường vì đây là API public
      const response = await fetch("http://127.0.0.1:8000/api/ingredients/");
      const data = await response.json();
      setMasterIngredients(data);
    };
    fetchMasterIngredients();
  }, []);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError("");

    if (!selectedIngredient) {
      setError("Vui lòng chọn một nguyên liệu.");
      return;
    }

    try {
      // Dùng hàm fetch thông minh
      const response = await apiFetch("/pantry/", {
        method: "POST",
        body: JSON.stringify({
          ingredient: selectedIngredient,
          quantity: quantity,
        }),
      });

      if (!response.ok) {
        throw new Error("Không thể thêm nguyên liệu.");
      }

      // Gọi hàm được truyền từ component cha để báo hiệu đã xong
      onItemAdded();
      // Reset form
      setSelectedIngredient(null);
      setQuantity("");
    } catch (err: any) {
      setError(err.message);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="grid gap-4 py-4">
      <div className="grid gap-2">
        <Label htmlFor="ingredient">Nguyên liệu</Label>
        {/* Đây là component Combobox - ô tìm kiếm thả xuống */}
        <Popover open={openCombobox} onOpenChange={setOpenCombobox}>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              role="combobox"
              aria-expanded={openCombobox}
              className="w-full justify-between"
            >
              {selectedIngredient
                ? masterIngredients.find((ing) => ing.id === selectedIngredient)?.name
                : "Chọn nguyên liệu..."}
              <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-[300px] p-0">
            <Command>
              <CommandInput placeholder="Tìm nguyên liệu..." />
              <CommandEmpty>Không tìm thấy nguyên liệu.</CommandEmpty>
              <CommandGroup className="max-h-[200px] overflow-y-auto">
                {masterIngredients.map((ingredient) => (
                  <CommandItem
                    key={ingredient.id}
                    value={ingredient.name}
                    onSelect={() => {
                      setSelectedIngredient(ingredient.id);
                      setOpenCombobox(false);
                    }}
                  >
                    <Check
                      className={cn(
                        "mr-2 h-4 w-4",
                        selectedIngredient === ingredient.id ? "opacity-100" : "opacity-0"
                      )}
                    />
                    {ingredient.name}
                  </CommandItem>
                ))}
              </CommandGroup>
            </Command>
          </PopoverContent>
        </Popover>
      </div>
      <div className="grid gap-2">
        <Label htmlFor="quantity">Số lượng (ví dụ: 200g, 1 quả)</Label>
        <Input
          id="quantity"
          value={quantity}
          onChange={(e) => setQuantity(e.target.value)}
        />
      </div>
      {error && <p className="text-sm text-red-500">{error}</p>}
      <Button type="submit">Thêm vào tủ</Button>
    </form>
  );
}