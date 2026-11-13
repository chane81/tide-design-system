import { frequentMotionClass, overlaySurfaceClass } from "../../_internal/constants/overlayClass";

// class는 문자열 그대로 적는다(_internal/constants/overlayClass.ts 참고).
// - 표면: Popover와 같은 raised + shadow-md + radius lg + border-raised(overlaySurfaceClass). 쌓임은 z-tooltip(500)이라
//   Dialog(z-modal)·Popover(z-popover) 위에 그려진다.
// - 크기: 안쪽 여백 세로 4px·가로 8px, 글자 body-sm(14px), 폭은 내용에 맞추되 15rem(max-w-60)을 넘지 않는다.
// - motion: 「자주 씀」(frequentMotionClass). 바로 나타나고 opacity fast로 사라진다.
// - 루트 `isolate`: 안의 겹침이 바깥 쌓임 단계와 섞이지 않게 쌓임 맥락을 만든다(spec 「오버레이」).
export const contentClass = `isolate z-tooltip max-w-60 px-2 py-1 text-body-sm ${overlaySurfaceClass} ${frequentMotionClass}`;
