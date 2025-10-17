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
import { useAuthStore } from "@/lib/store";
import apiFetch from "@/lib/api"; // Import hàm fetch thông minh

export default function LoginPage() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const router = useRouter();
  const { setTokens, setUser } = useAuthStore();

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError("");

    try {
      // BƯỚC 1: LẤY "VÉ THÔNG HÀNH" (TOKEN) - Dùng fetch thường vì chưa có token
      const loginResponse = await fetch("http://127.0.0.1:8000/api/login/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });

      if (!loginResponse.ok) {
        const errorData = await loginResponse.json();
        throw new Error(errorData.detail || "Sai tên đăng nhập hoặc mật khẩu.");
      }

      const loginData = await loginResponse.json();
      const accessToken = loginData.access;
      const refreshToken = loginData.refresh;

      // Ghi cả hai "vé" vào bộ nhớ
      setTokens(accessToken, refreshToken);

      // BƯỚC 2: DÙNG "VÉ" ĐỂ LẤY "DANH THIẾP" (USER INFO) - Dùng apiFetch
      const userResponse = await apiFetch("/users/me/");

      if (!userResponse.ok) {
        throw new Error("Không thể lấy thông tin người dùng.");
      }
      
      const userData = await userResponse.json();

      // Ghi "danh thiếp" vào bộ nhớ
      setUser(userData);

      // Chuyển hướng người dùng đến trang chủ
      router.push("/");
      
    } catch (err: any) {
      setError(err.message);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-[calc(100vh-12rem)]">
      <form onSubmit={handleSubmit}>
        <Card className="w-full max-w-sm">
          <CardHeader>
            <CardTitle className="text-2xl">Đăng nhập</CardTitle>
            <CardDescription>
              Nhập tên đăng nhập và mật khẩu của bạn để tiếp tục.
            </CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4">
            <div className="grid gap-2">
              <Label htmlFor="username">Tên đăng nhập</Label>
              <Input
                id="username"
                type="text"
                placeholder="usermoi123"
                required
                value={username}
                onChange={(e) => setUsername(e.target.value)}
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
            <Button className="w-full" type="submit">Đăng nhập</Button>
            <div className="mt-4 text-center text-sm w-full">
              Chưa có tài khoản?{" "}
              <Link href="/register" className="underline">
                Đăng ký
              </Link>
            </div>
          </CardFooter>
        </Card>
      </form>
    </div>
  );
}