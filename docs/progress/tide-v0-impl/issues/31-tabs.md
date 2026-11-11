# 31: Tabs

Status: done
Blocked by: 19 (Badge·Card·Separator), 20 (Alert), 21 (Avatar), 22 (Skeleton과 Progress), 23 (Table), 24 (Breadcrumb과 Pagination)

> 단계 경계: 3단계(19~24)가 끝난 뒤 사람이 Version PR을 머지해 0.3.0을 낸 다음에 시작한다(별도 티켓 없음).

## What to build

앱 개발자가 `Tabs`로 같은 영역의 여러 패널을 바꾼다. 키보드 사용자는 화살표로 탭을 옮기고 ring 포커스를 본다.

## 수용 기준

- [x] React Aria hooks로 만든다. `react-aria-components`, Base UI, Radix는 쓰지 않는다. 쓴 hook의 API는 설치 버전 문서로 확인하고 근거 버전을 남긴다.
- [x] 화살표·Home/End로 탭을 이동하고 탭과 패널이 연결된다.
- [x] 포커스 표시는 `focus-ring`이다. 선택 상태는 `data-selected`로 노출하고 색만이 아닌 표시로도 구분된다.
- [x] `value`/`defaultValue`/`onValueChange(value)`.
- [x] 부분 Component를 평평한 이름으로 export한다.
- [x] `browser`: tablist/tab/tabpanel 역할, 키보드 탐색, 제어/비제어, ring 계산값, forced-colors에서 선택 탭 구분을 단언한다.

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

- 2026-11-11 완료(브랜치 `ticket-31-tabs`, main 8f2d61a 위).
  - **근거 버전**: react-aria 3.53.1, react-stately 3.51.0(이미 components 의존성, 새 의존성 없음, `minimumReleaseAge` 그대로), react 19.3.1, vitest·@vitest/browser-playwright 5.1.0(Chromium), storybook 10.6.6, typescript 7.0.2.
  - **API 확인**: context7 `/websites/react-aria_adobe`(useTabList `keyboardActivation` 기본 `automatic`·`orientation` 기본 `horizontal`, useTabListState `selectedKey`/`defaultSelectedKey`/`onSelectionChange`, useTabPanel은 같은 `TabListState`를 받는다)와 설치본 dist 소스(`useTabList`: 탭 id 앞부분을 `useId()`로 만들어 상태 객체 WeakMap(`tabsIds`)에 묶고 `props.id`는 쓰지 않음, `TabsKeyboardDelegate`: ←→는 locale 방향(RTL이면 반대)을 따르고 가로에서는 ↑↓가 `null`, `getKeyForSearch` 없음(타입어헤드 없음) / `useTab`: `aria-controls`는 고른 탭만, 비활성 탭 `tabIndex` undefined, `useFocusable(item.props)`로 앱 onFocus·onKeyDown 등을 붙임 / `useTabListState`: `selectedKey == null`이면 첫 활성 탭을 고르는 effect / `useSingleSelectListState`: 같은 key를 다시 골라도 `onSelectionChange`를 부름). 접근성 패턴은 WAI-ARIA APG Tabs 패턴(자동·수동 활성화, 화살표 순환·Home/End, 세로 ↓↑, 가로는 ↑↓를 듣지 않음, 패널 `tabindex="0"`)을 확인했다.
  - **export 이름**: `Tabs`, `TabList`, `Tab`, `TabPanel`, 타입 `TabsProps`·`TabListProps`·`TabProps`·`TabPanelProps`·`TabsOrientation`·`TabsActivationMode`.
  - **구현 결정**:
    - **탭 모으기(ADR 0019 재사용)**: `Tab`은 렌더하지 않는 표시 요소이고 `valueItemCollectionNode`로 `value`를 key로 둔다. `TabList`가 `resolveCollectionChildren`(Fragment·배열·서버 컴포넌트 lazy 참조)으로 모아 `useTabListState`·`useTabList`에 넘기고 node마다 `useTab`으로 `<button>`을 그린다. `list-collection.ts`는 고치지 않았다.
    - **상태는 루트, 컬렉션은 TabList**: 루트 `Tabs`가 고른 값(제어/비제어)을 갖고 `TabList`가 그 값을 `selectedKey`로 늘 제어해 넘긴다. 값과 같은 탭이 없으면 `null`을 넘겨 React Stately가 첫 활성 탭을 고르게 하고 `onValueChange`로 알린다. 같은 값을 다시 고르면 루트가 걸러 `onValueChange`를 부르지 않는다.
    - **id 연결**: 패널은 `TabList` 밖이라 `useTabPanel`에 같은 상태 객체를 줄 수 없다. 루트가 `useId`로 앞부분을 짓고 탭 id·`aria-controls`(고른 탭만)·패널 id·`aria-labelledby`를 덮어쓴다(공백은 뺀다, React Aria 규칙과 같다). 키보드 이동은 `data-key`로 찾으므로 영향이 없다. 이 방식이라 서버 prerender에서도 탭과 패널이 처음부터 이어진다.
    - **`value`나 `defaultValue` 하나는 타입상 필수**: 루트가 패널을 고르려면 값이 있어야 한다. 둘 다 없으면 첫 탭이 hydration 뒤에야 골라져 서버 렌더에서 패널이 빈다.
    - **탭 요소는 `<button type="button">`**: 비활성은 네이티브 `disabled`(spec 공통 규칙). `useTab`이 `useFocusable`로 이미 붙이는 `onFocus`·`onBlur`·`onKeyDown`·`onKeyUp`·`autoFocus`는 다시 병합하지 않는다(두 번 불림).
    - **패널**: 고른 탭의 패널만 렌더한다(React Aria TabPanel과 같음). `tabIndex` 기본 `0`(APG 예시와 같다), 첫 내용이 조작 요소면 앱이 `tabIndex={-1}`로 뺀다.
    - **스타일**: 루트 `flex-col gap-4`(세로 `flex-row gap-6`), 탭 목록 `gap-1` + 장식용 `border-default` 1px(가로 아래, 세로 끝쪽). 탭 `text-label-md`·`px-3 py-2`(36px)·radius `md`·아이콘 16px, 글자 `text-muted` → hover `text-default` → 고른 탭 `text-primary`(transition 없음), 비활성 `text-disabled` + `cursor-not-allowed`, `focus-visible:focus-ring`. 패널 `min-w-0 flex-1`·radius `md`·`focus-visible:focus-ring`.
    - **고른 표시 막대와 motion**: `::after`의 2px `border-primary`(가로 `-bottom-px`, 세로 `-end-px`로 탭 목록 선에 겹침). 고르지 않은 탭은 opacity 0. 전환은 opacity `fast`(150ms, out)이고 `motion-safe`면 `scale-x`(세로 `scale-y`) 0 → 1을 더한다. 움직임 줄이기에서는 scale과 그 전환이 빠져 opacity만이다(spec motion 규칙). 탭 사이를 미끄러지는 막대(측정 JS)는 쓰지 않았다(CSS만, SSR 그대로).
    - **forced-colors**: 막대 경계는 브라우저가 CanvasText로 덮으므로 `forced-color-adjust: none` + `Highlight`로 고정했다. 고르지 않은 탭은 막대가 없어 색 없이도 모양으로 구분된다.
    - **RTL**: React Aria `useLocale` 방향을 따른다. `dir="rtl"`만으로는 화살표가 바뀌지 않고 `I18nProvider` locale이 필요하다(문서 「앱이 할 일」).
  - **color 결정(ADR 0016 덧붙임)**: Tabs는 탐색 구조 Component(티켓 24 Breadcrumb·Pagination과 같은 판단)라 `color`가 없다. 고른 탭은 `text-primary` + `border-primary` 고정이다.
  - **Token과 대비**: `text-muted`·`text-default`·`text-primary` × 표면 층 3개(4.5:1), `border-primary`·`outline-focus` × 표면 층(3:1) 등록과 `border-default`·`text-disabled` 제외를 components `unit`에 3 tests로 단언했다. foundation 대비 쌍은 늘지 않았다.
  - **props 표**(모두 client Component)

    | Component  | 요소                                | prop                                                                                                                                                                                            |
    | ---------- | ----------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
    | `Tabs`     | `<div data-orientation>`            | `value?`·`defaultValue?`(둘 중 하나 필수), `onValueChange?(value)`, `orientation?: "horizontal" \| "vertical"`(기본 `horizontal`), `activationMode?: "automatic" \| "manual"`(기본 `automatic`) |
    | `TabList`  | `<div role="tablist">`              | `aria-label`·`aria-labelledby`. `role` 제외                                                                                                                                                     |
    | `Tab`      | `<button type="button" role="tab">` | `value`(필수), `disabled?`. `role`·`type`·`id`·`textValue` 제외                                                                                                                                 |
    | `TabPanel` | `<div role="tabpanel">`             | `value`(필수), `tabIndex?`(기본 `0`). `role`·`id` 제외                                                                                                                                          |

    상태: `data-orientation`(루트), `data-selected`(고른 탭), `:disabled`(비활성 탭).

  - **테스트**: components browser에 Tabs 50 tests(25 × instance 2): 역할·연결(tablist 이름·`aria-orientation`·`aria-selected`·`aria-controls`↔패널 id·`aria-labelledby`, 고른 패널만, 공백 있는 값), 키보드(Tab으로 고른 탭·다음 Tab은 패널, →← 순환·비활성 건너뜀·자동 활성화, Home/End, 가로 ↑↓ 무시, manual의 Enter·Space, 세로 ↓↑, RTL locale ←), 누름(이미 고른 탭은 onValueChange 없음)·비활성(native disabled·aria-disabled·cursor), 제어(onValueChange만)·상태 부모·없는 값의 첫 활성 탭 대체, focus-ring(250ms 뒤 색, 탭 radius 6px, 마우스 누름은 ring 없음)·패널 ring, 고른 표시(opacity·2px·-1px·폭·글자색·hover 즉시)·세로 막대 끝쪽·forced-colors Highlight 막대, 막대 motion(0.15s, opacity·scale / reduced-motion은 opacity만), lazy·Fragment·배열 모으기, 아이콘 16px·8px, ref·className·Tabs 밖 오류·타입 오류. unit 대비 3 tests. docs storybook Tabs 7 story(play에서 Tab으로 고른 탭에 포커스, a11y 통과).
  - **smoke**: page(서버 컴포넌트)에 Tabs(`defaultValue="activity"`, 비활성 탭 포함). `Tabs.js`에 `"use client"`. prerender HTML: `tablist`·이름, 고른 탭 `aria-selected="true"`·`data-selected`·`type="button"`, 고르지 않은 탭 `aria-controls` 없음, 비활성 탭 `disabled`, 고른 탭 `aria-controls` = 패널 id·패널 `aria-labelledby` = 탭 id, tabpanel 1개. CSS에 `motion-safe:data-selected:after:scale-x-100`·`data-selected:after:opacity-100`·`forced-colors:after:border-[Highlight]`·`after:border-primary`. nodenext에 Props 타입 6개와 값 없는 Tabs·`keyboardActivation`·탭 `role` 타입 오류.
  - **로컬 검증**: `pnpm lint`, `pnpm format:check`, `rm -rf packages/*/dist apps/docs/storybook-static` 후 `pnpm turbo run typecheck test build smoke --force` 15/15 통과. foundation 460, icons 18, components 1580(이전 1525), docs 273(이전 266) tests, smoke 「smoke 통과」, publint 「All good!」. `node scripts/check-changesets.ts main` 통과. 처음 실행에서 고친 것: ① React Stately가 같은 탭을 다시 골라도 `onSelectionChange`를 부름 → 루트에서 거름, ② 탭 목록에 타입어헤드가 없음(`getKeyForSearch` 없음) → 테스트를 빼고 `Tab`에서 `textValue` 제외, ③ vitest `toHaveTextContent`는 문자열 전체 일치 → 패널 이름으로 단언, ④ 막대 폭 소수점 → `toBeCloseTo`. 「Unexpected token」은 나지 않았다.
  - **ADR·티켓 어긋남**: 없음. 새 ADR은 만들지 않았고 ADR 0016·0019에 덧붙였다.
  - **판단 보류(추천안대로 구현, 사용자 확인 필요)**:
    1. 부분 이름은 ARIA 역할을 따른 `TabList`·`Tab`·`TabPanel`이다(다른 Component의 `XxxTrigger`/`XxxContent` 방식이면 `TabsList`·`TabsTrigger`·`TabsContent`).
    2. `value`나 `defaultValue` 하나가 타입상 필수다(React Aria는 없으면 첫 탭).
    3. 고른 탭의 패널만 렌더한다. 고르지 않은 패널의 상태(입력 중인 값)는 사라진다. 계속 두는 prop(`forceMount` 등)은 없다.
    4. 패널 `tabIndex`는 늘 기본 `0`이다(React Aria는 안에 조작 요소가 있으면 뺀다). 앱이 `tabIndex={-1}`로 뺀다.
    5. 막대는 탭마다 그리고 가운데에서 펼쳐진다(탭 사이를 미끄러지는 막대 없음).
    6. RTL 화살표 반전은 `I18nProvider` locale을 따른다(`dir="rtl"`만으로는 바뀌지 않음).
    7. `size`·`variant`(밑줄형만, 알약형 없음)·루트 `disabled`·탭 목록 넘침 스크롤이 없다.
    8. 세로 탭에서도 ←→가 동작한다(React Aria `TabsKeyboardDelegate`, APG는 세로에서 ↓↑만 적음).
    9. 탭 글자색은 전환 없이 바로 바뀐다(반복 항목 규칙으로 봄). 막대만 opacity `fast` 전환이다.
  - **다음 티켓 메모**: Accordion(32)은 컬렉션이 필요 없을 것이다(APG Accordion은 헤더 버튼 + 영역, React Aria `useDisclosure`). 여러 부분 사이 id는 Tabs처럼 루트 `useId`로 짓고 context로 잇으면 서버 prerender에서도 처음부터 이어진다. 펼침·접힘 motion은 높이 전환이 필요하면 `interpolate-size`/`calc-size` 지원 범위를 확인하고, 안 되면 opacity만으로 두는 판단을 남긴다. React Stately 단일 선택 상태는 같은 key를 다시 골라도 `onSelectionChange`를 부르니 Tag(33) 선택에서도 거른다. `::after` 막대의 계산값은 `getComputedStyle(el, "::after")`로, 전환 중인지는 `el.getAnimations({ subtree: true })`로 본다. vitest `toHaveTextContent`(문자열)는 전체 일치다. 다른 세션과 겹쳐 browser 실행이 멈추는 일은 이번에 없었다.
