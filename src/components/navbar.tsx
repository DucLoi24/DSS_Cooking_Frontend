"use client";

import Link from "next/link";
import { useAuthStore } from "@/lib/store";
import { Button } from "./ui/button";
import { useRouter } from "next/navigation";
// Xóa import 'cn' không được sử dụng

export function Navbar() {
  const router = useRouter();
  const { accessToken, user, logout } = useAuthStore();

  const handleLogout = () => {
    logout();
    router.push('/');
  };

  return (
    <nav className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center">
        <div className="mr-6 flex items-center">
          <Link className="mr-6 flex items-center space-x-2" href="/">
            <span className="font-bold sm:inline-block">
              Trợ Lý Bếp
            </span>
          </Link>
          {accessToken && (
            <nav className="hidden md:flex items-center space-x-8 text-sm font-medium">
              <Link href="/suggestions" className="transition-colors hover:text-foreground/80 text-foreground/60">Gợi ý</Link>
              <Link href="/pantry" className="transition-colors hover:text-foreground/80 text-foreground/60">Tủ lạnh</Link>
              <Link href="/favorites" className="transition-colors hover:text-foreground/80 text-foreground/60">Yêu thích</Link>
              <Link href="/shopping-list" className="transition-colors hover:text-foreground/80 text-foreground/60">Mua sắm</Link>
              <Link href="/recipes/my-recipes" className="transition-colors hover:text-foreground/80 text-foreground/60">Công thức của tôi</Link>
            </nav>
          )}
        </div>

        <div className="flex flex-1 items-center justify-end space-x-4">
          {accessToken ? (
            <>
              {user && <span className="hidden sm:inline-block text-sm font-medium">Xin chào, {user.username}!</span>}
              <Link href="/recipes/new">
                <Button size="sm">Viết công thức</Button>
              </Link>
              <Button variant="outline" size="sm" onClick={handleLogout}>
                Đăng xuất
              </Button>
            </>
          ) : (
            <>
              <Link href="/login"><Button variant="ghost">Đăng nhập</Button></Link>
              <Link href="/register"><Button>Đăng ký</Button></Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}