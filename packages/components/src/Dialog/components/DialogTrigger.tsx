"use client";
import {
  createElement,
  useId,
  useLayoutEffect,
  useMemo,
  type ComponentProps,
  type ReactElement,
} from "react";
// 루트 entry에서 import한다(Popover.tsx 참고: Vite 사전 번들 목록이 바뀌지 않는다).
import { mergeProps, mergeRefs, usePress } from "react-aria";

import { useDialogContext } from "../../_internal/hooks/useDialogContext";
import { renderElement } from "../../_internal/libs/renderElement";

export interface DialogTriggerProps extends ComponentProps<"button"> {
  /**
   * 다른 요소로 렌더한다. 예: `render={<Button variant="outline" />}`, `render={<IconButton aria-label="삭제" />}`.
   * props, ref, className, 이벤트 핸들러를 그 요소에 병합한다. 기본은 class 없는 `<button type="button">`이다.
   */
  render?: ReactElement;
}

/**
 * Dialog를 여는 버튼. 누르면(마우스, 터치, Enter, Space) 연다. 열린 동안은 바깥이 inert라 다시 누를 수 없다.
 * `aria-expanded`, 열렸을 때 `aria-controls`와 `data-open`이 붙는다.
 */
export function DialogTrigger({
  render,
  ref,
  id,
  className,
  ...props
}: DialogTriggerProps): ReactElement {
  const { state, triggerRef, triggerProps, setTriggerId } = useDialogContext("DialogTrigger");
  const { onPress, ...ariaProps } = triggerProps;
  // 트리거가 render로 다른 요소가 되므로 useButton 대신 press 동작만 붙인다.
  const { pressProps } = usePress({ onPress, ref: triggerRef });
  const mergedRef = useMemo(() => mergeRefs(ref, triggerRef), [ref, triggerRef]);
  const generatedId = useId();
  const resolvedId = id ?? generatedId;
  // 내용에 이름이 없을 때 트리거 글자를 이름으로 쓰려고 id를 알린다. 트리거가 빠지면 지운다.
  useLayoutEffect(() => {
    setTriggerId(resolvedId);

    return () => setTriggerId(null);
  }, [resolvedId, setTriggerId]);

  const merged = {
    ...mergeProps(props, ariaProps, pressProps),
    id: resolvedId,
    ref: mergedRef,
    "data-open": state.isOpen ? "" : undefined,
  };
  if (!render) {
    return createElement("button", { type: "button", ...merged, className });
  }

  return renderElement({
    defaultElement: "button",
    render,
    baseClassName: "",
    props: { ...merged, className },
  });
}
