"use client";
// Field context로 id·aria-describedby·aria-invalid를 받으므로 client Component다.

import type { ComponentProps, ReactElement } from "react";

import { cn } from "../_internal/libs/cn";
import { useFieldControl } from "../_internal/hooks/useFieldControl";
import { inputBaseClass } from "../_internal/constants/inputClass";
import type { Size } from "../types";

/** Textarea의 size. Input과 같이 `sm`/`md`/`lg`만 받는다. */
type TextareaSize = Extract<Size, "sm" | "md" | "lg">;

export interface TextareaOwnProps {
  /** 글자 크기와 padding. 글자 크기는 같은 size의 Input과 같다(14/14/16px). 기본값은 `md`다. */
  size?: TextareaSize;
  /** 오류 상태. `aria-invalid="true"`와 `data-invalid`가 붙는다. Field 값보다 여기 준 값이 이긴다. */
  invalid?: boolean;
}

export interface TextareaProps
  extends TextareaOwnProps, Omit<ComponentProps<"textarea">, keyof TextareaOwnProps> {}

// 세로 padding은 한 줄일 때 글자 위아래 여백이 같은 size의 Input과 같도록 정했다(border 포함 6/9/13px).
const sizeClass: Record<TextareaSize, string> = {
  sm: "px-2.5 py-1.25 text-body-sm",
  md: "px-3 py-2 text-body-sm",
  lg: "px-4 py-3 text-body-md",
};

/**
 * 여러 줄 텍스트를 입력하는 네이티브 `<textarea>`. 기본 3줄 높이이고 세로로만 크기를 바꿀 수 있다.
 * Field 안에 두면 label, 설명, 오류 메시지가 자동으로 연결된다.
 * Tide props: `size`, `invalid` ({@link TextareaOwnProps}). 나머지는 `<textarea>` 속성.
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
