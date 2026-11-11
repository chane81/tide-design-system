# 26: Tooltip

Status: done
Blocked by: 25 (Popover)

## What to build

앱 개발자가 `Tooltip`으로 짧은 설명을 붙인다. 자주 보는 요소이므로 애니메이션 없이 바로 나타나고, 사라질 때만 짧게 흐려진다. 키보드 포커스로도 열린다.

## 수용 기준

- [x] React Aria hooks로 만든다. `react-aria-components`, Base UI, Radix는 쓰지 않는다. 쓴 hook의 API는 설치 버전 문서로 확인하고 근거 버전을 남긴다.
- [x] Popover 기반을 재사용하고 `z-tooltip`으로 쌓는다. `shadow-md`를 쓴다.
- [x] 나타날 때는 바로, 사라질 때는 opacity `fast`.
- [x] hover와 키보드 포커스로 열리고 Esc로 닫힌다. 트리거와 설명이 연결된다.
- [x] Dialog·Popover 위에서도 보인다(쌓임 단계).
- [x] `browser`: hover·focus 열림, Esc 닫힘, 설명 연결, 즉시 등장 계산값을 단언한다.

### 공통 API 규칙

- [x] `ref`는 일반 prop으로 받아 루트 DOM 요소에 연결한다(`forwardRef` 없음).
- [x] props는 루트 DOM 요소의 props를 확장하고 겹치는 HTML 속성은 `Omit`한다. `XxxProps` 타입을 루트에서 export한다.
- [x] prop 이름은 DOM 이름을 쓰고, React Aria 이름(`isDisabled`, `onPress` 등)은 드러내지 않는다.
- [x] 사용자 `className`은 `cn`의 마지막에 넣어 충돌 시 이긴다.
- [x] 상태는 네이티브 pseudo-class가 있으면 그것을, 없으면 boolean `data-*` 속성으로 노출한다.
- [x] `"use client"`는 hook·state·이벤트를 쓰는 파일에만 붙인다.
- [x] Semantic Token만 쓰고, 지원하지 않는 `variant`·`size` 값은 타입 오류가 된다.
- [x] 세부 props(값, 기본값, padding)는 공통 규칙 안에서 정하고 props 표로 확정한다.
- [x] changeset을 포함한다.

### Component 완료 기준 (spec Testing Decisions)

- [x] `*.test.tsx`에 동작 단언이 있다(`browser` project).
- [x] 모든 예시가 story로 있고 a11y 검사를 통과한다(`storybook` project).
- [x] 포커스 표시, forced-colors, reduced-motion 계산값을 단언한다(해당하는 경우).
- [x] MDX 문서가 고정된 섹션 순서(설명 → 사용 시점/쓰지 않을 때 → 예시 → Do/Don't → 접근성 → props 표)를 따른다.
- [x] 쓰는 Token이 대비 쌍에 등록되어 있다(`unit` project).
- [x] smoke 앱에서 import해 빌드가 통과한다(`smoke`).

## Comments

- 2026-11-11 완료(브랜치 `ticket-26-tooltip`, main b0b48e2 위).
  - **근거 버전**: react-aria 3.53.1, react-stately 3.51.0(이미 components 의존성, 새 의존성 없음, `minimumReleaseAge` 그대로), react 19.3.1, tailwindcss 4.3.5, vitest·@vitest/browser-playwright 5.1.0, playwright 1.65.0(Chromium), storybook 10.6.6, typescript 7.0.2.
  - **API 확인**: context7 `/websites/react-aria_adobe`(Tooltip/useTooltipTrigger: `useTooltipTriggerState`·`useTooltipTrigger`·`useTooltip`, `TooltipTriggerProps`의 `delay` 기본 1500·`closeDelay` 기본 500·`isDisabled`·`trigger`·`shouldCloseOnPress`)와 설치본 dist 소스를 읽어 동작을 확인했다: `useTooltipTrigger`는 hover(마지막 입력이 pointer일 때만), 포커스(`isFocusVisible`일 때만, 바로 열기), `onPointerDown`·`onKeyDown`에서 닫기, 열린 동안 document capture keydown으로 Esc를 받아 `stopPropagation` 후 닫고, 열린 동안만 `aria-describedby`를 준다. `useTooltip`은 `role="tooltip"`과 설명 위 hover 동안 열린 채로 두는 hoverProps를 준다. `useTooltipTriggerState`는 전역 warmup(닫힌 뒤 0.5초 안에는 delay 없이 바로 열고 앞의 것을 `shouldSkipAnimation`으로 닫음)을 갖는다. `useOverlayPosition`(`isOpen`, `onClose`는 `useCloseOnScroll`), `Overlay`의 `disableFocusManagement`, `ariaHideOutside`가 나중에 붙은 노드도 inert로 막고 `data-react-aria-top-layer`는 남기는 것도 소스로 확인했다. Tailwind `transition-none`·`transition-discrete`는 context7 `/tailwindlabs/tailwindcss.com`(transition-property, transition-behavior). WAI-ARIA APG Tooltip Pattern(설명은 `role="tooltip"`, 트리거 `aria-describedby`, 포커스를 받지 않음, Esc로 닫음)을 따랐다.
  - **export 이름**: `Tooltip`(열림 상태, DOM 없음), `TooltipTrigger`(`<button>`), `TooltipContent`(`<div role="tooltip">`), 타입 `TooltipProps`·`TooltipTriggerProps`·`TooltipContentProps`·`TooltipPlacement`.
  - **구현 결정**:
    - ADR 0018 순서: 바깥 `TooltipContent`가 `useOverlayPresence`로 DOM에 둘지 정함 → `OverlayPortal focusManagement={false}` → 안쪽에서 `useOverlayTheme`, `useOverlayPosition` + `overlayPositionProps`, `useTooltip`.
    - motion: `overlay-style.ts`에 「자주 씀」 `frequentMotionClass`를 더했다. 열린 동안 `data-open:transition-none`(새 요소도, 퇴장 중 다시 열려도 바로 불투명), 닫히면 `transition-[opacity,display] transition-discrete duration-fast ease-out`으로 opacity만 150ms, 닫힌 상태 `hidden`·`opacity-0`·`pointer-events-none`. 이동·blur가 없어 reduced-motion에서도 같다. warmup으로 다른 Tooltip에 넘어갈 때(`shouldSkipAnimation`) 앞의 것은 `transition-none`으로 바로 사라진다.
    - 쌓임: `z-tooltip`(500), 루트 `isolate`. 열린 모달 Popover·Dialog의 `ariaHideOutside`가 나중에 body에 붙은 Tooltip도 inert로 막아서, 설명 요소에 `data-react-aria-top-layer`를 붙였다(공개 문서에 없는 속성, ADR 0018 덧붙임과 판단 보류 참고). Popover 안 트리거에서 Esc는 Tooltip만 닫는다(React Aria가 capture에서 전파를 멈춤).
    - 포커스: Tooltip은 포커스를 받지 않으므로 `OverlayPortal`에 `focusManagement` 옵션(기본 `true`)을 더해 FocusScope 없이 portal한다. Popover 동작은 그대로다.
    - 트리거: `useTooltipTrigger`의 props를 `mergeProps`로 붙이고, `tabIndex`는 요소에 맡기며, 앱의 `aria-describedby` 뒤에 설명 id를 더한다. 기본 class 없는 `<button type="button">`, `render`로 IconButton·Button.
    - 위치: `useOverlayPosition({ isOpen, placement, offset, onClose })`. 트리거가 스크롤되면 바로 닫는다. 기본 `top`, `offset` 4px, 공간이 모자라면 뒤집힌다.
    - 표면: `overlaySurfaceClass`(Popover와 같음) + `px-2 py-1 text-body-sm max-w-60`.
  - **color 결정(ADR 0016 덧붙임)**: Tooltip은 설명을 담는 오버레이 구조 Component라 `color`가 없다. 표면은 raised 고정, 트리거 색은 `render`로 준 Button·IconButton의 `color`(Role).
  - **Token과 대비**: `text-default × bg-raised`(4.5:1) 등록, `border-raised` 제외 목록을 components `unit`에 2 tests로 단언했다. 안에 조작 요소가 없어 포커스 표시 쌍은 쓰지 않는다. shadow는 대비 제외. foundation 대비 쌍은 늘지 않았다.
  - **props 표**(모두 client Component)

    | Component        | 요소                     | prop                                                                                                                                           |
    | ---------------- | ------------------------ | ---------------------------------------------------------------------------------------------------------------------------------------------- |
    | `Tooltip`        | 없음                     | `open?`, `defaultOpen?`(기본 `false`), `onOpenChange?(open)`, `delay?`(ms, 기본 `500`), `closeDelay?`(ms, 기본 `300`), `disabled?`, `children` |
    | `TooltipTrigger` | `<button type="button">` | `render?`. `<button>` props 그대로. `ref`·`className`은 그 요소                                                                                |
    | `TooltipContent` | `<div role="tooltip">`   | `placement?: TooltipPlacement`(12가지, 기본 `"top"`), `offset?`(px, 기본 `4`). `role`·`id` 제외                                                |

    상태: 설명 `data-open`(열림), `data-placement`(`top`/`bottom`/`left`/`right`).

  - **테스트**: components browser에 Tooltip 58 tests(29 × instance 2: delay 500ms 뒤 열림(warmup이 끝나기를 먼저 기다림), hover 열림·설명 연결(`aria-describedby`, 접근 가능한 설명)·포커스 안 옮김·떠나면 닫힘, 설명 위 hover 유지(WCAG 1.4.13), 트리거 누름 닫힘, Tab 포커스는 delay 5000에서도 바로 열림·Esc 닫힘·포커스 유지, Tab으로 떠나면 닫힘, 마우스 누름 포커스로는 안 열림, disabled, defaultOpen, open 제어(onOpenChange만), 상태 부모, aria-describedby 합침, IconButton render, portal·z 500·absolute·isolate·data-theme, 열린 Popover 위(z 비교·inert 아님·aria-hidden 아님·elementFromPoint·Esc는 Tooltip만), placement 4방향 4px, 위로 공간 없으면 아래로 뒤집힘, 표면 계산값, dark Theme, forced-colors 경계, 즉시 등장(transition-property none·opacity 1·animations 0), 퇴장(opacity, display만·0.15s·out·allow-discrete·pointer-events none·filter/translate/scale 없음·끝나면 DOM에서 빠짐), 퇴장 중 다시 열면 전환 없이 돌아옴, ref·className, class 없는 기본 트리거, 타입 오류). unit 대비 2 tests. docs storybook Tooltip 6 story(play로 열어 열린 설명까지 a11y 통과, off 없음).
  - **smoke**: page에 서버 컴포넌트에서 `Tooltip` + `render={<IconButton aria-label="새 항목" />}` 트리거 + `placement="bottom"`. `Tooltip.js`에 `"use client"`. 출력 CSS에 `.z-tooltip`·`--tide-z-tooltip`·`data-open\:transition-none`. prerender HTML의 트리거가 `type="button"`·`data-color="neutral"`이고 `aria-describedby`·`role="tooltip"`이 없음. nodenext에 Props 타입 4개와 `role` 타입 오류.
  - **로컬 검증**: `pnpm lint`, `pnpm format:check`, `rm -rf packages/*/dist apps/docs/storybook-static` 후 `pnpm turbo run typecheck test build smoke --force` 15/15 통과. foundation 460, icons 18, components 1218(이전 1158), docs 238(이전 232) tests, smoke 「smoke 통과」, publint 「All good!」. `node scripts/check-changesets.ts main` 통과(`@tide-tds/components` patch). 「Unexpected token '}'」는 나지 않았다. 실패했다 고친 것(모두 테스트 쪽): ① 첫 hover에서 React Aria 입력 방식이 아직 없어(pointermove가 pointerenter보다 늦음) 열리지 않음, ② 앞 테스트의 마우스가 같은 자리에 남아 새 트리거에 pointerenter가 생기지 않음 → 앞 버튼을 먼저 hover하는 `hoverTrigger`, ③ placement left가 공간 부족으로 뒤집힘 → 사방 200px 여백, ④ story play에서 Shift는 입력 방식을 바꾸지 않음 → Tab, Tab이 먼저 닿은 다른 트리거의 설명을 찾음 → 트리거의 `aria-describedby`로 찾음.
  - **ADR·티켓 어긋남**: 없음. 공통 API 규칙 「ref는 루트 DOM」은 Popover처럼 부분마다 적용했다(`Tooltip`은 DOM이 없는 상태 루트).
  - **판단 보류(추천안대로 구현, 사용자 확인 필요)**:
    1. 「바로 나타남」은 motion(전환 없음)으로 읽었다. hover 열기 `delay`는 기본 500ms(React Aria 기본 1500ms보다 짧게), `closeDelay` 300ms(설명으로 포인터를 옮길 틈). 둘 다 prop으로 공개했다.
    2. `data-react-aria-top-layer`(React Aria 공개 문서에 없는 속성)로 모달 Popover·Dialog의 inert를 피한다. 대안은 열린 오버레이 안으로 portal하는 것(`Overlay portalContainer`)인데 Tooltip이 그 오버레이의 `isolate`·overflow에 잘린다.
    3. 기본 `placement` `top`, `offset` 4px, 여백 4px·8px, `text-body-sm`, `max-w-60`(15rem), radius `lg`(Popover와 같음), arrow 없음.
    4. 기본 트리거는 class 없는 `<button>`, 모양은 `render`(Popover와 같음). 비활성 요소의 Tooltip은 지원하지 않고 문서에서 막는다.
    5. 트리거가 스크롤되면 바로 닫는다(`useOverlayPosition` `onClose`).
    6. 트리거에 `data-open`을 두지 않았다(설명에만).
    7. 「trigger: focus만」·`shouldCloseOnPress` 옵션은 공개하지 않았다.
  - **다음 티켓 메모**: Menu·Select·Combobox 목록(27~29)은 `frequentMotionClass`를 그대로 쓴다(열린 동안 `data-open:transition-none`, 닫히면 opacity fast). 포커스를 받지 않는 오버레이는 `OverlayPortal focusManagement={false}`. React Aria Tooltip의 hover는 마지막 입력이 pointer일 때만 열리므로 테스트에서 첫 hover 전에 다른 요소를 hover하고, 같은 자리에 새로 그린 요소에는 pointerenter가 생기지 않으니 다른 요소를 거쳐 들어간다. story play에서 키보드 입력 방식으로 바꾸려면 Shift가 아닌 Tab을 누른다. 열린 모달 오버레이 위에 뜨는 별도 portal(Toast 등)은 `ariaHideOutside`가 inert로 막으므로 `data-react-aria-top-layer`가 필요한지 확인한다.
