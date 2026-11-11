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
- 2026-11-11 flaky 테스트 원인과 수정(브랜치 `fix-flaky-overlay-tests`, main 84ec960 위). 테스트만 바꿨고 제품 코드는 그대로다.
  - **증상**: 「hover로 열고 닫기 > 마우스를 올리면 열리고 설명이 트리거에 연결되며, 떠나면 닫힌다」가 Release run 43005291973 attempt 2(ubuntu-latest)와 로컬에서 두 instance 모두 가끔 실패했다. 실패한 줄은 render 바로 다음의 `expect(trigger()).not.toHaveAttribute("aria-describedby")`(108행)이고 받은 값은 `react-aria-_r_1_`이다. 즉 「떠난 뒤 안 닫힘」이 아니라 **마우스를 올리기 전에 이미 열려 있었다**. trace에도 `react.render` 한 단계만 있다.
  - **원인**: 앞 테스트(「delay(기본 500ms)가 지난 뒤에 열린다」)가 마우스를 트리거 위에 둔 채 끝나고, 다음 테스트가 같은 레이아웃(같은 자리)에 트리거를 다시 그린다. Chromium은 멈춘 마우스 아래에 새 요소가 그려지면 약 0.1초 뒤 가짜 mouse move로 그 요소에 `pointerenter`(pointerType `mouse`)를 보낸다. 실험: 요소 a를 hover한 뒤 다음 테스트에서 같은 자리에 b를 그리면 render 뒤 약 93ms에 `b pointerenter mouse`가 찍혔다. React Aria 3.53.1 `useTooltipTrigger`의 `onHoverStart`는 `pointerenter`와 전역 modality가 `pointer`인지만 보고 연다(설치본 `dist/private/tooltip/useTooltipTrigger.mjs`). modality는 앞 테스트 hover로 `pointer`이고 이 테스트는 `delay={0}`이라 바로 열린다. 그래서 render 직후 단언이 이 0.1초 타이머보다 먼저 돌면 통과, 부하로 늦으면 실패한다. render 뒤 `wait(150)`을 넣으면 두 instance 모두 매번 같은 메시지로 실패했다(결정적 재현).
  - 위 「다음 티켓 메모」의 「같은 자리에 새로 그린 요소에는 pointerenter가 생기지 않으니」는 틀렸다. 생긴다(약 0.1초 뒤). `hoverTrigger` 주석도 고쳤다.
  - **수정**: browser 명령 `mouseLeavePage`(`test/commands.ts`, Playwright `page.mouse.move(-1, -1)`)를 더하고 `test/browser-setup.ts`의 `beforeEach`에서 테스트마다 부른다. 테스트 iframe이 viewport 전체(414×896, 0,0 기준)를 덮어 안쪽에는 빈 자리가 없고, (-1, -1)로 옮기면 포인터가 문서를 떠나 다음 hover 전까지 새로 그린 요소에 `pointerenter`가 생기지 않는다(실험: (0,0)·(413,895)와 달리 (-1,-1)만 아무 enter도 없음). 모든 browser 테스트 파일에 걸리므로 hover로 여는 다른 오버레이(Menu 하위 메뉴)도 같은 잔류를 피한다. 단언하는 동작은 바꾸지 않았다.
  - **반복 결과**: CPU 코어 10개에 busy loop 10개를 건 부하에서, 수정 전 코드(Tooltip·Combobox 두 파일)는 10회 중 1회 Tooltip이 CI와 같은 단언(108행)으로 실패했다. 수정 후 Tooltip·Combobox·Popover·Menu·Select·Dialog 여섯 파일(두 instance, 406 tests)을 같은 부하에서 20회 돌려 0회 실패. `pnpm lint`, `pnpm format:check`, `rm -rf packages/*/dist apps/docs/storybook-static` 후 `pnpm turbo run typecheck test build smoke --force` 15/15 통과(components 1580 tests). 테스트만 바꿨지만 `scripts/check-changesets.ts`가 `packages/*` 변경에 changeset을 요구하므로 empty changeset(`.changeset/fix-flaky-overlay-tests.md`)을 넣었다(티켓 11 선례).
  - **티켓 20 cold import 실패와의 관계**: 관련 없다고 본다. 티켓 20은 「Failed to import test file … SyntaxError」(모듈 import 단계)이고, 이 건은 테스트가 import·실행된 뒤의 단언 타이밍이다. 조사 중 한 번 「optimized dependencies changed. reloading」 뒤 「Vitest failed to find the runner」로 import가 실패했는데, foundation dist 없이 실행이 중단된 직후의 남은 optimizer 상태에서만 났고, `node_modules/.vite`·`.vitest`를 지운 정상 cold 실행 2회에서는 reload 없이 통과했다. 티켓 20의 SyntaxError와 메시지도 다르다.
