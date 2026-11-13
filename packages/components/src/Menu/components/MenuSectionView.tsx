"use client";
import type { ReactElement } from "react";
// 루트 entry에서 import한다(Popover.tsx 참고).
import { useMenuSection } from "react-aria";

import { listHeadingClass } from "../../_internal/constants/listClass.ts";
import type { ViewProps } from "../types.ts";
import type { MenuSectionProps } from "./MenuSection.tsx";
import { MenuItemView } from "./MenuItemView.tsx";

/** 묶음 하나를 그린다. 제목은 보조기술에서 숨기고(`presentation`) 묶음의 이름으로만 쓴다(useMenuSection). */
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
