import { BadgePercent, Calendar, Trash2 } from "lucide-react";
import { deleteCouponAction } from "@/actions/coupon.actions";
import { CreateCouponDialog } from "@/components/dashboard/coupons/create-coupon-dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { createClient } from "@/lib/supabase/server";
import { CouponActiveToggle } from "./_components/coupon-active-toggle";

export const revalidate = 0; // Đảm bảo luôn lấy danh sách Coupons mới nhất

export default async function CouponsPage() {
  const supabase = await createClient();

  const { data: coupons } = await supabase.from("coupons").select("*").order("created_at", { ascending: false });

  return (
    <div className="flex-1 space-y-6 p-8 pt-6">
      {/* Header */}
      <div className="flex items-center justify-between border-b pb-4">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Mã giảm giá (Coupons)</h2>
          <p className="text-sm text-muted-foreground mt-1">
            Thiết lập các chiến dịch khuyến mãi chiết khấu % tổng giỏ hàng cho khách mua sắm.
          </p>
        </div>
        <CreateCouponDialog />
      </div>

      {/* Grid mã giảm giá */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {coupons?.map((coupon) => (
          <Card key={coupon.id} className="hover:border-primary/50 transition-colors relative overflow-hidden">
            <CardContent className="p-6 space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="size-10 rounded-lg bg-red-100 dark:bg-red-950/30 text-red-600 flex items-center justify-center shrink-0">
                    <BadgePercent className="h-5 w-5" />
                  </div>
                  <div>
                    <h4 className="font-extrabold text-lg text-slate-800 font-mono tracking-wide">{coupon.code}</h4>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      Chiết khấu: <strong className="text-blue-600 font-extrabold">{coupon.discount_percent}%</strong>
                    </p>
                  </div>
                </div>

                {/* NÚT SWITCH ĐỔI TRẠNG THÁI NHANH TRÊN DÒNG */}
                <CouponActiveToggle id={coupon.id} initialValue={!!coupon.active} />
              </div>

              <div className="flex items-center justify-between border-t pt-3 text-xs text-muted-foreground">
                <span className="flex items-center gap-1">
                  <Calendar className="h-3.5 w-3.5" />
                  {new Date(coupon.created_at).toLocaleDateString("vi-VN")}
                </span>

                {/* Form xóa mã giảm giá */}
                <form
                  action={async () => {
                    "use server";
                    await deleteCouponAction(coupon.id);
                  }}
                >
                  <Button variant="ghost" size="icon" className="h-7 w-7 text-red-500 hover:bg-red-50">
                    <Trash2 className="h-4.5 w-4.5" />
                  </Button>
                </form>
              </div>
            </CardContent>
          </Card>
        ))}

        {coupons?.length === 0 && (
          <div className="col-span-full py-20 text-center border-2 border-dashed rounded-xl text-muted-foreground">
            Chưa có chương trình khuyến mãi nào được tạo. Hãy bấm "Tạo mã giảm giá" để bắt đầu.
          </div>
        )}
      </div>
    </div>
  );
}
