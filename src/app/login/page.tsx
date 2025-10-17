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
import apiFetch from "@/lib/api"; // Vẫn import apiFetch để dùng cho users/me

export default function LoginPage() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const router = useRouter();
  const { setTokens, setUser } = useAuthStore();

  // ĐỊNH NGHĨA LẠI BASE URL MỘT CÁCH TƯỜNG MINH Ở ĐÂY
  const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "http://127.0.0.1:8000";

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError("");

    // In ra URL để debug ngay trước khi gọi
    console.log(`Đang cố gắng đăng nhập đến: ${API_BASE_URL}/api/login/`);

    try {
      // SỬ DỤNG URL ĐÃ ĐƯỢC ĐỊNH NGHĨA TƯỜNG MINH
      const loginResponse = await fetch(`${API_BASE_URL}/api/login/`, {
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
      
      setTokens(accessToken, refreshToken);

      // apiFetch vẫn hữu ích ở đây vì nó sẽ tự động đính kèm token
      const userResponse = await apiFetch("/users/me/");

      if (!userResponse.ok) {
        throw new Error("Không thể lấy thông tin người dùng.");
      }
      
      const userData = await userResponse.json();
      setUser(userData);
      router.push("/");
      
    } catch (err: unknown) {
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
            {/* Thêm dòng debug này để xem biến môi trường ngay trên giao diện */}
            <p className="text-xs text-red-500">DEBUG URL: {API_BASE_URL}</p>
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