"use client";
import { useId, type ComponentProps, type ReactElement } from "react";

import { orientationClass, type ChoiceOrientation } from "../_internal/constants/choiceGroupClass";
import {
  RadioGroupContext,
  useChoiceGroup,
  type RadioGroupState,
} from "../_internal/hooks/useChoiceGroup";
import { cn } from "../_internal/libs/cn";
import { FieldContext } from "../_internal/hooks/useFieldControl";

export interface RadioGroupOwnProps {
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

export interface RadioGroupProps
  extends RadioGroupOwnProps, Omit<ComponentProps<"div">, keyof RadioGroupOwnProps> {}

/**
 * Radio 여러 개를 하나의 이름과 선택 값으로 묶는다. `<Field label group>` 안에 두면 label이 묶음의 이름,
 * 설명·오류가 묶음의 설명이 된다. Field 밖에서는 `aria-label`이나 `aria-labelledby`를 준다.
 * Tide props: `name`, `value`, `defaultValue`, `onValueChange`, `orientation`, `invalid`, `disabled`, `required` ({@link RadioGroupOwnProps}). 나머지는 `<div>` 속성.
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
