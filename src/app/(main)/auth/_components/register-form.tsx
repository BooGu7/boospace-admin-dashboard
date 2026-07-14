"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";

import { Button } from "@/components/ui/button";
import { Field, FieldError, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { createClient } from "@/lib/supabase/client";

const formSchema = z
  .object({
    email: z.string().email({ message: "Vui lòng nhập địa chỉ email hợp lệ." }),
    password: z.string().min(6, { message: "Mật khẩu phải chứa ít nhất 6 ký tự." }),
    confirmPassword: z.string().min(6, { message: "Mật khẩu xác nhận phải chứa ít nhất 6 ký tự." }),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Mật khẩu xác nhận không trùng khớp.",
    path: ["confirmPassword"],
  });

export function RegisterForm() {
  const router = useRouter();
  const supabase = createClient();
  const [loading, setLoading] = useState(false);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: "",
      password: "",
      confirmPassword: "",
    },
  });

  const onSubmit = async (data: z.infer<typeof formSchema>) => {
    setLoading(true);
    try {
      // Thực hiện đăng ký tài khoản thật lên hệ thống xác thực Supabase Auth [21]
      const { error } = await supabase.auth.signUp({
        email: data.email.trim(),
        password: data.password,
        options: {
          data: {
            firstName: "Admin",
            lastName: "BooSpace",
          },
        },
      });

      if (error) {
        toast.error(error.message || "Đăng ký thất bại, vui lòng thử lại.");
        return;
      }

      toast.success("Đăng ký thành công! Đang chuyển hướng về trang đăng nhập...");

      // Chuyển hướng về trang đăng nhập v2 để người dùng tiến hành đăng nhập [21]
      router.push("/auth/v2/login");
    } catch (_e) {
      toast.error("Đã xảy ra lỗi kết nối trong quá trình đăng ký.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form noValidate onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col gap-4 text-left">
      <FieldGroup className="gap-4">
        <Controller
          control={form.control}
          name="email"
          render={({ field, fieldState }) => (
            <Field className="gap-1.5" data-invalid={fieldState.invalid}>
              <FieldLabel htmlFor="register-email">Địa chỉ Email</FieldLabel>
              <Input
                {...field}
                id="register-email"
                type="email"
                placeholder="admin@boospace.tech"
                autoComplete="email"
                className="text-black"
                aria-invalid={fieldState.invalid}
              />
              {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
            </Field>
          )}
        />
        <Controller
          control={form.control}
          name="password"
          render={({ field, fieldState }) => (
            <Field className="gap-1.5" data-invalid={fieldState.invalid}>
              <FieldLabel htmlFor="register-password">Mật khẩu</FieldLabel>
              <Input
                {...field}
                id="register-password"
                type="password"
                placeholder="••••••••"
                autoComplete="new-password"
                className="text-black"
                aria-invalid={fieldState.invalid}
              />
              {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
            </Field>
          )}
        />
        <Controller
          control={form.control}
          name="confirmPassword"
          render={({ field, fieldState }) => (
            <Field className="gap-1.5" data-invalid={fieldState.invalid}>
              <FieldLabel htmlFor="register-confirm-password">Xác nhận Mật khẩu</FieldLabel>
              <Input
                {...field}
                id="register-confirm-password"
                type="password"
                placeholder="••••••••"
                autoComplete="new-password"
                className="text-black"
                aria-invalid={fieldState.invalid}
              />
              {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
            </Field>
          )}
        />
      </FieldGroup>
      <Button
        disabled={loading}
        className="w-full font-mono uppercase tracking-wider text-xs font-bold py-3.5"
        type="submit"
      >
        {loading ? "Đang xử lý..." : "Đăng ký tài khoản"}
      </Button>
    </form>
  );
}
