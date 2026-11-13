"use client";
// 값 하나를 고르는 Select(tide-v0-impl 티켓 28). React Aria hooks만 쓰고 마크업은 직접 만든다(ADR 0004).
// 근거 버전: react-aria 3.53.1(useSelect, useButton, useListBox, HiddenSelect, DismissButton, mergeProps, mergeRefs),
// react-stately 3.51.0(useSelectState). 위치·portal·motion은 오버레이 공통 부분(_internal/components/OverlayPortal.tsx, ADR 0018), 목록 class와
// 옵션 모으기는 목록 공통 부분(_internal/constants/listClass.ts, _internal/libs/listCollection.ts, ADR 0019), 옵션·묶음 그리기는 _internal/components/ListBoxNodes/ListBoxNodes.tsx를 쓴다.
//
// 구조:
// - `Select`: 루트 DOM은 트리거 `<button type="button">`이다(입력창 모양, Input과 같은 size). 그 옆에 폼 제출용 숨은
//   `<select>`(React Aria HiddenSelect, 보조기술에서 숨김)를 두고, 열리면 `document.body`에 목록을 portal한다.
// - 목록: 위치를 잡는 바깥 요소(raised 표면, 앞뒤 숨은 닫기 버튼) 안에 `role="listbox"` 요소가 있다. listbox의 자식은
//   option·group만 될 수 있어 닫기 버튼을 바깥 요소에 둔다(Popover와 같은 DismissButton).
// - `SelectItem`: `role="option"`. `value`가 고른 값이고 폼에 제출된다. `SelectSection`: 옵션 묶음(`role="group"`).

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
  /** 고른 값(제어). 고른 옵션의 `value`다. `null`이면 아무것도 고르지 않은 상태다. 주면 `onValueChange`로 바꾼다. */
  value?: string | null;
  /** 처음 고른 값(비제어). 주지 않으면 아무것도 고르지 않은 상태로 시작한다. 폼을 reset하면 이 값으로 돌아간다. */
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
  /**
   * 오류 상태. 트리거에 `aria-invalid="true"`와 `data-invalid`가 붙고 경계가 danger 색이 된다.
   * Field 안에서는 Field의 값을 따르고, 여기에 준 값이 이긴다.
   */
  invalid?: boolean;
  /**
   * 필수. 고르지 않고 폼을 제출하면 제출이 막히고 트리거로 포커스가 오며 오류 상태가 된다(브라우저 오류 말풍선은
   * 없다). 메시지는 Field의 `error`로 앱이 보여 준다. Field 안에서는 Field의 값을 따른다.
   */
  required?: boolean;
  /** `SelectItem`과 `SelectSection`. 이 요소들을 바로 아래(또는 Fragment·배열 안)에 둔다. */
  children?: ReactNode;
}

/**
 * 값 하나를 고르는 입력. 트리거를 누르거나(마우스는 누르는 순간) Enter·Space·↓·↑로 목록을 열고, 화살표·Home/End·
 * 영문 글자로 옵션을 옮겨 Enter·Space·누름으로 고른다. 닫힌 채로 글자를 치면 바로 그 옵션을 고른다.
 * 고르면 닫히고 포커스는 트리거로 돌아온다. Esc·바깥 누름·Tab으로도 닫힌다.
 * Field 안에 두면 label·설명·오류가 자동으로 연결되고, `name`을 주면 고른 값이 폼에 제출된다.
 * 상태는 `data-open`(트리거·목록), `data-invalid`(트리거), 네이티브 `:disabled`(트리거),
 * `data-highlighted`·`data-selected`·`data-disabled`(옵션)로 노출한다.
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
    // useSelectState의 children 타입은 React Stately 요소(Item·Section)지만, 같은 방식으로 getCollectionNode를 붙인
    // Tide 옵션 요소를 넘긴다(_internal/libs/listCollection.ts).
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
    // 필수 검사는 네이티브 제약 검사(숨은 select의 required)로 한다. 비면 제출을 막고 트리거로 포커스를 옮긴다.
    validationBehavior: "native",
  });
  const triggerRef = useRef<HTMLButtonElement>(null);
  // Field의 label은 이름으로(aria-labelledby), 설명·오류는 aria-describedby로 잇는다(ADR 0013). 트리거 id는
  // Field의 controlId라 label의 for와 오류 요약 링크(#id)가 트리거를 가리킨다.
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
        // useSelect(useField)는 자기 설명·오류 요소 자리의 id를 aria-describedby에 넣는다. Tide는 그 요소를 그리지 않고
        // Field가 설명·오류를 그리므로 Field 연결 값만 쓴다(서버 HTML에 없는 id를 가리키지 않게).
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
