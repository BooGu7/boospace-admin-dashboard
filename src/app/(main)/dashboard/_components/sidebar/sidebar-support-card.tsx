import { ShoppingBag, Sparkles } from "lucide-react";
import Link from "next/link";

import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export function SidebarSupportCard() {
  return (
    <Card
      size="sm"
      className="overflow-hidden shadow-none group-data-[collapsible=icon]:hidden border border-[#E1DDD5] bg-[#FCFAF2]"
    >
      <CardHeader className="min-w-0 px-4 py-3">
        <CardTitle className="truncate text-xs font-serif font-bold text-black flex items-center gap-1">
          Ghé cửa hàng nha! 🪴 <Sparkles className="size-3 text-[#FF9D00] animate-pulse" />
        </CardTitle>
        <CardDescription className="line-clamp-2 text-[11px] text-[#786F66] leading-relaxed">
          Xem ngay các tác phẩm đèn ngủ nghệ thuật và đồ in 3D tối giản tại&nbsp;
          <Link
            href="https://www.boospace.tech"
            target="_blank"
            rel="noreferrer"
            aria-label="Ghé thăm Boo Space"
            className="inline-flex items-center text-black font-bold hover:text-[#FF9D00] hover:underline gap-0.5"
          >
            boospace.tech <ShoppingBag className="size-3 text-[#FF9D00]" />
          </Link>
          . ✨
        </CardDescription>
      </CardHeader>
    </Card>
  );
}
