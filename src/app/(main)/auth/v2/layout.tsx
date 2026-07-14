import { Command } from "lucide-react";
import type { ReactNode } from "react";

import { Separator } from "@/components/ui/separator";

export default function Layout({ children }: Readonly<{ children: ReactNode }>) {
  return (
    <main>
      <div className="grid h-dvh justify-center p-2 lg:grid-cols-2">
        <div className="relative order-2 hidden h-full rounded-3xl bg-primary lg:flex">
          <div className="absolute top-10 space-y-1 px-10 text-primary-foreground">
            <Command className="size-10" />
            <h1 className="font-medium text-2xl">Boo Space Admin</h1>
            <p className="text-sm">Thiết kế. Xây dựng. Vận hành. Tối giản.</p>
          </div>

          <div className="absolute bottom-10 flex w-full justify-between px-10">
            <div className="flex-1 space-y-1 text-primary-foreground">
              <h2 className="font-medium">Sẵn sàng vận hành?</h2>
              <p className="text-sm">
                Kết nối dữ liệu Supabase, kiểm soát tồn kho và theo dõi doanh thu thời gian thực một cách tối giản.
              </p>
            </div>
            <Separator orientation="vertical" className="mx-3 h-auto!" />
            <div className="flex-1 space-y-1 text-primary-foreground">
              <h2 className="font-medium">Hỗ trợ kỹ thuật?</h2>
              <p className="text-sm">
                Tra cứu tài liệu hướng dẫn vận hành hoặc gửi yêu cầu hỗ trợ trực tiếp đến quản trị viên hệ thống.
              </p>
            </div>
          </div>
        </div>
        <div className="relative order-1 flex h-full">{children}</div>
      </div>
    </main>
  );
}
