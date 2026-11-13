// 트리거 기준 오버레이 위치의 placement 타입과 위치 props 정리 함수(tide-v0-impl 티켓 25).
// 오버레이를 짜는 순서는 components/OverlayPortal.tsx 머리 주석을 본다.
// hook·state를 쓰지 않는 순수 함수라 "use client"가 없다.

import type { CSSProperties, DOMAttributes } from "react";

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
