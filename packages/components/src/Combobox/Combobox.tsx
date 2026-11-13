"use client";
// 포커스는 늘 입력에 있고 목록 위치는 가상 포커스(aria-activedescendant)로 옮긴다. 그래서 목록은 non-modal이다.

import { ChevronDownIcon } from "@tide-design/icons";
import {
  use,
  useMemo,
  useRef,
  type ComponentProps,
  type KeyboardEvent,
  type ReactElement,
  type ReactNode,
} from "react";
// 서브패스 말고 루트 entry에서 import한다. Vite 사전 번들 목록이 바뀌지 않게 한다.
import { mergeProps, mergeRefs, useButton, useComboBox, useFilter } from "react-aria";
import { useComboBoxState } from "react-stately";

import { inputBaseClass, inputSizeClass, type InputSize } from "../_internal/constants/inputClass";
import { FieldContext, useFieldControl } from "../_internal/hooks/useFieldControl";
import { cn } from "../_internal/libs/cn";
import { resolveCollectionChildren } from "../_internal/libs/listCollection";
import { ComboboxPopover } from "./components/ComboboxPopover";
import {
  buttonClass,
  buttonSizeClass,
  inputEndClass,
  wrapperClass,
} from "./constants/comboboxClass";

export interface ComboboxProps extends Omit<
  ComponentProps<"input">,
  "value" | "defaultValue" | "onChange" | "type" | "size" | "children" | "name" | "form" | "list"
> {
  /** 고른 값(제어). 고른 옵션의 `value`다. `null`이면 아무것도 고르지 않은 상태다. 주면 `onValueChange`로 바꾼다. */
  value?: string | null;
  /** 처음 고른 값(비제어). 입력에 그 옵션의 글자가 보인다. 폼을 reset하면 이 값으로 돌아간다. */
  defaultValue?: string;
  /** 고른 값이 바뀌면 부른다. 옵션을 고르면 그 `value`로, 사용자가 입력을 모두 지우면 `null`로 부른다. */
  onValueChange?: (value: string | null) => void;
  /** 목록이 열리거나 닫힐 때 새 상태로 부른다. 열림 상태는 입력이 정하므로 제어할 수 없다. */
  onOpenChange?: (open: boolean) => void;
  /** 거른 결과가 없을 때 목록에 보이는 글자. 기본값은 `"결과가 없습니다"`다. */
  emptyMessage?: ReactNode;
  /** 폼 제출 이름. 숨은 input에 붙어 고른 옵션의 `value`가 이 이름으로 제출된다(입력한 글자는 제출되지 않는다). */
  name?: string;
  /** 숨은 input이 속할 `<form>`의 id. 폼 밖에 둘 때 쓴다. */
  form?: string;
  /** 높이 `sm` 32px, `md` 40px, `lg` 48px. 같은 size의 Input·Select·Button과 높이가 같다. 기본값은 `md`다. */
  size?: InputSize;
  /** 오류 상태. 입력에 `aria-invalid="true"`와 `data-invalid`가 붙는다. Field 안에서는 여기 준 값이 이긴다. */
  invalid?: boolean;
  /**
   * 필수. 비어 있으면 제출이 막히고 입력으로 포커스가 오며 오류 상태가 된다(브라우저 말풍선 없음).
   * 메시지는 Field `error`로 보여 준다. Field 안에서는 Field의 값을 따른다.
   */
  required?: boolean;
  /** `ComboboxItem`과 `ComboboxSection`. 이 요소들을 바로 아래(또는 Fragment·배열 안)에 둔다. */
  children?: ReactNode;
}

// Safari는 조합을 끝내는 Enter keydown이 compositionend 뒤에 `isComposing: false`로 오지만 keyCode가 229라 둘 다 본다.
const isComposingKey = (event: KeyboardEvent): boolean =>
  event.nativeEvent.isComposing || event.keyCode === 229;

/**
 * 글자를 쳐서 옵션을 거르고 하나를 고르는 입력. 포커스가 나가면 고르지 않은 글자는 지워진다(자유 입력 없음).
 * Field 안에 두면 label·설명·오류가 연결되고, `name`을 주면 고른 옵션의 `value`가 제출된다.
 */
export function Combobox({
  value,
  defaultValue,
  onValueChange,
  onOpenChange,
  emptyMessage = "결과가 없습니다",
  name,
  form,
  size = "md",
  invalid,
  disabled,
  required,
  readOnly,
  id,
  ref,
  className,
  children,
  "aria-describedby": ariaDescribedBy,
  "aria-invalid": ariaInvalid,
  "aria-label": ariaLabel,
  "aria-labelledby": ariaLabelledBy,
  ...props
}: ComboboxProps): ReactElement {
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
  const { contains } = useFilter({ sensitivity: "base" });
  const state = useComboBoxState<object>({
    // 타입은 React Stately Item·Section이지만, getCollectionNode를 붙인 Tide 옵션 요소를 넘긴다(ADR 0019).
    children: items as unknown as Parameters<typeof useComboBoxState<object>>[0]["children"],
    defaultFilter: contains,
    value,
    defaultValue,
    onChange: (key) => onValueChange?.(key == null ? null : String(key)),
    onOpenChange: (open) => onOpenChange?.(open),
    allowsEmptyCollection: true,
    isDisabled,
    isReadOnly: readOnly,
    isRequired,
    validationBehavior: "native",
  });
  const inputRef = useRef<HTMLInputElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const popoverRef = useRef<HTMLDivElement>(null);
  const listBoxRef = useRef<HTMLDivElement>(null);
  // labelId를 aria-labelledby로도 넘겨 목록·버튼의 이름에 쓴다(입력은 `<label for>`로 이름을 받는다).
  const { inputProps, buttonProps, listBoxProps, isInvalid } = useComboBox<object>(
    {
      inputRef,
      buttonRef,
      popoverRef,
      listBoxRef,
      id: control.id,
      "aria-label": ariaLabel,
      "aria-labelledby": ariaLabelledBy ?? field?.labelId,
      isDisabled,
      isReadOnly: readOnly,
      isRequired,
      validationBehavior: "native",
    },
    state,
  );
  const { buttonProps: chevronProps } = useButton(buttonProps, buttonRef);
  const mergedRef = useMemo(() => mergeRefs(ref, inputRef), [ref, inputRef]);
  const showInvalid = control["data-invalid"] === "" || isInvalid;
  const { onKeyDown: ariaKeyDown, ...ariaInputProps } = inputProps;

  return (
    <div className={wrapperClass}>
      <input
        {...mergeProps(props, ariaInputProps)}
        ref={mergedRef}
        // IME 조합 중의 키는 React Aria에 넘기지 않는다. 조합을 끝내는 Enter가 옵션을 고르지 않게 한다.
        onKeyDown={(event) => {
          props.onKeyDown?.(event);
          if (!isComposingKey(event)) ariaKeyDown?.(event);
        }}
        // useComboBox는 그리지 않는 자기 설명·오류 요소의 id를 넣으므로, Field가 연결한 값만 쓴다.
        aria-describedby={control["aria-describedby"]}
        aria-invalid={showInvalid ? true : control["aria-invalid"]}
        data-invalid={showInvalid ? "" : undefined}
        data-open={state.isOpen ? "" : undefined}
        className={cn(inputSizeClass[size], inputBaseClass, inputEndClass[size], className)}
      />
      <button {...chevronProps} ref={buttonRef} className={cn(buttonClass, buttonSizeClass[size])}>
        <ChevronDownIcon size={16} />
      </button>
      {name !== undefined && (
        <input
          type="hidden"
          name={name}
          form={form}
          value={state.selectedKey == null ? "" : String(state.selectedKey)}
          disabled={isDisabled}
        />
      )}
      <ComboboxPopover
        state={state}
        inputRef={inputRef}
        popoverRef={popoverRef}
        listBoxRef={listBoxRef}
        listBoxProps={listBoxProps}
        emptyMessage={emptyMessage}
      />
    </div>
  );
}
