"use client";
import { createElement, type ComponentProps, type MouseEvent, type ReactElement } from "react";

import { useDialogContext } from "../../_internal/hooks/useDialogContext";
import { renderElement } from "../../_internal/libs/renderElement";

export interface DialogCloseProps extends ComponentProps<"button"> {
  /**
   * 다른 요소로 렌더한다. 예: `render={<Button variant="ghost" color="neutral" />}`.
   * 기본은 class 없는 `<button type="button">`이다.
   */
  render?: ReactElement;
}

/**
 * 누르면 Dialog를 닫는 버튼. `onClick`을 먼저 부르고, 그 안에서 `event.preventDefault()`를 부르면 닫지 않는다.
 * 닫히면 포커스는 열기 전 요소로 돌아간다.
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
