"use client";
import { createContext, use } from "react";

/** 열린 내용 안의 부분 요소(제목·설명·머리)를 DialogContent에 알린다. */
export interface DialogPartsContextValue {
  readonly alert: boolean;
  readonly closeLabel: string;
  readonly hasHeader: boolean;
  readonly setHasHeader: (hasHeader: boolean) => void;
  readonly setTitleId: (id: string | null) => void;
  readonly setDescriptionId: (id: string | null) => void;
}

export const DialogPartsContext = createContext<DialogPartsContextValue | null>(null);

export function useDialogPartsContext(part: string): DialogPartsContextValue {
  const context = use(DialogPartsContext);
  if (!context) throw new Error(`${part}는 DialogContent 안에 둔다.`);

  return context;
}
