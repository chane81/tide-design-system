import type { FillVariant, Size } from "../types.ts";

/** Button의 채움 방식. 4개를 모두 받는다. */
export type ButtonVariant = Extract<FillVariant, "solid" | "subtle" | "outline" | "ghost">;

/** Button의 size. 공통 size 4개를 모두 받는다. */
export type ButtonSize = Extract<Size, "xs" | "sm" | "md" | "lg">;
