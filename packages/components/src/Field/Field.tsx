// "use client"를 두지 않는다. 서버 컴포넌트도 useId와 client 모듈이 만든 context provider를 쓸 수 있다(React 19).

import { CircleExclamationPointIcon } from "@tide-design/icons";
import { useId, type ComponentProps, type ReactElement, type ReactNode } from "react";

import { cn } from "../_internal/libs/cn";
import { FieldContext, type FieldContextValue } from "../_internal/hooks/useFieldControl";

export interface FieldProps extends ComponentProps<"div"> {
  /** 입력창의 이름이 되는 label. 화면에 보인다. */
  label: ReactNode;
  /** 입력창 아래에 보이는 설명. 입력창의 `aria-describedby`로 연결된다. */
  description?: ReactNode;
  /** 오류 메시지. 오류 상태일 때만 보이고 입력창의 `aria-describedby`로 연결된다. */
  error?: ReactNode;
  /** 오류 상태. 기본값은 `error`가 있으면 `true`. `false`를 주면 `error`가 있어도 숨긴다. */
  invalid?: boolean;
  /** 필수 입력. 입력창에 네이티브 `required`가 붙고 label 뒤에 `*`가 보인다(스크린리더는 `required`로 읽는다). */
  required?: boolean;
  /** 비활성. 입력창에 네이티브 `disabled`가 붙는다. */
  disabled?: boolean;
  /** label이 가리킬 입력창 id. 주지 않으면 자동으로 만든다. 오류 요약에서 `#id`로 링크할 때 쓴다. `group`이면 묶음의 id다. */
  htmlFor?: string;
  /** 안에 둔 것이 묶음(`CheckboxGroup`, `RadioGroup`)일 때 `true`. 기본값 `false`. 묶음이 `aria-labelledby`로 label을 쓴다. */
  group?: boolean;
  /** 입력 Component 하나(Input, Textarea, CheckboxGroup, RadioGroup 등) */
  children: ReactNode;
}

const hasContent = (node: ReactNode): boolean =>
  node !== undefined && node !== null && node !== false && node !== "";

/**
 * 입력 Component에 label, 설명, 오류 메시지를 붙이고 `id`·`aria-describedby`·`aria-invalid`·`required`·`disabled`를
 * 자동으로 연결한다. 서버 컴포넌트로 쓸 수 있다.
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
      {/* label for는 입력 요소 하나만 가리키므로 묶음은 aria-labelledby로 이 요소를 가리킨다(ADR 0013). */}
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
          {/* 색만으로 오류를 알리지 않도록 아이콘을 함께 둔다. */}
          <CircleExclamationPointIcon size={16} className="mt-0.5 shrink-0" />
          <span>{error}</span>
        </p>
      ) : null}
    </div>
  );
}
