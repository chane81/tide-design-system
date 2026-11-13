/**
 * 쌓임 단계 5개(뒤에서 앞 순서). `z-<이름>` class와 공개 계약 `--tide-z-<이름>`이 쓴다.
 * 100 간격이라 앱이 자기 단계를 사이에 끼울 수 있다. 오버레이 루트에만 쓴다.
 */
export const zIndex = {
  sticky: 100,
  modal: 200,
  // Dialog 안에서 연 Select 목록이 Dialog 위에 보여야 해서 popover가 modal 위다.
  popover: 300,
  toast: 400,
  tooltip: 500,
} as const;

/** 쌓임 단계 이름 */
export type ZIndexName = keyof typeof zIndex;
