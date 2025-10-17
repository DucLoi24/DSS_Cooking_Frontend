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
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const router = useRouter();

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError("");
    setSuccess("");

    try {
      const response = await fetch("http://127.0.0.1:8000/api/register/", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ username, email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        const errorMsg = data.username?.[0] || data.email?.[0] || "Đã có lỗi xảy ra.";
        throw new Error(errorMsg);
      }

      setSuccess("Tạo tài khoản thành công! Đang chuyển đến trang đăng nhập...");
      
      setTimeout(() => {
        router.push("/login");
      }, 2000);

    } catch (err: unknown) { // SỬA LỖI: Dùng `unknown` thay cho `any`
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("Đã có lỗi không xác định xảy ra.");
      }
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