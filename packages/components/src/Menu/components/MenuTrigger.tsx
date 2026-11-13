"use client";
import {
  createElement,
  useLayoutEffect,
  useMemo,
  type ComponentProps,
  type ReactElement,
} from "react";
// 루트 entry에서 import한다(Popover.tsx 참고).
import { mergeProps, mergeRefs, usePress } from "react-aria";

import { renderElement } from "../../_internal/libs/renderElement.ts";
import { useMenuContext } from "../hooks/useMenuContext.ts";

export interface MenuTriggerProps extends ComponentProps<"button"> {
  /**
   * 다른 요소로 렌더한다. 예: `render={<Button variant="outline" />}`, `render={<IconButton aria-label="더보기" />}`.
   * props, ref, className, 이벤트 핸들러를 그 요소에 병합한다. 기본은 class 없는 `<button type="button">`이다.
   */
  render?: ReactElement;
}

/**
 * Menu를 여는 버튼. 마우스는 누르는 순간 열고, 키보드는 Enter·Space·↓로 열어 첫 항목에, ↑로 열어 마지막 항목에
 * 위치한다. `aria-haspopup`, `aria-expanded`, 열렸을 때 `aria-controls`와 `data-open`이 붙는다.
 */
export function MenuTrigger({
  render,
  ref,
  id,
  className,
  ...props
}: MenuTriggerProps): ReactElement {
  const { state, triggerRef, menuTriggerProps, triggerId, setTriggerId } =
    useMenuContext("MenuTrigger");
  // useMenuTrigger의 누름 props(onPressStart·onPress·preventFocusOnPress)는 React Aria press 이벤트다. 트리거는
  // render로 Tide Button 등 다른 요소가 되므로 useButton 대신 press 동작만 usePress로 붙인다(Popover와 같다).
  // id는 아래에서 앱 id 또는 Menu가 만든 id로 정한다.
  const {
    onPressStart,
    onPress,
    preventFocusOnPress,
    id: _ariaId,
    isDisabled: _isDisabled,
    ...ariaProps
  } = menuTriggerProps;
  const { pressProps } = usePress({ onPressStart, onPress, preventFocusOnPress, ref: triggerRef });
  const mergedRef = useMemo(() => mergeRefs(ref, triggerRef), [ref, triggerRef]);
  const resolvedId = id ?? triggerId;
  useLayoutEffect(() => {
    if (resolvedId !== triggerId) setTriggerId(resolvedId);
  }, [resolvedId, triggerId, setTriggerId]);

  const merged = {
    ...mergeProps(props, ariaProps, pressProps),
    id: resolvedId,
    ref: mergedRef,
    "data-open": state.isOpen ? "" : undefined,
  };
  if (!render) {
    // 기본 요소는 class가 없다. className을 주면 그대로 붙는다.
    return createElement("button", { type: "button", ...merged, className });
  }

  return renderElement({
    defaultElement: "button",
    render,
    baseClassName: "",
    props: { ...merged, className },
  });
}
