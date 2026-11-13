"use client";
import type { ReactElement } from "react";
// 서브패스 말고 루트 entry에서 import한다. Vite 사전 번들 목록이 바뀌지 않게 한다.
import { useMenuSection } from "react-aria";

import { listHeadingClass } from "../../_internal/constants/listClass";
import type { ViewProps } from "../types";
import type { MenuSectionProps } from "./MenuSection";
import { MenuItemView } from "./MenuItemView";

// 제목은 보조기술에서 숨기고(`presentation`) 묶음의 이름으로만 쓴다(useMenuSection).
export function MenuSectionView({ node, tree }: ViewProps): ReactElement {
  const { className } = node.props as MenuSectionProps;
  const { itemProps, headingProps, groupProps } = useMenuSection({
    heading: node.rendered,
    "aria-label": node["aria-label"],
  });

  return (
    <div {...itemProps} className={className}>
      {node.rendered != null && (
        <div {...headingProps} className={listHeadingClass}>
          {node.rendered}
        </div>
      )}
      <div {...groupProps}>
        {[...node.childNodes].map((child) => (
          <MenuItemView key={child.key} node={child} tree={tree} />
        ))}
      </div>
    </div>
  );
}
