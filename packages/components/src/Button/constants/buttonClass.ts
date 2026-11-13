import type { ButtonSize } from "../types";

/** size별 높이·padding·간격·텍스트 스타일. */
export const sizeClass: Record<ButtonSize, string> = {
  xs: "h-6 gap-1 px-2 text-label-sm",
  sm: "h-8 gap-1.5 px-3 text-label-md",
  md: "h-10 gap-2 px-4 text-label-md",
  lg: "h-12 gap-2 px-5 text-label-lg",
};

/** 텍스트 옆 아이콘을 감싼 span 크기. 안의 요소가 꽉 채운다. */
export const iconSizeClass: Record<ButtonSize, string> = {
  xs: "size-3.5",
  sm: "size-3.5",
  md: "size-4",
  lg: "size-5",
};
