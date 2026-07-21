import { type NextRequest, NextResponse } from "next/server";
import { updateSession } from "@/lib/supabase/middleware";

export async function middleware(request: NextRequest) {
  // Cho phép tất cả các đường dẫn API Webhook chạy trực tiếp không qua kiểm tra Session
  if (request.nextUrl.pathname.startsWith("/api/")) {
    return NextResponse.next();
  }

  return await updateSession(request);
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|api/|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)"],
};
