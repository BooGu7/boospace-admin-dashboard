"use client";

import { Loader2, Lock, Mail } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import * as React from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { createClient } from "@/lib/supabase/client";

export function LoginForm() {
  const router = useRouter();
  const supabase = createClient();
  const [isPending, startTransition] = React.useTransition();

  const [email, setEmail] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [rememberMe, setRememberMe] = React.useState(false);

  // KÍCH HOẠT TÍNH NĂNG GHI NHỚ ĐĂNG NHẬP:Prefill email khi tải trang
  React.useEffect(() => {
    const savedEmail = localStorage.getItem("remembered_email");
    if (savedEmail) {
      setEmail(savedEmail);
      setRememberMe(true);
    }
  }, []);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();

    if (!email.trim() || !password.trim()) {
      toast.error("Vui lòng điền đầy đủ Email và Mật khẩu.");
      return;
    }

    startTransition(async () => {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        toast.error(error.message || "Tài khoản hoặc mật khẩu không chính xác.");
      } else {
        // Nếu tích ghi nhớ đăng nhập, lưu email vào localStorage
        if (rememberMe) {
          localStorage.setItem("remembered_email", email);
        } else {
          localStorage.removeItem("remembered_email");
        }

        toast.success("Đăng nhập hệ thống thành công!");
        router.push("/dashboard/default");
        router.refresh();
      }
    });
  };

  return (
    <form onSubmit={handleLogin} className="space-y-4 text-xs">
      <div className="space-y-1">
        <Label className="font-bold text-slate-700 flex items-center gap-1">
          <Mail className="h-3 w-3" /> Địa chỉ Email
        </Label>
        <Input
          type="email"
          placeholder="VD: admin@boospace.tech"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="h-9 text-xs"
          disabled={isPending}
        />
      </div>

      <div className="space-y-1">
        <div className="flex justify-between items-center">
          <Label className="font-bold text-slate-700 flex items-center gap-1">
            <Lock className="h-3 w-3" /> Mật khẩu đăng nhập
          </Label>
          <Link href="/auth/v2/forgot-password" className="text-[10px] text-blue-600 hover:underline font-bold">
            Quên mật khẩu?
          </Link>
        </div>
        <Input
          type="password"
          placeholder="••••••••"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="h-9 text-xs font-mono"
          disabled={isPending}
        />
      </div>

      {/* Checkbox Ghi nhớ đăng nhập */}
      <div className="flex items-center space-x-2 pt-1">
        <Checkbox
          id="remember"
          checked={rememberMe}
          onCheckedChange={(checked) => setRememberMe(!!checked)}
          disabled={isPending}
        />
        <label htmlFor="remember" className="text-[10px] font-bold text-slate-600 cursor-pointer select-none">
          Ghi nhớ đăng nhập cho lần sau
        </label>
      </div>

      <Button
        type="submit"
        disabled={isPending}
        className="w-full h-9 bg-black text-white hover:bg-black/90 font-bold gap-2 mt-2 cursor-pointer shadow-2xs"
      >
        {isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
        ĐĂNG NHẬP HỆ THỐNG
      </Button>
    </form>
  );
}
