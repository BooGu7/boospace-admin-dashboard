"use client";

import { Globe, Loader2, Mail } from "lucide-react";
import Link from "next/link";
import * as React from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { APP_CONFIG } from "@/config/app-config"; // Nạp hằng số bản quyền hệ thống
import { createClient } from "@/lib/supabase/client";

export default function ForgotPasswordPage() {
  const supabase = createClient();
  const [isPending, startTransition] = React.useTransition();
  const [email, setEmail] = React.useState("");

  const handleReset = (e: React.FormEvent) => {
    e.preventDefault();

    if (!email.trim()) {
      toast.error("Vui lòng điền Email để gửi yêu cầu khôi phục.");
      return;
    }

    startTransition(async () => {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/dashboard/default`,
      });

      if (error) {
        toast.error(error.message || "Có lỗi xảy ra khi gửi yêu cầu.");
      } else {
        toast.success(`Yêu cầu thành công! Vui lòng kiểm tra hòm thư ${email}`);
        setEmail("");
      }
    });
  };

  return (
    <>
      {/* KHUNG TRUNG TÂM: Đồng bộ 100% cấu trúc spacing và tỉ lệ của LoginV2 */}
      <div className="mx-auto flex w-full flex-col justify-center space-y-8 sm:w-[350px]">
        <div className="space-y-2 text-center">
          <h1 className="font-medium text-3xl">Quên mật khẩu?</h1>
          <p className="text-muted-foreground text-sm">
            Nhập địa chỉ Email đăng ký tài khoản của bạn, chúng tôi sẽ gửi liên kết khôi phục.
          </p>
        </div>

        <div className="space-y-4">
          <form onSubmit={handleReset} className="space-y-4 text-xs">
            <div className="space-y-1">
              <Label className="font-bold text-slate-700 flex items-center gap-1">
                <Mail className="h-3 w-3" /> Địa chỉ Email đăng ký
              </Label>
              <Input
                type="email"
                placeholder="admin@boospace.tech"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="h-9 text-xs"
                disabled={isPending}
              />
            </div>

            <Button
              type="submit"
              disabled={isPending}
              className="w-full h-9 bg-black text-white hover:bg-black/90 font-bold gap-2 cursor-pointer shadow-2xs"
            >
              {isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
              GỬI YÊU CẦU KHÔI PHỤC
            </Button>
          </form>
        </div>
      </div>

      {/* ĐẦU TRANG PHÍA PHẢI: Đồng bộ liên kết quay lại login */}
      <div className="absolute top-5 flex w-full justify-end px-10">
        <div className="text-muted-foreground text-sm">
          Đã nhớ mật khẩu?{" "}
          <Link prefetch={false} className="text-foreground font-semibold hover:underline" href="login">
            Đăng nhập
          </Link>
        </div>
      </div>

      {/* CHÂN TRANG: Đồng bộ thanh bản quyền copyright và ngôn ngữ VIE */}
      <div className="absolute bottom-5 flex w-full justify-between px-10">
        <div className="text-sm">{APP_CONFIG.copyright}</div>
        <div className="flex items-center gap-1 text-sm">
          <Globe className="size-4 text-muted-foreground" />
          VIE
        </div>
      </div>
    </>
  );
}
