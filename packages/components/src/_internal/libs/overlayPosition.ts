import type { CSSProperties, DOMAttributes } from "react";

/** 앞은 트리거의 어느 쪽(주축), 뒤는 그 변의 어디에 맞출지(교차축)다. 공간이 모자라면 뒤집는다. */
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
 * React Aria가 넣는 `zIndex: 100000`을 빼고(쌓임은 z-* class로만 정한다) 주축을 `data-placement`로 붙인다.
 * 첫 렌더에도 요청한 주축을 붙인다. 등장 전환의 시작 방향이 첫 스타일 계산에서 정해지기 때문이다.
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
