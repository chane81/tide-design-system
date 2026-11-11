"use client";
// 한 줄 입력창. 네이티브 `<input>`이고 React Aria hook을 쓰지 않는다(ADR 0004).
// Field 안에서는 context로 id·aria-describedby·aria-invalid를 받으므로 client Component다.

import type { ComponentProps, ReactElement } from "react";

import { cn } from "./cn.ts";
import { useFieldControl } from "./field-context.ts";
import { inputBaseClass, inputSizeClass, type InputSize } from "./input-style.ts";

export interface InputProps extends Omit<ComponentProps<"input">, "size"> {
  /** 높이 `sm` 32px, `md` 40px, `lg` 48px. 같은 size의 Button과 높이가 같다. 기본값은 `md`다. */
  size?: InputSize;
  /**
   * 오류 상태. `aria-invalid="true"`와 `data-invalid`가 붙고 경계가 danger 색이 된다.
   * Field 안에서는 Field의 값을 따르고, 여기에 준 값이 이긴다.
   */
  invalid?: boolean;
}

/**
 * 한 줄 텍스트를 입력하는 네이티브 `<input>`. `type`(`email`, `password`, `date` 등)을 그대로 받는다.
 * Field 안에 두면 label, 설명, 오류 메시지가 자동으로 연결된다.
 */
export function Input({
  size = "md",
  invalid,
  id,
  disabled,
  required,
  className,
  "aria-describedby": ariaDescribedBy,
  "aria-invalid": ariaInvalid,
  ...props
}: InputProps): ReactElement {
  const control = useFieldControl({
    id,
    invalid,
    disabled,
    required,
    "aria-describedby": ariaDescribedBy,
    "aria-invalid": ariaInvalid,
  });
  return (
    <input
      {...props}
      {...control}
      className={cn(inputSizeClass[size], inputBaseClass, className)}
    />
  );
}
