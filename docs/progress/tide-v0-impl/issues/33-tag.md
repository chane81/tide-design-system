# 33: Tag

Status: done
Blocked by: 19 (Badge·Card·Separator), 20 (Alert), 21 (Avatar), 22 (Skeleton과 Progress), 23 (Table), 24 (Breadcrumb과 Pagination)

> 단계 경계: 3단계(19~24)가 끝난 뒤 사람이 Version PR을 머지해 0.3.0을 낸 다음에 시작한다(별도 티켓 없음).

## What to build

앱 개발자가 `Tag`로 지울 수 있는 라벨 묶음을 만든다. 키보드 사용자는 화살표로 이동하고 Delete로 지운다. 상호작용이 없는 상태 표시는 Badge를 쓴다.

## 수용 기준

- [x] React Aria hooks로 만든다. `react-aria-components`, Base UI, Radix는 쓰지 않는다. 쓴 hook의 API는 설치 버전 문서로 확인하고 근거 버전을 남긴다.
- [x] `useTagGroup`으로 묶음 탐색과 Delete 제거를 처리한다.
- [x] 닫기는 IconButton(이름 필수, 24×24 이상)이다.
- [x] 작은 표시 요소이므로 radius `sm`.
- [x] 제거 후 포커스가 옆 Tag로 이동한다.
- [x] `browser`: 그룹 역할·이름, 화살표 이동, Delete 제거와 포커스 이동, 닫기 버튼 이름을 단언한다.

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

- 2026-11-11 완료(브랜치 `ticket-33-tag`, main b726dbe 위).
  - **근거 버전**: react-aria 3.53.1, react-stately 3.51.0(이미 components 의존성, 새 의존성 없음, `minimumReleaseAge` 그대로), react 19.3.1, tailwindcss 4.3.5, tailwind-merge 3.7.0, vitest·@vitest/browser-playwright 5.1.0(Chromium), storybook 10.6.6, typescript 7.0.2.
  - **API 확인**: context7 `/websites/react-aria_adobe`(`useTagGroup(props, state: ListState, ref)` → `gridProps`·`labelProps`·`descriptionProps`·`errorMessageProps`, `useTag` → `rowProps`·`gridCellProps`·`removeButtonProps`, `useListState`)는 내용이 얇아 설치본 dist 소스로 확인했다. `useTagGroup`: `ListKeyboardDelegate`(가로, locale 방향) + `useGridList`(`shouldFocusWrap`, `keyboardNavigationBehavior: 'tab'`), 이름은 `useField`, role은 태그가 있으면 `grid` 없으면 `group`, 포커스가 안에 있을 때만 `aria-live="polite"`·`aria-relevant="additions"`, 마지막 태그가 지워지면 묶음에 포커스. `useTag`: Delete·Backspace 단축키(`onRemove`가 있을 때만, 비활성이면 꺼짐)로 `onRemove(Set<key>)`, 키보드 modality일 때 `removeDescription`(ko-KR 「태그를 제거하려면 Delete 키를 누르십시오.」) 설명, `removeButtonProps`는 `aria-label`(ko 「제거」)·`aria-labelledby: "<버튼 id> <행 id>"`·`isDisabled`·`onPress`, 행 tabIndex는 roving. `useListState`의 `useFocusedKeyReset`: focusedKey가 컬렉션에서 사라지면 이전 컬렉션의 다음(없으면 앞) 활성 항목으로 옮긴다. `useGridListItem`: `keyboardNavigationBehavior: 'tab'`이면 행 안 Tab 가능한 자식으로 Tab이 들어간다. Tailwind 4 `bg-(--var)`는 `background-color: var(--var)`(context7 `/tailwindlabs/tailwindcss.com`).
  - **export 이름**: `TagGroup`, `Tag`, 타입 `TagGroupProps`·`TagProps`.
  - **구현 결정**:
    - **서버 컴포넌트로 남길 수 있는가**: 남길 수 없다. 화살표 이동·roving tabIndex·Delete 제거·제거 뒤 포커스가 모두 hook·state다. 상호작용 없는 라벨은 이미 Badge(서버 컴포넌트)가 맡는다(spec·GLOSSARY). 지우지 않는 묶음(`onRemove` 없음)도 grid 탐색은 그대로라 client다. 서버 컴포넌트 page에서 쓰는 것은 ADR 0019 `resolveCollectionChildren`으로 된다(smoke prerender 확인).
    - **ADR 0019 재사용**: `Tag`는 `valueItemCollectionNode`, `TagGroup`이 `resolveCollectionChildren` → `useListState`. `list-collection.ts`는 고치지 않았다. `value` key라 지운 뒤 key가 바뀌지 않아 `useFocusedKeyReset`이 옆 태그를 바르게 고른다.
    - **선택 없음**: GLOSSARY 「눌러서 켜고 끄는 칩과는 다르다」에 따라 `selectionMode`를 열지 않았다. 그래서 같은 key 다시 고르기 거르기(티켓 31 메모)는 필요 없다. 선택이 없어 `onRemove`는 늘 태그 하나이고 공개 모양은 `(value: string) => void`다(React Aria `Set<Key>`를 풀어 부름).
    - **지우기 버튼**: IconButton ghost `xs`(24×24, 이름 필수). 이름은 React Aria 방식대로 `aria-labelledby`(버튼 자신 + 행)로 「`removeLabel` + 태그 글자」(기본 「제거 디자인」). 기본 「제거」는 React Aria ko-KR 문구와 맞췄다. **Tab 순서에서 뺐다**(`tabIndex={-1}`): `keyboardNavigationBehavior: 'tab'`이라 버튼이 tabbable이면 태그마다 Tab 자리가 생겨 grid의 「Tab 자리 하나」가 깨진다(시험으로 확인). 키보드는 Delete·Backspace로 지우고 설명이 그것을 알린다. 누름은 `onRemove`를 직접 부른다(`onPress` 대신 `onClick`, 비활성이면 네이티브 disabled).
    - **지우기 버튼 색**: IconButton은 루트에 자기 `data-color`(Role)를 붙여 accent 슬롯을 바꾸므로 태그 색을 받을 수 없다. 글자는 `text-current`(태그 글자 상속), hover·누름 배경은 태그 루트가 `[--tag-remove-hover:var(--tide-accent-subtle-hover)]`·`[--tag-remove-active:…]`로 계산한 값을 IconButton의 `hover:bg-(--tag-remove-hover)`·`active:bg-(--tag-remove-active)`로 쓴다(custom property는 계산값으로 상속, `cn`이 IconButton의 `hover:bg-accent-subtle-hover`를 대신함). 비활성이면 hover class를 붙이지 않는다. radius는 IconButton 기본 `md` 대신 태그와 같은 `sm`.
    - **스타일**: 묶음 `flex flex-wrap gap-2`. 태그 높이 32px(버튼 24 + 위아래 3px + border 1px), `text-label-md`, 시작 10px·끝 3px(버튼 없으면 10px), radius `sm`, accent subtle 배경 + text 글자, 평소 투명 border, 비활성 `aria-disabled:bg-disabled`·`text-disabled`, `focus-visible:focus-ring`. 글자 앞 장식 아이콘 16px. `variant`·`size` 없음.
    - **forced-colors**: 투명 border가 시스템 색으로 보이고, 지우기 아이콘은 따로 색 class가 없어 버튼 글자(ButtonText)를 따른다(티켓 32 메모의 `forced-colors:text-current`는 필요 없었다. 테스트로 아이콘 색 = 버튼 색 확인).
    - **이름 필수**: `aria-label`·`aria-labelledby` 중 하나를 타입상 필수로 했다(Progress와 같은 방식). 보이는 label prop(`labelProps`)은 열지 않았다.
  - **color 결정(ADR 0017 후속·ADR 0016 덧붙임)**: Tag는 `ColorFamilyName`만(기본 `gray`, 태그마다). 쓰임(고른 필터, 입력한 키워드, 분류 라벨, 받는 사람·권한)이 모두 뜻 없는 구분 색이고, 상태 표시는 GLOSSARY가 Badge로 정했다. 상태를 칠하려면 Badge를 쓴다(문서 Don't). Badge(`Color`)·Avatar(`ColorFamilyName`) 중 Avatar 쪽 판단과 같다.
  - **Token과 대비**: 색 계열 6개의 text × subtle·subtle-hover·subtle-active(light·dark 4.5:1)와 앱 장식 계열 규칙, `outline-focus` × 표면 층 3:1, `bg-disabled`·`text-disabled` 제외를 components `unit`에 4 tests로 단언했다. foundation 대비 쌍은 늘지 않았다.
  - **props 표**(모두 client Component)

    | Component  | 요소                                    | prop                                                                                                                            |
    | ---------- | --------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------- |
    | `TagGroup` | `<div role="grid">`(비면 `group`)       | `aria-label` 또는 `aria-labelledby`(필수), `onRemove?(value: string)`, `removeLabel?`(기본 `"제거"`). `role` 제외               |
    | `Tag`      | `<div role="row">` 안 `role="gridcell"` | `value`(필수), `children`(필수), `color?: ColorFamilyName`(기본 `gray`), `disabled?`, `textValue?`. `role`·`id`·`tabIndex` 제외 |

    상태: `aria-disabled`(태그), `data-color`(태그).

  - **테스트**: components browser에 Tag 42 tests(21 × instance 2): 역할·이름(grid 이름·row·gridcell 수·버튼 이름 「제거 디자인」·`type`·`tabindex=-1`·행 이름, `removeLabel`, `aria-labelledby`, `onRemove` 없으면 버튼 없음), 키보드(Tab 자리 하나·→←순환·비활성 건너뜀·Home/End·Tab으로 묶음을 떠나고 Shift+Tab으로 돌아옴, RTL `ar-EG`에서 ←가 다음), Delete로 지우면 다음 태그 포커스·`onRemove` 1회 값, Backspace로 마지막을 지우면 앞 태그(비활성 건너뜀), 모두 지우면 group 역할 묶음에 포커스, 키보드 진입 시 Delete 안내 설명, 비활성(aria-disabled·버튼 disabled·누름 무시), 버튼 누름 제거와 옆 태그 포커스(비활성 건너뜀), 버튼 24×24·아이콘 16px aria-hidden·끝·위 4px·태그 글자색(forced-colors는 버튼 글자색), hover 배경 = 태그 색 subtle-hover·radius 4px·비활성 hover 없음, 모양(radius 4px·높이 32px·14px·500·여백 10/3px·data-color·색 계열 subtle/text·기본 gray·비활성 색, forced-colors 경계 1px 보임), 버튼 없을 때 끝 여백 10px, 바깥 data-color 안 물려받음, focus-ring(250ms 뒤 2px·2px·색), ref·className, Fragment·배열, 타입 오류(이름 없음·`selectionMode`·value 없음·`isDisabled`·Role color·children 없음). unit 대비 4 tests. docs storybook Tag 7 story(play에서 Tab으로 첫 태그, a11y 통과).
  - **smoke**: page(서버 컴포넌트)에 `TagGroup`(지우기 없음, 기본·`blue`·비활성 태그). `Tag.js`에 `"use client"`. prerender HTML: `aria-label` 있는 `role="grid"` 안에 row 3개, 각 row 안 gridcell, `data-color="gray"`·`"blue"`, 비활성 `aria-disabled="true"`, 버튼 없음. CSS에 `hover:bg-(--tag-remove-hover)`·`--tag-remove-hover`·`aria-disabled:bg-disabled`·`pe-0.75`. nodenext에 Props 타입 2개와 이름 없는 묶음·Role color 타입 오류.
  - **로컬 검증**: `pnpm lint`, `pnpm format:check`, `rm -rf packages/*/dist apps/docs/storybook-static` 후 `pnpm turbo run typecheck test build smoke --force` 15/15 통과(첫 실행). foundation 460, icons 18, components 1671(이전 1625), docs 286(이전 279) tests, smoke 「smoke 통과」, publint 「All good!」. `node scripts/check-changesets.ts main` 통과. 이번 실행에서는 Tooltip·Combobox flaky가 나지 않았다. 「Unexpected token」은 나지 않았다.
  - **ADR·티켓 어긋남**: 없음. 티켓 「닫기는 IconButton」은 지우기 버튼(이름 「제거 …」)으로 구현했다(spec 내부 아이콘 「Tag 닫기」와 같은 X 아이콘). 새 ADR은 만들지 않았고 ADR 0017 후속·0016·0019에 덧붙였다.
  - **판단 보류(추천안대로 구현, 사용자 확인 필요)**:
    1. Tag는 `ColorFamilyName`만 받는다(Role 없음, 기본 `gray`, 태그마다). 묶음 단위 `color`는 없다.
    2. 선택(켜고 끄기, `selectionMode`)은 없다. `onRemove`는 값 하나 `(value: string)`다.
    3. 지우기 버튼은 Tab 순서에서 빠진다(키보드는 Delete·Backspace만). 포인터·스크린 리더 가상 커서로는 누를 수 있다.
    4. 지우기 버튼 기본 이름은 「제거」(React Aria ko-KR과 같음)이고 태그 글자가 뒤에 붙는다. Delete 안내 설명은 React Aria 번역이라 locale을 따른다(기본 locale이 영어면 영어).
    5. `size`·`variant` 없음. 높이 32px 하나(Badge md 24px보다 크다, 24px 버튼을 담기 위해).
    6. 지우기 버튼 radius는 태그와 같은 `sm`(중첩 규칙대로면 0이지만 hover 모양을 위해 sm).
    7. 지우기 버튼 hover·누름 배경은 태그 색 subtle-hover·subtle-active이고, 태그 루트의 내부 custom property(`--tag-remove-hover`·`--tag-remove-active`)로 넘긴다(공개 계약 아님).
    8. 묶음 이름은 `aria-label`·`aria-labelledby` 중 하나가 타입상 필수다. 보이는 `label` prop과 설명·오류 문구(`useTagGroup`의 label·description·errorMessage)는 열지 않았다.
    9. 태그 행 자체에는 hover 모양이 없다(누르는 동작이 없음). 비활성 태그는 `bg-disabled`·`text-disabled`.
    10. 지우지 않는 묶음(`onRemove` 없음)도 grid로 화살표 탐색을 한다(client). 탐색이 필요 없으면 Badge를 쓴다.
  - **다음 티켓 메모**: Toast(34)가 닫기 IconButton을 Alert 색으로 칠할 때는 `color`가 Role이라 그대로 넘기면 된다(Tag처럼 색 계열을 IconButton에 넘길 일이 생기면 이번 custom property 다리를 쓴다). React Aria hook의 `onPress`형 props(`removeButtonProps`)를 Tide IconButton에 넘길 때는 `onClick`으로 바꾸고 `isDisabled`는 `disabled`로 옮긴다. `useGridList` 계열은 행 안 tabbable 자식에 Tab이 들어가므로 행 안 버튼은 `tabIndex={-1}`로 뺀다. 컬렉션 항목을 지우는 Component는 `value` key를 써야 `useListState`가 지운 뒤 포커스를 옆 항목으로 옮긴다. Toast의 `useToast`는 react-aria 3.53.1에 `toast` 폴더로 있다(설치본 dist 확인).
