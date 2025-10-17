"use client";

import { useEffect, useState } from "react";
import apiFetch from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem } from "@/components/ui/command";
import { Check, ChevronsUpDown } from "lucide-react";
import { cn } from "@/lib/utils";

interface Ingredient {
  id: number;
  name: string;
}

interface AddShoppingListItemFormProps {
  onItemAdded: () => void;
}

export function AddShoppingListItemForm({ onItemAdded }: AddShoppingListItemFormProps) {
  const [masterIngredients, setMasterIngredients] = useState<Ingredient[]>([]);
  const [selectedIngredient, setSelectedIngredient] = useState<number | null>(null);
  const [quantity, setQuantity] = useState("");
  const [error, setError] = useState("");
  const [openCombobox, setOpenCombobox] = useState(false);

  useEffect(() => {
    const fetchMasterIngredients = async () => {
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
      const response = await apiFetch("/shopping-list/", {
        method: "POST",
        body: JSON.stringify({
          ingredient: selectedIngredient,
          quantity: quantity,
        }),
      });

      if (!response.ok) {
        throw new Error("Không thể thêm vào giỏ hàng.");
      }

      onItemAdded();
      setSelectedIngredient(null);
      setQuantity("");
    } catch (err: unknown) { // SỬA LỖI Ở ĐÂY
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("Đã có lỗi không xác định xảy ra.");
      }
    }
  };

  return (
    <form onSubmit={handleSubmit} className="grid gap-4 py-4">
      <div className="grid gap-2">
        <Label htmlFor="ingredient">Nguyên liệu</Label>
        <Popover open={openCombobox} onOpenChange={setOpenCombobox}>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              role="combobox"
              aria-expanded={openCombobox}
              className="w-full justify-between"
            >
              {selectedIngredient ? masterIngredients.find((ing) => ing.id === selectedIngredient)?.name : "Chọn nguyên liệu cần mua..."}
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
          placeholder="Tùy chọn"
        />
      </div>
      {error && <p className="text-sm text-red-500">{error}</p>}
      <Button type="submit">Thêm vào giỏ</Button>
    </form>
  );
}