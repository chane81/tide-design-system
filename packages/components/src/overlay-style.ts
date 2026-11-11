// 오버레이 공통 class(tide-v0-impl 티켓 25). Popover가 처음 쓰고 Tooltip·Menu·Select·Combobox·Dialog·Toast가 다시 쓴다.
// 이 파일은 class 문자열만 있으므로 "use client"가 없다.
//
// class는 문자열 그대로 적는다. Tailwind가 빌드 결과를 스캔해 class를 만들기 때문에 이름을 조합하면 안 된다.
// 나누는 기준(spec 「오버레이」·「motion 적용」):
// - 표면(overlaySurfaceClass): raised 표면 + shadow-md + radius lg + 투명 border. Menu·Select 목록·Toast가 같다.
//   Tooltip은 같은 표면에 padding만 다르고, Dialog류는 shadow-lg·radius xl이라 dialogSurfaceClass를 쓴다(티켓 30).
// - 쌓임 단계는 표면 class에 넣지 않는다. 오버레이마다 다르므로(z-popover, z-tooltip, z-toast, z-modal) 부르는 쪽이 붙인다.
// - motion(popoverMotionClass): 「가끔 씀」 오버레이(Popover, Toast)의 등장·퇴장. 「자주 씀」(Menu, Select·Combobox 목록,
//   Tooltip)은 바로 나타나고 opacity fast로만 사라지므로 같은 구조로 시작 상태(starting:)와 이동·blur를 뺀
//   frequentMotionClass를 쓴다(티켓 26).

/**
 * 오버레이 표면. raised 표면(`bg-raised`), `shadow-md`, radius `lg`, 경계 `border-raised`(light 투명 / dark gray-800).
 * - 글자는 `text-default`다. `text-default × bg-raised` 4.5:1이 등록되어 있다.
 * - `border-raised`는 장식용 경계라 대비 검사에서 빠진다. light의 투명 border는 forced-colors에서 CanvasText로 칠해져
 *   그림자 없이도 경계가 남는다(spec Elevation, 사용자 이야기 37). forced-colors에서는 브라우저가 box-shadow를 지운다.
 */
export const overlaySurfaceClass =
  "rounded-lg border border-raised bg-raised text-default shadow-md";

/**
 * 「가끔 씀」 오버레이의 등장·퇴장(spec 「motion 적용」). 요소에 `data-open`(열림)과 `data-placement`(트리거 기준 방향,
 * `top`·`bottom`·`left`·`right`)가 있어야 한다.
 *
 * - 등장: `@starting-style`(`starting:`)에서 opacity 0 + blur 4px(`blur-xs`) + 트리거 쪽으로 4px(`*-translate-*-1`)
 *   떨어진 곳에서 시작해 `normal`(300ms)로 제자리에 온다.
 * - 퇴장: `data-open`이 빠지면 같은 조합의 절반(blur 2px, 2px 이동)으로 `fast`(150ms)에 사라진다.
 *   duration은 도착 상태의 값을 쓰므로 기본 `duration-fast`에 열림만 `data-open:duration-normal`이다. easing은 둘 다 out이다.
 * - 닫힌 상태는 `display: none`(`hidden`)이고 `transition-discrete`(`transition-behavior: allow-discrete`)로 display도
 *   전환 대상에 넣어, 퇴장 전환이 끝날 때 사라진다. 이 둘을 지원하지 않는 브라우저에서는 바로 나타나고 사라진다.
 *   요소를 DOM에서 빼는 시점은 `useOverlayPresence`가 전환이 끝나기를 기다려 정한다.
 * - 퇴장 중에는 `pointer-events-none`으로 눌리지 않는다.
 * - reduced-motion: 이동·blur와 그 전환 대상(filter, translate)은 `motion-safe:`일 때만 둔다. 움직임 줄이기에서는
 *   opacity(와 display)만 같은 시간으로 바뀐다.
 * - `transition-all`은 쓰지 않는다. 전환 대상을 적는다.
 */
export const popoverMotionClass: string = [
  "transition-[opacity,display] transition-discrete duration-fast ease-out data-open:duration-normal motion-safe:transition-[opacity,filter,translate,display]",
  // 퇴장의 끝(닫힌 상태)
  "not-data-open:pointer-events-none not-data-open:hidden not-data-open:opacity-0 motion-safe:not-data-open:blur-[2px]",
  "motion-safe:not-data-open:data-[placement=bottom]:-translate-y-0.5 motion-safe:not-data-open:data-[placement=top]:translate-y-0.5",
  "motion-safe:not-data-open:data-[placement=right]:-translate-x-0.5 motion-safe:not-data-open:data-[placement=left]:translate-x-0.5",
  // 등장의 시작
  "starting:opacity-0 motion-safe:starting:blur-xs",
  "motion-safe:data-[placement=bottom]:starting:-translate-y-1 motion-safe:data-[placement=top]:starting:translate-y-1",
  "motion-safe:data-[placement=right]:starting:-translate-x-1 motion-safe:data-[placement=left]:starting:translate-x-1",
].join(" ");

/**
 * 「자주 씀」 오버레이(Tooltip, Menu, Select·Combobox 목록)의 등장·퇴장(spec 「motion 적용」, 티켓 26).
 * 요소에 `data-open`(열림)이 있어야 한다.
 *
 * - 등장: 바로 나타난다. 열린 동안은 `transition-none`이라 퇴장 중에 다시 열려도 바로 불투명해진다.
 *   새로 넣은 요소는 이전 스타일이 없어 전환이 생기지 않으므로 `starting:`도 두지 않는다.
 * - 퇴장: `data-open`이 빠지면 opacity만 `fast`(150ms), out으로 사라진다. 전환 대상은 opacity와 display다.
 *   duration·전환 대상은 도착 상태의 값을 쓰므로 닫힌 상태에서만 전환이 있다.
 * - 닫힌 상태는 `display: none`(`hidden`)이고 `transition-discrete`로 퇴장이 끝날 때 사라진다(popoverMotionClass와 같다).
 *   DOM에서 빼는 시점은 `useOverlayPresence`가 정한다. 퇴장 중에는 `pointer-events-none`이다.
 * - reduced-motion: 이동·blur·확대가 없으므로 바꿀 것이 없다. opacity 전환은 그대로 둔다.
 */
export const frequentMotionClass: string = [
  "transition-[opacity,display] transition-discrete duration-fast ease-out data-open:transition-none",
  "not-data-open:pointer-events-none not-data-open:hidden not-data-open:opacity-0",
].join(" ");

/**
 * Dialog류(Dialog, AlertDialog) 표면(spec radius·Elevation, 티켓 30). 가운데에 뜨는 모달이라 트리거에 붙는
 * 오버레이보다 한 단계 높다. raised 표면(`bg-raised`), `shadow-lg`, radius `xl`, 경계 `border-raised`.
 * 글자·경계·forced-colors 처리는 `overlaySurfaceClass`와 같다(`text-default × bg-raised` 4.5:1 등록, `border-raised`는 장식용).
 */
export const dialogSurfaceClass =
  "rounded-xl border border-raised bg-raised text-default shadow-lg";

/**
 * 모달 뒤를 가리는 반투명 막(backdrop, `bg-overlay`)의 등장·퇴장(티켓 30). 요소에 `data-open`이 있어야 한다.
 *
 * - 등장: `starting:`에서 opacity 0으로 시작해 `normal`(300ms)로 나타난다. 퇴장: `data-open`이 빠지면 `fast`(150ms)로 사라진다.
 * - 닫힌 상태는 `display: none`(`hidden`) + `transition-discrete`로 퇴장이 끝날 때 사라지고, 퇴장 중에는
 *   `pointer-events-none`이다(popoverMotionClass와 같은 구조). 안의 Dialog도 이 값을 물려받아 눌리지 않는다.
 * - opacity만 바뀌므로 움직임 줄이기에서도 같다.
 * - `useOverlayPresence`는 이 요소(막)의 전환이 끝나기를 기다린다. 안의 Dialog 전환(`dialogMotionClass`)도 같은
 *   duration이라 함께 끝난다.
 */
export const backdropMotionClass: string = [
  "transition-[opacity,display] transition-discrete duration-fast ease-out data-open:duration-normal",
  "not-data-open:pointer-events-none not-data-open:hidden not-data-open:opacity-0",
  "starting:opacity-0",
].join(" ");

/**
 * Dialog류의 등장·퇴장(spec 「motion 적용」 「가끔 씀」 Dialog류, 티켓 30). 요소에 `data-open`이 있어야 한다.
 *
 * - 등장: `starting:`에서 opacity 0 + scale 0.96(`scale-96`)으로 시작해 `normal`(300ms), out으로 제자리에 온다.
 * - 퇴장: `data-open`이 빠지면 같은 조합을 약하게(scale 0.98, `scale-98`) `fast`(150ms)로 사라진다.
 *   duration은 도착 상태의 값을 쓰므로 기본 `duration-fast`에 열림만 `data-open:duration-normal`이다.
 * - 화면에서 빼는 일(display)은 바깥 막(`backdropMotionClass`)이 한다. 이 요소는 opacity·scale만 전환한다.
 * - reduced-motion: 확대(scale)와 그 전환 대상은 `motion-safe:`일 때만 둔다. 움직임 줄이기에서는 opacity만 바뀐다.
 * - `transition-all`은 쓰지 않는다.
 */
export const dialogMotionClass: string = [
  "transition-[opacity] duration-fast ease-out data-open:duration-normal motion-safe:transition-[opacity,scale]",
  "not-data-open:opacity-0 motion-safe:not-data-open:scale-98",
  "starting:opacity-0 motion-safe:starting:scale-96",
].join(" ");
