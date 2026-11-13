// Input·Textarea·Select 트리거가 함께 쓴다. class는 문자열 그대로 적는다. Tailwind가 빌드 결과를 스캔한다.
// font-normal은 텍스트 스타일 뒤에 둬야 tailwind-merge가 남긴다.

import type { Size } from "../../types";

/** size class 뒤에 넣는다. */
export const inputBaseClass =
  "w-full min-w-0 rounded-md border border-strong bg-canvas font-normal text-default transition-colors placeholder:text-muted aria-invalid:border-danger focus:focus-field disabled:cursor-not-allowed disabled:border-default disabled:bg-disabled disabled:text-disabled disabled:placeholder:text-disabled";

/** `xs`(24px)는 입력하기에 작아서 받지 않는다. */
export type InputSize = Extract<Size, "sm" | "md" | "lg">;

export const inputSizeClass: Record<InputSize, string> = {
  sm: "h-8 px-2.5 text-label-md",
  md: "h-10 px-3 text-label-md",
  lg: "h-12 px-4 text-label-lg",
};
