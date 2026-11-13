"use client";
// CheckboxGroup·RadioGroup이 안쪽 Checkbox·Radio에 넘기는 연결 정보(tide-v0-impl 티켓 16).
// - 묶음 자신은 Field의 `labelId`·`describedBy`를 `aria-labelledby`·`aria-describedby`로 받는다(ADR 0013 정정).
// - `aria-invalid`는 묶음이 아니라 안쪽 input 하나하나에 붙인다(group·radiogroup 역할에서는 지원이 고르지 않다).
// - 묶음은 FieldContext를 `null`로 덮어 안쪽 항목이 Field의 `controlId`를 자기 id로 쓰지 않게 한다(id 중복 방지).
// 서버 컴포넌트는 context를 만들 수 없으므로 이 client 모듈에서 만든다(hooks/useFieldControl.ts와 같다).

import { createContext, use, type Context } from "react";

import { FieldContext } from "./useFieldControl";

/** 묶음이 안쪽 항목에 넘기는 공통 상태 */
export interface ChoiceGroupState {
  readonly invalid: boolean;
  readonly disabled: boolean;
}

/** CheckboxGroup 안에서만 값이 있다. */
export const CheckboxGroupContext: Context<ChoiceGroupState | null> =
  createContext<ChoiceGroupState | null>(null);

/** RadioGroup이 안쪽 Radio에 넘기는 값. 이름과 선택 값까지 넘긴다. */
export interface RadioGroupState extends ChoiceGroupState {
  readonly name: string;
  readonly required: boolean;
  /** 제어 모드의 선택 값. 비제어면 `undefined`다. */
  readonly value: string | undefined;
  /** 비제어 모드의 처음 선택 값 */
  readonly defaultValue: string | undefined;
  readonly onValueChange: ((value: string) => void) | undefined;
}

/** RadioGroup 안에서만 값이 있다. */
export const RadioGroupContext: Context<RadioGroupState | null> =
  createContext<RadioGroupState | null>(null);

/** 묶음 Component가 받은 props 중 연결과 겹치는 것 */
export interface ChoiceGroupInput {
  readonly id?: string | undefined;
  readonly "aria-labelledby"?: string | undefined;
  readonly "aria-describedby"?: string | undefined;
  readonly invalid?: boolean | undefined;
  readonly disabled?: boolean | undefined;
  readonly required?: boolean | undefined;
}

/** 묶음 루트에 붙일 연결 props와 안쪽에 넘길 상태 */
export interface ChoiceGroupConnection {
  readonly rootProps: {
    readonly id: string | undefined;
    readonly "aria-labelledby": string | undefined;
    readonly "aria-describedby": string | undefined;
    readonly "data-invalid": "" | undefined;
    readonly "data-disabled": "" | undefined;
  };
  readonly invalid: boolean;
  readonly disabled: boolean;
  readonly required: boolean;
}

/**
 * Field 연결 정보와 묶음 자신의 props를 합친다. 묶음에 직접 준 값이 Field 값을 이긴다(useFieldControl과 같은 규칙).
 * `aria-labelledby`를 직접 주면 Field label 대신 그것을 쓴다. `aria-describedby`는 Field 것 뒤에 이어 붙인다.
 */
export function useChoiceGroup(props: ChoiceGroupInput): ChoiceGroupConnection {
  const field = use(FieldContext);
  const invalid = props.invalid ?? field?.invalid ?? false;
  const disabled = props.disabled ?? field?.disabled ?? false;
  const required = props.required ?? field?.required ?? false;

  return {
    rootProps: {
      id: props.id ?? field?.controlId,
      "aria-labelledby": props["aria-labelledby"] ?? field?.labelId,
      "aria-describedby":
        [field?.describedBy, props["aria-describedby"]].filter(Boolean).join(" ") || undefined,
      "data-invalid": invalid ? "" : undefined,
      "data-disabled": disabled ? "" : undefined,
    },
    invalid,
    disabled,
    required,
  };
}
