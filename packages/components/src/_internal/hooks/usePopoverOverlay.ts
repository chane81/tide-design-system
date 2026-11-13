"use client";
// 트리거에 붙는 오버레이의 위치·닫기 hook(tide-v0-impl 티켓 25). React Aria `usePopover`를 감싼다.
// 근거 버전: react-aria 3.53.1, react-stately 3.51.0(react-aria.adobe.com/Popover/usePopover, 설치본 dist 소스로 확인).
// 오버레이를 짜는 순서는 components/OverlayPortal.tsx 머리 주석을 본다.

import type { RefObject } from "react";
import { usePopover } from "react-aria";
import type { OverlayTriggerState } from "react-stately";

import { overlayPositionProps, type OverlayPlacement } from "../libs/overlayPosition.ts";

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
  /**
   * 바깥을 보조기술에서 숨기지 않고 바깥 클릭으로 닫지 않는다. Combobox처럼 입력을 바깥에 두는 경우만 쓴다.
   * 기본값 `false`에서는 바깥을 `inert`로 막고 스크롤을 잠근다(React Aria 기본).
   */
  readonly nonModal?: boolean;
}

/**
 * 트리거에 붙는 오버레이(Popover, Menu, Select·Combobox 목록)의 위치·닫기 동작. React Aria `usePopover`를 감싼다.
 * - 닫기: Esc, 바깥 누름, 포커스가 바깥으로 나감(`usePopover` 기본). 위에 쌓인 오버레이부터 닫힌다.
 * - 모달: 기본은 바깥을 `inert`로 막고 스크롤을 잠근다. `nonModal`이면 둘 다 하지 않는다.
 * - 위치: 공간이 모자라면 반대쪽으로 뒤집고, 주축 길이는 `max-height`로 줄여 트리거를 덮지 않는다(WCAG 2.4.11, Comments 참고).
 * 돌려받은 `overlayProps`(style 포함)를 오버레이 요소에 펼친다. 쌓임 단계 class는 부르는 쪽이 붙인다.
 */
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
