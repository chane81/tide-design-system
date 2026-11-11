"use client";
// 오버레이 공통 동작(tide-v0-impl 티켓 25). Popover가 처음 쓰고 Tooltip·Menu·Select·Combobox·Dialog·Toast가 다시 쓴다.
// React Aria hooks만 쓰고 마크업은 부르는 쪽이 정한다(ADR 0004). 근거 버전: react-aria 3.53.1, react-stately 3.51.0
// (react-aria.adobe.com/Popover/usePopover, 설치본 dist 소스로 확인).
//
// 오버레이 하나는 이렇게 짠다(Popover.tsx가 예시다).
//   1. 바깥 Component: `useOverlayPresence(state.isOpen, ref)`로 DOM에 둘지 정한다. 닫혀도 퇴장 전환이 끝날 때까지 남긴다.
//   2. 안쪽 Component(DOM에 있을 때만 렌더): 위치는 `usePopover`(dismiss·aria-hide·스크롤 잠금 포함) 또는
//      `useOverlayPosition`(Tooltip처럼 dismiss가 따로인 경우, Tooltip.tsx가 예시다)으로 구하고, 그 결과를 `overlayPositionProps`로 Tide 규칙에 맞춘다.
//      역할 hook(useDialog, useMenu, useListBox …)의 props를 같은 요소에 합친다.
//   3. 안쪽 Component를 `<OverlayPortal isExiting={!state.isOpen}>`(React Aria `Overlay`)으로 감싸 `document.body`에 portal하고
//      포커스를 되돌린다. 역할 hook이 portal의 context로 포커스 가두기를 요청하므로 hook은 portal 안쪽에서 부른다.
//   4. class: 표면 `overlaySurfaceClass`, 쌓임 단계(`z-popover` 등), motion(`popoverMotionClass` 등, overlay-style.ts).
//   5. 트리거가 있는 Theme을 portal에 옮기려면 `useOverlayTheme(triggerRef, overlayRef)`.

import {
  useLayoutEffect,
  useState,
  type CSSProperties,
  type DOMAttributes,
  type ReactElement,
  type ReactNode,
  type RefObject,
} from "react";
import { Overlay, usePopover } from "react-aria";
import type { OverlayTriggerState } from "react-stately";

/**
 * 트리거 기준 위치. 앞은 트리거의 어느 쪽에 놓을지(주축), 뒤는 그 변에서 어디에 맞출지(교차축)다.
 * 공간이 모자라면 반대쪽으로 뒤집는다(React Aria `shouldFlip` 기본값).
 */
export type OverlayPlacement =
  | "top"
  | "top start"
  | "top end"
  | "bottom"
  | "bottom start"
  | "bottom end"
  | "left"
  | "left top"
  | "left bottom"
  | "right"
  | "right top"
  | "right bottom";

/** 주축 방향. `data-placement` 값이다. */
type PlacementAxis = "top" | "bottom" | "left" | "right";

const isAxis = (value: unknown): value is PlacementAxis =>
  value === "top" || value === "bottom" || value === "left" || value === "right";

/**
 * 열림 상태가 꺼져도 퇴장 전환이 끝날 때까지 오버레이를 DOM에 남긴다. DOM에 둘지(`true`)를 돌려준다.
 *
 * 닫힌 뒤 요소의 `getAnimations()`(CSS transition 포함)가 모두 끝나면 뺀다. 전환이 없으면(지원하지 않는 브라우저,
 * 전환이 없는 오버레이) 바로 뺀다. 퇴장 중에 다시 열리면 빼지 않는다. React Aria hooks에는 퇴장을 기다리는 hook이
 * 없어서(react-aria-components의 `isExiting`은 Component 층에만 있다) 이 hook이 그 일을 한다.
 */
export function useOverlayPresence(isOpen: boolean, ref: RefObject<HTMLElement | null>): boolean {
  const [present, setPresent] = useState(isOpen);
  if (isOpen && !present) setPresent(true);

  useLayoutEffect(() => {
    if (isOpen || !present) return;
    const element = ref.current;
    // 요소가 없거나 getAnimations를 지원하지 않으면 바로 뺀다.
    if (!element || typeof element.getAnimations !== "function") {
      setPresent(false);
      return;
    }
    let cancelled = false;
    // getAnimations()는 스타일을 다시 계산하므로 data-open이 빠진 뒤의 퇴장 전환이 여기서 시작되어 잡힌다.
    // 등장 전환 중에 닫으면 전환이 바뀌며 앞의 것은 취소(finished reject)된다. 그래서 끝나든 취소되든 기다린 뒤
    // 도는 전환이 다시 없을 때까지 확인한다. 다시 열리면 effect가 정리되어(cancelled) 빼지 않는다.
    const waitForExit = (): void => {
      const animations = element.getAnimations();
      if (animations.length === 0) {
        setPresent(false);
        return;
      }
      void Promise.allSettled(animations.map((animation) => animation.finished)).then(() => {
        if (!cancelled) waitForExit();
      });
    };
    waitForExit();
    return () => {
      cancelled = true;
    };
  }, [isOpen, present, ref]);

  return isOpen || present;
}

/**
 * React Aria가 위치 style에 넣는 `zIndex: 100000`을 빼고 주축 방향을 `data-placement`로 붙인다.
 * 쌓임은 쌓임 단계 class(`z-popover` 등)로만 정한다(spec 「오버레이」).
 *
 * `placement`가 아직 없으면(처음 렌더) 요청한 placement의 주축을 쓴다. 등장 전환의 시작 방향이 첫 스타일 계산에서
 * 정해지기 때문이다. 공간이 없어 뒤집힌 경우에만 첫 프레임의 시작 방향이 요청한 쪽이 된다(4px).
 */
export function overlayPositionProps(
  props: DOMAttributes<Element> & { style?: CSSProperties },
  placement: string | null,
  requested: OverlayPlacement,
): DOMAttributes<Element> & { style: CSSProperties; "data-placement": PlacementAxis } {
  const { zIndex: _zIndex, ...style } = props.style ?? {};
  const fallback = requested.split(" ")[0] as PlacementAxis;
  return { ...props, style, "data-placement": isAxis(placement) ? placement : fallback };
}

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

/**
 * 트리거가 놓인 Theme(`data-theme`)을 portal로 나간 오버레이에 옮긴다. Theme을 `<html>`이 아닌 일부 영역에
 * 붙인 앱에서도 오버레이가 같은 색이 된다. 오버레이에 이미 `data-theme`이 있으면 두고, 트리거 위에 Theme이 없으면
 * 붙이지 않는다(`:root` 기본값을 따른다). 위치를 계산하기 전(첫 스타일 계산 전)에 붙도록 위치 hook보다 먼저 부른다.
 */
export function useOverlayTheme(
  triggerRef: RefObject<Element | null>,
  overlayRef: RefObject<HTMLElement | null>,
): void {
  useLayoutEffect(() => {
    const overlay = overlayRef.current;
    if (!overlay || overlay.hasAttribute("data-theme")) return;
    const theme = triggerRef.current?.closest("[data-theme]")?.getAttribute("data-theme");
    if (theme) overlay.setAttribute("data-theme", theme);
  }, [triggerRef, overlayRef]);
}

/** `OverlayPortal`의 props */
export interface OverlayPortalProps {
  /** 퇴장 중이면 `true`. 포커스 가두기를 풀어 바깥으로 포커스가 돌아갈 수 있게 한다. */
  readonly isExiting: boolean;
  /**
   * `false`면 포커스를 다루지 않는다(`FocusScope`로 감싸지 않음). 포커스를 받지 않는 Tooltip이 쓴다.
   * 감싸면 Tooltip이 열린 Popover 안에서 FocusScope가 하나 더 생기고, 닫힐 때 포커스 복귀를 시도한다.
   * 기본값은 `true`다(티켓 26).
   */
  readonly focusManagement?: boolean;
  readonly children: ReactNode;
}

/**
 * 오버레이를 `document.body`에 portal한다(React Aria `Overlay`). top-layer(`<dialog>`, popover API)는 쓰지 않는다.
 * 안을 `FocusScope`(`restoreFocus`)로 감싸서, DOM에서 빠질 때 포커스가 열기 전 요소(보통 트리거)로 돌아간다.
 * 역할 hook이 포커스 가두기를 요청하면(`useDialog` 등) Tab이 안에서 돈다. 서버 렌더에서는 아무것도 그리지 않는다.
 * `focusManagement={false}`면 FocusScope 없이 portal만 한다(Tooltip).
 */
export function OverlayPortal({
  isExiting,
  focusManagement = true,
  children,
}: OverlayPortalProps): ReactElement | null {
  return (
    <Overlay isExiting={isExiting} disableFocusManagement={!focusManagement}>
      {children}
    </Overlay>
  );
}
