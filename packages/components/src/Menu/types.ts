import type { TreeState } from "react-stately";

import type { OverlayPlacement } from "../_internal/libs/overlayPosition";

/** Menu 목록의 위치. 앞은 트리거의 어느 쪽, 뒤는 그 변에서 맞출 끝이다. 공간이 모자라면 반대쪽으로 뒤집힌다. */
export type MenuPlacement = OverlayPlacement;

export type CollectionNode = TreeState<object>["collection"] extends Iterable<infer N> ? N : never;

export interface ViewProps {
  readonly node: CollectionNode;
  readonly tree: TreeState<object>;
}
