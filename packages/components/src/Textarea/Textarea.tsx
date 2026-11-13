"use client";
// 여러 줄 입력창. 네이티브 `<textarea>`이고 React Aria hook을 쓰지 않는다(ADR 0004).
// Field 안에서는 context로 id·aria-describedby·aria-invalid를 받으므로 client Component다.

import type { ComponentProps, ReactElement } from "react";

import { cn } from "./libs/cn.ts";
import { useFieldControl } from "./hooks/useFieldControl.ts";
import { inputBaseClass } from "./constants/inputClass.ts";
import type { Size } from "./types.ts";

/** Textarea의 size. Input과 같이 `sm`/`md`/`lg`만 받는다. */
type TextareaSize = Extract<Size, "sm" | "md" | "lg">;

export interface TextareaProps extends ComponentProps<"textarea"> {
  /** 글자 크기와 padding. 글자 크기는 같은 size의 Input과 같다(14/14/16px). 기본값은 `md`다. */
  size?: TextareaSize;
  /**
   * 오류 상태. `aria-invalid="true"`와 `data-invalid`가 붙고 경계가 danger 색이 된다.
   * Field 안에서는 Field의 값을 따르고, 여기에 준 값이 이긴다.
   */
  invalid?: boolean;
}

// 여러 줄을 읽기 좋게 body 텍스트 스타일(보통 굵기, 넉넉한 행간)을 쓴다. 글자 크기는 Input과 같다.
// 한 줄일 때 글자 위아래 여백이 같은 size의 Input과 같도록 세로 padding을 정했다(border 1px 포함 6/9/13px).
/** 좌우·세로 padding, 텍스트 스타일 */
const sizeClass: Record<TextareaSize, string> = {
  sm: "px-2.5 py-1.25 text-body-sm",
  md: "px-3 py-2 text-body-sm",
  lg: "px-4 py-3 text-body-md",
};

/**
 * 여러 줄 텍스트를 입력하는 네이티브 `<textarea>`. 기본 3줄 높이이고 세로로만 크기를 바꿀 수 있다.
 * Field 안에 두면 label, 설명, 오류 메시지가 자동으로 연결된다.
 */
export function Textarea({
  size = "md",
  invalid,
  id,
  disabled,
  required,
  rows = 3,
  className,
  "aria-describedby": ariaDescribedBy,
  "aria-invalid": ariaInvalid,
  ...props
}: TextareaProps): ReactElement {
  const control = useFieldControl({
    id,
    invalid,
    disabled,
    required,
    "aria-describedby": ariaDescribedBy,
    "aria-invalid": ariaInvalid,
  });
  return (
    <textarea
      {...props}
      {...control}
      rows={rows}
      className={cn(sizeClass[size], inputBaseClass, "resize-y", className)}
    />
  );
}
