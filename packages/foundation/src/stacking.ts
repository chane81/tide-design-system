// 쌓임 단계 Token(tide-v0 티켓 22, spec 「`@tide-tds/foundation`」 z-index).
// - top-layer를 쓰지 않고, 모든 오버레이를 portal과 이 단계로 쌓는다.
// - popover가 modal 위다. Dialog 안에서 연 Select 목록이 Dialog 위에 보여야 하기 때문이다.
// - 100 간격이라 앱이 자기 단계를 사이에 끼울 수 있다(예: 150).
// - 쌓임 단계는 오버레이 루트에만 쓴다. Component 내부 겹침은 루트 isolate와 z-0/z-1로 처리한다.

/**
 * 쌓임 단계 5개. 뒤에서부터 앞 순서다. `z-<이름>` class와 공개 계약 `--tide-z-<이름>`이 쓴다.
 * - sticky: 앱의 sticky 헤더·사이드바(v0 Tide Component는 쓰지 않음)
 * - modal: Dialog·AlertDialog와 그 backdrop
 * - popover: Popover, Menu, Select·Combobox 목록
 * - toast: Toast 영역
 * - tooltip: Tooltip
 */
export const zIndex = {
  sticky: 100,
  modal: 200,
  popover: 300,
  toast: 400,
  tooltip: 500,
} as const;

/** 쌓임 단계 이름 */
export type ZIndexName = keyof typeof zIndex;
