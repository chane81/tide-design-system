"use client";
// context를 읽고, HTML 속성이 없는 indeterminate를 DOM으로 넣어야 해서 client다.
// ref와 HTML 속성은 input에, className·style은 루트 label에 간다(ADR 0015).

import { CheckIcon, MinusIcon } from "@tide-design/icons";
import {
  use,
  useImperativeHandle,
  useLayoutEffect,
  useRef,
  type ComponentProps,
  type CSSProperties,
  type ReactElement,
  type ReactNode,
} from "react";

import { CheckboxGroupContext } from "../_internal/hooks/useChoiceGroup";
import {
  choiceAreaClass,
  choiceInputClass,
  choiceMarkClass,
  choiceRootClass,
  choiceTextClass,
  type ChoiceSize,
} from "../_internal/constants/choiceClass";
import { cn } from "../_internal/libs/cn";
import { useFieldControl } from "../_internal/hooks/useFieldControl";
import type { Role } from "../types";

export interface CheckboxProps extends Omit<
  ComponentProps<"input">,
  "type" | "size" | "color" | "children" | "className" | "style"
> {
  /** 상자 옆에 보이는 label. 체크박스의 이름이 된다. 없으면 `aria-label`을 준다. */
  children?: ReactNode;
  /** 상자 16px(`sm`) 또는 20px(`md`). 누르는 영역은 둘 다 24×24px. 기본값 `md`. */
  size?: ChoiceSize;
  /** 체크했을 때 상자 색(Role). 기본값 `primary`. */
  color?: Role;
  /** 일부만 선택된 상태(가로줄). 누르면 브라우저가 지우므로 앱이 다시 계산해 넘긴다. */
  indeterminate?: boolean;
  /** 오류 상태(`aria-invalid="true"`). Field·CheckboxGroup 값보다 여기에 준 값이 이긴다. */
  invalid?: boolean;
  /** 루트 label의 class. 기본 class를 이긴다. 상자 모양은 `size`·`color`가 맡는다. */
  className?: string;
  /** 루트 label의 style */
  style?: CSSProperties;
}

const boxClass: Record<ChoiceSize, string> = {
  sm: "size-4 rounded-sm",
  md: "size-5 rounded-sm",
};

const iconSize: Record<ChoiceSize, number> = { sm: 12, md: 16 };

/** 네이티브 체크박스. 여러 개를 묶어 이름·설명·오류를 붙이려면 `Field group` 안의 `CheckboxGroup`에 둔다. */
export function Checkbox({
  children,
  size = "md",
  color = "primary",
  indeterminate = false,
  invalid,
  id,
  disabled,
  required,
  className,
  style,
  ref,
  "aria-describedby": ariaDescribedBy,
  "aria-invalid": ariaInvalid,
  ...props
}: CheckboxProps): ReactElement {
  const group = use(CheckboxGroupContext);
  const control = useFieldControl({
    id,
    invalid: invalid ?? group?.invalid,
    disabled: disabled ?? group?.disabled,
    required,
    "aria-describedby": ariaDescribedBy,
    "aria-invalid": ariaInvalid,
  });

  const inputRef = useRef<HTMLInputElement>(null);
  useImperativeHandle(ref, () => inputRef.current as HTMLInputElement, []);
  // 누르면 브라우저가 indeterminate를 지우므로 매 렌더 되돌린다. 깜박이지 않게 layout effect를 쓴다.
  useLayoutEffect(() => {
    if (inputRef.current) inputRef.current.indeterminate = indeterminate;
  });

  return (
    <label
      data-color={color}
      data-disabled={control.disabled ? "" : undefined}
      data-invalid={control["data-invalid"]}
      style={style}
      className={cn(choiceRootClass, choiceTextClass[size], className)}
    >
      <span className={choiceAreaClass}>
        <input
          {...props}
          {...control}
          ref={inputRef}
          type="checkbox"
          className={cn(boxClass[size], choiceInputClass)}
        />
        {/* 아이콘은 장식용이다. 상태는 input이 보조 기술에 알린다. */}
        <CheckIcon
          size={iconSize[size]}
          strokeWidth={3}
          data-mark="check"
          className={cn(choiceMarkClass, "peer-checked:block peer-indeterminate:hidden")}
        />
        <MinusIcon
          size={iconSize[size]}
          strokeWidth={3}
          data-mark="indeterminate"
          className={cn(choiceMarkClass, "peer-indeterminate:block")}
        />
      </span>
      {children === undefined || children === null ? null : <span>{children}</span>}
    </label>
  );
}
