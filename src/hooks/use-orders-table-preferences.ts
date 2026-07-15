"use client";

import { useCallback, useEffect, useState } from "react";

const KEY = "orders-table-preferences";

/**
 * =========================
 * TYPES
 * =========================
 */
type Preferences = {
  columnVisibility: Record<string, boolean>;
  version?: number;
};

// ĐÃ SỬA: Nâng cấp phiên bản cấu hình bảng lên phiên bản 2 để xóa cache tự động
const CURRENT_VERSION = 2;

const defaultPrefs: Preferences = {
  columnVisibility: {
    code: true,
    createdAt: true,
    customerName: true,
    customerPhone: true,
    customerAddress: true,
    total: true,
    orderStatus: true,
    "quick-approve": true,
    actions: true,
  },
  version: CURRENT_VERSION,
};

/**
 * =========================
 * SAFE PARSE
 * =========================
 */
function safeParse(value: string | null): Preferences | null {
  if (!value) return null;

  try {
    const parsed = JSON.parse(value);

    if (!parsed || typeof parsed !== "object") return null;

    return parsed as Preferences;
  } catch {
    return null;
  }
}

/**
 * ==========================================================
 * BỘ TỰ ĐỘNG DI TRÚ NÂNG CẤP HỘP THOẠI (AUTOMATIC PREFERENCE MIGRATION)
 * ==========================================================
 */
function migratePreferences(prefs: Preferences): Preferences {
  // Nếu phát hiện người dùng đang dùng phiên bản lưu trữ cũ (version 1), tự động reset và kích hoạt hiển thị các cột mới
  if (!prefs.version || prefs.version < CURRENT_VERSION) {
    return {
      ...defaultPrefs,
      columnVisibility: {
        ...defaultPrefs.columnVisibility,
        customerPhone: true, // Ép hiển thị cột Số điện thoại
        customerAddress: true, // Ép hiển thị cột Địa chỉ
        "quick-approve": true, // Ép hiển thị cột nút duyệt nhanh
      },
      version: CURRENT_VERSION,
    };
  }

  return prefs;
}

/**
 * =========================
 * HOOK
 * =========================
 */
export function useOrdersTablePreferences() {
  const [prefs, setPrefs] = useState<Preferences>(defaultPrefs);
  const [hydrated, setHydrated] = useState(false);

  /**
   * LOAD FROM LOCALSTORAGE
   */
  useEffect(() => {
    const stored = localStorage.getItem(KEY);
    const parsed = safeParse(stored);

    if (parsed) {
      setPrefs(migratePreferences(parsed));
    } else {
      // Nếu chưa có cấu hình nào, nạp mặc định hiển thị đầy đủ
      setPrefs(defaultPrefs);
      localStorage.setItem(KEY, JSON.stringify(defaultPrefs));
    }

    setHydrated(true);
  }, []);

  /**
   * UPDATE (MERGE SAFE + STABLE)
   */
  const updatePreferences = useCallback((newPrefs: Partial<Preferences>) => {
    setPrefs((prev) => {
      const merged = {
        ...prev,
        ...newPrefs,
      };

      localStorage.setItem(KEY, JSON.stringify(merged));

      return merged;
    });
  }, []);

  /**
   * RESET
   */
  const resetPreferences = useCallback(() => {
    setPrefs(defaultPrefs);
    localStorage.setItem(KEY, JSON.stringify(defaultPrefs));
  }, []);

  return {
    prefs,
    updatePreferences,
    resetPreferences,
    hydrated,
  };
}
