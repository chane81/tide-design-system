import { ChevronLeftIcon } from "@tide-design/icons";
import type { ReactElement } from "react";

import { IconButton } from "../../IconButton/IconButton";
import { itemSize } from "../constants/paginationClass";
import type { PaginationArrowOwnProps, PaginationArrowProps } from "../types";

export interface PaginationPreviousOwnProps extends PaginationArrowOwnProps {}

export interface PaginationPreviousProps extends PaginationArrowProps {}

/**
 * 이전 페이지로 가는 IconButton(ghost, 32px, ‹). 첫 페이지에서는 `disabled`를 준다.
 * Tide props: `aria-label`, `noPressScale`, `render` ({@link PaginationPreviousOwnProps}). 나머지는 `<button>` 속성.
 */
export function PaginationPrevious({
  "aria-label": ariaLabel = "이전 페이지",
  ...props
}: PaginationPreviousProps): ReactElement {
  return (
    <IconButton {...props} aria-label={ariaLabel} variant="ghost" color="neutral" size={itemSize}>
      <ChevronLeftIcon />
    </IconButton>
  );
}
