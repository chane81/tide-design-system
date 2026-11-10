"use client";
// 라디오 버튼. 네이티브 `<input type="radio">`이고 React Aria hook을 쓰지 않는다(ADR 0004).
// 화살표 이동과 하나만 선택되는 동작은 같은 `name`의 네이티브 라디오가 맡는다.
// RadioGroup context(이름, 선택 값)를 읽으므로 client Component다.
//
// Switch와 같은 구조다(티켓 17, ADR 0015): ref와 나머지 HTML 속성은 input에, className·style은 루트 label에 간다.
// 루트 label에는 data-color와 상태 노출용 data-disabled·data-invalid도 붙는다.

import { CircleIcon } from "@tide-tds/icons";
import {
  use,
  type ChangeEvent,
  type ComponentProps,
  type CSSProperties,
  type ReactElement,
  type ReactNode,
} from "react";

import { RadioGroupContext } from "./choice-group.ts";
import {
  choiceAreaClass,
  choiceInputClass,
  choiceMarkClass,
  choiceRootClass,
  choiceTextClass,
  type ChoiceSize,
} from "./choice-style.ts";
import { cn } from "./cn.ts";
import { useFieldControl } from "./field-context.ts";
import type { Role } from "./types.ts";

export interface RadioProps extends Omit<
  ComponentProps<"input">,
  "type" | "size" | "color" | "children" | "className" | "style" | "value"
> {
  /** 이 라디오의 값. RadioGroup의 `value`·`onValueChange`가 이 값을 쓰고, form에 제출된다. */
  value: string;
  /** 원 옆에 보이는 label. 라디오의 이름이 된다. 없으면 `aria-label`을 준다. */
  children?: ReactNode;
  /** 원 16px·글자 14px(`sm`) 또는 원 20px·글자 16px(`md`). 누르는 영역은 둘 다 24×24px이다. 기본값은 `md`다. */
  size?: ChoiceSize;
  /** 선택했을 때 원 색(Role). 루트에 `data-color`로 붙는다. 기본값은 `primary`다. */
  color?: Role;
  /**
   * 오류 상태. input에 `aria-invalid="true"`와 `data-invalid`가 붙고 경계가 danger 색이 된다.
   * Field·RadioGroup 안에서는 그 값을 따르고, 여기에 준 값이 이긴다.
   */
  invalid?: boolean;
  /** 루트 label의 class. 사용자 class가 기본 class를 이긴다. 상자 모양은 바꾸지 않는다(`size`·`color`가 맡는다). */
  className?: string;
  /** 루트 label의 style */
  style?: CSSProperties;
}

const boxClass: Record<ChoiceSize, string> = {
  sm: "size-4 rounded-full",
  md: "size-5 rounded-full",
};

/** 가운데 점 크기(px). 원 아이콘을 채워 그리고 선 두께 2px이 더해진다. */
const dotSize: Record<ChoiceSize, number> = { sm: 6, md: 8 };

/**
 * 네이티브 라디오 버튼. 보통 `RadioGroup` 안에 두고, 묶음이 `name`과 선택 값을 정한다.
 * 묶음 밖에서는 `name`·`checked`/`defaultChecked`·`onChange`를 직접 준다.
 */
export function Radio({
  value,
  children,
  size = "md",
  color = "primary",
  invalid,
  id,
  disabled,
  required,
  name,
  checked,
  defaultChecked,
  onChange,
  className,
  style,
  "aria-describedby": ariaDescribedBy,
  "aria-invalid": ariaInvalid,
  ...props
}: RadioProps): ReactElement {
  const group = use(RadioGroupContext);
  const control = useFieldControl({
    id,
    invalid: invalid ?? group?.invalid,
    disabled: disabled ?? group?.disabled,
    required: required ?? (group?.required || undefined),
    "aria-describedby": ariaDescribedBy,
    "aria-invalid": ariaInvalid,
  });

  // 묶음이 제어 모드면 checked, 비제어면 defaultChecked를 묶음 값으로 정한다. 둘을 함께 넘기지 않는다.
  const selection =
    group?.value !== undefined
      ? { checked: group.value === value }
      : group?.defaultValue !== undefined
        ? { defaultChecked: group.defaultValue === value }
        : checked !== undefined
          ? { checked }
          : { defaultChecked };

  const handleChange = (event: ChangeEvent<HTMLInputElement>): void => {
    onChange?.(event);
    if (event.target.checked) group?.onValueChange?.(value);
  };

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
          {...selection}
          type="radio"
          name={name ?? group?.name}
          value={value}
          onChange={handleChange}
          className={cn(boxClass[size], choiceInputClass)}
        />
        {/* 장식용 점(aria-hidden). 채운 원이라 forced-colors에서도 글자색으로 보인다. */}
        <CircleIcon
          size={dotSize[size]}
          fill="currentColor"
          data-mark="dot"
          className={cn(choiceMarkClass, "peer-checked:block")}
        />
      </span>
      {children === undefined || children === null ? null : <span>{children}</span>}
    </label>
  );
}
