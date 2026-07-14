"use client";

import { EllipsisVertical, LogOut, Settings, UserRound } from "lucide-react";
import * as React from "react";
import { siFacebook, siInstagram, siWhatsapp } from "simple-icons";
import { SimpleIcon } from "@/components/simple-icon";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
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
  SidebarMenu,
  SidebarMenuBadge,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar"; // ĐÃ SỬA: Đưa về đúng thư mục con /ui/
import { createClient } from "@/lib/supabase/client";
import { getInitials } from "@/lib/utils";

import { channelItems, navItems, viewItems } from "./data";

const channelBrandIcons = {
  whatsapp: siWhatsapp,
  instagram: siInstagram,
  facebook: siFacebook,
} as const;

export function ChatSidebar() {
  const { state } = useSidebar();
  const _isCollapsed = state === "collapsed";
  const supabase = createClient();

  // Khởi tạo trạng thái Admin động thật
  const [adminUser, setAdminUser] = React.useState({
    name: "Admin",
    email: "admin@boospace.tech",
  });

  // Tự động tải thông tin Admin đang đăng nhập thực tế trên Supabase
  React.useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (user) {
        setAdminUser({
          name:
            `${user.user_metadata?.firstName ?? ""} ${user.user_metadata?.lastName ?? ""}`.trim() ||
            user.email?.split("@")[0] ||
            "Admin",
          email: user.email ?? "",
        });
      }
    });
  }, [supabase]);

  return (
    <Sidebar
      collapsible="offcanvas"
      className="absolute inset-y-0 h-full **:data-[sidebar=sidebar]:bg-background" // ĐÃ SỬA: Đưa về dạng absolute inset-y-0 giống MailSidebar
    >
      <SidebarContent>
        <SidebarGroup>
          <SidebarMenu className="gap-1">
            {navItems.map((item) => (
              <SidebarMenuItem key={item.id}>
                <SidebarMenuButton className="[&_svg]:size-3.5" size="sm" isActive={item.isActive} tooltip={item.title}>
                  <item.icon />
                  <span className="font-medium">{item.title}</span>
                </SidebarMenuButton>
                {item.label && <SidebarMenuBadge className="font-medium">{item.label}</SidebarMenuBadge>}
              </SidebarMenuItem>
            ))}
          </SidebarMenu>
        </SidebarGroup>

        <SidebarGroup>
          <SidebarGroupLabel className="font-normal">Channels</SidebarGroupLabel>
          <SidebarMenu className="gap-1">
            {channelItems.map((item) => (
              <SidebarMenuItem key={item.id}>
                <SidebarMenuButton className="[&_svg]:size-3.5" size="sm" isActive={item.isActive} tooltip={item.title}>
                  {item.id in channelBrandIcons ? (
                    <SimpleIcon icon={channelBrandIcons[item.id as keyof typeof channelBrandIcons]} />
                  ) : (
                    <item.icon />
                  )}
                  <span className="font-medium">{item.title}</span>
                </SidebarMenuButton>
                {item.label && <SidebarMenuBadge className="font-medium">{item.label}</SidebarMenuBadge>}
              </SidebarMenuItem>
            ))}
          </SidebarMenu>
        </SidebarGroup>

        <SidebarGroup>
          <SidebarGroupLabel className="font-normal">Views</SidebarGroupLabel>
          <SidebarMenu className="gap-1">
            {viewItems.map((item) => (
              <SidebarMenuItem key={item.id}>
                <SidebarMenuButton className="[&_svg]:size-3.5" size="sm" isActive={item.isActive} tooltip={item.title}>
                  <item.icon />
                  <span className="font-medium">{item.title}</span>
                </SidebarMenuButton>
                {item.label && <SidebarMenuBadge className="font-medium">{item.label}</SidebarMenuBadge>}
              </SidebarMenuItem>
            ))}
          </SidebarMenu>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter>
        <Separator />
        <SidebarMenu>
          <SidebarMenuItem>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <SidebarMenuButton
                  size="lg"
                  className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
                >
                  <Avatar>
                    <AvatarFallback className="text-xs">{getInitials(adminUser.name)}</AvatarFallback>
                  </Avatar>
                  <div className="grid flex-1 text-left text-sm leading-tight">
                    <span className="truncate font-medium">{adminUser.name}</span>
                    <span className="truncate text-muted-foreground text-xs">{adminUser.email}</span>
                  </div>
                  <EllipsisVertical className="ml-auto size-4" />
                </SidebarMenuButton>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-(--radix-dropdown-menu-trigger-width) min-w-56" side="top">
                <DropdownMenuLabel className="p-0 font-normal">
                  <div className="flex items-center gap-2 px-1 py-1.5 text-left text-sm">
                    <Avatar>
                      <AvatarFallback className="text-xs">{getInitials(adminUser.name)}</AvatarFallback>
                    </Avatar>
                    <div className="grid flex-1 text-left text-sm leading-tight">
                      <span className="truncate font-medium">{adminUser.name}</span>
                      <span className="truncate text-muted-foreground text-xs">{adminUser.email}</span>
                    </div>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuGroup>
                  <DropdownMenuItem>
                    <UserRound />
                    Account
                  </DropdownMenuItem>
                  <DropdownMenuItem>
                    <Settings />
                    Settings
                  </DropdownMenuItem>
                </DropdownMenuGroup>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={async () => {
                    await supabase.auth.signOut();
                    window.location.reload();
                  }}
                >
                  <LogOut />
                  Log out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
}
