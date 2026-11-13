"use client";

import type { ComponentProps, ReactElement } from "react";

import {
  CheckboxGroupContext,
  useChoiceGroup,
  type ChoiceGroupState,
} from "../_internal/hooks/useChoiceGroup";
import { cn } from "../_internal/libs/cn";
import { FieldContext } from "../_internal/hooks/useFieldControl";
import { orientationClass, type ChoiceOrientation } from "../_internal/constants/choiceGroupClass";

export type { ChoiceOrientation } from "../_internal/constants/choiceGroupClass";

export interface CheckboxGroupProps extends ComponentProps<"div"> {
  /** 항목을 세로(`vertical`)로 쌓거나 가로(`horizontal`)로 늘어놓는다. 기본값은 `vertical`이다. */
  orientation?: ChoiceOrientation;
  /** 오류 상태. 안의 Checkbox마다 `aria-invalid="true"`, 묶음에 `data-invalid`. Field 안에서는 여기 준 값이 이긴다. */
  invalid?: boolean;
  /** 안의 Checkbox를 모두 비활성으로 만든다. Field 안에서는 Field의 값을 따른다. */
  disabled?: boolean;
}

/**
 * Checkbox 여러 개를 하나의 이름으로 묶는다. 값은 각 Checkbox가 가진다(묶음은 값을 모으지 않는다).
 * `<Field label group>` 안에서는 Field label·설명이 이름·설명이 되고, 밖에서는 `aria-label`·`aria-labelledby`를 준다.
 */
export function CheckboxGroup({
  orientation = "vertical",
  invalid,
  disabled,
  id,
  className,
  children,
  "aria-labelledby": ariaLabelledBy,
  "aria-describedby": ariaDescribedBy,
  ...props
}: CheckboxGroupProps): ReactElement {
  const connection = useChoiceGroup({
    id,
    invalid,
    disabled,
    "aria-labelledby": ariaLabelledBy,
    "aria-describedby": ariaDescribedBy,
  });
  const state: ChoiceGroupState = { invalid: connection.invalid, disabled: connection.disabled };

  return (
    <div
      role="group"
      {...props}
      {...connection.rootProps}
      className={cn(orientationClass[orientation], className)}
    >
      {/* 안쪽 항목이 Field의 controlId를 자기 id로 쓰지 않게 Field 연결을 끊는다. */}
      <FieldContext value={null}>
        <CheckboxGroupContext value={state}>{children}</CheckboxGroupContext>
      </FieldContext>
    </div>
  );
}
