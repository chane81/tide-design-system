import { overlaySurfaceClass, popoverMotionClass } from "../../_internal/constants/overlayClass";

// class는 문자열 그대로 적는다(_internal/constants/overlayClass.ts 참고).
// - 표면: raised + shadow-md + radius lg + border-raised(overlaySurfaceClass). 쌓임은 z-popover(300)다.
// - 크기: 안쪽 여백 16px(Card와 같음), 폭은 내용에 맞추되 20rem(max-w-80)을 넘지 않는다. 높이는 React Aria가
//   max-height로 화면 안에 맞추고 넘치면 스크롤한다(overflow-auto).
// - 포커스: 열릴 때 내용 요소 자신에 포커스가 온다(useDialog). 표면 전체가 포커스 위치라 outline은 그리지 않는다.
//   안의 조작 요소는 각자 focus-ring을 쓴다.
// - 루트 `isolate`: 안의 겹침(z-0/z-1)이 바깥 쌓임 단계와 섞이지 않게 쌓임 맥락을 만든다(spec 「오버레이」).
export const contentClass = `isolate z-popover max-w-80 overflow-auto p-4 text-body-md outline-none ${overlaySurfaceClass} ${popoverMotionClass}`;
