"use client";
// Field와 그 안의 입력 Component가 함께 쓰는 연결 정보(tide-v0-impl 티켓 15).
// 서버 컴포넌트는 context를 만들 수 없으므로 context는 이 client 모듈에서 만든다.
// 서버 컴포넌트인 Field는 이 context를 provider로 렌더만 하고, 값은 client Component(Input, Textarea)가 읽는다
// (react.dev 「Server Components」 Rendering a context provider in a Server Component, React 19.3.1).
//
// 이후 Select·Combobox(useSelect, useComboBox)도 이 값을 읽어 연결한다. CheckboxGroup·RadioGroup은 티켓 16에서 연결했다.
// - 단일 입력: `controlId`를 자기 id로 쓰면 Field의 `<label htmlFor>`가 이름이 된다.
// - 묶음·버튼형 트리거: `labelId`를 `aria-labelledby`로 쓴다. 묶음이면 Field에 `group`을 줘 label이 `for` 없는 요소가 된다.
// - 설명·오류: `describedBy`를 자기 `aria-describedby` 앞에 붙인다.

import { createContext, use, type Context } from "react";

/** Field가 안쪽 입력 Component에 넘기는 연결 정보 */
export interface FieldContextValue {
  /** label이 가리키는 입력 요소의 id */
  readonly controlId: string;
  /** label 요소의 id. `aria-labelledby`로 이름을 붙일 때 쓴다. */
  readonly labelId: string;
  /** 설명과(오류 상태라면) 오류 메시지 id를 공백으로 이은 값. 둘 다 없으면 `undefined`다. */
  readonly describedBy: string | undefined;
  readonly invalid: boolean;
  readonly disabled: boolean;
  readonly required: boolean;
}

/** Field 밖에서는 `null`이다. */
export const FieldContext: Context<FieldContextValue | null> =
  createContext<FieldContextValue | null>(null);

/** 입력 Component가 받은 props 중 Field 연결과 겹치는 것 */
export interface FieldControlInput {
  readonly id?: string | undefined;
  readonly "aria-describedby"?: string | undefined;
  readonly "aria-invalid"?: boolean | "true" | "false" | "grammar" | "spelling" | undefined;
  readonly invalid?: boolean | undefined;
  readonly disabled?: boolean | undefined;
  readonly required?: boolean | undefined;
}

/** 입력 요소에 붙일 연결 props */
export interface FieldControlProps {
  readonly id: string | undefined;
  readonly "aria-describedby": string | undefined;
  readonly "aria-invalid": boolean | "true" | "false" | "grammar" | "spelling" | undefined;
  readonly "data-invalid": "" | undefined;
  readonly disabled: boolean | undefined;
  readonly required: boolean | undefined;
}

/**
 * Field 연결 정보와 입력 Component 자신의 props를 합친다.
 * 입력 Component에 직접 준 값(id, disabled 등)이 Field 값보다 이긴다. `aria-describedby`는 Field 것 뒤에 이어 붙인다.
 */
export function useFieldControl(props: FieldControlInput): FieldControlProps {
  const field = use(FieldContext);
  const invalid = props.invalid ?? field?.invalid ?? false;
  const describedBy =
    [field?.describedBy, props["aria-describedby"]].filter(Boolean).join(" ") || undefined;

  return {
    id: props.id ?? field?.controlId,
    "aria-describedby": describedBy,
    "aria-invalid": invalid ? true : props["aria-invalid"],
    "data-invalid": invalid ? "" : undefined,
    disabled: (props.disabled ?? field?.disabled) || undefined,
    required: (props.required ?? field?.required) || undefined,
  };
}
