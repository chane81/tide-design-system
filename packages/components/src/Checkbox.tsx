"use client";
// 체크박스. 네이티브 `<input type="checkbox">`이고 React Aria hook을 쓰지 않는다(ADR 0004).
// Field·CheckboxGroup context를 읽고, indeterminate를 DOM 속성으로 넣어야 해서 client Component다
// (indeterminate는 HTML 속성이 없고 `input.indeterminate`로만 정한다).
//
// Switch와 같은 구조다(티켓 17, ADR 0015): ref와 나머지 HTML 속성은 input에, className·style은 루트 label에 간다.
// 루트 label에는 data-color와 상태 노출용 data-disabled·data-invalid도 붙는다.

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

import { CheckboxGroupContext } from "./hooks/useChoiceGroup.ts";
import {
  choiceAreaClass,
  choiceInputClass,
  choiceMarkClass,
  choiceRootClass,
  choiceTextClass,
  type ChoiceSize,
} from "./constants/choiceClass.ts";
import { cn } from "./libs/cn.ts";
import { useFieldControl } from "./hooks/useFieldControl.ts";
import type { Role } from "./types.ts";

export interface CheckboxProps extends Omit<
  ComponentProps<"input">,
  "type" | "size" | "color" | "children" | "className" | "style"
> {
  /** 상자 옆에 보이는 label. 체크박스의 이름이 된다. 없으면 `aria-label`을 준다. */
  children?: ReactNode;
  /** 상자 16px·글자 14px(`sm`) 또는 상자 20px·글자 16px(`md`). 누르는 영역은 둘 다 24×24px이다. 기본값은 `md`다. */
  size?: ChoiceSize;
  /** 체크했을 때 상자 색(Role). 루트에 `data-color`로 붙는다. 기본값은 `primary`다. */
  color?: Role;
  /**
   * 일부만 선택된 상태(「전체 선택」 등). 체크 대신 가로줄이 보이고 보조 기술은 「일부 선택」으로 읽는다.
   * 누르면 브라우저가 이 상태를 지우므로, 앱이 다시 계산해 넘긴다.
   */
  indeterminate?: boolean;
  /**
   * 오류 상태. input에 `aria-invalid="true"`와 `data-invalid`가 붙고 경계가 danger 색이 된다.
   * Field·CheckboxGroup 안에서는 그 값을 따르고, 여기에 준 값이 이긴다.
   */
  invalid?: boolean;
  /** 루트 label의 class. 사용자 class가 기본 class를 이긴다. 상자 모양은 바꾸지 않는다(`size`·`color`가 맡는다). */
  className?: string;
  /** 루트 label의 style */
  style?: CSSProperties;
}

/** 상자 크기와 모서리. 체크박스는 radius `sm`(4px)이다. */
const boxClass: Record<ChoiceSize, string> = {
  sm: "size-4 rounded-sm",
  md: "size-5 rounded-sm",
};

/** 상자 안 아이콘 크기(px) */
const iconSize: Record<ChoiceSize, number> = { sm: 12, md: 16 };

/**
 * 네이티브 체크박스. `checked`/`defaultChecked`/`onChange`를 그대로 받고 form에 그대로 제출된다.
 * 여러 개를 묶어 이름·설명·오류를 붙이려면 `Field group` 안의 `CheckboxGroup`에 둔다.
 */
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
  // 매 렌더마다 맞춘다. 사용자가 누르면 브라우저가 indeterminate를 지우므로, 다시 렌더될 때 prop 값으로 되돌린다.
  // 화면에 그리기 전에 맞춰 체크 표시가 깜박이지 않게 layout effect를 쓴다(서버에서는 실행되지 않는다).
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
        {/* 장식용 아이콘(aria-hidden). 상태는 input이 보조 기술에 알린다. */}
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
