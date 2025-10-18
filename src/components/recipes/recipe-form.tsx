"use client";

import { useEffect, useState } from "react";
import { useForm, useFieldArray, Resolver, SubmitHandler } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useRouter } from "next/navigation";
import apiFetch from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem } from "@/components/ui/command";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Check, ChevronsUpDown, PlusCircle, Trash } from "lucide-react";
import { cn } from "@/lib/utils";
import { ContributeIngredientForm } from "../ingredients/contribute-ingredient-form";

// Định nghĩa hình dáng của nguyên liệu từ Master List
interface Ingredient {
    id: number;
    name: string;
}

// === BẢN QUY TẮC CUỐI CÙNG, ĐÃ ĐƯỢC SỬA LỖI HOÀN CHỈNH ===
const formSchema = z.object({
    title: z.string().min(3, { message: "Tiêu đề phải có ít nhất 3 ký tự." }),
    description: z.string().optional(),
    instructions: z.string().min(10, { message: "Hướng dẫn phải có ít nhất 10 ký tự." }),
    difficulty: z.enum(["easy", "medium", "hard"]),

    // SỬA LỖI Ở ĐÂY: Loại bỏ object cấu hình không hợp lệ khỏi .int()
    // Thay .int({ message: ... }) bằng .int() và thêm .refine(...) để có message tuỳ chỉnh.
    cooking_time_minutes: z.coerce
        .number()
        .int() // không truyền tham số vào .int()
        .refine(Number.isInteger, { message: "Phải là số nguyên." }) // message tuỳ chỉnh
        .positive({ message: "Thời gian nấu phải lớn hơn 0." }),

    ingredients: z.array(z.object({
        ingredient: z.number().min(1, { message: "Vui lòng chọn nguyên liệu." }),
        quantity: z.string().min(1, { message: "Vui lòng nhập số lượng." }),
        unit: z.string().optional(),
    })).min(1, { message: "Phải có ít nhất một nguyên liệu." }),
});

// Tạo một type từ schema để tái sử dụng
type RecipeFormValues = z.infer<typeof formSchema>;

export function RecipeForm() {
    const router = useRouter();
    const [masterIngredients, setMasterIngredients] = useState<Ingredient[]>([]);
    const [isContributeDialogOpen, setIsContributeDialogOpen] = useState(false);

    const form = useForm<RecipeFormValues>({
        resolver: zodResolver(formSchema) as Resolver<RecipeFormValues>, // cast resolver để khớp generic
        defaultValues: {
            title: "",
            description: "",
            instructions: "",
            difficulty: "easy",
            cooking_time_minutes: 15,
            ingredients: [],
        },
    });

    const { fields, append, remove } = useFieldArray({
        control: form.control,
        name: "ingredients",
    });

    // Add BASE_URL constant (reads from env with a fallback)
    const BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "http://127.0.0.1:8000";

    useEffect(() => {
        const fetchMasterIngredients = async () => {
            const response = await fetch(`${BASE_URL}/api/ingredients/`);
            const data = await response.json();
            setMasterIngredients(data);
        };
        fetchMasterIngredients();
    }, []);

    const onSubmit: SubmitHandler<RecipeFormValues> = async (values) => {
        try {
            const response = await apiFetch("/recipes/", {
                method: "POST",
                body: JSON.stringify(values),
            });

            if (!response.ok) {
                throw new Error("Tạo công thức thất bại.");
            }
            router.push('/recipes/my-recipes');
            router.refresh();
        } catch (error) {
            console.error(error);
        }
    }

    // Hàm xử lý sau khi đóng góp thành công
    const handleIngredientContributed = (newIngredient: Ingredient) => {
        // Thêm nguyên liệu mới vào danh sách hiện tại để người dùng có thể chọn ngay
        setMasterIngredients(prev => [...prev, newIngredient]);
        // Đóng hộp thoại
        setIsContributeDialogOpen(false);
    };

    return (
        <>
            <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
                    <FormField control={form.control} name="title" render={({ field }) => (<FormItem><FormLabel>Tiêu đề</FormLabel><FormControl><Input placeholder="Ví dụ: Gà luộc lá chanh" {...field} /></FormControl><FormMessage /></FormItem>)} />
                    <FormField control={form.control} name="description" render={({ field }) => (<FormItem><FormLabel>Mô tả ngắn</FormLabel><FormControl><Textarea placeholder="Mô tả về món ăn của bạn..." {...field} /></FormControl><FormMessage /></FormItem>)} />
                    <FormField control={form.control} name="instructions" render={({ field }) => (<FormItem><FormLabel>Hướng dẫn thực hiện</FormLabel><FormControl><Textarea placeholder="Bước 1:..." {...field} rows={8} /></FormControl><FormMessage /></FormItem>)} />
                    <div className="grid grid-cols-2 gap-4">
                        <FormField control={form.control} name="difficulty" render={({ field }) => (<FormItem><FormLabel>Độ khó</FormLabel><Select onValueChange={field.onChange} defaultValue={field.value}><FormControl><SelectTrigger><SelectValue placeholder="Chọn độ khó" /></SelectTrigger></FormControl><SelectContent><SelectItem value="easy">Dễ</SelectItem><SelectItem value="medium">Trung bình</SelectItem><SelectItem value="hard">Khó</SelectItem></SelectContent></Select><FormMessage /></FormItem>)} />
                        <FormField control={form.control} name="cooking_time_minutes" render={({ field }) => (<FormItem><FormLabel>Thời gian nấu (phút)</FormLabel><FormControl><Input type="number" {...field} /></FormControl><FormMessage /></FormItem>)} />
                    </div>

                    <div>
                        <h3 className="text-lg font-medium mb-2">Nguyên liệu</h3>
                        <div className="space-y-4">
                            {fields.map((field, index) => (
                                <div key={field.id} className="flex items-end gap-2 p-4 border rounded-md">
                                    <FormField control={form.control} name={`ingredients.${index}.ingredient`} render={({ field }) => (<FormItem className="flex-1"><FormLabel>Tên</FormLabel><FormControl>
                                        <Popover><PopoverTrigger asChild><Button variant="outline" role="combobox" className="w-full justify-between">{field.value && field.value > 0 ? masterIngredients.find(i => i.id === field.value)?.name : "Chọn..."}<ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" /></Button></PopoverTrigger>
                                            <PopoverContent className="w-[300px] p-0">
                                                <Command>
                                                    <CommandInput placeholder="Tìm hoặc đóng góp..." />
                                                    <CommandEmpty>
                                                        <span>Không tìm thấy.</span>
                                                        {/* Nút đóng góp */}
                                                        <Button variant="link" size="sm" className="h-auto p-1" onClick={() => setIsContributeDialogOpen(true)}>Đóng góp?</Button>
                                                    </CommandEmpty>
                                                    <CommandGroup className="max-h-[200px] overflow-y-auto">
                                                        {masterIngredients.map((ing) => (<CommandItem key={ing.id} value={ing.name} onSelect={() => { form.setValue(`ingredients.${index}.ingredient`, ing.id) }}><Check className={cn("mr-2 h-4 w-4", ing.id === field.value ? "opacity-100" : "opacity-0")} />{ing.name}</CommandItem>))}
                                                    </CommandGroup>
                                                </Command>
                                            </PopoverContent>
                                        </Popover>
                                    </FormControl><FormMessage /></FormItem>)} />
                                    <FormField control={form.control} name={`ingredients.${index}.quantity`} render={({ field }) => (<FormItem><FormLabel>Số lượng</FormLabel><FormControl><Input placeholder="200" {...field} /></FormControl><FormMessage /></FormItem>)} />
                                    <FormField control={form.control} name={`ingredients.${index}.unit`} render={({ field }) => (<FormItem><FormLabel>Đơn vị</FormLabel><FormControl><Input placeholder="g" {...field} /></FormControl><FormMessage /></FormItem>)} />
                                    <Button type="button" variant="destructive" size="icon" onClick={() => remove(index)}><Trash className="h-4 w-4" /></Button>
                                </div>
                            ))}
                        </div>
                        <Button type="button" variant="outline" size="sm" className="mt-4" onClick={() => append({ ingredient: 0, quantity: "", unit: "" })}><PlusCircle className="mr-2 h-4 w-4" />Thêm nguyên liệu</Button>
                        <FormField control={form.control} name="ingredients" render={() => (<FormItem><FormMessage className="mt-2" /></FormItem>)} />
                    </div>
                    <Button type="submit">Tạo công thức</Button>
                </form>
            </Form>

            <Dialog open={isContributeDialogOpen} onOpenChange={setIsContributeDialogOpen}>
                <DialogContent>
                    <ContributeIngredientForm onSuccess={handleIngredientContributed} />
                </DialogContent>
            </Dialog>
        </>
    );
}

