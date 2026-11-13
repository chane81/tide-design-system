"use client";

import type { RefObject } from "react";
import { usePopover } from "react-aria";
import type { OverlayTriggerState } from "react-stately";

import { overlayPositionProps, type OverlayPlacement } from "../libs/overlayPosition";

/** `usePopoverOverlay`의 인자 */
export interface PopoverOverlayOptions {
  /** 위치 기준인 트리거 */
  readonly triggerRef: RefObject<Element | null>;
  /** 오버레이 요소 */
  readonly popoverRef: RefObject<Element | null>;
  /** 트리거 기준 위치 */
  readonly placement: OverlayPlacement;
  /** 트리거와 오버레이 사이 간격(px) */
  readonly offset: number;
  /** 바깥을 inert로 막지 않고 바깥 클릭으로 닫지 않는다. Combobox처럼 입력이 바깥에 있을 때만 쓴다. */
  readonly nonModal?: boolean;
}

/** React Aria `usePopover`를 감싼다. 돌려받은 `overlayProps`(style 포함)를 오버레이 요소에 펼친다. */
export function usePopoverOverlay(
  { triggerRef, popoverRef, placement, offset, nonModal = false }: PopoverOverlayOptions,
  state: OverlayTriggerState,
): { overlayProps: ReturnType<typeof overlayPositionProps> } {
  const { popoverProps, placement: actual } = usePopover(
    { triggerRef, popoverRef, placement, offset, isNonModal: nonModal },
    state,
  );

  return { overlayProps: overlayPositionProps(popoverProps, actual, placement) };
}
