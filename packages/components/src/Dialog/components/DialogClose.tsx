"use client";
import { createElement, type ComponentProps, type MouseEvent, type ReactElement } from "react";

import { useDialogContext } from "../../_internal/hooks/useDialogContext";
import { renderElement } from "../../_internal/libs/renderElement";

export interface DialogCloseOwnProps {
  /** 다른 요소로 렌더한다(예: `render={<Button variant="ghost" color="neutral" />}`). 기본은 class 없는 `<button type="button">`. */
  render?: ReactElement;
}

export interface DialogCloseProps
  extends DialogCloseOwnProps, Omit<ComponentProps<"button">, keyof DialogCloseOwnProps> {}

/**
 * 누르면 Dialog를 닫는 버튼. `onClick`을 먼저 부르고, 그 안에서 `event.preventDefault()`를 부르면 닫지 않는다.
 * 닫히면 포커스는 열기 전 요소로 돌아간다.
 * Tide props: `render` ({@link DialogCloseOwnProps}). 나머지는 `<button>` 속성.
 */
export function DialogClose({
  render,
  onClick,
  className,
  ...props
}: DialogCloseProps): ReactElement {
  const { state } = useDialogContext("DialogClose");
  const handleClick = (event: MouseEvent<HTMLButtonElement>): void => {
    onClick?.(event);
    if (!event.defaultPrevented) state.close();
  };
  const merged = { ...props, onClick: handleClick, className };
  if (!render) return createElement("button", { type: "button", ...merged });

  return renderElement({ defaultElement: "button", render, baseClassName: "", props: merged });
}
