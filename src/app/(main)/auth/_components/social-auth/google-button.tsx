"use client";

import * as React from "react";
import { siGoogle } from "simple-icons";
import { toast } from "sonner";
import { SimpleIcon } from "@/components/simple-icon";
import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/client";

interface GoogleButtonProps {
  className?: string;
}

export function GoogleButton({ className }: GoogleButtonProps) {
  const [loading, setLoading] = React.useState(false);
  const supabase = createClient();

  const handleGoogleLogin = async () => {
    setLoading(true);
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
        },
      });

      if (error) {
        toast.error(`Lỗi đăng nhập Google: ${error.message}`);
      }
    } catch (err) {
      toast.error("Không thể kết nối dịch vụ xác thực Google.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Button variant="outline" type="button" disabled={loading} onClick={handleGoogleLogin} className={className}>
      <SimpleIcon icon={siGoogle} className="mr-2 h-4 w-4" />
      {loading ? "Đang kết nối..." : "Đăng nhập bằng Google"}
    </Button>
  );
}
