import { BadgePercent, Calendar, Clock, FileText } from "lucide-react";
import { CreateCouponDialog } from "@/components/dashboard/coupons/create-coupon-dialog";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { createClient } from "@/lib/supabase/server";
import { CouponActiveToggle } from "./_components/coupon-active-toggle";
import { DeleteCouponButton } from "./_components/delete-coupon-button"; // Đã sửa: Nạp nút xóa thông minh mới

export const revalidate = 0; // Đảm bảo luôn lấy danh sách Coupons mới nhất

export default async function CouponsPage() {
  const supabase = await createClient();

  const { data: coupons } = await supabase.from("coupons").select("*").order("created_at", { ascending: false });

  // Thuật toán phân tích trạng thái thời gian thực tế
  const getCouponTimeStatus = (coupon: any) => {
    const now = new Date();
    const start = coupon.start_date ? new Date(coupon.start_date) : null;
    const end = coupon.end_date ? new Date(coupon.end_date) : null;

    if (!start && !end) {
      return (
        <Badge className="bg-blue-50 text-blue-700 border border-blue-200 font-bold text-[10px] rounded-md shrink-0 py-0.5 animate-pulse">
          Vĩnh viễn
        </Badge>
      );
    }

    if (end && now > end) {
      return (
        <Badge className="bg-red-50 text-red-700 border border-red-200 font-bold text-[10px] rounded-md shrink-0 py-0.5">
          Hết hạn
        </Badge>
      );
    }

    if (start && now < start) {
      return (
        <Badge className="bg-amber-50 text-amber-700 border border-amber-200 font-bold text-[10px] rounded-md shrink-0 py-0.5">
          Chưa bắt đầu
        </Badge>
      );
    }

    return (
      <Badge className="bg-emerald-50 text-emerald-700 border border-emerald-200 font-bold text-[10px] rounded-md shrink-0 py-0.5">
        Đang áp dụng
      </Badge>
    );
  };

  return (
    <div className="flex-1 space-y-6 p-8 pt-6 bg-background">
      {/* Header */}
      <div className="flex items-center justify-between border-b pb-4">
        <div>
          <h2 className="text-3xl font-extrabold tracking-tight">Mã giảm giá (Coupons)</h2>
          <p className="text-sm text-muted-foreground mt-1">
            Thiết lập các chiến dịch khuyến mãi chiết khấu % tổng giỏ hàng cho khách mua sắm.
          </p>
        </div>
        <CreateCouponDialog />
      </div>

      {/* Grid mã giảm giá */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {coupons?.map((coupon) => {
          const hasLimit = coupon.start_date && coupon.end_date;
          return (
            <Card
              key={coupon.id}
              className="hover:border-primary/50 transition-colors relative overflow-hidden shadow-2xs border-border/70"
            >
              <CardContent className="p-6 space-y-4">
                {/* ĐẦU THẺ CARD: Hiển thị Ghi chú chương trình (Description) thực tế */}
                {coupon.description && (
                  <div className="flex items-start gap-1.5 p-2 rounded-lg bg-slate-50 border text-[11px] text-slate-700 dark:bg-slate-900 leading-relaxed font-semibold">
                    <FileText className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                    <span>Chiến dịch: {coupon.description}</span>
                  </div>
                )}

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="size-10 rounded-lg bg-red-100 dark:bg-red-950/30 text-red-600 flex items-center justify-center shrink-0">
                      <BadgePercent className="h-5 w-5" />
                    </div>
                    <div>
                      <h4 className="font-black text-lg text-slate-800 font-mono tracking-wide">{coupon.code}</h4>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        Chiết khấu: <strong className="text-blue-600 font-extrabold">{coupon.discount_percent}%</strong>
                      </p>
                    </div>
                  </div>

                  {/* Nút Switch đổi trạng thái nhanh */}
                  <CouponActiveToggle id={coupon.id} initialValue={!!coupon.active} />
                </div>

                {/* THỜI HẠN ÁP DỤNG CHI TIẾT */}
                <div className="rounded-lg bg-muted/40 p-2.5 text-[11px] text-muted-foreground border space-y-1 leading-relaxed">
                  <div className="flex items-center justify-between font-bold">
                    <span className="flex items-center gap-1 text-slate-700">
                      <Clock className="h-3.5 w-3.5" /> Thời hạn:
                    </span>
                    {getCouponTimeStatus(coupon)}
                  </div>
                  {hasLimit ? (
                    <p className="text-slate-600 mt-1 font-semibold">
                      Áp dụng từ:{" "}
                      <strong className="text-slate-800">
                        {new Date(coupon.start_date).toLocaleDateString("vi-VN")}
                      </strong>{" "}
                      đến{" "}
                      <strong className="text-slate-800">
                        {new Date(coupon.end_date).toLocaleDateString("vi-VN")}
                      </strong>
                    </p>
                  ) : (
                    <p className="text-blue-700 mt-1 font-bold">Mã có hiệu lực vĩnh viễn trên BooSpace Store.</p>
                  )}
                </div>

                <div className="flex items-center justify-between border-t pt-3 text-xs text-muted-foreground">
                  <span className="flex items-center gap-1 font-semibold">
                    <Calendar className="h-3.5 w-3.5" />
                    Tạo ngày: {new Date(coupon.created_at || coupon.createdAt).toLocaleDateString("vi-VN")}
                  </span>

                  {/* Đã sửa: Sử dụng nút xóa bọc xác nhận thông minh client-side mới */}
                  <DeleteCouponButton id={coupon.id} code={coupon.code} />
                </div>
              </CardContent>
            </Card>
          );
        })}

        {coupons?.length === 0 && (
          <div className="col-span-full py-20 text-center border-2 border-dashed rounded-xl text-muted-foreground bg-card">
            Chưa có chương trình khuyến mãi nào được tạo. Hãy bấm "Tạo mã giảm giá" để bắt đầu.
          </div>
        )}
      </div>
    </div>
  );
}
