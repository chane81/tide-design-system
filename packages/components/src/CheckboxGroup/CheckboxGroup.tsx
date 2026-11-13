"use client";
// Checkbox 묶음(tide-v0-impl 티켓 16). `role="group"`인 div이고 Field label·설명을 이름·설명으로 받는다.
// Field context를 읽으므로 client Component다. 선택 값은 각 Checkbox가 가진다(묶음은 값을 모으지 않는다).

import type { ComponentProps, ReactElement } from "react";

import {
  CheckboxGroupContext,
  useChoiceGroup,
  type ChoiceGroupState,
} from "../_internal/hooks/useChoiceGroup.ts";
import { cn } from "../_internal/libs/cn.ts";
import { FieldContext } from "../_internal/hooks/useFieldControl.ts";

/** 항목을 쌓는 방향 */
export type ChoiceOrientation = "vertical" | "horizontal";

export interface CheckboxGroupProps extends ComponentProps<"div"> {
  /** 항목을 세로(`vertical`)로 쌓거나 가로(`horizontal`)로 늘어놓는다. 기본값은 `vertical`이다. */
  orientation?: ChoiceOrientation;
  /**
   * 오류 상태. 안의 Checkbox마다 `aria-invalid="true"`가 붙고, 묶음에 `data-invalid`가 붙는다.
   * Field 안에서는 Field의 값을 따르고, 여기에 준 값이 이긴다.
   */
  invalid?: boolean;
  /** 안의 Checkbox를 모두 비활성으로 만든다. Field 안에서는 Field의 값을 따른다. */
  disabled?: boolean;
}

/** 방향별 배치. 가로는 줄이 넘치면 다음 줄로 간다. */
export const orientationClass: Record<ChoiceOrientation, string> = {
  vertical: "flex flex-col gap-2",
  horizontal: "flex flex-row flex-wrap gap-x-6 gap-y-2",
};

/**
 * Checkbox 여러 개를 하나의 이름으로 묶는다. `<Field label group>` 안에 두면 label이 묶음의 이름, 설명·오류가
 * 묶음의 설명이 된다. Field 밖에서는 `aria-label`이나 `aria-labelledby`를 준다.
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
