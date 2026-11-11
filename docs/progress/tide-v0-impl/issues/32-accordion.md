# 32: Accordion

Status: done
Blocked by: 19 (Badge·Card·Separator), 20 (Alert), 21 (Avatar), 22 (Skeleton과 Progress), 23 (Table), 24 (Breadcrumb과 Pagination)

> 단계 경계: 3단계(19~24)가 끝난 뒤 사람이 Version PR을 머지해 0.3.0을 낸 다음에 시작한다(별도 티켓 없음).

## What to build

앱 개발자가 `Accordion`으로 접고 펴는 영역을 만든다. 펼침 상태는 chevron으로 보이고, 높이 애니메이션은 없다.

## 수용 기준

- [x] React Aria hooks로 만든다. `react-aria-components`, Base UI, Radix는 쓰지 않는다. 쓴 hook의 API는 설치 버전 문서로 확인하고 근거 버전을 남긴다.
- [x] 헤더 버튼과 패널이 연결되고 `aria-expanded`를 노출한다.
- [x] chevron 아이콘(장식용)으로 상태를 보인다. 높이 애니메이션은 없다.
- [x] 담는 요소이므로 radius `lg`. 포커스 표시는 `focus-ring`.
- [x] `value`/`defaultValue`/`onValueChange(value)`.
- [x] `browser`: 버튼 역할과 `aria-expanded`, Enter/Space 토글, 패널 연결, 제어/비제어를 단언한다.

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

- 2026-11-11 완료(브랜치 `ticket-32-accordion`, main 84ec960 위).
  - **근거 버전**: react-aria 3.53.1, react-stately 3.51.0(이미 components 의존성, 새 의존성 없음, `minimumReleaseAge` 그대로), react 19.3.1, vitest·@vitest/browser-playwright 5.1.0(Chromium), storybook 10.6.6, typescript 7.0.2.
  - **API 확인**: context7 `/websites/react-aria_adobe`(useDisclosure `(props, state, ref)` → `buttonProps`·`panelProps`, `AriaDisclosureProps` `isDisabled`·`isExpanded`·`defaultExpanded`, `useDisclosureGroupState`)와 설치본 dist 소스(`useDisclosure`: 버튼·패널 id를 `useSSRSafeId`(React 19는 `React.useId`)로 짓고, 패널 props는 `role: "group"`·`aria-labelledby`·`aria-hidden`·SSR 때만 `hidden`, hydration 뒤 layout effect가 `hidden="until-found"`를 붙이고 `beforematch`로 펼침, 키보드는 `onPressStart`·마우스는 `onPress`로 토글 / `useDisclosureGroupState`: `expandedKeys` 제어·`toggleKey`(단일이면 다른 key를 지움)·`allowsMultipleExpanded`가 아닌데 2개 이상이면 첫 key만 남기는 effect / `useDisclosureState`: `useControlledState`라 값이 같으면 onChange를 부르지 않음 / `useButton`: `elementType` 기본 button이면 `type`·네이티브 `disabled`, `aria-expanded`·`aria-controls`·id를 넘김). 접근성 패턴은 WAI-ARIA APG Accordion 현재판(제목 요소 안에 버튼만, `aria-expanded`·`aria-controls`, region은 선택이고 함께 펼칠 패널이 약 6개를 넘으면 피함, 키보드는 Enter·Space·Tab만)을 확인했다.
  - **export 이름**: `Accordion`, `AccordionItem`, `AccordionTrigger`, `AccordionPanel`, 타입 `AccordionProps`·`AccordionItemProps`·`AccordionTriggerProps`·`AccordionPanelProps`·`AccordionHeadingLevel`.
  - **구현 결정**:
    - **React Aria vs `<details>`(ADR 0004 덧붙임)**: summary는 APG의 「제목 요소 안 버튼」 구조가 아니고, 제어 `value`를 막을 수 없으며(`toggle`은 바뀐 뒤 옴), 단일 펼침은 `name`에 묶인다. 높이 애니메이션은 어차피 넣지 않으므로 `::details-content`의 이점이 없다. 서버 렌더는 둘 다 되고 JS 없이 열고 닫는 것만 details가 낫다(Tide 위젯은 모두 client라 같은 조건). 페이지 찾기는 React Aria가 `hidden="until-found"`로 같게 해 준다. 그래서 `useDisclosure`를 쓴다.
    - **상태는 루트, 연결은 항목**: 루트가 `useDisclosureGroupState`로 펼친 key 목록을 갖고(`value`→`expandedKeys`, `multiple`→`allowsMultipleExpanded`), 항목이 `useDisclosureState`를 그룹 값으로 늘 제어해(`isExpanded = has(value)`, 바꾸려 하면 `toggleKey`) `useDisclosure`를 부른다. 버튼·패널 props와 패널 ref를 context로 트리거·패널에 넘긴다. id는 useDisclosure가 React `useId`로 지어 서버 prerender와 hydration이 같다(Tabs처럼 루트 id를 덮어쓸 필요가 없었다. smoke에서 연결 확인).
    - **onValueChange 거르기 불필요**: 누름은 늘 펼침 ↔ 접힘으로 값을 바꾸고, `useControlledState`는 같은 값이면 부르지 않는다. 티켓 31의 「같은 key 다시 고르기」 문제가 생기지 않는다(테스트로 호출 횟수 확인).
    - **값은 늘 `string[]`**: 단일·여러 펼침 모두 목록이다(React Aria `Set`, Base UI 배열과 같다). `type="single" | "multiple"` 분기 없음.
    - **트리거**: `level`(기본 3)의 `<hN class="flex">` 안 `<button type="button">`(제목 요소 안에는 버튼만). `ref`·`className`·나머지 props는 버튼에 간다(Combobox의 「루트는 주 요소」와 같은 판단). 앱 `onClick`은 `mergeProps`로 함께 불린다. `type`·`id`·`disabled`·`aria-expanded`·`aria-controls`는 props에서 뺐다.
    - **패널**: 늘 렌더한다(접어도 안의 입력 상태가 남음). 기본 `role="region"`(APG 예시, React Aria 기본 `group`을 덮어씀), `role="group"`으로 바꿀 수 있다. hydration 뒤 접힌 패널은 `hidden="until-found"`라 display: none이 아니라 content-visibility: hidden이고 상자가 남으므로 `[&[hidden]]:p-0`으로 여백을 없앤다(높이 0 확인).
    - **스타일**: 루트 `rounded-lg border border-default text-default`(배경 없음), 항목 사이 `not-first:border-t border-default`. 트리거 `text-label-lg`·`px-4 py-3`·gap 12px·radius `md`·`cursor-pointer`, hover는 반복 항목이라 전환 없이 neutral `subtle-hover`(비활성 제외), 비활성 `text-disabled` + `cursor-not-allowed`, `focus-visible:focus-ring`. 패널 `px-4 pb-4 text-body-md`.
    - **chevron과 motion**: 끝의 `ChevronDownIcon` 16px `text-muted`(hover `text-default`, 비활성 `text-disabled`). 펼치면 `group-aria-expanded:rotate-180`, 회전은 움직임이라 `motion-safe:transition-[rotate]`(`fast` 150ms, out)이고 움직임 줄이기에서는 바로 돈다(Switch thumb 이동과 같은 규칙, 회전을 opacity로 바꿀 대상이 없다). 패널 높이 애니메이션은 없다(motion 결정 「넣지 않는 것」).
    - **forced-colors**: 브라우저가 svg의 `color`를 시스템 색으로 덮지 않아 chevron이 회색 값으로 남았다(첫 실행에서 발견). `forced-colors:text-current`로 버튼 글자색(ButtonText, 비활성 GrayText)을 따르게 했다.
  - **color 결정(ADR 0016 덧붙임)**: Accordion은 내용을 펼치고 접는 구조 Component(Tabs·Breadcrumb·Pagination과 같은 판단)라 `color`가 없다.
  - **Token과 대비**: `text-default`·`text-muted` × 표면 층 3개(4.5:1), `text-default` × `bg-neutral-subtle-hover`(hover, chevron도 hover 때 text-default로 바꿔 맞춤), `outline-focus` × 표면 층(3:1) 등록과 `border-default`·`text-disabled` 제외를 components `unit`에 4 tests로 단언했다. foundation 대비 쌍은 늘지 않았다(`text-muted` × `bg-neutral-subtle-hover` 쌍이 없어 hover chevron을 text-default로 둠).
  - **props 표**(모두 client Component)

    | Component          | 요소                                          | prop                                                                                                                   |
    | ------------------ | --------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------- |
    | `Accordion`        | `<div>`                                       | `value?: string[]`, `defaultValue?: string[]`(기본 `[]`), `onValueChange?(value: string[])`, `multiple?`(기본 `false`) |
    | `AccordionItem`    | `<div data-open data-disabled>`               | `value`(필수), `disabled?`                                                                                             |
    | `AccordionTrigger` | `<hN>` 안 `<button type="button">`(ref·props) | `level?: 1~6`(기본 `3`). `type`·`id`·`disabled`·`aria-expanded`·`aria-controls` 제외                                   |
    | `AccordionPanel`   | `<div role="region">`                         | `role?: "region" \| "group"`(기본 `region`). `id`·`hidden`·`aria-labelledby` 제외                                      |

    상태: `data-open`(항목·트리거·패널), `data-disabled`(항목), `aria-expanded`·`:disabled`(트리거).

  - **테스트**: components browser에 Accordion 40 tests(20 × instance 2): 역할·연결(h3 안 버튼만·`aria-expanded`·`type`·`aria-controls`↔패널 id·`aria-labelledby`·region 이름, 접힌 패널 숨김·높이 0), hydration 뒤 `hidden="until-found"`·`beforematch`로 펼침, `level`·`role="group"`, 누름 토글(단일: 다른 항목 접힘·다시 누르면 접힘, `data-open` 3곳), `multiple`, 키보드(Tab 순서·Enter·Space 토글·펼친 패널 안 입력은 Tab 순서·비활성 건너뜀), 비활성(native disabled·`data-disabled`·cursor·누름 무시, 펼친 채 비활성), 접어도 입력 값 유지, 제어(onValueChange만, `["refund"]`·`[]`)·상태 부모(multiple 펼친 순서)·비제어 defaultValue·단일인데 값 2개면 첫 값만, focus-ring(250ms 뒤 색, radius 6px, 마우스 누름은 없음), 모양(루트 radius 8px·1px, 항목 사이 선, 트리거 16px·500·12/16px·폭, 패널 여백·접힌 패널 여백 0), chevron(aria-hidden·16px·gap 12px·끝 16px, muted/default/disabled 색, hover 배경 즉시·전환 0s, 비활성 hover 없음, forced-colors에서 버튼 글자색), chevron motion(0.15s `rotate`·패널 전환 없음 / reduced-motion은 전환 없이 180deg), ref·className·onClick 병합·context 밖 오류·타입 오류. unit 대비 4 tests. docs storybook Accordion 6 story(play에서 Tab으로 첫 트리거, a11y 통과).
  - **smoke**: page(서버 컴포넌트)에 Accordion(`defaultValue={["shipping"]}`, 비활성 항목 포함). `Accordion.js`에 `"use client"`. prerender HTML: `<h3>` 안 `type="button"` 트리거, 펼친 트리거 `aria-expanded="true"`·`data-open`, 접힌 트리거 `aria-expanded="false"`, 비활성 `disabled`, 펼친 패널 `hidden` 없음·접힌 패널 `hidden`, 두 항목 모두 `aria-controls` = 패널 id, 펼친 패널 `aria-labelledby` = 트리거 id. CSS에 `group-aria-expanded:rotate-180`·`motion-safe:transition-[rotate]`·`[&[hidden]]:p-0`·`forced-colors:text-current`. nodenext에 Props 타입 5개와 문자열 값·`allowsMultipleExpanded`·패널 `role="dialog"` 타입 오류.
  - **로컬 검증**: `pnpm lint`, `pnpm format:check`, `rm -rf packages/*/dist apps/docs/storybook-static` 후 `pnpm turbo run typecheck test build smoke --force` 15/15 통과(세 번째 실행). foundation 460, icons 18, components 1625(이전 1580), docs 279(이전 273) tests, smoke 「smoke 통과」, publint 「All good!」. `node scripts/check-changesets.ts main` 통과. 첫 두 실행은 각각 알려진 flaky 1건(Combobox forced-colors 「opacity만 fast로 사라진 뒤 DOM에서 빠진다」, Tooltip chromium 「마우스를 올리면 열리고 … 떠나면 닫힌다」)으로 실패했고 Accordion 테스트는 매번 통과했다(다른 worktree에서 flaky 수정 중). 처음 실행에서 고친 것: ① forced-colors에서 svg `color`가 덮이지 않음 → `forced-colors:text-current`, ② `text-muted` × `bg-neutral-subtle-hover` 대비 쌍 없음 → hover chevron을 `text-default`로. 「Unexpected token」은 나지 않았다.
  - **ADR·티켓 어긋남**: 없음. 새 ADR은 만들지 않았고 ADR 0004(details 비교)·0016(color 없음)에 덧붙였다. 티켓 「높이 애니메이션 없음」과 motion 결정 「넣지 않는 것」이 같은 뜻이고, chevron 회전만 motion으로 두었다.
  - **판단 보류(추천안대로 구현, 사용자 확인 필요)**:
    1. 값은 단일 펼침에서도 늘 `string[]`이다(`type="single"` 분기·`string | null` 없음).
    2. 단일 펼침에서도 펼친 항목을 다시 누르면 접힌다(늘 모두 접기 가능). 한 항목을 늘 펼쳐 두는 옵션(APG의 `aria-disabled`)은 없다.
    3. 패널 기본 역할은 `region`(React Aria 기본 `group`과 다름)이고 앱이 `role="group"`으로 바꾼다. 개수로 자동 전환하지 않는다.
    4. 화살표·Home/End로 트리거 사이를 옮기지 않는다(APG 현재판은 Enter·Space·Tab만, React Aria도 없음).
    5. 트리거의 `ref`·`className`·props는 버튼에 가고 제목 요소(`flex` 고정)에는 닿지 않는다. 제목 단계 기본은 `3`.
    6. 루트 배경 없음(Card는 `bg-surface`), 루트 `disabled`·`size`·`variant` 없음.
    7. 트리거 hover는 neutral `subtle-hover` 배경(radius `md`, 전환 없음)이고 그때 chevron은 `text-default`다.
    8. chevron 회전은 움직임 줄이기에서 opacity 대체 없이 바로 바뀐다(Switch thumb와 같은 규칙).
    9. 패널은 늘 렌더한다(Tabs는 고른 패널만). `hidden="until-found"` 페이지 찾기 펼침은 지원 브라우저(Chromium 계열)에서만이고 그 밖에서는 숨김만이다.
    10. `multiple`이 아닌데 값이 둘 이상이면 첫 값만 남기며 `onValueChange`를 부른다(React Stately 동작).
  - **다음 티켓 메모**: Tag(33)는 `useTagGroup`·`useListState` 계열이라 ADR 0019 컬렉션(`valueItemCollectionNode`)을 재사용할 것이다. 선택이 있으면 티켓 31 메모대로 같은 key 재선택을 거른다. forced-colors에서 브라우저는 svg `color`를 시스템 색으로 덮지 않으므로, 버튼 안 아이콘이 따로 색 class를 가지면 `forced-colors:text-current`가 필요하다(Tag 닫기 아이콘). 두 group variant를 겹친 `group-hover:group-enabled:`는 Tailwind 4에서 같은 `.group` 요소의 두 상태로 동작했다. `hidden="until-found"` 요소는 상자가 남으므로 여백·경계는 `[&[hidden]]:`로 지운다. 이번 전체 실행에서 Combobox·Tooltip flaky가 한 번씩 나왔다(재실행 통과).
