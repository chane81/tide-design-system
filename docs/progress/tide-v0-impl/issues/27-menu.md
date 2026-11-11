# 27: Menu

Status: done
Blocked by: 25 (Popover)

## What to build

앱 개발자가 `Menu`로 동작 목록을 띄운다. 키보드 사용자는 화살표로 이동하고 Enter로 실행하며, 현재 위치는 배경 강조(highlight)로 보인다. 이 티켓의 목록 규칙을 Select와 Combobox가 재사용한다.

## 수용 기준

- [x] React Aria hooks로 만든다. `react-aria-components`, Base UI, Radix는 쓰지 않는다. 쓴 hook의 API는 설치 버전 문서로 확인하고 근거 버전을 남긴다.
- [x] Popover 기반을 재사용한다. 자주 쓰는 오버레이이므로 바로 나타나고 사라질 때만 opacity `fast`.
- [x] 목록: raised 표면, `shadow-md`, radius `lg`, padding 3px. 항목 radius `sm`(중첩 규칙).
- [x] 항목의 hover와 키보드 위치 표시는 highlight(primary subtle 배경 + primary text, 투명 outline)이고 transition 없이 즉시 바뀐다.
- [x] raised 위 항목 규칙: 기본 투명, hover `subtle-hover`, 선택 유지 `subtle-active`.
- [x] 이후 Select·Combobox가 재사용할 수 있게 목록·항목 부분을 나눈다.
- [x] `browser`: 메뉴 역할, 화살표·Home/End 탐색, Enter 실행, Esc 닫기와 포커스 복귀, highlight 계산값, forced-colors에서 highlight 위치가 보이는지 단언한다.

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

- 2026-11-11 완료(브랜치 `ticket-27-menu`, main 28ff581 위).
  - **근거 버전**: react-aria 3.53.1, react-stately 3.51.0(이미 components 의존성, 새 의존성 없음, `minimumReleaseAge` 그대로), react 19.3.1, next 16.4.5, tailwindcss 4.3.5, vitest·@vitest/browser-playwright 5.1.0, playwright 1.65.0(Chromium), storybook 10.6.6, typescript 7.0.2.
  - **API 확인**: context7 `/websites/react-aria_adobe`(Menu/useMenu: `useMenuTriggerState`·`useTreeState`·`useMenuTrigger`·`useMenu`·`useMenuItem`·`useMenuSection`, `AriaMenuOptions`의 `shouldFocusWrap`·`escapeKeyBehavior`)와 설치본 dist 소스·d.ts를 읽어 동작을 확인했다: `useMenuTrigger`는 마우스 pressStart에서 열고(목록 자신에 포커스), Enter·Space·↓는 `first`, ↑는 `last`로 열며 `menuProps`에 `aria-labelledby`(트리거 id)·`autoFocus`·`onClose`를 준다. `useMenu`는 `role="menu"`와 목록 키보드(순환 기본 `true`, Esc는 넘김)를, `useMenuItem`은 hover 때 위치를 옮기고(키보드 입력 방식이 아닐 때), Enter·Space에서 `click()`을 부르며, click에서 앱 `onClick` → 닫기 순으로 부르고, 비활성이면 click 처리를 붙이지 않는다. 항목의 keydown은 전파를 멈춘다. `SelectionManager.isDisabled`가 node `props.isDisabled`를 읽는다. react-stately `Item`·`Section`·`CollectionBuilder`(type의 `getCollectionNode`, Fragment 펼침, key는 요소 key 또는 자리 번호). next 16.4.5에 든 react-server-dom-webpack client가 client 참조 요소 type을 lazy(`createLazyChunkWrapper`)로 만드는 것도 소스로 확인했다. Tailwind v4 `outline-none`(outline-style none)·`outline-hidden`·`outline-2`는 context7 `/tailwindlabs/tailwindcss.com`(upgrade guide, outline-style/width). WAI-ARIA APG Menu Button 패턴(트리거 `aria-haspopup`·`aria-expanded`, ↓↑로 열기, Home/End, 타입어헤드, Esc·Tab으로 닫기)을 따랐다.
  - **export 이름**: `Menu`(열림 상태, DOM 없음), `MenuTrigger`(`<button>`), `MenuContent`(`<div role="menu">`), `MenuItem`(`<div role="menuitem">`), `MenuSection`(묶음), 타입 `MenuProps`·`MenuTriggerProps`·`MenuContentProps`·`MenuItemProps`·`MenuSectionProps`·`MenuPlacement`.
  - **구현 결정**:
    - ADR 0018 순서 그대로: `useOverlayPresence` → `OverlayPortal`(포커스를 받으므로 `focusManagement` 기본 `true`, 닫히면 트리거로 포커스 복귀) → `useOverlayTheme` → `usePopoverOverlay`(모달 기본: 바깥 inert·스크롤 잠금) + `useTreeState` + `useMenu`. 공통 모듈(`overlay.tsx`·`overlay-style.ts`)은 고치지 않았다. ADR 0018에 덧붙임을 남겼다.
    - Select·Combobox 재사용을 위해 둘로 나눴다. `list-style.ts`: 목록 루트(`listPopupClass` = 오버레이 표면 + 여백 3px + `frequentMotionClass` + `z-popover` + `min-w-40 max-w-80 overflow-auto`), 항목(`listItemClass`), 묶음 제목(`listHeadingClass`), 구분선(`listSeparatorClass`). `list-collection.ts`: 항목·묶음 Component에 붙이는 `getCollectionNode`(Tide 이름 `disabled`→`isDisabled`, `heading`→묶음 제목, children 글자로 기본 `textValue`), 서버 컴포넌트 lazy 참조를 풀고 Fragment를 펼치는 `resolveCollectionChildren`. 둘 다 `"use client"` 없음. 구조 결정은 ADR 0019로 남겼다.
    - 항목 Component(`MenuItem`·`MenuSection`)는 `null`을 렌더하는 표시 요소이고, `MenuContent`가 컬렉션 node를 돌며 직접 그린다. React 19에서 `ref`가 props에 있으므로 항목 `ref`도 node.props에서 받아 붙인다.
    - 목록은 요소 하나(`<div role="menu">`)다. Popover의 숨은 닫기 버튼(DismissButton)은 menu 안에 둘 수 없어(menu의 자식은 menuitem·group·separator) 두지 않았다. Esc·바깥 누름·Tab으로 닫는다.
    - Tab: React Aria `useMenu`가 다루지 않고, 항목 keydown이 전파를 멈추며, `FocusScope`가 document capture에서 먼저 받아서 React 핸들러로는 받을 수 없었다. window capture에서 받아 기본 동작을 막고 닫는다(포커스는 트리거로 돌아온다).
    - 실행 prop은 DOM 이름 `onClick`이다. `useMenuItem`이 Enter·Space에서 요소 `click()`을 부르므로 네이티브 버튼처럼 키보드 실행에서도 불린다. React Aria 이름(`onAction`)은 드러내지 않는다.
    - 항목 `aria-labelledby`·`aria-describedby`: `useMenuItem`은 글자·설명·단축키 자리용 id를 걸지만 Tide 항목은 내용 전체가 이름이라 빼고 앱이 준 값만 남긴다(없는 id를 가리키지 않게).
    - 항목 상태 노출: `data-highlighted`(React Aria `isFocused`, 키보드 위치와 hover), `data-disabled`, 그리고 `aria-disabled`(React Aria). Combobox(가상 포커스)에서도 같은 class가 쓰이도록 `:focus`가 아닌 `data-highlighted`로 칠한다.
    - 항목 모양: highlight = `bg-primary-subtle text-primary` + `outline-2 outline-solid -outline-offset-2 outline-transparent`(기본 `outline-none`이 outline 모양 변수를 none으로 두므로 `outline-solid`가 필요했다). highlight가 아닌 hover는 `bg-neutral-subtle-hover`, `data-selected`(Select용)는 `bg-neutral-subtle-active`, 상태끼리는 `not-data-highlighted:`로 서로 뺀다. transition 없음. radius `sm`, `px-2 py-1.5 text-body-md`(높이 36px), 바로 안의 svg는 16px.
    - 묶음: `useMenuSection` 구조(`presentation` 감싸개 + `presentation` 제목 + `group`), 묶음과 이웃한 항목·묶음 사이에 `<div role="separator">`(storybook a11y 통과).
    - 위치: 기본 `bottom start`, `offset` 4px(Tooltip과 같고 Popover 8px보다 가깝다).
  - **color 결정(ADR 0016 덧붙임)**: Menu는 동작을 담는 오버레이 구조 Component라 `color`가 없다. 항목 상태 색은 정해진 Token이다. 위험 항목(삭제)의 danger 색은 v0에 없다(판단 보류).
  - **Token과 대비**: `text-default × bg-raised`, `text-primary × bg-primary-subtle`(highlight), `text-default × bg-neutral-subtle-hover/active`(raised 위 항목), `text-muted × bg-raised`(묶음 제목) 등록과 `text-disabled`·`border-default`·`border-raised` 제외를 components `unit`에 5 tests로 단언했다. foundation 대비 쌍은 늘지 않았다.
  - **props 표**(모두 client Component)

    | Component     | 요소                                  | prop                                                                                                  |
    | ------------- | ------------------------------------- | ----------------------------------------------------------------------------------------------------- |
    | `Menu`        | 없음                                  | `open?`, `defaultOpen?`(기본 `false`), `onOpenChange?(open)`, `children`                              |
    | `MenuTrigger` | `<button type="button">`              | `render?`. `<button>` props 그대로. `ref`·`className`은 그 요소                                       |
    | `MenuContent` | `<div role="menu">`                   | `placement?: MenuPlacement`(12가지, 기본 `"bottom start"`), `offset?`(px, 기본 `4`). `role`·`id` 제외 |
    | `MenuItem`    | `<div role="menuitem">`               | `onClick?`(키보드 실행 포함), `disabled?`(기본 `false`), `textValue?`(기본 내용 글자). `role` 제외    |
    | `MenuSection` | `<div role="presentation">` + `group` | `heading?: ReactNode`, `aria-label?`, `className?`(감싸개)                                            |

    상태: 트리거·목록 `data-open`, 목록 `data-placement`, 항목 `data-highlighted`·`data-disabled`.

  - **테스트**: components browser에 Menu 72 tests(36 × instance 2: 마우스로 열면 목록 자신에 포커스·highlight 없음·트리거 aria 속성, Enter·Space·↓는 첫 항목·↑는 마지막 항목, Esc·바깥 누름·Tab으로 닫고 트리거로 포커스 복귀, ↓↑ 순환·비활성 건너뛰기, Home/End, 영문 타입어헤드, Enter·Space·누름 실행(`onClick` 한 번, 닫힘, `onOpenChange(false)`), 비활성 항목(aria-disabled·data-disabled·실행 안 함·cursor·text-disabled), highlight 계산값(primary subtle·primary text·outline 2px solid transparent offset -2px·transition 0s·옮기면 바로 투명), hover로 위치 이동·비활성은 이동 안 함, forced-colors에서 highlight outline이 시스템 색이고 다른 항목은 outline 없음, 선택 유지 subtle-active·겹치면 highlight, highlight 아닌 hover subtle-hover, 묶음 group 이름·구분선 2개·제목 presentation·text-muted·묶음 넘는 이동, Fragment·배열·lazy 참조 항목, 아이콘 항목 타입어헤드·아이콘 16px, defaultOpen, open 제어, 상태 부모, 이름(트리거·aria-label·트리거 id), Button render, portal·z 300·absolute·isolate·data-theme·bottom start 4px, 표면 계산값(여백 3px·radius 8/4px·shadow-md·min/max 폭), dark Theme highlight, 즉시 등장·퇴장 opacity fast·allow-discrete·DOM에서 빠짐·퇴장 중 다시 열기, ref·className(항목 포함), class 없는 기본 트리거, 타입 오류). unit 대비 5 tests. docs storybook Menu 6 story(play에서 Tab 후 Enter로 열어 highlight까지 a11y 통과).
  - **smoke**: page(서버 컴포넌트)에 `Menu` + `render={<Button variant="outline" />}` 트리거 + 항목·묶음·비활성 항목. `Menu.js`에 `"use client"`, `list-style.js`·`list-collection.js`에는 없음. 출력 CSS에 `data-highlighted:bg-primary-subtle`·`p-[3px]`. prerender HTML의 트리거가 `type="button"`·`aria-haspopup="true"`·`aria-expanded="false"`이고 `role="menu"`가 없음. nodenext에 Props 타입 6개와 `role`·`onAction` 타입 오류.
  - **로컬 검증**: `pnpm lint`, `pnpm format:check`, `rm -rf packages/*/dist apps/docs/storybook-static` 후 `pnpm turbo run typecheck test build smoke --force` 15/15 통과. foundation 460, icons 18, components 1293(이전 1218), docs 244(이전 238) tests, smoke 「smoke 통과」, publint 「All good!」. `node scripts/check-changesets.ts main` 통과(`@tide-tds/components` patch). 「Unexpected token '}'」는 나지 않았다. 실패했다 고친 것: ① highlight outline이 none(`outline-none`의 `--tw-outline-style: none`을 `outline-2`가 그대로 씀) → `outline-solid` 추가, ② Tab이 닫지 않음(위 구현 결정) → window capture, ③ 한글 글자 타입어헤드가 keydown 글자로 오지 않음 → 영문 항목으로 테스트하고 문서에 적음, ④ 앞 테스트의 마우스가 항목 위에 남아 hover 배경이 생김 → 바깥을 먼저 hover. 첫 실행에서 Tab 테스트가 끝나지 않아 `timeout`으로 멈춘 적이 있다(이후 `--testTimeout`으로 실행).
  - **ADR·티켓 어긋남**: 없음. 공통 API 규칙 「ref는 루트 DOM」은 Popover처럼 부분마다 적용했다(`Menu`는 DOM이 없는 상태 루트, `MenuSection`의 `className`은 감싸개). 「다음 빈 번호」 ADR은 가장 큰 번호 다음인 0019로 했다(0012·0014는 처음부터 없는 번호).
  - **판단 보류(추천안대로 구현, 사용자 확인 필요)**:
    1. 항목 모으기를 React Stately 요소 방식(`getCollectionNode`)으로 했다. 항목을 앱 Component로 감쌀 수 없고, 서버 컴포넌트 지원은 React lazy 내부 필드(`_init`·`_payload`)를 푼다(ADR 0019).
    2. 실행 prop 이름은 `onClick`(키보드 실행 포함). `Menu` 단위 `onAction(key)`은 두지 않았다.
    3. 「hover subtle-hover」와 「hover는 highlight」를 함께 읽어, React Aria가 위치를 옮기는 hover는 highlight, 키보드 위치가 따로 있을 때 다른 항목 hover는 neutral `subtle-hover`로 했다. 선택 유지는 neutral `subtle-active`(Select용, Menu에는 선택 없음).
    4. 위치 표시는 `data-highlighted`(boolean `data-*`)다. `:focus`는 Combobox 가상 포커스에서 쓸 수 없어 쓰지 않았다.
    5. Menu에 선택(체크·라디오 항목), 하위 메뉴, 링크 항목(`href`), 단축키 표시, 위험 항목 색, `closeOnClick` 옵션이 없다.
    6. 숨은 닫기 버튼(DismissButton)을 두지 않았다(menu 자식 규칙). Tab은 닫고 트리거로 포커스를 돌린다(APG는 다음 요소로 옮기기를 권하지만 바깥이 inert라 트리거로 돌린다).
    7. 비활성 항목은 키보드 위치가 건너뛴다(React Aria 기본. APG는 포커스 가능하게 두는 것도 허용).
    8. 한글 타입어헤드는 되지 않는다(IME 조합 중 keydown이 `Process`). 문서에 적었다.
    9. 기본 `placement` `bottom start`, `offset` 4px, 폭 10~20rem, 항목 `text-body-md`·높이 36px, 묶음 제목 `text-label-sm text-muted`, 구분선 `border-default` 위아래 4px, 아이콘 16px.
  - **다음 티켓 메모**: Select·Combobox는 `list-style.ts`(`listPopupClass`·`listItemClass`·`listHeadingClass`·`listSeparatorClass`)와 `list-collection.ts`(`itemCollectionNode`·`sectionCollectionNode`·`resolveCollectionChildren`·`asCollectionComponent`)를 그대로 쓴다. 고른 옵션은 `data-selected`를 붙이면 subtle-active가 되고 highlight가 겹치면 highlight가 이긴다. 옵션 key(=`value`)는 아직 React key나 자리 번호이므로 28에서 `value`를 key로 쓰는 node를 만든다(`getCollectionNode`가 `key`를 yield하면 그 값을 쓴다). Combobox는 가상 포커스라 `useListBox`·`useOption`의 `isFocused`를 `data-highlighted`로 넘긴다. 목록 루트가 `listbox`면 Popover처럼 바깥 요소와 안쪽 목록을 나눌지(Select는 DismissButton을 둘 수 있다) 28에서 정한다. Tab 처리(window capture)는 Select 목록에도 필요한지 확인한다. 테스트에서 항목 hover 배경을 볼 때는 앞 테스트의 마우스 자리를 바깥으로 옮겨 둔다. 한글 타입어헤드는 keydown 글자로 오지 않는다.
