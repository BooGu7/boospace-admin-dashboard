"use client";

import { Check, EllipsisVertical, LogOut, Mail, PenLine, Settings2, UserPlus, UsersRound } from "lucide-react";
import * as React from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Separator } from "@/components/ui/separator";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuBadge,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { cn, getInitials } from "@/lib/utils";

import { type MailNavItem, mailNavigation } from "./data";

export function MailSidebar() {
  const { state } = useSidebar();
  const isCollapsed = state === "collapsed";

  const [gmailToken, setGmailToken] = React.useState<string | null>(null);

  // Khởi tạo tài khoản Admin hiển thị góc trái
  const [selectedAccount, setSelectedAccount] = React.useState({
    id: 1,
    label: "Admin BooSpace",
    email: "admin@boospace.tech",
  });

  // Đọc thông tin tài khoản thật sau khi kết nối trực tiếp Google thành công
  React.useEffect(() => {
    const token = localStorage.getItem("gmail_access_token");
    const savedEmail = localStorage.getItem("gmail_user_email");
    const savedName = localStorage.getItem("gmail_user_name");

    if (token) {
      setGmailToken(token);
      if (savedEmail && savedName) {
        setSelectedAccount({
          id: 1,
          label: savedName,
          email: savedEmail,
        });
      }
    }
  }, []);

  // KHỞI CHẠY GOOGLE OAUTH TRỰC TIẾP VỚI MÃ CLIENT ID THẬT CỦA BẠN
  const handleGoogleConnect = () => {
    const clientId = "1084942096128-hpq2p90osdrhvmk6hhf8a4m5vgfv404f.apps.googleusercontent.com"; // ĐỒNG BỘ: Mã Client ID thật trên Supabase Console của bạn
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
    setSelectedAccount({
      id: 1,
      label: "Admin BooSpace",
      email: "admin@boospace.tech",
    });
    toast.success("Đã ngắt kết nối Gmail thành công!");
    window.location.reload();
  };

  return (
    <Sidebar collapsible="icon" className="absolute inset-y-0 h-full **:data-[sidebar=sidebar]:bg-background">
      <SidebarHeader className="gap-3 py-3 pb-1">
        <div className="flex items-center justify-between">
          {isCollapsed ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon-sm"
                  className={accountTriggerClassName}
                  aria-label={`Open ${selectedAccount.label} menu`}
                >
                  <AccountMarker account={selectedAccount} isSelected />
                </Button>
              </DropdownMenuTrigger>
              <AccountMenuContent
                selectedAccount={selectedAccount}
                showAccounts
                side="right"
                align="start"
                onDisconnect={handleGoogleDisconnect}
              />
            </DropdownMenu>
          ) : (
            <>
              <ToggleGroup type="single" value={String(selectedAccount.id)} spacing={2}>
                <ToggleGroupItem
                  className={accountTriggerClassName}
                  value={String(selectedAccount.id)}
                  aria-label={`Select ${selectedAccount.label}`}
                >
                  <AccountMarker account={selectedAccount} />
                </ToggleGroupItem>
              </ToggleGroup>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon-sm" aria-label="Open account menu">
                    <EllipsisVertical />
                  </Button>
                </DropdownMenuTrigger>
                <AccountMenuContent selectedAccount={selectedAccount} onDisconnect={handleGoogleDisconnect} />
              </DropdownMenu>
            </>
          )}
        </div>

        <Separator />

        <div className="flex flex-col gap-1.5 group-data-[state=collapsed]:hidden">
          <div className="font-bold text-sm leading-none">{selectedAccount.label}</div>
          <div className="truncate text-muted-foreground text-sm leading-none">{selectedAccount.email}</div>
        </div>

        {/* NÚT SOẠN THƯ */}
        <Button size={isCollapsed ? "icon-sm" : "sm"} variant="outline" className="group-data-[state=expanded]:w-full">
          <PenLine data-icon="inline-start" />
          <span className="group-data-[state=collapsed]:hidden">New email</span>
        </Button>

        {/* NÚT ĐĂNG NHẬP GMAIL GOOGLE OAUTH TRỰC TIẾP */}
        {gmailToken ? (
          <Button
            size={isCollapsed ? "icon-sm" : "sm"}
            variant="outline"
            className="group-data-[state=expanded]:w-full border-red-500/20 text-red-600 hover:bg-red-50 hover:text-red-700 font-bold text-xs gap-1.5"
            onClick={handleGoogleDisconnect}
          >
            <LogOut className="h-3.5 w-3.5" />
            <span className="group-data-[state=collapsed]:hidden">Disconnect Gmail</span>
          </Button>
        ) : (
          <Button
            size={isCollapsed ? "icon-sm" : "sm"}
            className="group-data-[state=expanded]:w-full bg-red-600 hover:bg-red-700 text-white font-black text-xs gap-1.5"
            onClick={handleGoogleConnect}
          >
            <Mail className="h-3.5 w-3.5" />
            <span className="group-data-[state=collapsed]:hidden">Connect Gmail (OAuth)</span>
          </Button>
        )}
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarMenu className="gap-1">{mailNavigation.navMain.map(renderNavItem)}</SidebarMenu>
        </SidebarGroup>

        <SidebarGroup>
          <SidebarGroupLabel className="font-normal">Folders</SidebarGroupLabel>
          <SidebarMenu className="gap-1">{mailNavigation.folders.map(renderNavItem)}</SidebarMenu>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter>
        <SidebarMenu className="gap-1">{mailNavigation.navFooter.map(renderNavItem)}</SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
}

function renderNavItem(nav: MailNavItem) {
  return (
    <SidebarMenuItem key={nav.id}>
      <SidebarMenuButton className="[&_svg]:size-3.5" size="sm" isActive={nav.isActive} tooltip={nav.title}>
        <nav.icon />
        <span className="font-medium">{nav.title}</span>
      </SidebarMenuButton>
      {nav.label && <SidebarMenuBadge className="font-medium">{nav.label}</SidebarMenuBadge>}
    </SidebarMenuItem>
  );
}

const accountTriggerClassName = cn(
  "relative size-7 min-w-7 rounded-sm p-0 transition-colors",
  "bg-primary text-primary-foreground text-xs hover:bg-primary/90 hover:text-primary-foreground",
  "data-[state=on]:bg-primary data-[state=on]:text-primary-foreground",
  "data-[state=on]:ring data-[state=on]:ring-green-600",
  "focus-visible:border-transparent focus-visible:ring-0",
);

function AccountMarker({ account, isSelected = false }: { account: any; isSelected?: boolean }) {
  return (
    <>
      {getInitials(account.label).slice(0, 1)}
      <span
        className={cn(
          "absolute right-0 bottom-0 z-10 hidden size-2.5 items-center justify-center rounded-full bg-green-600 text-primary-foreground ring-[1.25px] ring-background group-data-[state=on]/toggle:flex",
          isSelected && "flex",
        )}
      >
        <Check className="size-2" />
      </span>
    </>
  );
}

function AccountMenuContent({
  selectedAccount,
  showAccounts = false,
  onDisconnect,
  ...props
}: {
  selectedAccount: any;
  showAccounts?: boolean;
  onDisconnect: () => void;
} & Pick<React.ComponentProps<typeof DropdownMenuContent>, "align" | "side">) {
  return (
    <DropdownMenuContent className="w-56" {...props}>
      {showAccounts && (
        <>
          <DropdownMenuLabel>Accounts</DropdownMenuLabel>
          <DropdownMenuGroup>
            <div className="flex min-w-0 flex-col px-2 py-1.5 bg-muted/40 rounded-sm">
              <span className="font-bold text-xs">{selectedAccount.label}</span>
              <span className="truncate text-muted-foreground text-[10px]">{selectedAccount.email}</span>
            </div>
          </DropdownMenuGroup>
          <DropdownMenuSeparator />
        </>
      )}
      <DropdownMenuGroup>
        <DropdownMenuItem>
          <UserPlus />
          Add account
        </DropdownMenuItem>
        <DropdownMenuItem>
          <UsersRound />
          Manage accounts
        </DropdownMenuItem>
        <DropdownMenuItem>
          <Settings2 />
          Account settings
        </DropdownMenuItem>
      </DropdownMenuGroup>
      <DropdownMenuSeparator />
      <DropdownMenuGroup>
        <DropdownMenuItem onClick={onDisconnect}>
          <LogOut />
          Sign out
        </DropdownMenuItem>
      </DropdownMenuGroup>
    </DropdownMenuContent>
  );
}
