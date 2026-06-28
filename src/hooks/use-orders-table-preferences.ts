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

const CURRENT_VERSION = 1;

const defaultPrefs: Preferences = {
  columnVisibility: {},
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
 * =========================
 * MIGRATION (future-proof)
 * =========================
 */
function migratePreferences(prefs: Preferences): Preferences {
  if (!prefs.version || prefs.version < CURRENT_VERSION) {
    return {
      ...defaultPrefs,
      ...prefs,
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
