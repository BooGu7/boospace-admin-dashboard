"use client";

import { Settings } from "lucide-react";
import * as React from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import type { FontKey } from "@/lib/fonts/registry";
import type { ContentLayout, NavbarStyle, SidebarCollapsible, SidebarVariant } from "@/lib/preferences/layout";
import {
  applyContentLayout,
  applyFont,
  applyNavbarStyle,
  applySidebarCollapsible,
  applySidebarVariant,
} from "@/lib/preferences/layout-utils";
import { persistPreference } from "@/lib/preferences/preferences-storage";
import { THEME_PRESET_OPTIONS, type ThemeMode, type ThemePreset } from "@/lib/preferences/theme";
import { applyThemePreset } from "@/lib/preferences/theme-utils";
import { usePreferencesStore } from "@/stores/preferences/preferences-provider";

export function LayoutControls() {
  const themeMode = usePreferencesStore((s) => s.themeMode);
  const resolvedThemeMode = usePreferencesStore((s) => s.resolvedThemeMode);
  const setThemeMode = usePreferencesStore((s) => s.setThemeMode);
  const themePreset = usePreferencesStore((s) => s.themePreset);
  const setThemePreset = usePreferencesStore((s) => s.setThemePreset);
  const _contentLayout = usePreferencesStore((s) => s.contentLayout);
  const setContentLayout = usePreferencesStore((s) => s.setContentLayout);
  const _navbarStyle = usePreferencesStore((s) => s.navbarStyle);
  const setNavbarStyle = usePreferencesStore((s) => s.setNavbarStyle);
  const _variant = usePreferencesStore((s) => s.sidebarVariant);
  const setSidebarVariant = usePreferencesStore((s) => s.setSidebarVariant);
  const _collapsible = usePreferencesStore((s) => s.sidebarCollapsible);
  const setSidebarCollapsible = usePreferencesStore((s) => s.setSidebarCollapsible);
  const setFont = usePreferencesStore((s) => s.setFont);

  const onThemePresetChange = React.useCallback(
    (preset: ThemePreset) => {
      applyThemePreset(preset);
      setThemePreset(preset);
      void persistPreference("theme_preset", preset);
    },
    [setThemePreset],
  );

  const onThemeModeChange = React.useCallback(
    (mode: ThemeMode | "") => {
      if (!mode) return;
      setThemeMode(mode);
      void persistPreference("theme_mode", mode);
    },
    [setThemeMode],
  );

  const onContentLayoutChange = React.useCallback(
    (layout: ContentLayout | "") => {
      if (!layout) return;
      applyContentLayout(layout);
      setContentLayout(layout);
      void persistPreference("content_layout", layout);
    },
    [setContentLayout],
  );

  const onNavbarStyleChange = React.useCallback(
    (style: NavbarStyle | "") => {
      if (!style) return;
      applyNavbarStyle(style);
      setNavbarStyle(style);
      void persistPreference("navbar_style", style);
    },
    [setNavbarStyle],
  );

  const onSidebarStyleChange = React.useCallback(
    (value: SidebarVariant | "") => {
      if (!value) return;
      setSidebarVariant(value);
      applySidebarVariant(value);
      void persistPreference("sidebar_variant", value);
    },
    [setSidebarVariant],
  );

  const onSidebarCollapseModeChange = React.useCallback(
    (value: SidebarCollapsible | "") => {
      if (!value) return;
      setSidebarCollapsible(value);
      applySidebarCollapsible(value);
      void persistPreference("sidebar_collapsible", value);
    },
    [setSidebarCollapsible],
  );

  const onFontChange = React.useCallback(
    (value: FontKey | "") => {
      if (!value) return;
      applyFont(value);
      setFont(value);
      void persistPreference("font", value);
    },
    [setFont],
  );

  // Tự động kiểm tra và khởi tạo các mốc tùy chỉnh mặc định mới theo yêu cầu thiết kế
  React.useEffect(() => {
    if (typeof window !== "undefined") {
      const hasInitialized = localStorage.getItem("boospace_pref_init_v3");
      if (!hasInitialized) {
        onThemePresetChange("tangerine");
        onThemeModeChange("system");
        onContentLayoutChange("full-width");
        onNavbarStyleChange("sticky");
        onSidebarStyleChange("floating");
        onSidebarCollapseModeChange("icon");
        onFontChange("geist");
        localStorage.setItem("boospace_pref_init_v3", "true");
      }
    }
  }, [
    onThemePresetChange,
    onThemeModeChange,
    onContentLayoutChange,
    onNavbarStyleChange,
    onSidebarStyleChange,
    onSidebarCollapseModeChange,
    onFontChange,
  ]);

  const handleRestore = () => {
    onThemePresetChange("tangerine");
    onThemeModeChange("system");
    onContentLayoutChange("full-width");
    onNavbarStyleChange("sticky");
    onSidebarStyleChange("floating");
    onSidebarCollapseModeChange("icon");
    onFontChange("geist");
    toast.success("Đã khôi phục cấu hình giao diện mặc định mới");
  };

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button size="icon" variant="ghost" className="h-8 w-8 text-slate-700 hover:bg-slate-100">
          <Settings className="size-4" />
        </Button>
      </PopoverTrigger>
      <PopoverContent align="end" className="w-64 p-4 shadow-md">
        <div className="flex flex-col gap-4">
          <div className="space-y-1">
            <h4 className="font-bold text-sm text-slate-800 leading-none">Tùy chỉnh hệ thống</h4>
            <p className="text-muted-foreground text-[11px] leading-relaxed">
              Cá nhân hóa chủ đề màu sắc và chế độ hiển thị của bảng điều khiển.
            </p>
          </div>

          <div className="space-y-3.5 **:data-[slot=toggle-group]:w-full **:data-[slot=toggle-group-item]:flex-1 **:data-[slot=toggle-group-item]:text-[11px] **:data-[slot=toggle-group-item]:font-semibold">
            {/* 1. CHỦ ĐỀ MÀU SẮC */}
            <div className="space-y-1.5">
              <Label className="font-bold text-xs text-slate-700">Chủ đề màu sắc</Label>
              <Select value={themePreset} onValueChange={onThemePresetChange}>
                <SelectTrigger size="sm" className="w-full text-xs font-semibold h-8.5">
                  <SelectValue placeholder="Chọn tông màu" />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    {THEME_PRESET_OPTIONS.map((preset) => (
                      <SelectItem key={preset.value} className="text-xs font-medium" value={preset.value}>
                        <span
                          className="size-2.5 rounded-full mr-1.5 inline-block align-middle"
                          style={{
                            backgroundColor:
                              (resolvedThemeMode ?? "light") === "dark" ? preset.primary.dark : preset.primary.light,
                          }}
                        />
                        {preset.label}
                      </SelectItem>
                    ))}
                  </SelectGroup>
                </SelectContent>
              </Select>
            </div>

            {/* 2. CHẾ ĐỘ GIAO DIỆN */}
            <div className="space-y-1.5">
              <Label className="font-bold text-xs text-slate-700">Chế độ giao diện</Label>
              <ToggleGroup
                size="sm"
                spacing={0}
                variant="outline"
                type="single"
                value={themeMode}
                onValueChange={onThemeModeChange}
                className="h-8.5"
              >
                <ToggleGroupItem value="light" aria-label="Giao diện sáng">
                  Sáng
                </ToggleGroupItem>
                <ToggleGroupItem value="dark" aria-label="Giao diện tối">
                  Tối
                </ToggleGroupItem>
                <ToggleGroupItem value="system" aria-label="Đồng bộ hệ thống">
                  Hệ thống
                </ToggleGroupItem>
              </ToggleGroup>
            </div>

            <hr className="border-t border-slate-100 dark:border-slate-800 my-1" />

            <Button
              type="button"
              size="sm"
              variant="outline"
              className="w-full text-xs font-bold h-8.5 border-slate-200 hover:bg-slate-50 hover:text-slate-900 cursor-pointer"
              onClick={handleRestore}
            >
              Khôi phục mặc định
            </Button>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}
