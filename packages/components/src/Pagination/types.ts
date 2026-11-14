import type { IconButtonOwnProps, IconButtonProps } from "../IconButton/IconButton";

/** 이전/다음 항목이 받는 Tide props. IconButton에서 모양·아이콘·로딩을 고정했다. */
export interface PaginationArrowOwnProps extends Omit<
  IconButtonOwnProps,
  "aria-label" | "children" | "variant" | "color" | "size" | "loading" | "loadingLabel"
> {
  /** 버튼 이름. 기본값은 이전 `"이전 페이지"`, 다음 `"다음 페이지"`다. */
  "aria-label"?: string;
}

export interface PaginationArrowProps
  extends PaginationArrowOwnProps, Omit<IconButtonProps, keyof IconButtonOwnProps> {}
