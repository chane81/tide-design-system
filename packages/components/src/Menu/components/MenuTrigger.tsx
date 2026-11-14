"use client";
import {
  createElement,
  useLayoutEffect,
  useMemo,
  type ComponentProps,
  type ReactElement,
} from "react";
// 서브패스 말고 루트 entry에서 import한다. Vite 사전 번들 목록이 바뀌지 않게 한다.
import { mergeProps, mergeRefs, usePress } from "react-aria";

import { renderElement } from "../../_internal/libs/renderElement";
import { useMenuContext } from "../hooks/useMenuContext";

export interface MenuTriggerOwnProps {
  /**
   * 다른 요소로 렌더한다. 예: `render={<Button variant="outline" />}`. props·ref·className·핸들러를 병합한다.
   * 기본은 class 없는 `<button type="button">`이다.
   */
  render?: ReactElement;
}

export interface MenuTriggerProps
  extends MenuTriggerOwnProps, Omit<ComponentProps<"button">, keyof MenuTriggerOwnProps> {}

/**
 * Menu를 여는 버튼. 마우스는 누르는 순간 열고, 키보드는 Enter·Space·↓로 첫 항목, ↑로 마지막 항목에서 연다.
 * 열렸을 때 `data-open`이 붙는다.
 * Tide props: `render` ({@link MenuTriggerOwnProps}). 나머지는 `<button>` 속성.
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
  // 트리거는 render로 다른 요소가 될 수 있어 useButton 대신 press 동작만 usePress로 붙인다.
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
    return createElement("button", { type: "button", ...merged, className });
  }

  return renderElement({
    defaultElement: "button",
    render,
    baseClassName: "",
    props: { ...merged, className },
  });
}
