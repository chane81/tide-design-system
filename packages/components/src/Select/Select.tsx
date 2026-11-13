"use client";
import { ChevronDownIcon } from "@tide-design/icons";
import {
  use,
  useMemo,
  useRef,
  type ComponentProps,
  type ReactElement,
  type ReactNode,
} from "react";
// 루트 entry에서 import한다(Popover.tsx 참고).
import { HiddenSelect, mergeProps, mergeRefs, useButton, useSelect } from "react-aria";
import { useSelectState } from "react-stately";

import { inputBaseClass, inputSizeClass, type InputSize } from "../_internal/constants/inputClass";
import { FieldContext, useFieldControl } from "../_internal/hooks/useFieldControl";
import { cn } from "../_internal/libs/cn";
import { resolveCollectionChildren } from "../_internal/libs/listCollection";
import { SelectPopover } from "./components/SelectPopover";
import { chevronClass, placeholderClass, triggerClass, valueClass } from "./constants/selectClass";

export interface SelectProps extends Omit<
  ComponentProps<"button">,
  "value" | "defaultValue" | "onChange" | "type" | "size" | "children" | "name" | "form"
> {
  /** 고른 옵션의 `value`(제어). `null`이면 아무것도 고르지 않은 상태다. */
  value?: string | null;
  /** 처음 고른 값(비제어). 폼을 reset하면 이 값으로 돌아간다. */
  defaultValue?: string;
  /** 사용자가 다른 옵션을 고르면 그 옵션의 `value`로 부른다. */
  onValueChange?: (value: string) => void;
  /** 목록 열림 상태(제어). 주면 `onOpenChange`로 바꾼다. */
  open?: boolean;
  /** 처음 목록 열림 상태(비제어). 기본값은 `false`다. */
  defaultOpen?: boolean;
  /** 목록 열림 상태가 바뀌려 할 때 새 값으로 부른다. 옵션을 골라 닫힐 때도 부른다. */
  onOpenChange?: (open: boolean) => void;
  /** 폼 제출 이름. 숨은 `<select>`에 붙어 고른 값이 이 이름으로 제출된다(트리거 버튼에는 붙지 않는다). */
  name?: string;
  /** 숨은 `<select>`가 속할 `<form>`의 id. 폼 밖에 둘 때 쓴다. */
  form?: string;
  /** 브라우저 자동 완성 힌트. 숨은 `<select>`에 붙는다. */
  autoComplete?: string;
  /** 아무것도 고르지 않았을 때 트리거에 보이는 글자. 기본값은 `"선택하세요"`다. */
  placeholder?: string;
  /** 높이 `sm` 32px, `md` 40px, `lg` 48px. 같은 size의 Input·Button과 높이가 같다. 기본값은 `md`다. */
  size?: InputSize;
  /** 오류 상태. 트리거에 `aria-invalid="true"`와 `data-invalid`가 붙는다. Field 값보다 여기 준 값이 이긴다. */
  invalid?: boolean;
  /** 필수. 비운 채 제출하면 막고 트리거로 포커스를 옮긴다(브라우저 말풍선 없음, 메시지는 Field `error`). */
  required?: boolean;
  /** `SelectItem`과 `SelectSection`. 이 요소들을 바로 아래(또는 Fragment·배열 안)에 둔다. */
  children?: ReactNode;
}

/**
 * 값 하나를 고르는 입력. 루트 DOM은 트리거 `<button>`이고 목록은 `document.body`에 portal한다.
 * Field 안에 두면 label·설명·오류가 자동으로 연결되고, `name`을 주면 고른 값이 폼에 제출된다.
 */
export function Select({
  value,
  defaultValue,
  onValueChange,
  open,
  defaultOpen,
  onOpenChange,
  name,
  form,
  autoComplete,
  placeholder = "선택하세요",
  size = "md",
  invalid,
  disabled,
  required,
  id,
  ref,
  className,
  children,
  "aria-describedby": ariaDescribedBy,
  "aria-invalid": ariaInvalid,
  "aria-label": ariaLabel,
  "aria-labelledby": ariaLabelledBy,
  ...props
}: SelectProps): ReactElement {
  const field = use(FieldContext);
  const control = useFieldControl({
    id,
    invalid,
    disabled,
    required,
    "aria-describedby": ariaDescribedBy,
    "aria-invalid": ariaInvalid,
  });
  const isDisabled = control.disabled ?? false;
  const isRequired = control.required ?? false;
  const items = useMemo(() => resolveCollectionChildren(children), [children]);
  // 컬렉션 key가 옵션 value(문자열)라 고른 값이 곧 key다(valueItemCollectionNode).
  const state = useSelectState<object>({
    // 타입은 React Stately Item·Section이지만, getCollectionNode를 같은 방식으로 붙인 Tide 옵션을 넘긴다(ADR 0019).
    children: items as unknown as Parameters<typeof useSelectState<object>>[0]["children"],
    value,
    defaultValue,
    onChange: (key) => {
      if (key != null) onValueChange?.(String(key));
    },
    isOpen: open,
    defaultOpen,
    onOpenChange,
    isDisabled,
    isRequired,
    // 필수 검사는 숨은 select의 네이티브 제약 검사로 한다.
    validationBehavior: "native",
  });
  const triggerRef = useRef<HTMLButtonElement>(null);
  // 트리거 id가 Field의 controlId라 label의 for와 오류 요약 링크(#id)가 트리거를 가리킨다(ADR 0013).
  const { triggerProps, valueProps, menuProps, hiddenSelectProps, isInvalid } = useSelect<object>(
    {
      id: control.id,
      "aria-label": ariaLabel,
      "aria-labelledby": ariaLabelledBy ?? field?.labelId,
      isDisabled,
      isRequired,
      validationBehavior: "native",
      name,
      form,
      autoComplete,
    },
    state,
    triggerRef,
  );
  const { buttonProps } = useButton(triggerProps, triggerRef);
  const mergedRef = useMemo(() => mergeRefs(ref, triggerRef), [ref, triggerRef]);
  // 앱·Field가 정한 오류 상태, 또는 필수인데 비어 제출이 막힌 상태(React Aria 네이티브 검사 결과)
  const showInvalid = control["data-invalid"] === "" || isInvalid;
  const selected = state.selectedItem;

  return (
    <>
      <button
        {...mergeProps(props, buttonProps)}
        ref={mergedRef}
        // useSelect는 그리지 않는 설명·오류 요소 id를 넣으므로 Field 연결 값만 쓴다(없는 id를 가리키지 않게).
        aria-describedby={control["aria-describedby"]}
        aria-invalid={showInvalid ? true : control["aria-invalid"]}
        data-invalid={showInvalid ? "" : undefined}
        data-open={state.isOpen ? "" : undefined}
        className={cn(inputSizeClass[size], inputBaseClass, triggerClass, className)}
      >
        <span {...valueProps} className={cn(valueClass, !selected && placeholderClass)}>
          {selected ? selected.rendered : placeholder}
        </span>
        <ChevronDownIcon size={16} className={chevronClass} />
      </button>
      <HiddenSelect {...hiddenSelectProps} autoComplete={autoComplete} />
      <SelectPopover state={state} triggerRef={triggerRef} menuProps={menuProps} />
    </>
  );
}
