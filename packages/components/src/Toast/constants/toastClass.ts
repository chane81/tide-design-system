import { alertLayoutClass } from "../../_internal/constants/alertClass";
import { overlaySurfaceClass, popoverMotionClass } from "../../_internal/constants/overlayClass";

// class는 문자열 그대로 적는다. Tailwind가 빌드 결과를 스캔해 class를 만들기 때문에 이름을 조합하면 안 된다.
// - 영역: 화면 아래 끝쪽(LTR이면 오른쪽)에서 16px 떨어져 고정한다. 폭은 화면 폭 − 32px, 최대 24rem(max-w-96)이다.
//   새 Toast가 아래(모서리 쪽)에 오도록 거꾸로 쌓는다(flex-col-reverse, DOM은 새것이 먼저라 Tab도 새것부터다).
//   쌓임은 z-toast(400)이고 isolate라 안의 겹침이 바깥 단계와 섞이지 않는다. F6로 영역에 포커스가 오면 focus-ring이다.
// - Toast: Alert 배치(아이콘·내용·닫기, 여백 16px, gap 12px)에 오버레이 표면(raised + shadow-md + radius lg +
//   border-raised)을 얹고 「가끔 씀」 motion(Popover와 같다)을 쓴다. 아래에서 떠오르므로 data-placement="top"이다
//   (트리거 위에 뜨는 Popover와 같은 방향: 4px 아래에서 올라오고, 퇴장은 2px 아래로).
//   글자는 text-default, 상태 아이콘만 역할 색(text-accent, × bg-raised 4.5:1)이다.
// - 닫기(ghost)·액션(outline) 버튼은 Toast 색과 관계없이 neutral이다(글자 text-default, hover·누름 bg-hover·bg-active).
//   raised 표면(dark gray-900) 위에 bg-hover·bg-active를 덮으면 Role 색 글자가 일시 상태 하한 4:1에도 못 미치는 색이 있다
//   (dark 누름 warning 3.99·danger 3.89:1, 티켓 46). text-default × bg-hover·bg-active(bg-raised 위 합성)는 4:1로
//   등록되어 있다(사용자 결정 2026-11-12, 티켓 03).
export const regionClass =
  "fixed end-4 bottom-4 isolate z-toast flex w-[calc(100%-2rem)] max-w-96 flex-col-reverse gap-2 rounded-lg outline-none focus-visible:focus-ring";
export const toastClass = `${alertLayoutClass} ${overlaySurfaceClass} ${popoverMotionClass} outline-none focus-visible:focus-ring`;
