import { ChevronRightIcon } from "@tide-design/icons";
import type { ReactElement } from "react";

import { IconButton } from "../../IconButton/IconButton.tsx";
import { itemSize } from "../constants/paginationClass.ts";
import type { PaginationArrowProps } from "../types.ts";

export interface PaginationNextProps extends PaginationArrowProps {}

/** 다음 페이지로 가는 IconButton(ghost, 32px, ›). 마지막 페이지에서는 `disabled`를 준다. */
export function PaginationNext({
  "aria-label": ariaLabel = "다음 페이지",
  ...props
}: PaginationNextProps): ReactElement {
  return (
    <IconButton {...props} aria-label={ariaLabel} variant="ghost" color="neutral" size={itemSize}>
      <ChevronRightIcon />
    </IconButton>
  );
}
