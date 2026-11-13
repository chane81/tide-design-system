"use client";
import { createContext, use } from "react";

import type { TabsActivationMode, TabsOrientation } from "../types.ts";

export interface TabsContextValue {
  readonly value: string;
  readonly setValue: (value: string) => void;
  readonly orientation: TabsOrientation;
  readonly activationMode: TabsActivationMode;
  readonly tabId: (value: string) => string;
  readonly panelId: (value: string) => string;
}

export const TabsContext = createContext<TabsContextValue | null>(null);

export function useTabsContext(part: string): TabsContextValue {
  const context = use(TabsContext);
  if (!context) throw new Error(`${part}는 Tabs 안에 둔다.`);
  return context;
}
