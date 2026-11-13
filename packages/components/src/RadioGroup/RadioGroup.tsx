"use client";
// Radio 묶음(tide-v0-impl 티켓 16). `role="radiogroup"`인 div이고 Field label·설명을 이름·설명으로 받는다.
// 안의 Radio에 같은 `name`을 넘겨 네이티브 라디오 묶음(화살표 이동, 하나만 선택)을 만든다.
// 선택 값은 spec 공통 규칙대로 `value`/`defaultValue`/`onValueChange(value)`다. context를 읽으므로 client Component다.

import { useId, type ComponentProps, type ReactElement } from "react";

import { orientationClass, type ChoiceOrientation } from "../CheckboxGroup/CheckboxGroup.tsx";
import {
  RadioGroupContext,
  useChoiceGroup,
  type RadioGroupState,
} from "../hooks/useChoiceGroup.ts";
import { cn } from "../libs/cn.ts";
import { FieldContext } from "../hooks/useFieldControl.ts";

export interface RadioGroupProps extends Omit<ComponentProps<"div">, "defaultValue"> {
  /** 안의 Radio가 함께 쓰는 `name`. form에 이 이름으로 제출된다. 주지 않으면 자동으로 만든다. */
  name?: string;
  /** 선택된 Radio의 값(제어). `onValueChange`와 함께 쓴다. */
  value?: string;
  /** 처음 선택된 Radio의 값(비제어). */
  defaultValue?: string;
  /** 선택이 바뀌면 새 값 하나로 불린다. */
  onValueChange?: (value: string) => void;
  /** 항목을 세로(`vertical`)로 쌓거나 가로(`horizontal`)로 늘어놓는다. 기본값은 `vertical`이다. 화살표 키는 둘 다 동작한다. */
  orientation?: ChoiceOrientation;
  /**
   * 오류 상태. 안의 Radio마다 `aria-invalid="true"`가 붙고, 묶음에 `data-invalid`가 붙는다.
   * Field 안에서는 Field의 값을 따르고, 여기에 준 값이 이긴다.
   */
  invalid?: boolean;
  /** 안의 Radio를 모두 비활성으로 만든다. Field 안에서는 Field의 값을 따른다. */
  disabled?: boolean;
  /** 하나를 꼭 골라야 한다. 안의 Radio에 네이티브 `required`가 붙고 묶음에 `aria-required`가 붙는다. */
  required?: boolean;
}

/**
 * Radio 여러 개를 하나의 이름과 선택 값으로 묶는다. `<Field label group>` 안에 두면 label이 묶음의 이름,
 * 설명·오류가 묶음의 설명이 된다. Field 밖에서는 `aria-label`이나 `aria-labelledby`를 준다.
 */
export function RadioGroup({
  name,
  value,
  defaultValue,
  onValueChange,
  orientation = "vertical",
  invalid,
  disabled,
  required,
  id,
  className,
  children,
  "aria-labelledby": ariaLabelledBy,
  "aria-describedby": ariaDescribedBy,
  ...props
}: RadioGroupProps): ReactElement {
  const autoName = useId();
  const connection = useChoiceGroup({
    id,
    invalid,
    disabled,
    required,
    "aria-labelledby": ariaLabelledBy,
    "aria-describedby": ariaDescribedBy,
  });
  const state: RadioGroupState = {
    name: name ?? autoName,
    value,
    defaultValue,
    onValueChange,
    invalid: connection.invalid,
    disabled: connection.disabled,
    required: connection.required,
  };

  return (
    <div
      role="radiogroup"
      aria-required={connection.required || undefined}
      {...props}
      {...connection.rootProps}
      className={cn(orientationClass[orientation], className)}
    >
      {/* 안쪽 항목이 Field의 controlId를 자기 id로 쓰지 않게 Field 연결을 끊는다. */}
      <FieldContext value={null}>
        <RadioGroupContext value={state}>{children}</RadioGroupContext>
      </FieldContext>
    </div>
  );
}
