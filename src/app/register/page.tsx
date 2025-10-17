// src/app/register/page.tsx

"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Link from "next/link";

export default function RegisterPage() {
  // Bước 1: Tạo state cho các ô nhập liệu
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(""); // State cho thông báo thành công
  const router = useRouter();

  // Bước 2: Tạo hàm xử lý khi gửi form
  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError("");
    setSuccess("");

    try {
      // Bước 3: Gọi API Đăng ký
      const response = await fetch("http://127.0.0.1:8000/api/register/", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ username, email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        // Xử lý lỗi từ backend (ví dụ: username đã tồn tại)
        // Lỗi thường nằm trong data.username hoặc data.email
        const errorMsg = data.username?.[0] || data.email?.[0] || "Đã có lỗi xảy ra.";
        throw new Error(errorMsg);
      }

      // Bước 4: Nếu thành công
      setSuccess("Tạo tài khoản thành công! Đang chuyển đến trang đăng nhập...");
      
      // Chờ 2 giây rồi chuyển hướng
      setTimeout(() => {
        router.push("/login");
      }, 2000);

    } catch (err: any) {
      setError(err.message);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-[calc(100vh-12rem)]">
      <form onSubmit={handleSubmit}>
        <Card className="w-full max-w-sm">
          <CardHeader>
            <CardTitle className="text-2xl">Đăng ký</CardTitle>
            <CardDescription>
              Tạo tài khoản mới để bắt đầu sử dụng Trợ Lý Bếp.
            </CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4">
            <div className="grid gap-2">
              <Label htmlFor="username">Tên đăng nhập</Label>
              <Input
                id="username"
                placeholder="nguyenvana"
                required
                value={username}
                onChange={(e) => setUsername(e.target.value)}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="m@example.com"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="password">Mật khẩu</Label>
              <Input
                id="password"
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
          </CardContent>
          <CardFooter className="flex flex-col items-start">
             {/* Hiển thị thông báo lỗi hoặc thành công */}
            {error && <p className="text-sm text-red-500 mb-4">{error}</p>}
            {success && <p className="text-sm text-green-500 mb-4">{success}</p>}
            <Button className="w-full" type="submit">Tạo tài khoản</Button>
            <div className="mt-4 text-center text-sm w-full">
              Đã có tài khoản?{" "}
              <Link href="/login" className="underline">
                Đăng nhập
              </Link>
            </div>
          </CardFooter>
        </Card>
      </form>
    </div>
  );
}

