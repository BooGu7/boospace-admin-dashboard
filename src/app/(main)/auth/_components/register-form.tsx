"use client";

import { ArrowRight, CheckCircle2, Loader2, Lock, Mail, MapPin, Phone, User } from "lucide-react";
import { useRouter } from "next/navigation";
import * as React from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { createClient } from "@/lib/supabase/client";

export function RegisterForm() {
  const router = useRouter();
  const supabase = createClient();
  const [isPending, startTransition] = React.useTransition();

  // Các trường dữ liệu form mới
  const [email, setEmail] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [confirmPassword, setConfirmPassword] = React.useState("");

  const [lastName, setLastName] = React.useState(""); // Họ
  const [firstName, setFirstName] = React.useState(""); // Tên
  const [phone, setPhone] = React.useState(""); // Số điện thoại
  const [address, setAddress] = React.useState(""); // Địa chỉ

  // Trạng thái đăng ký thành công để hiển thị thông báo mở Gmail
  const [isSuccess, setIsSuccess] = React.useState(false);

  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault();

    if (!email.trim() || !password.trim() || !confirmPassword.trim()) {
      toast.error("Vui lòng điền đầy đủ các thông tin bắt buộc.");
      return;
    }

    if (password !== confirmPassword) {
      toast.error("Xác nhận mật khẩu không khớp nhau.");
      return;
    }

    if (!phone.trim()) {
      toast.error("Vui lòng cung cấp số điện thoại liên hệ.");
      return;
    }

    startTransition(async () => {
      const fullName = `${lastName} ${firstName}`.trim() || "Thành viên mới";

      // Đăng ký tài khoản kèm gán metadata đầy đủ lên Supabase Auth
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          // Khi người dùng bấm click xác nhận trong Email, Supabase sẽ mở trực tiếp trang callback để vào thẳng default
          emailRedirectTo: `${window.location.origin}/auth/callback?next=/dashboard/default`,
          data: {
            firstName: firstName,
            lastName: lastName,
            name: fullName,
            phone: phone,
            address: address,
            role: "user",
            active: true,
          },
        },
      });

      if (error) {
        toast.error(error.message || "Đăng ký tài khoản thất bại.");
      } else {
        toast.success("Khởi tạo tài khoản thành công!");
        setIsSuccess(true); // Kích hoạt màn hình thông báo mở Mail
      }
    });
  };

  // MÀN HÌNH THÔNG BÁO THÀNH CÔNG VÀ NÚT MỞ NHANH GMAIL
  if (isSuccess) {
    return (
      <div className="text-center space-y-5 py-4 text-xs">
        <div className="flex justify-center">
          <div className="p-3 bg-emerald-100 text-emerald-700 rounded-full shrink-0">
            <CheckCircle2 className="h-8 w-8 animate-bounce" />
          </div>
        </div>
        <div className="space-y-1.5">
          <h3 className="font-extrabold text-base text-slate-800">Đăng ký tài khoản thành công! 🎉</h3>
          <p className="text-muted-foreground leading-relaxed text-[11px]">
            Hệ thống đã gửi một liên kết xác thực tài khoản tới địa chỉ hòm thư{" "}
            <strong className="text-slate-800">{email}</strong> của bạn.
          </p>
        </div>
        <SeparatorLine />
        <div className="space-y-2.5">
          <Button
            asChild
            className="w-full h-9 bg-black text-white hover:bg-black/90 font-bold gap-1.5 cursor-pointer shadow-2xs"
          >
            <a href="https://mail.google.com" target="_blank" rel="noreferrer">
              Mở hòm thư Gmail ngay <ArrowRight className="h-3.5 w-3.5" />
            </a>
          </Button>
          <Button
            variant="outline"
            onClick={() => router.push("/auth/v2/login")}
            className="w-full h-9 text-slate-600 font-bold cursor-pointer"
          >
            Quay lại trang Đăng nhập
          </Button>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={handleRegister} className="space-y-3.5 text-xs">
      {/* 1. Họ và Tên */}
      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1">
          <Label className="font-bold text-slate-700 flex items-center gap-1">
            <User className="h-3 w-3" /> Họ (Last Name)
          </Label>
          <Input
            placeholder="VD: Nguyễn"
            value={lastName}
            onChange={(e) => setLastName(e.target.value)}
            className="h-9 text-xs"
            disabled={isPending}
          />
        </div>
        <div className="space-y-1">
          <Label className="font-bold text-slate-700 flex items-center gap-1">
            <User className="h-3 w-3" /> Tên (First Name)
          </Label>
          <Input
            placeholder="VD: Văn Minh"
            value={firstName}
            onChange={(e) => setFirstName(e.target.value)}
            className="h-9 text-xs"
            disabled={isPending}
          />
        </div>
      </div>

      {/* 2. Số điện thoại */}
      <div className="space-y-1">
        <Label className="font-bold text-slate-700 flex items-center gap-1">
          <Phone className="h-3 w-3" /> Số điện thoại liên hệ
        </Label>
        <Input
          type="tel"
          placeholder="VD: 0903123456"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          className="h-9 text-xs font-mono"
          disabled={isPending}
        />
      </div>

      {/* 3. Địa chỉ giao nhận */}
      <div className="space-y-1">
        <Label className="font-bold text-slate-700 flex items-center gap-1">
          <MapPin className="h-3 w-3" /> Địa chỉ thường trú (Giao hàng)
        </Label>
        <Input
          placeholder="VD: 123 Đường Ba Tháng Hai, Quận 10, TP.HCM"
          value={address}
          onChange={(e) => setAddress(e.target.value)}
          className="h-9 text-xs"
          disabled={isPending}
        />
      </div>

      {/* 4. Địa chỉ Email */}
      <div className="space-y-1">
        <Label className="font-bold text-slate-700 flex items-center gap-1">
          <Mail className="h-3 w-3" /> Địa chỉ Email tài khoản
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

      {/* 5. Mật khẩu và Xác nhận mật khẩu */}
      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1">
          <Label className="font-bold text-slate-700 flex items-center gap-1">
            <Lock className="h-3 w-3" /> Mật khẩu
          </Label>
          <Input
            type="password"
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="h-9 text-xs font-mono"
            disabled={isPending}
          />
        </div>
        <div className="space-y-1">
          <Label className="font-bold text-slate-700 flex items-center gap-1">
            <Lock className="h-3 w-3" /> Xác nhận mật khẩu
          </Label>
          <Input
            type="password"
            placeholder="••••••••"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            className="h-9 text-xs font-mono"
            disabled={isPending}
          />
        </div>
      </div>

      <Button
        type="submit"
        disabled={isPending}
        className="w-full h-9 bg-black text-white hover:bg-black/90 font-bold gap-2 mt-2 cursor-pointer shadow-2xs"
      >
        {isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
        ĐĂNG KÝ TÀI KHOẢN QUẢN TRỊ
      </Button>
    </form>
  );
}

function SeparatorLine() {
  return <div className="h-px bg-slate-200 w-full" />;
}
