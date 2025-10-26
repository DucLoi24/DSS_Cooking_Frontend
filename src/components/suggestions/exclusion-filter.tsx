"use client";

import { useEffect, useState } from "react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem } from "@/components/ui/command";
import { Check, ChevronsUpDown, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";

interface Ingredient {
  id: number;
  name: string;
}

interface ExclusionFilterProps {
  // Nhận vào danh sách ID bị cấm hiện tại
  selectedIds: Set<number>; 
  // Trả về danh sách ID mới mỗi khi có thay đổi
  onChange: (newIds: Set<number>) => void; 
}

export function ExclusionFilter({ selectedIds, onChange }: ExclusionFilterProps) {
  const [masterIngredients, setMasterIngredients] = useState<Ingredient[]>([]);
  const [openCombobox, setOpenCombobox] = useState(false);
  
  const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://127.0.0.1:8000';

  // Lấy Master List nguyên liệu khi component tải
  useEffect(() => {
    const fetchMasterIngredients = async () => {
      // API này là public, dùng fetch thường cho đơn giản
      const response = await fetch(`${API_BASE_URL}/api/ingredients/`);
      const data = await response.json();
      setMasterIngredients(data);
    };
    fetchMasterIngredients();
  }, [API_BASE_URL]);

  const handleSelect = (ingredientId: number) => {
    const newSet = new Set(selectedIds);
    if (newSet.has(ingredientId)) {
      newSet.delete(ingredientId);
    } else {
      newSet.add(ingredientId);
    }
    onChange(newSet);
  };

  const selectedIngredients = masterIngredients.filter(ing => selectedIds.has(ing.id));

  return (
    <Popover open={openCombobox} onOpenChange={setOpenCombobox}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={openCombobox}
          className="w-full justify-between md:w-[300px]"
        >
          <span className="truncate">
            {selectedIngredients.length > 0
              ? selectedIngredients.map(ing => ing.name).join(", ")
              : "Loại trừ nguyên liệu..."}
          </span>
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[300px] p-0">
        <Command>
          <CommandInput placeholder="Tìm nguyên liệu để kiêng..." />
          <CommandEmpty>Không tìm thấy.</CommandEmpty>
          <CommandGroup className="max-h-[200px] overflow-y-auto">
            {masterIngredients.map((ingredient) => (
              <CommandItem
                key={ingredient.id}
                value={ingredient.name}
                onSelect={() => handleSelect(ingredient.id)}
              >
                <Check
                  className={cn(
                    "mr-2 h-4 w-4",
                    selectedIds.has(ingredient.id) ? "opacity-100" : "opacity-0"
                  )}
                />
                {ingredient.name}
              </CommandItem>
            ))}
          </CommandGroup>
        </Command>
        
        {/* Hiển thị các mục đã chọn */}
        {selectedIngredients.length > 0 && (
            <div className="p-2 border-t">
                <p className="text-xs font-medium text-muted-foreground mb-2">Đang kiêng:</p>
                <div className="flex flex-wrap gap-1">
                    {selectedIngredients.map(ing => (
                        <Badge
                            key={ing.id}
                            variant="secondary"
                            className="cursor-pointer"
                            onClick={() => handleSelect(ing.id)}
                        >
                            {ing.name}
                            <X className="ml-1 h-3 w-3" />
                        </Badge>
                    ))}
                </div>
            </div>
        )}
      </PopoverContent>
    </Popover>
  );
}