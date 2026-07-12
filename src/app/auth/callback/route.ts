import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const next = searchParams.get("next") ?? "/dashboard";

  if (code) {
    const supabase = await createClient();
    // Đổi mã ủy quyền lấy phiên đăng nhập và thiết lập cookie xác thực [21]
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) {
      return NextResponse.redirect(`${origin}${next}`);
    }
  }

  // Nếu lỗi, quay lại trang đăng nhập
  return NextResponse.redirect(`${origin}/auth/v2/login?error=oauth_callback_failed`);
}
