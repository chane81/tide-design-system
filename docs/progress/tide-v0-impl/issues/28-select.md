# 28: Select

Status: done
Blocked by: 15 (Field와 Input·Textarea), 27 (Menu)

## What to build

앱 개발자가 `Select`로 값 하나를 고르고 `value`/`onValueChange`로 제어한다. Field로 label·설명·오류를 붙이면 자동으로 연결된다. 같은 size의 Input·Button과 높이가 같다. Dialog 안에서 열어도 목록이 위에 보인다.

## 수용 기준

- [x] React Aria hooks로 만든다. `react-aria-components`, Base UI, Radix는 쓰지 않는다. 쓴 hook의 API는 설치 버전 문서로 확인하고 근거 버전을 남긴다.
- [x] `useSelect`로 만든다. Menu의 목록·항목 부분을 재사용한다.
- [x] `value`/`defaultValue`/`onValueChange(value)`, `open`/`defaultOpen`/`onOpenChange(open)`.
- [x] 트리거 포커스 표시는 `focus-field`이고 chevron 아이콘(장식용)을 쓴다. size는 Input과 같은 값과 높이를 쓴다.
- [x] Field와 연결된다(label, 설명, 오류, `aria-invalid`). form 제출에 값이 들어간다.
- [x] 목록은 `z-popover`라서 Dialog(`z-modal`) 위에 보인다.
- [x] `browser`: 이름·값 읽기, 키보드로 열고 고르기, 타입어헤드, 제어/비제어, Field 연결, focus-field 계산값을 단언한다.

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

- 2026-11-11 완료(브랜치 `ticket-28-select`, main b9df6b3 위).
  - **근거 버전**: react-aria 3.53.1, react-stately 3.51.0(이미 components 의존성, 새 의존성 없음, `minimumReleaseAge` 그대로), react 19.3.1, next 16.4.5, tailwindcss 4.3.5, vitest·@vitest/browser-playwright 5.1.0, playwright 1.65.0(Chromium), storybook 10.6.6, typescript 7.0.2.
  - **API 확인**: context7 `/websites/react-aria_adobe`(Select/useSelect: `useSelectState`의 `value`/`defaultValue`/`onChange`·`isOpen`, `useSelect`의 `triggerProps`·`valueProps`·`menuProps`·`hiddenSelectProps`, ListBox/useListBox: `useListBox`·`useOption`·`AriaListBoxOptions`)와 설치본 dist 소스를 읽어 동작을 확인했다: `useSelect`는 `useMenuTrigger({type: "listbox"})`로 마우스 pressStart에 열고(Enter·Space·↓ `first`, ↑ `last`), 닫힌 트리거에 타입어헤드(바로 고름)를 붙이고, `useField`(label 요소 `span`)로 `aria-labelledby`를 「값 요소 id + label」로 만들며 설명·오류 자리 id를 `useSlotId`로 늘 만든다. `menuProps`는 `autoFocus`(focusStrategy 또는 고른 옵션), `shouldSelectOnPressUp`, `shouldFocusOnHover`, `disallowEmptySelection`을 준다. `HiddenSelect`는 300개 이하면 visually hidden + `aria-hidden` 컨테이너 안 `<select tabIndex=-1>`(option value = 컬렉션 key)를 그리고, `validationBehavior: "native"`면 `required`를 붙이며 `useFormValidation`이 invalid 이벤트에서 브라우저 말풍선을 막고(preventDefault) 트리거로 포커스, `useFormReset`이 reset 때 기본값으로 돌린다. `useSelectState`는 `useListState`에 고른 값을 넘기고 단일 선택이면 고를 때 닫는다. `useOption`은 `aria-selected`·`aria-disabled`와 글자·설명 자리 id(`aria-labelledby`·`describedby`)를, `useListBoxSection`은 `presentation` + `group` 구조를 준다. react-stately `CollectionBuilder.getFullNode`가 yield한 node의 `key`를 요소 key보다 먼저 쓰는 것을 확인했다. WAI-ARIA APG Select-Only Combobox(Tab·Esc 닫기, 닫힌 상태 타입어헤드, Home/End)를 따르되 역할은 React Aria 방식(button + listbox)이다. Tailwind class(`group-disabled:`, `ms-auto`, `truncate`, 임의 값)는 smoke 출력 CSS와 browser 계산값으로 확인했다.
  - **export 이름**: `Select`(트리거 `<button>`), `SelectItem`(`<div role="option">`), `SelectSection`(묶음), 타입 `SelectProps`·`SelectItemProps`·`SelectSectionProps`.
  - **구현 결정**:
    - **단일 Component, 루트는 트리거**: 네이티브 `<select>`처럼 `<Select>` 안에 옵션을 바로 둔다. `useSelectState`가 컬렉션을 루트에서 만들어야 트리거에 고른 값을 보이고 숨은 select를 그릴 수 있어서다. `ref`·`className`·나머지 props는 트리거 `<button>`에 간다. `placement`·`offset`은 공개하지 않았다(아래 `bottom start` 4px 고정, 공간이 없으면 뒤집힘).
    - **Field 연결(ADR 0013 덧붙임)**: 트리거 id = `controlId`(label `for`가 버튼을 가리킨다. label 누름은 포커스만 하고 열지 않는 것을 테스트로 확인), `aria-labelledby` = 값 요소 + `labelId`, `aria-describedby` = Field `describedBy`만(React Aria `useField`가 만든 빈 자리 id가 서버 HTML에 남아 덮어썼다), `aria-invalid`·`data-invalid`, 네이티브 `disabled`. 직접 준 `id`·`invalid`·`disabled`·`required`가 Field 값을 이긴다(`useFieldControl`).
    - **폼**: `name`·`form`·`autoComplete`는 React Aria `HiddenSelect`로 간다(버튼에는 `name`이 붙지 않게 button 타입에서 뺐다). `required`는 `validationBehavior: "native"`: 비면 제출을 막고 트리거로 포커스·`aria-invalid`(고르면 풀림). Input의 네이티브 `required`와 같게 제출을 막되 말풍선은 없으므로 메시지는 Field `error`다.
    - **목록 구조**: `listPopupClass` 바깥 요소(위치·표면) 안에 DismissButton 둘과 `role="listbox"`. 폭은 트리거 `offsetWidth`를 `min-width`로(위치 hook 전 layout effect). Tab은 Menu와 같은 window capture 처리가 필요했고 전파까지 멈춰야 했다 → `overlay.tsx` `useCloseOnTab`으로 옮겨 Menu·Select가 같이 쓴다(ADR 0018 덧붙임).
    - **Combobox 재사용용 분리**: `list-collection.ts`에 `valueItemCollectionNode`·`CollectionValueItemProps`(`value`를 key로), 새 `listbox.tsx`에 옵션·묶음 그리기(`ListBoxNodes`, `ListBoxOptionProps`, `ListBoxSectionProps`). `input-style.ts`에 `inputSizeClass`·`InputSize`(Input도 이것을 쓴다). ADR 0019 덧붙임.
    - **옵션 모양**: Menu 항목과 같은 `listItemClass`. 고른 옵션 `data-selected`(neutral `subtle-active`) + 끝의 장식용 `CheckIcon`(고대비 모드에서 배경이 지워져도 보이게, 색만으로 알리지 않게). highlight와 겹치면 highlight가 이긴다.
    - **listbox 구분선**: `role="separator"`가 axe `aria-required-children` 위반이라 `role="presentation"` + `aria-hidden` 장식 요소로 바꿨다(Menu는 그대로).
    - **트리거 모양**: `inputSizeClass` + `inputBaseClass` + `inline-flex justify-between gap-2 text-start`. 값 글자 `truncate`, placeholder `text-muted`, chevron 16px `text-muted`, 비활성이면 둘 다 `text-disabled`(`group-disabled:`). 옵션 안 아이콘은 트리거에서도 16px·글자와 8px.
  - **color 결정(ADR 0016 덧붙임)**: Select는 폼 입력 Component(Input 쪽)라 `color`가 없다. 오류 색은 `invalid`가 정하고 목록은 Menu와 같은 고정 Token이다.
  - **Token과 대비**: `text-default`·`text-muted` × `bg-canvas`(값·placeholder·chevron), `border-strong`·`border-danger`·`outline-focus` × `bg-canvas`, 체크 아이콘(`text-primary × bg-primary-subtle`, `text-default × bg-neutral-subtle-active`) 등록과 `bg-disabled`·`text-disabled`·`border-default` 제외를 components `unit`에 4 tests로 단언했다. 목록 색은 티켓 27 Menu(목록) 단언 그대로다. foundation 대비 쌍은 늘지 않았다.
  - **props 표**(모두 client Component)

    | Component       | 요소                                  | prop                                                                                                                                                                                                                                                                                                                                                                                                |
    | --------------- | ------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
    | `Select`        | `<button type="button">`              | `value?: string \| null`, `defaultValue?`, `onValueChange?(value)`, `open?`, `defaultOpen?`(기본 `false`), `onOpenChange?(open)`, `name?`·`form?`·`autoComplete?`(숨은 select), `placeholder?`(기본 `"선택하세요"`), `size?: "sm" \| "md" \| "lg"`(기본 `md`), `invalid?`·`required?`·`disabled?`(Field 값). button의 `value`·`defaultValue`·`onChange`·`type`·`size`·`children`·`name`·`form` 제외 |
    | `SelectItem`    | `<div role="option">`                 | `value: string`(필수), `disabled?`(기본 `false`), `textValue?`(기본 내용 글자). `role` 제외                                                                                                                                                                                                                                                                                                         |
    | `SelectSection` | `<div role="presentation">` + `group` | `heading?: ReactNode`, `aria-label?`, `className?`(감싸개)                                                                                                                                                                                                                                                                                                                                          |

    상태: 트리거 `data-open`·`data-invalid`·`:disabled`, 목록 `data-open`·`data-placement`, 옵션 `data-highlighted`·`data-selected`·`data-disabled`.

  - **테스트**: components browser에 Select 74 tests(37 × instance 2: 이름(고른 값 + label)·설명·label for·숨은 select(aria-hidden, tabIndex -1), label 누름은 포커스만, placeholder 기본값·muted, aria-label 이름, 누름으로 열기(aria-expanded·controls·data-open, 고른 옵션에 위치, aria-selected·data-selected)·누른 옵션 고르기·포커스 복귀·숨은 select 값, Enter·Space·↓는 고른/첫 옵션·↑는 마지막, ↓↑·비활성 건너뛰기·Home/End·Enter로 고르기·`onOpenChange(false)`, Space로 고르기, 비활성 옵션, Esc·바깥 누름·Tab 닫기, 트리거 다시 누름, DismissButton 위치·닫기, 열린 목록 타입어헤드(비활성 건너뜀), 닫힌 트리거 타입어헤드(열지 않고 고름), value 제어·부모 상태·`null` 비우기, open 제어·defaultOpen, Field 오류(aria-invalid·data-invalid·설명 다음 오류·없는 id 없음·danger 경계), Field disabled(:disabled·열리지 않음·제출 안 됨·cursor), 폼 제출·reset, Field required(제출 막힘·트리거 포커스·aria-invalid·고르면 풀림), 직접 준 id·invalid 우선, size 3개 높이·padding·글자 크기가 Input·Button과 같음·radius 6px, 기본 md·chevron 16px 오른쪽 끝, focus-field 계산값(Tab 포커스, forced-colors 투명 outline), 오류+포커스, forced-colors 경계, portal·dark Theme·z 300·absolute·여백 3px·radius 8px·아래 4px·트리거보다 넓음, 고른 옵션 subtle-active·체크 아이콘·highlight 우선·forced-colors outline, hover 위치, 즉시 등장·퇴장 opacity fast·DOM에서 빠짐, 묶음 group 이름·장식 구분선 2개·묶음 안 옵션 value, Fragment·배열·아이콘 옵션·트리거 아이콘 16px, ref·className, 타입 오류). unit 대비 4 tests. docs storybook Select 7 story(목록 있는 story는 play에서 Tab 후 Enter로 열어 highlight까지 a11y 통과).
  - **smoke**: page(서버 컴포넌트)의 form에 Field(설명·오류·required) + `Select size="sm" name defaultValue` + 옵션·묶음·비활성 옵션. `Select.js`·`listbox.js`에 `"use client"`. 출력 CSS에 `group-disabled:text-disabled`. prerender HTML: 트리거가 `type="button"`·`aria-haspopup="listbox"`·`aria-expanded="false"`·`aria-invalid="true"`, id를 label `for`가 가리키고 `aria-labelledby` 2개(값·label)가 모두 있는 id, `aria-describedby` 2개, 기본값 글자 「바나나」, 숨은 select에 option value와 `selected`·`required`, `role="listbox"` 없음(서버 컴포넌트의 lazy 참조 옵션이 prerender 때 모임). nodenext에 Props 타입 3개와 `xs`·value 없는 옵션·`onSelectionChange` 타입 오류.
  - **로컬 검증**: `pnpm lint`, `pnpm format:check`, `rm -rf packages/*/dist apps/docs/storybook-static` 후 `pnpm turbo run typecheck test build smoke --force` 15/15 통과. foundation 460, icons 18, components 1371(이전 1293), docs 251(이전 244) tests, smoke 「smoke 통과」, publint 「All good!」. `node scripts/check-changesets.ts main` 통과(`@tide-tds/components` patch). 「Unexpected token '}'」는 나지 않았다. 실패했다 고친 것: ① Tab이 닫아도 포커스가 트리거로 돌아오지 않음 → `useCloseOnTab`에서 전파도 멈춤, ② DismissButton은 VisuallyHidden으로 감싸져 바로 옆 형제가 아님 → 문서 순서로 단언, ③ 「자주 씀」 motion은 열린 동안 `transition-property: none`(duration은 남음) → 전환 대상을 단언, ④ smoke prerender에서 `aria-describedby`에 React Aria 빈 자리 id 2개가 남음 → Field 값만 쓰게 고침, ⑤ storybook axe `aria-required-children`(listbox 안 separator) → 장식 요소로.
  - **ADR·티켓 어긋남**: 없음. 공통 API 규칙 「ref는 루트 DOM」은 트리거 버튼(숨은 select와 portal 목록은 형제)이다. 새 ADR은 만들지 않았고 ADR 0013·0016·0018·0019에 덧붙였다.
  - **판단 보류(추천안대로 구현, 사용자 확인 필요)**:
    1. 부분 Component(`SelectTrigger`·`SelectContent`) 없이 단일 `Select`(루트 = 트리거)로 했다. `placement`·`offset`·목록 className은 공개하지 않는다.
    2. 역할은 React Aria 방식(`button` + `aria-haspopup="listbox"`)이다. APG Select-Only Combobox는 `role="combobox"`를 쓴다.
    3. `required`는 네이티브 제약 검사: 비면 제출을 막고 트리거 포커스·`aria-invalid`, 말풍선 없음. 버튼에는 `aria-required`를 쓸 수 없어 보조기술에 필수 여부가 전해지지 않는다(label `*`는 숨김). 앱이 설명에 적도록 문서에 안내했다.
    4. 고른 옵션에 체크 아이콘을 붙였다(spec은 subtle-active만 적음. 고대비 모드·색만으로 알리지 않기 위해).
    5. `placeholder` 기본값 「선택하세요」, `value`는 `string | null`(`null` = 비움), `onValueChange`는 비우기로는 불리지 않는다.
    6. 목록 폭은 트리거보다 좁지 않고(min-width = 트리거 폭) 최소 10rem·최대 20rem(트리거가 더 넓으면 트리거 폭). 위치 `bottom start` 4px 고정.
    7. listbox 안 구분선은 `separator` 역할이 아닌 숨긴 장식 요소다(Menu와 다르다).
    8. `useCloseOnTab`이 Tab 전파를 멈춘다(Menu에도 적용). Tab은 다음 요소가 아니라 트리거로 포커스를 돌린다(바깥 inert).
    9. 한글 타입어헤드 미지원(Menu와 같음), 옵션 300개를 넘으면 React Aria가 숨은 select 대신 hidden input을 쓴다(자동 완성 없음).
  - **다음 티켓 메모**: Combobox(29)는 `listbox.tsx`의 `ListBoxNodes`(옵션·묶음·장식 구분선, `data-highlighted`=`useOption` `isFocused`, `data-selected` + 체크 아이콘)와 `list-collection.ts`의 `valueItemCollectionNode`(value = key), `input-style.ts`의 `inputSizeClass`·`inputBaseClass`를 그대로 쓴다. 가상 포커스는 `useListBox`에 `shouldUseVirtualFocus`(`useComboBox`의 `listBoxProps`가 준다)로 넘기고, 목록을 `usePopoverOverlay({ nonModal: true })`로 띄운다(입력이 바깥이라 inert 금지, ADR 0018 Consequences). `useCloseOnTab`은 입력에 포커스가 남는 Combobox에는 맞지 않을 수 있다(Tab은 입력에서 일어난다). React Aria `useField`가 만드는 설명·오류 빈 자리 id는 `useComboBox`에도 있을 것이므로 `aria-describedby`는 Field 값으로 덮어쓴다. 서버 컴포넌트 옵션은 렌더할 때 모이므로 smoke prerender로 확인할 수 있다. 테스트에서 「자주 씀」 motion 열린 상태는 `transitionProperty === "none"`으로 본다. `DismissButton`은 VisuallyHidden 감싸개 안에 있다.
