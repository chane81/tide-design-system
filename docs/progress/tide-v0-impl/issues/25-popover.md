# 25: Popover

Status: done
Blocked by: 19 (Badge·Card·Separator), 20 (Alert), 21 (Avatar), 22 (Skeleton과 Progress), 23 (Table), 24 (Breadcrumb과 Pagination)

> 단계 경계: 3단계(19~24)가 끝난 뒤 사람이 Version PR을 머지해 0.3.0을 낸 다음에 시작한다(별도 티켓 없음).

## What to build

앱 개발자가 `Popover`로 트리거 옆에 내용을 띄운다. 이 티켓은 4단계 모든 오버레이(Tooltip, Menu, Select, Combobox, Dialog, Toast)가 재사용할 기반(portal, 쌓임 단계, 등장·퇴장 motion, 위치)을 만든다. 키보드 사용자는 Esc로 닫고 포커스가 트리거로 돌아온다.

## 수용 기준

- [x] React Aria hooks로 만든다. `react-aria-components`, Base UI, Radix는 쓰지 않는다. 쓴 hook의 API는 설치 버전 문서로 확인하고 근거 버전을 남긴다.
- [x] top-layer(`<dialog>`, popover API)는 쓰지 않는다. React Aria portal과 `z-popover`로 쌓는다. Component 내부 겹침은 루트 `isolate`와 `z-0`/`z-1`로만 처리한다.
- [x] raised 표면, `shadow-md`, radius `lg`, light 투명 border.
- [x] 등장: opacity + blur 4px + translate 4px, `normal`. 퇴장: 같은 조합 절반 세기, `fast`. CSS transition, `@starting-style`, `allow-discrete`로 구현하고 `transition-all`은 쓰지 않는다. 지원하지 않는 브라우저에서는 바로 나타나고 사라진다.
- [x] reduced-motion에서는 이동·blur를 opacity 전환으로 바꾼다.
- [x] 이후 오버레이가 재사용할 수 있게 오버레이 공통 부분(portal, 쌓임, motion)을 나눈다.
- [x] `open`/`defaultOpen`/`onOpenChange(open)`, `data-open` 노출.

### 구현 중 확인할 것

- [x] React Aria hooks와 함께 사라질 때 애니메이션을 쓸 수 있는지 확인한다. 어렵다면 바로 사라지게 둬도 완료로 보고, 결과를 Comments에 남긴다.
- [x] `useOverlayPosition`이 트리거를 덮지 않는 위치를 보장하는지(WCAG 2.4.11) 확인하고 결과를 Comments에 남긴다.

### 테스트

- [x] `browser`: 열고 닫기(클릭, Esc, 바깥 클릭), 포커스 이동과 트리거로 복귀, 제어/비제어, 트리거를 덮지 않는 위치, forced-colors 경계, reduced-motion opacity 전환을 단언한다.

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

- 2026-11-11 완료(브랜치 `ticket-25-popover`, main 2dbd796 위).
  - **단계 경계 어긋남(사람 확인 필요)**: 티켓은 「0.3.0 Version PR 머지 후 시작」인데, 시작 시점의 main에는 티켓 19~24 changeset 6개가 그대로 있고 패키지는 0.2.0이다(0.3.0 미배포). 조율 세션의 지시로 진행했고 브랜치에만 커밋했다. 이 브랜치를 Version PR보다 먼저 main에 머지하면 Popover가 0.3.0에 섞인다. 0.3.0 Version PR을 먼저 머지한 뒤 이 브랜치를 머지해야 한다.
  - **근거 버전**: react-aria 3.53.1, react-stately 3.51.0(이미 components 의존성, 새 의존성 없음, `minimumReleaseAge` 그대로), react 19.3.1, tailwindcss 4.3.5, vitest·@vitest/browser-playwright 5.1.0, vitest-browser-react 2.3.0, playwright 1.65.0(Chromium), storybook 10.6.6, vite 8.3.6, typescript 7.0.2.
  - **API 확인**: context7 `/websites/react-aria_adobe`(Popover/usePopover: `usePopover`·`AriaPopoverProps`·`PopoverAria`, `useOverlayTriggerState`, `useOverlayTrigger`, styling 페이지의 `isExiting`)와 설치본 3.53.1 `dist/private/overlays/*`(usePopover·useOverlay·useOverlayPosition·calculatePosition·Overlay·DismissButton·ariaHideOutside, `dialog/useDialog`)를 읽어 동작을 확인했다: `usePopover`는 모달 기본값에서 바깥을 `ariaHideOutside(..., { shouldUseInert: true })`로 `inert`하고 스크롤을 잠근다. `underlayProps`는 빈 객체다. `useOverlayPosition`은 위치 style에 `zIndex: 100000`을 넣는다. `Overlay`는 `FocusScope restoreFocus`로 감싸고 `contain`은 `useOverlayFocusContain`(useDialog가 부름) 요청 && `!isExiting`이다. `useDialog`는 마운트 때 dialog 자신에 포커스를 주고 안의 요소가 이미 포커스면 두며, `aria-label`이 없으면 제목 slot id를 `aria-labelledby`로 쓴다. 서브패스(`react-aria/usePopover`)도 있지만 루트 entry로 import했다(아래 결정). Tailwind `starting:`·`transition-discrete`·`--blur-xs: 4px`는 context7 `/tailwindlabs/tailwindcss.com`(hover-focus-and-other-states, transition-behavior, theme). Storybook play·`storybook/test`와 Docs에서 play가 돌지 않는 것(`parameters.docs.story.autoplay` 기본 false)은 context7 `/storybookjs/storybook/v10.6.5`. Vite 중첩 `optimizeDeps.include`(`a > b`)는 context7 `/vitejs/vite`(dep-optimization-options).
  - **export 이름**: `Popover`(열림 상태, DOM 없음), `PopoverTrigger`(`<button>`), `PopoverContent`(`<div role="dialog">`), 타입 `PopoverProps`·`PopoverTriggerProps`·`PopoverContentProps`·`PopoverPlacement`.
  - **오버레이 공통 부분(ADR 0018)**: `overlay.tsx`("use client") — `useOverlayPresence`(닫힌 뒤 `getAnimations()`가 끝날 때까지 DOM에 남김), `usePopoverOverlay`(`usePopover` + Tide 규칙), `overlayPositionProps`(zIndex 100000 제거, `data-placement`), `useOverlayTheme`(트리거의 `data-theme`을 portal로 옮김), `OverlayPortal`(React Aria `Overlay`). `overlay-style.ts`(지시어 없음) — `overlaySurfaceClass`, `popoverMotionClass`. 공개 export는 하지 않는다.
  - **구현 결정**:
    - motion: 열림은 `data-open`, 등장은 `starting:`(opacity 0 + `blur-xs` + 트리거 쪽 `*-translate-*-1`)에서 `data-open:duration-normal`(300ms), 퇴장은 `not-data-open:`(opacity 0 + `blur-[2px]` + 0.5 = 2px 이동, `duration-fast` 150ms)이고 easing은 둘 다 out이다. 닫힌 상태는 `hidden`이고 `transition-discrete`로 display까지 전환해 퇴장이 끝날 때 사라진다. 전환 대상은 `transition-[opacity,display]`, `motion-safe:`에서만 `transition-[opacity,filter,translate,display]`이고 이동·blur도 `motion-safe:`에만 둬서 움직임 줄이기에서는 opacity만 바뀐다. 퇴장 중에는 `pointer-events-none`. `transition-all`은 없다.
    - 퇴장 애니메이션(구현 중 확인할 것 1): **hooks로 쓸 수 있다.** 바깥 Component가 `useOverlayPresence`로 DOM에 둘지 정하고, 닫히면 요소의 `getAnimations()`를 `allSettled`로 기다려 도는 전환이 없을 때 뺀다. 등장 중에 닫으면 앞 전환이 취소(finished reject)되므로 다시 확인한다. 퇴장 중 다시 열면 같은 요소가 남는다. 포커스는 FocusScope가 DOM에서 빠질 때(퇴장 끝, 최대 150ms 뒤) 트리거로 돌려준다.
    - WCAG 2.4.11(구현 중 확인할 것 2): `calculatePosition`은 주축 위치를 항상 「트리거 변 + offset」으로 두고, 공간이 모자라면 반대쪽 공간이 더 클 때만 뒤집고, 교차축만 화면 안으로 민다. top/bottom에서는 높이를 `max-height`로 줄인다. 그래서 **주축으로는 트리거를 덮지 않는다**(테스트: 네 방향 8px 간격, 아래 공간 부족 → 위로 뒤집힘, 위아래 모두 부족 → 높이 축소·스크롤하며 겹침 없음). 폭은 줄이지 않으므로 left/right에서 화면 밖으로 나갈 수는 있다(`max-w-80`으로 줄여 둠). 내용에 `overflow-auto`를 둬서 줄인 높이에서 스크롤한다.
    - 쌓임: React Aria의 inline `zIndex: 100000`을 빼고 `z-popover`(300)만 쓴다. 루트 `isolate`.
    - 트리거: `useOverlayTrigger({ type: "dialog" })`의 `onPress`를 `usePress`로 붙인다(공개 이름에 onPress 없음). 기본은 class 속성 없는 `<button type="button">`, `render={<Button />}`·`render={<IconButton aria-label />}`로 모양을 준다(renderElement 병합). `aria-expanded`, 열렸을 때 `aria-controls`·`data-open`.
    - 내용: `useDialog`로 `role="dialog"`·`tabIndex=-1`·열 때 포커스. 이름은 `aria-label`/`aria-labelledby`, 둘 다 없으면 트리거 id(react-aria-components Dialog와 같은 fallback). 트리거에 `id`를 주면 그 id를 쓴다. 앞뒤에 React Aria `DismissButton`(숨김, tabIndex -1). 모달 기본이라 Tab은 안에서 돈다. 역할 hook이 Overlay context로 포커스 가두기를 요청하므로 hook을 부르는 안쪽 Component를 portal 안에 둔다(처음엔 바깥에 둬서 Tab 순환이 안 됐다).
    - 표면: `rounded-lg border border-raised bg-raised text-default shadow-md`, 여백 `p-4`, `text-body-md`, `max-w-80`, `outline-none`(표면 전체가 포커스 위치).
    - Theme: portal은 `body`로 나가므로 트리거에서 가장 가까운 `[data-theme]`을 내용에 옮긴다. 위치 hook보다 먼저 붙인다.
    - import: 루트 entry(`react-aria`, `react-stately`). 첫 전체 실행에서 Vite가 서브패스 8개를 실행 중에 사전 번들하며 페이지를 새로 고쳐 Checkbox·Switch·Popover 테스트 파일 import가 실패했다(「Failed to fetch dynamically imported module」, Unexpected token 아님). 루트 entry로 바꾸고 components vitest와 docs storybook의 `optimizeDeps.include`에 `react-aria`·`react-stately`를 더했다(docs는 `@tide-tds/components > react-aria` 중첩 문법). 루트면 다음 티켓이 hook을 더해도 목록이 바뀌지 않는다. 패키지가 `sideEffects: false`라 앱 번들에는 쓰는 것만 남는다.
  - **color 결정(ADR 0016 덧붙임)**: Popover는 내용을 담는 오버레이 구조 Component라 `color`가 없다. 표면은 raised 고정이고 트리거 색은 `render`로 준 Button의 `color`(Role)가 정한다.
  - **Token과 대비**: `text-default × bg-raised`(4.5:1), `outline-focus × bg-raised`(3:1, 안의 조작 요소) 등록, `border-raised`는 제외 목록(장식용)에 있음을 components `unit`에 3 tests로 단언했다. shadow는 대비 제외. foundation 대비 쌍은 늘지 않았다.
  - **props 표**(모두 client Component)

    | Component        | 요소                     | prop                                                                                               |
    | ---------------- | ------------------------ | -------------------------------------------------------------------------------------------------- |
    | `Popover`        | 없음                     | `open?`, `defaultOpen?`(기본 `false`), `onOpenChange?(open)`, `children`                           |
    | `PopoverTrigger` | `<button type="button">` | `render?`. `<button>` props 그대로. `ref`·`className`은 그 요소                                    |
    | `PopoverContent` | `<div role="dialog">`    | `placement?: PopoverPlacement`(12가지, 기본 `"bottom"`), `offset?`(px, 기본 `8`). `role`·`id` 제외 |

    상태: 트리거·내용 `data-open`(열림), 내용 `data-placement`(`top`/`bottom`/`left`/`right`).

  - **motion·포커스·forced-colors**: chromium instance에서 등장 전환의 시작값(opacity 0, `blur(4px)`, `0px -4px`)·0.3s·out·allow-discrete, 퇴장의 끝값(opacity 0, `blur(2px)`, `0px -2px`)·0.15s·display 전환·pointer-events none·끝난 뒤 DOM에서 빠짐을, reduced-motion instance에서 transition-property가 `opacity, display`이고 filter·translate 전환이 없음을 단언했다. forced-colors instance에서 box-shadow none, 1px 경계가 투명이 아님. 포커스: 열면 dialog, autoFocus 입력, Tab 순환, Esc·바깥 누름 후 트리거 복귀.
  - **테스트**: components browser에 Popover 58 tests(29 × instance 2: 트리거 누름 열고 닫기·aria-expanded/controls/data-open, Enter·Space 열기와 Esc 복귀, 바깥 누름 닫기와 inert, 안 누름 유지, Tab 순환, autoFocus, defaultOpen 비제어, open 제어(onOpenChange만 부름)·rerender, 상태 부모, 이름 fallback·트리거 id·aria-label·aria-labelledby, Button render, portal·z 300·absolute·isolate·data-theme 이어받기, dark Theme, placement 4방향 8px, 위로 뒤집힘, 높이 축소 스크롤, 표면 계산값, forced-colors 경계, 등장, 퇴장, 퇴장 중 다시 열기, ref·className, class 없는 기본 트리거, 타입 오류). unit 대비 3 tests. docs storybook Popover 6 story(play로 열어 열린 내용까지 a11y 통과, off 없음).
  - **smoke**: page에 서버 컴포넌트에서 `Popover` + `render={<Button variant="outline" />}` 트리거 + `placement="bottom start"`. `Popover.js`·`overlay.js`에 `"use client"`, `overlay-style.js`에 없음. 출력 CSS에 `.z-popover`·`--tide-z-popover`·`@starting-style`·`transition-behavior: allow-discrete`·`not-data-open\:hidden`·`motion-safe\:starting\:blur-xs`. prerender HTML의 트리거가 `type="button"`·`aria-expanded="false"`·`data-color="primary"`이고 `aria-controls`·`data-open`·`role="dialog"`가 없음. nodenext에 Props 타입 4개와 `role` 타입 오류.
  - **로컬 검증**: `pnpm lint`, `pnpm format:check`, `rm -rf packages/*/dist apps/docs/storybook-static` 후 `pnpm turbo run typecheck test build smoke --force` 15/15 통과. foundation 460, icons 18, components 1158(이전 1097), docs 232(이전 226) tests, smoke 「smoke 통과」, publint 「All good!」. `node scripts/check-changesets.ts main` 「changeset 규칙 통과」(`@tide-tds/components` patch). 「Unexpected token '}'」는 나지 않았다. 실패했다 고친 것: ① 위 사전 번들 새로 고침, ② 전체 실행 부하에서 Playwright 입력이 수 초 걸려 전환(150·300ms)이 먼저 끝남 → 전환 중 값을 읽는 motion·다시 열기 테스트는 제어 prop rerender로 바꿈, ③ 등장 중 Esc로 닫으면 취소된 전환 때문에 DOM에서 빠지지 않던 버그(allSettled 후 재확인으로 고침), ④ placement right 간격이 소수 px로 7 → 1px 오차 허용.
  - **ADR·티켓 어긋남**: 단계 경계(위). 공통 API 규칙 「ref는 루트 DOM」은 부분마다 적용했다. `Popover`는 DOM이 없는 상태 루트라 `ref`·`className`이 없다(spec 「여러 부분 Component는 부분마다 className」). 그 밖의 어긋남은 없다.
  - **판단 보류(추천안대로 구현, 사용자 확인 필요)**:
    1. 모달 popover(React Aria 기본): 열린 동안 바깥 `inert`·스크롤 잠금·Tab 순환. 바깥과 함께 쓰는 비모달 옵션은 공개하지 않았다(내부 `nonModal`만, Combobox용).
    2. 이름 fallback은 트리거 글자. `PopoverTitle`·`PopoverClose` 부분이 없다(제목은 앱 heading + `aria-labelledby`, 닫기는 `open` 제어).
    3. 기본 트리거는 class 없는 `<button>`이다. Button 모양은 `render={<Button />}`(Tide Button을 기본으로 렌더하지 않음).
    4. 기본 `placement` `bottom`(가운데), `offset` 8px, 여백 16px, `max-w-80`(20rem), `text-body-md`. 화살표(arrow) 없음.
    5. 내용 자신의 포커스 표시는 없음(`outline-none`). 안의 조작 요소는 focus-ring.
    6. 트리거의 `data-theme`을 portal로 옮긴다(Theme을 영역에 붙인 앱 대응). 트리거 위에 Theme이 없으면 붙이지 않는다.
    7. 포커스 복귀는 퇴장 전환이 끝난 뒤(최대 150ms)다. 닫는 즉시 돌려주려면 Tide가 따로 짜야 한다.
    8. 첫 프레임 등장 방향은 요청한 placement 기준이라, 뒤집힌 경우에만 4px 반대에서 시작한다.
  - **다음 티켓 메모**: 26~30·34는 ADR 0018의 순서(바깥 `useOverlayPresence` → `OverlayPortal` → 안쪽에서 위치·역할 hook)를 따른다. 역할 hook(useDialog·useMenu 등)은 portal 안쪽 Component에서 불러야 포커스 가두기가 동작한다. Tooltip은 dismiss가 달라 `useOverlayPosition` + `overlayPositionProps`, `z-tooltip`, 「자주 씀」 motion(바로 등장, `not-data-open:` opacity fast)을 `overlay-style.ts`에 더한다. Menu·Select 목록은 `overlaySurfaceClass` + 「자주 씀」 motion. Dialog는 `useModalOverlay`·`z-modal`·scale motion을 같은 구조로 더한다. 열린 동안 바깥이 inert라 Playwright `click`이 바깥 요소를 못 누른다 → `commands.mouseDownOn`·`mouseUp`. 전환 중 계산값은 Playwright 입력 대신 제어 prop rerender 뒤 곧바로 읽는다(부하에서 입력이 수 초 걸림). portal 내용은 story의 `canvasElement` 밖이라 play에서 `within(canvasElement.ownerDocument.body)`로 찾고 등장 전환(opacity 0 시작)이 끝난 뒤 `toBeVisible`을 본다. React Aria는 루트 entry로 import한다(서브패스를 쓰면 vitest·storybook `optimizeDeps.include`를 함께 늘려야 한다).
