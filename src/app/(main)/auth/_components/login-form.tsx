"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";

import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Field, FieldContent, FieldError, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { createClient } from "@/lib/supabase/client";

const formSchema = z.object({
  email: z.string().email({
    message: "Vui lòng nhập địa chỉ email hợp lệ.",
  }),
  password: z.string().min(6, {
    message: "Mật khẩu phải chứa ít nhất 6 ký tự.",
  }),
  remember: z.boolean().optional(),
});

export function LoginForm() {
  const router = useRouter();
  const supabase = createClient();
  const [loading, setLoading] = useState(false);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: "",
      password: "",
      remember: false,
    },
  });

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    try {
      setLoading(true);

      // Xác thực đăng nhập qua Supabase Auth [21]
      const { error, data } = await supabase.auth.signInWithPassword({
        email: values.email.trim(),
        password: values.password,
      });

      if (error) {
        toast.error(error.message || "Tài khoản hoặc mật khẩu không chính xác.");
        return;
      }

      toast.success("Đăng nhập thành công! Đang chuyển hướng...");

      // Cập nhật lại cookie phiên làm việc Next.js [21]
      router.refresh();

      // Tiến hành chuyển hướng về trang chủ mặc định của dashboard quản trị [21]
      router.push("/dashboard/default");
    } catch (e) {
      toast.error("Đã xảy ra lỗi ngoài ý muốn.");
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
              <FieldLabel>Địa chỉ Email</FieldLabel>
              <Input {...field} type="email" placeholder="you@example.com" className="text-black" />
              {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
            </Field>
          )}
        />

        <Controller
          control={form.control}
          name="password"
          render={({ field, fieldState }) => (
            <Field className="gap-1.5" data-invalid={fieldState.invalid}>
              <FieldLabel>Mật khẩu</FieldLabel>
              <Input {...field} type="password" placeholder="••••••••" className="text-black" />
              {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
            </Field>
          )}
        />

        <Controller
          control={form.control}
          name="remember"
          render={({ field }) => (
            <Field orientation="horizontal">
              <Checkbox checked={field.value} onCheckedChange={(checked) => field.onChange(Boolean(checked))} />
              <FieldContent>
                <FieldLabel className="font-normal">Ghi nhớ đăng nhập</FieldLabel>
              </FieldContent>
            </Field>
          )}
        />
      </FieldGroup>

      <Button
        disabled={loading}
        className="w-full font-mono uppercase tracking-wider text-xs font-bold py-3.5"
        type="submit"
      >
        {loading ? "Đang kết nối..." : "Đăng nhập hệ thống"}
      </Button>
    </form>
  );
}
