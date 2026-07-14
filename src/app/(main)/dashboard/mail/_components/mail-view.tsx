"use client";

import { format } from "date-fns/format";
import {
  AlertCircle,
  Archive,
  ChevronLeft,
  ChevronRight,
  EllipsisVertical,
  Forward,
  Mail as MailIcon,
  MailOpen,
  Paperclip,
  Pin,
  Reply,
  ReplyAll,
  Send,
  ShieldCheck,
  Smile,
  Tag,
  Trash2,
  X,
} from "lucide-react";
import * as React from "react";
import { toast } from "sonner";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { InputGroup, InputGroupAddon, InputGroupButton, InputGroupInput } from "@/components/ui/input-group";
import { Separator } from "@/components/ui/separator";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";

import type { Mail } from "./data";
import { useMail } from "./use-mail";

interface MailDisplayProps {
  mail: Mail | null;
  onClose?: () => void;
}

export function MailView({ mail, onClose }: MailDisplayProps) {
  const [, setMail] = useMail();
  const [gmailToken, setGmailToken] = React.useState<string | null>(null);

  React.useEffect(() => {
    const token = localStorage.getItem("gmail_access_token");
    if (token) setGmailToken(token);
  }, []);

  // KHỞI CHẠY GOOGLE OAUTH TRỰC TIẾP VỚI MÃ CLIENT ID THẬT CỦA BẠN
  const handleGoogleConnect = () => {
    const clientId = "1084942096128-hpq2p90osdrhvmk6hhf8a4m5vgfv404f.apps.googleusercontent.com";
    const redirectUri = `${window.location.origin}/dashboard/mail`;
    const scope =
      "openid https://www.googleapis.com/auth/userinfo.email https://www.googleapis.com/auth/userinfo.profile https://www.googleapis.com/auth/gmail.readonly";

    const oauthUrl =
      `https://accounts.google.com/o/oauth2/v2/auth` +
      `?client_id=${clientId}` +
      `&redirect_uri=${encodeURIComponent(redirectUri)}` +
      `&response_type=token` +
      `&scope=${encodeURIComponent(scope)}` +
      `&prompt=consent` +
      `&state=google_direct`;

    window.location.href = oauthUrl;
  };

  const handleGoogleDisconnect = () => {
    localStorage.removeItem("gmail_access_token");
    localStorage.removeItem("gmail_user_email");
    localStorage.removeItem("gmail_user_name");
    setGmailToken(null);
    toast.success("Đã ngắt kết nối Gmail thành công!");
    window.location.reload();
  };

  function handleClose() {
    setMail({ selected: null });
    onClose?.();
  }

  return (
    <div className="flex h-full min-h-0 flex-col gap-3 px-2 py-3 bg-background">
      <div className="flex items-center">
        <div className="flex items-center gap-2">
          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="ghost" size="icon-sm" aria-label="Đóng thư" onClick={handleClose}>
                <X />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Đóng thư</TooltipContent>
          </Tooltip>
          <Separator className="h-4 data-vertical:self-center" orientation="vertical" />
          <div className="flex items-center gap-0">
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="ghost" size="icon-sm" aria-label="Thư trước">
                  <ChevronLeft />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Thư trước</TooltipContent>
            </Tooltip>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="ghost" size="icon-sm" aria-label="Thư kế tiếp">
                  <ChevronRight />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Thư kế tiếp</TooltipContent>
            </Tooltip>
          </div>
        </div>

        <div className="ml-auto flex items-center gap-2">
          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="ghost" size="icon-sm" aria-label="Ghim thư">
                <Pin />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Ghim thư</TooltipContent>
          </Tooltip>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="ghost" size="icon-sm" aria-label="Lưu trữ">
                <Archive />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Lưu trữ</TooltipContent>
          </Tooltip>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="ghost" size="icon-sm" aria-label="Trả lời">
                <Reply />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Trả lời</TooltipContent>
          </Tooltip>
          <Tooltip>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <TooltipTrigger asChild>
                  <Button variant="ghost" size="icon-sm" aria-label="Thao tác khác">
                    <EllipsisVertical />
                  </Button>
                </TooltipTrigger>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                <DropdownMenuGroup>
                  <DropdownMenuItem>
                    <ReplyAll />
                    Trả lời tất cả
                  </DropdownMenuItem>
                  <DropdownMenuItem>
                    <Forward />
                    Chuyển tiếp
                  </DropdownMenuItem>
                </DropdownMenuGroup>
                <DropdownMenuSeparator />
                <DropdownMenuGroup>
                  <DropdownMenuItem>
                    <MailOpen />
                    Đánh dấu chưa đọc
                  </DropdownMenuItem>
                  <DropdownMenuItem>
                    <Tag />
                    Thêm nhãn dán
                  </DropdownMenuItem>
                </DropdownMenuGroup>
              </DropdownMenuContent>
            </DropdownMenu>
            <TooltipContent>Thao tác khác</TooltipContent>
          </Tooltip>
          <Separator className="h-4 data-vertical:self-center" orientation="vertical" />
          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="ghost" size="icon-sm" aria-label="Xóa thư">
                <Trash2 className="text-destructive" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Xóa thư</TooltipContent>
          </Tooltip>
        </div>
      </div>

      <Separator />

      <div className="flex min-h-0 flex-1 flex-col">
        {mail ? (
          <div className="flex min-h-0 flex-1 flex-col gap-3">
            <div className="space-y-1.5">
              <div className="font-bold text-base leading-none text-slate-800">{mail.subject}</div>

              <div className="text-muted-foreground text-xs leading-none">
                {format(new Date(mail.receivedAt), "EEE, d MMM yyyy, h:mm a")}
              </div>
            </div>

            <Separator />

            <div className="flex gap-2">
              <Avatar className="size-9 after:rounded-sm">
                <AvatarFallback className="rounded-sm bg-muted text-xs font-bold">{mail.from.name[0]}</AvatarFallback>
              </Avatar>

              <div className="flex h-full flex-col gap-1">
                <div className="flex items-center gap-2">
                  <div className="text-xs font-bold text-slate-800">{mail.from.name}</div>
                  <Separator className="h-3 data-vertical:self-center" orientation="vertical" />
                  <div className="text-muted-foreground text-xs">{mail.from.email}</div>
                </div>
                <div className="flex items-center gap-2">
                  <div className="text-muted-foreground text-xs">
                    Gửi tới:{" "}
                    <span className="text-foreground font-medium">
                      {mail.to.map((recipient) => recipient.name).join(", ")}
                    </span>
                  </div>

                  {mail.cc?.length ? (
                    <div className="text-muted-foreground text-xs">
                      Cc:{" "}
                      <span className="text-foreground font-medium">
                        {mail.cc.map((recipient) => recipient.name).join(", ")}
                      </span>
                    </div>
                  ) : null}
                </div>
              </div>
            </div>

            <Separator />

            <div className="scrollbar-none min-h-0 flex-1 overflow-y-auto whitespace-pre-wrap text-sm leading-relaxed text-slate-700">
              {mail.body}
            </div>

            <div className="mt-auto flex flex-col gap-3">
              <Separator />
              <InputGroup>
                <InputGroupAddon align="inline-start">
                  <Reply className="h-4 w-4" />
                </InputGroupAddon>
                <InputGroupInput className="text-xs" placeholder={`Phản hồi nhanh tới ${mail.from.name}...`} />
                <InputGroupAddon className="gap-1" align="inline-end">
                  <InputGroupButton variant="ghost">
                    <Smile className="h-4 w-4" />
                  </InputGroupButton>
                  <InputGroupButton variant="ghost">
                    <Paperclip className="h-4 w-4" />
                  </InputGroupButton>
                  <InputGroupButton variant="ghost">
                    <Send className="h-4 w-4" />
                  </InputGroupButton>
                </InputGroupAddon>
              </InputGroup>
            </div>
          </div>
        ) : (
          /* HIỂN THỊ CỔNG KẾT NỐI OAUTH THẬT KHI CHƯA CHỌN THƯ */
          <div className="grid h-full place-items-center bg-slate-50/50 rounded-xl border border-dashed p-6">
            <Card className="max-w-[400px] shadow-sm">
              <CardHeader className="pb-3 border-b">
                <CardTitle className="text-sm font-bold flex items-center gap-1.5 text-slate-800">
                  <ShieldCheck className="h-4.5 w-4.5 text-primary" /> Cổng kết nối Google OAuth
                </CardTitle>
                <CardDescription className="text-[10px]">Đăng nhập Gmail thật của bạn.</CardDescription>
              </CardHeader>
              <CardContent className="pt-4 space-y-4">
                <div className="flex flex-col gap-2 rounded-lg border p-3 bg-muted/20">
                  <div className="flex items-center justify-between text-xs">
                    <span className="flex items-center gap-1.5 font-bold">
                      <MailIcon className="h-4 w-4 text-red-500" /> Google Gmail API
                    </span>
                    {gmailToken ? (
                      <Button
                        size="xs"
                        variant="outline"
                        className="text-red-600 hover:bg-red-50 border-red-500/20"
                        onClick={handleGoogleDisconnect}
                      >
                        Disconnect
                      </Button>
                    ) : (
                      <Button size="xs" onClick={handleGoogleConnect}>
                        Connect
                      </Button>
                    )}
                  </div>
                  <p className="text-[10px] text-muted-foreground leading-relaxed">
                    Bạn có thể tự đăng nhập bằng một tài khoản Gmail riêng biệt (ví dụ:{" "}
                    <strong>boospace7@gmail.com</strong>) để nạp hòm thư thực tế về máy.
                  </p>
                </div>
                {!gmailToken && (
                  <div className="rounded-lg border border-yellow-500/20 p-3 bg-yellow-500/5 text-xs text-muted-foreground space-y-1.5">
                    <span className="font-bold text-yellow-700 flex items-center gap-1">
                      <AlertCircle className="h-3.5 w-3.5" /> Chưa kết nối API
                    </span>
                    <p className="text-[10px] leading-relaxed">
                      Hãy chọn một thư bên cột trái để xem thử nội dung hạch toán hóa đơn thật được trích xuất từ cơ sở
                      dữ liệu Supabase.
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}
