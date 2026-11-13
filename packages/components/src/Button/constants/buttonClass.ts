import type { ButtonSize } from "../types";

// 채움 방식 맵, 누름 축소, 상태 처리는 IconButton과 함께 쓰는 `_internal/constants/pressableClass.ts`·`_internal/libs/pressableState.ts`에 있다(티켓 14).

/** 높이, 좌우 padding, 아이콘과 텍스트 사이 간격, 텍스트 스타일(spec size 표). radius는 모든 size에서 `md`다. */
export const sizeClass: Record<ButtonSize, string> = {
  xs: "h-6 gap-1 px-2 text-label-sm",
  sm: "h-8 gap-1.5 px-3 text-label-md",
  md: "h-10 gap-2 px-4 text-label-md",
  lg: "h-12 gap-2 px-5 text-label-lg",
};

/** 텍스트 옆 아이콘 크기(spec 아이콘 크기 규칙). 감싼 span의 크기이고 안의 요소가 꽉 채운다. */
export const iconSizeClass: Record<ButtonSize, string> = {
  xs: "size-3.5",
  sm: "size-3.5",
  md: "size-4",
  lg: "size-5",
};
