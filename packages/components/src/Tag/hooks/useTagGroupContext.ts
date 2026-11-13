"use client";
import { createContext } from "react";

export interface TagGroupContextValue {
  readonly onRemove: ((value: string) => void) | undefined;
  readonly removeLabel: string;
}

export const TagGroupContext = createContext<TagGroupContextValue | null>(null);
