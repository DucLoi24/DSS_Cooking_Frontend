"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Link from "next/link";
import { useAuthStore } from "@/lib/store";
import apiFetch from "@/lib/api";

export default function LoginPage() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const router = useRouter();
  const { setTokens, setUser } = useAuthStore();
  const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "http://127.0.0.1:8000";

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError("");
    try {
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

      const userResponse = await apiFetch("/users/me/", { token: accessToken });
      if (!userResponse.ok) {
        const errorText = await userResponse.text();
        console.error("Lỗi khi lấy thông tin user:", errorText);
        throw new Error("Không thể xác thực và lấy thông tin người dùng sau khi đăng nhập.");
      }
      const userData = await userResponse.json();
      setUser(userData);
      router.push("/");
    } catch (err: unknown) { // SỬA LỖI ANY
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
            <CardTitle className="text-2xl">Đăng nhập</CardTitle>
            <CardDescription>
              Nhập tên đăng nhập và mật khẩu của bạn để tiếp tục.
            </CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4">
            <div className="grid gap-2">
              <Label htmlFor="username">Tên đăng nhập</Label>
              <Input id="username" type="text" placeholder="usermoi123" required value={username} onChange={(e) => setUsername(e.target.value)} />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="password">Mật khẩu</Label>
              <Input id="password" type="password" required value={password} onChange={(e) => setPassword(e.target.value)} />
            </div>
          </CardContent>
          <CardFooter className="flex flex-col items-start">
            {error && <p className="text-sm text-red-500 mb-4">{error}</p>}
            <Button className="w-full" type="submit">Đăng nhập</Button>
            <div className="mt-4 text-center text-sm w-full">
              Chưa có tài khoản?{" "}
              <Link href="/register" className="underline">Đăng ký</Link>
            </div>
          </CardFooter>
        </Card>
      </form>
    </div>
  );
}