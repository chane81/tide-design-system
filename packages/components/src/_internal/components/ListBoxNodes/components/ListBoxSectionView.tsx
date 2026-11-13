"use client";
import type { ReactElement } from "react";
import { useListBoxSection } from "react-aria";

import { listHeadingClass } from "../../../constants/listClass.ts";
import type { ListBoxSectionProps, ViewProps } from "../types.ts";
import { ListBoxOptionView } from "./ListBoxOptionView.tsx";

/** 묶음 하나를 그린다. 제목은 보조기술에서 숨기고(`presentation`) 묶음의 이름으로만 쓴다(useListBoxSection). */
export function ListBoxSectionView({ node, state }: ViewProps): ReactElement {
  const { className } = node.props as ListBoxSectionProps;
  const { itemProps, headingProps, groupProps } = useListBoxSection({
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
          <ListBoxOptionView key={child.key} node={child} state={state} />
        ))}
      </div>
    </div>
  );
}
