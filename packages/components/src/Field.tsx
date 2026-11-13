// label, 설명, 오류 메시지를 입력 Component에 붙이고 id·aria-describedby·aria-invalid를 연결한다(tide-v0-impl 티켓 15).
// 이 파일은 "use client"가 없다. useId는 async가 아닌 서버 컴포넌트에서도 쓸 수 있고(react.dev useId 「Caveats」),
// 서버 컴포넌트는 client 모듈이 만든 context를 provider로 렌더할 수 있다(react.dev 「Server Components」). React 19.3.1.
// 값을 읽는 쪽(Input, Textarea)만 client Component다.

import { CircleExclamationPointIcon } from "@tide-design/icons";
import { useId, type ComponentProps, type ReactElement, type ReactNode } from "react";

import { cn } from "./libs/cn.ts";
import { FieldContext, type FieldContextValue } from "./hooks/useFieldControl.ts";

export interface FieldProps extends ComponentProps<"div"> {
  /** 입력창의 이름이 되는 label. 화면에 보인다. */
  label: ReactNode;
  /** 입력창 아래에 보이는 설명. 입력창의 `aria-describedby`로 연결된다. */
  description?: ReactNode;
  /** 오류 메시지. 오류 상태일 때만 보이고 입력창의 `aria-describedby`로 연결된다. */
  error?: ReactNode;
  /**
   * 오류 상태. 기본값은 `error`가 있으면 `true`다.
   * 입력창에 `aria-invalid="true"`와 `data-invalid`가 붙는다. `false`를 주면 `error`가 있어도 숨긴다.
   */
  invalid?: boolean;
  /** 필수 입력. 입력창에 네이티브 `required`가 붙고 label 뒤에 `*`가 보인다(스크린리더는 `required`로 읽는다). */
  required?: boolean;
  /** 비활성. 입력창에 네이티브 `disabled`가 붙는다. */
  disabled?: boolean;
  /** label이 가리킬 입력창 id. 주지 않으면 자동으로 만든다. 오류 요약에서 `#id`로 링크할 때 쓴다. `group`이면 묶음의 id다. */
  htmlFor?: string;
  /**
   * 안에 둔 것이 묶음(`CheckboxGroup`, `RadioGroup`)일 때 `true`로 준다. 기본값은 `false`다.
   * label이 `<label for>` 대신 `for` 없는 요소가 되고, 묶음이 `aria-labelledby`로 이 label을 이름으로 쓴다.
   */
  group?: boolean;
  /** 입력 Component 하나(Input, Textarea, CheckboxGroup, RadioGroup 등) */
  children: ReactNode;
}

/** 값이 화면에 그릴 내용인지(null·undefined·false·빈 문자열이 아닌지) */
const hasContent = (node: ReactNode): boolean =>
  node !== undefined && node !== null && node !== false && node !== "";

/**
 * 입력 Component에 label, 설명, 오류 메시지를 붙인다. 안의 Input·Textarea에 `id`, `aria-describedby`,
 * `aria-invalid`, `required`, `disabled`가 자동으로 연결된다. 묶음(CheckboxGroup·RadioGroup)은 `group`과 함께 쓴다.
 * 서버 컴포넌트로 쓸 수 있다.
 */
export function Field({
  label,
  description,
  error,
  invalid,
  required = false,
  disabled = false,
  htmlFor,
  group = false,
  className,
  children,
  ...props
}: FieldProps): ReactElement {
  const baseId = useId();
  const controlId = htmlFor ?? `${baseId}-control`;
  const labelId = `${baseId}-label`;
  const descriptionId = `${baseId}-description`;
  const errorId = `${baseId}-error`;

  const isInvalid = invalid ?? hasContent(error);
  const showDescription = hasContent(description);
  const showError = isInvalid && hasContent(error);

  const value: FieldContextValue = {
    controlId,
    labelId,
    // 설명 다음에 오류를 읽는다. 화면 순서와 같다.
    describedBy:
      [showDescription ? descriptionId : undefined, showError ? errorId : undefined]
        .filter(Boolean)
        .join(" ") || undefined,
    invalid: isInvalid,
    disabled,
    required,
  };

  const labelContent = (
    <>
      {label}
      {required ? (
        <span aria-hidden="true" className="ms-0.5 text-danger">
          *
        </span>
      ) : null}
    </>
  );

  return (
    <div
      {...props}
      data-invalid={isInvalid ? "" : undefined}
      data-disabled={disabled ? "" : undefined}
      className={cn("flex flex-col gap-1.5", className)}
    >
      {/* 묶음은 label 요소로 이름을 붙일 수 없다(label for는 입력 요소 하나만 가리킨다). for 없는 요소를 두고
          묶음이 aria-labelledby로 가리킨다(ADR 0013 정정, 티켓 16). */}
      {group ? (
        <span id={labelId} className="text-label-md text-default">
          {labelContent}
        </span>
      ) : (
        <label id={labelId} htmlFor={controlId} className="text-label-md text-default">
          {labelContent}
        </label>
      )}
      <FieldContext value={value}>{children}</FieldContext>
      {showDescription ? (
        <p id={descriptionId} className="text-body-sm text-muted">
          {description}
        </p>
      ) : null}
      {showError ? (
        <p id={errorId} className="flex items-start gap-1 text-body-sm text-danger">
          {/* 색만으로 오류를 알리지 않도록 아이콘을 함께 둔다. 장식용이라 숨긴다(이름 없는 아이콘은 aria-hidden). */}
          <CircleExclamationPointIcon size={16} className="mt-0.5 shrink-0" />
          <span>{error}</span>
        </p>
      ) : null}
    </div>
  );
}
